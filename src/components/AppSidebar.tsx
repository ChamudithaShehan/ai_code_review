import React, { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Plus, Clock, Code2, Wrench, Zap, Filter,
  ChevronLeft, ChevronRight, Trash2
} from "lucide-react";
import { type HistoryItem } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

interface AppSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  activeMode: string;
  onNewSession: () => void;
  history: HistoryItem[];
  onClearHistory: () => void;
  onDeleteItem: (id: string) => void;
}

const modeIcons: Record<string, React.ElementType> = {
  review: Code2,
  fix: Wrench,
  generate: Zap,
};

const modeColors: Record<string, string> = {
  review: "text-destructive",
  fix: "text-warning",
  generate: "text-primary",
};

export function AppSidebar({ collapsed, onToggle, onNewSession, history, onClearHistory, onDeleteItem }: AppSidebarProps) {
  const [search, setSearch] = useState("");
  const [filterLang, setFilterLang] = useState<string | null>(null);

  const filtered = history.filter((item) => {
    const matchSearch = item.title.toLowerCase().includes(search.toLowerCase());
    const matchLang = !filterLang || item.language === filterLang;
    return matchSearch && matchLang;
  });

  const languages = [...new Set(history.map((h) => h.language))];

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 56 : 280 }}
      transition={{ duration: 0.25, ease: "easeInOut" }}
      className="relative flex flex-col h-full glass-panel-strong border-r border-border/50 z-20 overflow-hidden shrink-0"
    >
      {/* Toggle button */}
      <button
        onClick={onToggle}
        className="absolute -right-3 top-4 z-30 w-6 h-6 rounded-full bg-secondary border border-border flex items-center justify-center hover:bg-muted transition-colors"
      >
        {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
      </button>

      {!collapsed && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="flex flex-col h-full"
        >
          {/* New session button */}
          <div className="p-3">
            <button
              onClick={onNewSession}
              className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors text-sm font-medium"
            >
              <Plus className="w-4 h-4" />
              New Session
            </button>
          </div>

          {/* Search */}
          <div className="px-3 pb-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search history..."
                className="w-full pl-8 pr-3 py-2 text-xs rounded-md bg-muted/50 border border-border/50 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 transition"
              />
            </div>
          </div>

          {/* Language filter */}
          <div className="px-3 pb-2 flex gap-1 flex-wrap">
            <button
              onClick={() => setFilterLang(null)}
              className={cn(
                "px-2 py-0.5 text-[10px] rounded-full border transition-colors",
                !filterLang ? "bg-primary/15 text-primary border-primary/30" : "bg-muted/50 text-muted-foreground border-border/50 hover:bg-muted"
              )}
            >
              All
            </button>
            {languages.map((lang) => (
              <button
                key={lang}
                onClick={() => setFilterLang(filterLang === lang ? null : lang)}
                className={cn(
                  "px-2 py-0.5 text-[10px] rounded-full border transition-colors",
                  filterLang === lang ? "bg-primary/15 text-primary border-primary/30" : "bg-muted/50 text-muted-foreground border-border/50 hover:bg-muted"
                )}
              >
                {lang}
              </button>
            ))}
          </div>

          {/* History list */}
          <div className="flex-1 overflow-y-auto scrollbar-thin px-2">
            <div className="px-1 py-1.5">
              <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">History</span>
            </div>
            <AnimatePresence>
              {filtered.map((item, i) => {
                const Icon = modeIcons[item.mode];
                return (
                  <motion.button
                    key={item.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ delay: i * 0.03 }}
                    className="w-full group flex items-start gap-2.5 px-2.5 py-2 rounded-lg hover:bg-muted/60 transition-colors text-left relative"
                  >
                    <Icon className={cn("w-3.5 h-3.5 mt-0.5 shrink-0", modeColors[item.mode])} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate text-foreground">{item.title}</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[10px] text-muted-foreground">{item.language}</span>
                        <span className="text-[10px] text-muted-foreground/50">·</span>
                        <Clock className="w-2.5 h-2.5 text-muted-foreground/50" />
                        <span className="text-[10px] text-muted-foreground/70">{item.timestamp}</span>
                      </div>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); onDeleteItem(item.id); }}
                      className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-destructive/20 hover:text-destructive text-muted-foreground transition-all shrink-0"
                      title="Delete"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </motion.button>
                );
              })}
            </AnimatePresence>
          </div>

          {/* Clear history */}
          <div className="p-3 border-t border-border/30">
            <button
              onClick={onClearHistory}
              disabled={history.length === 0}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors text-xs disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear History
            </button>
          </div>
        </motion.div>
      )}

      {collapsed && (
        <div className="flex flex-col items-center gap-2 pt-14">
          <button
            onClick={onNewSession}
            className="w-9 h-9 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 flex items-center justify-center transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
          {history.slice(0, 5).map((item) => {
            const Icon = modeIcons[item.mode];
            return (
              <button
                key={item.id}
                className="w-9 h-9 rounded-lg hover:bg-muted/60 flex items-center justify-center transition-colors"
                title={item.title}
              >
                <Icon className={cn("w-3.5 h-3.5", modeColors[item.mode])} />
              </button>
            );
          })}
        </div>
      )}
    </motion.aside>
  );
}
