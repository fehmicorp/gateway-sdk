import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import SidebarNav from "@/components/sidebar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "fehmi_ha-vrrp Control Panel",
  description: "HAProxy & VRRP Cluster Management Engine",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex bg-slate-950 text-slate-100 font-sans">
        {/* Navigation Sidebar */}
        <aside className="w-64 border-r border-slate-800 bg-slate-900 flex flex-col justify-between p-4 hidden md:flex">
          <div className="space-y-6">
            <div className="flex items-center gap-2 px-2">
              <div className="h-3 w-3 rounded-full bg-blue-500 animate-pulse" />
              <span className="font-mono font-bold text-lg tracking-wider text-white">
                fehmi_ha-vrrp
              </span>
            </div>
            <SidebarNav/>
          </div>

          <div className="px-2 py-3 border-t border-slate-800 text-xs text-slate-500 font-mono">
            DataPlane API: <span className="text-emerald-400">CONNECTED</span>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-16 border-b border-slate-800 bg-slate-900/50 backdrop-blur px-6 flex items-center justify-between">
            <h1 className="font-semibold text-slate-200 text-sm md:text-base">
              HAProxy Cluster Gateway Engine
            </h1>
            <div className="flex items-center gap-3">
              <span className="text-xs bg-slate-800 border border-slate-700 px-2.5 py-1 rounded-md font-mono text-slate-300">
                VIP: 192.168.1.100
              </span>
            </div>
          </header>
          <main className="flex-1 overflow-y-auto p-6">{children}</main>
        </div>
      </body>
    </html>
  );
}