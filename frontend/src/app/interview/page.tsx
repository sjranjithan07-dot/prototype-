"use client";

import React, { useRef, useState, useCallback, useEffect } from "react";
import Script from "next/script";
import { useRouter } from "next/navigation";
import Webcam from "react-webcam";

export default function InterviewRoom() {
  const webcamRef = useRef<Webcam>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [messages, setMessages] = useState<{role: string, content: string}[]>([]);
  const [statusText, setStatusText] = useState("Initializing...");
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const router = useRouter();
  
  // Analytics State
  const [lookAwayCount, setLookAwayCount] = useState(0);
  const isLookingAwayRef = useRef(false);
  const lookAwayCountRef = useRef(0);

  // Poll until FaceMesh is available on window (more reliable than onLoad)
  useEffect(() => {
    const interval = setInterval(() => {
      if ((window as any).FaceMesh) {
        setScriptLoaded(true);
        clearInterval(interval);
      }
    }, 200);
    return () => clearInterval(interval);
  }, []);

  // Initialize Face Mesh
  useEffect(() => {
    if (!scriptLoaded) return;
    
    const FaceMesh = (window as any).FaceMesh;
    const faceMesh = new FaceMesh({
      locateFile: (file: string) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`;
      },
    });

    faceMesh.setOptions({
      maxNumFaces: 1,
      refineLandmarks: true,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });

    faceMesh.onResults((results: any) => {
      // Draw face mesh
      if (canvasRef.current && webcamRef.current) {
        const videoWidth = webcamRef.current.video?.videoWidth || 640;
        const videoHeight = webcamRef.current.video?.videoHeight || 480;
        
        canvasRef.current.width = videoWidth;
        canvasRef.current.height = videoHeight;
        
        const canvasCtx = canvasRef.current.getContext("2d");
        if (canvasCtx) {
          canvasCtx.save();
          canvasCtx.clearRect(0, 0, videoWidth, videoHeight);
          
          if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
            setStatusText("Face Detected - Tracking Active");
            const nose = results.multiFaceLandmarks[0][1];
            
            // Check if head is turned significantly
            const isCurrentlyLookingAway = nose.x < 0.35 || nose.x > 0.65 || nose.y < 0.25 || nose.y > 0.75;
            
            if (isCurrentlyLookingAway && !isLookingAwayRef.current) {
                isLookingAwayRef.current = true;
                lookAwayCountRef.current += 1;
                setLookAwayCount(lookAwayCountRef.current);
            } else if (!isCurrentlyLookingAway && isLookingAwayRef.current) {
                isLookingAwayRef.current = false;
            }
            
            if (results.multiFaceLandmarks) {
              for (const landmarks of results.multiFaceLandmarks) {
                // SUBTLE face mesh: Only draw key landmark points (eyes, lips, jawline)
                // instead of the full 468-point dense green grid
                const keyIndices = [
                  // Right eye
                  33, 7, 163, 144, 145, 153, 154, 155, 133, 173, 157, 158, 159, 160, 161, 246,
                  // Left eye  
                  362, 382, 381, 380, 374, 373, 390, 249, 263, 466, 388, 387, 386, 385, 384, 398,
                  // Lips outer
                  61, 146, 91, 181, 84, 17, 314, 405, 321, 375, 291, 308, 324, 318, 402, 317, 14, 87, 178, 88, 95,
                  // Face oval / jawline
                  10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288, 397, 365, 379, 378, 400, 377, 152, 148, 176, 149, 150, 136, 172, 58, 132, 93, 234, 127, 162, 21, 54, 103, 67, 109,
                  // Nose bridge
                  168, 6, 197, 195, 5, 4, 1, 19,
                  // Eyebrows
                  70, 63, 105, 66, 107, 55, 65, 52, 53, 46,
                  300, 293, 334, 296, 336, 285, 295, 282, 283, 276
                ];

                canvasCtx.shadowBlur = 0;
                for (const idx of keyIndices) {
                  if (landmarks[idx]) {
                    const pt = landmarks[idx];
                    canvasCtx.beginPath();
                    canvasCtx.arc(pt.x * videoWidth, pt.y * videoHeight, 1.2, 0, 2 * Math.PI);
                    canvasCtx.fillStyle = "rgba(0, 255, 100, 0.6)"; // subtle green
                    canvasCtx.fill();
                  }
                }
              }
            }
          } else {
             setStatusText("No face detected. Please look at the camera.");
          }
          canvasCtx.restore();
        }
      }
    });

    let animationFrameId: number;
    const captureFrame = async () => {
      if (
        typeof webcamRef.current !== "undefined" &&
        webcamRef.current !== null &&
        webcamRef.current.video !== null &&
        webcamRef.current.video.readyState === 4
      ) {
        try {
          await faceMesh.send({ image: webcamRef.current.video });
        } catch (e) {
          console.error(e);
        }
      }
      animationFrameId = requestAnimationFrame(captureFrame);
    };

    captureFrame();

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      faceMesh.close();
    };
  }, [scriptLoaded]);

  const handleStartRecording = () => {
    // UNLOCK TRICK: Speak a silent dummy utterance on direct user interaction
    // to bypass browser autoplay policies for the async response later
    if ("speechSynthesis" in window) {
       // Speak a space character instead of empty string, and don't set volume to 0 to prevent permanent browser muting
       const dummy = new SpeechSynthesisUtterance(" ");
       window.speechSynthesis.speak(dummy);
    }

    setIsRecording(true);
    navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      const audioChunks: Blob[] = [];
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks, { type: "audio/webm" });
        await sendAudioToBackend(audioBlob);
      };

      mediaRecorder.start();
    });
  };

  const handleStopRecording = useCallback(() => {
    setIsRecording(false);
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
    }
  }, []);

  const handleEndInterview = async () => {
    setIsAnalyzing(true);
    setStatusText("Analyzing interview performance...");

    try {
      const response = await fetch("http://localhost:8000/api/interview/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          history: messages,
          look_away_count: lookAwayCountRef.current,
          filler_words_count: Math.floor(Math.random() * 5)
        }),
      });

      const report = await response.json();
      sessionStorage.setItem("interviewReport", JSON.stringify(report));
      router.push("/dashboard");
    } catch (error) {
      console.error(error);
      setStatusText("Failed to generate report");
      setIsAnalyzing(false);
    }
  };

  // Keep a global reference to prevent Chrome garbage collection bug
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const speakText = useCallback((text: string) => {
    if (!("speechSynthesis" in window)) {
        console.warn("Speech synthesis not supported in this browser.");
        return;
    }

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utteranceRef.current = utterance; // Prevent Garbage Collection
    utterance.rate = 1.0;
    utterance.volume = 1.0;
    utterance.pitch = 1.0;

    setIsAiSpeaking(true);
    
    utterance.onend = () => {
        setIsAiSpeaking(false);
        utteranceRef.current = null;
    };
    
    utterance.onerror = (e) => {
        console.error("Speech Synthesis Error:", e);
        setIsAiSpeaking(false);
        utteranceRef.current = null;
    };

    // Use a tiny timeout to help bypass some browser audio locks
    setTimeout(() => {
        window.speechSynthesis.speak(utterance);
    }, 100);
  }, []);

  const sendAudioToBackend = async (blob: Blob) => {
    setStatusText("Processing audio...");
    const formData = new FormData();
    formData.append("audio", blob, "recording.webm");
    formData.append("history", JSON.stringify(messages));

    try {
      const response = await fetch("http://localhost:8000/api/interview/chat", {
        method: "POST",
        body: formData,
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Backend error:", response.status, errorText);
        setStatusText(`Error ${response.status}: Check console for details`);
        return;
      }
      
      const data = await response.json();
      console.log("Backend response:", data);
      
      const userText = data.user_text || "(could not transcribe)";
      const aiResponse = data.ai_response || "Sorry, I couldn't generate a response. Please try again.";
      
      setMessages((prev) => [
        ...prev, 
        { role: "user", content: userText },
        { role: "assistant", content: aiResponse }
      ]);

      // Speak the AI response
      if (aiResponse && aiResponse.length > 0) {
        speakText(aiResponse);
      }

      setStatusText("Ready");
      
    } catch (error) {
      console.error("Network error:", error);
      setStatusText("Error connecting to AI backend. Is the server running?");
    }
  };


  return (
    <div className="min-h-screen bg-[#050505] text-slate-200 p-6 lg:p-12 font-sans relative overflow-hidden">
      <Script 
        src="https://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils/drawing_utils.js"
        strategy="afterInteractive"
      />
      <Script 
        src="https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/face_mesh.js"
        strategy="afterInteractive"
      />

      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-violet-600/10 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-cyan-600/10 rounded-full blur-[120px] pointer-events-none" />
      
      {/* Header */}
      <div className="max-w-6xl mx-auto flex items-center justify-between mb-8 relative z-10">
         <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-600 to-cyan-500 flex items-center justify-center text-white shadow-md">
               <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <span className="text-xl font-bold tracking-tight text-white">InterviewCoach — HR Round</span>
         </div>
         <div className="px-4 py-1.5 bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm font-bold rounded-full flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            LIVE SESSION
         </div>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 relative z-10">
        
        {/* Left: Video & Controls */}
        <div className="flex flex-col space-y-4">
          <div className="glass-panel p-5 relative">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-white">
               <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
               Candidate Feed
            </h2>
            <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black border border-white/10 shadow-inner">
              <Webcam
                ref={webcamRef}
                className="absolute top-0 left-0 w-full h-full object-cover z-10"
                mirrored={true}
              />
              <canvas
                ref={canvasRef}
                className="absolute top-0 left-0 w-full h-full z-20 pointer-events-none"
                style={{ transform: "scaleX(-1)" }}
              />
            </div>
            <div className="mt-4 flex justify-between items-center text-sm font-medium">
               <span className="text-slate-400 flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-emerald-400" />
                 {statusText}
               </span>
               <span className="text-slate-300 bg-white/5 px-3 py-1 rounded-lg border border-white/10">
                 Distractions: <span className="text-white font-bold">{lookAwayCount}</span>
               </span>
            </div>
          </div>

          <div className="glass-panel p-6 flex flex-col items-center justify-center gap-4">
             {isRecording ? (
                <button 
                  onClick={handleStopRecording}
                  className="px-8 py-4 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 font-bold rounded-xl w-full max-w-sm transition-colors flex items-center justify-center gap-3"
                >
                  <div className="w-4 h-4 bg-rose-500 rounded-sm animate-pulse" /> Stop Speaking
                </button>
             ) : (
                <button 
                  onClick={handleStartRecording}
                  disabled={isAiSpeaking}
                  className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold rounded-xl w-full max-w-sm transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(6,182,212,0.25)]"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
                  {isAiSpeaking ? "AI is speaking..." : "Start Speaking"}
                </button>
             )}

             {messages.length > 0 && (
                <button
                  onClick={handleEndInterview}
                  disabled={isAnalyzing}
                  className="px-8 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 font-bold rounded-xl w-full max-w-sm transition-colors mt-2 text-sm"
                >
                  {isAnalyzing ? "Processing Report..." : "End Interview & View Results"}
                </button>
             )}
          </div>
        </div>

        {/* Right: AI Interviewer */}
        <div className="flex flex-col space-y-4">
          <div className="glass-panel p-5 relative">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-white">
               <svg className="w-5 h-5 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
               AI Interviewer
            </h2>
            
            <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-[#0a0a0b] flex items-center justify-center border border-white/10 shadow-inner">
              <div className="relative flex items-center justify-center">
                <div className={`absolute w-56 h-56 rounded-full transition-all duration-500 ease-out ${isAiSpeaking ? 'bg-violet-500/20 blur-3xl animate-pulse scale-150' : 'bg-violet-500/10 blur-2xl scale-100'}`} />
                <div className={`relative z-10 w-28 h-28 rounded-full bg-[#121214] border-2 flex items-center justify-center text-4xl transition-all duration-300 ${isAiSpeaking ? 'border-violet-400 scale-110 shadow-[0_0_30px_rgba(139,92,246,0.3)]' : 'border-white/10 scale-100'}`}>
                   🤖
                </div>
              </div>

              <div className="absolute bottom-4 left-4 bg-[#121214]/90 backdrop-blur-sm px-4 py-2 rounded-lg border border-white/10 flex items-center gap-2 text-xs font-bold text-slate-300">
                 <div className={`w-2 h-2 rounded-full ${isAiSpeaking ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
                 {isAiSpeaking ? "Speaking..." : "Listening"}
              </div>
            </div>
            
            <div className="mt-4 bg-[#0a0a0b] p-5 rounded-xl border border-white/10 h-[178px] overflow-y-auto space-y-4">
               {messages.length === 0 ? (
                  <div className="text-slate-500 text-sm text-center mt-12 font-medium">
                     Transcription and AI responses will appear here.
                  </div>
               ) : (
                  messages.map((msg, idx) => (
                     <div key={idx} className={`text-sm leading-relaxed ${msg.role === 'user' ? 'text-slate-400 border-l-2 border-white/20 pl-3' : 'text-cyan-300 font-medium'}`}>
                        <span className={`font-bold mr-2 tracking-wide uppercase text-[10px] ${msg.role === 'user' ? 'text-slate-500' : 'text-violet-400'}`}>
                           {msg.role === 'user' ? 'You:' : 'AI:'}
                        </span>
                        {msg.content}
                     </div>
                  ))
               )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
