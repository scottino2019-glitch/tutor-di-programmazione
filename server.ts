import "dotenv/config";
import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialized Gemini API client
let aiClient: GoogleGenAI | null = null;
function getAI() {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is missing. Provide this secret to enable tutoring features.");
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

// RESTful API Routes for the Coding Tutor

// 1. General chat endpoint
app.post("/api/chat", async (req, res) => {
  try {
    const { messages } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Missing or invalid 'messages' array." });
    }

    const ai = getAI();

    // Convert message history format to match Gemini Schema
    // Expects contents: { role: "user" | "model", parts: [{ text: string }] }[]
    const contents = messages.map((m: any) => ({
      role: m.sender === 'user' ? 'user' : 'model',
      parts: [{ text: m.text }]
    }));

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents,
      config: {
        systemInstruction: "Sei un insegnante personale di programmazione e assistente di sviluppo esperto, stimolante ed amichevole. Spieghi concetti di HTML, CSS, JavaScript, React e Tailwind CSS in modo chiaro, formativo ed estremamente pratico. Rispondi sempre in lingua italiana. Includi sempre brevi frammenti di codice d'esempio pratici e formatta le spiegazioni usando formattazione Markdown di eccellente leggibilità. Cerca di stimolare lo studente a ragionare proponendo domande aperte o suggerimenti creativi alla fine della spiegazione."
      }
    });

    if (!response || !response.text) {
      throw new Error("Invalid response from Gemini service.");
    }

    res.json({ text: response.text });
  } catch (error: any) {
    console.error("Error in /api/chat:", error);
    res.status(500).json({ error: error.message || "Qualcosa è andato storto nel server della chat." });
  }
});

// 2. Code Analyzer and Optimizer
app.post("/api/analyze-code", async (req, res) => {
  try {
    const { code, language } = req.body;
    if (!code) {
      return res.status(400).json({ error: "Nessun codice fornito per essere analizzato." });
    }

    const ai = getAI();

    const prompt = `Analizza attentamente questo codice sorgente scritto in ${language || "Automatico"}:
\`\`\`
${code}
\`\`\`

Fornisci una dettagliata spiegazione didattica in italiano, calcola un voto per le performance e uno per la manutenibilità, e offri una versione interamente ottimizzata/rifattorizzata del codice con commenti esplicativi utili.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
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

    if (!response || !response.text) {
      throw new Error("Impossibile analizzare il codice tramite l'AI.");
    }

    const data = JSON.parse(response.text.trim());
    res.json(data);
  } catch (error: any) {
    console.error("Error in /api/analyze-code:", error);
    res.status(500).json({ error: error.message || "Errore nella compilazione dell'analisi del codice." });
  }
});

// 3. Generate practical coding challenge/exercise
app.post("/api/generate-exercise", async (req, res) => {
  try {
    const { topic, difficulty, category } = req.body;
    if (!topic) {
      return res.status(400).json({ error: "Seleziona o scrivi un argomento per l'esercizio." });
    }

    const ai = getAI();

    const prompt = `Genera un esercizio pratico di programmazione su questo argomento specifico: "${topic}".
Fornisci un livello di difficoltà "${difficulty || "Intermedio"}" e assicurati che appartenga alla categoria tecnologica "${category || "JavaScript"}".
L'esercizio deve essere coinvolgente ed educativo.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
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

    if (!response || !response.text) {
      throw new Error("Errore nella generazione dell'esercizio da parte di Gemini.");
    }

    const data = JSON.parse(response.text.trim());
    res.json(data);
  } catch (error: any) {
    console.error("Error in /api/generate-exercise:", error);
    res.status(500).json({ error: error.message || "Errore nella generazione della nuova sfida didattica." });
  }
});

// 4. Review and grade customized code solution
app.post("/api/review-exercise", async (req, res) => {
  try {
    const { exerciseTitle, userSolution, requirements, category } = req.body;
    if (!userSolution) {
      return res.status(400).json({ error: "Invia una soluzione di codice per consentire all'insegnante di valutarla." });
    }

    const ai = getAI();

    const prompt = `Valuta la soluzione dello studente per l'esercizio "${exerciseTitle}" (Tecnologia: ${category || "JavaScript"}).
Qui ci sono i requisiti che dovevano essere soddisfatti:
${requirements ? requirements.map((r: string) => `- ${r}`).join('\n') : "Nessuno specificato"}

Ecco il codice fornito dallo studente:
\`\`\`
${userSolution}
\`\`\`

Assegna un punteggio accurato basato su efficacia, bug e aderenza ai requisiti. Fornisci un feedback costruttivo e una versione modello ideale.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
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

    if (!response || !response.text) {
      throw new Error("Errore nella valutazione del compito da parte di Gemini.");
    }

    const data = JSON.parse(response.text.trim());
    res.json(data);
  } catch (error: any) {
    console.error("Error in /api/review-exercise:", error);
    res.status(500).json({ error: error.message || "Errore nella valutazione della soluzione." });
  }
});

// Vite Middleware Integration
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`AI Coding Tutor server explicitly listening on Port ${PORT}`);
  });
}

startServer();
