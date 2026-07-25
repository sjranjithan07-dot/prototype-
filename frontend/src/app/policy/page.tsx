import Link from "next/link";
import { Shield, BookOpen, AlertCircle, CheckCircle2, Bot } from "lucide-react";

export default function PolicyPage() {
  return (
    <div className="min-h-screen bg-[#050505] text-slate-200 pb-20 relative overflow-hidden">
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-violet-600/10 rounded-full blur-[150px] pointer-events-none" />

      <nav className="w-full z-50 bg-[#050505]/80 backdrop-blur-md border-b border-white/5 py-4 sticky top-0">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-cyan-500 flex items-center justify-center">
              <Bot size={18} className="text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight text-white">InterviewCoach</span>
          </Link>
          <Link
            href="/setup"
            className="text-sm font-semibold bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-5 py-2 rounded-full hover:opacity-90 transition-all"
          >
            Start Interview
          </Link>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 mt-12 space-y-12 relative z-10">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold tracking-tight text-white mb-4">Integrity & Malpractice Policy</h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            This platform helps you honestly assess and improve your interview skills for real product-based and service-based job opportunities.
          </p>
        </div>

        <div className="glass-panel p-8 md:p-12">
          <h2 className="text-2xl font-bold flex items-center gap-3 text-white mb-6">
            <AlertCircle className="text-rose-400" /> Ground Rules (Round 1 & 2)
          </h2>
          <p className="text-slate-400 mb-6 leading-relaxed">
            To keep results meaningful and fair, you must follow these rules during Round 1 (Aptitude & Coding) and Round 2 (Technical Interview):
          </p>
          <ul className="space-y-4">
            {[
              "Do not use external AI tools such as ChatGPT, Copilot, or similar assistants to generate code or answers during the test.",
              "Do not copy-paste solutions from online websites, shared documents, friends, or any external source.",
              "Do not take help from another person to solve questions or explain answers while the test is in progress.",
              "Do not attempt to bypass the test interface or disable any security or monitoring features.",
            ].map((rule, i) => (
              <li key={i} className="flex items-start gap-4 p-4 rounded-xl bg-rose-500/5 border border-rose-500/20">
                <div className="mt-0.5 text-rose-400">✕</div>
                <span className="text-slate-300 text-sm">{rule}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="glass-panel p-8 md:p-12">
          <h2 className="text-2xl font-bold flex items-center gap-3 text-white mb-6">
            <Shield className="text-cyan-400" /> How We Monitor Malpractice
          </h2>
          <p className="text-slate-400 mb-6 leading-relaxed">
            We use a combination of technical measures to detect malpractice, including:
          </p>
          <ul className="space-y-3 mb-8">
            {[
              "Monitoring copy and paste activity in the coding editor.",
              "Randomizing questions and order for each candidate.",
              "Tracking abnormal patterns such as instant full-solution pastes or frequent tab switching.",
              "Automated plagiarism checks against public solutions and other submissions.",
            ].map((item, i) => (
              <li key={i} className="flex items-center gap-3 text-sm text-slate-300">
                <CheckCircle2 size={16} className="text-cyan-400" /> {item}
              </li>
            ))}
          </ul>

          <div className="bg-white/[0.03] p-6 rounded-xl border border-white/10">
            <h3 className="font-bold text-white mb-2">Consequences of Suspicious Activity</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              If suspicious activity is detected, your attempt may be flagged as &quot;Likely Malpractice&quot; or &quot;Confirmed Malpractice&quot;, excluded from official scores, and marked with a warning that your results may not reflect your true skills.
            </p>
          </div>
        </div>

        <div className="glass-panel p-8 md:p-12">
          <h2 className="text-2xl font-bold flex items-center gap-3 text-white mb-6">
            <BookOpen className="text-emerald-400" /> Practice Mode vs Assessment Mode
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white/[0.03] p-6 rounded-xl border border-white/10">
              <h3 className="font-bold text-lg text-emerald-400 mb-3">Practice Mode</h3>
              <p className="text-sm text-slate-400 mb-3 leading-relaxed">You are free to explore concepts, re-attempt questions, and use learning resources.</p>
              <p className="text-sm text-slate-500 bg-white/[0.03] p-3 rounded-lg border border-white/10">Scores in this mode are for your personal improvement only.</p>
            </div>
            <div className="bg-white/[0.03] p-6 rounded-xl border border-white/10">
              <h3 className="font-bold text-lg text-violet-400 mb-3">Assessment Mode</h3>
              <p className="text-sm text-slate-400 mb-3 leading-relaxed">Strict integrity rules apply. External AI tools, copy-paste, or help from others is strictly prohibited.</p>
              <p className="text-sm text-slate-500 bg-white/[0.03] p-3 rounded-lg border border-white/10">Anti-cheat and plagiarism detection features are enabled.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
