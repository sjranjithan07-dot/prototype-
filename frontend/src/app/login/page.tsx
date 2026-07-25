"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Bot, Loader2, Target, GitBranch, Key } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [provider, setProvider] = useState<"google" | "github" | "email" | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [email, setEmail] = useState("");

  const simulateOAuth = (providerName: string) => {
    setProvider(providerName as any);
    // Open the simulated popup
  };

  const handleOAuthSubmit = () => {
    setIsAuthenticating(true);
    setTimeout(() => {
      sessionStorage.setItem("isLoggedIn", "true");
      sessionStorage.setItem("userEmail", email || `user@${provider}.com`);
      sessionStorage.setItem("userName", email ? email.split("@")[0] : `${provider} User`);
      sessionStorage.setItem("loginProvider", provider!);
      router.push("/setup");
    }, 1500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050505] p-4 relative overflow-hidden font-sans">
      
      {/* Background Glows */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-violet-600/10 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-cyan-600/10 rounded-full blur-[150px] pointer-events-none" />

      {/* Logo */}
      <div className="absolute top-8 left-8">
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-cyan-500 flex items-center justify-center">
            <Target size={18} className="text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white">InterviewCoach</span>
        </Link>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm relative z-10"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-6 shadow-2xl">
             <Key className="text-violet-400" size={28} />
          </div>
          <h2 className="text-3xl font-extrabold text-white mb-2 tracking-tight">Welcome Back</h2>
          <p className="text-slate-400 text-sm">Sign in to continue your interview journey</p>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => simulateOAuth("google")}
            className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-100 text-gray-900 font-bold py-3.5 px-5 rounded-xl transition-all shadow-lg"
          >
            <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>

          <button
            onClick={() => simulateOAuth("github")}
            className="w-full flex items-center justify-center gap-3 bg-[#24292e] hover:bg-[#1b1f23] text-white font-bold py-3.5 px-5 rounded-xl transition-all shadow-lg border border-white/5"
          >
            <GitBranch size={18} />
            Continue with GitHub
          </button>
        </div>

      </motion.div>

      {/* Simulated OAuth Popup */}
      <AnimatePresence>
        {provider && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="bg-slate-50 border-b border-slate-200 p-4 flex items-center justify-between">
                 <div className="flex items-center gap-2">
                    {provider === 'google' ? (
                        <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                    ) : (
                        <GitBranch size={20} className="text-slate-800" />
                    )}
                    <span className="font-bold text-slate-800 capitalize">Sign in with {provider}</span>
                 </div>
                 <button onClick={() => !isAuthenticating && setProvider(null)} className="text-slate-400 hover:text-slate-600">
                    ✕
                 </button>
              </div>

              <div className="p-6">
                 {isAuthenticating ? (
                    <div className="flex flex-col items-center justify-center py-8">
                       <Loader2 className="w-10 h-10 text-blue-500 animate-spin mb-4" />
                       <p className="text-slate-600 font-medium">Authenticating...</p>
                    </div>
                 ) : (
                    <div className="space-y-4">
                       <div>
                          <label className="block text-sm font-bold text-slate-700 mb-1">Email or phone</label>
                          <input 
                            type="email"
                            autoFocus
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            className="w-full border border-slate-300 rounded-lg px-4 py-3 text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                          />
                       </div>
                       <button 
                          onClick={handleOAuthSubmit}
                          disabled={!email}
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-colors disabled:opacity-50"
                       >
                          Next
                       </button>
                    </div>
                 )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
