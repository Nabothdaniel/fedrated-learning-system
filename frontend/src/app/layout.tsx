import type { Metadata } from "next";
import "./globals.css";
import { AppShell } from "@/components/ui/AppShell";

export const metadata: Metadata = {
  title: "SolarFL | Federated Learning Solar Forecasting",
  description: "Privacy-reserving distributed solar power forecasting simulation dashboard.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark h-full">
      <body className="bg-[#08090D] text-slate-100 min-h-full font-sans antialiased selection:bg-purple-500 selection:text-white flex min-h-screen">
        <AppShell>
          {children}
        </AppShell>
      </body>
    </html>
  );
}
