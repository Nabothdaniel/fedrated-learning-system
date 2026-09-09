"use client";
import React, { useState } from "react";
import { clsx } from "clsx";

interface TabItem {
  id: string;
  label: string;
  badge?: string;
}

interface PillTabsProps {
  tabs: TabItem[];
  defaultTabId?: string;
  onChange?: (tabId: string) => void;
}

export const PillTabs: React.FC<PillTabsProps> = ({
  tabs,
  defaultTabId,
  onChange,
}) => {
  const [activeTab, setActiveTab] = useState(defaultTabId || tabs[0]?.id);

  const handleTabClick = (id: string) => {
    setActiveTab(id);
    if (onChange) onChange(id);
  };

  return (
    <div className="inline-flex items-center p-1 bg-[#13141E] border border-[#202334] rounded-full">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => handleTabClick(tab.id)}
            className={clsx(
              "relative px-4 py-1.5 text-xs font-semibold rounded-full transition-all duration-200 flex items-center gap-1.5",
              isActive
                ? "bg-[#25283A] text-white shadow-md border border-[#343852]"
                : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
            )}
          >
            <span>{tab.label}</span>
            {tab.badge && (
              <span className="bg-purple-500/20 text-purple-300 text-[10px] px-1.5 py-0.2 rounded-full border border-purple-500/30">
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
