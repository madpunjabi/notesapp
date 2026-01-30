"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  Plus,
} from "lucide-react"
import type { Task } from "@/app/page"

type CalendarViewProps = {
  tasks: Task[]
  onTaskUpdate: (task: Task) => void
}

type ViewMode = "day" | "week" | "month"

// Generate mock time blocks for demonstration
const generateTimeBlocks = (tasks: Task[]) => {
  const blocks: Array<{
    id: string
    taskId: string
    taskTitle: string
    start: Date
    end: Date
    priority: "low" | "medium" | "high"
  }> = []

  const today = new Date()
  today.setHours(9, 0, 0, 0)

  let currentHour = 9

  tasks.slice(0, 4).forEach((task, index) => {
    const duration = task.estimatedMinutes || 60
    const start = new Date(today)
    start.setHours(currentHour, 0, 0, 0)
    
    const end = new Date(start)
    end.setMinutes(end.getMinutes() + duration)

    blocks.push({
      id: `block-${index}`,
      taskId: task.id,
      taskTitle: task.title,
      start,
      end,
      priority: task.priority,
    })

    currentHour = end.getHours() + 1
  })

  return blocks
}

export function CalendarView({ tasks, onTaskUpdate }: CalendarViewProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("week")
  const [currentDate, setCurrentDate] = useState(new Date())
  const timeBlocks = generateTimeBlocks(tasks)

  const hours = Array.from({ length: 12 }, (_, i) => i + 8) // 8 AM to 8 PM

  const getWeekDays = () => {
    const days = []
    const start = new Date(currentDate)
    const day = start.getDay()
    start.setDate(start.getDate() - day + 1) // Start from Monday

    for (let i = 0; i < 7; i++) {
      const date = new Date(start)
      date.setDate(start.getDate() + i)
      days.push(date)
    }
    return days
  }

  const weekDays = getWeekDays()
  const today = new Date()

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", { month: "long", year: "numeric" })
  }

  const navigateDate = (direction: "prev" | "next") => {
    const newDate = new Date(currentDate)
    if (viewMode === "week") {
      newDate.setDate(newDate.getDate() + (direction === "next" ? 7 : -7))
    } else if (viewMode === "day") {
      newDate.setDate(newDate.getDate() + (direction === "next" ? 1 : -1))
    } else {
      newDate.setMonth(newDate.getMonth() + (direction === "next" ? 1 : -1))
    }
    setCurrentDate(newDate)
  }

  const priorityColors = {
    high: "bg-red-500/20 border-red-500/50 text-red-400",
    medium: "bg-yellow-500/20 border-yellow-500/50 text-yellow-400",
    low: "bg-blue-500/20 border-blue-500/50 text-blue-400",
  }

  const getBlockPosition = (start: Date, end: Date) => {
    const startHour = start.getHours() + start.getMinutes() / 60
    const endHour = end.getHours() + end.getMinutes() / 60
    const top = (startHour - 8) * 64 // 64px per hour
    const height = (endHour - startHour) * 64
    return { top, height }
  }

  const isToday = (date: Date) => {
    return date.toDateString() === today.toDateString()
  }

  return (
    <div className="flex h-full flex-col p-3 md:p-6">
      {/* Header */}
      <div className="mb-4 space-y-3 md:mb-6 md:flex md:items-center md:justify-between md:space-y-0">
        <div>
          <h1 className="text-xl font-semibold text-foreground md:text-2xl">Calendar</h1>
          <p className="mt-1 text-xs text-muted-foreground md:text-sm">
            Schedule and manage your time blocks
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 md:gap-4">
          {/* View Mode Toggle */}
          <div className="flex rounded-lg border border-border bg-muted/50 p-1">
            {(["day", "week", "month"] as ViewMode[]).map((mode) => (
              <Button
                key={mode}
                variant={viewMode === mode ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setViewMode(mode)}
                className="px-2 capitalize text-xs md:px-3 md:text-sm"
              >
                {mode}
              </Button>
            ))}
          </div>

          {/* Navigation */}
          <div className="flex items-center gap-1 md:gap-2">
            <Button variant="outline" size="icon" className="h-8 w-8 md:h-9 md:w-9 bg-transparent" onClick={() => navigateDate("prev")}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="min-w-[120px] text-center text-sm font-medium md:min-w-[180px] md:text-base">
              {formatDate(currentDate)}
            </span>
            <Button variant="outline" size="icon" className="h-8 w-8 md:h-9 md:w-9 bg-transparent" onClick={() => navigateDate("next")}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <Button variant="outline" size="sm" className="text-xs md:text-sm bg-transparent" onClick={() => setCurrentDate(new Date())}>
            Today
          </Button>
        </div>
      </div>

      {/* Calendar Grid - Week View */}
      {viewMode === "week" && (
        <div className="flex flex-1 overflow-hidden rounded-lg border border-border">
          {/* Time Column */}
          <div className="w-12 shrink-0 border-r border-border bg-muted/30 md:w-20">
            <div className="h-12 border-b border-border md:h-16" /> {/* Header spacer */}
            {hours.map((hour) => (
              <div
                key={hour}
                className="flex h-12 items-start justify-end border-b border-border/50 pr-1 pt-1 md:h-16 md:pr-3"
              >
                <span className="text-[10px] text-muted-foreground md:text-xs">
                  {hour > 12 ? `${hour - 12}P` : hour === 12 ? "12P" : `${hour}A`}
                </span>
              </div>
            ))}
          </div>

          {/* Days Columns */}
          <div className="flex flex-1 overflow-x-auto">
            {weekDays.map((day, dayIndex) => (
              <div
                key={day.toISOString()}
                className={cn(
                  "flex flex-1 min-w-[80px] flex-col border-r border-border last:border-r-0 md:min-w-[120px]",
                  isToday(day) && "bg-primary/5"
                )}
              >
                {/* Day Header */}
                <div
                  className={cn(
                    "flex h-12 flex-col items-center justify-center border-b border-border md:h-16",
                    isToday(day) && "bg-primary/10"
                  )}
                >
                  <span className="text-[10px] uppercase text-muted-foreground md:text-xs">
                    {day.toLocaleDateString("en-US", { weekday: "short" })}
                  </span>
                  <span
                    className={cn(
                      "mt-0.5 flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium md:mt-1 md:h-8 md:w-8 md:text-sm",
                      isToday(day) && "bg-primary text-primary-foreground"
                    )}
                  >
                    {day.getDate()}
                  </span>
                </div>

                {/* Time Slots */}
                <div className="relative flex-1">
                  {hours.map((hour) => (
                    <div
                      key={hour}
                      className="h-12 border-b border-border/50 hover:bg-muted/30 md:h-16"
                    />
                  ))}

                  {/* Time Blocks */}
                  {isToday(day) &&
                    timeBlocks.map((block) => {
                      const { top, height } = getBlockPosition(block.start, block.end)
                      return (
                        <div
                          key={block.id}
                          className={cn(
                            "absolute left-1 right-1 cursor-pointer rounded-md border p-2 transition-all hover:scale-[1.02]",
                            priorityColors[block.priority]
                          )}
                          style={{ top, height: Math.max(height, 40) }}
                        >
                          <p className="truncate text-xs font-medium">{block.taskTitle}</p>
                          <div className="mt-1 flex items-center gap-1 text-xs opacity-80">
                            <Clock className="h-3 w-3" />
                            <span>
                              {block.start.toLocaleTimeString("en-US", {
                                hour: "numeric",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>
                        </div>
                      )
                    })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Day View */}
      {viewMode === "day" && (
        <div className="flex flex-1 overflow-hidden rounded-lg border border-border">
          {/* Time Column */}
          <div className="w-20 shrink-0 border-r border-border bg-muted/30">
            {hours.map((hour) => (
              <div
                key={hour}
                className="flex h-16 items-start justify-end border-b border-border/50 pr-3 pt-1"
              >
                <span className="text-xs text-muted-foreground">
                  {hour > 12 ? `${hour - 12} PM` : hour === 12 ? "12 PM" : `${hour} AM`}
                </span>
              </div>
            ))}
          </div>

          {/* Day Column */}
          <div className="relative flex-1">
            {hours.map((hour) => (
              <div
                key={hour}
                className="h-16 border-b border-border/50 hover:bg-muted/30"
              />
            ))}

            {/* Time Blocks for today */}
            {isToday(currentDate) &&
              timeBlocks.map((block) => {
                const { top, height } = getBlockPosition(block.start, block.end)
                return (
                  <div
                    key={block.id}
                    className={cn(
                      "absolute left-2 right-2 cursor-pointer rounded-md border p-3 transition-all hover:scale-[1.01]",
                      priorityColors[block.priority]
                    )}
                    style={{ top, height: Math.max(height, 48) }}
                  >
                    <p className="font-medium">{block.taskTitle}</p>
                    <div className="mt-1 flex items-center gap-1 text-sm opacity-80">
                      <Clock className="h-3 w-3" />
                      <span>
                        {block.start.toLocaleTimeString("en-US", {
                          hour: "numeric",
                          minute: "2-digit",
                        })}{" "}
                        -{" "}
                        {block.end.toLocaleTimeString("en-US", {
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </div>
                )
              })}
          </div>
        </div>
      )}

      {/* Month View */}
      {viewMode === "month" && (
        <div className="flex-1 overflow-hidden rounded-lg border border-border">
          {/* Week day headers */}
          <div className="grid grid-cols-7 border-b border-border bg-muted/30">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
              <div key={day} className="p-3 text-center text-xs font-medium uppercase text-muted-foreground">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7">
            {Array.from({ length: 35 }, (_, i) => {
              const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
              const startOffset = (firstDay.getDay() + 6) % 7 // Adjust for Monday start
              const dayNumber = i - startOffset + 1
              const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), dayNumber)
              const isCurrentMonth = date.getMonth() === currentDate.getMonth()

              return (
                <div
                  key={i}
                  className={cn(
                    "min-h-24 border-b border-r border-border p-2 last:border-r-0",
                    !isCurrentMonth && "bg-muted/20 text-muted-foreground",
                    isToday(date) && "bg-primary/10"
                  )}
                >
                  <span
                    className={cn(
                      "inline-flex h-6 w-6 items-center justify-center rounded-full text-sm",
                      isToday(date) && "bg-primary text-primary-foreground"
                    )}
                  >
                    {date.getDate()}
                  </span>

                  {/* Show task indicators */}
                  {isCurrentMonth && isToday(date) && (
                    <div className="mt-1 space-y-1">
                      {timeBlocks.slice(0, 2).map((block) => (
                        <div
                          key={block.id}
                          className={cn(
                            "truncate rounded px-1 py-0.5 text-xs",
                            priorityColors[block.priority]
                          )}
                        >
                          {block.taskTitle}
                        </div>
                      ))}
                      {timeBlocks.length > 2 && (
                        <p className="text-xs text-muted-foreground">
                          +{timeBlocks.length - 2} more
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Unscheduled Tasks Sidebar */}
      <div className="mt-3 rounded-lg border border-border bg-card p-3 md:mt-4 md:p-4">
        <div className="mb-2 flex items-center justify-between md:mb-3">
          <h3 className="text-sm font-medium text-foreground md:text-base">Unscheduled Tasks</h3>
          <Badge variant="secondary" className="text-xs">{tasks.filter(t => t.status !== "completed").length}</Badge>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {tasks
            .filter((t) => t.status !== "completed")
            .slice(0, 5)
            .map((task) => (
              <div
                key={task.id}
                className={cn(
                  "w-36 shrink-0 cursor-grab rounded-lg border p-2 transition-colors hover:bg-muted/50 md:w-44 md:p-3",
                  priorityColors[task.priority]
                )}
                draggable
              >
                <p className="truncate text-xs font-medium md:text-sm">{task.title}</p>
                <div className="mt-1.5 flex items-center gap-1 text-[10px] opacity-80 md:mt-2 md:text-xs">
                  <Clock className="h-3 w-3" />
                  <span>{task.estimatedMinutes || 30}m</span>
                </div>
              </div>
            ))}
          <button
            type="button"
            className="flex w-36 shrink-0 items-center justify-center rounded-lg border border-dashed border-border p-2 text-xs text-muted-foreground hover:bg-muted/50 md:w-44 md:p-3 md:text-sm"
          >
            <Plus className="mr-1 h-3 w-3 md:mr-2 md:h-4 md:w-4" />
            Add Task
          </button>
        </div>
      </div>
    </div>
  )
}
