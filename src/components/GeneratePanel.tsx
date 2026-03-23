import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Sparkles, Copy, Download, RotateCcw, Send } from "lucide-react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { cn } from "@/lib/utils";

function useTypingEffect(fullText: string, enabled: boolean, speed = 12) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);
  const indexRef = useRef(0);

  useEffect(() => {
    if (!enabled) {
      indexRef.current = 0;
      setDisplayed("");
      setDone(false);
      return;
    }
    setDone(false);
    indexRef.current = 0;
    setDisplayed("");

    const tick = () => {
      const charsPerTick = Math.floor(Math.random() * 3) + 1; // 1-3 chars for natural feel
      indexRef.current = Math.min(indexRef.current + charsPerTick, fullText.length);
      setDisplayed(fullText.slice(0, indexRef.current));
      if (indexRef.current >= fullText.length) {
        setDone(true);
      }
    };

    const id = setInterval(tick, speed);
    return () => clearInterval(id);
  }, [fullText, enabled, speed]);

  return { displayed, done };
}

interface GeneratePanelProps {
  model: string;
}

export function GeneratePanel({ model }: GeneratePanelProps) {
  const [prompt, setPrompt] = useState("");
  const [localGeneratedCode, setLocalGeneratedCode] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [showOutput, setShowOutput] = useState(false);
  const [copied, setCopied] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const { displayed, done } = useTypingEffect(localGeneratedCode, showOutput);

  // Auto-scroll as code types
  useEffect(() => {
    if (showOutput && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [displayed, showOutput]);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setShowOutput(false);
    setIsGenerating(true);
    setLocalGeneratedCode("");
    
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model,
          messages: [
            {
              role: "system",
              content: "You are an expert code generator. Generate complete code to fulfill the user's request. Return ONLY the code wrapped in a markdown block. Do not provide surrounding conversational text. Add brief inline comments if necessary."
            },
            { role: "user", content: prompt }
          ]
        })
      });

      if (!res.ok) throw new Error("Generation failed");
      const data = await res.json();
      let codeText = data.text || "";
      codeText = codeText.replace(/^```[a-z]*\n?/im, "").replace(/\n?```$/m, "").trim();
      setLocalGeneratedCode(codeText);
    } catch (err) {
      console.error(err);
      setLocalGeneratedCode("// Failed to generate code. Please try again or check the OpenRouter API connection.");
    } finally {
      setIsGenerating(false);
      setShowOutput(true);
    }
  };

  const handleRegenerate = () => {
    handleGenerate();
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(localGeneratedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Prompt input */}
      <div className="p-4 border-b border-border/40">
        <div className="relative">
          <div className="flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-accent mt-2.5 shrink-0" />
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder='Describe what you want to generate... e.g. "Create a login API with JWT authentication in Node.js"'
              className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground resize-none focus:outline-none min-h-[60px]"
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleGenerate();
              }}
            />
            <button
              onClick={handleGenerate}
              disabled={!prompt.trim() || isGenerating}
              className={cn(
                "p-2 rounded-lg transition-all shrink-0",
                prompt.trim() && !isGenerating
                  ? "bg-accent text-accent-foreground hover:bg-accent/90 glow-accent"
                  : "bg-muted text-muted-foreground"
              )}
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          <div className="flex items-center justify-between mt-2 pl-6">
            <span className="text-[10px] text-muted-foreground">⌘ + Enter to generate</span>
          </div>
        </div>
      </div>

      {/* Output */}
      <div ref={scrollRef} className="flex-1 overflow-auto scrollbar-thin">
        {isGenerating && (
          <div className="flex flex-col items-center justify-center h-full gap-4">
            <motion.div
              className="relative w-16 h-16"
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            >
              <Sparkles className="w-16 h-16 text-accent/30" />
              <motion.div
                className="absolute inset-0 flex items-center justify-center"
                animate={{ scale: [0.8, 1.2, 0.8] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <Sparkles className="w-8 h-8 text-accent" />
              </motion.div>
            </motion.div>
            <div className="text-center">
              <p className="text-sm font-medium">Generating code...</p>
              <p className="text-xs text-muted-foreground mt-1">Crafting the perfect implementation</p>
            </div>
          </div>
        )}

        {!isGenerating && !showOutput && (
          <div className="flex flex-col items-center justify-center h-full gap-4 text-muted-foreground">
            <Sparkles className="w-12 h-12 opacity-20" />
            <div className="text-center">
              <p className="text-sm font-medium">Ready to generate</p>
              <p className="text-xs mt-1 opacity-60">Describe what you want to build</p>
            </div>
            <div className="flex flex-wrap gap-2 max-w-sm justify-center mt-2">
              {["Login API with JWT", "React CRUD component", "Database schema", "WebSocket server"].map((q) => (
                <button
                  key={q}
                  onClick={() => setPrompt(q)}
                  className="px-3 py-1.5 text-[11px] rounded-full border border-border/50 hover:border-accent/50 hover:text-accent transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {!isGenerating && showOutput && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {/* Actions bar */}
            <div className="flex items-center justify-between px-4 py-2 border-b border-border/30">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-foreground">Generated Code</span>
                {!done && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center gap-1.5 text-[10px] text-accent"
                  >
                    <motion.span
                      className="w-1.5 h-1.5 rounded-full bg-accent"
                      animate={{ opacity: [1, 0.3, 1] }}
                      transition={{ duration: 0.8, repeat: Infinity }}
                    />
                    Typing...
                  </motion.span>
                )}
              </div>
              <div className="flex items-center gap-1">
                <button onClick={handleCopy} className="flex items-center gap-1 px-2 py-1 text-[11px] rounded-md hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-colors">
                  <Copy className="w-3 h-3" />
                  {copied ? "Copied!" : "Copy"}
                </button>
                <button className="flex items-center gap-1 px-2 py-1 text-[11px] rounded-md hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-colors">
                  <Download className="w-3 h-3" />
                  Download
                </button>
                <button onClick={handleRegenerate} className="flex items-center gap-1 px-2 py-1 text-[11px] rounded-md hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-colors">
                  <RotateCcw className="w-3 h-3" />
                  Regenerate
                </button>
              </div>
            </div>

            {/* Typing code output with blinking cursor */}
            <div className="relative">
              <SyntaxHighlighter
                language="typescript"
                style={oneDark}
                showLineNumbers
                customStyle={{ margin: 0, padding: "16px", background: "transparent", fontSize: "12px", lineHeight: "1.6" }}
                lineNumberStyle={{ color: "hsl(var(--muted-foreground) / 0.2)", fontSize: "10px", paddingRight: "14px" }}
              >
                {displayed}
              </SyntaxHighlighter>

              {/* Blinking cursor */}
              {!done && (
                <motion.span
                  className="inline-block w-[2px] h-[16px] bg-accent absolute"
                  style={{
                    bottom: "20px",
                    right: "auto",
                    /* Position after last character — approximate via CSS */
                  }}
                  animate={{ opacity: [1, 0, 1] }}
                  transition={{ duration: 0.7, repeat: Infinity }}
                />
              )}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
