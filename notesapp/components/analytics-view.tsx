"use client"

import { cn } from "@/lib/utils"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts"
import {
  Target,
  Clock,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  Zap,
  Calendar,
} from "lucide-react"
import type { Task } from "@/app/page"

type AnalyticsViewProps = {
  tasks: Task[]
}

// Mock data for charts
const weeklyData = [
  { day: "Mon", estimated: 240, actual: 210 },
  { day: "Tue", estimated: 300, actual: 280 },
  { day: "Wed", estimated: 180, actual: 220 },
  { day: "Thu", estimated: 360, actual: 340 },
  { day: "Fri", estimated: 420, actual: 390 },
  { day: "Sat", estimated: 120, actual: 100 },
  { day: "Sun", estimated: 60, actual: 45 },
]

const accuracyTrend = [
  { week: "W1", accuracy: 78 },
  { week: "W2", accuracy: 82 },
  { week: "W3", accuracy: 85 },
  { week: "W4", accuracy: 87 },
  { week: "W5", accuracy: 84 },
  { week: "W6", accuracy: 89 },
  { week: "W7", accuracy: 92 },
]

const categoryData = [
  { name: "Planning", value: 320, color: "var(--color-chart-1)" },
  { name: "Design", value: 280, color: "var(--color-chart-2)" },
  { name: "Development", value: 450, color: "var(--color-chart-3)" },
  { name: "Meetings", value: 180, color: "var(--color-chart-4)" },
  { name: "Review", value: 120, color: "var(--color-chart-5)" },
]

const dailyProductivity = [
  { hour: "8AM", tasks: 1 },
  { hour: "9AM", tasks: 3 },
  { hour: "10AM", tasks: 5 },
  { hour: "11AM", tasks: 4 },
  { hour: "12PM", tasks: 2 },
  { hour: "1PM", tasks: 1 },
  { hour: "2PM", tasks: 4 },
  { hour: "3PM", tasks: 6 },
  { hour: "4PM", tasks: 5 },
  { hour: "5PM", tasks: 3 },
]

