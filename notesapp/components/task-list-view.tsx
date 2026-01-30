"use client"

import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
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
  Plus,
  GripVertical,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { Task } from "@/app/page"
import confetti from "canvas-confetti"
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core"
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { WeatherBanner } from "./weather-banner"

type TaskListViewProps = {
  tasks: Task[]
  onTaskSelect: (task: Task) => void
  onTaskUpdate: (task: Task) => void
  onTaskDelete: (taskId: string) => void
  onTaskReorder: (taskId: string, newOrder: number) => void
  selectedTaskId?: string
}

export function TaskListView({
  tasks,
  onTaskSelect,
  onTaskUpdate,
  onTaskDelete,
  onTaskReorder,
  selectedTaskId,
}: TaskListViewProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (!over || active.id === over.id) {
      return
    }

    const oldIndex = tasks.findIndex((task) => task.id === active.id)
    const newIndex = tasks.findIndex((task) => task.id === over.id)

    if (oldIndex !== -1 && newIndex !== -1) {
      // Calculate new order value
      const newOrder = newIndex
      onTaskReorder(active.id as string, newOrder)
    }
  }

  return (
    <div className="p-4 md:p-6">
      <div className="mb-4 md:mb-6">
        <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">Tasks</h1>
        <p className="mt-1 text-xs text-muted-foreground md:text-sm">
          Manage and track your tasks with time estimation
        </p>
      </div>

      {/* Weather Banner */}
      <WeatherBanner />

      {/* Task List */}
      <div className="space-y-2">
        {tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center md:py-16">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <Clock className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-foreground">Ready to tackle the world?</h3>
            <p className="mb-6 max-w-sm text-sm text-muted-foreground">
              Add your first task and start tracking your progress! 🚀
            </p>
            <Button
              onClick={() => {
                const addButton = document.querySelector<HTMLButtonElement>('[data-add-task-button]');
                addButton?.click();
              }}
              className={cn(
                "bg-gradient-to-br from-primary to-accent",
                "hover:scale-105 hover:opacity-90",
                "active:scale-95",
                "transition-all duration-200"
              )}
            >
              <Plus className="mr-2 h-4 w-4" />
              Create Your First Task
            </Button>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={tasks.map((task) => task.id)}
              strategy={verticalListSortingStrategy}
            >
              {tasks.map((task) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  onSelect={onTaskSelect}
                  onUpdate={onTaskUpdate}
                  onDelete={onTaskDelete}
                  isSelected={selectedTaskId === task.id}
                  depth={0}
                />
              ))}
            </SortableContext>
          </DndContext>
        )}
      </div>
    </div>
  )
}

type TaskItemProps = {
  task: Task
  onSelect: (task: Task) => void
  onUpdate: (task: Task) => void
  onDelete: (taskId: string) => void
  isSelected: boolean
  depth: number
}

