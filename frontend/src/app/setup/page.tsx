"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Target, Briefcase, TrendingUp, UploadCloud, FileText, ChevronRight, Building2, IndianRupee } from "lucide-react";
import Navbar from "@/components/Navbar";

const COMPANIES = ["TCS", "Infosys", "Wipro", "Accenture", "Capgemini", "Cognizant", "HCL", "Tech Mahindra"];
const LPA_OPTIONS = ["3-6 LPA", "6-12 LPA", "12-18 LPA", "18+ LPA"];

export default function SetupPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [jobRole, setJobRole] = useState("");
  const [company, setCompany] = useState("TCS");
  const [lpaCategory, setLpaCategory] = useState("3-6 LPA");
  const [experienceLevel, setExperienceLevel] = useState("fresher");
  const [acceptedRules, setAcceptedRules] = useState(false);

  useEffect(() => {
    const loggedIn = sessionStorage.getItem("isLoggedIn");
    if (!loggedIn) router.push("/login");
  }, [router]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) setResumeFile(e.target.files[0]);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files?.[0]) setResumeFile(e.dataTransfer.files[0]);
  };

  const handleStartInterview = async () => {
    setIsUploading(true);

    if (resumeFile) {
      const formData = new FormData();
      formData.append("resume", resumeFile);
      formData.append("job_role", jobRole || "Software Engineer");
      formData.append("experience_level", experienceLevel);
      try {
        await fetch("http://localhost:8000/api/interview/upload-resume", { method: "POST", body: formData });
      } catch (err) {
        console.error("Resume upload failed:", err);
      }
    }

    sessionStorage.setItem("jobRole", jobRole || "Software Engineer");
    sessionStorage.setItem("company", company);
    sessionStorage.setItem("lpaCategory", lpaCategory);
    sessionStorage.setItem("experienceLevel", experienceLevel);
    sessionStorage.setItem("hasResume", resumeFile ? "true" : "false");

    router.push("/dashboard");
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <div className="min-h-screen pb-20 bg-[#050505] relative overflow-hidden font-sans">
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-violet-600/10 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-cyan-600/10 rounded-full blur-[120px] pointer-events-none" />

      <motion.div
        className="max-w-4xl mx-auto px-6 mt-12 space-y-8 relative z-10"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        <motion.div variants={itemVariants} className="text-center mb-10">
          <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight mb-4 text-white">Create Mission Profile</h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Upload your resume and set your target role. Our AI will automatically generate your personalized 3-round interview journey.
          </p>
        </motion.div>

        <motion.div variants={itemVariants} className="glass-panel p-8 md:p-12">
          <div className="space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="flex items-center gap-2 text-sm font-bold text-slate-300 mb-3 uppercase tracking-wider">
                  <Building2 size={16} className="text-cyan-400" /> Target Company
                </label>
                <select
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className="w-full bg-[#0a0a0b] border border-white/10 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all text-base appearance-none cursor-pointer"
                >
                  {COMPANIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-bold text-slate-300 mb-3 uppercase tracking-wider">
                  <IndianRupee size={16} className="text-emerald-400" /> Package Range
                </label>
                <select
                  value={lpaCategory}
                  onChange={(e) => setLpaCategory(e.target.value)}
                  className="w-full bg-[#0a0a0b] border border-white/10 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all text-base appearance-none cursor-pointer"
                >
                  {LPA_OPTIONS.map((l) => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-bold text-slate-300 mb-3 uppercase tracking-wider">
                  <Briefcase size={16} className="text-violet-400" /> Target Job Role
                </label>
                <input
                  type="text"
                  value={jobRole}
                  onChange={(e) => setJobRole(e.target.value)}
                  placeholder="e.g. Senior Frontend Engineer"
                  className="w-full bg-[#0a0a0b] border border-white/10 rounded-xl px-5 py-4 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all text-base"
                />
              </div>
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-bold text-slate-300 mb-4 uppercase tracking-wider">
                <TrendingUp size={16} className="text-indigo-400" /> Experience Level
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { id: "fresher", label: "Fresher", sub: "0-2 years" },
                  { id: "mid-level", label: "Mid-Level", sub: "3-5 years" },
                  { id: "senior", label: "Senior", sub: "5+ years" },
                ].map((level) => (
                  <button
                    key={level.id}
                    onClick={() => setExperienceLevel(level.id)}
                    className={`p-6 rounded-xl border text-left transition-all ${
                      experienceLevel === level.id
                        ? "border-cyan-500 bg-cyan-500/10 ring-1 ring-cyan-500"
                        : "border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.05]"
                    }`}
                  >
                    <div className={`font-bold mb-1 ${experienceLevel === level.id ? "text-cyan-400" : "text-white"}`}>{level.label}</div>
                    <div className="text-sm text-slate-500">{level.sub}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="flex items-center gap-2 text-sm font-bold text-slate-300 uppercase tracking-wider">
                  <FileText size={16} className="text-emerald-400" /> Upload Resume
                </label>
                <span className="text-xs text-slate-500 font-bold bg-white/5 px-2 py-1 rounded-md border border-white/10">REQUIRED FOR ACCURACY</span>
              </div>

              <div
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`relative border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all duration-300 ${
                  isDragging
                    ? "border-cyan-500 bg-cyan-500/10 scale-[1.02]"
                    : resumeFile
                    ? "border-emerald-500/50 bg-emerald-500/10"
                    : "border-white/10 bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/20"
                }`}
              >
                <input ref={fileInputRef} type="file" accept=".pdf,.doc,.docx" onChange={handleFileChange} className="hidden" />

                {resumeFile ? (
                  <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
                    <div className="w-16 h-16 mx-auto bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-400 mb-4 border border-emerald-500/20">
                      <FileText size={32} />
                    </div>
                    <p className="text-lg font-bold text-white mb-1">{resumeFile.name}</p>
                    <p className="text-sm text-emerald-400 font-medium">Ready for AI Analysis</p>
                  </motion.div>
                ) : (
                  <div>
                    <div className="w-16 h-16 mx-auto bg-white/5 rounded-2xl flex items-center justify-center text-slate-500 mb-4 border border-white/10">
                      <UploadCloud size={32} />
                    </div>
                    <p className="text-base font-bold text-slate-300 mb-1">Drag & drop your resume</p>
                    <p className="text-sm text-slate-500">PDF or DOCX</p>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-8 border-t border-white/10">
              <label className="flex items-start gap-3 cursor-pointer mb-6">
                <input
                  type="checkbox"
                  checked={acceptedRules}
                  onChange={(e) => setAcceptedRules(e.target.checked)}
                  className="mt-1 w-4 h-4 text-cyan-600 bg-[#0a0a0b] border-white/20 rounded focus:ring-cyan-500 cursor-pointer"
                />
                <span className="text-sm font-semibold text-slate-300">I agree to follow the integrity rules and understand that malpractice detection is active during the 3-round interview process.</span>
              </label>

              <button
                onClick={handleStartInterview}
                disabled={isUploading || !acceptedRules}
                className="w-full py-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(6,182,212,0.25)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
              >
                {isUploading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Generating Journey Map...
                  </>
                ) : (
                  <>
                    Create Mission Profile <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
