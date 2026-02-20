"use client"

import { Header } from "@/components/dashboard/header"
import { LeftSidebar } from "@/components/dashboard/left-sidebar"
import { ChatWorkspace } from "@/components/dashboard/chat-workspace"
import { MonitoringSidebar } from "@/components/dashboard/monitoring-sidebar"
import { TerminalPanel } from "@/components/dashboard/terminal-panel"
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable"

export default function DashboardPage() {
  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background">
      <Header />
      <ResizablePanelGroup direction="vertical" className="flex-1">
        {/* Main Content Area */}
        <ResizablePanel defaultSize={72} minSize={40}>
          <ResizablePanelGroup direction="horizontal">
            {/* Left Sidebar */}
            <ResizablePanel defaultSize={18} minSize={14} maxSize={28}>
              <LeftSidebar />
            </ResizablePanel>
            <ResizableHandle />

            {/* Center Workspace */}
            <ResizablePanel defaultSize={56} minSize={30}>
              <ChatWorkspace />
            </ResizablePanel>
            <ResizableHandle />

            {/* Right Monitoring Sidebar */}
            <ResizablePanel defaultSize={26} minSize={18} maxSize={35}>
              <MonitoringSidebar />
            </ResizablePanel>
          </ResizablePanelGroup>
        </ResizablePanel>

        <ResizableHandle />

        {/* Bottom Terminal Panel */}
        <ResizablePanel defaultSize={28} minSize={15} maxSize={50}>
          <TerminalPanel />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  )
}
