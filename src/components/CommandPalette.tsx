import React, { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Code2, Wrench, Zap, Settings, MessageSquare, Trash2,
  Plus, Sun, Moon, Copy, Maximize2, ArrowRight, Command, CornerDownLeft
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface CommandAction {
  id: string;
  label: string;
  description?: string;
  icon: React.ElementType;
  category: string;
  shortcut?: string[];
  action: () => void;
}

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
  actions: CommandAction[];
}

function fuzzyMatch(text: string, query: string): { match: boolean; score: number } {
  const t = text.toLowerCase();
  const q = query.toLowerCase();
  if (!q) return { match: true, score: 0 };
  if (t.includes(q)) return { match: true, score: 100 - t.indexOf(q) };

  let qi = 0;
  let score = 0;
  let lastMatchIdx = -1;
  for (let ti = 0; ti < t.length && qi < q.length; ti++) {
    if (t[ti] === q[qi]) {
      score += 10;
      if (lastMatchIdx === ti - 1) score += 5; // consecutive bonus
      lastMatchIdx = ti;
      qi++;
    }
  }
  return { match: qi === q.length, score };
}

export function CommandPalette({ open, onClose, actions }: CommandPaletteProps) {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Reset on open
  useEffect(() => {
    if (open) {
      setQuery("");
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  const filtered = useMemo(() => {
    return actions
      .map((a) => ({ ...a, ...fuzzyMatch(`${a.label} ${a.description ?? ""} ${a.category}`, query) }))
      .filter((a) => a.match)
      .sort((a, b) => b.score - a.score);
  }, [actions, query]);

  // Group by category
  const grouped = useMemo(() => {
    const map = new Map<string, typeof filtered>();
    filtered.forEach((item) => {
      const list = map.get(item.category) ?? [];
      list.push(item);
      map.set(item.category, list);
    });
    return map;
  }, [filtered]);

  // Flat list for keyboard nav
  const flatList = useMemo(() => {
    const result: typeof filtered = [];
    grouped.forEach((items) => result.push(...items));
    return result;
  }, [grouped]);

  // Clamp selected index
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Scroll selected into view
  useEffect(() => {
    const el = listRef.current?.querySelector(`[data-index="${selectedIndex}"]`);
    el?.scrollIntoView({ block: "nearest" });
  }, [selectedIndex]);

  const runSelected = () => {
    const item = flatList[selectedIndex];
    if (item) {
      item.action();
      onClose();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((i) => Math.min(i + 1, flatList.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      runSelected();
    } else if (e.key === "Escape") {
      onClose();
    }
  };

  if (!open) return null;

  let globalIdx = -1;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.15 }}
        className="fixed inset-0 z-[60] flex items-start justify-center pt-[18vh] bg-background/50 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: -10 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-lg glass-panel-strong rounded-2xl shadow-2xl overflow-hidden border border-border/60"
        >
          {/* Search input */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-border/40">
            <Search className="w-4 h-4 text-muted-foreground shrink-0" />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a command or search..."
              className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
            />
            <kbd className="hidden sm:flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground bg-muted/50 border border-border/40 rounded">
              ESC
            </kbd>
          </div>

          {/* Results */}
          <div ref={listRef} className="max-h-[320px] overflow-y-auto scrollbar-thin py-2">
            {flatList.length === 0 && (
              <div className="px-4 py-8 text-center">
                <p className="text-sm text-muted-foreground">No results found</p>
                <p className="text-xs text-muted-foreground/60 mt-1">Try a different search term</p>
              </div>
            )}

            {Array.from(grouped.entries()).map(([category, items]) => (
              <div key={category}>
                <div className="px-4 py-1.5">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">
                    {category}
                  </span>
                </div>
                {items.map((item) => {
                  globalIdx++;
                  const idx = globalIdx;
                  const isSelected = idx === selectedIndex;
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      data-index={idx}
                      onClick={() => { item.action(); onClose(); }}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      className={cn(
                        "w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors",
                        isSelected ? "bg-primary/10 text-foreground" : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <div className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors",
                        isSelected ? "bg-primary/15 text-primary" : "bg-muted/40 text-muted-foreground"
                      )}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium truncate">{item.label}</p>
                        {item.description && (
                          <p className="text-[10px] text-muted-foreground truncate">{item.description}</p>
                        )}
                      </div>
                      {item.shortcut && (
                        <div className="flex items-center gap-0.5 shrink-0">
                          {item.shortcut.map((k) => (
                            <kbd key={k} className="px-1.5 py-0.5 text-[10px] font-mono bg-muted/40 border border-border/30 rounded text-muted-foreground">
                              {k}
                            </kbd>
                          ))}
                        </div>
                      )}
                      {isSelected && !item.shortcut && (
                        <CornerDownLeft className="w-3 h-3 text-primary shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Footer hint */}
          <div className="flex items-center gap-4 px-4 py-2 border-t border-border/30 text-[10px] text-muted-foreground/50">
            <span className="flex items-center gap-1">
              <kbd className="px-1 py-0.5 bg-muted/30 border border-border/20 rounded text-[9px]">↑↓</kbd> Navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1 py-0.5 bg-muted/30 border border-border/20 rounded text-[9px]">↵</kbd> Select
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1 py-0.5 bg-muted/30 border border-border/20 rounded text-[9px]">Esc</kbd> Close
            </span>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
