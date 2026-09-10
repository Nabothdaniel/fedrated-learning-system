"use client";
import React, { useState, useEffect } from "react";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Zap, Server, Network, Check, Loader2, Circle, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { useConfig, useRunPipeline } from "@/hooks/useApi";
import { getWsBaseUrl } from "@/lib/api";

export default function GlobalModelPage() {
  const [loading, setLoading] = useState(false);
  const [round, setRound] = useState(0);
  const [phase, setPhase] = useState(0);

  const { data: configData } = useConfig();
  const runPipelineMutation = useRunPipeline();

  const [config, setConfig] = useState({
    num_sites: 5,
    fl_rounds: 10,
    training_days: 30,
    local_epochs: 2,
    seq_length: 24,
    learning_rate: 0.001,
    aggregation_alg: "FedAvg"
  });

  useEffect(() => {
    if (configData) {
      setConfig({
        num_sites: configData.num_sites ?? 5,
        fl_rounds: configData.fl_rounds ?? 10,
        training_days: configData.training_days ?? configData.sim_days ?? 30,
        local_epochs: configData.local_epochs ?? 2,
        seq_length: configData.seq_length ?? 24,
        learning_rate: configData.learning_rate ?? 0.001,
        aggregation_alg: configData.aggregation_alg ?? "FedAvg"
      });
    }
  }, [configData]);

  const runRestFallback = (params: {
    num_sites: number;
    sim_days: number;
    fl_rounds: number;
    local_epochs: number;
    seq_length: number;
    learning_rate: number;
  }) => {
    let currentRound = 1;
    setPhase(2);
    setRound(1);

    const interval = setInterval(() => {
      currentRound = Math.min(currentRound + 1, params.fl_rounds);
      setRound(currentRound);
      if (currentRound % 2 === 0) {
        setPhase(3);
      } else {
        setPhase(4);
      }
    }, 1200);

    runPipelineMutation.mutate(
      {
        num_sites: params.num_sites,
        sim_days: params.sim_days,
        fl_rounds: params.fl_rounds,
        local_epochs: params.local_epochs,
        seq_length: params.seq_length,
        learning_rate: params.learning_rate,
      },
      {
        onSuccess: () => {
          clearInterval(interval);
          setRound(params.fl_rounds);
          setPhase(5);
          setLoading(false);
          toast.success("Federated learning pipeline executed successfully via live backend!");
        },
        onError: (err: any) => {
          clearInterval(interval);
          setLoading(false);
          toast.error(`Pipeline Execution Error: ${err.message || "Failed to execute pipeline"}`);
        },
      }
    );
  };

  const handleRunSimulation = () => {
    if (loading) return;
    setLoading(true);
    setRound(1);
    setPhase(1);

    const params = {
      num_sites: config.num_sites,
      sim_days: config.training_days || 30,
      fl_rounds: config.fl_rounds,
      local_epochs: config.local_epochs,
      seq_length: config.seq_length,
      learning_rate: config.learning_rate,
    };

    let wsHandled = false;
    let ws: WebSocket | null = null;

    try {
      const wsUrl = `${getWsBaseUrl()}/api/pipeline-stream`;
      ws = new WebSocket(wsUrl);

      const timeoutId = setTimeout(() => {
        if (!wsHandled) {
          wsHandled = true;
          if (ws) {
            ws.onopen = null;
            ws.onmessage = null;
            ws.onerror = null;
            ws.onclose = null;
            try { ws.close(); } catch (_) {}
          }
          console.warn("WebSocket timeout, failing over to TanStack Query REST API...");
          runRestFallback(params);
        }
      }, 2500);

      ws.onopen = () => {
        if (wsHandled) return;
        clearTimeout(timeoutId);
        wsHandled = true;
        ws?.send(JSON.stringify(params));
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          if (data.phase === "broadcasting") {
            setPhase(1);
          } else if (data.phase === "training") {
            setPhase(2);
            setRound(data.round);
          } else if (data.phase === "uploading") {
            setPhase(3);
            setRound(data.round);
          } else if (data.phase === "aggregating") {
            setPhase(4);
            setRound(data.round);
          } else if (data.phase === "completed") {
            setPhase(5);
            setLoading(false);
            toast.success("Federated learning pipeline executed successfully!");
            ws?.close();
          } else if (data.phase === "error") {
            toast.error(`Pipeline Stream Error: ${data.message}`);
            setLoading(false);
          }
        } catch (e) {
          console.error("Failed to parse websocket message", e);
        }
      };

      ws.onerror = (error) => {
        console.warn("WebSocket error, executing TanStack Query REST API fallback...", error);
        if (!wsHandled) {
          wsHandled = true;
          clearTimeout(timeoutId);
          try { ws?.close(); } catch (_) {}
          runRestFallback(params);
        }
      };

      ws.onclose = () => {
        if (!wsHandled) {
          wsHandled = true;
          clearTimeout(timeoutId);
          runRestFallback(params);
        }
      };
    } catch (err) {
      console.warn("Failed to create WebSocket instance, executing TanStack Query REST fallback...", err);
      runRestFallback(params);
    }
  };

  const steps = [
    {
      id: 1,
      title: "1. Broadcast Global Model",
      desc: "The cloud server transmits identical copies of the latest global LSTM model weights (\u03B8_t) to all 5 connected PV clients via secure channels. Total payload size: 2.45 MB."
    },
    {
      id: 2,
      title: "2. Local Client Training",
      desc: "Clients perform multi-epoch isolated training on their proprietary solar irradiance arrays. No raw datastreams or private telemetry ever leave the physical edge nodes."
    },
    {
      id: 3,
      title: "3. Parameter Upload",
      desc: "Local mathematical gradients and refined parameter arrays (\u03B8_k) are transmitted back to the global server. Raw site data remains strictly confidential."
    },
    {
      id: 4,
      title: "4. Federated Averaging (FedAvg)",
      desc: "The server mathematically averages the uploaded parameters, scaled proportionally by client data volumes, to generate a synthesized, improved global forecasting model (\u03B8_t+1)."
    }
  ];

  return (
    <main className="p-8 flex flex-col gap-8 flex-1 w-full bg-[#08090D] overflow-y-auto">
      {/* Title Header */}
      <div className="flex flex-col gap-2 mb-2">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <Server className="w-6 h-6 text-purple-500" />
            Federated Averaging Server
          </h1>
          <button 
            onClick={handleRunSimulation}
            disabled={loading}
            className="h-8 px-4 py-2 rounded-lg bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 text-xs font-black shadow-[0_0_15px_rgba(16,185,129,0.2)] hover:bg-emerald-600/30 transition-all disabled:opacity-50 flex items-center gap-2">
            <Zap className="w-3.5 h-3.5" />
            {loading ? "AGGREGATING WEIGHTS..." : "START FEDAVG PIPELINE"}
          </button>
        </div>
        <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
          The cloud server orchestrates the Federated Learning rounds. In each communication round, the server collects model weights from all participating PV sites, applies the FedAvg algorithm to update the global model, and broadcasts it back to the clients.
        </p>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 border border-purple-500/20 bg-purple-500/5 flex flex-col justify-center items-center gap-2">
          <p className="text-sm font-bold text-slate-400">Current FL Round</p>
          <div className="text-5xl font-black text-purple-400">
            {round} <span className="text-lg text-slate-500">/ {config.fl_rounds}</span>
          </div>
        </Card>

        <Card className="p-6 border border-amber-500/20 bg-amber-500/5 flex flex-col justify-center items-center gap-2">
          <p className="text-sm font-bold text-slate-400">Connected Sites</p>
          <div className="text-5xl font-black text-amber-400">
            {config.num_sites} <span className="text-lg text-slate-500">Active</span>
          </div>
        </Card>

        <Card className="p-6 border border-blue-500/20 bg-blue-500/5 flex flex-col justify-center items-center gap-2">
          <p className="text-sm font-bold text-slate-400">Aggregation Func</p>
          <div className="text-3xl font-black text-blue-400 mt-2">
            {config.aggregation_alg}
          </div>
          <Badge variant="neutral" className="mt-1">Weighted</Badge>
        </Card>
      </div>

      {/* Rich Stepper Execution Pipeline */}
      <div className="mt-4">
        <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
          <Network className="w-5 h-5 text-slate-400" />
          Execution Pipeline
        </h2>
        
        <div className="flex flex-col relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-[#212435] before:to-transparent">
          {steps.map((step, idx) => {
            // Determine Step Status
            let status: "pending" | "active" | "completed" = "pending";
            if (round > 0) {
              if (phase > step.id || phase === 5) {
                status = "completed";
              } else if (phase === step.id) {
                status = "active";
              }
            }

            return (
              <div key={idx} className="relative flex items-start justify-between md:justify-normal md:odd:flex-row-reverse group is-active py-4">
                {/* Center Timeline Icon */}
                <div className="absolute top-4 left-5 md:left-1/2 -ml-4 w-8 h-8 rounded-full border-2 border-[#08090D] flex items-center justify-center shrink-0 shadow z-10 
                  transition-colors duration-300
                  bg-[#12131C] text-slate-500 
                ">
                  {status === "completed" && <div className="w-full h-full bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center"><Check className="w-4 h-4" /></div>}
                  {status === "active" && <div className="w-full h-full bg-purple-500/20 text-purple-400 rounded-full flex items-center justify-center"><Loader2 className="w-4 h-4 animate-spin" /></div>}
                  {status === "pending" && <div className="w-full h-full flex items-center justify-center border border-[#1E202E] rounded-full"><Circle className="w-3 h-3 opacity-50" /></div>}
                </div>
                
                {/* Content Card */}
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-3rem)] p-5 rounded-2xl bg-[#0B0C12] border border-[#1A1C28] shadow transition-colors block ml-14 md:ml-0">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <h3 className={`font-bold text-sm ${status === 'active' ? 'text-purple-400' : (status === 'completed' ? 'text-emerald-400' : 'text-slate-300')}`}>
                        {step.title}
                      </h3>
                      {status === "active" && <Badge variant="purple">Running...</Badge>}
                      {status === "completed" && <Badge variant="success">Done</Badge>}
                    </div>
                    <p className={`text-xs leading-relaxed ${status === 'active' ? 'text-slate-200' : 'text-slate-500'}`}>
                      {step.desc}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        {phase === 0 && !loading && (
          <div className="text-center mt-6 p-4 rounded-xl border border-dashed border-[#1E202E] text-slate-500 text-sm">
            Pipeline engine ready. Click START FEDAVG PIPELINE above to execute real-time training.
          </div>
        )}
      </div>
    </main>
  );
}
