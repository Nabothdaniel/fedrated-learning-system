"use client";
import React, { Suspense } from "react";
import { SolarNodeDetail } from "@/components/ui/SolarNodeDetail";

export default function NodesPage() {
  return (
    <main className="p-8 flex flex-col gap-8 flex-1 w-full bg-[#08090D] overflow-y-auto">
      {/* Title Header */}
      <div className="flex flex-col gap-2 mb-2">
        <h1 className="text-2xl font-extrabold text-white tracking-tight">
          Distributed PV Sites
        </h1>
        <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
          Monitor the individual client states for all 5 participating solar farms. Local data remains entirely isolated on these nodes, where the LSTM models perform partial training epochs before transmitting parameters.
        </p>
      </div>

      {/* Nodes Detail Component */}
      <div>
        <Suspense fallback={<div className="h-96 w-full animate-pulse bg-[#12131C] rounded-2xl border border-[#1E202E]" />}>
          <SolarNodeDetail />
        </Suspense>
      </div>
    </main>
  );
}
