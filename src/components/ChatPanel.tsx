import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Bot, User, Sparkles, Code2, MessageSquare } from "lucide-react";
import { type ChatMessage } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const quickActions = [
  "Explain this code",
  "How can I optimize this?",
  "What are the security risks?",
  "Add unit tests",
];

interface ChatPanelProps {
  model: string;
}

export function ChatPanel({ model }: ChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([{
    id: "1",
    role: "assistant",
    content: "👋 Hey! I'm your AI code assistant. I can help you review, fix, or generate code. What would you like to work on?",
    timestamp: "Just now",
  }]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, isTyping]);

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: text,
      timestamp: "Just now",
    };
    
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setIsTyping(true);

    try {
      const apiMessages = [
        { role: "system", content: "You are a helpful expert programming assistant." },
        ...newMessages.map(m => ({
          role: m.role,
          content: m.content
        }))
      ];

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model,
          messages: apiMessages
        })
      });

      if (!res.ok) throw new Error("Chat request failed");
      const data = await res.json();
      
      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.text || "Sorry, I received an empty response.",
        timestamp: "Just now",
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      console.error(err);
      const errMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "⚠️ Sorry, there was an error communicating with the OpenRouter AI. Please verify your connection or API key.",
        timestamp: "Just now",
      };
      setMessages(prev => [...prev, errMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const renderContent = (content: string) => {
    const parts = content.split(/(```[\s\S]*?```)/g);
    return parts.map((part, i) => {
      if (part.startsWith("```")) {
        const code = part.replace(/```\w*\n?/, "").replace(/```$/, "");
        return (
          <pre key={i} className="my-2 p-3 rounded-lg bg-background/80 border border-border/30 overflow-x-auto scrollbar-thin">
            <code className="text-[11px] font-mono text-foreground">{code}</code>
          </pre>
        );
      }
      // Simple markdown: bold, inline code
      const formatted = part
        .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-foreground">$1</strong>')
        .replace(/`(.*?)`/g, '<code class="px-1 py-0.5 rounded bg-muted text-primary text-[11px] font-mono">$1</code>');
      return <span key={i} dangerouslySetInnerHTML={{ __html: formatted }} />;
    });
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border/40">
        <MessageSquare className="w-4 h-4 text-accent" />
        <span className="text-xs font-semibold text-foreground">AI Assistant</span>
        <span className="ml-auto px-1.5 py-0.5 text-[9px] rounded-full bg-success/15 text-success font-medium">Online</span>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto scrollbar-thin p-4 space-y-4">
        <AnimatePresence>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn("flex gap-2.5", msg.role === "user" ? "justify-end" : "justify-start")}
            >
              {msg.role === "assistant" && (
                <div className="w-7 h-7 rounded-lg bg-accent/15 flex items-center justify-center shrink-0 mt-0.5">
                  <Bot className="w-3.5 h-3.5 text-accent" />
                </div>
              )}
              <div
                className={cn(
                  "max-w-[80%] rounded-xl px-3.5 py-2.5 text-xs leading-relaxed",
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground rounded-br-sm"
                    : "bg-muted/60 text-foreground rounded-bl-sm"
                )}
              >
                {renderContent(msg.content)}
                <span className="block text-[9px] opacity-40 mt-1.5">{msg.timestamp}</span>
              </div>
              {msg.role === "user" && (
                <div className="w-7 h-7 rounded-lg bg-primary/15 flex items-center justify-center shrink-0 mt-0.5">
                  <User className="w-3.5 h-3.5 text-primary" />
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Typing indicator */}
        {isTyping && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-accent/15 flex items-center justify-center shrink-0">
              <Bot className="w-3.5 h-3.5 text-accent" />
            </div>
            <div className="bg-muted/60 rounded-xl rounded-bl-sm px-4 py-3 flex items-center gap-1.5">
              <motion.span animate={{ opacity: [0.2, 1, 0.2] }} transition={{ duration: 1.4, repeat: Infinity, delay: 0 }} className="w-1.5 h-1.5 rounded-full bg-muted-foreground" />
              <motion.span animate={{ opacity: [0.2, 1, 0.2] }} transition={{ duration: 1.4, repeat: Infinity, delay: 0.2 }} className="w-1.5 h-1.5 rounded-full bg-muted-foreground" />
              <motion.span animate={{ opacity: [0.2, 1, 0.2] }} transition={{ duration: 1.4, repeat: Infinity, delay: 0.4 }} className="w-1.5 h-1.5 rounded-full bg-muted-foreground" />
            </div>
          </motion.div>
        )}
      </div>

      {/* Quick actions */}
      <div className="px-4 pb-2 flex gap-1.5 flex-wrap">
        {quickActions.map((action) => (
          <button
            key={action}
            onClick={() => sendMessage(action)}
            className="px-2.5 py-1 text-[10px] rounded-full border border-border/50 text-muted-foreground hover:text-accent hover:border-accent/40 transition-colors"
          >
            {action}
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="p-3 border-t border-border/40">
        <div className="flex items-center gap-2 bg-muted/40 rounded-lg px-3 py-2 border border-border/30 focus-within:border-accent/40 transition-colors">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(input); } }}
            placeholder="Ask about your code..."
            className="flex-1 bg-transparent text-xs text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={!input.trim()}
            className={cn(
              "p-1.5 rounded-md transition-all",
              input.trim() ? "text-accent hover:bg-accent/10" : "text-muted-foreground/30"
            )}
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
