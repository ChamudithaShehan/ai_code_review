import React, { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Copy, Maximize2, Minimize2, Upload, FileCode, X, ChevronDown
} from "lucide-react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { languages } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

interface CodeEditorPanelProps {
  code: string;
  onCodeChange: (code: string) => void;
  language: string;
  onLanguageChange: (lang: string) => void;
}

export function CodeEditorPanel({ code, onCodeChange, language, onLanguageChange }: CodeEditorPanelProps) {
  const [fullscreen, setFullscreen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showLangDropdown, setShowLangDropdown] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const tabs = [{ name: "main.js" }, { name: "utils.ts" }];

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [code]);

  const handlePaste = useCallback((e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    // Let default paste work — textarea handles it natively
  }, []);

  const focusEditor = () => {
    setIsEditing(true);
    setTimeout(() => textareaRef.current?.focus(), 0);
  };

  const lineCount = code ? code.split("\n").length : 0;

  return (
    <motion.div
      layout
      className={cn(
        "flex flex-col glass-panel rounded-xl overflow-hidden",
        fullscreen ? "fixed inset-4 z-50" : "h-full"
      )}
    >
      {/* Toolbar */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-border/40 bg-surface/50">
        <div className="flex items-center gap-1">
          {tabs.map((tab, i) => (
            <button
              key={tab.name}
              onClick={() => setActiveTab(i)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs transition-colors",
                activeTab === i
                  ? "bg-muted text-foreground font-medium"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              <FileCode className="w-3 h-3" />
              {tab.name}
              {activeTab === i && (
                <X className="w-2.5 h-2.5 ml-1 opacity-50 hover:opacity-100 cursor-pointer" />
              )}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1">
          <div className="relative">
            <button
              onClick={() => setShowLangDropdown(!showLangDropdown)}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-muted-foreground hover:text-foreground rounded-md hover:bg-muted/50 transition-colors"
            >
              {language}
              <ChevronDown className="w-3 h-3" />
            </button>
            {showLangDropdown && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowLangDropdown(false)} />
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute right-0 top-full mt-1 w-36 bg-popover border border-border rounded-lg shadow-xl z-50 py-1 max-h-48 overflow-y-auto scrollbar-thin"
                >
                  {languages.map((lang) => (
                    <button
                      key={lang}
                      onClick={() => { onLanguageChange(lang); setShowLangDropdown(false); }}
                      className={cn(
                        "w-full text-left px-3 py-1.5 text-xs hover:bg-muted/60 transition-colors",
                        language === lang ? "text-primary font-medium" : "text-foreground"
                      )}
                    >
                      {lang}
                    </button>
                  ))}
                </motion.div>
              </>
            )}
          </div>

          <button onClick={handleCopy} className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors" title="Copy code">
            <Copy className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => setFullscreen(!fullscreen)} className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors">
            {fullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Copied toast */}
      <AnimatePresence>
        {copied && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-14 right-4 z-50 px-3 py-1.5 bg-primary text-primary-foreground text-xs rounded-lg shadow-lg"
          >
            Copied!
          </motion.div>
        )}
      </AnimatePresence>

      {/* Editor area */}
      <div
        ref={scrollRef}
        className={cn(
          "flex-1 relative overflow-auto scrollbar-thin",
          dragOver && "ring-2 ring-primary/50 ring-inset"
        )}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); }}
      >
        {code || isEditing ? (
          <div className="relative min-h-full">
            {/* Syntax highlighted layer — click to edit */}
            {!isEditing && (
              <div onClick={focusEditor} className="cursor-text min-h-full">
                <SyntaxHighlighter
                  language={language.toLowerCase()}
                  style={oneDark}
                  showLineNumbers
                  customStyle={{
                    margin: 0,
                    padding: "16px",
                    background: "transparent",
                    fontSize: "13px",
                    lineHeight: "1.6",
                    minHeight: "100%",
                  }}
                  lineNumberStyle={{
                    color: "hsl(var(--muted-foreground) / 0.3)",
                    fontSize: "11px",
                    paddingRight: "16px",
                    minWidth: "2.5em",
                  }}
                >
                  {code || " "}
                </SyntaxHighlighter>
              </div>
            )}

            {/* Editable textarea — shown when editing */}
            {isEditing && (
              <div className="flex min-h-full">
                {/* Line numbers */}
                <div className="select-none pt-4 pl-4 pr-0 text-right" style={{ minWidth: "3.5em" }}>
                  {Array.from({ length: Math.max(lineCount, 1) }, (_, i) => (
                    <div key={i} className="text-[11px] leading-[1.6] text-muted-foreground/30 pr-4">
                      {i + 1}
                    </div>
                  ))}
                </div>
                <textarea
                  ref={textareaRef}
                  value={code}
                  onChange={(e) => onCodeChange(e.target.value)}
                  onPaste={handlePaste}
                  onBlur={() => setIsEditing(false)}
                  className="flex-1 bg-transparent text-foreground font-mono text-[13px] leading-[1.6] p-4 pl-0 resize-none focus:outline-none min-h-full scrollbar-thin"
                  spellCheck={false}
                  autoCorrect="off"
                  autoCapitalize="off"
                />
              </div>
            )}
          </div>
        ) : (
          /* Empty state — click or paste to start */
          <div
            className="flex flex-col items-center justify-center h-full gap-4 text-muted-foreground cursor-text"
            onClick={focusEditor}
          >
            {/* Hidden textarea for paste when empty */}
            <textarea
              ref={!code && !isEditing ? textareaRef : undefined}
              value=""
              onChange={(e) => { onCodeChange(e.target.value); setIsEditing(true); }}
              onPaste={(e) => {
                const text = e.clipboardData.getData("text");
                if (text) {
                  e.preventDefault();
                  onCodeChange(text);
                  setIsEditing(false);
                }
              }}
              onFocus={() => {}}
              className="absolute inset-0 w-full h-full opacity-0 cursor-text"
              spellCheck={false}
            />
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Upload className="w-10 h-10 opacity-40" />
            </motion.div>
            <div className="text-center">
              <p className="text-sm font-medium">Paste or drop your code here</p>
              <p className="text-xs mt-1 opacity-60">Click to start typing or paste with ⌘V</p>
            </div>
          </div>
        )}

        {/* Drag overlay */}
        {dragOver && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-primary/5 backdrop-blur-sm flex items-center justify-center z-10"
          >
            <div className="flex flex-col items-center gap-2 text-primary">
              <Upload className="w-8 h-8" />
              <p className="text-sm font-medium">Drop your file here</p>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
