"use client";

import { useCallback, useId, useRef, useState } from "react";
import type { DragEvent, ChangeEvent } from "react";

type PredictionFormProps = {
  isSubmitting: boolean;
  onSubmit: (file: File) => void;
  onClear: () => void;
};

const ACCEPTED = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/bmp"];
const ACCEPTED_LABEL = "JPG · PNG · WEBP · BMP · up to 8 MiB";

export function PredictionForm({
  isSubmitting,
  onSubmit,
  onClear,
}: PredictionFormProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const accept = (incoming: File | null) => {
    if (!incoming) return;
    if (!ACCEPTED.includes(incoming.type)) {
      setLocalError(`Unsupported type: ${incoming.type || "unknown"}.`);
      return;
    }
    if (incoming.size > 8 * 1024 * 1024) {
      setLocalError("File exceeds 8 MiB.");
      return;
    }
    setLocalError(null);
    setFile(incoming);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(URL.createObjectURL(incoming));
  };

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    accept(e.target.files?.[0] ?? null);
  };

  const onDrop = useCallback(
    (e: DragEvent<HTMLLabelElement>) => {
      e.preventDefault();
      setDragOver(false);
      accept(e.dataTransfer.files?.[0] ?? null);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [previewUrl],
  );

  const reset = () => {
    setFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setLocalError(null);
    if (inputRef.current) inputRef.current.value = "";
    onClear();
  };

  const submit = () => {
    if (!file || isSubmitting) return;
    onSubmit(file);
  };

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <header className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Input image</h2>
          <p className="mt-1 text-sm text-slate-600">
            Drop a hand image to classify as paper, rock, or scissors.
          </p>
        </div>
        <button
          type="button"
          onClick={reset}
          disabled={!file && !localError}
          className="text-xs font-medium text-slate-500 hover:text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Clear
        </button>
      </header>

      <label
        htmlFor={inputId}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        className={`group flex min-h-[14rem] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-4 text-center transition-colors ${
          dragOver
            ? "border-brand-500 bg-brand-50"
            : "border-slate-200 bg-slate-50/60 hover:border-brand-500 hover:bg-brand-50/40"
        }`}
      >
        {previewUrl ? (
          <div className="flex w-full flex-col items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewUrl}
              alt={file?.name ?? "Selected image"}
              className="max-h-48 rounded-lg border border-slate-200 object-contain"
            />
            <div className="text-xs text-slate-600">
              <span className="font-medium text-slate-700">{file?.name}</span>
              <span className="ml-2 text-slate-400">
                {file ? `${Math.round(file.size / 1024)} KB` : ""}
              </span>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 text-slate-500">
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              className="h-8 w-8 text-slate-400 group-hover:text-brand-500"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 16.5V18a2.25 2.25 0 002.25 2.25h13.5A2.25 2.25 0 0021 18v-1.5M16.5 12L12 7.5 7.5 12M12 7.5V18"
              />
            </svg>
            <p className="text-sm font-medium text-slate-700">
              Drop an image here, or{" "}
              <span className="text-brand-600 underline-offset-2 group-hover:underline">
                browse
              </span>
            </p>
            <p className="text-xs text-slate-500">{ACCEPTED_LABEL}</p>
          </div>
        )}

        <input
          id={inputId}
          ref={inputRef}
          type="file"
          accept={ACCEPTED.join(",")}
          onChange={onChange}
          className="sr-only"
        />
      </label>

      {localError && (
        <p className="mt-3 text-sm text-rose-600" role="alert">
          {localError}
        </p>
      )}

      <div className="mt-4 flex items-center gap-3">
        <button
          type="button"
          onClick={submit}
          disabled={!file || isSubmitting}
          className="inline-flex items-center justify-center rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Predicting…" : "Run prediction"}
        </button>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={isSubmitting}
          className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:border-brand-500 hover:text-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          Choose file
        </button>
      </div>
    </section>
  );
}
