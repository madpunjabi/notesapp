"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  CheckSquare,
  Calendar,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Clock,
  Target,
  Zap,
} from "lucide-react"

type AppSidebarProps = {
  activeView: "tasks" | "calendar" | "analytics"
  onViewChange: (view: "tasks" | "calendar" | "analytics") => void
  collapsed: boolean
  onToggleCollapse: () => void
}

export function AppSidebar({
  activeView,
  onViewChange,
  collapsed,
  onToggleCollapse,
}: AppSidebarProps) {
  const navItems = [
    { id: "tasks" as const, label: "Tasks", icon: CheckSquare },
    { id: "calendar" as const, label: "Calendar", icon: Calendar },
    { id: "analytics" as const, label: "Analytics", icon: BarChart3 },
  ]

  return (
    <aside
      className={cn(
        "flex flex-col bg-sidebar border-r border-sidebar-border transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-4">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Clock className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-lg font-semibold text-sidebar-foreground">Tempo</span>
          </div>
        )}
        {collapsed && (
          <div className="mx-auto flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <Clock className="h-4 w-4 text-primary-foreground" />
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3">
        <div className="space-y-1">
          {navItems.map((item, index) => (
            <Button
              key={item.id}
              variant={activeView === item.id ? "secondary" : "ghost"}
              className={cn(
                "w-full justify-start gap-3 transition-all duration-300",
                collapsed && "justify-center px-2",
                activeView === item.id && "bg-sidebar-accent text-sidebar-accent-foreground",
                "hover:scale-105 hover:-translate-x-1"
              )}
              style={{
                transitionDelay: collapsed ? '0ms' : `${index * 50}ms`
              }}
              onClick={() => onViewChange(item.id)}
            >
              <item.icon className="h-5 w-5 shrink-0 transition-transform duration-200 hover:rotate-12" />
              {!collapsed && <span>{item.label}</span>}
            </Button>
          ))}
        </div>

        {!collapsed && (
          <>
            <div className="mt-8">
              <p className="mb-2 px-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Quick Stats
              </p>
              <div className="space-y-2">
                <div className="flex items-center gap-3 rounded-lg bg-sidebar-accent/50 p-3 transition-all duration-300 hover:scale-105 hover:bg-sidebar-accent/70">
                  <div className="flex h-8 w-8 items-center justify-center rounded-md bg-success/20">
                    <Target className="h-4 w-4 text-success" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Today&apos;s Progress</p>
                    <p className="text-sm font-semibold tabular-nums text-sidebar-foreground">4/7 tasks</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-lg bg-sidebar-accent/50 p-3 transition-all duration-300 hover:scale-105 hover:bg-sidebar-accent/70">
                  <div className="flex h-8 w-8 items-center justify-center rounded-md bg-info/20">
                    <Clock className="h-4 w-4 text-info" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Time Tracked</p>
                    <p className="text-sm font-semibold tabular-nums text-sidebar-foreground">3h 45m</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-lg bg-sidebar-accent/50 p-3 transition-all duration-300 hover:scale-105 hover:bg-sidebar-accent/70">
                  <div className="flex h-8 w-8 items-center justify-center rounded-md bg-warning/20">
                    <Zap className="h-4 w-4 text-warning" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Estimation Accuracy</p>
                    <p className="text-sm font-semibold tabular-nums text-sidebar-foreground">87%</p>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </nav>

      {/* Collapse Toggle */}
      <div className="border-t border-sidebar-border p-3">
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-center transition-all duration-300 hover:scale-110 hover:bg-sidebar-accent"
          onClick={onToggleCollapse}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4 transition-transform duration-300" />
          ) : (
            <ChevronLeft className="h-4 w-4 transition-transform duration-300" />
          )}
        </Button>
      </div>
    </aside>
  )
}
