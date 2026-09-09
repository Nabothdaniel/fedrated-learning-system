import React from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "pill" | "dark";
  size?: "sm" | "md" | "lg";
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = "primary",
  size = "md",
  icon,
  iconPosition = "right",
  fullWidth = false,
  className,
  ...props
}) => {
  const baseStyles = "inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "purple-glow-btn text-white font-semibold rounded-xl",
    secondary: "bg-[#1E202E] hover:bg-[#282B3E] text-slate-200 border border-[#2E3248] rounded-xl",
    dark: "bg-[#14151E] hover:bg-[#1C1E2B] text-slate-200 border border-[#232636] rounded-xl",
    outline: "border border-purple-500/30 hover:border-purple-500/60 bg-purple-500/10 text-purple-300 rounded-xl",
    ghost: "bg-transparent hover:bg-white/5 text-slate-400 hover:text-white rounded-lg",
    pill: "bg-[#161823] hover:bg-[#1F2232] text-slate-300 border border-[#25283B] rounded-full text-xs font-semibold px-3 py-1.5",
  };

  const sizes = {
    sm: "text-xs px-3 py-1.5 gap-1.5",
    md: "text-sm px-4 py-2.5 gap-2",
    lg: "text-base px-6 py-3.5 gap-2.5",
  };

  return (
    <button
      className={twMerge(
        clsx(
          baseStyles,
          variants[variant],
          variant !== "pill" && sizes[size],
          fullWidth && "w-full",
          className
        )
      )}
      {...props}
    >
      {icon && iconPosition === "left" && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
      {icon && iconPosition === "right" && <span className="shrink-0">{icon}</span>}
    </button>
  );
};
