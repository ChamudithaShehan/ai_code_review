import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, User, Palette, Type, Code2, Brain, Bell, Trash2, Keyboard,
  Sun, Moon, Monitor, ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SettingsDialogProps {
  open: boolean;
  onClose: () => void;
  theme: string;
  onThemeChange: (t: string) => void;
  model: string;
  onModelChange: (m: string) => void;
}

const sections = [
  { id: "profile", label: "Profile", icon: User },
  { id: "appearance", label: "Appearance", icon: Palette },
  { id: "editor", label: "Editor", icon: Code2 },
  { id: "ai", label: "AI Settings", icon: Brain },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "shortcuts", label: "Shortcuts", icon: Keyboard },
  { id: "data", label: "Data", icon: Trash2 },
];

const shortcuts = [
  { keys: ["⌘", "Enter"], desc: "Run analysis / Generate" },
  { keys: ["⌘", "K"], desc: "Open command palette" },
  { keys: ["⌘", "S"], desc: "Save session" },
  { keys: ["⌘", "B"], desc: "Toggle sidebar" },
  { keys: ["⌘", "J"], desc: "Toggle chat" },
  { keys: ["⌘", "1"], desc: "Review mode" },
  { keys: ["⌘", "2"], desc: "Fix mode" },
  { keys: ["⌘", "3"], desc: "Generate mode" },
];

