import React, { useState } from "react";
import { Button } from "./Button";
import { Badge } from "./Badge";
import { Search, Bell, Settings, Command, Play, Menu } from "lucide-react";
import { ConfigModal } from "./ConfigModal";

export const Header: React.FC<{ onMenuClick?: () => void }> = ({ onMenuClick }) => {
  const [configOpen, setConfigOpen] = useState(false);

  return (
    <>
      <ConfigModal isOpen={configOpen} onClose={() => setConfigOpen(false)} />
      <header className="h-20 bg-[#08090D] border-b border-[#181A26] px-4 md:px-8 flex items-center justify-between sticky top-0 z-30 backdrop-blur-md bg-opacity-90">
        {/* Left User Profile Avatar & Name */}
        <div className="flex items-center gap-3 md:gap-4">
          {/* Mobile Hamburger Menu */}
          <button 
            onClick={onMenuClick}
            className="lg:hidden p-2 -ml-2 rounded-xl text-slate-400 hover:text-white hover:bg-[#1A1C2A] transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3 p-1.5 pr-4 rounded-full bg-[#12131C] border border-[#202232]">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-500 to-indigo-600 p-0.5 shadow-md">
              <div className="w-full h-full rounded-full bg-[#12131C] flex items-center justify-center text-xs font-bold text-emerald-300">
                U
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-slate-400 font-semibold">Lead Researcher</span>
                <Badge variant="purple">Local Sync</Badge>
              </div>
              <p className="text-xs font-extrabold text-white tracking-tight">System Admin</p>
            </div>
          </div>
        </div>

        {/* Right Action Icons & Search */}
        <div className="flex items-center gap-2 md:gap-3">
          {/* Search Bar */}
          <div className="relative hidden md:flex items-center">
            <input
              type="text"
              placeholder="Search Metrics..."
              className="w-44 lg:w-56 h-9 pl-9 pr-8 bg-[#12131C] border border-[#202232] rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-500/50 transition-all"
            />
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3" />
            <span className="absolute right-2.5 text-[10px] font-bold text-slate-500 bg-[#1A1C2A] px-1.5 py-0.5 rounded border border-[#282B3E] flex items-center">
              <Command className="w-2.5 h-2.5 mr-0.5" />K
            </span>
          </div>

          {/* Global Controls */}
          <a href="/global-model" className="h-9 px-3 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 flex items-center gap-1.5 text-xs font-semibold text-purple-300 hover:text-white transition-colors">
            <Play className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Launch Master Pipeline</span>
          </a>

          {/* Settings Toggle */}
          <button 
            onClick={() => setConfigOpen(true)}
            title="Open Admin Configuration DB"
            className="h-9 px-3 rounded-xl bg-[#12131C] hover:bg-[#1A1C2A] border border-[#202232] flex items-center gap-1.5 text-xs font-semibold text-slate-300 hover:text-white transition-colors"
          >
            <Settings className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>
    </>
  );
};
