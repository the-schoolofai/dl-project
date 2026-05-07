"use client";

import { useEffect, useRef, useState } from "react";
import { getHealth } from "@/lib/api";
import type { HealthResponse } from "@/lib/types";

export type HealthState =
  | { status: "checking"; data: null; error: null }
  | { status: "online"; data: HealthResponse; error: null }
  | { status: "degraded"; data: HealthResponse; error: null }
  | { status: "offline"; data: null; error: string };

const POLL_MS = 10_000;

export function useHealth(): HealthState {
  const [state, setState] = useState<HealthState>({
    status: "checking",
    data: null,
    error: null,
  });
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    let timer: ReturnType<typeof setTimeout> | null = null;
    let abort: AbortController | null = null;

    const tick = async () => {
      abort?.abort();
      abort = new AbortController();
      try {
        const data = await getHealth(abort.signal);
        if (!mounted.current) return;
        if (data.model_loaded && data.status === "ok") {
          setState({ status: "online", data, error: null });
        } else {
          setState({ status: "degraded", data, error: null });
        }
      } catch (err) {
        if (!mounted.current) return;
        const msg = err instanceof Error ? err.message : "Unknown error";
        setState({ status: "offline", data: null, error: msg });
      } finally {
        if (mounted.current) {
          timer = setTimeout(tick, POLL_MS);
        }
      }
    };

    tick();

    return () => {
      mounted.current = false;
      if (timer) clearTimeout(timer);
      abort?.abort();
    };
  }, []);

  return state;
}
