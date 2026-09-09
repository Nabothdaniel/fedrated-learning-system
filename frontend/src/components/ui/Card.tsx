import React from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: "default" | "glass" | "promo" | "dark";
  glowOnHover?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = "default",
  glowOnHover = true,
  className,
  ...props
}) => {
  const baseStyles = "rounded-2xl p-5 relative overflow-hidden transition-all duration-300";
  
  const variants = {
    default: "bg-[#11121A] border border-[#1E202E]",
    dark: "bg-[#0E0F16] border border-[#1A1C28]",
    glass: "glass-panel",
    promo: "promo-gradient-card",
  };

  return (
    <div
      className={twMerge(
        clsx(
          baseStyles,
          variants[variant],
          glowOnHover && variant === "default" && "hover:border-purple-500/35 hover:shadow-[0_10px_30px_-10px_rgba(139,92,246,0.2)]",
          className
        )
      )}
      {...props}
    >
      {children}
    </div>
  );
};
