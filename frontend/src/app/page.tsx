import Link from "next/link";
import { ArrowRight, BrainCircuit, Code2, Video, Target, ShieldCheck, Sparkles } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans overflow-hidden">
      
      {/* Background Ambience */}
      <div className="absolute top-[-20%] left-[-10%] w-[800px] h-[800px] bg-violet-600/15 rounded-full blur-[200px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-cyan-600/15 rounded-full blur-[150px] pointer-events-none" />

      {/* Hero Section */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 pt-24 pb-32">
        <div className="text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm font-bold text-slate-300 mb-8 backdrop-blur-sm">
            <Sparkles size={16} className="text-violet-400" />
            The Future of Interview Prep is Here
          </div>
          
          <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-8 leading-[1.1]">
            Master Your Interviews with <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-cyan-400 to-emerald-400">
              AI-Powered Simulation
            </span>
          </h1>
          
          <p className="text-xl text-slate-400 mb-12 max-w-2xl mx-auto leading-relaxed">
            Upload your resume, select your dream company, and experience a hyper-realistic 3-round interview process evaluated by advanced AI.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              href="/login" 
              className="px-8 py-4 rounded-2xl bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-500 hover:to-cyan-400 text-white font-bold text-lg flex items-center gap-2 transition-all shadow-[0_0_30px_rgba(139,92,246,0.3)] hover:shadow-[0_0_40px_rgba(6,182,212,0.4)]"
            >
              Start Your Journey <ArrowRight size={20} />
            </Link>
          </div>
        </div>

        {/* Features / Rounds Section */}
        <div className="mt-40 grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Connecting Line (Desktop) */}
          <div className="hidden md:block absolute top-[45%] left-20 right-20 h-[2px] bg-gradient-to-r from-violet-500/20 via-cyan-500/20 to-emerald-500/20 z-0" />

          {/* Round 1 */}
          <div className="relative z-10 bg-[#121214]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-8 hover:bg-[#1a1a1c]/90 transition-colors">
            <div className="w-14 h-14 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center mb-6">
              <BrainCircuit className="text-violet-400" size={28} />
            </div>
            <div className="text-violet-400 font-bold text-sm tracking-widest uppercase mb-2">Round 1</div>
            <h3 className="text-2xl font-bold text-white mb-3">Aptitude Test</h3>
            <p className="text-slate-400 leading-relaxed">
              Company-specific multiple choice questions covering quantitative, logical, and verbal reasoning.
            </p>
          </div>

          {/* Round 2 */}
          <div className="relative z-10 bg-[#121214]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-8 hover:bg-[#1a1a1c]/90 transition-colors">
            <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mb-6">
              <Code2 className="text-cyan-400" size={28} />
            </div>
            <div className="text-cyan-400 font-bold text-sm tracking-widest uppercase mb-2">Round 2</div>
            <h3 className="text-2xl font-bold text-white mb-3">Technical Coding</h3>
            <p className="text-slate-400 leading-relaxed">
              Solve algorithmic challenges in a built-in IDE. Evaluated on time complexity, space complexity, and logic.
            </p>
          </div>

          {/* Round 3 */}
          <div className="relative z-10 bg-[#121214]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-8 hover:bg-[#1a1a1c]/90 transition-colors">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-6">
              <Video className="text-emerald-400" size={28} />
            </div>
            <div className="text-emerald-400 font-bold text-sm tracking-widest uppercase mb-2">Round 3</div>
            <h3 className="text-2xl font-bold text-white mb-3">HR Face-to-Face</h3>
            <p className="text-slate-400 leading-relaxed">
              Real-time video interview with our AI agent. Advanced face-mesh tracking monitors your eye contact and confidence.
            </p>
          </div>
        </div>

        {/* Value Prop */}
        <div className="mt-32 glass-panel p-12 text-center rounded-[3rem] relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 relative z-10">Ready to ace your next big interview?</h2>
          <p className="text-slate-400 mb-8 max-w-xl mx-auto relative z-10">
            Get personalized LLM-generated feedback and a 30-day upskill roadmap immediately after your session.
          </p>
          <div className="flex items-center justify-center gap-6 relative z-10">
             <div className="flex items-center gap-2 text-sm font-bold text-slate-300"><ShieldCheck className="text-emerald-400" size={18}/> 100% Free</div>
             <div className="flex items-center gap-2 text-sm font-bold text-slate-300"><Target className="text-cyan-400" size={18}/> Company Specific</div>
          </div>
        </div>

      </main>

    </div>
  );
}
