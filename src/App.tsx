import React, { useState, useEffect } from "react";
import { MessageSquare, Code2, Dumbbell, GraduationCap, Sparkles, BookOpenCheck } from "lucide-react";
import ChatTab from "./components/ChatTab";
import CodeWorkshopTab from "./components/CodeWorkshopTab";
import ExercisesTab from "./components/ExercisesTab";
import UserStatsSidebar from "./components/UserStatsSidebar";
import { Message, CodeAnalysisResult, Exercise, ExerciseReview, UserStats } from "./types";
import {
  isClientSideGeminiEnabled,
  clientSideChat,
  clientSideAnalyzeCode,
  clientSideGenerateExercise,
  clientSideReviewExercise
} from "./lib/geminiClient";

const LOCAL_STATS_KEY = "coding_tutor_stats_v1";

const defaultStats: UserStats = {
  xp: 0,
  level: 1,
  streak: 0,
  lastActive: null,
  solvedExercisesCount: 0,
  masteredTopics: [],
};

const INITIAL_TEACHER_PROMPT: Message = {
  id: "teacher-welcome-msg",
  sender: "assistant",
  text: "Ciao! Benvenuto nel tuo spazio di programmazione assistito. Sono il tuo **Insegnante Personale AI**.\n\nCome posso aiutarti oggi? Puoi chiedermi spiegazioni teoriche dettagliate, incollarmi del codice da revisionare o richiedermi un esercizio pratico per testare le tue abilità di scrittura codice in **React**, **Tailwind CSS**, **CSS**, **HTML** o **JavaScript**!",
  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
};

