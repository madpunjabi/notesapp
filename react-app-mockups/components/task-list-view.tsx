"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import {
  ChevronRight,
  ChevronDown,
  Play,
  Pause,
  Clock,
  Calendar,
  MoreHorizontal,
  Flag,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { Task } from "@/app/page"

type TaskListViewProps = {
  tasks: Task[]
  onTaskSelect: (task: Task) => void
  onTaskUpdate: (task: Task) => void
  selectedTaskId?: string
}

export function TaskListView({
  tasks,
  onTaskSelect,
  onTaskUpdate,
  selectedTaskId,
}: TaskListViewProps) {
  return (
    <div className="p-4 md:p-6">
      <div className="mb-4 md:mb-6">
        <h1 className="text-xl font-semibold text-foreground md:text-2xl">Tasks</h1>
        <p className="mt-1 text-xs text-muted-foreground md:text-sm">
          Manage and track your tasks with time estimation
        </p>
      </div>

      {/* Filter Tabs - Scrollable on mobile */}
      <div className="mb-4 flex gap-2 overflow-x-auto border-b border-border pb-4 md:mb-6">
        <Button variant="secondary" size="sm" className="shrink-0">
          All Tasks
        </Button>
        <Button variant="ghost" size="sm" className="shrink-0">
          In Progress
        </Button>
        <Button variant="ghost" size="sm" className="shrink-0">
          Completed
        </Button>
        <Button variant="ghost" size="sm" className="shrink-0">
          Due Soon
        </Button>
      </div>

      {/* Task List */}
      <div className="space-y-2">
        {tasks.map((task) => (
          <TaskItem
            key={task.id}
            task={task}
            onSelect={onTaskSelect}
            onUpdate={onTaskUpdate}
            isSelected={selectedTaskId === task.id}
            depth={0}
          />
        ))}
      </div>
    </div>
  )
}

type TaskItemProps = {
  task: Task
  onSelect: (task: Task) => void
  onUpdate: (task: Task) => void
  isSelected: boolean
  depth: number
}

function TaskItem({ task, onSelect, onUpdate, isSelected, depth }: TaskItemProps) {
  const [isExpanded, setIsExpanded] = useState(true)
  const hasSubtasks = task.subtasks.length > 0

  const toggleComplete = () => {
    onUpdate({
      ...task,
      status: task.status === "completed" ? "not-started" : "completed",
      isTracking: false,
    })
  }

  const toggleTimer = () => {
    onUpdate({
      ...task,
      isTracking: !task.isTracking,
      status: task.isTracking ? task.status : "in-progress",
    })
  }

  const priorityColors = {
    high: "text-red-400 bg-red-400/10",
    medium: "text-yellow-400 bg-yellow-400/10",
    low: "text-blue-400 bg-blue-400/10",
  }

  const statusColors = {
    "not-started": "bg-muted",
    "in-progress": "bg-primary/20",
    completed: "bg-success/20",
  }

  const progress =
    task.estimatedMinutes && task.estimatedMinutes > 0
      ? Math.min((task.actualMinutes / task.estimatedMinutes) * 100, 100)
      : 0

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours > 0) {
      return `${hours}h ${mins}m`
    }
    return `${mins}m`
  }

  return (
    <div style={{ marginLeft: depth * 16 }} className="md:ml-0" data-depth={depth}>
      <div
        className={cn(
          "group flex items-start gap-2 rounded-lg border border-transparent p-2 transition-colors hover:bg-muted/50 md:items-center md:gap-3 md:p-3",
          isSelected && "border-primary/50 bg-muted/50",
          task.isTracking && "border-primary/30 bg-primary/5"
        )}
      >
        {/* Expand/Collapse */}
        <div className="mt-0.5 w-5 shrink-0 md:mt-0">
          {hasSubtasks && (
            <Button
              variant="ghost"
              size="icon"
              className="h-5 w-5"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>
          )}
        </div>

        {/* Checkbox */}
        <Checkbox
          checked={task.status === "completed"}
          onCheckedChange={toggleComplete}
          className="mt-0.5 h-5 w-5 shrink-0 md:mt-0"
        />

        {/* Task Content */}
        <div
          className="min-w-0 flex-1 cursor-pointer"
          onClick={() => onSelect(task)}
          onKeyDown={(e) => e.key === "Enter" && onSelect(task)}
        >
          <div className="flex flex-wrap items-center gap-1.5 md:gap-2">
            <span
              className={cn(
                "text-sm font-medium md:text-base",
                task.status === "completed" && "text-muted-foreground line-through"
              )}
            >
              {task.title}
            </span>
            <Badge
              variant="outline"
              className={cn("text-xs", priorityColors[task.priority])}
            >
              <Flag className="mr-1 h-3 w-3" />
              <span className="hidden sm:inline">{task.priority}</span>
            </Badge>
            {task.isTracking && (
              <Badge className="animate-pulse bg-primary text-primary-foreground">
                <Clock className="mr-1 h-3 w-3" />
                <span className="hidden sm:inline">Tracking</span>
              </Badge>
            )}
          </div>

          {/* Time & Progress */}
          <div className="mt-1.5 flex flex-wrap items-center gap-2 md:mt-2 md:gap-4">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground md:gap-2">
              <Clock className="h-3 w-3" />
              <span>{formatTime(task.actualMinutes)}</span>
              {task.estimatedMinutes && (
                <>
                  <span>/</span>
                  <span>{formatTime(task.estimatedMinutes)}</span>
                </>
              )}
            </div>

            {task.estimatedMinutes && task.estimatedMinutes > 0 && (
              <div className="hidden items-center gap-2 sm:flex">
                <Progress value={progress} className="h-1.5 w-16 md:w-24" />
                <span className="text-xs text-muted-foreground">
                  {Math.round(progress)}%
                </span>
              </div>
            )}

            {task.dueDate && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                <span className="hidden sm:inline">{new Date(task.dueDate).toLocaleDateString()}</span>
                <span className="sm:hidden">{new Date(task.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
              </div>
            )}

            {hasSubtasks && (
              <span className="hidden text-xs text-muted-foreground sm:inline">
                {task.subtasks.filter((s) => s.status === "completed").length}/
                {task.subtasks.length} subtasks
              </span>
            )}
          </div>
        </div>

        {/* Timer Button */}
        <Button
          variant={task.isTracking ? "default" : "outline"}
          size="icon"
          className="h-7 w-7 shrink-0 md:h-8 md:w-8"
          onClick={toggleTimer}
          disabled={task.status === "completed"}
        >
          {task.isTracking ? (
            <Pause className="h-3.5 w-3.5 md:h-4 md:w-4" />
          ) : (
            <Play className="h-3.5 w-3.5 md:h-4 md:w-4" />
          )}
        </Button>

        {/* More Options */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 shrink-0 opacity-100 md:h-8 md:w-8 md:opacity-0 md:group-hover:opacity-100"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>Edit Task</DropdownMenuItem>
            <DropdownMenuItem>Add Subtask</DropdownMenuItem>
            <DropdownMenuItem>Schedule Time Block</DropdownMenuItem>
            <DropdownMenuItem>Duplicate</DropdownMenuItem>
            <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Subtasks */}
      {hasSubtasks && isExpanded && (
        <div className="mt-1">
          {task.subtasks.map((subtask) => (
            <TaskItem
              key={subtask.id}
              task={subtask}
              onSelect={onSelect}
              onUpdate={onUpdate}
              isSelected={false}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  )
}
