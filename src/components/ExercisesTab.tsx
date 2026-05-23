import React, { useState } from "react";
import { BookOpen, HelpCircle, Dumbbell, Award, ArrowRight, CheckCircle2, RotateCcw, Send, Check, Copy, Flame, PlayCircle } from "lucide-react";
import { Exercise, ExerciseReview } from "../types";

interface ExercisesTabProps {
  onGenerateExercise: (topic: string, difficulty: string, category: string) => Promise<Exercise | null>;
  onReviewExercise: (exerciseTitle: string, userSolution: string, requirements: string[], category: string) => Promise<ExerciseReview | null>;
  onRewardUser: (score: number, category: string) => void;
}

export default function ExercisesTab({ onGenerateExercise, onReviewExercise, onRewardUser }: ExercisesTabProps) {
  const [selectedCategory, setSelectedCategory] = useState("React");
  const [difficulty, setDifficulty] = useState("Intermedio");
  const [customTopic, setCustomTopic] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isReviewing, setIsReviewing] = useState(false);
  const [copiedResponse, setCopiedResponse] = useState(false);

  const [activeExercise, setActiveExercise] = useState<Exercise | null>(null);
  const [userSolution, setUserSolution] = useState("");
  const [reviewResult, setReviewResult] = useState<ExerciseReview | null>(null);
  const [viewMode, setViewMode] = useState<"workspace" | "review">("workspace");

  const categories = ["React", "JavaScript", "Tailwind", "HTML", "CSS"];

  const handleGenerate = async () => {
    const topic = customTopic.trim() || `Esercizio base su ${selectedCategory}`;
    setIsGenerating(true);
    setReviewResult(null);
    setViewMode("workspace");
    try {
      const ex = await onGenerateExercise(topic, difficulty, selectedCategory);
      if (ex) {
        setActiveExercise(ex);
        setUserSolution(ex.startingCode);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleReview = async () => {
    if (!activeExercise || !userSolution.trim()) return;
    setIsReviewing(true);
    try {
      const review = await onReviewExercise(
        activeExercise.title,
        userSolution,
        activeExercise.requirements,
        activeExercise.category
      );
      if (review) {
        setReviewResult(review);
        setViewMode("review");
        // Trigger main App's state updater for gamification (awards XP, masters topics, streaks)
        onRewardUser(review.score, activeExercise.category);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsReviewing(false);
    }
  };

  const handleReset = () => {
    if (activeExercise) {
      setUserSolution(activeExercise.startingCode);
      setReviewResult(null);
      setViewMode("workspace");
    }
  };

  const copyCode = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedResponse(true);
    setTimeout(() => setCopiedResponse(false), 2000);
  };

  const getScoreColorBg = (score: number) => {
    if (score >= 80) return "bg-eye-accent/10 border-eye-accent/45 text-eye-accent";
    if (score >= 50) return "bg-eye-input border-eye-border text-eye-text-main";
    return "bg-eye-bg border-eye-border text-eye-text-muted";
  };

  return (
    <div className="space-y-6" id="exercises-tab-wrapper">
      {/* Exercise Generation Form (only shown if no exercise is active OR we want to switch) */}
      <div className="bg-eye-card border border-eye-border rounded-2xl p-6">
        <h2 className="text-xl font-bold text-eye-text-high flex items-center gap-2">
          <Dumbbell className="w-5 h-5 text-eye-accent" />
          Esercizi e Sfide Pratiche Personalizzate
        </h2>
        <p className="text-eye-text-muted mt-2 leading-relaxed" style={{ fontSize: "var(--font-size-base)" }}>
          Scegli un modulo predefinito o inserisci un argomento specifico a tua scelta. Il docente AI costruirà una sfida pratica calibrata, completa di requisiti, test case e codice iniziale.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 mt-6 items-end">
          {/* Preset Categories */}
          <div className="md:col-span-3 space-y-2">
            <label className="text-xs font-mono uppercase text-eye-text-muted font-bold tracking-wider">Linguaggio / Tech</label>
            <div className="flex gap-1 bg-eye-input p-1.5 rounded-xl border border-eye-border">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full bg-transparent text-xs text-eye-text-main font-medium focus:outline-none px-2 py-1 cursor-pointer"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat} className="bg-eye-bg text-eye-text-main">{cat}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Custom Topic Input */}
          <div className="md:col-span-5 space-y-2">
            <label className="text-xs font-mono uppercase text-eye-text-muted font-bold tracking-wider">
              Argomento Personalizzato
            </label>
            <input
              type="text"
              placeholder="Es: Array destructuring, Flexbox center, useEffect fetch..."
              value={customTopic}
              onChange={(e) => setCustomTopic(e.target.value)}
              className="w-full bg-eye-input border border-eye-border focus:border-eye-accent rounded-xl px-3 py-2 text-sm text-eye-text-main focus:outline-none transition-colors"
              id="custom-topic-input"
            />
          </div>

          {/* Difficulty Selection */}
          <div className="md:col-span-2 space-y-2">
            <label className="text-xs font-mono uppercase text-eye-text-muted font-bold tracking-wider">Difficoltà</label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="w-full bg-eye-input border border-eye-border focus:border-eye-accent rounded-xl px-3 py-2 text-sm text-eye-text-main focus:outline-none font-medium transition-colors cursor-pointer"
            >
              <option value="Facile" className="bg-eye-bg text-eye-text-main">Facile</option>
              <option value="Intermedio" className="bg-eye-bg text-eye-text-main">Intermedio</option>
              <option value="Difficile" className="bg-eye-bg text-eye-text-main">Difficile</option>
            </select>
          </div>

          {/* Action Trigger */}
          <div className="md:col-span-2">
            <button
              onClick={handleGenerate}
              disabled={isGenerating || isReviewing}
              className="w-full py-2 bg-eye-accent hover:bg-eye-accent-hover disabled:opacity-50 disabled:hover:bg-eye-accent text-eye-accent-text font-bold rounded-xl text-xs transition cursor-pointer select-none font-sans h-9 flex items-center justify-center gap-1 shrink-0"
              id="generate-challenge-button"
            >
              {isGenerating ? "Generazione..." : "Genera Sfida"}
              <ArrowRight className="w-3.5 h-3.5 whitespace-nowrap" />
            </button>
          </div>
        </div>
      </div>

      {/* Loading state spinner */}
      {isGenerating && (
        <div className="bg-eye-card border border-eye-border rounded-2xl p-12 text-center flex flex-col items-center justify-center space-y-5">
          <div className="w-12 h-12 rounded-full border-4 border-eye-border border-t-eye-accent animate-spin"></div>
          <div>
            <h4 className="font-bold text-eye-text-high">Generazione in corso...</h4>
            <p className="text-xs text-eye-text-muted max-w-sm mx-auto mt-2">
              L'insegnante personale sta modellando l'esercizio ideale. Verranno generati requisiti pedagogici e un listato di partenza utile per la pratica.
            </p>
          </div>
        </div>
      )}

      {/* Main active exercise workspace layout */}
      {activeExercise && !isGenerating && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="exercise-workspace-grid">
          {/* Instructions and checklist panel (Left) */}
          <div className="lg:col-span-12 xl:col-span-5 bg-eye-card border border-eye-border rounded-2xl p-5 space-y-5 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex flex-wrap justify-between items-center gap-2 pb-3 border-b border-eye-border">
                <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-eye-input text-eye-accent rounded border border-eye-border">
                  {activeExercise.category}
                </span>
                <span className="text-xs text-eye-text-muted font-mono">
                  Difficoltà: <strong className="text-eye-text-high font-semibold">{activeExercise.difficulty}</strong>
                </span>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-bold text-eye-text-high leading-snug">{activeExercise.title}</h3>
                <div className="text-eye-text-main leading-relaxed max-h-56 overflow-y-auto pr-1" style={{ fontSize: "var(--font-size-base)" }}>
                  <p className="whitespace-pre-wrap">{activeExercise.description}</p>
                </div>
              </div>

              {/* Requirement Checklist */}
              <div className="space-y-2 pt-2.5">
                <h4 className="text-[10px] uppercase font-mono text-eye-text-muted tracking-wider font-bold">Requisiti del Progetto (QA):</h4>
                <div className="space-y-2">
                  {activeExercise.requirements.map((req, idx) => (
                    <div key={idx} className="flex gap-2.5 items-start bg-eye-input border border-eye-border p-2.5 rounded-lg text-eye-text-main leading-snug" style={{ fontSize: "var(--font-size-code)" }}>
                      <div className="w-4 h-4 rounded bg-eye-bg text-eye-accent font-mono text-[10px] font-bold flex items-center justify-center mt-0.5 flex-shrink-0 border border-eye-border/50">
                        {idx + 1}
                      </div>
                      <p className="font-medium">{req}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Insegnante feedback stats note */}
            <div className="bg-eye-accent-muted p-3 rounded-lg border border-eye-border text-[12px] text-eye-text-main leading-relaxed flex items-center gap-2 mt-4">
              <Flame className="w-5 h-5 flex-shrink-0 text-eye-accent" />
              <span>
                Completa i requisiti e clicca <strong>Invia all'Insegnante</strong>. Otterrai XP ed incrementerai il livello!
              </span>
            </div>
          </div>

          {/* Active editor layout / results tab (Right) */}
          <div className="lg:col-span-12 xl:col-span-7 bg-eye-card border border-eye-border rounded-2xl p-5 flex flex-col justify-between min-h-[30rem]">
            <div className="space-y-4 flex-1 flex flex-col justify-between">
              {/* Toolbar selector */}
              <div className="flex justify-between items-center border-b border-eye-border pb-3 flex-shrink-0">
                <div className="flex bg-eye-input p-1 rounded-lg border border-eye-border">
                  <button
                    onClick={() => setViewMode("workspace")}
                    className={`px-3 py-1 text-xs font-semibold rounded-md transition cursor-pointer ${
                      viewMode === "workspace"
                        ? "bg-eye-card text-eye-text-high shadow border border-eye-border/40"
                        : "text-eye-text-muted hover:text-eye-text-high"
                    }`}
                  >
                    Tua Soluzione (Codice)
                  </button>
                  {reviewResult && (
                    <button
                      onClick={() => setViewMode("review")}
                      className={`px-3 py-1 text-xs font-semibold rounded-md transition cursor-pointer ${
                        viewMode === "review"
                          ? "bg-eye-card text-eye-text-high shadow border border-eye-border/40"
                          : "text-eye-text-muted hover:text-eye-text-high"
                      }`}
                    >
                      Valutazione AI ({reviewResult.score}/100)
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleReset}
                    className="p-1 px-2.5 bg-eye-input hover:bg-eye-bg text-eye-text-muted hover:text-eye-text-high rounded-lg text-xs font-semibold flex items-center gap-1 border border-eye-border transition cursor-pointer"
                    title="Ripristina codice originale"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Resetta</span>
                  </button>
                </div>
              </div>

              {/* Window Box Content */}
              <div className="flex-1 flex flex-col justify-between">
                {viewMode === "workspace" ? (
                  <div className="space-y-4 flex-1 flex flex-col justify-between min-h-[20rem]">
                    <div className="text-xs text-eye-text-muted flex justify-between font-mono">
                      <span>INSERISCI IL CODICE DI RISOLUZIONE:</span>
                      <span className="text-eye-accent font-bold">Insegnante AI è pronto a valutare</span>
                    </div>
                    
                    <textarea
                      placeholder="// Scrivi il tuo codice qui per rispondere..."
                      value={userSolution}
                      onChange={(e) => setUserSolution(e.target.value)}
                      className="w-full h-80 min-h-80 bg-eye-input border border-eye-border focus:border-eye-accent rounded-xl p-4 font-mono text-eye-text-high resize-none focus:outline-none leading-relaxed flex-1"
                      style={{ fontSize: "var(--font-size-code)" }}
                      id="exercise-workplace-textarea"
                    />

                    <button
                      onClick={handleReview}
                      disabled={isReviewing || !userSolution.trim()}
                      className="w-full py-3 bg-eye-accent hover:bg-eye-accent-hover disabled:opacity-50 disabled:hover:bg-eye-accent text-eye-accent-text font-bold rounded-xl text-center cursor-pointer select-none font-sans text-sm mt-4 flex items-center justify-center gap-1.5 shrink-0"
                      id="submit-exercise-button"
                    >
                      {isReviewing ? "Correzione in corso..." : "📤 Invia all'Insegnante per Valutazione"}
                    </button>
                  </div>
                ) : (
                  reviewResult && (
                    <div className="space-y-6 text-sm text-eye-text-main max-h-[30rem] overflow-y-auto pr-1 scrollbar-thin">
                      {/* Overall Grade Card */}
                      <div className={`p-4 rounded-xl border flex items-center justify-between ${getScoreColorBg(reviewResult.score)}`}>
                        <div className="space-y-1">
                          <h4 className="text-xs uppercase tracking-wider font-mono font-bold">Esito del Compito</h4>
                          <p className="text-sm">
                            {reviewResult.score >= 80 
                              ? "Superato alla perfezione! Straordinaria esecuzione."
                              : reviewResult.score >= 50
                              ? "Superato! Alcuni accorgimenti ti consentiranno di fare di meglio."
                              : "Non superato. Riesamina i requisiti e l'esercizio modello."}
                          </p>
                        </div>
                        <div className="w-16 h-16 bg-eye-input rounded-full border border-eye-border flex items-center justify-center flex-shrink-0">
                          <span className="text-lg font-bold font-mono text-eye-text-high">{reviewResult.score}%</span>
                        </div>
                      </div>

                      {/* AI Teacher detailed feedback */}
                      <div className="space-y-2">
                        <h4 className="text-xs font-bold font-mono uppercase text-eye-text-muted tracking-wider">Note dell'Insegnante:</h4>
                        <div className="bg-eye-input border border-eye-border p-4 rounded-xl leading-relaxed text-eye-text-main space-y-2 pros-deep whitespace-pre-wrap font-sans" style={{ fontSize: "var(--font-size-code)" }}>
                          {reviewResult.feedback}
                        </div>
                      </div>

                      {/* Error checks corrections list */}
                      {reviewResult.keyCorrections && reviewResult.keyCorrections.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="text-xs font-bold font-mono uppercase text-eye-text-muted tracking-wider">Suggerimenti di Correzione:</h4>
                          <div className="space-y-2">
                            {reviewResult.keyCorrections.map((corr, cIdx) => (
                              <div key={cIdx} className="flex gap-2 bg-eye-input border border-eye-border rounded-lg p-3 text-eye-text-main" style={{ fontSize: "var(--font-size-code)" }}>
                                <span className="text-eye-accent font-bold">•</span>
                                <p>{corr}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Instructor Ideal reference code */}
                      <div className="space-y-3 pt-2">
                        <div className="flex justify-between items-center bg-eye-input px-4 py-2 rounded-lg border border-eye-border">
                          <span className="text-xs font-mono text-eye-accent font-semibold flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-eye-accent" />
                            Soluzione Modello Consigliata
                          </span>
                          <button
                            onClick={() => copyCode(reviewResult.optimizedListing)}
                            className="flex items-center gap-1.5 text-xs text-eye-text-muted hover:text-eye-text-high transition py-1 px-2.5 rounded hover:bg-eye-bg border border-eye-border cursor-pointer font-medium"
                          >
                            {copiedResponse ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-eye-accent" />
                                <span className="text-eye-accent font-semibold">Copiata!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5" />
                                <span>Copia</span>
                              </>
                            )}
                          </button>
                        </div>
                        
                        <div className="bg-eye-code-bg border border-eye-border rounded-xl overflow-hidden font-mono" style={{ fontSize: "var(--font-size-code)" }}>
                          <pre className="p-4 overflow-x-auto text-eye-text-main whitespace-pre leading-relaxed select-all font-mono">
                            <code>{reviewResult.optimizedListing}</code>
                          </pre>
                        </div>
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Intro empty state placeholder */}
      {!activeExercise && !isGenerating && (
        <div className="bg-eye-card border border-eye-border rounded-2xl p-12 text-center text-eye-text-muted flex flex-col items-center justify-center space-y-4 max-w-lg mx-auto">
          <PlayCircle className="w-14 h-14 text-eye-accent" />
          <div>
            <h4 className="font-bold text-eye-text-high">Seleziona o descrivi il tuo prossimo Esercizio</h4>
            <p className="text-xs text-eye-text-muted mt-2 max-w-xs leading-relaxed">
              Configura i moduli in alto e premi Genera Sfida per cominciare lo sviluppo interattivo assistito!
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
