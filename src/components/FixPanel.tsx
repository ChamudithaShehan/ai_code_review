import React, { useState } from "react";
import { motion } from "framer-motion";
import { Check, ArrowRight, MessageCircle, Copy } from "lucide-react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { sampleCode } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

interface FixPanelProps {
  isAnalyzing: boolean;
  originalCode: string;
  fixedCode: string;
}

export function FixPanel({ isAnalyzing, originalCode, fixedCode }: FixPanelProps) {
  const [applied, setApplied] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);

  if (isAnalyzing) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <motion.div
          className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center"
          animate={{ rotate: [0, 5, -5, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 1, repeat: Infinity }}>
            🔧
          </motion.div>
        </motion.div>
        <p className="text-sm font-medium">Generating fixes...</p>
        <p className="text-xs text-muted-foreground">Applying best practices and fixing issues</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/40">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-foreground">Diff View</span>
          <span className="px-1.5 py-0.5 text-[10px] rounded bg-primary/10 text-primary font-medium">8 changes</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowExplanation(!showExplanation)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs rounded-md bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <MessageCircle className="w-3 h-3" />
            Explain Fix
          </button>
          <button
            onClick={() => setApplied(true)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-md font-medium transition-all",
              applied
                ? "bg-success/15 text-success"
                : "bg-primary text-primary-foreground hover:bg-primary/90 glow-primary"
            )}
          >
            {applied ? <Check className="w-3 h-3" /> : <ArrowRight className="w-3 h-3" />}
            {applied ? "Applied!" : "Apply Fix"}
          </button>
        </div>
      </div>

      {/* Explanation */}
      {showExplanation && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          className="border-b border-border/40 bg-info/5 overflow-hidden"
        >
          <div className="p-4 text-xs text-foreground leading-relaxed space-y-2">
            <p className="font-medium text-info">🔍 Fix Explanation:</p>
            <ul className="space-y-1 text-muted-foreground list-disc pl-4">
              <li>Added <code className="text-primary font-mono text-[11px]">async/await</code> for proper Promise handling</li>
              <li>Replaced <code className="text-primary font-mono text-[11px]">var</code> with <code className="text-primary font-mono text-[11px]">const</code> for block scoping</li>
              <li>Added TypeScript type annotations for type safety</li>
              <li>Added try/catch block for error handling</li>
              <li>Used <code className="text-primary font-mono text-[11px]">Array.map()</code> instead of mutating for loop</li>
              <li>Fixed loose equality (<code className="text-primary font-mono text-[11px]">==</code>) to strict equality (<code className="text-primary font-mono text-[11px]">===</code>)</li>
            </ul>
          </div>
        </motion.div>
      )}

      {/* Diff view */}
      <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 overflow-hidden">
        {/* Original */}
        <div className="border-r border-border/30 overflow-auto scrollbar-thin">
          <div className="px-3 py-1.5 border-b border-border/30 bg-destructive/5">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-destructive">Original</span>
          </div>
          <SyntaxHighlighter
            language="javascript"
            style={oneDark}
            showLineNumbers
            customStyle={{ margin: 0, padding: "12px", background: "transparent", fontSize: "11px", lineHeight: "1.5" }}
            lineNumberStyle={{ color: "hsl(var(--muted-foreground) / 0.2)", fontSize: "10px", paddingRight: "12px" }}
          >
            {originalCode || sampleCode}
          </SyntaxHighlighter>
        </div>

        {/* Fixed */}
        <div className="overflow-auto scrollbar-thin">
          <div className="px-3 py-1.5 border-b border-border/30 bg-success/5">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-success">Fixed</span>
          </div>
          <SyntaxHighlighter
            language="typescript"
            style={oneDark}
            showLineNumbers
            customStyle={{ margin: 0, padding: "12px", background: "transparent", fontSize: "11px", lineHeight: "1.5" }}
            lineNumberStyle={{ color: "hsl(var(--muted-foreground) / 0.2)", fontSize: "10px", paddingRight: "12px" }}
          >
            {fixedCode}
          </SyntaxHighlighter>
        </div>
      </div>
    </div>
  );
}
