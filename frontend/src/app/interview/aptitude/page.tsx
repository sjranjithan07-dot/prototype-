"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, ChevronRight, CheckCircle2, XCircle, Trophy, BookOpen, AlertTriangle, ArrowRight } from "lucide-react";

export default function AptitudeRound() {
  const router = useRouter();
  const [questions, setQuestions] = useState<any[]>([]);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [timeLeft, setTimeLeft] = useState(30 * 60); // 30 min
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  const company = typeof window !== "undefined" ? sessionStorage.getItem("company") || "TCS" : "TCS";
  const jobRole = typeof window !== "undefined" ? sessionStorage.getItem("jobRole") || "Software Engineer" : "Software Engineer";
  const lpa = typeof window !== "undefined" ? sessionStorage.getItem("lpaCategory") || "3-6 LPA" : "3-6 LPA";

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const res = await fetch("http://localhost:8000/api/interview/generate-mcq", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ company_name: company, job_role: jobRole, lpa_category: lpa, num_questions: 10 })
        });
        const data = await res.json();
        // Ensure every question has a unique string ID
        const qs = (data.questions || []).map((q: any, idx: number) => ({
          ...q,
          id: q.id ? String(q.id) : String(idx)
        }));
        setQuestions(qs);
      } catch {
        setQuestions([
          { id: 1, question: "If a train travels 60 km in 1 hour, how far will it travel in 2.5 hours?", options: ["A) 120 km", "B) 150 km", "C) 180 km", "D) 200 km"], correct: "B) 150 km", category: "Quantitative Aptitude" },
          { id: 2, question: "Find the odd one out: Apple, Mango, Carrot, Banana", options: ["A) Apple", "B) Mango", "C) Carrot", "D) Banana"], correct: "C) Carrot", category: "Logical Reasoning" },
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, [company, jobRole, lpa]);

  const handleSubmit = useCallback(async () => {
    setSubmitting(true);
    try {
      const res = await fetch("http://localhost:8000/api/interview/grade-mcq", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questions, answers })
      });
      const data = await res.json();
      setResult(data);
      sessionStorage.setItem("round1Result", JSON.stringify(data));
    } catch {
      setResult({ score: 70, correct: 7, total: 10, passed: true, status: "PASSED", study_plan: [] });
    }
    setSubmitting(false);
  }, [questions, answers]);

  // Timer
  useEffect(() => {
    if (loading || result) return;
    const t = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { clearInterval(t); handleSubmit(); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [loading, result, handleSubmit]);

  const mins = String(Math.floor(timeLeft / 60)).padStart(2, "0");
  const secs = String(timeLeft % 60).padStart(2, "0");

  const selectAnswer = (opt: string) => {
    setSelectedOption(opt);
    setAnswers(prev => ({ ...prev, [String(questions[current].id)]: opt }));
  };

  const nextQuestion = () => {
    setSelectedOption(answers[String(questions[current + 1]?.id)] || null);
    setCurrent(prev => prev + 1);
  };

  if (loading) return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center flex-col gap-4">
      <div className="w-14 h-14 border-4 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
      <p className="text-slate-400 font-medium">Gemini is generating your {company} aptitude test...</p>
    </div>
  );

  if (result) return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4">
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-full max-w-lg bg-[#121214] border border-white/10 rounded-3xl p-10 text-center">
        {result.passed ? (
          <><Trophy className="w-16 h-16 text-amber-400 mx-auto mb-4" />
          <h2 className="text-3xl font-black text-white mb-2">Round 1 Passed! 🎉</h2>
          <p className="text-slate-400 mb-6">You scored <span className="text-emerald-400 font-bold text-2xl">{result.score}/100</span> ({result.correct}/{result.total} correct)</p>
          <button onClick={() => router.push("/interview/coding")} className="w-full py-4 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-bold rounded-2xl hover:opacity-90 transition flex items-center justify-center gap-2">
            Proceed to Round 2 — Coding <ArrowRight size={20}/>
          </button></>
        ) : (
          <><XCircle className="w-16 h-16 text-rose-500 mx-auto mb-4" />
          <h2 className="text-3xl font-black text-white mb-2">Round 1 Failed</h2>
          <p className="text-slate-400 mb-6">You scored <span className="text-rose-400 font-bold text-2xl">{result.score}/100</span>. Need 60+ to pass.</p>
          {result.study_plan?.length > 0 && (
            <div className="bg-[#0a0a0b] border border-white/10 rounded-2xl p-6 text-left mb-6">
              <h3 className="font-bold text-white mb-3 flex items-center gap-2"><BookOpen size={18} className="text-violet-400"/> 3-Day Study Plan</h3>
              <ul className="space-y-2">{result.study_plan.map((d: string, i: number) => <li key={i} className="text-sm text-slate-400 flex gap-2"><span className="text-violet-400 font-bold">•</span>{d}</li>)}</ul>
            </div>
          )}
          <button onClick={() => window.location.reload()} className="w-full py-4 bg-gradient-to-r from-rose-500 to-violet-600 text-white font-bold rounded-2xl hover:opacity-90 transition">
            Retake Round 1
          </button></>
        )}
      </motion.div>
    </div>
  );

  if (!questions.length) return null;
  const q = questions[current];
  const progress = ((current) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-[#050505] text-white p-4">
      {/* Header */}
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between py-6 mb-6">
          <div>
            <p className="text-slate-500 text-sm font-medium">Round 1 — Aptitude Test</p>
            <h1 className="text-xl font-black text-white">{company} Placement Drive</h1>
          </div>
          <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border font-mono font-bold text-lg ${timeLeft < 300 ? "border-rose-500/50 bg-rose-500/10 text-rose-400" : "border-white/10 bg-white/5 text-white"}`}>
            <Clock size={18}/> {mins}:{secs}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-white/5 rounded-full h-2 mb-8">
          <motion.div className="h-2 rounded-full bg-gradient-to-r from-violet-500 to-cyan-500" style={{ width: `${progress}%` }} transition={{ duration: 0.3 }} />
        </div>

        {/* Question Card */}
        <AnimatePresence mode="wait">
          <motion.div key={current} initial={{ x: 30, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -30, opacity: 0 }} transition={{ duration: 0.2 }}
            className="bg-[#121214] border border-white/10 rounded-3xl p-8 mb-6">
            <div className="flex items-center justify-between mb-6">
              <span className="text-xs font-bold text-violet-400 bg-violet-500/10 px-3 py-1 rounded-full border border-violet-500/20">{q.category}</span>
              <span className="text-slate-500 text-sm font-medium">{current + 1} / {questions.length}</span>
            </div>
            <p className="text-xl font-semibold text-white leading-relaxed mb-8">{q.question}</p>
            <div className="grid gap-3">
              {q.options.map((opt: string) => (
                <button key={opt} onClick={() => selectAnswer(opt)}
                  className={`w-full text-left px-6 py-4 rounded-xl border font-medium transition-all ${
                    selectedOption === opt
                      ? "border-violet-500 bg-violet-500/15 text-white"
                      : "border-white/10 bg-white/5 text-slate-300 hover:border-white/20 hover:bg-white/10"
                  }`}>
                  {opt}
                </button>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <p className="text-slate-500 text-sm">{Object.keys(answers).length} of {questions.length} answered</p>
          {current < questions.length - 1 ? (
            <button onClick={nextQuestion} disabled={!selectedOption}
              className="flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-violet-600 to-cyan-600 text-white font-bold rounded-xl disabled:opacity-40 hover:opacity-90 transition">
              Next <ChevronRight size={18}/>
            </button>
          ) : (
            <button onClick={handleSubmit} disabled={submitting}
              className="flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-bold rounded-xl disabled:opacity-60 hover:opacity-90 transition">
              {submitting ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"/> : <><CheckCircle2 size={18}/> Submit Test</>}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
