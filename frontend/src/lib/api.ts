export const getApiBaseUrl = (): string => {
  const envUrl = process.env.NEXT_PUBLIC_API_URL;
  if (envUrl && envUrl.trim() !== "") {
    return envUrl.trim().replace(/\/+$/, "");
  }
  return "https://fedrated-learning-system.onrender.com";
};

export const getWsBaseUrl = (): string => {
  const httpUrl = getApiBaseUrl();
  if (httpUrl.startsWith("https://")) {
    return httpUrl.replace("https://", "wss://");
  } else if (httpUrl.startsWith("http://")) {
    return httpUrl.replace("http://", "ws://");
  }
  return "wss://" + httpUrl;
};

export interface ConfigData {
  num_sites: number;
  sim_days?: number;
  training_days?: number;
  fl_rounds: number;
  local_epochs: number;
  seq_length: number;
  learning_rate: number;
  aggregation_alg: string;
}

export interface ConfigResponse {
  status: string;
  config: ConfigData;
  message?: string;
}

export interface NodeItem {
  id: string;
  name: string;
  payload: string;
  trend: string;
  mae: string;
  participation: string;
  compute: string;
  status: string;
  icon: string;
}

export interface NodesResponse {
  status: string;
  nodes: NodeItem[];
}

export interface PipelineHistoryItem {
  id?: number;
  num_sites: number;
  fl_rounds: number;
  avg_fl_mae: number;
  avg_cent_mae: number;
  avg_fl_r2: number;
  cum_comm_mb: number;
  timestamp?: string;
}

export interface HistoryResponse {
  status: string;
  history: PipelineHistoryItem[];
}

export interface PipelineRunRequest {
  num_sites: number;
  sim_days: number;
  training_days?: number;
  fl_rounds: number;
  local_epochs: number;
  seq_length: number;
  learning_rate: number;
}

export interface PipelineRunResponse {
  status: string;
  metrics: {
    avg_fl_mae: number;
    avg_cent_mae: number;
    avg_fl_r2: number;
    cum_fl_comm_mb: number;
    raw_data_size_mb: number;
  };
  waveform_samples: Record<string, { y_true: number[]; y_fl: number[]; y_cent: number[] }>;
  fl_round_losses: number[];
  cent_losses: number[];
  summary: Array<Record<string, any>>;
}

// Fetch Helpers
export async function fetchConfig(): Promise<ConfigData> {
  const res = await fetch(`${getApiBaseUrl()}/api/config`);
  if (!res.ok) {
    throw new Error(`Failed to fetch config: ${res.statusText}`);
  }
  const data: ConfigResponse = await res.json();
  return data.config;
}

export async function saveConfig(config: ConfigData): Promise<ConfigResponse> {
  const res = await fetch(`${getApiBaseUrl()}/api/config`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(config),
  });
  if (!res.ok) {
    throw new Error(`Failed to save config: ${res.statusText}`);
  }
  return await res.json();
}

export async function fetchNodes(): Promise<NodeItem[]> {
  const res = await fetch(`${getApiBaseUrl()}/api/nodes`);
  if (!res.ok) {
    throw new Error(`Failed to fetch nodes: ${res.statusText}`);
  }
  const data: NodesResponse = await res.json();
  return data.nodes;
}

export async function fetchHistory(): Promise<PipelineHistoryItem[]> {
  const res = await fetch(`${getApiBaseUrl()}/api/history`);
  if (!res.ok) {
    throw new Error(`Failed to fetch history: ${res.statusText}`);
  }
  const data: HistoryResponse = await res.json();
  return data.history;
}

export async function runPipeline(params: PipelineRunRequest): Promise<PipelineRunResponse> {
  const res = await fetch(`${getApiBaseUrl()}/api/pipeline/run`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
  if (!res.ok) {
    throw new Error(`Failed to run pipeline: ${res.statusText}`);
  }
  return await res.json();
}
