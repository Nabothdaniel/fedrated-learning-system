"use client";
import React from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import {
  LayoutDashboard,
  Building2,
  Calculator,
  Zap,
  ChevronsUpDown,
} from "lucide-react";

import { ConfigModal } from "./ConfigModal";

export const Sidebar: React.FC = () => {
  const [configOpen, setConfigOpen] = React.useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentId = searchParams.get("id") || "site_0";

  const navItems = [
    { href: "/", label: "System Overview", icon: <LayoutDashboard className="w-4 h-4" /> },
    { href: "/nodes", label: "Distributed PV Sites", icon: <Building2 className="w-4 h-4" /> },
    { href: "/global-model", label: "Federated Averaging", icon: <Calculator className="w-4 h-4" /> },
    { href: "/evaluation", label: "Research Evaluation", icon: <Zap className="w-4 h-4" /> },
  ];

  const activeNodes = [
    { id: "site_0", name: "Solar Farm CA-1", status: "Active", icon: "☀️", color: "bg-amber-500/20" },
    { id: "site_1", name: "Solar Farm TX-2", status: "Active", icon: "☀️", color: "bg-amber-500/20" },
    { id: "site_2", name: "Solar Farm NV-3", status: "Syncing", icon: "⏳", color: "bg-blue-500/20" },
    { id: "site_3", name: "Solar Farm AZ-4", status: "Active", icon: "☀️", color: "bg-amber-500/20" },
  ];

  return (
    <>
      <ConfigModal isOpen={configOpen} onClose={() => setConfigOpen(false)} />
      <aside className="w-64 bg-[#0B0C12] border-r border-[#191B28] p-5 flex flex-col justify-between shrink-0 h-screen sticky top-0 overflow-y-auto">
        <div className="flex flex-col gap-6">
          {/* Brand Logo Header */}
          <div className="flex items-center justify-between pb-2 border-b border-[#181A26]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center text-white font-extrabold text-sm shadow-md">
                S
              </div>
              <div>
                <h1 className="font-extrabold text-sm text-white tracking-tight leading-tight flex items-center gap-1">
                  SolarFL<sup>®</sup>
                </h1>
                <p className="text-[10px] text-slate-400 font-medium">Federated Learning</p>
              </div>
            </div>
            <button className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/5">
              <ChevronsUpDown className="w-4 h-4" />
            </button>
          </div>

          {/* Primary Navigation Menu */}
          <nav className="flex flex-col gap-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center justify-between transition-all duration-200 ${
                    isActive
                      ? "bg-[#181A27] text-white border border-[#2B2E42] shadow-sm"
                      : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={isActive ? "text-purple-400" : "text-slate-500"}>
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </div>
                </Link>
              );
            })}
          </nav>

          {/* Active Nodes List */}
          <div className="pt-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-400 mb-3 px-1">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                Active Solar Nodes
              </span>
              <span className="text-[10px] bg-[#181A27] px-2 py-0.5 rounded-full text-purple-400 border border-[#272A3D]">
                5
              </span>
            </div>

            <div className="flex flex-col gap-2">
              {activeNodes.map((node) => {
                const isNodeActive = pathname === "/nodes" && currentId === node.id;
                return (
                  <Link
                    key={node.id}
                    href={`/nodes?id=${node.id}`}
                    className={`p-2.5 rounded-xl border flex items-center justify-between text-xs transition-colors group cursor-pointer ${
                      isNodeActive 
                        ? "bg-[#181A27] border-amber-500/50" 
                        : "bg-[#12131C] border-[#1E202E] hover:border-amber-500/30"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-sm">{node.icon}</span>
                      <div>
                        <p className={`font-bold text-[11px] ${isNodeActive ? "text-white" : "text-slate-200 group-hover:text-white"}`}>
                          {node.name}
                        </p>
                        <p className="text-[10px] text-slate-400 font-medium">Status: <span className="text-slate-200 font-bold">{node.status}</span></p>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        {/* Bottom Global Run CTA Card */}
        <div 
          onClick={() => setConfigOpen(true)}
          className="mt-6 p-3.5 rounded-xl bg-gradient-to-r from-[#261d17] to-[#332517] border border-amber-500/30 flex items-center justify-between cursor-pointer hover:border-amber-500/60 transition-colors"
          title="Click to open Admin Hyperparameter Configuration DB"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-600/30 text-amber-400 border border-amber-500/40 flex items-center justify-center shrink-0">
              <Zap className="w-4 h-4 fill-current" />
            </div>
            <div>
              <p className="text-xs font-extrabold text-white">Engine Config</p>
              <p className="text-[10px] text-slate-400">Manage FL Hyperparams</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
