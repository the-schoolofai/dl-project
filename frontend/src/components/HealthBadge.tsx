"use client";

import { useHealth } from "@/hooks/useHealth";

const TONE = {
  checking: {
    dot: "bg-amber-400",
    text: "text-amber-700",
    bg: "bg-amber-50 border-amber-200",
    label: "Checking",
  },
  online: {
    dot: "bg-emerald-500",
    text: "text-emerald-700",
    bg: "bg-emerald-50 border-emerald-200",
    label: "Online",
  },
  degraded: {
    dot: "bg-amber-400",
    text: "text-amber-700",
    bg: "bg-amber-50 border-amber-200",
    label: "Degraded",
  },
  offline: {
    dot: "bg-rose-500",
    text: "text-rose-700",
    bg: "bg-rose-50 border-rose-200",
    label: "Offline",
  },
} as const;

export function HealthBadge() {
  const health = useHealth();
  const tone = TONE[health.status];

  const detail =
    health.status === "online" || health.status === "degraded"
      ? health.data.model_name
      : health.status === "offline"
        ? "API unreachable"
        : "Pinging…";

  return (
    <div
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium ${tone.bg} ${tone.text}`}
      role="status"
      aria-live="polite"
    >
      <span
        className={`h-2 w-2 rounded-full ${tone.dot}`}
        aria-hidden="true"
      />
      <span>{tone.label}</span>
      <span className="text-slate-400" aria-hidden="true">
        ·
      </span>
      <span className="font-normal text-slate-600">{detail}</span>
    </div>
  );
}
