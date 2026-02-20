"use client"

import { useState, useRef, useEffect } from "react"
import {
  Send,
  Copy,
  RotateCcw,
  AlertCircle,
  Info,
  X,
  ChevronDown,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"

interface ChatMessage {
  role: "user" | "assistant" | "system"
  content: string
  timestamp: string
  tokens?: number
  latency?: string
}

interface LogEntry {
  timestamp: string
  level: "info" | "warn" | "error" | "debug"
  message: string
}

const initialMessages: ChatMessage[] = [
  {
    role: "system",
    content: "System initialized. LLaMA-3.1-70B loaded across 2x A100 GPUs. 80 layers active.",
    timestamp: "14:23:01",
  },
  {
    role: "user",
    content: "Explain the transformer attention mechanism in detail, focusing on multi-head attention and its computational complexity.",
    timestamp: "14:23:15",
  },
  {
    role: "assistant",
    content: "The transformer attention mechanism computes scaled dot-product attention as:\n\nAttention(Q,K,V) = softmax(QK^T / sqrt(d_k))V\n\nMulti-head attention extends this by running h parallel attention heads, each with different learned projections. Given model dimension d_model and h heads:\n\n- Each head operates on d_k = d_model/h dimensions\n- Q, K, V are projected using weight matrices W_Q, W_K, W_V\n- Outputs are concatenated and projected through W_O\n\nComputational complexity per layer: O(n^2 * d) for sequence length n and dimension d. This quadratic scaling with sequence length is the primary bottleneck for long-context inference.\n\nFor LLaMA-3.1-70B specifically:\n- 80 transformer layers\n- 64 attention heads (8 KV heads with GQA)\n- d_model = 8192\n- Uses Grouped Query Attention to reduce KV cache memory",
    timestamp: "14:23:18",
    tokens: 187,
    latency: "2.3s",
  },
]

const executionLogs: LogEntry[] = [
  { timestamp: "14:23:01", level: "info", message: "[INIT] Loading model weights from /models/llama-3.1-70b/" },
  { timestamp: "14:23:02", level: "info", message: "[INIT] Distributing layers 0-39 to GPU:0 (A100-80GB)" },
  { timestamp: "14:23:03", level: "info", message: "[INIT] Distributing layers 40-79 to GPU:1 (A100-80GB)" },
  { timestamp: "14:23:04", level: "debug", message: "[MEM] GPU:0 allocated 38.2GB / 80GB" },
  { timestamp: "14:23:04", level: "debug", message: "[MEM] GPU:1 allocated 37.8GB / 80GB" },
  { timestamp: "14:23:05", level: "info", message: "[READY] Model loaded. KV cache initialized. Max context: 128K tokens" },
  { timestamp: "14:23:15", level: "info", message: "[INF] Processing input tokens: 32 | Context window: 32/131072" },
  { timestamp: "14:23:15", level: "debug", message: "[LAYER] Forward pass: layers 0-39 on GPU:0" },
  { timestamp: "14:23:16", level: "debug", message: "[LAYER] Forward pass: layers 40-79 on GPU:1" },
  { timestamp: "14:23:16", level: "info", message: "[GEN] Generating tokens at 81.3 tok/s" },
  { timestamp: "14:23:18", level: "info", message: "[GEN] Complete. 187 tokens generated in 2.3s" },
  { timestamp: "14:23:18", level: "debug", message: "[MEM] KV cache: 0.8MB | Peak GPU:0 mem: 42.1GB" },
  { timestamp: "14:23:18", level: "warn", message: "[CACHE] KV cache approaching soft limit (65% utilized)" },
]

const errorLogs: LogEntry[] = [
  { timestamp: "14:20:44", level: "error", message: "[CONN] WebSocket reconnection attempt 3/5 to ws://localhost:8080" },
  { timestamp: "14:20:45", level: "info", message: "[CONN] WebSocket connected successfully" },
  { timestamp: "14:22:11", level: "warn", message: "[MEM] GPU:1 memory pressure: 94.2% utilization detected" },
  { timestamp: "14:22:12", level: "info", message: "[MEM] Running garbage collection on KV cache" },
]

export function ChatWorkspace() {
  const [prompt, setPrompt] = useState("")
  const [messages] = useState<ChatMessage[]>(initialMessages)
  const [contextTokens] = useState(219)
  const [maxContext] = useState(131072)
  const chatEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const levelColors: Record<string, string> = {
    info: "text-primary",
    warn: "text-warning",
    error: "text-destructive",
    debug: "text-muted-foreground",
  }

  return (
    <div className="flex h-full flex-col">
      {/* Context Window Bar */}
      <div className="flex items-center justify-between border-b border-border bg-card px-4 py-1.5">
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground">Context</span>
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-32 rounded-full bg-secondary overflow-hidden">
              <div
                className="h-full rounded-full bg-primary transition-all duration-500"
                style={{
                  width: `${(contextTokens / maxContext) * 100}%`,
                }}
              />
            </div>
            <span className="text-xs font-mono text-muted-foreground">
              {contextTokens.toLocaleString()} / {(maxContext / 1000).toFixed(0)}K
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className="text-xs border-success/30 text-success bg-success/10"
          >
            81.3 tok/s
          </Badge>
          <Badge
            variant="outline"
            className="text-xs border-border"
          >
            FP16
          </Badge>
        </div>
      </div>

      {/* Main Content Area with Tabs */}
      <Tabs defaultValue="chat" className="flex flex-1 flex-col min-h-0">
        <div className="border-b border-border px-4">
          <TabsList className="h-8 bg-transparent p-0 gap-0">
            <TabsTrigger
              value="chat"
              className="text-xs h-8 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-3"
            >
              Chat
            </TabsTrigger>
            <TabsTrigger
              value="logs"
              className="text-xs h-8 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-3"
            >
              Execution Log
            </TabsTrigger>
            <TabsTrigger
              value="errors"
              className="text-xs h-8 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-3"
            >
              Errors
              <span className="ml-1 flex size-4 items-center justify-center rounded-full bg-warning/20 text-warning text-[10px]">
                2
              </span>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="chat" className="flex-1 flex flex-col m-0 min-h-0">
          <ScrollArea className="flex-1">
            <div className="flex flex-col gap-4 p-4">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex flex-col gap-1 ${msg.role === "user" ? "items-end" : "items-start"}`}
                >
                  {msg.role === "system" ? (
                    <div className="flex items-start gap-2 rounded-md border border-primary/20 bg-primary/5 px-3 py-2 w-full">
                      <Info className="size-3.5 mt-0.5 shrink-0 text-primary" />
                      <span className="text-xs text-muted-foreground font-mono">
                        {msg.content}
                      </span>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                          {msg.role === "user" ? "You" : "LLaMA-3.1-70B"}
                        </span>
                        <span className="text-[10px] text-muted-foreground/60 font-mono">
                          {msg.timestamp}
                        </span>
                      </div>
                      <div
                        className={`rounded-lg px-3.5 py-2.5 max-w-[85%] ${
                          msg.role === "user"
                            ? "bg-primary/15 text-foreground border border-primary/20"
                            : "bg-secondary/70 text-foreground border border-border"
                        }`}
                      >
                        <p className="text-sm leading-relaxed whitespace-pre-wrap font-mono">
                          {msg.content}
                        </p>
                      </div>
                      {msg.role === "assistant" && (
                        <div className="flex items-center gap-2 mt-1">
                          {msg.tokens && (
                            <span className="text-[10px] text-muted-foreground font-mono">
                              {msg.tokens} tokens
                            </span>
                          )}
                          {msg.latency && (
                            <span className="text-[10px] text-muted-foreground font-mono">
                              {msg.latency}
                            </span>
                          )}
                          <button className="text-muted-foreground hover:text-foreground transition-colors">
                            <Copy className="size-3" />
                          </button>
                          <button className="text-muted-foreground hover:text-foreground transition-colors">
                            <RotateCcw className="size-3" />
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>
          </ScrollArea>

          {/* Prompt Input */}
          <div className="border-t border-border p-3">
            <div className="flex items-end gap-2">
              <div className="relative flex-1">
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Enter prompt..."
                  className="w-full resize-none rounded-lg border border-border bg-secondary/50 px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary/50 font-mono min-h-[40px] max-h-[120px]"
                  rows={1}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault()
                    }
                  }}
                />
              </div>
              <Button
                size="sm"
                className="h-10 px-3 bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Send className="size-4" />
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="logs" className="flex-1 m-0 min-h-0">
          <ScrollArea className="h-full">
            <div className="p-2 font-mono text-xs space-y-0.5">
              {executionLogs.map((log, i) => (
                <div
                  key={i}
                  className="flex gap-2 px-2 py-0.5 rounded hover:bg-secondary/50 transition-colors"
                >
                  <span className="text-muted-foreground/60 shrink-0">
                    {log.timestamp}
                  </span>
                  <span
                    className={`shrink-0 w-12 uppercase ${levelColors[log.level]}`}
                  >
                    {log.level}
                  </span>
                  <span className="text-foreground/90">{log.message}</span>
                </div>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="errors" className="flex-1 m-0 min-h-0">
          <ScrollArea className="h-full">
            <div className="p-2 font-mono text-xs space-y-0.5">
              {errorLogs.map((log, i) => (
                <div
                  key={i}
                  className="flex gap-2 px-2 py-0.5 rounded hover:bg-secondary/50 transition-colors"
                >
                  <span className="text-muted-foreground/60 shrink-0">
                    {log.timestamp}
                  </span>
                  <span
                    className={`shrink-0 w-12 uppercase ${levelColors[log.level]}`}
                  >
                    {log.level}
                  </span>
                  <span className="text-foreground/90">{log.message}</span>
                </div>
              ))}
              {errorLogs.length === 0 && (
                <div className="flex items-center justify-center gap-2 py-8 text-muted-foreground">
                  <AlertCircle className="size-4" />
                  <span>No errors</span>
                </div>
              )}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  )
}
