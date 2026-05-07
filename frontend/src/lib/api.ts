import type { HealthResponse, PredictionResponse } from "./types";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ??
  "http://localhost:8000/api/v1";

class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

async function parseError(res: Response): Promise<string> {
  try {
    const body = await res.json();
    if (body && typeof body.detail === "string") return body.detail;
    return res.statusText || `HTTP ${res.status}`;
  } catch {
    return res.statusText || `HTTP ${res.status}`;
  }
}

export async function getHealth(signal?: AbortSignal): Promise<HealthResponse> {
  const res = await fetch(`${API_BASE_URL}/health`, {
    method: "GET",
    cache: "no-store",
    signal,
  });
  if (!res.ok) {
    throw new ApiError(await parseError(res), res.status);
  }
  return (await res.json()) as HealthResponse;
}

export async function predict(
  file: File,
  signal?: AbortSignal,
): Promise<PredictionResponse> {
  const form = new FormData();
  form.append("file", file, file.name);

  const res = await fetch(`${API_BASE_URL}/predict`, {
    method: "POST",
    body: form,
    signal,
  });

  if (!res.ok) {
    throw new ApiError(await parseError(res), res.status);
  }
  return (await res.json()) as PredictionResponse;
}

export { ApiError };