export default function App() {
  const [activeTab, setActiveTab] = useState<"chat" | "workshop" | "exercises">("chat");
  const [stats, setStats] = useState<UserStats>(defaultStats);
  const [chatMessages, setChatMessages] = useState<Message[]>([INITIAL_TEACHER_PROMPT]);
  const [isTypingChat, setIsTypingChat] = useState(false);

  const [fontSize, setFontSize] = useState<"normal" | "large" | "magnified">("normal");

  // Load stats and preferences from local Storage at startup
  useEffect(() => {
    const saved = localStorage.getItem(LOCAL_STATS_KEY);
    if (saved) {
      try {
        setStats(JSON.parse(saved));
      } catch (err) {
        console.error("Error parsing local tutor stats:", err);
      }
    }
    const savedSize = localStorage.getItem("tutor_user_size") as any;
    if (savedSize) setFontSize(savedSize);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (fontSize === "normal") {
      root.style.fontSize = "15px";
      root.style.setProperty("--font-size-base", "15px");
      root.style.setProperty("--font-size-code", "14px");
    } else if (fontSize === "large") {
      root.style.fontSize = "19px";
      root.style.setProperty("--font-size-base", "19px");
      root.style.setProperty("--font-size-code", "16px");
    } else if (fontSize === "magnified") {
      root.style.fontSize = "23px";
      root.style.setProperty("--font-size-base", "23px");
      root.style.setProperty("--font-size-code", "19px");
    }
    localStorage.setItem("tutor_user_size", fontSize);
  }, [fontSize]);

  // Sync/Save Helper
  const saveStats = (updated: UserStats) => {
    setStats(updated);
    localStorage.setItem(LOCAL_STATS_KEY, JSON.stringify(updated));
  };

  // Chat message send handler
  const handleSendMessage = async (userText: string) => {
    const newUserMsg: Message = {
      id: Math.random().toString(36).substring(7),
      sender: "user",
      text: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const updatedMessages = [...chatMessages, newUserMsg];
    setChatMessages(updatedMessages);
    setIsTypingChat(true);

    try {
      let responseText = "";
      if (isClientSideGeminiEnabled()) {
        responseText = await clientSideChat(updatedMessages);
      } else {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: updatedMessages }),
        });

        if (!response.ok) {
          throw new Error("Errore di rete durante la conversazione.");
        }

        const data = await response.json();
        responseText = data.text;
      }
      
      const teacherMsg: Message = {
        id: Math.random().toString(36).substring(7),
        sender: "assistant",
        text: responseText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setChatMessages((prev) => [...prev, teacherMsg]);

      // Give small XP bonus for asking questions / coding conversation
      const newXp = stats.xp + 5;
      const newLevel = Math.floor(newXp / 100) + 1;
      saveStats({
        ...stats,
        xp: newXp,
        level: newLevel,
      });

    } catch (error: any) {
      console.error("Error talking to API:", error);
      const errorMsg: Message = {
        id: "error-msg-" + Date.now(),
        sender: "assistant",
        text: "Scusami, ho riscontrato un problema di connessione. Assicurati che il server stia girando correttamente.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setChatMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsTypingChat(false);
    }
  };

  // Cleanup Chat History
  const handleClearChat = () => {
    setChatMessages([INITIAL_TEACHER_PROMPT]);
  };

  // Code analyzer API trigger
  const handleAnalyzeCode = async (code: string, language: string): Promise<CodeAnalysisResult | null> => {
    try {
      let result: CodeAnalysisResult;
      if (isClientSideGeminiEnabled()) {
        result = await clientSideAnalyzeCode(code, language);
      } else {
        const response = await fetch("/api/analyze-code", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code, language }),
        });

        if (!response.ok) {
          throw new Error("Errore durante l'ispezione del codice.");
        }

        result = await response.json();
      }

      // Award XP for analyzing and optimizing code
      const newXp = stats.xp + 15;
      const newLevel = Math.floor(newXp / 100) + 1;
      saveStats({
        ...stats,
        xp: newXp,
        level: newLevel,
      });

      return result;
    } catch (err) {
      console.error(err);
      alert("Impossibile connettersi all'analizzatore AI. Riprova tra poco.");
      return null;
    }
  };

  // Generate Exercise API trigger
  const handleGenerateExercise = async (topic: string, difficulty: string, category: string): Promise<Exercise | null> => {
    try {
      if (isClientSideGeminiEnabled()) {
        return await clientSideGenerateExercise(topic, difficulty, category);
      }
      const response = await fetch("/api/generate-exercise", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, difficulty, category }),
      });

      if (!response.ok) {
        throw new Error("Errore nella generazione dell'esercizio.");
      }

      return await response.json();
    } catch (err) {
      console.error(err);
      alert("Errore nella generazione di un nuovo esercizio.");
      return null;
    }
  };

  // Review solution API trigger
  const handleReviewExercise = async (exerciseTitle: string, userSolution: string, requirements: string[], category: string): Promise<ExerciseReview | null> => {
    try {
      if (isClientSideGeminiEnabled()) {
        return await clientSideReviewExercise(exerciseTitle, userSolution, requirements, category);
      }
      const response = await fetch("/api/review-exercise", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ exerciseTitle, userSolution, requirements, category }),
      });

      if (!response.ok) {
        throw new Error("Impossibile inviare il codice per la valutazione.");
      }

      return await response.json();
    } catch (err) {
      console.error(err);
      alert("Errore nell'invio o valutazione della soluzione.");
      return null;
    }
  };

  // Gamification reward system
  const handleRewardUser = (score: number, category: string) => {
    let earnedXp = 10; // Participation reward
    let countIncrement = 0;
    const currentTopics = [...stats.masteredTopics];

    if (score >= 70) {
      earnedXp += 40; // High quality bonus
      countIncrement = 1;
      if (!currentTopics.includes(category)) {
        currentTopics.push(category);
      }
    }

    const nextXp = stats.xp + earnedXp;
    const nextLevel = Math.floor(nextXp / 100) + 1;

    // Daily streak management
    const todayStr = new Date().toISOString().split('T')[0];
    let nextStreak = stats.streak;

    if (stats.lastActive === null) {
      nextStreak = 1;
    } else if (stats.lastActive !== todayStr) {
      const lastActiveDate = new Date(stats.lastActive);
      const todayDate = new Date(todayStr);
      const diffTime = Math.abs(todayDate.getTime() - lastActiveDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        nextStreak += 1;
      } else if (diffDays > 1) {
        nextStreak = 1;
      }
    }

    saveStats({
      ...stats,
      xp: nextXp,
      level: nextLevel,
      solvedExercisesCount: stats.solvedExercisesCount + countIncrement,
      masteredTopics: currentTopics,
      streak: nextStreak,
      lastActive: todayStr,
    });
  };

  return (
    <div className="min-h-screen bg-eye-bg text-eye-text-main flex flex-col font-sans transition-colors duration-300" id="applet-root">
      {/* Top Header navbar with micro animations */}
      <header className="px-6 py-4 border-b border-eye-border bg-eye-card/90 sticky top-0 backdrop-blur-sm z-40 flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between" id="applet-header">
        <div className="flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-xl bg-eye-input border border-eye-border flex items-center justify-center text-eye-accent transition-colors duration-300">
            <GraduationCap className="w-5.5 h-5.5" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-eye-text-high flex items-center gap-1.5 font-sans">
              Tutor di Programmazione AI
              <span className="text-[10px] font-mono font-bold bg-eye-input text-eye-accent border border-eye-border px-1.5 py-0.5 rounded uppercase tracking-wider select-none">Dual Engine</span>
            </h1>
            <p className="text-xs text-eye-text-muted hidden sm:block">Impara React, CSS, Tailwind, JavaScript e HTML in tempo reale</p>
          </div>
        </div>

        {/* Dynamic eye care customizations bar */}
        <div className="flex flex-wrap items-center gap-3.5 bg-eye-bg/60 p-2.5 rounded-xl border border-eye-border w-full lg:w-auto" id="eye-care-bar">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase text-eye-text-muted font-bold select-none">Dimensione Caratteri:</span>
            <div className="flex gap-1 bg-eye-input p-0.5 rounded-lg border border-eye-border">
              <button
                onClick={() => setFontSize("normal")}
                className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition cursor-pointer ${
                  fontSize === "normal" ? "bg-eye-accent text-eye-accent-text" : "text-eye-text-muted hover:text-eye-text-high"
                }`}
                title="Dimensione standard"
              >
                Aa
              </button>
              <button
                onClick={() => setFontSize("large")}
                className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition cursor-pointer ${
                  fontSize === "large" ? "bg-eye-accent text-eye-accent-text" : "text-eye-text-muted hover:text-eye-text-high"
                }`}
                title="Sotto-titoli, blocchi di testo ed esercizi ingranditi del +20%"
              >
                Aa+
              </button>
              <button
                onClick={() => setFontSize("magnified")}
                className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition cursor-pointer ${
                  fontSize === "magnified" ? "bg-eye-accent text-eye-accent-text" : "text-eye-text-muted hover:text-eye-text-high"
                }`}
                title="Tutti i contenuti leggibili senza sforzo oculare (+35% di scala)"
              >
                Aa++
              </button>
            </div>
          </div>
        </div>

        {/* Global tab Switcher */}
        <div className="flex bg-eye-input p-1 rounded-xl border border-eye-border" id="navigation-tabs">
          <button
            onClick={() => setActiveTab("chat")}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer select-none ${
              activeTab === "chat"
                ? "bg-eye-bg text-eye-text-high border border-eye-border"
                : "text-eye-text-muted hover:text-eye-text-high"
            }`}
          >
            <MessageSquare className="w-4 h-4 text-eye-accent" />
            <span className="hidden md:inline">Mentore (Chat)</span>
          </button>
          
          <button
            onClick={() => setActiveTab("workshop")}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer select-none ${
              activeTab === "workshop"
                ? "bg-eye-bg text-eye-text-high border border-eye-border"
                : "text-eye-text-muted hover:text-eye-text-high"
            }`}
          >
            <Code2 className="w-4 h-4 text-eye-accent" />
            <span className="hidden md:inline">Ispeziona Codice</span>
          </button>

          <button
            onClick={() => setActiveTab("exercises")}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer select-none ${
              activeTab === "exercises"
                ? "bg-eye-bg text-eye-text-high border border-eye-border"
                : "text-eye-text-muted hover:text-eye-text-high"
            }`}
          >
            <Dumbbell className="w-4 h-4 text-eye-accent" />
            <span className="hidden md:inline">Sfide Pratiche</span>
          </button>
        </div>
      </header>

      {/* Main layout container with split flex behavior */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8 flex flex-col lg:flex-row gap-8 overflow-hidden items-stretch" id="main-content-area">
        {/* Workspace views columns (Left column with modular width) */}
        <div className="flex-1 min-w-0" id="active-tab-panel">
          {activeTab === "chat" && (
            <ChatTab
              messages={chatMessages}
              onSendMessage={handleSendMessage}
              isTyping={isTypingChat}
              onClearChat={handleClearChat}
            />
          )}

          {activeTab === "workshop" && (
            <CodeWorkshopTab 
              onAnalyzeCode={handleAnalyzeCode} 
            />
          )}

          {activeTab === "exercises" && (
            <ExercisesTab
              onGenerateExercise={handleGenerateExercise}
              onReviewExercise={handleReviewExercise}
              onRewardUser={handleRewardUser}
            />
          )}
        </div>

        {/* Gamified Profile Sidebar section (Right column with exact sizing) */}
        <div className="flex-shrink-0 flex items-stretch">
          <UserStatsSidebar stats={stats} />
        </div>
      </main>

      {/* Decorative footer */}
      <footer className="py-4 border-t border-eye-border bg-eye-card flex justify-between px-6 text-[10px] text-eye-text-muted font-mono flex-shrink-0" id="applet-footer">
        <span>Tutor di Programmazione AI • Tutti i diritti riservati</span>
        <span className="flex items-center gap-1 text-eye-text-muted">
          <Sparkles className="w-3 h-3 text-eye-accent" />
          Powered by Gemini 3.5 Flash & Antigravity
        </span>
      </footer>
    </div>
  );
}
