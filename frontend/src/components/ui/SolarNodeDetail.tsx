"use client";
import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Button } from "./Button";
import { WaveformChart } from "./WaveformChart";
import { ExternalLink, Link2, Share2, Clock, Activity, ArrowDownRight, SlidersHorizontal, RefreshCw, Plus } from "lucide-react";
import { ConfigModal } from "./ConfigModal";

export const SolarNodeDetail: React.FC = () => {
  const [activeTab, setActiveTab] = useState("metrics");
  const [configOpen, setConfigOpen] = useState(false);
  const searchParams = useSearchParams();
  const id = searchParams.get("id") || "site_0";

  const [nodesMap, setNodesMap] = useState<Record<string, any> | null>(null);

  useEffect(() => {
    fetch("http://localhost:8000/api/nodes")
      .then((res) => res.json())
      .then((data) => {
        if (data.status === "success") {
          const map: Record<string, any> = {};
          data.nodes.forEach((n: any) => { map[n.id] = n; });
          setNodesMap(map);
        }
      })
      .catch((err) => console.error("Error fetching nodes:", err));
  }, []);

  if (!nodesMap) {
    return (
      <div className="bg-[#11121A] border border-[#1E202E] rounded-2xl p-6 relative overflow-hidden flex items-center justify-center min-h-[500px]">
        <div className="flex flex-col items-center gap-3 text-slate-400">
          <Activity className="w-6 h-6 animate-pulse" />
          <p className="text-xs font-semibold animate-pulse tracking-tight">Establishing secure link to edge PV datasets...</p>
        </div>
      </div>
    );
  }

  const nodeData = nodesMap[id] || Object.values(nodesMap)[0];

  return (
    <>
      <ConfigModal isOpen={configOpen} onClose={() => setConfigOpen(false)} />
      <div className="bg-[#11121A] border border-[#1E202E] rounded-2xl p-6 relative overflow-hidden">
        {/* Detail Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#1E202E]/60 mb-6">
          <h3 className="text-sm font-bold text-slate-200 tracking-tight">Solar Node Detail Viewer</h3>
          <div className="flex items-center gap-2">
            <button onClick={() => toast.success('Refreshing node data stream...')} className="p-1.5 rounded-lg bg-[#181A26] text-slate-400 hover:text-white border border-[#272A3C] transition-colors" title="Refresh Node Data">
              <RefreshCw className="w-4 h-4" />
            </button>
            <button onClick={() => setConfigOpen(true)} className="p-1.5 rounded-lg bg-[#181A26] text-slate-400 hover:text-white border border-[#272A3C] transition-colors" title="Open Admin DB Config">
              <SlidersHorizontal className="w-4 h-4" />
            </button>
          </div>
        </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column - Detailed Asset Balance & Actions */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          {/* Timestamp Indicator */}
          <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
            <span>Last Update - 45 minutes ago</span>
            <Clock className="w-3.5 h-3.5 text-purple-400" />
          </div>

          {/* Main Title & Icons */}
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
                {nodeData.name} Node
                <span className="w-6 h-6 rounded-md bg-amber-600/20 border border-amber-500/30 text-amber-400 text-xs flex items-center justify-center font-bold">
                  {nodeData.icon}
                </span>
              </h2>
              <div className="flex items-center gap-1.5">
                <button className="p-1.5 rounded-lg bg-[#181A26] text-slate-400 hover:text-white border border-[#282B3E]">
                  <Link2 className="w-3.5 h-3.5" />
                </button>
                <button className="p-1.5 rounded-lg bg-[#181A26] text-slate-400 hover:text-white border border-[#282B3E]">
                  <Share2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <button onClick={() => toast('Redirecting to full node analytics profile...')} className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-[#181A26] text-slate-300 hover:text-white border border-[#282B3E] flex items-center gap-1.5 transition-colors">
              <span>View Profile</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Current Payload Size */}
          <div>
            <p className="text-xs font-medium text-slate-400 mb-1">Local Network Payload Exchanged (MB)</p>
            <div className="flex items-center gap-4 flex-wrap">
              <span className="text-4xl lg:text-5xl font-black text-white tracking-tight">
                {nodeData.payload}
              </span>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="md" onClick={() => toast.error(`Initiating hard isolation for ${nodeData.name}. Node dropped.`)}>
                  Isolate Node
                </Button>
                <Button variant="dark" size="md" onClick={() => setActiveTab('logs')}>
                  View Logs
                </Button>
              </div>
            </div>
          </div>

          {/* Metric Sub-Tabs */}
          <div className="pt-2">
            <div className="flex items-center gap-6 border-b border-[#1E202E] pb-3 text-xs font-semibold">
              {[
                { id: "metrics", label: "Metrics", desc: "Performance stats" },
                { id: "architecture", label: "Architecture", desc: "Local LSTM config" },
                { id: "logs", label: "Training Logs", desc: "Epoch output" },
                { id: "hardware", label: "Hardware", desc: "Resource usage" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex flex-col text-left transition-colors ${
                    activeTab === tab.id
                      ? "text-white border-b-2 border-purple-500 pb-3 -mb-3"
                      : "text-slate-500 hover:text-slate-300"
                  }`}
                >
                  <span className="font-bold text-sm">{tab.label}</span>
                  <span className="text-[10px] font-normal text-slate-500">{tab.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Conditional Sub-Tab Rendering */}
          {activeTab === "metrics" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 pt-1">
              <div className="p-3.5 rounded-xl bg-[#151722] border border-[#212435] flex flex-col justify-between gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 font-medium">Model Error Trend</span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#1F2233] text-slate-300">Round 10</span>
                </div>
                <p className="text-lg font-bold text-white tracking-tight">{nodeData.trend}</p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#151722] border border-[#212435] flex flex-col justify-between gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 font-medium">Test Set MAE</span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#1F2233] text-slate-300">Round 10</span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-lg font-bold text-white">{nodeData.mae}</span>
                  <span className="text-[11px] font-bold text-emerald-400 flex items-center">
                    -5.09% <ArrowDownRight className="w-3 h-3" />
                  </span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-[#151722] border border-[#212435] flex flex-col justify-between gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 font-medium">Data Ratio</span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#1F2233] text-slate-300">Weights</span>
                </div>
                <p className="text-lg font-bold text-white tracking-tight">{nodeData.participation}</p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#151722] border border-[#212435] flex flex-col justify-between gap-2">
                <span className="text-[11px] text-slate-400 font-medium">Compute Load</span>
                <div className="relative my-1">
                  <div className="h-1.5 w-full bg-[#25283B] rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-amber-500 to-orange-400 rounded-full w-[65%]" />
                  </div>
                  <div className="flex justify-between text-[9px] text-slate-400 font-bold mt-1.5">
                    <span>{nodeData.compute} <span className="text-[8px] text-slate-500">Utilization</span></span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "logs" && (
            <div className="h-40 bg-[#0B0C12] border border-[#1E202E] rounded-xl p-4 overflow-y-auto flex flex-col gap-2 font-mono text-[10px]">
              <div className="text-purple-400">&gt; Authenticating local connection for {nodeData.name}...</div>
              <div className="text-emerald-400">&gt; Loading PyTorch LSTM Sequential[64, 32, 1]</div>
              <div className="text-slate-400">&gt; Starting Epoch 1/5 [======&gt;             ] 32%</div>
              <div className="text-slate-400">&gt; Loss metric: 2.7661 ... optimizing.</div>
              <div className="text-amber-400 animate-pulse">&gt; Iterating backward pass gradients...</div>
            </div>
          )}
          
          {(activeTab === "architecture" || activeTab === "hardware") && (
            <div className="h-40 bg-[#12131C] border border-dashed border-[#1E202E] rounded-xl flex items-center justify-center text-xs text-slate-500">
              Select another tab or run live pipeline training to generate {activeTab} data structures.
            </div>
          )}

        </div>

        {/* Right Column - Waveform Spectrum Chart */}
        <div className="lg:col-span-5 bg-[#0D0E16] border border-[#1C1E2C] p-5 rounded-xl h-full flex flex-col justify-center">
          <WaveformChart />
        </div>
      </div>
    </div>
    </>
  );
};
