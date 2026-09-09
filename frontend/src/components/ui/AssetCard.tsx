import React from "react";
import { Card } from "./Card";
import { Badge } from "./Badge";
import { SparklineChart } from "./SparklineChart";
import { ArrowUpRight } from "lucide-react";

interface AssetCardProps {
  category: string;
  title: string;
  rewardRate: string;
  trendPct: string;
  isPositive: boolean;
  sparklineColor: "purple" | "yellow" | "red" | "green";
  sparklineData: number[];
  peakBadgeText?: string;
  icon: React.ReactNode;
}

export const AssetCard: React.FC<AssetCardProps> = ({
  category,
  title,
  rewardRate,
  trendPct,
  isPositive,
  sparklineColor,
  sparklineData,
  peakBadgeText,
  icon,
}) => {
  return (
    <Card className="flex flex-col justify-between gap-4 p-5 hover:border-purple-500/40">
      {/* Card Top Row */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#181A26] border border-[#2B2E42] flex items-center justify-center text-white shrink-0 shadow-inner">
            {icon}
          </div>
          <div>
            <p className="text-[11px] font-medium text-slate-400 tracking-wide uppercase">{category}</p>
            <h3 className="text-sm font-bold text-slate-100 tracking-tight">{title}</h3>
          </div>
        </div>

        <button className="w-8 h-8 rounded-full bg-[#181A26] hover:bg-[#25283B] text-slate-400 hover:text-white flex items-center justify-center border border-[#2B2E42] transition-colors">
          <ArrowUpRight className="w-4 h-4" />
        </button>
      </div>

      {/* Metric Rate & Trend Badge */}
      <div className="flex items-baseline justify-between mt-1">
        <div>
          <p className="text-[11px] font-medium text-slate-400">Reward Rate / Efficiency</p>
          <p className="text-2xl font-extrabold text-white tracking-tight">{rewardRate}</p>
        </div>
        <Badge variant={isPositive ? "success" : "danger"} trend={isPositive ? "up" : "down"}>
          {trendPct}
        </Badge>
      </div>

      {/* Glowing Sparkline Line Chart */}
      <div className="mt-1">
        <SparklineChart
          data={sparklineData}
          color={sparklineColor}
          peakBadgeText={peakBadgeText}
          height={85}
        />
      </div>
    </Card>
  );
};
