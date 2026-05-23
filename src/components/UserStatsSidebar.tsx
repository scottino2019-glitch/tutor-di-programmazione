import React from "react";
import { Award, Zap, Flame, Code2, BookOpen, Clock, CheckCircle2 } from "lucide-react";
import { UserStats } from "../types";

interface UserStatsSidebarProps {
  stats: UserStats;
}

export default function UserStatsSidebar({ stats }: UserStatsSidebarProps) {
  // Simple algorithm: 100XP per level
  const xpNeededForNextLevel = 100;
  const xpProgress = stats.xp % xpNeededForNextLevel;
  const progressPercentage = Math.min(100, Math.floor((xpProgress / xpNeededForNextLevel) * 100));

  return (
    <div className="w-full lg:w-80 bg-eye-card border border-eye-border rounded-2xl p-6 text-eye-text-main space-y-6 flex flex-col justify-between" id="user-stats-sidebar">
      <div>
        {/* User Card */}
        <div className="flex items-center space-x-4 pb-6 border-b border-eye-border">
          <div className="w-12 h-12 rounded-xl bg-eye-accent flex items-center justify-center text-eye-accent-text font-bold text-lg">
            {stats.level}
          </div>
          <div>
            <h3 className="font-semibold text-xs text-eye-text-muted uppercase tracking-widest">Codice Grado</h3>
            <p className="text-xl font-bold font-sans text-eye-text-high flex items-center gap-1.5">
              Livello {stats.level} <span className="text-xs text-eye-accent font-medium font-mono">Apprendista</span>
            </p>
          </div>
        </div>

        {/* Experience Bar */}
        <div className="space-y-2 pt-6">
          <div className="flex justify-between text-xs font-mono text-eye-text-muted">
            <span>PUNTI ESPERIENZA (XP)</span>
            <span className="text-eye-text-high">{stats.xp} XP</span>
          </div>
          <div className="w-full h-2.5 bg-eye-input rounded-full overflow-hidden border border-eye-border/50">
            <div 
              className="h-full bg-eye-accent rounded-full transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-eye-text-muted/85 font-mono">
            <span>{xpProgress} XP / {xpNeededForNextLevel} XP</span>
            <span>PROSSIMO LIVELLO: {(stats.level * xpNeededForNextLevel) - stats.xp} XP</span>
          </div>
        </div>

        {/* Dash Grid Stats */}
        <div className="grid grid-cols-2 gap-3 pt-6">
          <div className="bg-eye-input p-3.5 rounded-xl border border-eye-border flex flex-col justify-between">
            <span className="text-[10px] uppercase text-eye-text-muted tracking-wider flex items-center gap-1 select-none">
              <Flame className="w-3.5 h-3.5 text-eye-accent" />
              Streak
            </span>
            <span className="text-xl font-bold text-eye-text-high font-mono mt-2">{stats.streak} {stats.streak === 1 ? 'Giorno' : 'Giorni'}</span>
          </div>
          
          <div className="bg-eye-input p-3.5 rounded-xl border border-eye-border flex flex-col justify-between">
            <span className="text-[10px] uppercase text-eye-text-muted tracking-wider flex items-center gap-1 select-none">
              <Code2 className="w-3.5 h-3.5 text-eye-accent" />
              Risolti
            </span>
            <span className="text-xl font-bold text-eye-text-high font-mono mt-2">{stats.solvedExercisesCount} Sfide</span>
          </div>
        </div>

        {/* Topics mastered Section */}
        <div className="pt-6 space-y-3">
          <h4 className="text-xs font-semibold text-eye-text-muted uppercase tracking-wider flex items-center gap-1.5">
            <BookOpen className="w-4 h-4 text-eye-accent" />
            Argomenti Padroneggiati
          </h4>
          
          {stats.masteredTopics.length === 0 ? (
            <div className="text-xs text-eye-text-muted bg-eye-input/40 rounded-xl p-4 text-center border border-dashed border-eye-border">
              Risolvi esercizi con voto superiore al 70% per superare la sfida!
            </div>
          ) : (
            <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto pr-1">
              {stats.masteredTopics.map((topic, idx) => (
                <span 
                  key={idx} 
                  className="px-2.5 py-1 text-xs font-medium font-mono bg-eye-input text-eye-text-main rounded-md border border-eye-border flex items-center gap-1"
                >
                  <CheckCircle2 className="w-3 h-3 text-eye-accent flex-shrink-0" />
                  {topic}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Personal AI Teacher Advice Note */}
      <div className="pt-6 border-t border-eye-border mt-6 bg-eye-input/40 p-4 rounded-xl border border-eye-border">
        <div className="flex items-center gap-2 mb-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-eye-accent"></div>
          <span className="text-xs font-bold text-eye-text-high font-sans tracking-tight">Consiglio del Tutor</span>
        </div>
        <p className="text-xs text-eye-text-muted leading-relaxed">
          {stats.solvedExercisesCount === 0 
            ? "Piacere di conoscerti! Seleziona una scheda e iniziamo subito con un esercizio pratico o analizziamo del codice."
            : stats.streak > 3
            ? `Fantastico lavoro! Mantieni attiva la serie di ${stats.streak} giorni studiando moderni React Hooks oggi!`
            : "La continuità è il segreto per diventare sviluppatori senior. Risolvi un esercizio al giorno!"}
        </p>
      </div>
    </div>
  );
}
