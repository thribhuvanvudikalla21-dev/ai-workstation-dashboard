"use client"

import { useState } from "react"
import {
  Brain,
  Circle,
  Moon,
  Sun,
  Settings,
  Wifi,
  WifiOff,
  Activity,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

type ExecutionState = "running" | "idle" | "error"

export function Header() {
  const [isDark, setIsDark] = useState(true)
  const [isConnected, setIsConnected] = useState(true)
  const [executionState] = useState<ExecutionState>("running")
  const currentModel = "LLaMA-3.1-70B"

  const stateConfig = {
    running: {
      color: "bg-success",
      pulseColor: "bg-success",
      label: "Running",
      textColor: "text-success",
    },
    idle: {
      color: "bg-warning",
      pulseColor: "bg-warning",
      label: "Idle",
      textColor: "text-warning",
    },
    error: {
      color: "bg-destructive",
      pulseColor: "bg-destructive",
      label: "Error",
      textColor: "text-destructive",
    },
  }

  const state = stateConfig[executionState]

  const toggleTheme = () => {
    setIsDark(!isDark)
    document.documentElement.classList.toggle("dark")
  }

  return (
    <TooltipProvider>
      <header className="flex h-12 shrink-0 items-center justify-between border-b border-border bg-card px-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Brain className="size-5 text-primary" />
            <span className="text-sm font-semibold text-foreground">
              NeuralOps
            </span>
          </div>

          <div className="mx-2 h-5 w-px bg-border" />

          <div className="flex items-center gap-2">
            <Activity className="size-3.5 text-muted-foreground" />
            <span className="text-xs font-mono text-muted-foreground">
              {currentModel}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 rounded-md border border-border bg-secondary/50 px-2.5 py-1">
            <div className="relative flex items-center">
              <Circle
                className={`size-2 fill-current ${state.textColor}`}
              />
              {executionState === "running" && (
                <Circle
                  className={`absolute size-2 fill-current ${state.textColor} animate-ping`}
                />
              )}
            </div>
            <span className={`text-xs font-medium ${state.textColor}`}>
              {state.label}
            </span>
          </div>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="size-8 p-0"
                onClick={() => setIsConnected(!isConnected)}
              >
                {isConnected ? (
                  <Wifi className="size-4 text-success" />
                ) : (
                  <WifiOff className="size-4 text-destructive" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>
                Server: {isConnected ? "Connected" : "Disconnected"}
              </p>
            </TooltipContent>
          </Tooltip>

          <Badge
            variant="outline"
            className="border-primary/30 bg-primary/10 text-primary text-xs"
          >
            v2.4.1
          </Badge>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="size-8 p-0"
                onClick={toggleTheme}
              >
                {isDark ? (
                  <Sun className="size-4 text-muted-foreground" />
                ) : (
                  <Moon className="size-4 text-muted-foreground" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Toggle theme</p>
            </TooltipContent>
          </Tooltip>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="size-8 p-0">
                <Settings className="size-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem>Preferences</DropdownMenuItem>
              <DropdownMenuItem>API Keys</DropdownMenuItem>
              <DropdownMenuItem>Keyboard Shortcuts</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Documentation</DropdownMenuItem>
              <DropdownMenuItem>About</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
    </TooltipProvider>
  )
}
