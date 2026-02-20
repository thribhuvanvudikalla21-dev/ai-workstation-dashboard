"use client"

import { useState, useRef, useEffect } from "react"
import { Terminal, X, Maximize2, Minimize2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface TerminalLine {
  type: "input" | "output" | "error" | "system"
  content: string
  timestamp?: string
}

interface BackendLog {
  timestamp: string
  source: string
  message: string
  level: "info" | "debug" | "warn" | "error"
}

const terminalHistory: TerminalLine[] = [
  { type: "system", content: "NeuralOps Terminal v2.4.1 | Session: neuralops-0x3f2a" },
  { type: "system", content: "Connected to inference server at ws://localhost:8080" },
  { type: "input", content: "$ nvidia-smi --query-gpu=gpu_name,memory.used --format=csv" },
  { type: "output", content: "name, memory.used [MiB]" },
  { type: "output", content: "NVIDIA A100-SXM4-80GB, 43110 MiB" },
  { type: "output", content: "NVIDIA A100-SXM4-80GB, 38707 MiB" },
  { type: "input", content: "$ curl -s localhost:8080/v1/models | python -m json.tool" },
  { type: "output", content: '{' },
  { type: "output", content: '  "models": [{' },
  { type: "output", content: '    "id": "llama-3.1-70b",' },
  { type: "output", content: '    "object": "model",' },
  { type: "output", content: '    "owned_by": "meta",' },
  { type: "output", content: '    "permission": [{"allow_sampling": true}]' },
  { type: "output", content: '  }]' },
  { type: "output", content: '}' },
  { type: "input", content: "$ neuralops status --layers" },
  { type: "output", content: "Model: LLaMA-3.1-70B | Status: READY" },
  { type: "output", content: "Layers: 80/80 loaded | Distribution: GPU:0 [0-39] GPU:1 [40-79]" },
  { type: "output", content: "KV Cache: 0.8MB / 4096MB | Context: 219 / 131072 tokens" },
  { type: "output", content: "Throughput: 81.3 tok/s (avg over last 10 requests)" },
]

const systemLogs: BackendLog[] = [
  { timestamp: "14:23:18.442", source: "inference", message: "Generation complete: 187 tokens in 2.301s", level: "info" },
  { timestamp: "14:23:18.440", source: "scheduler", message: "Request dequeued, active_requests=0, pending=0", level: "debug" },
  { timestamp: "14:23:16.200", source: "inference", message: "Prefill: 32 tokens processed in 42ms", level: "debug" },
  { timestamp: "14:23:16.158", source: "tokenizer", message: "Input tokenized: 32 tokens from 186 characters", level: "debug" },
  { timestamp: "14:23:15.901", source: "api", message: "POST /v1/chat/completions - 200 - stream=false", level: "info" },
  { timestamp: "14:23:15.900", source: "scheduler", message: "Request queued, active_requests=1, pending=0", level: "debug" },
  { timestamp: "14:23:05.100", source: "engine", message: "Model ready. Warmup inference complete in 142ms", level: "info" },
  { timestamp: "14:23:04.958", source: "engine", message: "KV cache allocated: 4096MB on GPU:0, 4096MB on GPU:1", level: "info" },
  { timestamp: "14:23:03.200", source: "loader", message: "Weights loaded to GPU:1 - layers 40-79 (37.8GB)", level: "info" },
  { timestamp: "14:23:02.100", source: "loader", message: "Weights loaded to GPU:0 - layers 0-39 (38.2GB)", level: "info" },
  { timestamp: "14:23:01.050", source: "engine", message: "Loading model: /models/llama-3.1-70b/", level: "info" },
]

const backendComms: BackendLog[] = [
  { timestamp: "14:23:18.445", source: "ws", message: ">>> SEND {type: 'generation_complete', tokens: 187, latency: 2301}", level: "info" },
  { timestamp: "14:23:16.202", source: "ws", message: ">>> SEND {type: 'token_stream', batch_size: 16}", level: "debug" },
  { timestamp: "14:23:15.905", source: "http", message: "<<< RECV POST /v1/chat/completions Content-Length: 428", level: "info" },
  { timestamp: "14:23:15.903", source: "ws", message: ">>> SEND {type: 'request_start', request_id: 'req_7f3a2b'}", level: "info" },
  { timestamp: "14:23:05.102", source: "ws", message: ">>> SEND {type: 'status_update', status: 'ready'}", level: "info" },
  { timestamp: "14:23:01.051", source: "ws", message: ">>> SEND {type: 'loading_model', model: 'llama-3.1-70b'}", level: "info" },
  { timestamp: "14:23:00.500", source: "ws", message: "<<< RECV WebSocket handshake complete", level: "info" },
  { timestamp: "14:23:00.010", source: "http", message: "<<< RECV GET /health - 200 {status: 'ok', gpu_count: 2}", level: "debug" },
]

export function TerminalPanel() {
  const [terminalInput, setTerminalInput] = useState("")
  const terminalEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [])

  const lineColors: Record<string, string> = {
    input: "text-primary",
    output: "text-foreground/80",
    error: "text-destructive",
    system: "text-muted-foreground/60 italic",
  }

  const logLevelColors: Record<string, string> = {
    info: "text-primary",
    debug: "text-muted-foreground",
    warn: "text-warning",
    error: "text-destructive",
  }

  return (
    <div className="flex h-full flex-col border-t border-border bg-card">
      <Tabs defaultValue="terminal" className="flex h-full flex-col">
        <div className="flex items-center justify-between border-b border-border px-2">
          <TabsList className="h-7 bg-transparent p-0 gap-0">
            <TabsTrigger
              value="terminal"
              className="text-[10px] h-7 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-2 gap-1"
            >
              <Terminal className="size-3" />
              Terminal
            </TabsTrigger>
            <TabsTrigger
              value="system"
              className="text-[10px] h-7 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-2"
            >
              System Logs
            </TabsTrigger>
            <TabsTrigger
              value="backend"
              className="text-[10px] h-7 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-2"
            >
              Backend Comms
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="terminal" className="flex-1 m-0 flex flex-col min-h-0">
          <ScrollArea className="flex-1">
            <div className="p-2 font-mono text-[11px] leading-relaxed space-y-0">
              {terminalHistory.map((line, i) => (
                <div key={i} className={lineColors[line.type]}>
                  {line.content}
                </div>
              ))}
              <div ref={terminalEndRef} />
            </div>
          </ScrollArea>
          <div className="flex items-center gap-1 border-t border-border px-2 py-1">
            <span className="text-[11px] font-mono text-primary shrink-0">
              {"$"}
            </span>
            <input
              value={terminalInput}
              onChange={(e) => setTerminalInput(e.target.value)}
              className="flex-1 bg-transparent text-[11px] font-mono text-foreground outline-none placeholder:text-muted-foreground/40"
              placeholder="Enter command..."
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  setTerminalInput("")
                }
              }}
            />
          </div>
        </TabsContent>

        <TabsContent value="system" className="flex-1 m-0 min-h-0">
          <ScrollArea className="h-full">
            <div className="p-2 font-mono text-[11px] space-y-0">
              {systemLogs.map((log, i) => (
                <div
                  key={i}
                  className="flex gap-2 py-0.5 hover:bg-secondary/30 px-1 rounded transition-colors"
                >
                  <span className="text-muted-foreground/50 shrink-0">
                    {log.timestamp}
                  </span>
                  <span className="text-muted-foreground/70 w-16 shrink-0">
                    [{log.source}]
                  </span>
                  <span className={logLevelColors[log.level]}>
                    {log.message}
                  </span>
                </div>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="backend" className="flex-1 m-0 min-h-0">
          <ScrollArea className="h-full">
            <div className="p-2 font-mono text-[11px] space-y-0">
              {backendComms.map((log, i) => (
                <div
                  key={i}
                  className="flex gap-2 py-0.5 hover:bg-secondary/30 px-1 rounded transition-colors"
                >
                  <span className="text-muted-foreground/50 shrink-0">
                    {log.timestamp}
                  </span>
                  <span className="text-muted-foreground/70 w-8 shrink-0">
                    [{log.source}]
                  </span>
                  <span
                    className={
                      log.message.startsWith(">>>")
                        ? "text-chart-2"
                        : "text-chart-3"
                    }
                  >
                    {log.message}
                  </span>
                </div>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  )
}
