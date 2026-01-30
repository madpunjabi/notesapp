"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Mic, Search, Sparkles, Calendar, Menu, Clock } from "lucide-react"
import type { Task } from "@/app/page"

type HeaderProps = {
  onAddTask: (task: Task) => void
  onMenuToggle?: () => void
}

export function Header({ onAddTask, onMenuToggle }: HeaderProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    estimatedMinutes: "",
    priority: "medium" as "low" | "medium" | "high",
    dueDate: "",
  })

  const handleAddTask = () => {
    if (!newTask.title.trim()) return

    const task: Task = {
      id: Date.now().toString(),
      title: newTask.title,
      description: newTask.description,
      estimatedMinutes: newTask.estimatedMinutes ? parseInt(newTask.estimatedMinutes) : undefined,
      actualMinutes: 0,
      priority: newTask.priority,
      status: "not-started",
      dueDate: newTask.dueDate || undefined,
      tags: [],
      subtasks: [],
      isTracking: false,
      timeBlocks: [],
    }

    onAddTask(task)
    setNewTask({
      title: "",
      description: "",
      estimatedMinutes: "",
      priority: "medium",
      dueDate: "",
    })
    setIsDialogOpen(false)
  }

  const handleVoiceInput = () => {
    setIsListening(true)
    // Simulate voice input for demo
    setTimeout(() => {
      setNewTask(prev => ({
        ...prev,
        title: "Review project proposal",
        estimatedMinutes: "30",
        priority: "high",
      }))
      setIsListening(false)
    }, 2000)
  }

  return (
    <header className="flex h-14 items-center justify-between border-b border-border bg-background px-3 md:h-16 md:px-6">
      <div className="flex items-center gap-2 md:gap-4">
        {/* Mobile Menu Button */}
        <Button 
          variant="ghost" 
          size="icon" 
          className="md:hidden" 
          onClick={onMenuToggle}
        >
          <Menu className="h-5 w-5" />
        </Button>
        
        {/* Mobile Logo */}
        <div className="flex items-center gap-2 md:hidden">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary">
            <Clock className="h-3.5 w-3.5 text-primary-foreground" />
          </div>
          <span className="font-semibold text-foreground">Tempo</span>
        </div>
        
        {/* Desktop Search */}
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search tasks..."
            className="w-80 bg-muted/50 pl-10"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-3">
        {/* Mobile Search Button */}
        <Button variant="ghost" size="icon" className="md:hidden">
          <Search className="h-5 w-5" />
        </Button>
        
        <Button variant="outline" size="sm" className="hidden gap-2 bg-transparent md:flex">
          <Sparkles className="h-4 w-4" />
          Auto-Schedule
        </Button>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Add Task</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Create New Task</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">Task Title</Label>
                <div className="flex gap-2">
                  <Input
                    id="title"
                    placeholder="What needs to be done?"
                    value={newTask.title}
                    onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={handleVoiceInput}
                    className={isListening ? "animate-pulse bg-primary/20" : ""}
                  >
                    <Mic className="h-4 w-4" />
                  </Button>
                </div>
                {isListening && (
                  <p className="text-xs text-muted-foreground">Listening...</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description (optional)</Label>
                <Textarea
                  id="description"
                  placeholder="Add more details..."
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="estimate">Estimated Time (min)</Label>
                  <Input
                    id="estimate"
                    type="number"
                    placeholder="30"
                    value={newTask.estimatedMinutes}
                    onChange={(e) => setNewTask({ ...newTask, estimatedMinutes: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select
                    value={newTask.priority}
                    onValueChange={(value: "low" | "medium" | "high") =>
                      setNewTask({ ...newTask, priority: value })
                    }
                  >
                    <SelectTrigger id="priority">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="dueDate">Due Date</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="dueDate"
                    type="date"
                    value={newTask.dueDate}
                    onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddTask}>Create Task</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </header>
  )
}
