"use client"

export const dynamic = 'force-dynamic'

import { useState } from "react"
import { db } from "@/lib/db"
import { id } from "@instantdb/react"
import { AppSidebar } from "@/components/app-sidebar"
import { TaskListView } from "@/components/task-list-view"
import { TaskDetailPanel } from "@/components/task-detail-panel"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
// Calendar and Analytics views removed for MVP - will add in Phase 1

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
  trackingStartedAt?: number
  timeBlocks: TimeBlock[]
}

export type TimeBlock = {
  id: string
  taskId: string
  start: Date
  end: Date
}

// Login component
function LoginPage({ onDevMode }: { onDevMode: () => void }) {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [sentEmail, setSentEmail] = useState("");

  const sendCode = async () => {
    if (!email) return;
    try {
      await db.auth.sendMagicCode({ email });
      setSentEmail(email);
      alert("Code sent! Check your email.");
    } catch (err: any) {
      console.error("Send code error:", err);
      alert("Error sending code: " + (err.body?.message || err.message || "Unknown error"));
      setSentEmail("");
    }
  };

  const signIn = async () => {
    try {
      await db.auth.signInWithMagicCode({ email: sentEmail, code });
    } catch (err: any) {
      console.error("Sign in error:", err);
      alert("Error signing in: " + (err.body?.message || err.message || "Unknown error"));
      setCode("");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-6 p-8 max-w-md w-full">
        <div className="flex flex-col items-center gap-2">
          <h1 className="text-4xl font-bold">TimeBlock</h1>
          <p className="text-muted-foreground text-center">
            Break down complex tasks, track your time, and earn points
          </p>
        </div>

        {!sentEmail ? (
          <div className="flex flex-col gap-3 w-full">
            <input
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Enter your email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendCode()}
            />
            <Button size="lg" onClick={sendCode} disabled={!email}>
              Send Code
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-3 w-full">
            <p className="text-sm text-muted-foreground text-center">
              Code sent to {sentEmail}
            </p>
            <input
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Enter 6-digit code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && signIn()}
              autoFocus
            />
            <Button size="lg" onClick={signIn} disabled={!code}>
              Sign In
            </Button>
            <Button variant="ghost" onClick={() => setSentEmail("")}>
              Use different email
            </Button>
          </div>
        )}

        {/* Dev Mode Button */}
        <div className="mt-8 pt-6 border-t border-border w-full">
          <Button variant="outline" onClick={onDevMode} className="w-full">
            🚀 Dev Mode (Skip Auth)
          </Button>
          <p className="text-xs text-muted-foreground text-center mt-2">
            For development only
          </p>
        </div>
      </div>
    </div>
  );
}

