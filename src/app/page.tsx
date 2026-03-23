"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Code2, Wrench, Zap, Settings, MessageSquare, Play,
  Terminal, Sparkles, ChevronDown, ChevronUp, Plus, Trash2,
  Sun, Moon, Copy, Search, Menu, X, PanelRightClose
} from "lucide-react";
import { CommandPalette, type CommandAction } from "@/components/CommandPalette";
import { SplashScreen } from "@/components/SplashScreen";
import { AppSidebar } from "@/components/AppSidebar";
import { CodeEditorPanel } from "@/components/CodeEditorPanel";
import { ReviewPanel } from "@/components/ReviewPanel";
import { FixPanel } from "@/components/FixPanel";
import { GeneratePanel } from "@/components/GeneratePanel";
import { ChatPanel } from "@/components/ChatPanel";
import { SettingsDialog } from "@/components/SettingsDialog";
import { sampleCode, type ReviewFeedback } from "@/lib/mock-data";
import { useHistory } from "@/hooks/useHistory";
import { cn } from "@/lib/utils";

type Mode = "review" | "fix" | "generate";

const modes = [
  { id: "review" as Mode, label: "Review", labelFull: "Review Code", icon: Code2, shortcut: "⌘1" },
  { id: "fix" as Mode, label: "Fix", labelFull: "Fix Code", icon: Wrench, shortcut: "⌘2" },
  { id: "generate" as Mode, label: "Generate", labelFull: "Generate Code", icon: Zap, shortcut: "⌘3" },
];

// Mobile bottom tab for switching between editor/output/chat
type MobilePanel = "editor" | "output" | "chat";

