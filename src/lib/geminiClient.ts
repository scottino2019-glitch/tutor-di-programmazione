/// <reference types="vite/client" />
import { GoogleGenAI, Type } from "@google/genai";
import { Message, CodeAnalysisResult, Exercise, ExerciseReview } from "../types";

let aiInstance: GoogleGenAI | null = null;

/**
 * Returns the initialized GoogleGenAI client if the client-side key VITE_GEMINI_API_KEY is defined.
 */
export function getClientAI(): GoogleGenAI | null {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) return null;
  if (!aiInstance) {
    aiInstance = new GoogleGenAI({ apiKey });
  }
  return aiInstance;
}

/**
 * Checks if client-side Gemini direct execution is active.
 */
export function isClientSideGeminiEnabled(): boolean {
  return !!import.meta.env.VITE_GEMINI_API_KEY;
}

/**
 * Direct browser call to Gemini for Chat
 */
export async function clientSideChat(messages: Message[]): Promise<string> {
  const ai = getClientAI();
  if (!ai) throw new Error("VITE_GEMINI_API_KEY is not defined.");

  const contents = messages.map((m) => ({
    role: m.sender === 'user' ? 'user' : 'model',
    parts: [{ text: m.text }]
  }));

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents,
    config: {
      systemInstruction: "Sei un Insegnante Personale AI e assistente di sviluppo amichevole ed esperto. Spieghi concetti di HTML, CSS, JavaScript, React e Tailwind CSS in modo chiarissimo, didattico e pratico. Rispondi sempre in lingua italiana. Inserisci brevi frammenti di codice d'esempio pratici e organizza la spiegazione con un layout Markdown elegante, pulito e ad altissimo contrasto per facilitare la lettura. Stimola lo studente proponendo una domanda di riflessione o un esercizio creativo finale."
    }
  });

  return response.text || "Ops! Non sono riuscito a generare una risposta valida.";
}

/**
 * Direct browser call to Gemini for Code Analysis and Optimization (JSON)
 */
export async function clientSideAnalyzeCode(code: string, language: string): Promise<CodeAnalysisResult> {
  const ai = getClientAI();
  if (!ai) throw new Error("VITE_GEMINI_API_KEY is not defined.");

  const prompt = `Analizza attentamente questo codice sorgente scritto in ${language || "Automatico"}:
\`\`\`
${code}
\`\`\`

Fornisci una dettagliata spiegazione didattica in italiano, calcola un voto per le performance e uno per la manutenibilità, e offri una versione interamente ottimizzata/rifattorizzata del codice con commenti esplicativi utili.`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      systemInstruction: "Sei un analizzatore di codice per studenti di programmazione. Analizza il codice sotto l'aspetto dello stile, delle performance, dei bug potenziali, e della manutenibilità. Rispondi sempre in italiano in formato JSON strutturato.",
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          explanation: { 
            type: Type.STRING, 
            description: "Spiegazione didattica, passo e passo, strutturata in markdown (italiano). Spiega esattamente cosa fa il codice e come funziona." 
          },
          performanceScore: { 
            type: Type.INTEGER, 
            description: "Un punteggio numerico di performance da 0 a 100." 
          },
          maintainabilityScore: { 
            type: Type.INTEGER, 
            description: "Un punteggio numerico di manutenibilità e pulizia del codice da 0 a 100." 
          },
          keyShortcomings: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Lista di difetti chiave, vulnerabilità, bug, ridondanze o cattive pratiche trovati nel codice originale."
          },
          optimizationsList: { 
            type: Type.STRING, 
            description: "Un elenco in formato Markdown (italiano) delle modifiche e migliorie apportate per ottimizzare performance e leggibilità." 
          },
          refactoredCode: { 
            type: Type.STRING, 
            description: "Il codice interamente ottimizzato, rifattorizzato ed elegantemente formattato con commenti utili in italiano." 
          }
        },
        required: ["explanation", "performanceScore", "maintainabilityScore", "keyShortcomings", "optimizationsList", "refactoredCode"]
      }
    }
  });

  if (!response.text) {
    throw new Error("Invalid response from Gemini client analyzer.");
  }

  return JSON.parse(response.text.trim());
}

/**
 * Direct browser call to Gemini for custom Exercise Generation (JSON)
 */
