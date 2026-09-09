"use client";
import React, { useState, useEffect } from "react";
import { X, Sliders, Database, Save, RotateCcw, Cpu, Layers, Activity } from "lucide-react";
import { toast } from "sonner";

interface ConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveSuccess?: () => void;
}

export const ConfigModal: React.FC<ConfigModalProps> = ({ isOpen, onClose, onSaveSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    num_sites: 5,
    training_days: 30,
    fl_rounds: 10,
    local_epochs: 2,
    seq_length: 24,
    learning_rate: 0.001,
    aggregation_alg: "FedAvg"
  });

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      fetch("http://localhost:8000/api/config")
        .then((res) => res.json())
        .then((data) => {
          if (data.status === "success" && data.config) {
            setForm({
              num_sites: data.config.num_sites ?? 5,
              training_days: data.config.training_days ?? data.config.sim_days ?? 30,
              fl_rounds: data.config.fl_rounds ?? 10,
              local_epochs: data.config.local_epochs ?? 2,
              seq_length: data.config.seq_length ?? 24,
              learning_rate: data.config.learning_rate ?? 0.001,
              aggregation_alg: data.config.aggregation_alg ?? "FedAvg"
            });
          }
        })
        .catch((err) => {
          console.error("Failed to load config:", err);
          toast.error("Could not fetch config from database.");
        })
        .finally(() => setLoading(false));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch("http://localhost:8000/api/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (data.status === "success") {
        toast.success("System configuration saved to database successfully!");
        if (onSaveSuccess) onSaveSuccess();
        onClose();
      } else {
        toast.error("Failed to update database configuration.");
      }
    } catch (err) {
      console.error("Error saving config:", err);
      toast.error("Network error saving database config.");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setForm({
      num_sites: 5,
      training_days: 30,
      fl_rounds: 10,
      local_epochs: 2,
      seq_length: 24,
      learning_rate: 0.001,
      aggregation_alg: "FedAvg"
    });
    toast.info("Reset config to system defaults.");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-[#0B0C12] border border-[#1E202E] rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-[#1E202E] flex items-center justify-between bg-[#12131C]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center justify-center">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-black text-white tracking-tight flex items-center gap-2">
                System Admin Hyperparameters
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                  <Database className="w-2.5 h-2.5" /> SQLite DB
                </span>
              </h2>
              <p className="text-[11px] text-slate-400">Configure global parameters stored persistently in SQLite database.</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#1C1E2C] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Form Body */}
        <form onSubmit={handleSave} className="p-6 overflow-y-auto flex flex-col gap-5 text-xs">
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-2 text-slate-400">
              <Activity className="w-6 h-6 animate-pulse text-purple-400" />
              <p className="text-xs font-semibold">Reading configuration from SQLite database...</p>
            </div>
          ) : (
            <>
              {/* Row 1: Sites & Training Days */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5 p-3 rounded-xl bg-[#12131C] border border-[#1E202E]">
                  <label className="font-bold text-slate-300 flex items-center justify-between">
                    <span>Active Solar Sites</span>
                    <span className="text-purple-400 font-extrabold">{form.num_sites} Sites</span>
                  </label>
                  <input
                    type="range"
                    min={2}
                    max={10}
                    step={1}
                    value={form.num_sites}
                    onChange={(e) => setForm({ ...form, num_sites: parseInt(e.target.value) })}
                    className="accent-purple-500 bg-[#1E202E] rounded-lg h-1.5 cursor-pointer"
                  />
                  <span className="text-[10px] text-slate-500">Participating edge PV nodes</span>
                </div>

                <div className="flex flex-col gap-1.5 p-3 rounded-xl bg-[#12131C] border border-[#1E202E]">
                  <label className="font-bold text-slate-300 flex items-center justify-between">
                    <span>Telemetry History</span>
                    <span className="text-amber-400 font-extrabold">{form.training_days} Days</span>
                  </label>
                  <input
                    type="range"
                    min={7}
                    max={90}
                    step={1}
                    value={form.training_days}
                    onChange={(e) => setForm({ ...form, training_days: parseInt(e.target.value) })}
                    className="accent-amber-500 bg-[#1E202E] rounded-lg h-1.5 cursor-pointer"
                  />
                  <span className="text-[10px] text-slate-500">Historical irradiance records per node</span>
                </div>
              </div>

              {/* Row 2: FL Rounds & Local Epochs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5 p-3 rounded-xl bg-[#12131C] border border-[#1E202E]">
                  <label className="font-bold text-slate-300 flex items-center justify-between">
                    <span>Comm Communication Rounds</span>
                    <span className="text-blue-400 font-extrabold">{form.fl_rounds} Rounds</span>
                  </label>
                  <input
                    type="range"
                    min={1}
                    max={50}
                    step={1}
                    value={form.fl_rounds}
                    onChange={(e) => setForm({ ...form, fl_rounds: parseInt(e.target.value) })}
                    className="accent-blue-500 bg-[#1E202E] rounded-lg h-1.5 cursor-pointer"
                  />
                  <span className="text-[10px] text-slate-500">Master FedAvg aggregation cycles</span>
                </div>

                <div className="flex flex-col gap-1.5 p-3 rounded-xl bg-[#12131C] border border-[#1E202E]">
                  <label className="font-bold text-slate-300 flex items-center justify-between">
                    <span>Local Epochs</span>
                    <span className="text-emerald-400 font-extrabold">{form.local_epochs} Epochs</span>
                  </label>
                  <input
                    type="range"
                    min={1}
                    max={10}
                    step={1}
                    value={form.local_epochs}
                    onChange={(e) => setForm({ ...form, local_epochs: parseInt(e.target.value) })}
                    className="accent-emerald-500 bg-[#1E202E] rounded-lg h-1.5 cursor-pointer"
                  />
                  <span className="text-[10px] text-slate-500">Gradient steps executed locally on edge</span>
                </div>
              </div>

              {/* Row 3: Sequence Length & Learning Rate */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5 p-3 rounded-xl bg-[#12131C] border border-[#1E202E]">
                  <label className="font-bold text-slate-300 flex items-center justify-between">
                    <span>Sequence Length (Window)</span>
                    <span className="text-purple-400 font-extrabold">{form.seq_length} Hours</span>
                  </label>
                  <input
                    type="range"
                    min={12}
                    max={48}
                    step={6}
                    value={form.seq_length}
                    onChange={(e) => setForm({ ...form, seq_length: parseInt(e.target.value) })}
                    className="accent-purple-500 bg-[#1E202E] rounded-lg h-1.5 cursor-pointer"
                  />
                  <span className="text-[10px] text-slate-500">Input sliding window for LSTM network</span>
                </div>

                <div className="flex flex-col gap-1.5 p-3 rounded-xl bg-[#12131C] border border-[#1E202E]">
                  <label className="font-bold text-slate-300 flex items-center justify-between">
                    <span>Learning Rate (Adam)</span>
                    <span className="text-emerald-400 font-extrabold">{form.learning_rate}</span>
                  </label>
                  <select
                    value={form.learning_rate}
                    onChange={(e) => setForm({ ...form, learning_rate: parseFloat(e.target.value) })}
                    className="bg-[#1B1D2A] border border-[#272A3C] text-slate-200 rounded-lg p-2 font-mono text-xs focus:outline-none focus:border-purple-500"
                  >
                    <option value={0.0001}>0.0001 (Slow, Stable)</option>
                    <option value={0.0005}>0.0005</option>
                    <option value={0.001}>0.001 (Standard)</option>
                    <option value={0.005}>0.005</option>
                    <option value={0.01}>0.01 (Fast)</option>
                  </select>
                  <span className="text-[10px] text-slate-500">Step size for weight optimization</span>
                </div>
              </div>

              {/* Row 4: Aggregation Algorithm */}
              <div className="flex flex-col gap-1.5 p-3 rounded-xl bg-[#12131C] border border-[#1E202E]">
                <label className="font-bold text-slate-300 flex items-center justify-between">
                  <span>Federated Aggregation Algorithm</span>
                  <span className="text-indigo-400 font-extrabold">{form.aggregation_alg}</span>
                </label>
                <div className="grid grid-cols-3 gap-2 mt-1">
                  {["FedAvg", "FedProx", "FedTrimmedMean"].map((alg) => (
                    <button
                      key={alg}
                      type="button"
                      onClick={() => setForm({ ...form, aggregation_alg: alg })}
                      className={`p-2 rounded-lg border text-xs font-bold transition-all ${
                        form.aggregation_alg === alg
                          ? "bg-purple-600/20 border-purple-500 text-purple-300"
                          : "bg-[#1B1D2A] border-[#272A3C] text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      {alg}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Modal Actions */}
          <div className="mt-2 pt-4 border-t border-[#1E202E] flex items-center justify-between">
            <button
              type="button"
              onClick={handleReset}
              disabled={loading || saving}
              className="h-9 px-3 rounded-xl bg-[#12131C] hover:bg-[#1A1C2A] text-slate-400 hover:text-white border border-[#202232] text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Defaults
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                disabled={saving}
                className="h-9 px-4 rounded-xl bg-[#12131C] hover:bg-[#1A1C2A] text-slate-300 hover:text-white border border-[#202232] text-xs font-semibold transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || saving}
                className="h-9 px-5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30 flex items-center gap-1.5 transition-colors disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5" />
                {saving ? "Saving to DB..." : "Save Configuration"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