// Main app component
function MainApp({ user }: { user: any }) {
  const [activeView, setActiveView] = useState<"tasks" | "calendar" | "analytics">("tasks")
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterStatus, setFilterStatus] = useState<"all" | "in-progress" | "completed" | "due-soon">("all")

  // Fetch tasks and user data from InstantDB
  const { isLoading, error, data } = db.useQuery({
    tasks: {
      $: {
        where: {
          "owner.id": user.id,
          "parentTask.id": { $isNull: true }, // Only root tasks
        },
        order: {
          order: "asc",
        },
      },
      subtasks: {
        subtasks: {}, // Nested subtasks (2 levels)
      },
    },
    $users: {
      $: {
        where: {
          id: user.id,
        },
      },
    },
  });

  // Filter and search tasks
  const filterTasks = (taskList: Task[]): Task[] => {
    return taskList.filter(task => {
      // Search filter
      const matchesSearch = !searchQuery ||
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));

      // Status filter
      let matchesStatus = true;
      if (filterStatus === "in-progress") {
        matchesStatus = task.status === "in-progress" || task.isTracking;
      } else if (filterStatus === "completed") {
        matchesStatus = task.status === "completed";
      } else if (filterStatus === "due-soon") {
        // Due within next 3 days
        if (task.dueDate) {
          const dueDate = new Date(task.dueDate);
          const today = new Date();
          const threeDaysFromNow = new Date(today);
          threeDaysFromNow.setDate(today.getDate() + 3);
          matchesStatus = dueDate >= today && dueDate <= threeDaysFromNow && task.status !== "completed";
        } else {
          matchesStatus = false;
        }
      }

      return matchesSearch && matchesStatus;
    });
  };

  // Convert InstantDB tasks to our Task type
  const tasks: Task[] = data?.tasks?.map((task: any) => ({
    id: task.id,
    title: task.title,
    description: task.description,
    estimatedMinutes: task.estimatedMinutes,
    actualMinutes: task.actualMinutes || 0,
    priority: task.priority || "medium",
    status: task.status || "not-started",
    dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : undefined,
    tags: Array.isArray(task.tags) ? task.tags : [],
    subtasks: task.subtasks?.map((sub: any) => ({
      id: sub.id,
      title: sub.title,
      description: sub.description,
      estimatedMinutes: sub.estimatedMinutes,
      actualMinutes: sub.actualMinutes || 0,
      priority: sub.priority || "medium",
      status: sub.status || "not-started",
      tags: Array.isArray(sub.tags) ? sub.tags : [],
      subtasks: sub.subtasks?.map((subsub: any) => ({
        id: subsub.id,
        title: subsub.title,
        description: subsub.description,
        estimatedMinutes: subsub.estimatedMinutes,
        actualMinutes: subsub.actualMinutes || 0,
        priority: subsub.priority || "medium",
        status: subsub.status || "not-started",
        tags: Array.isArray(subsub.tags) ? subsub.tags : [],
        subtasks: [],
        isTracking: subsub.isTracking || false,
        trackingStartedAt: subsub.trackingStartedAt,
        timeBlocks: [],
      })) || [],
      isTracking: sub.isTracking || false,
      trackingStartedAt: sub.trackingStartedAt,
      timeBlocks: [],
    })) || [],
    isTracking: task.isTracking || false,
    trackingStartedAt: task.trackingStartedAt,
    timeBlocks: [],
  })) || [];

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary/30 border-t-primary"></div>
          <p className="text-sm text-muted-foreground">Loading your tasks...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
        <div className="flex max-w-md flex-col items-center gap-4 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
            <svg className="h-8 w-8 text-destructive" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div>
            <h3 className="mb-2 text-lg font-semibold text-foreground">Error loading tasks</h3>
            <p className="mb-4 text-sm text-muted-foreground">{error.message}</p>
            <Button onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const handleTaskUpdate = async (updatedTask: Task) => {
    try {
      // Find the original task to compare
      const findTask = (tasks: Task[], taskId: string): Task | null => {
        for (const task of tasks) {
          if (task.id === taskId) return task;
          if (task.subtasks.length > 0) {
            const found = findTask(task.subtasks, taskId);
            if (found) return found;
          }
        }
        return null;
      };
      const originalTask = findTask(tasks, updatedTask.id);

      // Handle timer toggle
      if (originalTask && originalTask.isTracking !== updatedTask.isTracking) {
        if (updatedTask.isTracking) {
          // Starting timer
          await db.transact([
            db.tx.tasks[updatedTask.id].update({
              isTracking: true,
              trackingStartedAt: Date.now(),
              status: "in-progress",
            }),
          ]);
        } else {
          // Stopping timer
          const startTime = originalTask.trackingStartedAt || Date.now();
          const elapsed = Math.floor((Date.now() - startTime) / 1000 / 60); // minutes
          const newActualMinutes = (originalTask.actualMinutes || 0) + elapsed;

          // Create time log
          const timeLogId = id();
          await db.transact([
            db.tx.tasks[updatedTask.id].update({
              isTracking: false,
              trackingStartedAt: undefined,
              actualMinutes: newActualMinutes,
            }),
            db.tx.timeLogs[timeLogId]
              .update({
                startedAt: startTime,
                endedAt: Date.now(),
                durationMinutes: elapsed,
                createdAt: Date.now(),
              })
              .link({ task: updatedTask.id, owner: user.id }),
          ]);
        }
        return;
      }

      // Regular update (not timer-related)
      const points = updatedTask.estimatedMinutes
        ? Math.floor(updatedTask.estimatedMinutes / 15)
        : 0;

      const transactions: any[] = [
        db.tx.tasks[updatedTask.id].update({
          title: updatedTask.title,
          description: updatedTask.description,
          estimatedMinutes: updatedTask.estimatedMinutes,
          actualMinutes: updatedTask.actualMinutes,
          priority: updatedTask.priority,
          status: updatedTask.status,
          dueDate: updatedTask.dueDate ? new Date(updatedTask.dueDate).getTime() : undefined,
          points,
          completedAt: updatedTask.status === "completed" ? Date.now() : undefined,
          tags: updatedTask.tags,
        }),
      ];

      // Award points when task is completed
      if (updatedTask.status === "completed" && originalTask?.status !== "completed" && points > 0) {
        const currentPoints = data?.$users?.find((u: any) => u.id === user.id)?.totalPoints || 0;
        transactions.push(
          db.tx.$users[user.id].update({
            totalPoints: currentPoints + points,
          })
        );
      }

      await db.transact(transactions);
    } catch (error) {
      console.error("Error updating task:", error);
      alert("Failed to update task");
    }
  };

  const handleAddTask = async (newTask: Task) => {
    try {
      const taskId = id();
      const points = newTask.estimatedMinutes
        ? Math.floor(newTask.estimatedMinutes / 15)
        : 0;

      // Set order to be at the end of the current list
      const maxOrder = tasks.length > 0
        ? Math.max(...tasks.map(t => (t as any).order || 0))
        : -1;

      await db.transact([
        db.tx.tasks[taskId]
          .update({
            title: newTask.title,
            description: newTask.description,
            estimatedMinutes: newTask.estimatedMinutes,
            actualMinutes: 0,
            priority: newTask.priority,
            status: "not-started",
            dueDate: newTask.dueDate ? new Date(newTask.dueDate).getTime() : undefined,
            points,
            isTracking: false,
            createdAt: Date.now(),
            order: maxOrder + 1,
          })
          .link({ owner: user.id }),
      ]);
    } catch (error) {
      console.error("Error creating task:", error);
      alert("Failed to create task");
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm("Are you sure you want to delete this task? This will also delete all subtasks.")) {
      return;
    }

    try {
      // Find the task to check if it was completed and had points
      const findTask = (tasks: Task[], id: string): Task | null => {
        for (const task of tasks) {
          if (task.id === id) return task;
          if (task.subtasks.length > 0) {
            const found = findTask(task.subtasks, id);
            if (found) return found;
          }
        }
        return null;
      };
      const taskToDelete = findTask(tasks, taskId);

      // Collect all task IDs to delete (task + all nested subtasks)
      const collectTaskIds = (task: Task): string[] => {
        const ids = [task.id];
        task.subtasks.forEach((subtask) => {
          ids.push(...collectTaskIds(subtask));
        });
        return ids;
      };
      const idsToDelete = taskToDelete ? collectTaskIds(taskToDelete) : [taskId];

      // Calculate total points to deduct if tasks were completed
      let pointsToDeduct = 0;
      const checkPoints = (task: Task) => {
        if (task.status === "completed" && task.estimatedMinutes) {
          pointsToDeduct += Math.floor(task.estimatedMinutes / 15);
        }
        task.subtasks.forEach(checkPoints);
      };
      if (taskToDelete) {
        checkPoints(taskToDelete);
      }

      // Create delete transactions
      const transactions: any[] = idsToDelete.map((id) => db.tx.tasks[id].delete());

      // Deduct points if necessary
      if (pointsToDeduct > 0) {
        const currentPoints = data?.$users?.find((u: any) => u.id === user.id)?.totalPoints || 0;
        transactions.push(
          db.tx.$users[user.id].update({
            totalPoints: Math.max(0, currentPoints - pointsToDeduct),
          })
        );
      }

      await db.transact(transactions);

      // Close detail panel if deleted task was selected
      if (selectedTask?.id === taskId) {
        setSelectedTask(null);
      }
    } catch (error) {
      console.error("Error deleting task:", error);
      alert("Failed to delete task");
    }
  };

  const handleAddSubtask = async (parentTaskId: string, subtaskTitle: string) => {
    try {
      const subtaskId = id();
      await db.transact([
        db.tx.tasks[subtaskId]
          .update({
            title: subtaskTitle,
            actualMinutes: 0,
            priority: "medium",
            status: "not-started",
            isTracking: false,
            createdAt: Date.now(),
          })
          .link({ owner: user.id, parentTask: parentTaskId }),
      ]);
    } catch (error) {
      console.error("Error creating subtask:", error);
      alert("Failed to create subtask");
    }
  };

  const handleTaskReorder = async (taskId: string, newOrder: number) => {
    try {
      // Get all tasks that need reordering
      const reorderedTasks = [...tasks];
      const oldIndex = reorderedTasks.findIndex((t) => t.id === taskId);
      if (oldIndex === -1) return;

      // Move task to new position
      const [movedTask] = reorderedTasks.splice(oldIndex, 1);
      reorderedTasks.splice(newOrder, 0, movedTask);

      // Update order field for all affected tasks
      const transactions = reorderedTasks.map((task, index) =>
        db.tx.tasks[task.id].update({ order: index })
      );

      await db.transact(transactions);
    } catch (error) {
      console.error("Error reordering tasks:", error);
      alert("Failed to reorder tasks");
    }
  };

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
          user={user}
          totalPoints={data?.$users?.[0]?.totalPoints || 0}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          filterStatus={filterStatus}
          onFilterChange={setFilterStatus}
        />
        <main className="flex flex-1 overflow-hidden">
          <div className="flex-1 overflow-auto">
            {activeView === "tasks" && (
              <TaskListView
                tasks={filterTasks(tasks)}
                onTaskSelect={setSelectedTask}
                onTaskUpdate={handleTaskUpdate}
                onTaskDelete={handleDeleteTask}
                onTaskReorder={handleTaskReorder}
                selectedTaskId={selectedTask?.id}
              />
            )}
            {activeView === "calendar" && (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                Calendar view - Coming in Phase 1
              </div>
            )}
            {activeView === "analytics" && (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                Analytics view - Coming in Phase 2
              </div>
            )}
          </div>
          {selectedTask && activeView === "tasks" && (
            <TaskDetailPanel
              task={selectedTask}
              onClose={() => setSelectedTask(null)}
              onTaskUpdate={handleTaskUpdate}
              onTaskDelete={handleDeleteTask}
              onAddSubtask={handleAddSubtask}
            />
          )}
        </main>
      </div>
    </div>
  )
}

// Root component with auth check
export default function Home() {
  const { isLoading, user, error } = db.useAuth();
  const [devMode, setDevMode] = useState(false);

  // Dev mode bypass
  if (devMode) {
    const devUser = {
      id: "dev-user-123",
      email: "dev@timeblock.app",
      imageURL: undefined,
    };
    return <MainApp user={devUser} />;
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary/30 border-t-primary"></div>
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
        <div className="flex max-w-md flex-col items-center gap-4 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
            <svg className="h-8 w-8 text-destructive" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div>
            <h3 className="mb-2 text-lg font-semibold text-foreground">Authentication Error</h3>
            <p className="mb-4 text-sm text-muted-foreground">{error.message}</p>
            <Button onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginPage onDevMode={() => setDevMode(true)} />;
  }

  return <MainApp user={user} />;
}
