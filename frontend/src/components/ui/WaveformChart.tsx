"use client";
import React, { useState } from "react";
import { Play, Pause } from "lucide-react";

export const WaveformChart: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);

  // Generate 45 waveform bars
  const bars = [
    12, 18, 25, 14, 30, 42, 28, 16, 22, 35,
    50, 38, 24, 45, 60, 52, 34, 20, 28, 40,
    55, 72, 64, 48, 30, 22, 36, 50, 42, 28,
    38, 46, 32, 20, 15, 24, 35, 28, 18, 14,
    22, 16, 12, 18, 10
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-slate-200">Investment Period / Solar Forecast</h3>
          <p className="text-xs text-slate-400">Contribution Period (Month / Epochs)</p>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-[#1C1E2B] text-slate-300 border border-[#2B2E42]">
            4 Month
          </span>
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-[#292D42] text-white border border-purple-500/40">
            6 Month
          </span>
        </div>
      </div>

      {/* Waveform Bar Track */}
      <div className="relative py-4 px-2 bg-[#0E0F17] rounded-xl border border-[#1A1C29] flex items-center justify-between gap-1 overflow-hidden h-24">
        {bars.map((height, i) => (
          <div
            key={i}
            className={`w-1 rounded-full transition-all duration-300 ${
              i > 15 && i < 28
                ? "bg-gradient-to-t from-purple-600 to-indigo-400 shadow-[0_0_8px_rgba(168,85,247,0.5)]"
                : "bg-[#25283B]"
            }`}
            style={{ height: `${height}%` }}
          />
        ))}

        {/* Floating Seeker Scrub Indicator */}
        <div className="absolute left-[50%] top-0 bottom-0 flex flex-col items-center justify-center">
          <div className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-600 text-white shadow-lg mb-1 border border-purple-400/50">
            4 Month
          </div>
          <div className="w-0.5 h-full bg-purple-500 shadow-[0_0_10px_#A855F7]" />
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="w-7 h-7 rounded-full bg-purple-600 hover:bg-purple-500 text-white flex items-center justify-center shadow-lg transform translate-y-2 border border-purple-300/40 transition-transform active:scale-95"
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current ml-0.5" />}
          </button>
        </div>
      </div>
    </div>
  );
};
