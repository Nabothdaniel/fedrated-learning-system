"use client";
import React from "react";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Zap, Database, Share2, Network, BrainCircuit, Activity } from "lucide-react";

export default function SystemOverviewPage() {
  const steps = [
    { title: "Local Solar Data", icon: <Database />, desc: "Historical weather and PV output per site." },
    { title: "Data Preprocessing", icon: <Activity />, desc: "Normalization and time-series sequencing." },
    { title: "Local LSTM Training", icon: <BrainCircuit />, desc: "Each site trains local model without sharing data." },
    { title: "Model Updates", icon: <Share2 />, desc: "Parameter updates sent to the cloud securely." },
    { title: "Federated Server (FedAvg)", icon: <Network />, desc: "Cloud server aggregates models using FedAvg." },
    { title: "Global Forecast Model", icon: <Zap />, desc: "Improved global model for distributed testing." }
  ];

  return (
    <main className="p-8 flex flex-col gap-8 flex-1 w-full bg-[#08090D] overflow-y-auto">
      {/* Title Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          System Overview
        </h1>
        <p className="text-sm text-slate-400 max-w-3xl leading-relaxed">
          The <strong>Federated Learning for Privacy-Preserving Distributed Solar Power Forecasting</strong> project allows multiple solar power sites to collaborate on building a high-accuracy forecasting model without ever sharing their raw, localized data.
        </p>
      </div>

      {/* Centralized vs Federated Approach */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6 border border-red-500/20 bg-red-500/5">
          <h2 className="text-lg font-bold text-red-400 mb-2 flex items-center gap-2">
            Centralized Approach
          </h2>
          <p className="text-xs text-slate-300 leading-relaxed mb-4">
            All participating solar sites must transmit their raw data to a central database where a single model is trained. This exposes proprietary site data and consumes immense bandwidth.
          </p>
          <Badge variant="danger">Privacy Risk</Badge>
        </Card>
        
        <Card className="p-6 border border-emerald-500/20 bg-emerald-500/5">
          <h2 className="text-lg font-bold text-emerald-400 mb-2 flex items-center gap-2">
            Federated Approach
          </h2>
          <p className="text-xs text-slate-300 leading-relaxed mb-4">
            Each site keeps its raw data strictly local, trains a deep learning model locally, and only communicates mathematical model updates to the federated server for aggregation.
          </p>
          <Badge variant="success">Privacy Preserving</Badge>
        </Card>
      </div>

      {/* 9-Step Flow Architecture */}
      <div>
        <h2 className="text-xl font-bold text-white mb-6">Federated Engine Workflow</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {steps.map((step, idx) => (
            <div key={idx} className="relative p-5 rounded-2xl bg-[#12131C] border border-[#1E202E] flex flex-col gap-3 group hover:border-purple-500/50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center">
                  {step.icon}
                </div>
                <span className="text-4xl font-black text-white/5 group-hover:text-purple-500/10 transition-colors">
                  0{idx + 1}
                </span>
              </div>
              <div>
                <h3 className="font-bold text-slate-200 text-sm mb-1">{step.title}</h3>
                <p className="text-xs text-slate-500">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
