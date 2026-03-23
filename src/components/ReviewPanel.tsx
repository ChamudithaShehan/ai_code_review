import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertCircle, AlertTriangle, Lightbulb, ChevronDown, ChevronRight,
  ExternalLink
} from "lucide-react";
import { type ReviewFeedback } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

interface ReviewPanelProps {
  isAnalyzing: boolean;
  feedback?: ReviewFeedback[];
}

const typeConfig = {
  error: { icon: AlertCircle, color: "text-destructive", bg: "bg-destructive/10", border: "border-destructive/20", label: "Error" },
  warning: { icon: AlertTriangle, color: "text-warning", bg: "bg-warning/10", border: "border-warning/20", label: "Warning" },
  suggestion: { icon: Lightbulb, color: "text-primary", bg: "bg-primary/10", border: "border-primary/20", label: "Suggestion" },
};

export function ReviewPanel({ isAnalyzing, feedback = [] }: ReviewPanelProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [revealCount, setRevealCount] = useState(0);

  const errors = feedback.filter((f) => f.type === "error");
  const warnings = feedback.filter((f) => f.type === "warning");
  const suggestions = feedback.filter((f) => f.type === "suggestion");

  // Simulate progressive reveal
  React.useEffect(() => {
    if (!isAnalyzing) {
      setRevealCount(0);
      const interval = setInterval(() => {
        setRevealCount((c) => {
          if (c >= feedback.length) {
            clearInterval(interval);
            return c;
          }
          return c + 1;
        });
      }, 200);
      return () => clearInterval(interval);
    }
  }, [isAnalyzing, feedback.length]);

  if (isAnalyzing) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <div className="relative w-16 h-16">
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-primary/30"
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          />
          <motion.div
            className="absolute inset-1 rounded-full border-2 border-t-primary border-r-transparent border-b-transparent border-l-transparent"
            animate={{ rotate: -360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          />
          <motion.div
            className="absolute inset-3 rounded-full bg-primary/10 flex items-center justify-center"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
          >
            <AlertCircle className="w-5 h-5 text-primary" />
          </motion.div>
        </div>
        <div className="text-center">
          <p className="text-sm font-medium text-foreground">Analyzing your code...</p>
          <p className="text-xs text-muted-foreground mt-1">Checking for errors, warnings, and improvements</p>
        </div>
        {/* Shimmer skeleton */}
        <div className="w-full max-w-sm space-y-2 mt-4">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-12 rounded-lg bg-muted/30 animate-shimmer" style={{ backgroundImage: "linear-gradient(90deg, transparent, hsl(var(--muted-foreground) / 0.05), transparent)", backgroundSize: "200% 100%", animationDelay: `${i * 0.2}s` }} />
          ))}
        </div>
      </div>
    );
  }

  const visibleFeedback = feedback.slice(0, revealCount);

  return (
    <div className="flex flex-col h-full">
      {/* Summary bar */}
      <div className="flex items-center gap-4 px-4 py-3 border-b border-border/40">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-destructive" />
          <span className="text-xs font-medium">{errors.length} Errors</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-warning" />
          <span className="text-xs font-medium">{warnings.length} Warnings</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-primary" />
          <span className="text-xs font-medium">{suggestions.length} Suggestions</span>
        </div>
      </div>

      {/* Feedback list */}
      <div className="flex-1 overflow-y-auto scrollbar-thin p-3 space-y-2">
        <AnimatePresence>
          {visibleFeedback.map((item, i) => {
            const config = typeConfig[item.type];
            const Icon = config.icon;
            const isExpanded = expandedId === item.id;

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className={cn(
                  "rounded-lg border overflow-hidden transition-all",
                  config.border,
                  config.bg
                )}
              >
                <button
                  onClick={() => setExpandedId(isExpanded ? null : item.id)}
                  className="w-full flex items-start gap-3 p-3 text-left"
                >
                  <Icon className={cn("w-4 h-4 mt-0.5 shrink-0", config.color)} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={cn("text-[10px] font-semibold uppercase tracking-wider", config.color)}>
                        {config.label}
                      </span>
                      <span className="text-[10px] text-muted-foreground">Line {item.line}</span>
                    </div>
                    <p className="text-xs font-medium mt-0.5 text-foreground">{item.title}</p>
                  </div>
                  {isExpanded ? (
                    <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
                  )}
                </button>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="px-3 pb-3 pl-10">
                        <p className="text-xs text-muted-foreground leading-relaxed">{item.description}</p>
                        {item.code && (
                          <div className="mt-2 p-2 rounded-md bg-card/80 border border-border/30">
                            <code className="text-[11px] font-mono text-primary">{item.code}</code>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
