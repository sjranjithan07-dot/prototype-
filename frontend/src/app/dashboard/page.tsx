"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, Variants } from "framer-motion";
import { BrainCircuit, Code2, Video, CheckCircle2, Lock, ArrowRight, PlayCircle } from "lucide-react";
import Link from "next/link";

export default function Dashboard() {
  const router = useRouter();
  const [userName, setUserName] = useState("");
  const [status, setStatus] = useState({
     r1Pass: false,
     r2Pass: false,
     r3Done: false
  });

  useEffect(() => {
    const loggedIn = sessionStorage.getItem("isLoggedIn");
    if (!loggedIn) { router.push("/login"); return; }
    setUserName(sessionStorage.getItem("userName") || "Candidate");

    const r1 = JSON.parse(sessionStorage.getItem("round1Result") || "null");
    const r2 = JSON.parse(sessionStorage.getItem("round2Result") || "null");
    const r3 = sessionStorage.getItem("interviewReport");

    setStatus({
       r1Pass: r1?.passed || false,
       r2Pass: r2?.passed || false,
       r3Done: !!r3
    });
  }, [router]);

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.15 } }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <div className="min-h-screen bg-[#050505] relative overflow-hidden font-sans">
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-violet-600/10 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-cyan-600/10 rounded-full blur-[120px] pointer-events-none" />

      <motion.div
        className="max-w-5xl mx-auto px-6 py-16 relative z-10"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        <motion.div variants={itemVariants} className="mb-16 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-xs font-bold uppercase tracking-widest text-violet-400 mb-6">
              Mission Control
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight">Welcome, {userName}</h1>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">Complete your 3-stage interview journey. Pass each round to unlock the next level.</p>
        </motion.div>

        <motion.div variants={containerVariants} className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
            
            {/* Connecting Line behind cards on desktop */}
            <div className="hidden md:block absolute top-1/2 left-10 right-10 h-0.5 bg-white/5 -translate-y-1/2 z-0" />

            {/* Round 1 */}
            <motion.div variants={itemVariants} className={`relative z-10 bg-[#121214] border ${status.r1Pass ? 'border-emerald-500/30' : 'border-violet-500/30'} rounded-3xl p-8 flex flex-col items-center text-center shadow-2xl transition-all hover:-translate-y-2`}>
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-lg ${status.r1Pass ? 'bg-emerald-500/20 text-emerald-400' : 'bg-violet-500/20 text-violet-400'}`}>
                    <BrainCircuit size={32} />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Aptitude Test</h2>
                <p className="text-sm text-slate-400 mb-8 flex-1">Test your logical, quantitative, and verbal reasoning skills.</p>
                
                {status.r1Pass ? (
                    <div className="w-full py-3 rounded-xl bg-emerald-500/10 text-emerald-400 font-bold flex items-center justify-center gap-2 border border-emerald-500/20">
                        <CheckCircle2 size={18} /> Passed
                    </div>
                ) : (
                    <Link href="/interview/aptitude" className="w-full py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold flex items-center justify-center gap-2 transition-colors">
                        <PlayCircle size={18} /> Start Round 1
                    </Link>
                )}
            </motion.div>

            {/* Round 2 */}
            <motion.div variants={itemVariants} className={`relative z-10 bg-[#121214] border ${status.r2Pass ? 'border-emerald-500/30' : status.r1Pass ? 'border-cyan-500/30' : 'border-white/5 opacity-50 grayscale'} rounded-3xl p-8 flex flex-col items-center text-center shadow-2xl transition-all ${status.r1Pass ? 'hover:-translate-y-2' : ''}`}>
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-lg ${status.r2Pass ? 'bg-emerald-500/20 text-emerald-400' : status.r1Pass ? 'bg-cyan-500/20 text-cyan-400' : 'bg-white/5 text-slate-500'}`}>
                    <Code2 size={32} />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Coding Round</h2>
                <p className="text-sm text-slate-400 mb-8 flex-1">Write clean, optimized Python code to solve technical challenges.</p>
                
                {status.r2Pass ? (
                    <div className="w-full py-3 rounded-xl bg-emerald-500/10 text-emerald-400 font-bold flex items-center justify-center gap-2 border border-emerald-500/20">
                        <CheckCircle2 size={18} /> Passed
                    </div>
                ) : status.r1Pass ? (
                    <Link href="/interview/coding" className="w-full py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold flex items-center justify-center gap-2 transition-colors">
                        <PlayCircle size={18} /> Start Round 2
                    </Link>
                ) : (
                    <div className="w-full py-3 rounded-xl bg-white/5 text-slate-500 font-bold flex items-center justify-center gap-2 border border-white/5">
                        <Lock size={18} /> Locked
                    </div>
                )}
            </motion.div>

            {/* Round 3 */}
            <motion.div variants={itemVariants} className={`relative z-10 bg-[#121214] border ${status.r3Done ? 'border-emerald-500/30' : status.r2Pass ? 'border-rose-500/30' : 'border-white/5 opacity-50 grayscale'} rounded-3xl p-8 flex flex-col items-center text-center shadow-2xl transition-all ${status.r2Pass ? 'hover:-translate-y-2' : ''}`}>
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-lg ${status.r3Done ? 'bg-emerald-500/20 text-emerald-400' : status.r2Pass ? 'bg-rose-500/20 text-rose-400' : 'bg-white/5 text-slate-500'}`}>
                    <Video size={32} />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">HR Interview</h2>
                <p className="text-sm text-slate-400 mb-8 flex-1">Face-to-face AI interview tracking eye contact and confidence.</p>
                
                {status.r3Done ? (
                    <Link href="/profile" className="w-full py-3 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center gap-2 border border-emerald-500/20 transition-colors">
                        View Report <ArrowRight size={18} />
                    </Link>
                ) : status.r2Pass ? (
                    <Link href="/interview" className="w-full py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold flex items-center justify-center gap-2 transition-colors">
                        <PlayCircle size={18} /> Final Round
                    </Link>
                ) : (
                    <div className="w-full py-3 rounded-xl bg-white/5 text-slate-500 font-bold flex items-center justify-center gap-2 border border-white/5">
                        <Lock size={18} /> Locked
                    </div>
                )}
            </motion.div>

        </motion.div>
      </motion.div>
    </div>
  );
}
