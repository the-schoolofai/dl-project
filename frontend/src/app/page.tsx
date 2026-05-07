"use client";

import { useEffect, useMemo, useState } from "react";
import { HealthBadge } from "@/components/HealthBadge";
import { PredictionForm } from "@/components/PredictionForm";
import { PredictionResult } from "@/components/PredictionResult";
import { PredictionHistory } from "@/components/PredictionHistory";
import { StatsPanel } from "@/components/StatsPanel";
import { useHealth } from "@/hooks/useHealth";
import { API_BASE_URL, predict } from "@/lib/api";
import type { HistoryEntry, PredictionResponse } from "@/lib/types";

const HISTORY_LIMIT = 20;

export default function Page() {
  const health = useHealth();
  const [result, setResult] = useState<PredictionResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  // Tear down object URLs on unmount.
  useEffect(() => {
    return () => {
      for (const h of history) URL.revokeObjectURL(h.previewUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const classes = useMemo(() => {
    if (health.status === "online" || health.status === "degraded") {
      return health.data.classes;
    }
    return [];
  }, [health]);

  const modelName = useMemo(() => {
    if (health.status === "online" || health.status === "degraded") {
      return health.data.model_name;
    }
    return null;
  }, [health]);

  const onSubmit = async (file: File) => {
    setIsSubmitting(true);
    setError(null);
    try {
      const data = await predict(file);
      setResult(data);
      const entry: HistoryEntry = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        timestamp: Date.now(),
        filename: file.name,
        previewUrl: URL.createObjectURL(file),
        label: data.label,
        confidence: data.confidence,
        inferenceMs: data.inference_ms,
      };
      setHistory((prev) => {
        const next = [entry, ...prev];
        if (next.length > HISTORY_LIMIT) {
          for (const stale of next.slice(HISTORY_LIMIT)) {
            URL.revokeObjectURL(stale.previewUrl);
          }
        }
        return next.slice(0, HISTORY_LIMIT);
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      setError(msg);
      setResult(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const onClearForm = () => {
    setResult(null);
    setError(null);
  };

  const onClearHistory = () => {
    for (const h of history) URL.revokeObjectURL(h.previewUrl);
    setHistory([]);
  };

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            DL Image Classifier
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Inspect predictions from the Rock-Paper-Scissors CNN inference service.
          </p>
        </div>
        <HealthBadge />
      </header>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <PredictionForm
              isSubmitting={isSubmitting}
              onSubmit={onSubmit}
              onClear={onClearForm}
            />
            <PredictionResult
              result={result}
              isSubmitting={isSubmitting}
              error={error}
              classes={classes}
            />
          </div>
          <PredictionHistory entries={history} onClear={onClearHistory} />
        </div>
        <div className="lg:col-span-1">
          <StatsPanel
            modelName={modelName}
            classes={classes}
            history={history}
          />
        </div>
      </div>

      <footer className="mt-10 flex items-center justify-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-500 shadow-sm">
          <span className="h-1.5 w-1.5 rounded-full bg-slate-300" aria-hidden />
          API
          <code className="font-mono text-slate-700">{API_BASE_URL}</code>
        </span>
      </footer>
    </main>
  );
}