export async function clientSideGenerateExercise(topic: string, difficulty: string, category: string): Promise<Exercise> {
  const ai = getClientAI();
  if (!ai) throw new Error("VITE_GEMINI_API_KEY is not defined.");

  const prompt = `Genera un esercizio pratico di programmazione su questo argomento specifico: "${topic}".
Fornisci un livello di difficoltà "${difficulty || "Intermedio"}" e assicurati che appartenga alla categoria tecnologica "${category || "JavaScript"}".
L'esercizio deve essere coinvolgente ed educativo.`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      systemInstruction: "Sei un generatore di esercizi di programmazione per studenti alle prime armi o intermedi. Crea esercizi realistici con istruzioni chiare e codice iniziale già strutturato ma parzialmente incompleto su cui lavorare. Rispondi in italiano in formato JSON.",
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { 
            type: Type.STRING, 
            description: "Il titolo accattivante e conciso dell'esercizio in italiano." 
          },
          description: { 
            type: Type.STRING, 
            description: "Una descrizione completa dello scenario, obiettivi dell'esercizio e spiegazioni didattiche in formato markdown (italiano)." 
          },
          startingCode: { 
            type: Type.STRING, 
            description: "Il codice di partenza (con commenti didattici del tipo TODO) che lo studente deve completare. Può essere codice HTML, JS, CSS, Tailwind o React." 
          },
          difficulty: { 
            type: Type.STRING, 
            description: "Difficoltà tradotta (Facile, Intermedio, Difficile)." 
          },
          category: { 
            type: Type.STRING, 
            description: "La categoria tecnologica (React, JavaScript, HTML, CSS, Tailwind)." 
          },
          requirements: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "I requisiti funzionali specifici da soddisfare (da 3 a 5 punti chiari, es. 'Sottolinea l'elemento quando viene cliccato')."
          }
        },
        required: ["title", "description", "startingCode", "difficulty", "category", "requirements"]
      }
    }
  });

  if (!response.text) {
    throw new Error("Invalid exercise generated from Gemini client.");
  }

  return JSON.parse(response.text.trim());
}

/**
 * Direct browser call to Gemini for Student Solution Review (JSON)
 */
export async function clientSideReviewExercise(
  exerciseTitle: string, 
  userSolution: string, 
  requirements: string[], 
  category: string
): Promise<ExerciseReview> {
  const ai = getClientAI();
  if (!ai) throw new Error("VITE_GEMINI_API_KEY is not defined.");

  const prompt = `Valuta la soluzione dello studente per l'esercizio "${exerciseTitle}" (Tecnologia: ${category || "JavaScript"}).
Qui ci sono i requisiti che dovevano essere soddisfatti:
${requirements ? requirements.map((r) => `- ${r}`).join('\n') : "Nessuno specificato"}

Ecco il codice fornito dallo studente:
\`\`\`
${userSolution}
\`\`\`

Assegna un punteggio accurato basato su efficacia, bug e aderenza ai requisiti. Fornisci un feedback costruttivo e una versione modello ideale.`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      systemInstruction: "Sei un insegnante di programmazione di supporto, attento e molto professionale. Analizza il codice dello studente, valuta singolarmente se ha rispettato ciascuno dei requisiti indicati, indica chiaramente errori o imperfezioni e scrivi una soluzione ottimale. Rispondi sempre in italiano in formato JSON.",
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          score: { 
            type: Type.INTEGER, 
            description: "Un voto accurato da 0 a 100 in base ai requisiti rispettati ed alla qualità globale del codice scritto." 
          },
          feedback: { 
            type: Type.STRING, 
            description: "Una recensione pedagogica, strutturata ed incoraggiante scritta in markdown (italiano), adatta allo studente." 
          },
          keyCorrections: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Lista ordinata di suggerimenti immediati per la correzione, o sviste tecniche individuate."
          },
          optimizedListing: { 
            type: Type.STRING, 
            description: "La versione riscritta in modo perfetto dall'insegnante, con note inline in italiano per fargli capire come fare di meglio." 
          }
        },
        required: ["score", "feedback", "keyCorrections", "optimizedListing"]
      }
    }
  });

  if (!response.text) {
    throw new Error("Invalid review generated from Gemini client.");
  }

  return JSON.parse(response.text.trim());
}
