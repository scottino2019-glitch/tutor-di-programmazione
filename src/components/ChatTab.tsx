import React, { useState, useRef, useEffect } from "react";
import { Send, MessageSquare, Trash2, Copy, Check, Sparkles } from "lucide-react";
import { Message } from "../types";

interface ChatTabProps {
  messages: Message[];
  onSendMessage: (text: string) => void;
  isTyping: boolean;
  onClearChat: () => void;
}

export default function ChatTab({ messages, onSendMessage, isTyping, onClearChat }: ChatTabProps) {
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [copiedIndex, setCopiedIndex] = useState<string | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    onSendMessage(inputValue.trim());
    setInputValue("");
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(id);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const starterPrompts = [
    { label: "Spiegami useEffect", text: "Spiegami passo dopo passo come funziona useEffect in React e fammi un esempio pratico reale." },
    { label: "Layout Fluidi Tailwind", text: "Come posso realizzare una griglia interattiva responsiva utilizzando Tailwind CSS?" },
    { label: "Promise & Async Await", text: "Come funzionano le Promise e l'Async/Await in JavaScript moderno? Fammi capire con una analogia." },
    { label: "State vs Props", text: "Qual è la reale differenza tra State e Props in React e quando dovrei usarli?" }
  ];
  // A custom parser to render text with beautiful inline styles & block code highlights!
  const renderMessageContent = (text: string, msgId: string) => {
    const parts = text.split(/(```[\s\S]*?```)/g);
    return parts.map((part, index) => {
      if (part.startsWith("```")) {
        // Code Block
        const match = part.match(/```(\w*)\n([\s\S]*?)```/);
        const language = match ? match[1] : "code";
        const codeContent = match ? match[2].trim() : part.replace(/```/g, "").trim();
        const blockId = `${msgId}-code-${index}`;

        return (
          <div key={index} className="my-4 rounded-xl overflow-hidden border border-eye-border bg-eye-code-bg font-mono" style={{ fontSize: "var(--font-size-code)" }}>
            <div className="flex items-center justify-between px-4 py-2.5 bg-eye-card/90 border-b border-eye-border text-eye-text-muted font-sans font-medium">
              <span className="text-xs uppercase font-semibold text-eye-accent tracking-wide">{language || "codice"}</span>
              <button
                onClick={() => copyToClipboard(codeContent, blockId)}
                className="flex items-center gap-1.5 hover:text-eye-text-high transition-colors py-1 px-2.5 rounded hover:bg-eye-input cursor-pointer"
              >
                {copiedIndex === blockId ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-eye-accent" />
                    <span className="text-eye-accent font-medium">Copiato!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copia</span>
                  </>
                )}
              </button>
            </div>
            <pre className="p-4 overflow-x-auto text-eye-text-main select-all leading-relaxed whitespace-pre font-mono">
              <code>{codeContent}</code>
            </pre>
          </div>
        );
      }

      // Inline code highlights and paragraphs
      const textWithInlineCode = part.split(/(`[^`\n]+`)/g);
      return (
        <p key={index} className="whitespace-pre-wrap leading-relaxed inline-block w-full" style={{ fontSize: "var(--font-size-base)" }}>
          {textWithInlineCode.map((subPart, subIdx) => {
            if (subPart.startsWith("`") && subPart.endsWith("`")) {
              return (
                <code key={subIdx} className="px-1.5 py-0.5 mx-0.5 rounded bg-eye-bg text-eye-accent font-mono border border-eye-border/80" style={{ fontSize: "var(--font-size-code)" }}>
                  {subPart.slice(1, -1)}
                </code>
              );
            }
            return subPart;
          })}
        </p>
      );
    });
  };

  return (
    <div className="flex flex-col h-[calc(100vh-14rem)] bg-eye-card border border-eye-border rounded-2xl overflow-hidden flex-1" id="chat-tab-container">
      {/* Header chat */}
      <div className="px-6 py-4 border-b border-eye-border bg-eye-card/50 flex justify-between items-center flex-shrink-0">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-eye-accent/10 border border-eye-accent/20 flex items-center justify-center text-eye-accent">
            <MessageSquare className="w-5 h-5 flex-shrink-0" />
          </div>
          <div>
            <h2 className="font-bold text-eye-text-high tracking-tight">Mentore di Codice</h2>
            <p className="text-xs text-eye-text-muted">Chiedi chiarimenti, teoria o spiegazioni pratiche</p>
          </div>
        </div>

        {messages.length > 1 && (
          <button
            onClick={onClearChat}
            className="flex items-center gap-1.5 text-xs text-eye-text-muted hover:text-red-400 transition-colors py-1.5 px-3 rounded-lg hover:bg-eye-input border border-eye-border cursor-pointer font-medium"
            title="Svuota conversazione"
          >
            <Trash2 className="w-4 h-4" />
            <span className="hidden sm:inline">Pulisci</span>
          </button>
        )}
      </div>

      {/* Message space */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin bg-eye-bg/20">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-8 max-w-lg mx-auto space-y-6">
            <div className="w-16 h-16 rounded-full bg-eye-input flex items-center justify-center border border-eye-border">
              <Sparkles className="w-8 h-8 text-eye-accent" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-eye-text-high">Ciao! Sono il tuo Insegnante Personale AI</h3>
              <p className="text-sm text-eye-text-muted leading-relaxed">
                Posso aiutarti a comprendere a fondo Tailwind CSS, la reattività di React, gli algoritmi JavaScript, o fornirti feedback in tempo reale sul tuo codice.
              </p>
            </div>

            {/* Starter Prompts */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full pt-4">
              {starterPrompts.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => onSendMessage(prompt.text)}
                  className="p-3.5 text-left text-xs bg-eye-card border border-eye-border hover:border-eye-accent/30 hover:bg-eye-input rounded-xl transition-all font-medium text-eye-text-main hover:text-eye-text-high flex flex-col justify-between h-24 cursor-pointer"
                >
                  <span className="text-eye-text-muted uppercase font-mono text-[10px] tracking-wider mb-2">Argomento</span>
                  <span>{prompt.label}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-5 py-3.5 leading-relaxed ${
                    msg.sender === "user"
                      ? "bg-eye-input text-eye-text-main rounded-br-none border border-eye-border"
                      : "bg-eye-card text-eye-text-main rounded-bl-none border border-eye-border"
                  }`}
                >
                  {/* Sender Name */}
                  <div className="flex items-center gap-1.5 mb-1.5 text-[10px] uppercase font-mono tracking-wider text-eye-text-muted select-none">
                    <span className="font-semibold">{msg.sender === "user" ? "Tu (Studente)" : "Insegnante AI"}</span>
                    <span>•</span>
                    <span>{msg.timestamp}</span>
                  </div>

                  {/* Body Content */}
                  <div className="space-y-1.5 text-eye-text-main leading-relaxed" style={{ fontSize: "var(--font-size-base)" }}>
                    {renderMessageContent(msg.text, msg.id)}
                  </div>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-eye-card border border-eye-border rounded-2xl rounded-bl-none px-5 py-4">
                  <div className="flex items-center gap-1.5 mb-1 text-[10px] uppercase font-mono tracking-wider text-eye-text-muted select-none">
                    <span>Insegnante AI sta scrivendo...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Chat sender input */}
      <div className="p-4 border-t border-eye-border bg-eye-card/40 flex-shrink-0">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Scrivi una domanda o incolla un blocco di codice..."
            className="flex-1 bg-eye-input border border-eye-border hover:border-eye-border/80 focus:border-eye-accent rounded-xl px-4 py-3 text-eye-text-high focus:outline-none focus:ring-1 focus:ring-eye-accent/35 transition-colors placeholder:text-eye-text-muted/70 animate-none"
            style={{ fontSize: "var(--font-size-base)" }}
            disabled={isTyping}
            id="chat-input-field"
          />
          <button
            type="submit"
            disabled={isTyping || !inputValue.trim()}
            className="p-3 bg-eye-accent hover:bg-eye-accent-hover disabled:opacity-50 disabled:hover:bg-eye-accent text-eye-accent-text font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center select-none shrink-0"
            id="chat-send-button"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
