import { Card } from "./Card";
import { formatMs, formatPercent, formatTime } from "@/lib/format";
import type { HistoryEntry } from "@/lib/types";

type PredictionHistoryProps = {
  entries: HistoryEntry[];
  onClear: () => void;
};

export function PredictionHistory({ entries, onClear }: PredictionHistoryProps) {
  if (entries.length === 0) {
    return (
      <Card title="History" variant="empty">
        <div className="flex min-h-[8rem] items-center justify-center">
          <p className="text-sm text-slate-500">
            Recent predictions will appear here.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card
      title="History"
      action={
        <button
          type="button"
          onClick={onClear}
          className="text-xs font-medium text-slate-500 hover:text-rose-600"
        >
          Clear
        </button>
      }
    >
      <div className="-mx-2 overflow-x-auto">
        <table className="w-full min-w-[36rem] text-sm">
          <thead>
            <tr className="text-left text-xs font-medium uppercase tracking-wide text-slate-500">
              <th className="px-2 py-2 font-medium">Time</th>
              <th className="px-2 py-2 font-medium">Image</th>
              <th className="px-2 py-2 font-medium">Class</th>
              <th className="px-2 py-2 text-right font-medium">Confidence</th>
              <th className="px-2 py-2 text-right font-medium">Latency</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {entries.map((e) => (
              <tr key={e.id} className="text-slate-700">
                <td className="px-2 py-2 tabular-nums text-slate-500">
                  {formatTime(e.timestamp)}
                </td>
                <td className="px-2 py-2">
                  <div className="flex items-center gap-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={e.previewUrl}
                      alt=""
                      className="h-8 w-8 rounded-md border border-slate-200 object-cover"
                    />
                    <span className="max-w-[12rem] truncate text-slate-600">
                      {e.filename}
                    </span>
                  </div>
                </td>
                <td className="px-2 py-2">
                  <span className="inline-flex items-center rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-medium text-brand-700">
                    {e.label}
                  </span>
                </td>
                <td className="px-2 py-2 text-right tabular-nums">
                  {formatPercent(e.confidence)}
                </td>
                <td className="px-2 py-2 text-right tabular-nums text-slate-500">
                  {formatMs(e.inferenceMs)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
