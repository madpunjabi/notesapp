"use client"

import { useState } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { TaskListView } from "@/components/task-list-view"
import { CalendarView } from "@/components/calendar-view"
import { AnalyticsView } from "@/components/analytics-view"
import { TaskDetailPanel } from "@/components/task-detail-panel"
import { Header } from "@/components/header"

export type Task = {
  id: string
  title: string
  description?: string
  estimatedMinutes?: number
  actualMinutes: number
  priority: "low" | "medium" | "high"
  status: "not-started" | "in-progress" | "completed"
  dueDate?: string
  tags: string[]
  subtasks: Task[]
  isTracking: boolean
  timeBlocks: TimeBlock[]
}

export type TimeBlock = {
  id: string
  taskId: string
  start: Date
  end: Date
}

const initialTasks: Task[] = [
  {
    id: "1",
    title: "Q1 Planning Document",
    description: "Prepare comprehensive Q1 planning document for stakeholder review",
    estimatedMinutes: 120,
    actualMinutes: 45,
    priority: "high",
    status: "in-progress",
    dueDate: "2026-01-30",
    tags: ["planning", "q1"],
    isTracking: false,
    timeBlocks: [],
    subtasks: [
      {
        id: "1-1",
        title: "Research competitor strategies",
        estimatedMinutes: 45,
        actualMinutes: 30,
        priority: "medium",
        status: "completed",
        tags: ["research"],
        subtasks: [],
        isTracking: false,
        timeBlocks: [],
      },
      {
        id: "1-2",
        title: "Draft executive summary",
        estimatedMinutes: 30,
        actualMinutes: 0,
        priority: "high",
        status: "not-started",
        tags: ["writing"],
        subtasks: [],
        isTracking: false,
        timeBlocks: [],
      },
    ],
  },
  {
    id: "2",
    title: "Design System Updates",
    description: "Update component library with new design tokens",
    estimatedMinutes: 90,
    actualMinutes: 60,
    priority: "medium",
    status: "in-progress",
    dueDate: "2026-02-01",
    tags: ["design", "components"],
    isTracking: true,
    timeBlocks: [],
    subtasks: [
      {
        id: "2-1",
        title: "Update color palette",
        estimatedMinutes: 30,
        actualMinutes: 30,
        priority: "medium",
        status: "completed",
        tags: ["design"],
        subtasks: [],
        isTracking: false,
        timeBlocks: [],
      },
      {
        id: "2-2",
        title: "Update typography scale",
        estimatedMinutes: 30,
        actualMinutes: 20,
        priority: "medium",
        status: "in-progress",
        tags: ["design"],
        subtasks: [],
        isTracking: false,
        timeBlocks: [],
      },
    ],
  },
  {
    id: "3",
    title: "Client Meeting Prep",
    description: "Prepare presentation slides for client meeting",
    estimatedMinutes: 60,
    actualMinutes: 0,
    priority: "high",
    status: "not-started",
    dueDate: "2026-01-29",
    tags: ["meeting", "client"],
    isTracking: false,
    timeBlocks: [],
    subtasks: [],
  },
  {
    id: "4",
    title: "Code Review",
    description: "Review pull requests from the team",
    estimatedMinutes: 45,
    actualMinutes: 45,
    priority: "low",
    status: "completed",
    tags: ["code", "review"],
    isTracking: false,
    timeBlocks: [],
    subtasks: [],
  },
]

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>(initialTasks)
  const [activeView, setActiveView] = useState<"tasks" | "calendar" | "analytics">("tasks")
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleTaskUpdate = (updatedTask: Task) => {
    setTasks(prev => updateTaskInList(prev, updatedTask))
    if (selectedTask?.id === updatedTask.id) {
      setSelectedTask(updatedTask)
    }
  }

  const updateTaskInList = (taskList: Task[], updatedTask: Task): Task[] => {
    return taskList.map(task => {
      if (task.id === updatedTask.id) {
        return updatedTask
      }
      if (task.subtasks.length > 0) {
        return {
          ...task,
          subtasks: updateTaskInList(task.subtasks, updatedTask),
        }
      }
      return task
    })
  }

  const handleAddTask = (newTask: Task) => {
    setTasks(prev => [...prev, newTask])
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <AppSidebar
          activeView={activeView}
          onViewChange={setActiveView}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
      </div>
      
      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div 
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
            onKeyDown={(e) => e.key === "Escape" && setMobileMenuOpen(false)}
          />
          <div className="absolute left-0 top-0 h-full w-64 shadow-xl">
            <AppSidebar
              activeView={activeView}
              onViewChange={(view) => {
                setActiveView(view)
                setMobileMenuOpen(false)
              }}
              collapsed={false}
              onToggleCollapse={() => setMobileMenuOpen(false)}
            />
          </div>
        </div>
      )}
      
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header 
          onAddTask={handleAddTask} 
          onMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)}
        />
        <main className="flex flex-1 overflow-hidden">
          <div className="flex-1 overflow-auto">
            {activeView === "tasks" && (
              <TaskListView
                tasks={tasks}
                onTaskSelect={setSelectedTask}
                onTaskUpdate={handleTaskUpdate}
                selectedTaskId={selectedTask?.id}
              />
            )}
            {activeView === "calendar" && (
              <CalendarView tasks={tasks} onTaskUpdate={handleTaskUpdate} />
            )}
            {activeView === "analytics" && <AnalyticsView tasks={tasks} />}
          </div>
          {selectedTask && activeView === "tasks" && (
            <TaskDetailPanel
              task={selectedTask}
              onClose={() => setSelectedTask(null)}
              onTaskUpdate={handleTaskUpdate}
            />
          )}
        </main>
      </div>
    </div>
  )
}