function TaskItem({ task, onSelect, onUpdate, onDelete, isSelected, depth }: TaskItemProps) {
  const [isExpanded, setIsExpanded] = useState(true)
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const hasSubtasks = task.subtasks.length > 0

  // Drag and drop setup
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id, disabled: depth > 0 })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  // Live timer update
  useEffect(() => {
    if (!task.isTracking || !task.trackingStartedAt) {
      setElapsedSeconds(0);
      return;
    }

    const updateElapsed = () => {
      const elapsed = Math.floor((Date.now() - task.trackingStartedAt!) / 1000);
      setElapsedSeconds(elapsed);
    };

    updateElapsed();
    const interval = setInterval(updateElapsed, 1000);

    return () => clearInterval(interval);
  }, [task.isTracking, task.trackingStartedAt])

  const toggleComplete = () => {
    const willBeCompleted = task.status !== "completed";

    // Trigger confetti when completing a task
    if (willBeCompleted) {
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#FFD700', '#FFA500', '#FF6347', '#FFB6C1', '#FFDAB9']
      });

      // Calculate points earned
      const points = Math.floor((task.estimatedMinutes || 0) / 15);
      if (points > 0) {
        toast.success(`Task completed! +${points} points earned 🏆`, {
          duration: 3000,
        });
      } else {
        toast.success('Task completed! 🎉', {
          duration: 3000,
        });
      }
    }

    onUpdate({
      ...task,
      status: task.status === "completed" ? "not-started" : "completed",
      isTracking: false,
    })
  }

  const toggleTimer = () => {
    if (!task.isTracking) {
      // Starting timer
      toast.success('⏰ Focus mode: activated', {
        duration: 2000,
      });
    } else {
      // Stopping timer
      const minutes = Math.floor(elapsedSeconds / 60);
      if (minutes > 0) {
        toast.success(`Great focus session! ${minutes}m tracked ⏱️`, {
          duration: 3000,
        });
      } else {
        toast('Timer stopped', {
          duration: 2000,
        });
      }
    }

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

  // Calculate current actual time including live tracking
  const currentActualMinutes = task.isTracking
    ? task.actualMinutes + Math.floor(elapsedSeconds / 60)
    : task.actualMinutes;

  const progress =
    task.estimatedMinutes && task.estimatedMinutes > 0
      ? Math.min((currentActualMinutes / task.estimatedMinutes) * 100, 100)
      : 0

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours > 0) {
      return `${hours}h ${mins}m`
    }
    return `${mins}m`
  }

  const formatElapsedTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hours > 0) {
      return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  return (
    <div
      ref={setNodeRef}
      style={{ ...style, marginLeft: depth * 48 }}
      data-depth={depth}
    >
      <div
        className={cn(
          "group flex items-start gap-2 rounded-xl border border-transparent p-2 transition-all duration-300 ease-out hover:bg-muted/50 md:items-center md:gap-3 md:p-3",
          "hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-0.5 hover:border-primary/30",
          "active:scale-[0.98]",
          isSelected && "border-primary/50 bg-muted/50 ring-2 ring-primary/50 shadow-lg shadow-primary/20",
          task.isTracking && "border-primary/30 bg-primary/5"
        )}
      >
        {/* Drag Handle */}
        {depth === 0 && (
          <button
            className="mt-0.5 h-5 w-5 shrink-0 cursor-grab touch-none opacity-0 transition-opacity group-hover:opacity-100 md:mt-0 active:cursor-grabbing"
            {...attributes}
            {...listeners}
          >
            <GripVertical className="h-4 w-4 text-muted-foreground" />
          </button>
        )}

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
          className={cn(
            "mt-0.5 h-5 w-5 shrink-0 transition-all duration-200 md:mt-0",
            "hover:scale-110"
          )}
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
                "text-sm md:text-base",
                task.status !== "completed" && "font-semibold",
                task.status === "completed" && "text-muted-foreground line-through opacity-60"
              )}
            >
              {task.title}
            </span>
            <Badge
              variant="outline"
              className={cn(
                "text-xs transition-all duration-200",
                "hover:scale-105 hover:-translate-y-0.5",
                priorityColors[task.priority]
              )}
            >
              <Flag className="mr-1 h-3 w-3" />
              <span className="hidden sm:inline">{task.priority}</span>
            </Badge>
            {task.isTracking && (
              <Badge className="animate-pulse bg-primary text-primary-foreground">
                <Clock className="mr-1 h-3 w-3" />
                <span className="hidden sm:inline">{formatElapsedTime(elapsedSeconds)}</span>
              </Badge>
            )}
          </div>

          {/* Time & Progress */}
          <div className="mt-1.5 flex flex-wrap items-center gap-2 md:mt-2 md:gap-4">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground md:gap-2">
              <Clock className="h-3 w-3" />
              <span className={task.isTracking ? "font-semibold text-primary" : ""}>
                {formatTime(currentActualMinutes)}
              </span>
              {task.estimatedMinutes && (
                <>
                  <span>/</span>
                  <span>{formatTime(task.estimatedMinutes)}</span>
                </>
              )}
            </div>

            {task.estimatedMinutes && task.estimatedMinutes > 0 && (
              <div className="hidden items-center gap-2 sm:flex">
                <Progress
                  value={progress}
                  className={cn(
                    "h-1.5 w-16 md:w-24",
                    "[&>div]:bg-gradient-to-r [&>div]:from-primary [&>div]:via-accent [&>div]:to-primary",
                    "[&>div]:animate-gradient"
                  )}
                />
                <span className="text-xs tabular-nums text-muted-foreground">
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
          className={cn(
            "relative h-7 w-7 shrink-0 transition-all duration-300 md:h-8 md:w-8",
            "hover:scale-105 active:scale-95",
            task.isTracking && [
              "shadow-lg shadow-primary/50",
              "animate-pulse"
            ]
          )}
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
            <DropdownMenuItem onClick={() => onSelect(task)}>Edit Task</DropdownMenuItem>
            <DropdownMenuItem>Add Subtask</DropdownMenuItem>
            <DropdownMenuItem>Schedule Time Block</DropdownMenuItem>
            <DropdownMenuItem>Duplicate</DropdownMenuItem>
            <DropdownMenuItem
              className="text-destructive"
              onClick={() => onDelete(task.id)}
            >
              Delete
            </DropdownMenuItem>
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
              onDelete={onDelete}
              isSelected={false}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  )
}
