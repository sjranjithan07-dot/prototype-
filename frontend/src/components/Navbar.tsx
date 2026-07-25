"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Target, User, LogOut, Settings } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [userName, setUserName] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const loggedIn = sessionStorage.getItem("isLoggedIn");
    const name = sessionStorage.getItem("userName");
    setIsLoggedIn(!!loggedIn);
    if (name) setUserName(name);
  }, []);

  const handleLogout = () => {
    sessionStorage.clear();
    router.push("/login");
  };

  if (!isLoggedIn) return null; // Don't show navbar on login/landing if not logged in

  return (
    <nav className="w-full bg-[#121214]/80 backdrop-blur-md border-b border-white/10 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-cyan-500 flex items-center justify-center shadow-lg">
            <Target size={18} className="text-white" />
          </div>
          <span className="text-lg font-bold tracking-tight text-white hidden sm:block">InterviewCoach</span>
        </Link>

        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="text-sm font-semibold text-slate-300 hover:text-white transition-colors">Dashboard</Link>
          <Link href="/setup" className="text-sm font-semibold text-slate-300 hover:text-white transition-colors">New Session</Link>
          
          {/* Profile Dropdown */}
          <div className="relative">
            <button 
              onClick={() => setIsOpen(!isOpen)}
              className="flex items-center justify-center w-10 h-10 rounded-full bg-slate-800 border border-white/10 hover:border-white/30 transition-all focus:outline-none"
            >
              <span className="text-white font-bold">{userName ? userName.charAt(0).toUpperCase() : <User size={18} />}</span>
            </button>

            <AnimatePresence>
              {isOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-56 bg-[#1a1a1c] border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50"
                  >
                    <div className="p-4 border-b border-white/10">
                      <p className="text-white font-bold truncate">{userName || "User"}</p>
                      <p className="text-xs text-slate-500 truncate">{sessionStorage.getItem("userEmail") || "No email"}</p>
                    </div>
                    <div className="p-2 space-y-1">
                      <Link href="/profile" onClick={() => setIsOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-colors">
                        <User size={16} /> My Profile
                      </Link>
                      <Link href="/profile" onClick={() => setIsOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-colors">
                        <Settings size={16} /> Settings
                      </Link>
                    </div>
                    <div className="p-2 border-t border-white/10">
                      <button 
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors"
                      >
                        <LogOut size={16} /> Sign out
                      </button>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </nav>
  );
}
