"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, Variants } from "framer-motion";
import { Eye, Target, MessageSquare, Lightbulb, TrendingUp, ChevronRight, Activity, User } from "lucide-react";

export default function ProfilePage() {
  const router = useRouter();
  const [report, setReport] = useState<any>(null);
  const [user, setUser] = useState({ name: "", email: "" });

  useEffect(() => {
    const loggedIn = sessionStorage.getItem("isLoggedIn");
    if (!loggedIn) { router.push("/login"); return; }
    
    setUser({
        name: sessionStorage.getItem("userName") || "User",
        email: sessionStorage.getItem("userEmail") || "No email provided"
    });

    const saved = sessionStorage.getItem("interviewReport");
    if (saved) {
      setReport(JSON.parse(saved));
    } else {
      setReport({
        overall_score: 0,
        confidence_score: 0,
        communication_score: 0,
        eye_contact_score: 0,
        look_away_count: 0,
        filler_words_count: 0,
        suggestions: ["No interview data found. Please complete the HR round first."],
        upskill_roadmap: []
      });
    }
  }, [router]);

  if (!report) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-[#050505]">
        <Activity className="w-12 h-12 text-cyan-500 animate-pulse mb-4" />
        <p className="text-slate-400 font-medium tracking-wide">Loading Profile...</p>
      </div>
    );
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-emerald-400";
    if (score >= 75) return "text-cyan-400";
    if (score >= 60) return "text-amber-400";
    return "text-rose-400";
  };

  const overallColor = getScoreColor(report.overall_score);

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.15 } }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <div className="min-h-screen pb-20 bg-[#050505] relative overflow-hidden">
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-violet-600/10 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute top-[30%] right-[-10%] w-[500px] h-[500px] bg-cyan-600/10 rounded-full blur-[120px] pointer-events-none" />

      <motion.div
        className="max-w-6xl mx-auto px-6 mt-12 space-y-8 relative z-10"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        {/* User Info Header */}
        <motion.div variants={itemVariants} className="glass-panel p-8 flex items-center gap-6">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-violet-600 to-cyan-500 flex items-center justify-center shadow-lg border-2 border-white/20">
                <span className="text-3xl font-bold text-white">{user.name.charAt(0).toUpperCase()}</span>
            </div>
            <div>
                <h1 className="text-3xl font-bold text-white">{user.name}</h1>
                <p className="text-slate-400">{user.email}</p>
            </div>
        </motion.div>

        <motion.div variants={itemVariants} className="glass-panel p-10 lg:p-12 flex flex-col md:flex-row items-center justify-between gap-12 relative overflow-hidden">
          <div className="relative z-10 text-center md:text-left flex-1">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-xs font-bold uppercase tracking-widest text-cyan-400 mb-6">
              <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
              HR Round Analysis
            </div>
            <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight mb-4 text-white">Performance Report</h1>
            <p className="text-lg text-slate-400 max-w-lg leading-relaxed">
              Detailed breakdown of your latest mock HR interview. Review your metrics to see where you can improve.
            </p>
          </div>

          <div className="relative z-10 shrink-0 text-center glass-card p-8 rounded-full flex flex-col items-center justify-center w-56 h-56">
            <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle className="text-white/10 stroke-current" strokeWidth="6" cx="50" cy="50" r="44" fill="transparent" />
              <circle
                className={`${overallColor} stroke-current transition-all duration-1000 ease-out`}
                strokeWidth="6"
                strokeLinecap="round"
                cx="50"
                cy="50"
                r="44"
                fill="transparent"
                strokeDasharray={`${report.overall_score * 2.76}, 300`}
              />
            </svg>
            <div className={`text-6xl font-black ${overallColor}`}>{report.overall_score}</div>
            <p className="text-xs text-slate-500 uppercase tracking-widest mt-2 font-bold">Overall Score</p>
          </div>
        </motion.div>

        <motion.div variants={containerVariants} className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div variants={itemVariants} className="glass-card p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-400 border border-cyan-500/20"><Eye size={20} /></div>
              <h3 className="text-slate-200 font-semibold text-lg">Eye Contact</h3>
            </div>
            <div className="text-4xl font-black text-white mb-2">{report.eye_contact_score}<span className="text-2xl text-slate-500">%</span></div>
            <p className="text-sm text-slate-400 font-medium">Looked away <span className="text-white font-bold">{report.look_away_count}</span> times</p>
          </motion.div>

          <motion.div variants={itemVariants} className="glass-card p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-violet-500/10 flex items-center justify-center text-violet-400 border border-violet-500/20"><Target size={20} /></div>
              <h3 className="text-slate-200 font-semibold text-lg">Confidence</h3>
            </div>
            <div className="text-4xl font-black text-white mb-2">{report.confidence_score}<span className="text-2xl text-slate-500">%</span></div>
            <p className="text-sm text-slate-400 font-medium">Used <span className="text-white font-bold">{report.filler_words_count}</span> filler words</p>
          </motion.div>

          <motion.div variants={itemVariants} className="glass-card p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20"><MessageSquare size={20} /></div>
              <h3 className="text-slate-200 font-semibold text-lg">Communication</h3>
            </div>
            <div className="text-4xl font-black text-white mb-2">{report.communication_score}<span className="text-2xl text-slate-500">%</span></div>
            <p className="text-sm text-slate-400 font-medium">Based on LLM STAR analysis</p>
          </motion.div>
        </motion.div>

        <motion.div variants={containerVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <motion.div variants={itemVariants} className="glass-panel p-8">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-3 text-white">
              <div className="p-2 bg-amber-500/10 text-amber-400 rounded-lg border border-amber-500/20"><Lightbulb size={18} /></div>
              Quick Suggestions
            </h2>
            <ul className="space-y-4">
              {report.suggestions.map((s: string, idx: number) => (
                <li key={idx} className="flex items-start gap-4 p-4 rounded-xl bg-white/[0.03] border border-white/10 hover:bg-white/[0.05] transition-colors">
                  <div className="mt-0.5 w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30 text-xs font-bold">✓</div>
                  <span className="text-slate-400 leading-relaxed text-sm">{s}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div variants={itemVariants} className="glass-panel p-8">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-3 text-white">
              <div className="p-2 bg-violet-500/10 text-violet-400 rounded-lg border border-violet-500/20"><TrendingUp size={18} /></div>
              30-Day Upskill Roadmap
            </h2>
            <div className="relative border-l-2 border-white/10 ml-4 space-y-6 pb-2">
              {report.upskill_roadmap.map((step: string, idx: number) => {
                const parts = step.split(": ");
                const title = parts[0] || `Step ${idx + 1}`;
                const desc = parts[1] || step;

                return (
                  <div key={idx} className="relative pl-6">
                    <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-[#050505] border-[3px] border-violet-500" />
                    <div className="font-bold text-white mb-1 text-sm flex items-center gap-2">
                      {title}
                      <ChevronRight size={14} className="text-slate-500" />
                    </div>
                    <div className="text-slate-400 text-sm bg-white/[0.03] p-3 rounded-xl border border-white/10 leading-relaxed">{desc}</div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
}
