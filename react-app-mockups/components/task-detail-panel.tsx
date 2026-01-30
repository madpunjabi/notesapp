"use client"

import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Checkbox } from "@/components/ui/checkbox"
import {
  X,
  Clock,
  Calendar,
  Play,
  Pause,
  Square,
  Plus,
  Flag,
  Tag,
  History,
  ChevronDown,
  ChevronRight,
} from "lucide-react"
import type { Task } from "@/app/page"

type TaskDetailPanelProps = {
  task: Task
  onClose: () => void
  onTaskUpdate: (task: Task) => void
}

export function TaskDetailPanel({ task, onClose, onTaskUpdate }: TaskDetailPanelProps) {
  const [isTimerRunning, setIsTimerRunning] = useState(task.isTracking)
  const [elapsedSeconds, setElapsedSeconds] = useState(task.actualMinutes * 60)
  const [showSubtasks, setShowSubtasks] = useState(true)
  const [newSubtask, setNewSubtask] = useState("")

  useEffect(() => {
    setIsTimerRunning(task.isTracking)
    setElapsedSeconds(task.actualMinutes * 60)
  }, [task.id, task.isTracking, task.actualMinutes])

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null
    if (isTimerRunning) {
      interval = setInterval(() => {
        setElapsedSeconds((s) => s + 1)
      }, 1000)
    }
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isTimerRunning])

  const toggleTimer = () => {
    const newIsTracking = !isTimerRunning
    setIsTimerRunning(newIsTracking)
    onTaskUpdate({
      ...task,
      isTracking: newIsTracking,
      status: newIsTracking ? "in-progress" : task.status,
      actualMinutes: Math.floor(elapsedSeconds / 60),
    })
  }

  const stopTimer = () => {
    setIsTimerRunning(false)
    onTaskUpdate({
      ...task,
      isTracking: false,
      actualMinutes: Math.floor(elapsedSeconds / 60),
    })
  }

  const formatTimer = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const formatMinutes = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
  }

  const progress = task.estimatedMinutes && task.estimatedMinutes > 0
    ? Math.min((elapsedSeconds / 60 / task.estimatedMinutes) * 100, 100)
    : 0

  const priorityColors = {
    high: "text-red-400 bg-red-400/10 border-red-400/30",
    medium: "text-yellow-400 bg-yellow-400/10 border-yellow-400/30",
    low: "text-blue-400 bg-blue-400/10 border-blue-400/30",
  }

  const handleAddSubtask = () => {
    if (!newSubtask.trim()) return
    
    const subtask: Task = {
      id: `${task.id}-${Date.now()}`,
      title: newSubtask,
      actualMinutes: 0,
      priority: "medium",
      status: "not-started",
      tags: [],
      subtasks: [],
      isTracking: false,
      timeBlocks: [],
    }
    
    onTaskUpdate({
      ...task,
      subtasks: [...task.subtasks, subtask],
    })
    setNewSubtask("")
  }

  const toggleSubtaskComplete = (subtaskId: string) => {
    onTaskUpdate({
      ...task,
      subtasks: task.subtasks.map((st) =>
        st.id === subtaskId
          ? { ...st, status: st.status === "completed" ? "not-started" : "completed" }
          : st
      ),
    })
  }

  const activityLog = [
    { action: "Timer started", time: "10 minutes ago" },
    { action: "Status changed to In Progress", time: "10 minutes ago" },
    { action: "Subtask completed: Research competitor strategies", time: "30 minutes ago" },
    { action: "Task created", time: "2 hours ago" },
  ]

  return (
    <div className="fixed inset-0 z-40 flex flex-col bg-card md:relative md:inset-auto md:w-[400px] md:border-l md:border-border">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border p-3 md:p-4">
        <h2 className="text-base font-semibold text-foreground md:text-lg">Task Details</h2>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-3 md:p-4">
        {/* Timer Section */}
        <div className={cn(
          "mb-4 rounded-lg border p-3 md:mb-6 md:p-4",
          isTimerRunning ? "border-primary/50 bg-primary/5" : "border-border bg-muted/30"
        )}>
          <div className="mb-3 text-center md:mb-4">
            <span className={cn(
              "font-mono text-3xl font-bold md:text-4xl",
              isTimerRunning && "text-primary"
            )}>
              {formatTimer(elapsedSeconds)}
            </span>
          </div>
          
          <div className="flex justify-center gap-2">
            <Button
              variant={isTimerRunning ? "default" : "outline"}
              size="sm"
              onClick={toggleTimer}
              className="gap-2"
            >
              {isTimerRunning ? (
                <>
                  <Pause className="h-4 w-4" />
                  Pause
                </>
              ) : (
                <>
                  <Play className="h-4 w-4" />
                  Start
                </>
              )}
            </Button>
            {(isTimerRunning || elapsedSeconds > 0) && (
              <Button variant="outline" size="sm" onClick={stopTimer} className="gap-2 bg-transparent">
                <Square className="h-4 w-4" />
                Stop
              </Button>
            )}
          </div>

          {/* Progress */}
          {task.estimatedMinutes && task.estimatedMinutes > 0 && (
            <div className="mt-4">
              <div className="mb-2 flex justify-between text-xs">
                <span className="text-muted-foreground">Progress</span>
                <span className={cn(
                  progress > 100 ? "text-destructive" : "text-foreground"
                )}>
                  {formatMinutes(Math.floor(elapsedSeconds / 60))} / {formatMinutes(task.estimatedMinutes)}
                </span>
              </div>
              <Progress 
                value={Math.min(progress, 100)} 
                className={cn("h-2", progress > 100 && "[&>div]:bg-destructive")}
              />
              {progress > 100 && (
                <p className="mt-1 text-xs text-destructive">
                  Over by {formatMinutes(Math.floor(elapsedSeconds / 60) - task.estimatedMinutes)}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Task Info */}
        <div className="space-y-4">
          {/* Title */}
          <div className="space-y-2">
            <Label className="text-muted-foreground">Title</Label>
            <Input 
              value={task.title} 
              onChange={(e) => onTaskUpdate({ ...task, title: e.target.value })}
              className="bg-muted/30"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label className="text-muted-foreground">Description</Label>
            <Textarea
              value={task.description || ""}
              onChange={(e) => onTaskUpdate({ ...task, description: e.target.value })}
              placeholder="Add a description..."
              rows={3}
              className="bg-muted/30"
            />
          </div>

          {/* Priority & Status */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-muted-foreground">Priority</Label>
              <Select
                value={task.priority}
                onValueChange={(value: "low" | "medium" | "high") =>
                  onTaskUpdate({ ...task, priority: value })
                }
              >
                <SelectTrigger className="bg-muted/30">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">
                    <div className="flex items-center gap-2">
                      <Flag className="h-3 w-3 text-blue-400" />
                      Low
                    </div>
                  </SelectItem>
                  <SelectItem value="medium">
                    <div className="flex items-center gap-2">
                      <Flag className="h-3 w-3 text-yellow-400" />
                      Medium
                    </div>
                  </SelectItem>
                  <SelectItem value="high">
                    <div className="flex items-center gap-2">
                      <Flag className="h-3 w-3 text-red-400" />
                      High
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-muted-foreground">Status</Label>
              <Select
                value={task.status}
                onValueChange={(value: "not-started" | "in-progress" | "completed") =>
                  onTaskUpdate({ ...task, status: value })
                }
              >
                <SelectTrigger className="bg-muted/30">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="not-started">Not Started</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Estimated Time & Due Date */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-muted-foreground flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Estimated Time
              </Label>
              <div className="relative">
                <Input
                  type="number"
                  value={task.estimatedMinutes || ""}
                  onChange={(e) => onTaskUpdate({ 
                    ...task, 
                    estimatedMinutes: e.target.value ? parseInt(e.target.value) : undefined 
                  })}
                  placeholder="30"
                  className="bg-muted/30 pr-12"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                  min
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-muted-foreground flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                Due Date
              </Label>
              <Input
                type="date"
                value={task.dueDate || ""}
                onChange={(e) => onTaskUpdate({ ...task, dueDate: e.target.value || undefined })}
                className="bg-muted/30"
              />
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label className="text-muted-foreground flex items-center gap-1">
              <Tag className="h-3 w-3" />
              Tags
            </Label>
            <div className="flex flex-wrap gap-2">
              {task.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
              <Button variant="ghost" size="sm" className="h-6 px-2 text-xs text-muted-foreground">
                <Plus className="mr-1 h-3 w-3" />
                Add Tag
              </Button>
            </div>
          </div>

          <Separator className="my-4" />

          {/* Subtasks */}
          <div>
            <button
              type="button"
              className="mb-3 flex w-full items-center justify-between text-sm font-medium"
              onClick={() => setShowSubtasks(!showSubtasks)}
            >
              <span className="flex items-center gap-2">
                Subtasks
                <Badge variant="secondary" className="text-xs">
                  {task.subtasks.filter((s) => s.status === "completed").length}/{task.subtasks.length}
                </Badge>
              </span>
              {showSubtasks ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </button>

            {showSubtasks && (
              <div className="space-y-2">
                {task.subtasks.map((subtask) => (
                  <div
                    key={subtask.id}
                    className="flex items-center gap-2 rounded-md bg-muted/30 p-2"
                  >
                    <Checkbox
                      checked={subtask.status === "completed"}
                      onCheckedChange={() => toggleSubtaskComplete(subtask.id)}
                    />
                    <span className={cn(
                      "flex-1 text-sm",
                      subtask.status === "completed" && "text-muted-foreground line-through"
                    )}>
                      {subtask.title}
                    </span>
                  </div>
                ))}
                
                {/* Add Subtask */}
                <div className="flex gap-2">
                  <Input
                    value={newSubtask}
                    onChange={(e) => setNewSubtask(e.target.value)}
                    placeholder="Add a subtask..."
                    className="h-9 bg-muted/30 text-sm"
                    onKeyDown={(e) => e.key === "Enter" && handleAddSubtask()}
                  />
                  <Button size="sm" onClick={handleAddSubtask}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>

          <Separator className="my-4" />

          {/* Activity Log */}
          <div>
            <h3 className="mb-3 flex items-center gap-2 text-sm font-medium">
              <History className="h-4 w-4" />
              Activity
            </h3>
            <div className="space-y-3">
              {activityLog.map((log, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="mt-1.5 h-2 w-2 rounded-full bg-muted-foreground/50" />
                  <div>
                    <p className="text-sm text-foreground">{log.action}</p>
                    <p className="text-xs text-muted-foreground">{log.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="border-t border-border p-4">
        <div className="flex gap-2">
          <Button variant="outline" className="flex-1 gap-2 bg-transparent">
            <Calendar className="h-4 w-4" />
            Schedule
          </Button>
          <Button className="flex-1 gap-2">
            <Clock className="h-4 w-4" />
            Time Block
          </Button>
        </div>
      </div>
    </div>
  )
}