export function AnalyticsView({ tasks }: AnalyticsViewProps) {
  const completedTasks = tasks.filter((t) => t.status === "completed").length
  const totalTasks = tasks.length
  const completionRate = Math.round((completedTasks / totalTasks) * 100)

  const totalEstimated = tasks.reduce((acc, t) => acc + (t.estimatedMinutes || 0), 0)
  const totalActual = tasks.reduce((acc, t) => acc + t.actualMinutes, 0)
  const estimationAccuracy = totalEstimated > 0 
    ? Math.round((1 - Math.abs(totalActual - totalEstimated) / totalEstimated) * 100)
    : 0

  const formatMinutes = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
  }

  return (
    <div className="p-3 md:p-6">
      <div className="mb-4 md:mb-6">
        <h1 className="text-xl font-semibold text-foreground md:text-2xl">Analytics</h1>
        <p className="mt-1 text-xs text-muted-foreground md:text-sm">
          Track your productivity and improve time estimation
        </p>
      </div>

      {/* Stats Cards - Single column on mobile for readability */}
      <div className="mb-6 flex flex-col gap-3 md:mb-8 md:grid md:grid-cols-4 md:gap-4">
        <Card className="bg-card">
          <CardContent className="flex items-center justify-between p-3 md:block md:p-6">
            <div className="flex items-center gap-3 md:gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-success/20 md:h-12 md:w-12">
                <CheckCircle2 className="h-5 w-5 text-success md:h-6 md:w-6" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground md:text-sm">Tasks Completed</p>
                <p className="text-lg font-bold text-foreground md:text-2xl">
                  {completedTasks}/{totalTasks}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 md:mt-4 md:block">
              <div className="hidden md:mb-1 md:flex md:justify-between md:text-xs">
                <span className="text-muted-foreground">Completion Rate</span>
                <span className="font-medium text-foreground">{completionRate}%</span>
              </div>
              <Progress value={completionRate} className="hidden h-2 md:block" />
              <span className="text-sm font-medium text-foreground md:hidden">{completionRate}%</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card">
          <CardContent className="flex items-center justify-between p-3 md:block md:p-6">
            <div className="flex items-center gap-3 md:gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-info/20 md:h-12 md:w-12">
                <Clock className="h-5 w-5 text-info md:h-6 md:w-6" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground md:text-sm">Time Tracked</p>
                <p className="text-lg font-bold text-foreground md:text-2xl">
                  {formatMinutes(totalActual)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1 text-xs md:mt-4 md:gap-2">
              <span className="text-muted-foreground">vs</span>
              <span className={cn(
                "font-medium",
                totalActual <= totalEstimated ? "text-success" : "text-destructive"
              )}>
                {formatMinutes(totalEstimated)}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card">
          <CardContent className="flex items-center justify-between p-3 md:block md:p-6">
            <div className="flex items-center gap-3 md:gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-warning/20 md:h-12 md:w-12">
                <Zap className="h-5 w-5 text-warning md:h-6 md:w-6" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground md:text-sm">Estimation Accuracy</p>
                <p className="text-lg font-bold text-foreground md:text-2xl">{estimationAccuracy}%</p>
              </div>
            </div>
            <div className="flex items-center gap-1 text-xs text-success md:mt-4 md:gap-2">
              <TrendingUp className="h-3 w-3" />
              <span>+5%</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card">
          <CardContent className="flex items-center justify-between p-3 md:block md:p-6">
            <div className="flex items-center gap-3 md:gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/20 md:h-12 md:w-12">
                <Target className="h-5 w-5 text-primary md:h-6 md:w-6" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground md:text-sm">Focus Score</p>
                <p className="text-lg font-bold text-foreground md:text-2xl">8.4</p>
              </div>
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground md:mt-4 md:gap-2">
              <Calendar className="h-3 w-3" />
              <span className="hidden md:inline">Based on this week&apos;s activity</span>
              <span className="md:hidden">This week</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="mb-4 grid grid-cols-1 gap-4 md:mb-6 md:grid-cols-2 md:gap-6">
        {/* Estimated vs Actual Time */}
        <Card className="bg-card">
          <CardHeader>
            <CardTitle className="text-lg">Estimated vs Actual Time</CardTitle>
            <CardDescription>Weekly comparison of time estimates</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                estimated: { label: "Estimated", color: "var(--color-chart-2)" },
                actual: { label: "Actual", color: "var(--color-chart-1)" },
              }}
              className="h-[180px] md:h-[250px]"
            >
              <BarChart data={weeklyData}>
                <XAxis dataKey="day" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} tickFormatter={(v) => `${v / 60}h`} />
                <ChartTooltip
                  content={<ChartTooltipContent />}
                  formatter={(value) => `${Math.round(Number(value) / 60 * 10) / 10}h`}
                />
                <Bar dataKey="estimated" fill="var(--color-chart-2)" radius={[4, 4, 0, 0]} opacity={0.5} />
                <Bar dataKey="actual" fill="var(--color-chart-1)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Estimation Accuracy Trend */}
        <Card className="bg-card">
          <CardHeader>
            <CardTitle className="text-lg">Estimation Accuracy Trend</CardTitle>
            <CardDescription>How your estimation skills are improving</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                accuracy: { label: "Accuracy", color: "var(--color-chart-1)" },
              }}
              className="h-[180px] md:h-[250px]"
            >
              <AreaChart data={accuracyTrend}>
                <defs>
                  <linearGradient id="accuracyGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-chart-1)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="var(--color-chart-1)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="week" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} domain={[70, 100]} tickFormatter={(v) => `${v}%`} />
                <ChartTooltip
                  content={<ChartTooltipContent />}
                  formatter={(value) => `${value}%`}
                />
                <Area
                  type="monotone"
                  dataKey="accuracy"
                  stroke="var(--color-chart-1)"
                  strokeWidth={2}
                  fill="url(#accuracyGradient)"
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-6">
        {/* Time Distribution by Category */}
        <Card className="bg-card">
          <CardHeader>
            <CardTitle className="text-lg">Time by Category</CardTitle>
            <CardDescription>Distribution of tracked time</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                planning: { label: "Planning", color: "var(--color-chart-1)" },
                design: { label: "Design", color: "var(--color-chart-2)" },
                development: { label: "Development", color: "var(--color-chart-3)" },
                meetings: { label: "Meetings", color: "var(--color-chart-4)" },
                review: { label: "Review", color: "var(--color-chart-5)" },
              }}
              className="h-[160px] md:h-[200px]"
            >
              <PieChart>
                <ChartTooltip
                  content={<ChartTooltipContent />}
                  formatter={(value) => formatMinutes(Number(value))}
                />
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ChartContainer>
            <div className="mt-4 grid grid-cols-2 gap-2">
              {categoryData.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-xs text-muted-foreground">{item.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Daily Productivity Pattern */}
        <Card className="bg-card md:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Productivity Pattern</CardTitle>
            <CardDescription>Your most productive hours today</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                tasks: { label: "Tasks Completed", color: "var(--color-chart-1)" },
              }}
              className="h-[160px] md:h-[200px]"
            >
              <LineChart data={dailyProductivity}>
                <XAxis dataKey="hour" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line
                  type="monotone"
                  dataKey="tasks"
                  stroke="var(--color-chart-1)"
                  strokeWidth={2}
                  dot={{ fill: "var(--color-chart-1)", strokeWidth: 2 }}
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Insights Section */}
      <div className="mt-4 md:mt-6">
        <Card className="bg-card">
          <CardHeader className="p-4 md:p-6">
            <CardTitle className="flex items-center gap-2 text-base md:text-lg">
              <AlertCircle className="h-4 w-4 text-primary md:h-5 md:w-5" />
              AI Insights
            </CardTitle>
            <CardDescription className="text-xs md:text-sm">Personalized recommendations based on your patterns</CardDescription>
          </CardHeader>
          <CardContent className="p-4 pt-0 md:p-6 md:pt-0">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3 md:gap-4">
              <div className="rounded-lg border border-border bg-muted/30 p-3 md:p-4">
                <h4 className="text-sm font-medium text-foreground md:text-base">Peak Productivity</h4>
                <p className="mt-1 text-xs text-muted-foreground md:text-sm">
                  You&apos;re most productive between 10 AM - 11 AM and 3 PM - 4 PM. Consider scheduling complex tasks during these windows.
                </p>
              </div>
              <div className="rounded-lg border border-border bg-muted/30 p-3 md:p-4">
                <h4 className="text-sm font-medium text-foreground md:text-base">Estimation Tip</h4>
                <p className="mt-1 text-xs text-muted-foreground md:text-sm">
                  You tend to underestimate design tasks by ~20%. Try adding a buffer when planning similar work.
                </p>
              </div>
              <div className="rounded-lg border border-border bg-muted/30 p-3 md:p-4">
                <h4 className="text-sm font-medium text-foreground md:text-base">Meeting Load</h4>
                <p className="mt-1 text-xs text-muted-foreground md:text-sm">
                  Meetings consume 15% of your week. Consider batching them to preserve focus time.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