export default function Index() {
  const [mode, setMode] = useState<Mode>("review");
  const [code, setCode] = useState(sampleCode);
  const [language, setLanguage] = useState("JavaScript");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [mobileChatOpen, setMobileChatOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [theme, setTheme] = useState("dark");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [hasAnalyzed, setHasAnalyzed] = useState(false);
  const [reviewFeedback, setReviewFeedback] = useState<ReviewFeedback[]>([]);
  const [fixedCode, setFixedCode] = useState("");
  const [aiModel, setAiModel] = useState("nvidia/nemotron-3-super-120b-a12b:free");
  const { history, addHistoryItem, clearHistory, deleteItem } = useHistory();
  const [commandOpen, setCommandOpen] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const [mobilePanel, setMobilePanel] = useState<MobilePanel>("editor");
  const [slideDirection, setSlideDirection] = useState(0); // -1 left, 1 right

  const panelOrder: MobilePanel[] = ["editor", "output", "chat"];
  const handleMobilePanelChange = (next: MobilePanel) => {
    const curIdx = panelOrder.indexOf(mobilePanel);
    const nextIdx = panelOrder.indexOf(next);
    setSlideDirection(nextIdx > curIdx ? 1 : -1);
    setMobilePanel(next);
  };

  const commandActions: CommandAction[] = useMemo(() => [
    { id: "review", label: "Review Code", description: "Analyze code for errors and warnings", icon: Code2, category: "Modes", shortcut: ["⌘", "1"], action: () => setMode("review") },
    { id: "fix", label: "Fix Code", description: "Auto-fix issues with AI suggestions", icon: Wrench, category: "Modes", shortcut: ["⌘", "2"], action: () => setMode("fix") },
    { id: "generate", label: "Generate Code", description: "Generate code from a text prompt", icon: Zap, category: "Modes", shortcut: ["⌘", "3"], action: () => setMode("generate") },
    { id: "analyze", label: "Run Analysis", description: "Analyze the current code", icon: Play, category: "Actions", shortcut: ["⌘", "↵"], action: () => handleAnalyze() },
    { id: "new-session", label: "New Session", description: "Start a fresh coding session", icon: Plus, category: "Actions", action: () => handleNewSession() },
    { id: "toggle-chat", label: "Toggle AI Chat", description: "Open or close the chat panel", icon: MessageSquare, category: "Actions", shortcut: ["⌘", "J"], action: () => setChatOpen((c) => !c) },
    { id: "toggle-sidebar", label: "Toggle Sidebar", description: "Collapse or expand the sidebar", icon: Search, category: "Actions", shortcut: ["⌘", "B"], action: () => setSidebarCollapsed((c) => !c) },
    { id: "settings", label: "Open Settings", description: "Configure preferences and AI behavior", icon: Settings, category: "Actions", action: () => setSettingsOpen(true) },
    { id: "theme-dark", label: "Dark Theme", description: "Switch to dark mode", icon: Moon, category: "Theme", action: () => setTheme("dark") },
    { id: "theme-light", label: "Light Theme", description: "Switch to light mode", icon: Sun, category: "Theme", action: () => setTheme("light") },
    { id: "copy-code", label: "Copy Code", description: "Copy editor contents to clipboard", icon: Copy, category: "Actions", action: () => navigator.clipboard.writeText(code) },
    { id: "clear-history", label: "Clear History", description: "Remove all session history", icon: Trash2, category: "Danger", action: () => {} },
  ], [code]);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [theme]);

  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    setHasAnalyzed(false);
    
    try {
      if (mode === "review") {
        const res = await fetch("/api/review", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code, language, model: aiModel })
        });
        
        if (!res.ok) throw new Error("Failed to analyze code");
        
        const data = await res.json();
        setReviewFeedback(data.feedback || []);
        addHistoryItem({ title: code.trim().slice(0, 50) || "Untitled", mode: "review", language });
      } else if (mode === "fix") {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            model: aiModel,
            messages: [
              {
                role: "system",
                content: `You are an expert ${language} developer. Fix the provided code and apply best practices. Return ONLY the fixed code wrapped in a markdown block. Do not provide explanations outside of code comments.`
              },
              { role: "user", content: code }
            ]
          })
        });
        
        if (!res.ok) throw new Error("Failed to fix code");
        
        const data = await res.json();
        let fx = data.text || "";
        // Strip markdown code block
        fx = fx.replace(/^```[a-z]*\n?/im, "").replace(/\n?```$/m, "").trim();
        setFixedCode(fx);
        addHistoryItem({ title: code.trim().slice(0, 50) || "Untitled", mode: "fix", language });
      }
    } catch (err) {
      console.error(err);
      if (mode === "review") {
        setReviewFeedback([{
          id: "error",
          type: "error",
          line: 0,
          title: "Analysis Failed",
          description: "Could not fetch analysis from OpenRouter.",
        }]);
      } else {
        setFixedCode("// Analysis Failed: Could not fetch fix from OpenRouter.");
      }
    } finally {
      setIsAnalyzing(false);
      setHasAnalyzed(true);
      // On mobile, switch to output panel after analysis
      setSlideDirection(1);
      setMobilePanel("output");
    }
  };

  const handleNewSession = () => {
    setCode("");
    setHasAnalyzed(false);
    setIsAnalyzing(false);
  };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey) {
        if (e.key === "k") { e.preventDefault(); setCommandOpen((c) => !c); return; }
        if (e.key === "1") { e.preventDefault(); setMode("review"); }
        if (e.key === "2") { e.preventDefault(); setMode("fix"); }
        if (e.key === "3") { e.preventDefault(); setMode("generate"); }
        if (e.key === "Enter") { e.preventDefault(); handleAnalyze(); }
        if (e.key === "b") { e.preventDefault(); setSidebarCollapsed((c) => !c); }
        if (e.key === "j") { e.preventDefault(); setChatOpen((c) => !c); }
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const outputPanel = (
    <AnimatePresence mode="wait">
      {!hasAnalyzed && !isAnalyzing ? (
        <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="flex flex-col items-center justify-center h-full gap-4 p-6 text-center"
        >
          <motion.div animate={{ y: [0, -6, 0] }} transition={{ duration: 3, repeat: Infinity }}>
            <Sparkles className="w-12 h-12 text-primary/20" />
          </motion.div>
          <div>
            <p className="text-sm font-medium text-foreground">Ready to analyze</p>
            <p className="text-xs text-muted-foreground mt-1">
              Paste your code and click <kbd className="px-1.5 py-0.5 mx-0.5 text-[10px] bg-muted rounded border border-border/40 font-mono">Analyze</kbd>
            </p>
          </div>
        </motion.div>
      ) : mode === "review" ? (
        <motion.div key="review" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="h-full">
          <ReviewPanel isAnalyzing={isAnalyzing} feedback={reviewFeedback} />
        </motion.div>
      ) : (
        <motion.div key="fix" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="h-full">
          <FixPanel isAnalyzing={isAnalyzing} originalCode={code} fixedCode={fixedCode} />
        </motion.div>
      )}
    </AnimatePresence>
  );

  if (showSplash) {
    return <SplashScreen onComplete={() => setShowSplash(false)} />;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="h-screen flex flex-col bg-background overflow-hidden"
    >
      {/* Background gradients */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-gradient" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl animate-gradient" style={{ animationDelay: "4s" }} />
      </div>

      {/* ===== HEADER ===== */}
      <header className="relative z-10 flex items-center justify-between px-3 md:px-4 py-2 border-b border-border/40 glass-panel-strong gap-2">
        {/* Left: hamburger + logo */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileSidebarOpen(true)}
            className="lg:hidden p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
          >
            <Menu className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Terminal className="w-3.5 h-3.5 md:w-4 md:h-4 text-primary-foreground" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-sm font-bold text-foreground tracking-tight">CodeAI</h1>
              <p className="text-[9px] text-muted-foreground -mt-0.5">Intelligent Code Assistant</p>
            </div>
          </div>
        </div>

        {/* Center: Mode tabs */}
        <div className="flex items-center gap-0.5 sm:gap-1 bg-muted/40 rounded-xl p-0.5 sm:p-1 border border-border/30">
          {modes.map((m) => (
            <button
              key={m.id}
              onClick={() => setMode(m.id)}
              className={cn(
                "relative flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs font-medium transition-colors",
                mode === m.id ? "text-foreground" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {mode === m.id && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-card border border-border/50 rounded-lg shadow-sm"
                  transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-1.5">
                <m.icon className="w-3.5 h-3.5" />
                <span className="hidden md:inline">{m.labelFull}</span>
                <span className="md:hidden text-[11px]">{m.label}</span>
              </span>
            </button>
          ))}
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          {mode !== "generate" && (
            <button
              onClick={handleAnalyze}
              disabled={!code.trim() || isAnalyzing}
              className={cn(
                "flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs font-medium transition-all",
                code.trim() && !isAnalyzing
                  ? "bg-primary text-primary-foreground hover:bg-primary/90 glow-primary"
                  : "bg-muted text-muted-foreground cursor-not-allowed"
              )}
            >
              <Play className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{isAnalyzing ? "Analyzing..." : "Analyze"}</span>
            </button>
          )}
          {/* Desktop chat toggle */}
          <button
            onClick={() => setChatOpen(!chatOpen)}
            className={cn(
              "hidden md:flex p-2 rounded-lg transition-colors border",
              chatOpen
                ? "bg-accent/10 text-accent border-accent/30"
                : "text-muted-foreground hover:text-foreground border-transparent hover:bg-muted/50"
            )}
            title="Toggle AI Chat"
          >
            <MessageSquare className="w-4 h-4" />
          </button>
          <button
            onClick={() => setSettingsOpen(true)}
            className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
            title="Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* ===== MAIN CONTENT ===== */}
      <div className="flex-1 flex overflow-hidden relative z-10">

        {/* Desktop sidebar (hidden on mobile) */}
        <div className="hidden lg:block">
          <AppSidebar
            collapsed={sidebarCollapsed}
            onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
            activeMode={mode}
            onNewSession={handleNewSession}
            history={history}
            onClearHistory={clearHistory}
            onDeleteItem={deleteItem}
          />
        </div>

        {/* Mobile sidebar overlay */}
        <AnimatePresence>
          {mobileSidebarOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-background/60 backdrop-blur-sm z-40 lg:hidden"
                onClick={() => setMobileSidebarOpen(false)}
              />
              <motion.div
                initial={{ x: -300 }}
                animate={{ x: 0 }}
                exit={{ x: -300 }}
                transition={{ type: "spring", bounce: 0.1, duration: 0.4 }}
                className="fixed left-0 top-0 bottom-0 w-[280px] z-50 lg:hidden"
              >
                <div className="h-full relative">
                  <button
                    onClick={() => setMobileSidebarOpen(false)}
                    className="absolute top-3 right-3 z-10 p-1.5 rounded-lg bg-muted/50 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                <AppSidebar
                    collapsed={false}
                    onToggle={() => setMobileSidebarOpen(false)}
                    activeMode={mode}
                    onNewSession={() => { handleNewSession(); setMobileSidebarOpen(false); }}
                    history={history}
                    onClearHistory={clearHistory}
                    onDeleteItem={deleteItem}
                  />
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* ===== DESKTOP LAYOUT (md+) ===== */}
        <div className="hidden md:flex flex-1 overflow-hidden">
          {mode === "generate" ? (
            <div className="flex-1 m-2 glass-panel rounded-xl overflow-hidden">
              <GeneratePanel model={aiModel} />
            </div>
          ) : (
            <>
              <div className="flex-1 m-2 mr-1 min-w-0">
                <CodeEditorPanel code={code} onCodeChange={setCode} language={language} onLanguageChange={setLanguage} />
              </div>
              <div className="w-[340px] lg:w-[380px] m-2 ml-1 glass-panel rounded-xl overflow-hidden shrink-0">
                {outputPanel}
              </div>
            </>
          )}

          {/* Desktop chat panel */}
          <AnimatePresence>
            {chatOpen && (
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 340, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ duration: 0.25, ease: "easeInOut" }}
                className="shrink-0 m-2 ml-0 glass-panel rounded-xl overflow-hidden border-l border-border/30"
              >
                <ChatPanel model={aiModel} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ===== MOBILE LAYOUT (<md) ===== */}
        <div className="flex md:hidden flex-1 flex-col overflow-hidden">
          {mode === "generate" ? (
            <div className="flex-1 m-2 glass-panel rounded-xl overflow-hidden">
              <GeneratePanel model={aiModel} />
            </div>
          ) : (
            <div className="flex-1 overflow-hidden m-2">
              <AnimatePresence mode="wait" custom={slideDirection}>
                <motion.div
                  key={mobilePanel}
                  custom={slideDirection}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  variants={{
                    enter: (dir: number) => ({ x: `${dir * 100}%`, opacity: 0 }),
                    center: { x: 0, opacity: 1 },
                    exit: (dir: number) => ({ x: `${dir * -60}%`, opacity: 0 }),
                  }}
                  transition={{ type: "spring", stiffness: 350, damping: 35 }}
                  className="h-full"
                >
                  {mobilePanel === "editor" && (
                    <CodeEditorPanel code={code} onCodeChange={setCode} language={language} onLanguageChange={setLanguage} />
                  )}
                  {mobilePanel === "output" && (
                    <div className="h-full glass-panel rounded-xl overflow-hidden">
                      {outputPanel}
                    </div>
                  )}
                  {mobilePanel === "chat" && (
                    <div className="h-full glass-panel rounded-xl overflow-hidden">
                      <ChatPanel model={aiModel} />
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          )}

          {/* Mobile bottom tabs (only for review/fix modes) */}
          {mode !== "generate" && (
            <div className="flex items-center border-t border-border/40 glass-panel-strong">
              {([
                { id: "editor" as MobilePanel, label: "Editor", icon: Code2 },
                { id: "output" as MobilePanel, label: mode === "review" ? "Review" : "Fixes", icon: mode === "review" ? Search : Wrench },
                { id: "chat" as MobilePanel, label: "Chat", icon: MessageSquare },
              ]).map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => handleMobilePanelChange(tab.id)}
                  className={cn(
                    "flex-1 flex flex-col items-center gap-0.5 py-2.5 transition-colors",
                    mobilePanel === tab.id ? "text-primary" : "text-muted-foreground"
                  )}
                >
                  <tab.icon className="w-4 h-4" />
                  <span className="text-[10px] font-medium">{tab.label}</span>
                  {mobilePanel === tab.id && (
                    <motion.div layoutId="mobilePanelIndicator" className="w-6 h-0.5 rounded-full bg-primary mt-0.5" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Settings */}
      <SettingsDialog
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        theme={theme}
        onThemeChange={setTheme}
        model={aiModel}
        onModelChange={setAiModel}
      />

      {/* Command Palette */}
      <CommandPalette
        open={commandOpen}
        onClose={() => setCommandOpen(false)}
        actions={commandActions}
      />
    </motion.div>
  );
}
