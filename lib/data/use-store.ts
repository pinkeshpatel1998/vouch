"use client";

import * as React from "react";
import { subscribeData } from "./events";

/**
 * Runs an async read, then re-runs it whenever the store changes. Returns a
 * genuine loading state on first read so every screen has to design one.
 */
export function useQuery<T>(
  run: () => Promise<T>,
  deps: React.DependencyList,
): { data: T | undefined; loading: boolean; error: Error | null; refresh: () => void } {
  const [data, setData] = React.useState<T>();
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<Error | null>(null);
  const [nonce, setNonce] = React.useState(0);

  const runRef = React.useRef(run);
  runRef.current = run;

  React.useEffect(() => {
    let live = true;
    runRef
      .current()
      .then((v) => {
        if (!live) return;
        setData(v);
        setError(null);
      })
      .catch((e) => live && setError(e instanceof Error ? e : new Error(String(e))))
      .finally(() => live && setLoading(false));
    return () => {
      live = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, nonce]);

  React.useEffect(() => subscribeData(() => setNonce((n) => n + 1)), []);

  return { data, loading, error, refresh: () => setNonce((n) => n + 1) };
}
