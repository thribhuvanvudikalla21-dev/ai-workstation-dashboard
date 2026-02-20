"use client"

import { useState, useEffect } from "react"
import { Cpu, HardDrive, Activity, Layers, Circle } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts"

function generateMetricsData(baseValue: number, variance: number) {
  return Array.from({ length: 30 }, (_, i) => ({
    time: `${i}s`,
    value: Math.max(
      0,
      Math.min(100, baseValue + (Math.random() - 0.5) * variance)
    ),
  }))
}

interface LayerEvent {
  time: string
  layer: string
  action: "loaded" | "unloaded" | "active"
  device: string
}

const layerEvents: LayerEvent[] = [
  { time: "14:23:18", layer: "L79", action: "active", device: "GPU:1" },
  { time: "14:23:17", layer: "L78", action: "active", device: "GPU:1" },
  { time: "14:23:16", layer: "L40", action: "active", device: "GPU:1" },
  { time: "14:23:15", layer: "L39", action: "active", device: "GPU:0" },
  { time: "14:23:14", layer: "L0", action: "active", device: "GPU:0" },
  { time: "14:22:58", layer: "L79", action: "loaded", device: "GPU:1" },
  { time: "14:22:55", layer: "L40", action: "loaded", device: "GPU:1" },
  { time: "14:22:50", layer: "L39", action: "loaded", device: "GPU:0" },
  { time: "14:22:45", layer: "L0", action: "loaded", device: "GPU:0" },
]

