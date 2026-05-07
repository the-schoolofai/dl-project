import { Card } from "./Card";
import { formatPercent } from "@/lib/format";
import type { HistoryEntry } from "@/lib/types";

type StatsPanelProps = {
  modelName: string | null;
  classes: string[];
  history: HistoryEntry[];
};

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3">
      <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
        {label}
      </dt>
      <dd className="mt-1 text-lg font-semibold tabular-nums text-slate-900">
        {value}
      </dd>
    </div>
  );
}

export function StatsPanel({ modelName, classes, history }: StatsPanelProps) {
  const total = history.length;
  const avgConfidence =
    total === 0
      ? 0
      : history.reduce((acc, h) => acc + h.confidence, 0) / total;

  const distribution = classes.map((c) => {
    const count = history.filter((h) => h.label === c).length;
    return {
      label: c,
      count,
      share: total === 0 ? 0 : count / total,
    };
  });

  return (
    <Card title="Stats">
      <dl className="grid grid-cols-2 gap-3">
        <Fact label="Model" value={modelName ?? "—"} />
        <Fact label="Classes" value={classes.length ? `${classes.length}` : "—"} />
        <Fact label="Predictions" value={`${total}`} />
        <Fact
          label="Avg confidence"
          value={total === 0 ? "—" : formatPercent(avgConfidence)}
        />
      </dl>

      <div className="mt-6">
        <p className="mb-3 text-xs font-medium uppercase tracking-wide text-slate-500">
          Class distribution
        </p>
        {classes.length === 0 ? (
          <p className="text-sm text-slate-500">Awaiting health response…</p>
        ) : (
          <ul className="space-y-3">
            {distribution.map((d) => (
              <li key={d.label}>
                <div className="mb-1 flex items-baseline justify-between gap-3 text-sm">
                  <span className="text-slate-600">{d.label}</span>
                  <span className="tabular-nums text-slate-500">
                    {d.count}{" "}
                    <span className="text-slate-400">
                      ({total === 0 ? "0%" : formatPercent(d.share, 0)})
                    </span>
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-brand-600 transition-all duration-500"
                    style={{
                      width: `${Math.max(d.share > 0 ? 4 : 0, Math.round(d.share * 100))}%`,
                    }}
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Card>
  );
}
