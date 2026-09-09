"use client";
import React, { useState, useEffect } from "react";
import { AssetCard } from "@/components/ui/AssetCard";
import { Badge } from "@/components/ui/Badge";
import { BarChart, LineChart } from "lucide-react";

export default function EvaluationPage() {
  const [metrics, setMetrics] = useState({
    avg_fl_mae: 2.45,
    avg_cent_mae: 2.89,
    avg_fl_rmse: 3.12,
    avg_fl_mape: 14.2,
    avg_fl_r2: 0.824,
    comm_rounds: 10,
    payload_size_mb: 2.4,
  });

  useEffect(() => {
    fetch("http://localhost:8000/api/history")
      .then((res) => res.json())
      .then((data) => {
        if (data.status === "success" && data.history && data.history.length > 0) {
          const lastRun = data.history[0];
          setMetrics((prev) => ({
            ...prev,
            avg_fl_mae: lastRun.avg_fl_mae ?? 2.45,
            avg_cent_mae: lastRun.avg_cent_mae ?? 2.89,
            avg_fl_r2: lastRun.avg_fl_r2 ?? 0.824,
            comm_rounds: lastRun.fl_rounds ?? 10,
            payload_size_mb: lastRun.cum_comm_mb ? parseFloat((lastRun.cum_comm_mb / (lastRun.num_sites * lastRun.fl_rounds)).toFixed(2)) : 2.4
          }));
        }
      })
      .catch((err) => console.error("Error fetching history from DB:", err));
  }, []);

  const baselineMAETrend = [35, 33, 34, 30, 32, 28, 26, 27, 24, 22, 23, 19, 18, 20, 16, 14, 15];
  const federatedMAETrend = [35, 32, 30, 28, 25, 24, 22, 20, 19, 18, 16, 15, 14, 13, 12, 11, 10]; 
  const r2ScoreTrend = [10, 12, 11, 14, 13, 16, 18, 17, 21, 23, 20, 24, 28, 25, 29, 32, 30, 34];

  return (
    <main className="p-8 flex flex-col gap-8 flex-1 w-full bg-[#08090D] overflow-y-auto">
      {/* Title Header */}
      <div className="flex flex-col gap-2 mb-2">
        <h1 className="text-2xl font-extrabold text-white tracking-tight">
          Research Evaluation Metrics
        </h1>
        <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
          Comprehensive performance evaluation comparing the Federated Learning approach strictly to the established Centralized baseline. Measurements include both Forecasting Accuracy error rates and Communication Bandwidth cost.
        </p>
      </div>

      <div className="flex flex-col gap-6">
        <div>
          <h2 className="text-lg font-bold text-white mb-4 border-b border-[#1E202E] pb-2 flex items-center gap-2">
            <LineChart className="w-5 h-5 text-purple-400" />
            Forecast Accuracy
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            <AssetCard
              category="Error Metric"
              title="Mean Absolute Error (MAE)"
              rewardRate={`${metrics.avg_fl_mae.toFixed(2)} MW`}
              trendPct="-5.67%"
              isPositive={true}
              sparklineColor="purple"
              sparklineData={federatedMAETrend}
              peakBadgeText="FL Acc"
              icon={<span className="text-lg">📉</span>}
            />
            <AssetCard
              category="Error Metric"
              title="Root Mean Sq Error (RMSE)"
              rewardRate={`${metrics.avg_fl_rmse.toFixed(2)} MW`}
              trendPct="-3.45%"
              isPositive={true}
              sparklineColor="purple"
              sparklineData={federatedMAETrend}
              peakBadgeText="FL Acc"
              icon={<span className="text-lg">📉</span>}
            />
            <AssetCard
              category="Error Metric"
              title="Mean Abs % Error (MAPE)"
              rewardRate={`${metrics.avg_fl_mape.toFixed(1)}%`}
              trendPct="-2.10%"
              isPositive={true}
              sparklineColor="yellow"
              sparklineData={baselineMAETrend}
              peakBadgeText="FL Acc"
              icon={<span className="text-lg">📉</span>}
            />
            <AssetCard
              category="Accuracy"
              title="R² Score"
              rewardRate={metrics.avg_fl_r2.toFixed(3)}
              trendPct="+6.25%"
              isPositive={true}
              sparklineColor="green"
              sparklineData={r2ScoreTrend}
              peakBadgeText="Max Fit"
              icon={<span className="text-lg">📈</span>}
            />
          </div>
        </div>

        <div>
          <h2 className="text-lg font-bold text-white mb-4 border-b border-[#1E202E] pb-2 flex items-center gap-2 mt-4">
            <BarChart className="w-5 h-5 text-amber-400" />
            Communication Cost
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            <div className="bg-[#12131C] border border-[#1E202E] p-5 rounded-2xl flex flex-col justify-between h-32">
              <span className="text-xs font-bold text-slate-400">Total Comm Rounds</span>
              <div className="flex items-end justify-between">
                <span className="text-3xl font-black text-amber-400">{metrics.comm_rounds}</span>
                <Badge variant="neutral">Fixed</Badge>
              </div>
            </div>
            
            <div className="bg-[#12131C] border border-[#1E202E] p-5 rounded-2xl flex flex-col justify-between h-32">
              <span className="text-xs font-bold text-slate-400">Payload Size (Per Client)</span>
              <div className="flex items-end justify-between">
                <span className="text-3xl font-black text-blue-400">{metrics.payload_size_mb} MB</span>
                <Badge variant="purple">Weights</Badge>
              </div>
            </div>

            <div className="bg-[#12131C] border border-[#1E202E] p-5 rounded-2xl flex flex-col justify-between h-32">
              <span className="text-xs font-bold text-slate-400">Total Bandwidth Used</span>
              <div className="flex items-end justify-between">
                <span className="text-3xl font-black text-red-400">{(metrics.payload_size_mb * 5 * metrics.comm_rounds).toFixed(1)} MB</span>
                <Badge variant="danger">Cumulative</Badge>
              </div>
            </div>
          </div>
        </div>

      </div>
    </main>
  );
}
