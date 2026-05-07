export type ClassProbability = {
  label: string;
  probability: number;
};

export type PredictionResponse = {
  label: string;
  confidence: number;
  probabilities: ClassProbability[];
  model_name: string;
  inference_ms: number;
};

export type HealthResponse = {
  status: "ok" | "degraded" | string;
  model_loaded: boolean;
  model_name: string;
  classes: string[];
};

export type ApiError = {
  detail: string;
};

export type HistoryEntry = {
  id: string;
  timestamp: number;
  filename: string;
  previewUrl: string;
  label: string;
  confidence: number;
  inferenceMs: number;
};