export function SettingsDialog({ open, onClose, theme, onThemeChange, model, onModelChange }: SettingsDialogProps) {
  const [activeSection, setActiveSection] = useState("profile");
  const [fontSize, setFontSize] = useState(14);
  const [tabStyle, setTabStyle] = useState<"spaces" | "tabs">("spaces");
  const [strictness, setStrictness] = useState(70);
  const [responseStyle, setResponseStyle] = useState<"concise" | "detailed">("detailed");
  const [notifications, setNotifications] = useState(true);

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-background/60 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-2xl max-h-[85vh] mx-4 glass-panel-strong rounded-2xl overflow-hidden flex flex-col sm:flex-row"
        >
          {/* Left nav */}
          <div className="w-full sm:w-48 border-b sm:border-b-0 sm:border-r border-border/40 py-3 sm:py-4 shrink-0 overflow-x-auto sm:overflow-x-visible">
            <h2 className="px-4 text-sm font-semibold text-foreground mb-2 sm:mb-3">Settings</h2>
            <nav className="flex sm:flex-col gap-0.5 px-2 overflow-x-auto sm:overflow-x-visible pb-1 sm:pb-0">
              {sections.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setActiveSection(s.id)}
                  className={cn(
                    "w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs transition-colors",
                    activeSection === s.id
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  )}
                >
                  <s.icon className="w-3.5 h-3.5" />
                  {s.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto scrollbar-thin">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border/30">
              <h3 className="text-sm font-semibold capitalize">{activeSection === "ai" ? "AI Settings" : activeSection}</h3>
              <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {activeSection === "profile" && (
                <>
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-2xl font-bold text-primary-foreground">D</div>
                    <div>
                      <p className="text-sm font-semibold">Developer</p>
                      <p className="text-xs text-muted-foreground">dev@example.com</p>
                      <button className="text-[11px] text-primary mt-1 hover:underline">Change avatar</button>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <label className="block">
                      <span className="text-xs text-muted-foreground mb-1.5 block">Display Name</span>
                      <input defaultValue="Developer" className="w-full px-3 py-2 text-sm bg-muted/40 border border-border/40 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary/50" />
                    </label>
                    <label className="block">
                      <span className="text-xs text-muted-foreground mb-1.5 block">Email</span>
                      <input defaultValue="dev@example.com" className="w-full px-3 py-2 text-sm bg-muted/40 border border-border/40 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary/50" />
                    </label>
                  </div>
                </>
              )}

              {activeSection === "appearance" && (
                <>
                  <div>
                    <span className="text-xs font-medium text-foreground block mb-3">Theme</span>
                    <div className="flex gap-2">
                      {[
                        { id: "light", icon: Sun, label: "Light" },
                        { id: "dark", icon: Moon, label: "Dark" },
                        { id: "system", icon: Monitor, label: "System" },
                      ].map((t) => (
                        <button
                          key={t.id}
                          onClick={() => onThemeChange(t.id)}
                          className={cn(
                            "flex-1 flex flex-col items-center gap-2 py-4 rounded-xl border-2 transition-all",
                            theme === t.id
                              ? "border-primary bg-primary/5"
                              : "border-border/40 hover:border-border"
                          )}
                        >
                          <t.icon className={cn("w-5 h-5", theme === t.id ? "text-primary" : "text-muted-foreground")} />
                          <span className="text-xs font-medium">{t.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {activeSection === "editor" && (
                <>
                  <div>
                    <span className="text-xs font-medium text-foreground block mb-2">Font Size: {fontSize}px</span>
                    <input type="range" min={10} max={20} value={fontSize} onChange={(e) => setFontSize(Number(e.target.value))} className="w-full accent-primary" />
                  </div>
                  <div>
                    <span className="text-xs font-medium text-foreground block mb-3">Indentation</span>
                    <div className="flex gap-2">
                      {(["spaces", "tabs"] as const).map((s) => (
                        <button
                          key={s}
                          onClick={() => setTabStyle(s)}
                          className={cn(
                            "flex-1 py-2.5 rounded-lg border text-xs font-medium capitalize transition-all",
                            tabStyle === s ? "border-primary bg-primary/10 text-primary" : "border-border/40 text-muted-foreground hover:text-foreground"
                          )}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {activeSection === "ai" && (
                <>
                  <div>
                    <span className="text-xs font-medium text-foreground block mb-2">AI Model</span>
                    <select
                      value={model}
                      onChange={(e) => onModelChange(e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-muted/40 border border-border/40 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary/50 text-foreground appearance-none"
                    >
                      <option value="qwen/qwen3-coder:free">Qwen 3 Coder (Free)</option>
                      <option value="qwen/qwen3-next-80b-a3b-instruct:free">Qwen 3 Next 80B (Free)</option>
                      <option value="stepfun/step-3.5-flash:free">StepFun 3.5 Flash (Free)</option>
                      <option value="openai/gpt-oss-120b:free">GPT OSS 120B (Free)</option>
                      <option value="nvidia/nemotron-3-super-120b-a12b:free">Nemotron 3 Super 120B (Free)</option>
                    </select>
                  </div>
                  <div>
                    <span className="text-xs font-medium text-foreground block mb-2 mt-4">Strictness Level: {strictness}%</span>
                    <input type="range" min={0} max={100} value={strictness} onChange={(e) => setStrictness(Number(e.target.value))} className="w-full accent-primary" />
                    <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                      <span>Lenient</span>
                      <span>Strict</span>
                    </div>
                  </div>
                  <div>
                    <span className="text-xs font-medium text-foreground block mb-3">Response Style</span>
                    <div className="flex gap-2">
                      {(["concise", "detailed"] as const).map((s) => (
                        <button
                          key={s}
                          onClick={() => setResponseStyle(s)}
                          className={cn(
                            "flex-1 py-2.5 rounded-lg border text-xs font-medium capitalize transition-all",
                            responseStyle === s ? "border-primary bg-primary/10 text-primary" : "border-border/40 text-muted-foreground hover:text-foreground"
                          )}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {activeSection === "notifications" && (
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium">Enable Notifications</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">Get notified when analysis is complete</p>
                  </div>
                  <button
                    onClick={() => setNotifications(!notifications)}
                    className={cn(
                      "w-10 h-6 rounded-full transition-colors relative",
                      notifications ? "bg-primary" : "bg-muted"
                    )}
                  >
                    <motion.div
                      animate={{ x: notifications ? 18 : 2 }}
                      className="w-4 h-4 rounded-full bg-primary-foreground absolute top-1"
                    />
                  </button>
                </div>
              )}

              {activeSection === "shortcuts" && (
                <div className="space-y-2">
                  {shortcuts.map((s) => (
                    <div key={s.desc} className="flex items-center justify-between py-2 border-b border-border/20 last:border-0">
                      <span className="text-xs text-muted-foreground">{s.desc}</span>
                      <div className="flex gap-1">
                        {s.keys.map((k) => (
                          <kbd key={k} className="px-2 py-0.5 text-[10px] font-mono bg-muted/60 border border-border/40 rounded text-foreground">{k}</kbd>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeSection === "data" && (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl border border-destructive/20 bg-destructive/5">
                    <p className="text-xs font-medium text-destructive mb-1">Clear All History</p>
                    <p className="text-[11px] text-muted-foreground mb-3">This will permanently delete all your code review and generation history.</p>
                    <button className="px-4 py-2 text-xs font-medium rounded-lg bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors">
                      Clear History
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
