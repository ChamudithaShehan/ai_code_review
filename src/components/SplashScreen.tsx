import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Terminal } from "lucide-react";

interface SplashScreenProps {
  onComplete: () => void;
}

const codeLines = [
  "$ initializing codeai...",
  "  ✓ loading syntax engine",
  "  ✓ connecting ai models",
  "  ✓ preparing workspace",
  "  ✓ ready.",
];

export function SplashScreen({ onComplete }: SplashScreenProps) {
  const [visibleLines, setVisibleLines] = useState(0);
  const [progress, setProgress] = useState(0);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const lineTimer = setInterval(() => {
      setVisibleLines((v) => {
        if (v >= codeLines.length) {
          clearInterval(lineTimer);
          return v;
        }
        return v + 1;
      });
    }, 400);
    return () => clearInterval(lineTimer);
  }, []);

  useEffect(() => {
    const progTimer = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(progTimer);
          return 100;
        }
        return p + 2;
      });
    }, 40);
    return () => clearInterval(progTimer);
  }, []);

  useEffect(() => {
    if (progress >= 100 && visibleLines >= codeLines.length) {
      const t = setTimeout(() => setExiting(true), 300);
      return () => clearTimeout(t);
    }
  }, [progress, visibleLines]);

  useEffect(() => {
    if (exiting) {
      const t = setTimeout(onComplete, 600);
      return () => clearTimeout(t);
    }
  }, [exiting, onComplete]);

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-background overflow-hidden"
      animate={exiting ? { opacity: 0, scale: 1.05 } : { opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: "easeInOut" }}
    >
      {/* Animated background orbs */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          className="absolute top-1/3 left-1/4 w-[500px] h-[500px] rounded-full blur-[120px]"
          style={{ background: "radial-gradient(circle, hsl(var(--primary) / 0.15), transparent 70%)" }}
          animate={{ x: [0, 30, -20, 0], y: [0, -20, 30, 0], scale: [1, 1.1, 0.95, 1] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full blur-[100px]"
          style={{ background: "radial-gradient(circle, hsl(var(--accent) / 0.12), transparent 70%)" }}
          animate={{ x: [0, -25, 15, 0], y: [0, 15, -25, 0], scale: [1, 0.9, 1.1, 1] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        />
      </div>

      {/* Content */}
      <div className="relative flex flex-col items-center gap-8 px-6">
        {/* Logo */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
          className="relative"
        >
          <motion.div
            className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-2xl"
            animate={{ boxShadow: [
              "0 0 30px hsl(var(--primary) / 0.3)",
              "0 0 60px hsl(var(--primary) / 0.5)",
              "0 0 30px hsl(var(--primary) / 0.3)",
            ]}}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Terminal className="w-10 h-10 text-primary-foreground" />
          </motion.div>
          {/* Orbiting dot */}
          <motion.div
            className="absolute w-3 h-3 rounded-full bg-accent shadow-lg shadow-accent/50"
            style={{ top: -6, left: "50%", marginLeft: -6 }}
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            initial={false}
          >
            <motion.div
              className="absolute -inset-1 rounded-full bg-accent/30"
              animate={{ scale: [1, 1.8, 1], opacity: [0.6, 0, 0.6] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          </motion.div>
        </motion.div>

        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-center"
        >
          <h1 className="text-3xl font-bold tracking-tight text-gradient-primary">CodeAI</h1>
          <motion.p
            className="text-sm text-muted-foreground mt-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            Intelligent Code Assistant
          </motion.p>
        </motion.div>

        {/* Terminal-style loading */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="w-72 sm:w-80 rounded-xl border border-border/40 bg-card/60 backdrop-blur-xl overflow-hidden"
        >
          <div className="flex items-center gap-1.5 px-3 py-2 border-b border-border/30">
            <div className="w-2.5 h-2.5 rounded-full bg-destructive/60" />
            <div className="w-2.5 h-2.5 rounded-full bg-warning/60" />
            <div className="w-2.5 h-2.5 rounded-full bg-success/60" />
            <span className="ml-2 text-[10px] text-muted-foreground font-mono">terminal</span>
          </div>
          <div className="p-3 font-mono text-xs space-y-1 min-h-[120px]">
            {codeLines.slice(0, visibleLines).map((line, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2 }}
                className={i === 0 ? "text-primary font-semibold" : "text-muted-foreground"}
              >
                {line.includes("✓") ? (
                  <span>
                    <span className="text-success">  ✓</span>
                    <span className="text-foreground">{line.replace("  ✓", "")}</span>
                  </span>
                ) : (
                  line
                )}
              </motion.div>
            ))}
            {/* Blinking cursor */}
            {visibleLines < codeLines.length && (
              <motion.span
                className="inline-block w-2 h-3.5 bg-primary/70"
                animate={{ opacity: [1, 0, 1] }}
                transition={{ duration: 0.8, repeat: Infinity }}
              />
            )}
          </div>
        </motion.div>

        {/* Progress bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="w-72 sm:w-80"
        >
          <div className="h-1.5 rounded-full bg-muted/40 overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{
                background: "linear-gradient(90deg, hsl(var(--primary)), hsl(var(--accent)))",
                width: `${progress}%`,
              }}
              transition={{ duration: 0.1 }}
            />
          </div>
          <div className="flex justify-between mt-2 text-[10px] text-muted-foreground">
            <span>Loading workspace...</span>
            <span>{progress}%</span>
          </div>
        </motion.div>
      </div>

      {/* Scanline effect */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "repeating-linear-gradient(0deg, transparent, transparent 2px, hsl(var(--foreground) / 0.01) 2px, hsl(var(--foreground) / 0.01) 4px)",
        }}
        animate={{ opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 3, repeat: Infinity }}
      />
    </motion.div>
  );
}
