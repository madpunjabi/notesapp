"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
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
import { Plus, Mic, Search, Sparkles, Calendar, Menu, Clock, LogOut, User, Trophy } from "lucide-react"
import type { Task } from "@/app/page"
import { db } from "@/lib/db"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

type HeaderProps = {
  onAddTask: (task: Task) => void
  onMenuToggle?: () => void
  user?: any
  totalPoints?: number
  searchQuery?: string
  onSearchChange?: (query: string) => void
  filterStatus?: "all" | "in-progress" | "completed" | "due-soon"
  onFilterChange?: (status: "all" | "in-progress" | "completed" | "due-soon") => void
}

export function Header({
  onAddTask,
  onMenuToggle,
  user,
  totalPoints = 0,
  searchQuery = "",
  onSearchChange,
  filterStatus = "all",
  onFilterChange
}: HeaderProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false)
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
            value={searchQuery}
            onChange={(e) => onSearchChange?.(e.target.value)}
          />
        </div>

        {/* Filter Buttons */}
        <div className="hidden items-center gap-1 md:flex">
          <Button
            variant={filterStatus === "all" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => onFilterChange?.("all")}
            className="text-xs"
          >
            All
          </Button>
          <Button
            variant={filterStatus === "in-progress" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => onFilterChange?.("in-progress")}
            className="text-xs"
          >
            In Progress
          </Button>
          <Button
            variant={filterStatus === "completed" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => onFilterChange?.("completed")}
            className="text-xs"
          >
            Completed
          </Button>
          <Button
            variant={filterStatus === "due-soon" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => onFilterChange?.("due-soon")}
            className="text-xs"
          >
            Due Soon
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-3">
        {/* Mobile Search & Filter Dialog */}
        <Dialog open={mobileSearchOpen} onOpenChange={setMobileSearchOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Search className="h-5 w-5" />
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-[calc(100vw-2rem)]">
            <DialogHeader>
              <DialogTitle>Search & Filter</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Search Tasks</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search by title, description, or tags..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => onSearchChange?.(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Filter</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant={filterStatus === "all" ? "secondary" : "outline"}
                    size="sm"
                    onClick={() => {
                      onFilterChange?.("all")
                      setMobileSearchOpen(false)
                    }}
                  >
                    All
                  </Button>
                  <Button
                    variant={filterStatus === "in-progress" ? "secondary" : "outline"}
                    size="sm"
                    onClick={() => {
                      onFilterChange?.("in-progress")
                      setMobileSearchOpen(false)
                    }}
                  >
                    In Progress
                  </Button>
                  <Button
                    variant={filterStatus === "completed" ? "secondary" : "outline"}
                    size="sm"
                    onClick={() => {
                      onFilterChange?.("completed")
                      setMobileSearchOpen(false)
                    }}
                  >
                    Completed
                  </Button>
                  <Button
                    variant={filterStatus === "due-soon" ? "secondary" : "outline"}
                    size="sm"
                    onClick={() => {
                      onFilterChange?.("due-soon")
                      setMobileSearchOpen(false)
                    }}
                  >
                    Due Soon
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Points Display */}
        {totalPoints > 0 && (
          <div className={cn(
            "hidden items-center gap-1.5 md:flex",
            "rounded-full bg-gradient-to-br from-primary/20 to-accent/20",
            "px-3 py-1.5 ring-1 ring-primary/30",
            "transition-all duration-300",
            "hover:scale-105 hover:shadow-lg hover:shadow-primary/20"
          )}>
            <Trophy className="h-4 w-4 text-primary animate-pulse" />
            <span className="text-sm font-bold tabular-nums bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              {totalPoints}
            </span>
          </div>
        )}

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              size="sm"
              className={cn(
                "gap-2 bg-gradient-to-br from-primary to-accent",
                "hover:opacity-90 hover:scale-105",
                "active:scale-95",
                "transition-all duration-200"
              )}
              data-add-task-button
            >
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
                <Button
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  className="transition-all duration-200 hover:scale-105"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleAddTask}
                  className={cn(
                    "bg-gradient-to-br from-primary to-accent",
                    "hover:opacity-90 hover:scale-105",
                    "active:scale-95",
                    "transition-all duration-200"
                  )}
                >
                  Create Task
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* User Menu */}
        {user && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.imageURL} alt={user.email} />
                  <AvatarFallback>
                    <User className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => db.auth.signOut()}>
                <LogOut className="mr-2 h-4 w-4" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </header>
  )
}
