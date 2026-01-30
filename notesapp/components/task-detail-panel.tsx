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
  onTaskDelete: (taskId: string) => void
  onAddSubtask: (parentTaskId: string, subtaskTitle: string) => void
}

type SubtaskItemProps = {
  subtask: Task
  depth: number
  onToggleComplete: (subtaskId: string) => void
  editingSubtaskId: string | null
  editedSubtaskTitle: string
  onStartEdit: (subtask: Task) => void
  onSaveEdit: (subtaskId: string) => void
  onCancelEdit: () => void
  onEditTitleChange: (title: string) => void
}

export function TaskDetailPanel({ task, onClose, onTaskUpdate, onTaskDelete, onAddSubtask }: TaskDetailPanelProps) {
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [showSubtasks, setShowSubtasks] = useState(true)
  const [newSubtask, setNewSubtask] = useState("")
  const [editedTitle, setEditedTitle] = useState(task.title)
  const [editedDescription, setEditedDescription] = useState(task.description || "")
  const [isEditingTime, setIsEditingTime] = useState(false)
  const [editedMinutes, setEditedMinutes] = useState(task.actualMinutes.toString())
  const [newTag, setNewTag] = useState("")
  const [isAddingTag, setIsAddingTag] = useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [editedPriority, setEditedPriority] = useState(task.priority)
  const [editedStatus, setEditedStatus] = useState(task.status)
  const [editedEstimatedMinutes, setEditedEstimatedMinutes] = useState(task.estimatedMinutes?.toString() || "")
  const [editedDueDate, setEditedDueDate] = useState(task.dueDate || "")
  const [editingSubtaskId, setEditingSubtaskId] = useState<string | null>(null)
  const [editedSubtaskTitle, setEditedSubtaskTitle] = useState("")

  // Sync local edit state when task changes
  useEffect(() => {
    setEditedTitle(task.title)
    setEditedDescription(task.description || "")
    setEditedMinutes(task.actualMinutes.toString())
    setEditedPriority(task.priority)
    setEditedStatus(task.status)
    setEditedEstimatedMinutes(task.estimatedMinutes?.toString() || "")
    setEditedDueDate(task.dueDate || "")
    setIsEditingTime(false)
    setHasUnsavedChanges(false)
  }, [task.id, task.title, task.description, task.actualMinutes, task.priority, task.status, task.estimatedMinutes, task.dueDate])

  // Check for unsaved changes
  useEffect(() => {
    const titleChanged = editedTitle !== task.title
    const descChanged = editedDescription !== (task.description || "")
    const priorityChanged = editedPriority !== task.priority
    const statusChanged = editedStatus !== task.status
    const estimatedChanged = editedEstimatedMinutes !== (task.estimatedMinutes?.toString() || "")
    const dueDateChanged = editedDueDate !== (task.dueDate || "")
    setHasUnsavedChanges(titleChanged || descChanged || priorityChanged || statusChanged || estimatedChanged || dueDateChanged)
  }, [editedTitle, editedDescription, editedPriority, editedStatus, editedEstimatedMinutes, editedDueDate, task.title, task.description, task.priority, task.status, task.estimatedMinutes, task.dueDate])

  // Live timer - sync with trackingStartedAt
  useEffect(() => {
    if (!task.isTracking || !task.trackingStartedAt) {
      setElapsedSeconds(task.actualMinutes * 60);
      return;
    }

    const updateElapsed = () => {
      const baseSeconds = task.actualMinutes * 60;
      const trackingElapsed = Math.floor((Date.now() - task.trackingStartedAt!) / 1000);
      setElapsedSeconds(baseSeconds + trackingElapsed);
    };

    updateElapsed();
    const interval = setInterval(updateElapsed, 1000);

    return () => clearInterval(interval);
  }, [task.isTracking, task.trackingStartedAt, task.actualMinutes])

  const toggleTimer = () => {
    onTaskUpdate({
      ...task,
      isTracking: !task.isTracking,
    })
  }

  const stopTimer = () => {
    onTaskUpdate({
      ...task,
      isTracking: false,
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

  const currentActualMinutes = Math.floor(elapsedSeconds / 60);
  const progress = task.estimatedMinutes && task.estimatedMinutes > 0
    ? Math.min((currentActualMinutes / task.estimatedMinutes) * 100, 100)
    : 0

  const priorityColors = {
    high: "text-red-400 bg-red-400/10 border-red-400/30",
    medium: "text-yellow-400 bg-yellow-400/10 border-yellow-400/30",
    low: "text-blue-400 bg-blue-400/10 border-blue-400/30",
  }

  const handleAddSubtask = async () => {
    if (!newSubtask.trim()) return

    await onAddSubtask(task.id, newSubtask)
    setNewSubtask("")
  }

  const toggleSubtaskComplete = (subtaskId: string) => {
    const updateSubtaskRecursive = (subtasks: Task[]): Task[] => {
      return subtasks.map((st) => {
        if (st.id === subtaskId) {
          return { ...st, status: st.status === "completed" ? "not-started" : "completed" }
        }
        if (st.subtasks && st.subtasks.length > 0) {
          return { ...st, subtasks: updateSubtaskRecursive(st.subtasks) }
        }
        return st
      })
    }

    onTaskUpdate({
      ...task,
      subtasks: updateSubtaskRecursive(task.subtasks),
    })
  }

  const startEditingSubtask = (subtask: Task) => {
    setEditingSubtaskId(subtask.id)
    setEditedSubtaskTitle(subtask.title)
  }

  const saveSubtaskEdit = (subtaskId: string) => {
    if (!editedSubtaskTitle.trim()) {
      alert("Subtask title cannot be empty")
      return
    }

    const updateSubtaskTitleRecursive = (subtasks: Task[]): Task[] => {
      return subtasks.map((st) => {
        if (st.id === subtaskId) {
          return { ...st, title: editedSubtaskTitle.trim() }
        }
        if (st.subtasks && st.subtasks.length > 0) {
          return { ...st, subtasks: updateSubtaskTitleRecursive(st.subtasks) }
        }
        return st
      })
    }

    onTaskUpdate({
      ...task,
      subtasks: updateSubtaskTitleRecursive(task.subtasks),
    })
    setEditingSubtaskId(null)
    setEditedSubtaskTitle("")
  }

  const cancelSubtaskEdit = () => {
    setEditingSubtaskId(null)
    setEditedSubtaskTitle("")
  }

  const handleSaveTimeAdjustment = () => {
    const newMinutes = parseInt(editedMinutes, 10)
    if (isNaN(newMinutes) || newMinutes < 0) {
      alert("Please enter a valid positive number")
      setEditedMinutes(task.actualMinutes.toString())
      return
    }

    onTaskUpdate({
      ...task,
      actualMinutes: newMinutes,
    })
    setIsEditingTime(false)
  }

  const handleAddTag = () => {
    const trimmedTag = newTag.trim()
    if (!trimmedTag) return
    if (task.tags.includes(trimmedTag)) {
      alert("This tag already exists")
      return
    }

    onTaskUpdate({
      ...task,
      tags: [...task.tags, trimmedTag],
    })
    setNewTag("")
    setIsAddingTag(false)
  }

  const handleRemoveTag = (tagToRemove: string) => {
    onTaskUpdate({
      ...task,
      tags: task.tags.filter(tag => tag !== tagToRemove),
    })
  }

  const handleSaveChanges = () => {
    onTaskUpdate({
      ...task,
      title: editedTitle,
      description: editedDescription,
      priority: editedPriority,
      status: editedStatus,
      estimatedMinutes: editedEstimatedMinutes ? parseInt(editedEstimatedMinutes) : undefined,
      dueDate: editedDueDate || undefined,
    })
    setHasUnsavedChanges(false)
  }

  const activityLog = [
    { action: "Timer started", time: "10 minutes ago" },
    { action: "Status changed to In Progress", time: "10 minutes ago" },
    { action: "Subtask completed: Research competitor strategies", time: "30 minutes ago" },
    { action: "Task created", time: "2 hours ago" },
  ]

  // Recursive subtask counter
  const countSubtasks = (subtasks: Task[]): { total: number; completed: number } => {
    let total = 0
    let completed = 0

    for (const subtask of subtasks) {
      total++
      if (subtask.status === "completed") completed++

      if (subtask.subtasks && subtask.subtasks.length > 0) {
        const nested = countSubtasks(subtask.subtasks)
        total += nested.total
        completed += nested.completed
      }
    }

    return { total, completed }
  }

  const subtaskCounts = countSubtasks(task.subtasks)

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
          task.isTracking ? "border-primary/50 bg-primary/5" : "border-border bg-muted/30"
        )}>
          <div className="mb-3 text-center md:mb-4">
            <span className={cn(
              "font-mono text-3xl font-bold md:text-4xl",
              task.isTracking && "text-primary"
            )}>
              {formatTimer(elapsedSeconds)}
            </span>
          </div>

          <div className="flex justify-center gap-2">
            <Button
              variant={task.isTracking ? "default" : "outline"}
              size="sm"
              onClick={toggleTimer}
              className="gap-2"
            >
              {task.isTracking ? (
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
            {(task.isTracking || elapsedSeconds > 0) && (
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
                <div className="flex items-center gap-2">
                  {isEditingTime && !task.isTracking ? (
                    <div className="flex items-center gap-1">
                      <Input
                        type="number"
                        value={editedMinutes}
                        onChange={(e) => setEditedMinutes(e.target.value)}
                        className="h-6 w-16 text-xs px-2"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleSaveTimeAdjustment()
                          if (e.key === "Escape") {
                            setIsEditingTime(false)
                            setEditedMinutes(task.actualMinutes.toString())
                          }
                        }}
                        autoFocus
                      />
                      <span className="text-xs">min</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 px-2"
                        onClick={handleSaveTimeAdjustment}
                      >
                        ✓
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 px-2"
                        onClick={() => {
                          setIsEditingTime(false)
                          setEditedMinutes(task.actualMinutes.toString())
                        }}
                      >
                        ✕
                      </Button>
                    </div>
                  ) : (
                    <button
                      onClick={() => !task.isTracking && setIsEditingTime(true)}
                      disabled={task.isTracking}
                      className={cn(
                        "cursor-pointer hover:text-primary transition-colors",
                        progress > 100 ? "text-destructive" : "text-foreground",
                        task.isTracking && "cursor-not-allowed opacity-50"
                      )}
                    >
                      {formatMinutes(currentActualMinutes)} / {formatMinutes(task.estimatedMinutes)}
                    </button>
                  )}
                </div>
              </div>
              <Progress
                value={Math.min(progress, 100)}
                className={cn("h-2", progress > 100 && "[&>div]:bg-destructive")}
              />
              {progress > 100 && (
                <p className="mt-1 text-xs text-destructive">
                  Over by {formatMinutes(currentActualMinutes - task.estimatedMinutes)}
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
              value={editedTitle}
              onChange={(e) => setEditedTitle(e.target.value)}
              className="bg-muted/30"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label className="text-muted-foreground">Description</Label>
            <Textarea
              value={editedDescription}
              onChange={(e) => setEditedDescription(e.target.value)}
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
                value={editedPriority}
                onValueChange={(value: "low" | "medium" | "high") =>
                  setEditedPriority(value)
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
                value={editedStatus}
                onValueChange={(value: "not-started" | "in-progress" | "completed") =>
                  setEditedStatus(value)
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
                  value={editedEstimatedMinutes}
                  onChange={(e) => setEditedEstimatedMinutes(e.target.value)}
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
                value={editedDueDate}
                onChange={(e) => setEditedDueDate(e.target.value)}
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
                <Badge key={tag} variant="secondary" className="group text-xs cursor-pointer hover:bg-secondary/80">
                  {tag}
                  <button
                    onClick={() => handleRemoveTag(tag)}
                    className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    ✕
                  </button>
                </Badge>
              ))}
              {isAddingTag ? (
                <div className="flex items-center gap-1">
                  <Input
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Enter tag..."
                    className="h-6 w-24 text-xs px-2"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleAddTag()
                      if (e.key === "Escape") {
                        setIsAddingTag(false)
                        setNewTag("")
                      }
                    }}
                    autoFocus
                  />
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 px-2"
                    onClick={handleAddTag}
                  >
                    ✓
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 px-2"
                    onClick={() => {
                      setIsAddingTag(false)
                      setNewTag("")
                    }}
                  >
                    ✕
                  </Button>
                </div>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 text-xs text-muted-foreground"
                  onClick={() => setIsAddingTag(true)}
                >
                  <Plus className="mr-1 h-3 w-3" />
                  Add Tag
                </Button>
              )}
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
                  {subtaskCounts.completed}/{subtaskCounts.total}
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
                {task.subtasks.length === 0 ? (
                  <div className="rounded-md border border-dashed border-border bg-muted/20 p-4 text-center">
                    <p className="mb-3 text-xs text-muted-foreground">
                      Break this task into smaller subtasks to track progress better
                    </p>
                  </div>
                ) : (
                  task.subtasks.map((subtask) => (
                    <SubtaskItem
                      key={subtask.id}
                      subtask={subtask}
                      depth={0}
                      onToggleComplete={toggleSubtaskComplete}
                      editingSubtaskId={editingSubtaskId}
                      editedSubtaskTitle={editedSubtaskTitle}
                      onStartEdit={startEditingSubtask}
                      onSaveEdit={saveSubtaskEdit}
                      onCancelEdit={cancelSubtaskEdit}
                      onEditTitleChange={setEditedSubtaskTitle}
                    />
                  ))
                )}

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
        <div className="flex flex-col gap-2">
          <Button
            onClick={handleSaveChanges}
            className="w-full"
            disabled={!hasUnsavedChanges}
          >
            Save Changes
          </Button>
          <Button
            variant="outline"
            className="w-full gap-2 bg-transparent"
            disabled
            title="Coming in Phase 1 - Calendar Integration"
          >
            <Calendar className="h-4 w-4" />
            Schedule Time Block
          </Button>
          <Button
            variant="destructive"
            className="w-full"
            onClick={() => {
              onTaskDelete(task.id);
              onClose();
            }}
          >
            Delete Task
          </Button>
        </div>
      </div>
    </div>
  )
}

// Recursive SubtaskItem component
function SubtaskItem({
  subtask,
  depth,
  onToggleComplete,
  editingSubtaskId,
  editedSubtaskTitle,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onEditTitleChange,
}: SubtaskItemProps) {
  const [isExpanded, setIsExpanded] = useState(true)
  const hasSubtasks = subtask.subtasks && subtask.subtasks.length > 0

  return (
    <div className="space-y-1">
      <div
        className="flex items-center gap-2 rounded-md bg-muted/30 p-2"
        style={{ marginLeft: depth * 16 }}
      >
        {/* Expand/Collapse for nested subtasks */}
        <div className="w-4 shrink-0">
          {hasSubtasks && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center justify-center"
            >
              {isExpanded ? (
                <ChevronDown className="h-3 w-3 text-muted-foreground" />
              ) : (
                <ChevronRight className="h-3 w-3 text-muted-foreground" />
              )}
            </button>
          )}
        </div>

        <Checkbox
          checked={subtask.status === "completed"}
          onCheckedChange={() => onToggleComplete(subtask.id)}
        />
        {editingSubtaskId === subtask.id ? (
          <>
            <Input
              value={editedSubtaskTitle}
              onChange={(e) => onEditTitleChange(e.target.value)}
              className="flex-1 h-7 text-sm"
              onKeyDown={(e) => {
                if (e.key === "Enter") onSaveEdit(subtask.id)
                if (e.key === "Escape") onCancelEdit()
              }}
              autoFocus
            />
            <Button
              size="sm"
              variant="ghost"
              className="h-7 px-2"
              onClick={() => onSaveEdit(subtask.id)}
            >
              ✓
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-7 px-2"
              onClick={onCancelEdit}
            >
              ✕
            </Button>
          </>
        ) : (
          <button
            onClick={() => onStartEdit(subtask)}
            className={cn(
              "flex-1 text-left text-sm hover:text-primary transition-colors",
              subtask.status === "completed" && "text-muted-foreground line-through"
            )}
          >
            {subtask.title}
          </button>
        )}
      </div>

      {/* Nested Subtasks */}
      {hasSubtasks && isExpanded && (
        <div className="space-y-1">
          {subtask.subtasks.map((nestedSubtask) => (
            <SubtaskItem
              key={nestedSubtask.id}
              subtask={nestedSubtask}
              depth={depth + 1}
              onToggleComplete={onToggleComplete}
              editingSubtaskId={editingSubtaskId}
              editedSubtaskTitle={editedSubtaskTitle}
              onStartEdit={onStartEdit}
              onSaveEdit={onSaveEdit}
              onCancelEdit={onCancelEdit}
              onEditTitleChange={onEditTitleChange}
            />
          ))}
        </div>
      )}
    </div>
  )
}
