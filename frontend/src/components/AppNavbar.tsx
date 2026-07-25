"use client";

import Link from "next/link";
import { Bot, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

interface AppNavbarProps {
  showDashboard?: boolean;
  showSetup?: boolean;
  showLogout?: boolean;
}

export default function AppNavbar({
  showDashboard = false,
  showSetup = false,
  showLogout = false,
}: AppNavbarProps) {
  const router = useRouter();

  return (
    <nav className="w-full z-50 bg-[#050505]/80 backdrop-blur-md border-b border-white/5 py-4 sticky top-0">
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-cyan-500 flex items-center justify-center">
            <Bot size={18} className="text-white" />
          </div>
          <span className="text-lg font-bold tracking-tight text-white">InterviewCoach</span>
        </Link>

        <div className="flex items-center gap-3">
          {showDashboard && (
            <Link
              href="/dashboard"
              className="text-sm font-semibold text-slate-300 hover:text-white px-4 py-2 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition-all"
            >
              Dashboard
            </Link>
          )}
          {showSetup && (
            <Link
              href="/setup"
              className="text-sm font-semibold bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-5 py-2 rounded-full hover:opacity-90 transition-all shadow-[0_0_15px_rgba(6,182,212,0.25)]"
            >
              New Interview
            </Link>
          )}
          {showLogout && (
            <button
              onClick={() => {
                sessionStorage.clear();
                router.push("/login");
              }}
              className="flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-rose-400 px-4 py-2 rounded-lg border border-white/10 bg-white/5 hover:border-rose-500/30 transition-all"
            >
              <LogOut size={16} /> Logout
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
