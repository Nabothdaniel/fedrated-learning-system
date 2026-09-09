import React from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { TrendingUp, TrendingDown } from "lucide-react";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "success" | "danger" | "purple" | "neutral" | "pro";
  trend?: "up" | "down";
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = "neutral",
  trend,
  className,
}) => {
  const baseStyles = "inline-flex items-center gap-1 font-semibold rounded-full text-xs px-2.5 py-0.5 tracking-tight";
  
  const variants = {
    success: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
    danger: "bg-rose-500/10 text-rose-400 border border-rose-500/20",
    purple: "bg-purple-500/15 text-purple-300 border border-purple-500/30",
    pro: "bg-purple-600 text-white font-extrabold text-[10px] px-1.5 py-0.2 rounded-md uppercase tracking-wider",
    neutral: "bg-slate-800/60 text-slate-300 border border-slate-700/50",
  };

  return (
    <span className={twMerge(clsx(baseStyles, variants[variant], className))}>
      {trend === "up" && <TrendingUp className="w-3 h-3 text-emerald-400" />}
      {trend === "down" && <TrendingDown className="w-3 h-3 text-rose-400" />}
      {children}
    </span>
  );
};
