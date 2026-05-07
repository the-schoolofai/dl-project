import { Card } from "./Card";
import { formatMs, formatPercent } from "@/lib/format";
import type { PredictionResponse } from "@/lib/types";

type PredictionResultProps = {
  result: PredictionResponse | null;
  isSubmitting: boolean;
  error: string | null;
  classes: string[];
};

export function PredictionResult({
  result,
  isSubmitting,
  error,
  classes,
}: PredictionResultProps) {
  if (error) {
    return (
      <Card title="Prediction" variant="error">
        <p className="text-sm font-medium text-rose-700">Inference failed</p>
        <p className="mt-1 text-sm text-rose-600">{error}</p>
      </Card>
    );
  }

  if (!result) {
    return (
      <Card title="Prediction" variant="empty">
        <div className="flex min-h-[12rem] flex-col items-center justify-center text-center">
          <p className="text-sm font-medium text-slate-600">No prediction yet</p>
          <p className="mt-1 text-xs text-slate-500">
            Submit an image to see the predicted class and probabilities.
          </p>
          {classes.length > 0 && (
            <ul className="mt-4 flex flex-wrap items-center justify-center gap-2">
              {classes.map((c) => (
                <li
                  key={c}
                  className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600"
                >
                  {c}
                </li>
              ))}
            </ul>
          )}
        </div>
      </Card>
    );
  }

  return (
    <Card
      title="Prediction"
      action={
        <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
          {formatMs(result.inference_ms)}
        </span>
      }
    >
      <div className="flex items-end justify-between gap-6">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Predicted class
          </p>
          <p className="mt-1 text-4xl font-semibold tracking-tight text-brand-600">
            {result.label}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Confidence
          </p>
          <p className="mt-1 text-3xl font-semibold tabular-nums text-slate-900">
            {formatPercent(result.confidence)}
          </p>
        </div>
      </div>

      <div className="mt-6">
        <p className="mb-3 text-xs font-medium uppercase tracking-wide text-slate-500">
          Class probabilities
        </p>
        <ul className="space-y-3">
          {result.probabilities.map((p) => {
            const isTop = p.label === result.label;
            return (
              <li key={p.label}>
                <div className="mb-1 flex items-baseline justify-between gap-3 text-sm">
                  <span
                    className={
                      isTop ? "font-semibold text-slate-900" : "text-slate-600"
                    }
                  >
                    {p.label}
                  </span>
                  <span className="tabular-nums text-slate-500">
                    {formatPercent(p.probability, 2)}
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isTop ? "bg-brand-600" : "bg-slate-400"
                    }`}
                    style={{
                      width: `${Math.max(2, Math.round(p.probability * 100))}%`,
                    }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      <p className="mt-4 text-xs text-slate-400">
        Model: <span className="font-medium text-slate-500">{result.model_name}</span>
      </p>
    </Card>
  );
}
