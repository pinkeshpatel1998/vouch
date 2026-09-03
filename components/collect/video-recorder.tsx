"use client";

import * as React from "react";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/button";

export const MAX_SECONDS = 90;

/**
 * In-browser capture with MediaRecorder. No library, no transcoding.
 *
 * Format note from section 8: Chrome and Firefox hand back webm, Safari hands
 * back mp4. We store whatever the browser gives us and serve it back as-is, so
 * the only job here is to pick the first container the browser admits to
 * supporting and record into it.
 */
function pickMimeType(): string | undefined {
  if (typeof MediaRecorder === "undefined") return undefined;
  const candidates = [
    "video/webm;codecs=vp9,opus",
    "video/webm;codecs=vp8,opus",
    "video/webm",
    "video/mp4;codecs=h264,aac",
    "video/mp4",
  ];
  return candidates.find((t) => MediaRecorder.isTypeSupported(t));
}

type Phase = "idle" | "requesting" | "ready" | "countdown" | "recording" | "review";

export function VideoRecorder({
  onDone,
  onCancel,
}: {
  onDone: (result: { blob: Blob; durationSeconds: number; posterDataUrl: string | null }) => void;
  onCancel: () => void;
}) {
  const [phase, setPhase] = React.useState<Phase>("idle");
  const [error, setError] = React.useState<string | null>(null);
  const [seconds, setSeconds] = React.useState(0);
  const [countdown, setCountdown] = React.useState(3);
  const [recorded, setRecorded] = React.useState<{ blob: Blob; url: string; seconds: number } | null>(
    null,
  );

  const liveRef = React.useRef<HTMLVideoElement>(null);
  const reviewRef = React.useRef<HTMLVideoElement>(null);
  const streamRef = React.useRef<MediaStream | null>(null);
  const recorderRef = React.useRef<MediaRecorder | null>(null);
  const chunksRef = React.useRef<BlobPart[]>([]);
  const tickRef = React.useRef<ReturnType<typeof setInterval> | null>(null);

  const stopStream = React.useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }, []);

  React.useEffect(() => {
    return () => {
      if (tickRef.current) clearInterval(tickRef.current);
      stopStream();
      if (recorded) URL.revokeObjectURL(recorded.url);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function requestCamera() {
    setError(null);
    setPhase("requesting");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: true,
      });
      streamRef.current = stream;
      if (liveRef.current) {
        liveRef.current.srcObject = stream;
        await liveRef.current.play().catch(() => {});
      }
      setPhase("ready");
    } catch (e) {
      setPhase("idle");
      const name = e instanceof DOMException ? e.name : "";
      setError(
        name === "NotAllowedError"
          ? "Camera access was blocked. Allow it in your browser's address bar, then try again."
          : name === "NotFoundError"
            ? "No camera was found on this device."
            : "Could not start the camera. If another app is using it, close that first.",
      );
    }
  }

  function beginCountdown() {
    setCountdown(3);
    setPhase("countdown");
    let n = 3;
    const id = setInterval(() => {
      n -= 1;
      setCountdown(n);
      if (n === 0) {
        clearInterval(id);
        startRecording();
      }
    }, 800);
  }

  function startRecording() {
    const stream = streamRef.current;
    if (!stream) return;

    chunksRef.current = [];
    const mimeType = pickMimeType();
    const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
    recorderRef.current = recorder;

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };

    recorder.onstop = async () => {
      if (tickRef.current) clearInterval(tickRef.current);
      const blob = new Blob(chunksRef.current, { type: recorder.mimeType || "video/webm" });
      const url = URL.createObjectURL(blob);
      // Read the counter off the ref rather than state; the closure is stale.
      setSeconds((s) => {
        setRecorded({ blob, url, seconds: Math.max(1, s) });
        return s;
      });
      stopStream();
      setPhase("review");
    };

    setSeconds(0);
    recorder.start(250);
    setPhase("recording");

    tickRef.current = setInterval(() => {
      setSeconds((s) => {
        const next = s + 1;
        if (next >= MAX_SECONDS) stopRecording();
        return next;
      });
    }, 1000);
  }

  function stopRecording() {
    if (tickRef.current) clearInterval(tickRef.current);
    const rec = recorderRef.current;
    if (rec && rec.state !== "inactive") rec.stop();
  }

  async function retake() {
    if (recorded) URL.revokeObjectURL(recorded.url);
    setRecorded(null);
    setSeconds(0);
    await requestCamera();
  }

  /* Grab a frame for the poster. Best effort -- a wall card falls back to a
     gradient if this fails, which it will on some mobile browsers. */
  async function posterFrame(): Promise<string | null> {
    const video = reviewRef.current;
    if (!video || !video.videoWidth) return null;
    try {
      const canvas = document.createElement("canvas");
      const scale = Math.min(1, 640 / video.videoWidth);
      canvas.width = Math.round(video.videoWidth * scale);
      canvas.height = Math.round(video.videoHeight * scale);
      const ctx = canvas.getContext("2d");
      if (!ctx) return null;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      return canvas.toDataURL("image/jpeg", 0.72);
    } catch {
      return null;
    }
  }

  async function use() {
    if (!recorded) return;
    onDone({
      blob: recorded.blob,
      durationSeconds: recorded.seconds,
      posterDataUrl: await posterFrame(),
    });
  }

  const remaining = MAX_SECONDS - seconds;
  const pct = (seconds / MAX_SECONDS) * 100;

  return (
    <div className="space-y-4">
      <div className="relative overflow-hidden rounded-xl border border-line bg-black">
        {/* Live preview. Mirrored, because an unmirrored self-view is unnerving. */}
        <video
          ref={liveRef}
          muted
          playsInline
          className={cn(
            "aspect-[3/4] w-full scale-x-[-1] object-cover sm:aspect-video",
            phase === "review" || phase === "idle" ? "hidden" : "block",
          )}
        />

        {phase === "review" && recorded && (
          // eslint-disable-next-line jsx-a11y/media-has-caption
          <video
            ref={reviewRef}
            src={recorded.url}
            controls
            playsInline
            className="aspect-[3/4] w-full object-contain sm:aspect-video"
          />
        )}

        {phase === "idle" && (
          <div className="grid aspect-[3/4] w-full place-items-center px-6 text-center sm:aspect-video">
            <div>
              <div className="mx-auto mb-4 grid size-14 place-items-center rounded-full bg-white/10 text-white">
                <svg viewBox="0 0 24 24" className="size-6" fill="currentColor" aria-hidden>
                  <path d="M4 6.5A2.5 2.5 0 0 1 6.5 4h7A2.5 2.5 0 0 1 16 6.5v11a2.5 2.5 0 0 1-2.5 2.5h-7A2.5 2.5 0 0 1 4 17.5v-11ZM18 9.2l3.1-2.1a.6.6 0 0 1 .9.5v8.8a.6.6 0 0 1-.9.5L18 14.8V9.2Z" />
                </svg>
              </div>
              <p className="text-[15px] font-medium text-white">Up to 90 seconds</p>
              <p className="mt-1 text-[13px] text-white/60">
                Your browser will ask for camera and microphone access.
              </p>
            </div>
          </div>
        )}

        {phase === "countdown" && (
          <div className="absolute inset-0 grid place-items-center bg-black/45">
            <span
              key={countdown}
              className="animate-settle font-display text-[88px] leading-none text-white"
            >
              {countdown}
            </span>
          </div>
        )}

        {phase === "recording" && (
          <>
            <div className="absolute left-3 top-3 flex items-center gap-2 rounded-full bg-black/65 px-2.5 py-1">
              <span className="size-2 animate-pulse rounded-full bg-danger" />
              <span className="font-mono text-[12px] tabular-nums text-white">
                {String(Math.floor(seconds / 60)).padStart(2, "0")}:
                {String(seconds % 60).padStart(2, "0")}
              </span>
            </div>
            {remaining <= 10 && (
              <div className="absolute right-3 top-3 rounded-full bg-danger px-2.5 py-1 text-[12px] font-medium tabular-nums text-white">
                {remaining}s left
              </div>
            )}
            <div className="absolute inset-x-0 bottom-0 h-1 bg-white/15">
              <div
                className="h-full bg-danger transition-[width] duration-1000 ease-linear"
                style={{ width: `${pct}%` }}
              />
            </div>
          </>
        )}
      </div>

      {error && (
        <p role="alert" className="rounded-md border border-danger/25 bg-danger/8 px-3 py-2 text-[13px] text-danger">
          {error}
        </p>
      )}

      <div className="flex flex-wrap gap-2">
        {phase === "idle" && (
          <>
            <Button size="lg" onClick={requestCamera}>
              Turn on camera
            </Button>
            <Button size="lg" variant="ghost" onClick={onCancel}>
              Back
            </Button>
          </>
        )}

        {phase === "requesting" && (
          <Button size="lg" loading disabled>
            Waiting for permission
          </Button>
        )}

        {phase === "ready" && (
          <>
            <Button size="lg" onClick={beginCountdown}>
              Start recording
            </Button>
            <Button
              size="lg"
              variant="ghost"
              onClick={() => {
                stopStream();
                setPhase("idle");
                onCancel();
              }}
            >
              Back
            </Button>
          </>
        )}

        {phase === "recording" && (
          <Button size="lg" variant="danger" onClick={stopRecording}>
            Stop recording
          </Button>
        )}

        {phase === "review" && (
          <>
            <Button size="lg" onClick={use}>
              Use this take
            </Button>
            <Button size="lg" variant="secondary" onClick={retake}>
              Record again
            </Button>
          </>
        )}
      </div>

      {phase === "ready" && (
        <p className="text-[13px] leading-relaxed text-muted">
          Look at the camera, not at yourself. Two or three sentences is plenty — what you were
          stuck on, and what changed.
        </p>
      )}
    </div>
  );
}
