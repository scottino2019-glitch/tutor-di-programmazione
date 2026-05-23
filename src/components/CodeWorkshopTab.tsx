import React, { useState } from "react";
import { Code2, Zap, Award, Gauge, Copy, Check, Info, FileCode, CheckCircle2 } from "lucide-react";
import { CodeAnalysisResult } from "../types";

interface CodeWorkshopTabProps {
  onAnalyzeCode: (code: string, language: string) => Promise<CodeAnalysisResult | null>;
}

export default function CodeWorkshopTab({ onAnalyzeCode }: CodeWorkshopTabProps) {
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("React");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<CodeAnalysisResult | null>(null);
  const [copiedOriginal, setCopiedOriginal] = useState(false);
  const [copiedRefactored, setCopiedRefactored] = useState(false);
  const [activeResultTab, setActiveResultTab] = useState<"explanations" | "refactored" | "metrics">("explanations");

  const sampleCodes = [
    {
      title: "React State Perf (Lento)",
      lang: "React",
      code: `import React, { useState } from 'react';

export default function SlowComponent() {
  const [items, setItems] = useState(['Mela', 'Banana', 'Pera']);
  const [newVal, setNewVal] = useState('');

  // PROBLEMA: Ricalcolo pesante inline ad ogni re-render!
  const expensiveCalculation = () => {
    let sum = 0;
    for (let i = 0; i < 9999999; i++) {
       sum += Math.sin(i);
    }
    return sum;
  };

  const val = expensiveCalculation();

  function addItem() {
    // PROBLEMA: Mutazione diretta dello stato!
    items.push(newVal);
    setItems(items); 
    setNewVal('');
  }

  return (
    <div>
      <h3>Risultato: {val}</h3>
      <input value={newVal} onChange={(e) => setNewVal(e.target.value)} />
      <button onClick={addItem}>Aggiungi</button>
      <ul>
        {items.map((item, id) => (
          <li key={id}>{item}</li> 
        ))}
      </ul>
    </div>
  );
}`
    },
    {
      title: "JS Loop Inefficiente (O(N²))",
      lang: "JavaScript",
      code: `// Funzione per trovare duplicati in un array enorme
function trovaDuplicatiInArray(lista) {
  const duplicati = [];
  
  // PROBLEMA: Doppia scansione nidificata (O(N^2))
  for (let i = 0; i < lista.length; i++) {
    for (let j = 0; j < lista.length; j++) {
      if (i !== j && lista[i] === lista[j]) {
        // PROBLEMA: checks duplicati con indexOf inefficienti
        if (duplicati.indexOf(lista[i]) === -1) {
          duplicati.push(lista[i]);
        }
      }
    }
  }
  
  return duplicati;
}`
    },
    {
      title: "CSS Ridondante in Tailwind",
      lang: "Tailwind",
      code: `/* CSS Standard per una card prodotto con hover */
.prodotto-card {
  background-color: #ffffff;
  border: 1px solid #e1e1e1;
  border-radius: 12px;
  padding: 24px;
  transition: all 0.2s ease-in-out;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}
.prodotto-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  border-color: #cbd5e1;
}
/* Trasforma questo intero blocco CSS in classi Tailwind standard super veloci */`
    }
  ];

  const handleAnalyze = async () => {
    if (!code.trim()) return;
    setIsLoading(true);
    try {
      const res = await onAnalyzeCode(code, language);
      if (res) {
        setResult(res);
        setActiveResultTab("explanations");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const copyText = (text: string, isRefactored: boolean) => {
    navigator.clipboard.writeText(text);
    if (isRefactored) {
      setCopiedRefactored(true);
      setTimeout(() => setCopiedRefactored(false), 2000);
    } else {
      setCopiedOriginal(true);
      setTimeout(() => setCopiedOriginal(false), 2000);
    }
  };

  // Helper score background color
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-eye-accent border-eye-accent/40 bg-eye-accent/10";
    if (score >= 50) return "text-eye-text-main border-eye-border bg-eye-input";
    return "text-eye-text-muted border-eye-border bg-eye-bg";
  };

  const getScoreBarClass = (score: number) => {
    if (score >= 80) return "bg-eye-accent";
    if (score >= 50) return "bg-eye-accent/60";
    return "bg-eye-text-muted/55";
  };
  return (
    <div className="space-y-6" id="code-workshop-container">
      {/* Introduction */}
      <div className="bg-eye-card border border-eye-border rounded-2xl p-6 transition-colors duration-300">
        <h2 className="text-xl font-bold text-eye-text-high tracking-tight flex items-center gap-2">
          <Code2 className="w-5 h-5 text-eye-accent" />
          Laboratorio di Analisi & Ottimizzazione Codice
        </h2>
        <p className="text-eye-text-muted mt-2 leading-relaxed" style={{ fontSize: "var(--font-size-base)" }}>
          Incolla del codice React, JavaScript, HTML o fogli di stile CSS ridondanti. Il tuo docente AI analizzerà le performance, individuerà i bug latenti ed effettuerà il refactoring automatico suggerendoti le migliori pratiche di sviluppo senior.
        </p>

        {/* Dynamic code sample chips */}
        <div className="mt-5 flex flex-wrap gap-2 items-center">
          <span className="text-xs text-eye-text-muted font-mono uppercase tracking-wider">PROVA UN ESEMPIO:</span>
          {sampleCodes.map((sc, i) => (
            <button
              key={i}
              onClick={() => {
                setCode(sc.code);
                setLanguage(sc.lang);
              }}
              className="px-3 py-1.5 text-xs font-semibold bg-eye-input hover:bg-eye-bg text-eye-text-main hover:text-eye-text-high rounded-lg border border-eye-border transition-colors cursor-pointer"
            >
              {sc.title}
            </button>
          ))}
        </div>
      </div>

      {/* Editor columns grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Input panel (Left) */}
        <div className="lg:col-span-12 xl:col-span-5 bg-eye-card border border-eye-border rounded-2xl p-5 flex flex-col space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-semibold tracking-wider text-eye-text-muted uppercase font-mono">Tuo Codice Originale</h3>
            
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-eye-input border border-eye-border rounded-lg px-3 py-1.5 text-xs text-eye-text-main font-medium focus:outline-none focus:border-eye-accent max-w-[150px] cursor-pointer"
            >
              <option value="React">React / TypeScript</option>
              <option value="JavaScript">JavaScript Standard</option>
              <option value="Tailwind">HTML & Tailwind CSS</option>
              <option value="CSS">CSS Tradizionale</option>
            </select>
          </div>

          <div className="relative flex-1">
            <textarea
              placeholder="Incolla qui il tuo codice da ottimizzare o correggere..."
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full h-80 min-h-80 bg-eye-input border border-eye-border focus:border-eye-accent rounded-xl p-4 font-mono text-eye-text-high placeholder:text-eye-text-muted/60 focus:outline-none resize-none leading-relaxed"
              style={{ fontSize: "var(--font-size-code)" }}
              id="raw-code-input"
            />
            {code && (
              <button
                onClick={() => copyText(code, false)}
                className="absolute top-3 right-3 p-1.5 bg-eye-card/90 hover:bg-eye-bg border border-eye-border text-eye-text-muted hover:text-eye-text-high rounded transition cursor-pointer"
                title="Copia originale"
              >
                {copiedOriginal ? <Check className="w-3.5 h-3.5 text-eye-accent" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            )}
          </div>

          <button
            onClick={handleAnalyze}
            disabled={isLoading || !code.trim()}
            className="w-full py-3 bg-eye-accent hover:bg-eye-accent-hover disabled:opacity-50 disabled:hover:bg-eye-accent text-eye-accent-text font-bold rounded-xl transition cursor-pointer select-none text-sm text-center font-sans tracking-wide shrink-0"
            id="run-analysis-button"
          >
            {isLoading ? "Analisi e Ottimizzazione in corso..." : "🔬 Analizza e Suggerisci Ottimizzazioni"}
          </button>
        </div>

        {/* Output analysis panel (Right) */}
        <div className="lg:col-span-12 xl:col-span-7 bg-eye-card border border-eye-border rounded-2xl overflow-hidden min-h-96 flex flex-col justify-between">
          {isLoading ? (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center space-y-4 bg-eye-bg/20">
              <div className="relative w-16 h-16 flex items-center justify-center">
                <div className="absolute inset-0 border-4 border-eye-border rounded-full"></div>
                <div className="absolute inset-0 border-4 border-eye-accent border-t-transparent rounded-full animate-spin"></div>
                <Gauge className="w-6 h-6 text-eye-accent" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-eye-text-high">Analisi Statica e Cognitiva AI</h4>
                <p className="text-xs text-eye-text-muted max-w-sm">
                  Gemini sta ispezionando il tuo codice riga per riga per individuare overhead di calcolo, cattive pratiche React ed inefficienze...
                </p>
              </div>
            </div>
          ) : result ? (
            <div className="flex-1 flex flex-col justify-between" id="analysis-loaded-view">
              {/* Tabs selector */}
              <div className="px-5 py-3.5 border-b border-eye-border bg-eye-card/50 flex flex-wrap justify-between items-center gap-3">
                <div className="flex bg-eye-input p-1 rounded-lg border border-eye-border">
                  <button
                    onClick={() => setActiveResultTab("explanations")}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-md transition cursor-pointer ${
                      activeResultTab === "explanations"
                        ? "bg-eye-card text-eye-text-high border border-eye-border/50"
                        : "text-eye-text-muted hover:text-eye-text-high"
                    }`}
                  >
                    Spiegazione e Cambiamenti
                  </button>
                  <button
                    onClick={() => setActiveResultTab("refactored")}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-md transition cursor-pointer ${
                      activeResultTab === "refactored"
                        ? "bg-eye-card text-eye-text-high border border-eye-border/50"
                        : "text-eye-text-muted hover:text-eye-text-high"
                    }`}
                  >
                    Codice Ottimizzato
                  </button>
                  <button
                    onClick={() => setActiveResultTab("metrics")}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-md transition cursor-pointer ${
                      activeResultTab === "metrics"
                        ? "bg-eye-card text-eye-text-high border border-eye-border/50"
                        : "text-eye-text-muted hover:text-eye-text-high"
                    }`}
                  >
                    Report Qualità
                  </button>
                </div>

                {/* Badges */}
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-eye-text-muted font-mono uppercase">Voti AI:</span>
                  <div className="flex gap-1.5 select-none font-mono">
                    <span className="px-2 py-0.5 text-[10px] bg-eye-input border border-eye-border text-eye-accent rounded font-bold">
                      Perf: {result.performanceScore}
                    </span>
                    <span className="px-2 py-0.5 text-[10px] bg-eye-input border border-eye-border text-eye-accent rounded font-bold">
                      Puli: {result.maintainabilityScore}
                    </span>
                  </div>
                </div>
              </div>

              {/* Scrollable tab panel body */}
              <div className="flex-1 overflow-y-auto p-5 max-h-[29rem] scrollbar-thin">
                {activeResultTab === "explanations" && (
                  <div className="space-y-6 text-sm text-eye-text-main">
                    {/* Explanation */}
                    <div>
                      <h4 className="text-xs font-bold font-mono uppercase tracking-wider text-eye-text-muted mb-2.5 flex items-center gap-1.5">
                        <Info className="w-4 h-4 text-eye-accent" />
                        Spiegazione Didattica
                      </h4>
                      <div className="bg-eye-bg/40 border border-eye-border rounded-xl p-4 leading-relaxed text-eye-text-main whitespace-pre-wrap" style={{ fontSize: "var(--font-size-base)" }}>
                        {result.explanation}
                      </div>
                    </div>

                    {/* Shortcomings List */}
                    {result.keyShortcomings && result.keyShortcomings.length > 0 && (
                      <div>
                        <h4 className="text-xs font-bold font-mono uppercase tracking-wider text-eye-text-muted mb-2.5 flex items-center gap-1.5">
                          ⚠️ Anomalie e Bug Rilevati
                        </h4>
                        <div className="space-y-2">
                          {result.keyShortcomings.map((sh, idx) => (
                            <div key={idx} className="flex gap-2.5 items-start bg-eye-input border border-eye-border p-2.5 rounded-lg text-eye-text-main text-sm">
                              <span className="text-eye-accent font-bold">•</span>
                              <p>{sh}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Optimizations List */}
                    <div>
                      <h4 className="text-xs font-bold font-mono uppercase tracking-wider text-eye-accent mb-2.5 flex items-center gap-1.5">
                        <Zap className="w-4 h-4 text-eye-accent" />
                        Migliorie Integrate nel Refactor
                      </h4>
                      <div className="bg-eye-bg/40 border border-eye-border rounded-xl p-4 text-eye-text-main whitespace-pre-wrap" style={{ fontSize: "var(--font-size-base)" }}>
                        {result.optimizationsList}
                      </div>
                    </div>
                  </div>
                )}

                {activeResultTab === "refactored" && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center bg-eye-input px-4 py-2 rounded-lg border border-eye-border">
                      <span className="text-xs font-mono text-eye-accent font-medium">✨ Refactoring Finale Proposto</span>
                      <button
                        onClick={() => copyText(result.refactoredCode, true)}
                        className="flex items-center gap-1.5 text-xs text-eye-text-muted hover:text-eye-text-high transition py-1 px-2.5 rounded hover:bg-eye-bg border border-eye-border cursor-pointer font-medium"
                      >
                        {copiedRefactored ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-eye-accent" />
                            <span className="text-eye-accent font-semibold">Copiato</span>
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
                      <pre className="p-4 overflow-x-auto text-eye-text-main whitespace-pre leading-relaxed select-all">
                        <code>{result.refactoredCode}</code>
                      </pre>
                    </div>
                  </div>
                )}

                {activeResultTab === "metrics" && (
                  <div className="space-y-6">
                    <h4 className="text-xs font-bold font-mono uppercase tracking-wider text-eye-text-muted mb-2.5 flex items-center gap-1.5">
                      <Gauge className="w-4 h-4 text-eye-accent" />
                      Parametri Qualitativi Codice
                    </h4>

                    {/* Grid meters */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Performance Score */}
                      <div className={`p-4 rounded-xl border ${getScoreColor(result.performanceScore)} space-y-3`}>
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-bold font-mono uppercase text-eye-text-muted">Punti Performance</span>
                          <span className="text-lg font-bold font-mono">{result.performanceScore} / 100</span>
                        </div>
                        <div className="w-full h-2.5 bg-eye-input rounded-full overflow-hidden border border-eye-border/50">
                          <div 
                            className={`h-full ${getScoreBarClass(result.performanceScore)} rounded-full`}
                            style={{ width: `${result.performanceScore}%` }}
                          />
                        </div>
                        <p className="text-xs text-eye-text-muted leading-relaxed">
                          {result.performanceScore >= 80 
                            ? "Efficienza eccellente, privo di loop lenti o calcoli ridondanti inline."
                            : result.performanceScore >= 50
                            ? "Soddisfacente ma contiene ricalcoli pesanti ad ogni render o costose scansioni O(N²)."
                            : "Urgono miglioramenti. Questo codice potrebbe causare colli di bottiglia o bloccare il thread dei render."}
                        </p>
                      </div>

                      {/* Maintainability Score */}
                      <div className={`p-4 rounded-xl border ${getScoreColor(result.maintainabilityScore)} space-y-3`}>
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-bold font-mono uppercase text-eye-text-muted">Pulizia & Manutenibilità</span>
                          <span className="text-lg font-bold font-mono">{result.maintainabilityScore} / 100</span>
                        </div>
                        <div className="w-full h-2.5 bg-eye-input rounded-full overflow-hidden border border-eye-border/50">
                          <div 
                            className={`h-full ${getScoreBarClass(result.maintainabilityScore)} rounded-full`}
                            style={{ width: `${result.maintainabilityScore}%` }}
                          />
                        </div>
                        <p className="text-xs text-eye-text-muted leading-relaxed">
                          {result.maintainabilityScore >= 80
                            ? "Codice pulito, auto-esplicativo, modulare e conforme alle raccomandazioni vigenti."
                            : result.maintainabilityScore >= 50
                            ? "Leggibile, ma possiede accoppiamenti rigidi, DRY violato o assenza di modularizzazione delle parti."
                            : "Codice disordinato o mutazioni dirette di stato. Difficile da debuggare e scalare."}
                        </p>
                      </div>
                    </div>

                    <div className="bg-eye-bg/40 p-4 border border-eye-border rounded-xl">
                      <h5 className="text-xs font-bold font-mono uppercase text-eye-accent mb-1 flex items-center gap-1.5">
                        <Award className="w-4 h-4 text-eye-accent" />
                        Valutazione Generale del Mentore
                      </h5>
                      <p className="text-xs text-eye-text-main leading-relaxed mt-2.5">
                        {Math.floor((result.performanceScore + result.maintainabilityScore) / 2) >= 80
                          ? "Complimenti! Questo codice rispetta lo standard dell'industria. Il refactoring finale corregge piccole pignolerie per renderlo assolutamente impeccabile."
                          : "Ci sono ampi margini di crescita! Esplora il codice ottimizzato per comprendere in che modo gestire lo stato React senza mutazioni dannose o come snellire la complessità computazionale."}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center text-eye-text-muted max-w-sm mx-auto space-y-3 leading-relaxed bg-eye-bg/10">
              <FileCode className="w-12 h-12 text-eye-text-muted/65" />
              <h4 className="font-semibold text-eye-text-muted text-xs uppercase font-mono tracking-wider">Nessuna analisi generata</h4>
              <p className="text-xs text-eye-text-muted">
                Incolla il codice a sinistra e premi il pulsante "Analizza" per avviare il report dettagliato in tempo reale.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
