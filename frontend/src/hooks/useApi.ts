"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchConfig,
  saveConfig,
  fetchNodes,
  fetchHistory,
  runPipeline,
  ConfigData,
  PipelineRunRequest,
} from "@/lib/api";

export const QUERY_KEYS = {
  config: ["config"] as const,
  nodes: ["nodes"] as const,
  history: ["history"] as const,
};

export function useConfig() {
  return useQuery({
    queryKey: QUERY_KEYS.config,
    queryFn: fetchConfig,
  });
}

export function useSaveConfig() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (newConfig: ConfigData) => saveConfig(newConfig),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.config });
    },
  });
}

export function useNodes() {
  return useQuery({
    queryKey: QUERY_KEYS.nodes,
    queryFn: fetchNodes,
  });
}

export function useHistory() {
  return useQuery({
    queryKey: QUERY_KEYS.history,
    queryFn: fetchHistory,
  });
}

export function useRunPipeline() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: PipelineRunRequest) => runPipeline(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.history });
    },
  });
}
