"use client";
import React, { useId } from "react";

interface SparklineChartProps {
  data: number[];
  color?: "purple" | "yellow" | "red" | "green";
  peakBadgeText?: string;
  peakBadgePosition?: { xPct: number; yPct: number };
  height?: number;
}

export const SparklineChart: React.FC<SparklineChartProps> = ({
  data,
  color = "purple",
  peakBadgeText,
  height = 90,
}) => {
  const minVal = Math.min(...data);
  const maxVal = Math.max(...data);
  const range = maxVal - minVal || 1;

  const width = 320;
  const paddingY = 15;

  const points = data.map((val, idx) => {
    const x = (idx / (data.length - 1)) * width;
    const y = height - paddingY - ((val - minVal) / range) * (height - 2 * paddingY);
    return { x, y, val };
  });

  // Construct smooth SVG cubic bezier path
  let pathD = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const curr = points[i];
    const next = points[i + 1];
    const cpX = (curr.x + next.x) / 2;
    pathD += ` C ${cpX} ${curr.y}, ${cpX} ${next.y}, ${next.x} ${next.y}`;
  }

  const fillD = `${pathD} L ${width} ${height} L 0 ${height} Z`;

  const colorMap = {
    purple: {
      stroke: "#A855F7",
      fillStart: "rgba(168, 85, 247, 0.35)",
      fillEnd: "rgba(168, 85, 247, 0.0)",
      glow: "rgba(168, 85, 247, 0.6)",
      dot: "#C084FC",
    },
    yellow: {
      stroke: "#F59E0B",
      fillStart: "rgba(245, 158, 11, 0.35)",
      fillEnd: "rgba(245, 158, 11, 0.0)",
      glow: "rgba(245, 158, 11, 0.6)",
      dot: "#FBBF24",
    },
    red: {
      stroke: "#F43F5E",
      fillStart: "rgba(244, 63, 94, 0.35)",
      fillEnd: "rgba(244, 63, 94, 0.0)",
      glow: "rgba(244, 63, 94, 0.6)",
      dot: "#FB7185",
    },
    green: {
      stroke: "#10B981",
      fillStart: "rgba(16, 185, 129, 0.35)",
      fillEnd: "rgba(16, 185, 129, 0.0)",
      glow: "rgba(16, 185, 129, 0.6)",
      dot: "#34D399",
    },
  };

  const scheme = colorMap[color];
  const peakPoint = points[Math.floor(points.length * 0.75)] || points[points.length - 1];

  const baseId = useId();
  const gradientId = `spark-grad-${color}-${baseId.replace(/:/g, "")}`;

  return (
    <div className="relative w-full overflow-visible">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-auto overflow-visible"
        style={{ height: `${height}px` }}
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={scheme.fillStart} />
            <stop offset="100%" stopColor={scheme.fillEnd} />
          </linearGradient>
        </defs>

        {/* Dashed zero baseline */}
        <line
          x1="0"
          y1={height * 0.65}
          x2={width}
          y2={height * 0.65}
          stroke="#2A2D40"
          strokeWidth="1"
          strokeDasharray="4 4"
        />

        {/* Gradient Fill under curve */}
        <path d={fillD} fill={`url(#${gradientId})`} />

        {/* Glowing stroke path */}
        <path
          d={pathD}
          fill="none"
          stroke={scheme.stroke}
          strokeWidth="2.5"
          strokeLinecap="round"
          style={{
            filter: `drop-shadow(0px 4px 10px ${scheme.glow})`,
          }}
        />

        {/* Peak Dot indicator */}
        <circle
          cx={peakPoint.x}
          cy={peakPoint.y}
          r="4"
          fill={scheme.dot}
          stroke="#11121A"
          strokeWidth="2"
        />
      </svg>

      {/* Floating Peak Label Badge */}
      {peakBadgeText && (
        <div
          className="absolute text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#181A26] border border-[#2D3046] text-slate-200 shadow-lg pointer-events-none transform -translate-x-1/2 -translate-y-full"
          style={{
            left: `${(peakPoint.x / width) * 100}%`,
            top: `${(peakPoint.y / height) * 100 - 8}%`,
          }}
        >
          {peakBadgeText}
        </div>
      )}
    </div>
  );
};