export function MonitoringSidebar() {
  const [cpuData, setCpuData] = useState(generateMetricsData(45, 20))
  const [gpuData, setGpuData] = useState(generateMetricsData(72, 15))
  const [ramUsed] = useState(52.4)
  const [ramTotal] = useState(128)
  const [vramUsed0] = useState(42.1)
  const [vramUsed1] = useState(37.8)
  const [vramTotal] = useState(80)
  const [modelProgress] = useState(100)
  const [activeLayer, setActiveLayer] = useState(79)

  // Simulate real-time data updates
  useEffect(() => {
    const interval = setInterval(() => {
      setCpuData((prev) => {
        const lastValue = prev[prev.length - 1].value
        const newPoint = {
          time: `${parseInt(prev[prev.length - 1].time) + 1}s`,
          value: Math.max(
            0,
            Math.min(100, lastValue + (Math.random() - 0.5) * 10)
          ),
        }
        return [...prev.slice(1), newPoint]
      })
      setGpuData((prev) => {
        const lastValue = prev[prev.length - 1].value
        const newPoint = {
          time: `${parseInt(prev[prev.length - 1].time) + 1}s`,
          value: Math.max(
            0,
            Math.min(100, lastValue + (Math.random() - 0.5) * 8)
          ),
        }
        return [...prev.slice(1), newPoint]
      })
      setActiveLayer((prev) => (prev >= 79 ? 0 : prev + 1))
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  const actionColors: Record<string, string> = {
    loaded: "text-success",
    unloaded: "text-warning",
    active: "text-primary",
  }

  return (
    <div className="flex h-full w-full flex-col border-l border-border bg-sidebar">
      <div className="flex items-center justify-between border-b border-border px-3 py-2">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Monitoring
        </span>
        <div className="flex items-center gap-1">
          <Circle className="size-1.5 fill-success text-success" />
          <span className="text-[10px] text-success">Live</span>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="flex flex-col gap-4 p-3">
          {/* CPU Usage */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Cpu className="size-3 text-chart-1" />
                <span className="text-xs font-medium text-foreground">
                  CPU
                </span>
              </div>
              <span className="text-xs font-mono text-chart-1">
                {cpuData[cpuData.length - 1].value.toFixed(1)}%
              </span>
            </div>
            <div className="h-16 w-full rounded-md border border-border bg-secondary/30 overflow-hidden">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={cpuData}>
                  <defs>
                    <linearGradient id="cpuGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="oklch(0.65 0.17 250)" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="oklch(0.65 0.17 250)" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="oklch(0.65 0.17 250)"
                    strokeWidth={1.5}
                    fill="url(#cpuGrad)"
                    isAnimationActive={false}
                  />
                  <YAxis domain={[0, 100]} hide />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* GPU Usage */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Activity className="size-3 text-chart-2" />
                <span className="text-xs font-medium text-foreground">
                  GPU
                </span>
              </div>
              <span className="text-xs font-mono text-chart-2">
                {gpuData[gpuData.length - 1].value.toFixed(1)}%
              </span>
            </div>
            <div className="h-16 w-full rounded-md border border-border bg-secondary/30 overflow-hidden">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={gpuData}>
                  <defs>
                    <linearGradient id="gpuGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="oklch(0.70 0.18 160)" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="oklch(0.70 0.18 160)" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="oklch(0.70 0.18 160)"
                    strokeWidth={1.5}
                    fill="url(#gpuGrad)"
                    isAnimationActive={false}
                  />
                  <YAxis domain={[0, 100]} hide />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* RAM Usage */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <HardDrive className="size-3 text-chart-3" />
                <span className="text-xs font-medium text-foreground">
                  RAM
                </span>
              </div>
              <span className="text-xs font-mono text-muted-foreground">
                {ramUsed.toFixed(1)} / {ramTotal}GB
              </span>
            </div>
            <Progress
              value={(ramUsed / ramTotal) * 100}
              className="h-2 bg-secondary"
            />
          </div>

          {/* VRAM */}
          <div className="space-y-2">
            <span className="text-xs font-medium text-foreground">VRAM</span>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-muted-foreground font-mono">
                  GPU:0
                </span>
                <span className="text-[10px] text-muted-foreground font-mono">
                  {vramUsed0.toFixed(1)} / {vramTotal}GB
                </span>
              </div>
              <Progress
                value={(vramUsed0 / vramTotal) * 100}
                className="h-1.5 bg-secondary"
              />
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-muted-foreground font-mono">
                  GPU:1
                </span>
                <span className="text-[10px] text-muted-foreground font-mono">
                  {vramUsed1.toFixed(1)} / {vramTotal}GB
                </span>
              </div>
              <Progress
                value={(vramUsed1 / vramTotal) * 100}
                className="h-1.5 bg-secondary"
              />
            </div>
          </div>

          {/* Model Execution Progress */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-foreground">
                Model Load
              </span>
              <Badge
                variant="outline"
                className="text-[10px] border-success/30 text-success bg-success/10 h-4"
              >
                Complete
              </Badge>
            </div>
            <Progress value={modelProgress} className="h-2 bg-secondary" />
          </div>

          {/* Active Layer Indicator */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Layers className="size-3 text-primary" />
                <span className="text-xs font-medium text-foreground">
                  Active Layer
                </span>
              </div>
              <span className="text-xs font-mono text-primary">
                L{activeLayer}
              </span>
            </div>

            {/* Layer Grid Visualization */}
            <div className="grid grid-cols-10 gap-0.5">
              {Array.from({ length: 80 }, (_, i) => (
                <div
                  key={i}
                  className={`h-2 rounded-[2px] transition-all duration-300 ${
                    i === activeLayer
                      ? "bg-primary shadow-[0_0_4px_oklch(0.65_0.17_250)]"
                      : i < activeLayer
                        ? "bg-primary/30"
                        : "bg-secondary"
                  }`}
                  title={`Layer ${i}`}
                />
              ))}
            </div>
            <div className="flex items-center justify-between text-[9px] text-muted-foreground font-mono">
              <span>L0</span>
              <span>L79</span>
            </div>
          </div>

          {/* Layer Timeline */}
          <div className="space-y-2">
            <span className="text-xs font-medium text-foreground">
              Layer Activity
            </span>
            <div className="space-y-0.5">
              {layerEvents.slice(0, 6).map((event, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 rounded px-1.5 py-0.5 text-[10px] font-mono hover:bg-secondary/50 transition-colors"
                >
                  <span className="text-muted-foreground/60 shrink-0">
                    {event.time}
                  </span>
                  <span className={`shrink-0 ${actionColors[event.action]}`}>
                    {event.action}
                  </span>
                  <span className="text-foreground/80">{event.layer}</span>
                  <span className="text-muted-foreground/40 ml-auto">
                    {event.device}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* System Status */}
          <div className="space-y-2 pb-2">
            <span className="text-xs font-medium text-foreground">
              System
            </span>
            <div className="space-y-1">
              {[
                { label: "Inference Engine", status: "online" },
                { label: "KV Cache", status: "online" },
                { label: "Tensor Parallel", status: "online" },
                { label: "WebSocket", status: "online" },
              ].map((item, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between py-0.5"
                >
                  <span className="text-[10px] text-muted-foreground">
                    {item.label}
                  </span>
                  <div className="flex items-center gap-1">
                    <Circle
                      className={`size-1.5 fill-current ${
                        item.status === "online"
                          ? "text-success"
                          : "text-destructive"
                      }`}
                    />
                    <span
                      className={`text-[10px] ${
                        item.status === "online"
                          ? "text-success"
                          : "text-destructive"
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  )
}
