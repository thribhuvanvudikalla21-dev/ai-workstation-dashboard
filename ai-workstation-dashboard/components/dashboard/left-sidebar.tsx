"use client"

import { useState } from "react"
import {
  MessageSquarePlus,
  Layers,
  Link2,
  RotateCcw,
  Trash2,
  Server,
  Terminal,
  ChevronDown,
  Plus,
  Unplug,
  RefreshCw,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export function LeftSidebar() {
  const [temperature, setTemperature] = useState([0.7])
  const [maxTokens, setMaxTokens] = useState([2048])
  const [topP, setTopP] = useState([0.9])
  const [autoLayer, setAutoLayer] = useState(true)
  const [selectedLayer, setSelectedLayer] = useState("all")
  const [isServerLive, setIsServerLive] = useState(true)
  const [isParamsOpen, setIsParamsOpen] = useState(true)
  const [isLayerOpen, setIsLayerOpen] = useState(true)
  const [isConnectionOpen, setIsConnectionOpen] = useState(false)

  return (
    <TooltipProvider>
      <div className="flex h-full w-full flex-col border-r border-border bg-sidebar">
        <div className="p-3">
          <Button
            className="w-full justify-start gap-2 bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20"
            variant="ghost"
          >
            <MessageSquarePlus className="size-4" />
            <span className="text-sm">New Chat</span>
          </Button>
        </div>

        <ScrollArea className="flex-1 px-3">
          <div className="flex flex-col gap-1 pb-3">
            {/* Model Selection */}
            <div className="space-y-2">
              <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Model
              </Label>
              <Select defaultValue="llama-70b">
                <SelectTrigger className="w-full h-8 text-xs bg-secondary/50 border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="llama-70b">LLaMA-3.1-70B</SelectItem>
                  <SelectItem value="llama-8b">LLaMA-3.1-8B</SelectItem>
                  <SelectItem value="mistral-7b">Mistral-7B-v0.3</SelectItem>
                  <SelectItem value="qwen-72b">Qwen2-72B</SelectItem>
                  <SelectItem value="phi-3">Phi-3-medium</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Separator className="my-2" />

            {/* Model Parameters */}
            <Collapsible open={isParamsOpen} onOpenChange={setIsParamsOpen}>
              <CollapsibleTrigger className="flex w-full items-center justify-between py-1 text-xs font-medium text-muted-foreground uppercase tracking-wider hover:text-foreground transition-colors">
                Parameters
                <ChevronDown
                  className={`size-3.5 transition-transform ${isParamsOpen ? "rotate-180" : ""}`}
                />
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-3 pt-2">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs text-muted-foreground">
                      Temperature
                    </Label>
                    <span className="text-xs font-mono text-foreground">
                      {temperature[0].toFixed(2)}
                    </span>
                  </div>
                  <Slider
                    value={temperature}
                    onValueChange={setTemperature}
                    min={0}
                    max={2}
                    step={0.01}
                    className="w-full"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs text-muted-foreground">
                      Max Tokens
                    </Label>
                    <span className="text-xs font-mono text-foreground">
                      {maxTokens[0]}
                    </span>
                  </div>
                  <Slider
                    value={maxTokens}
                    onValueChange={setMaxTokens}
                    min={64}
                    max={8192}
                    step={64}
                    className="w-full"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs text-muted-foreground">
                      Top P
                    </Label>
                    <span className="text-xs font-mono text-foreground">
                      {topP[0].toFixed(2)}
                    </span>
                  </div>
                  <Slider
                    value={topP}
                    onValueChange={setTopP}
                    min={0}
                    max={1}
                    step={0.01}
                    className="w-full"
                  />
                </div>
              </CollapsibleContent>
            </Collapsible>

            <Separator className="my-2" />

            {/* Layer Controls */}
            <Collapsible open={isLayerOpen} onOpenChange={setIsLayerOpen}>
              <CollapsibleTrigger className="flex w-full items-center justify-between py-1 text-xs font-medium text-muted-foreground uppercase tracking-wider hover:text-foreground transition-colors">
                Layer Control
                <ChevronDown
                  className={`size-3.5 transition-transform ${isLayerOpen ? "rotate-180" : ""}`}
                />
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs text-muted-foreground">
                    Auto Load/Unload
                  </Label>
                  <Switch
                    checked={autoLayer}
                    onCheckedChange={setAutoLayer}
                    className="scale-75"
                  />
                </div>

                {!autoLayer && (
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">
                      Layer Selection
                    </Label>
                    <Select
                      value={selectedLayer}
                      onValueChange={setSelectedLayer}
                    >
                      <SelectTrigger className="w-full h-8 text-xs bg-secondary/50 border-border">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Layers</SelectItem>
                        <SelectItem value="0-15">Layers 0-15</SelectItem>
                        <SelectItem value="16-31">Layers 16-31</SelectItem>
                        <SelectItem value="32-47">Layers 32-47</SelectItem>
                        <SelectItem value="48-63">Layers 48-63</SelectItem>
                        <SelectItem value="64-79">Layers 64-79</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="flex items-center gap-1.5">
                  <Layers className="size-3 text-primary" />
                  <span className="text-xs text-muted-foreground">
                    80 layers loaded on GPU
                  </span>
                </div>
              </CollapsibleContent>
            </Collapsible>

            <Separator className="my-2" />

            {/* Connection Management */}
            <Collapsible
              open={isConnectionOpen}
              onOpenChange={setIsConnectionOpen}
            >
              <CollapsibleTrigger className="flex w-full items-center justify-between py-1 text-xs font-medium text-muted-foreground uppercase tracking-wider hover:text-foreground transition-colors">
                Connections
                <ChevronDown
                  className={`size-3.5 transition-transform ${isConnectionOpen ? "rotate-180" : ""}`}
                />
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-2 pt-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start gap-2 h-7 text-xs text-muted-foreground hover:text-foreground"
                >
                  <Plus className="size-3" />
                  Add Model
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start gap-2 h-7 text-xs text-muted-foreground hover:text-foreground"
                >
                  <Link2 className="size-3" />
                  Add Connection
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start gap-2 h-7 text-xs text-muted-foreground hover:text-foreground"
                >
                  <Unplug className="size-3" />
                  API Manager
                </Button>
              </CollapsibleContent>
            </Collapsible>
          </div>
        </ScrollArea>

        <Separator />

        {/* Bottom Actions */}
        <div className="flex flex-col gap-1 p-3">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <Server className="size-3 text-muted-foreground" />
              <Label className="text-xs text-muted-foreground">
                Live Server
              </Label>
            </div>
            <Switch
              checked={isServerLive}
              onCheckedChange={setIsServerLive}
              className="scale-75"
            />
          </div>

          <div className="grid grid-cols-2 gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs text-muted-foreground hover:text-foreground gap-1.5"
                >
                  <RotateCcw className="size-3" />
                  Reset
                </Button>
              </TooltipTrigger>
              <TooltipContent>Reset connection</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs text-muted-foreground hover:text-foreground gap-1.5"
                >
                  <RefreshCw className="size-3" />
                  UI Reset
                </Button>
              </TooltipTrigger>
              <TooltipContent>Reset Web UI</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs text-destructive hover:text-destructive gap-1.5"
                >
                  <Trash2 className="size-3" />
                  Cache
                </Button>
              </TooltipTrigger>
              <TooltipContent>Delete cache</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs text-muted-foreground hover:text-foreground gap-1.5"
                >
                  <Terminal className="size-3" />
                  Term
                </Button>
              </TooltipTrigger>
              <TooltipContent>Open terminal</TooltipContent>
            </Tooltip>
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}
