"use client";
import React, { useState, Suspense } from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { Toaster } from "sonner";
import { usePathname, useSearchParams } from "next/navigation";

export const AppShell = ({ children }: { children: React.ReactNode }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <>
      {/* Sonner Toaster */}
      <Toaster theme="dark" position="top-right" toastOptions={{
        className: 'bg-[#12131C] border border-[#2B2E42] text-slate-200 shadow-xl'
      }} />

      {/* Mobile Drawer Overlay */}
      <div 
        className={`fixed inset-0 bg-black/60 z-40 transition-opacity lg:hidden ${sidebarOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Sidebar Wrapper */}
      <div className={`fixed lg:static inset-y-0 left-0 z-50 transform transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} flex shrink-0`}>
        <Suspense fallback={<div className="w-64 bg-[#0B0C12] h-screen border-r border-[#191B28]" />}>
          {/* We pass an onClick wrapper so the sidebar closes when a user taps a link on mobile */}
          <div onClick={(e) => {
             // Close if they clicked a link tag
             if ((e.target as HTMLElement).closest('a')) {
               setSidebarOpen(false);
             }
          }}>
            <Sidebar />
          </div>
        </Suspense>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 relative h-screen overflow-hidden">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </div>
    </>
  );
};
