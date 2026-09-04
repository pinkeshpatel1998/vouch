import { Badge } from "@/components/ui/primitives";
import type { Testimonial, TestimonialStatus } from "@/lib/database.types";

/** Relative time, shared by the activity table and the inbox. */
export function when(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} ${hours === 1 ? "hour" : "hours"} ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "Yesterday";
  if (days < 30) return `${days} days ago`;
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function duration(s: number | null | undefined) {
  if (!s) return null;
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

const LABEL: Record<TestimonialStatus, string> = {
  pending: "Pending",
  approved: "Approved",
  rejected: "Rejected",
};

export function StatusTag({ status }: { status: TestimonialStatus }) {
  return <Badge tone={status}>{LABEL[status]}</Badge>;
}

export function TypeTag({ t }: { t: Pick<Testimonial, "type" | "video_duration_seconds"> }) {
  if (t.type === "text") return <span>Text</span>;
  const d = duration(t.video_duration_seconds);
  return <span>Video{d ? ` · ${d}` : ""}</span>;
}
