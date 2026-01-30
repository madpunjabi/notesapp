# TimeBlock Design System

> **Last Updated**: January 2026
> **Version**: 2.0 - Playful & Delightful Enhancement

This document serves as the single source of truth for TimeBlock's design system, visual language, and UI/UX guidelines.

---

## Table of Contents

1. [Design Philosophy](#design-philosophy)
2. [Current Design System](#current-design-system)
3. [2026 Enhancement Plan](#2026-enhancement-plan)
4. [Implementation Guide](#implementation-guide)
5. [Component Patterns](#component-patterns)
6. [Research & Trends](#research--trends)
7. [Testing & Verification](#testing--verification)

---

## Design Philosophy

**Core Principle**: Add personality and delight without sacrificing speed, clarity, or accessibility.

### Brand Personality
- **Warm & Inviting**: Peachy color palette creates a sunny, welcoming atmosphere
- **Playful & Delightful**: Micro-interactions and animations that make users smile
- **Efficient & Fast**: Speed-focused minimalism inspired by Linear and Motion
- **Encouraging**: Positive reinforcement through points, confetti, and delightful copy

### Design Goals
1. Make task management feel **rewarding** rather than overwhelming
2. Create **emotional connection** through personality-driven interactions
3. Maintain **clarity and speed** as top priorities
4. Ensure **accessibility** for all users

---

## Current Design System

### Color Palette

#### Light Mode (Sunny Peachy Theme)
```css
--background: oklch(0.97 0.02 70)      /* Warm off-white */
--foreground: oklch(0.25 0.03 50)      /* Dark text */
--primary: oklch(0.65 0.18 45)         /* Peachy primary */
--accent: oklch(0.75 0.15 55)          /* Warm accent */
--muted: oklch(0.94 0.03 70)           /* Subtle backgrounds */
--border: oklch(0.88 0.04 60)          /* Soft borders */
```

**Hue Range**: 45-70 (warm peachy tones)
**Chroma**: 0.15-0.18 (vibrant but not overwhelming)
**Lightness**: High contrast for readability

#### Dark Mode (Cozy Evening Vibes)
```css
--background: oklch(0.18 0.02 50)      /* Warm dark */
--foreground: oklch(0.95 0.02 70)      /* Light text */
--primary: oklch(0.75 0.16 50)         /* Bright peachy */
--accent: oklch(0.75 0.16 50)          /* Warm accent */
```

**Philosophy**: Warmer tones instead of pure black/gray for cozy feel

#### Semantic Colors
```css
--success: oklch(0.65 0.18 145)        /* Green for completed */
--warning: oklch(0.75 0.15 80)         /* Yellow for due soon */
--info: oklch(0.6 0.15 230)            /* Blue for info */
--destructive: oklch(0.55 0.2 25)      /* Red for delete */
```

### Typography

**Font Family**:
- **Sans**: Geist Sans (primary UI font)
- **Mono**: Geist Mono (code/technical elements)

**Hierarchy** (Current):
- **Page Titles**: `text-2xl` (1.5rem / 24px)
- **Task Titles**: `text-sm md:text-base` (14px / 16px)
- **Body Text**: `text-sm` (14px)
- **Labels**: `text-xs` (12px)

**Font Weights**:
- Regular: 400
- Medium: 500
- Semibold: 600
- Bold: 700

### Spacing & Layout

**Border Radius**:
- Default: `0.625rem` (10px)
- Small: `0.5rem` (8px)
- Large: `0.75rem` (12px)

**Component Spacing**:
- Gap between items: `0.5rem` (8px)
- Padding: `0.75rem` (12px) for compact, `1rem` (16px) for comfortable

**Grid System**:
- Mobile-first responsive design
- Breakpoints: sm (640px), md (768px), lg (1024px)

### Current Components

#### Task Cards
- Border: `border-transparent` with hover state
- Background: Muted on hover
- Padding: Responsive (smaller on mobile)
- Features: Expandable subtasks, drag-and-drop, timer integration

#### Buttons
- Primary: Solid primary color background
- Secondary: Muted background
- Ghost: Transparent with hover
- Icon buttons: Square with icon centering

#### Badges
- Priority indicators (low/medium/high)
- Status badges (not-started/in-progress/completed)
- Points display with trophy icon

---

## 2026 Enhancement Plan

### Research Summary

Based on analysis of modern productivity apps (Notion, Linear, Motion) and 2026 design trends:

**Key Trends**:
1. **Liquid Glass / Glassmorphism** - Depth through translucency
2. **Micro-interactions as Personality** - Every interaction tells a story
3. **Bold Typography** - Stronger visual hierarchy
4. **Delightful Experiences** - Moments that make users smile
5. **Motion Design** - Purposeful, meaningful animations

### Enhancement Focus: Playful & Delightful

**Timeline**: 1-2 days (Quick Wins)

#### Phase 1: Micro-Interaction Magic ✨

**Task Card Interactions**:
- Hover: Translate up 2px + shadow + border glow
- Click: Scale down to 98% (tactile feedback)
- Drag: Rotate 2-3deg + shadow increase
- Complete: Bounce animation + color ripple

**Button Enhancements**:
- Primary buttons: Gradient background
- Hover: Scale to 102%
- Timer active: Pulsing glow effect
- Icon buttons: Subtle rotate/bounce on hover

**Badge Animations**:
- Priority badges: Gentle bounce on hover
- Points: Pop animation when increased + sparkle
- Status: Smooth color transitions

#### Phase 2: Typography & Hierarchy 📝

**Size Adjustments**:
```tsx
// Before → After
text-2xl → text-3xl md:text-4xl     // Page titles
text-base → text-base font-semibold  // Active tasks
text-sm → text-sm tabular-nums       // Numbers/stats
```

**Font Weight Variations**:
- Active tasks: `font-semibold` (600)
- Completed: `opacity-60` + line-through
- Emphasis: Gradient text with `bg-clip-text`

#### Phase 3: Color & Gradient Vibrancy 🌈

**Gradient Accents**:
```tsx
// Primary buttons
bg-gradient-to-br from-primary to-accent

// Progress bars
bg-gradient-to-r from-primary via-accent to-primary
+ animate-gradient

// Points badge
bg-gradient-to-br from-primary/20 to-accent/20
```

**Visual Enhancements**:
- Border radius: `rounded-lg` → `rounded-xl` (friendlier)
- Shadows: Use colored shadows (`shadow-primary/20`)
- Vibrant states: Increase color saturation

#### Phase 4: Personality in Details 🎭

**Delightful Copy**:
- Empty state: "Ready to tackle the world? Add your first task! 🚀"
- All complete: "🎉 You're crushing it! All tasks complete."
- Timer start: "⏰ Focus mode: activated"
- First task: Welcome message with confetti

**Enhanced Confetti**:
```tsx
confetti({
  particleCount: 150,  // Increased from 100
  spread: 70,
  colors: ['#FFD700', '#FFA500', '#FF6347', '#FF69B4', '#00CED1']
})
```

**Toast Notifications** (using Sonner):
- "Task completed! +3 points earned 🏆"
- "Great focus session! ⏱️"
- "5 tasks done today - you're on fire! 🔥"

#### Phase 5: Smooth Transitions 🎬

**Animation Standards**:
```tsx
transition-all duration-300 ease-out  // All interactive elements
transition-transform duration-200     // Quick transforms
transition-colors duration-300        // Color changes
```

**Specific Animations**:
- Modals: Scale + fade in
- Sidebar: Stagger item animations
- Lists: FLIP animation (using dnd-kit)
- State changes: Smooth color transitions

---

## Implementation Guide

### Step 1: Update globals.css

Add gradient animations and utilities:

```css
/* Gradient animation */
@keyframes gradient {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}

.animate-gradient {
  background-size: 200% 200%;
  animation: gradient 3s ease infinite;
}

/* Glassmorphism utility */
.glass {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

/* Soft shadow for neumorphism */
.soft-shadow {
  box-shadow:
    8px 8px 16px rgba(0, 0, 0, 0.1),
    -8px -8px 16px rgba(255, 255, 255, 0.5);
}

/* Glow effect */
.glow {
  filter: drop-shadow(0 0 8px var(--primary));
}

/* Respect reduced motion */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

### Step 2: Install Dependencies

```bash
cd notesapp
npm install sonner
```

### Step 3: Component Updates

See [Component Patterns](#component-patterns) section for detailed examples.

### Step 4: Testing

Follow the [Testing & Verification](#testing--verification) checklist.

---

## Component Patterns

### Enhanced Task Card

```tsx
<div
  className={cn(
    "group relative overflow-hidden",
    "rounded-xl border border-border/50",           // Increased radius
    "bg-card backdrop-blur-sm",                     // Glass hint
    "p-3 transition-all duration-300 ease-out",     // Smooth transitions
    "hover:shadow-lg hover:shadow-primary/10",      // Colored shadow
    "hover:-translate-y-0.5 hover:border-primary/30", // Lift effect
    "active:scale-[0.98]",                          // Click feedback
    isSelected && "ring-2 ring-primary/50 shadow-lg shadow-primary/20"
  )}
>
  {/* Card content */}
</div>
```

### Enhanced Timer Button

```tsx
<Button
  className={cn(
    "relative transition-all duration-300",
    task.isTracking && [
      "shadow-lg shadow-primary/50",                  // Glow when active
      "before:absolute before:inset-0",
      "before:rounded-full before:bg-primary/20",
      "before:animate-ping",                          // Pulsing effect
    ],
    "hover:scale-105 active:scale-95"                 // Interactive feedback
  )}
  onClick={toggleTimer}
>
  {task.isTracking ? <Pause /> : <Play />}
</Button>
```

### Enhanced Primary Button (Gradient)

```tsx
<Button
  className={cn(
    "bg-gradient-to-br from-primary to-accent",      // Gradient background
    "hover:opacity-90 hover:scale-105",              // Hover effects
    "active:scale-95",                               // Click feedback
    "transition-all duration-200"
  )}
>
  Create Task
</Button>
```

### Animated Progress Bar

```tsx
<Progress
  value={progress}
  className={cn(
    "h-2 w-full overflow-hidden rounded-full",
    "[&>div]:bg-gradient-to-r [&>div]:from-primary [&>div]:via-accent [&>div]:to-primary",
    "[&>div]:animate-gradient",                       // Animated gradient fill
  )}
/>
```

### Animated Points Badge

```tsx
<div
  className={cn(
    "flex items-center gap-1.5",
    "rounded-full bg-gradient-to-br from-primary/20 to-accent/20",
    "px-3 py-1.5 ring-1 ring-primary/30",
    "transition-all duration-300",
    "hover:scale-105 hover:shadow-lg hover:shadow-primary/20"
  )}
>
  <Trophy className="h-4 w-4 text-primary animate-pulse" />
  <span className="text-sm font-bold tabular-nums bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
    {totalPoints}
  </span>
</div>
```

### Enhanced Checkbox Animation

```tsx
<Checkbox
  checked={task.status === "completed"}
  onCheckedChange={toggleComplete}
  className={cn(
    "h-5 w-5 transition-all duration-200",
    "hover:scale-110",                                // Hover grow
    task.status === "completed" && "animate-bounce"   // Completion bounce
  )}
/>
```

### Badge with Hover Animation

```tsx
<Badge
  className={cn(
    "transition-all duration-200",
    "hover:scale-105 hover:-translate-y-0.5",        // Bounce on hover
    priorityColors[task.priority]
  )}
>
  <Flag className="mr-1 h-3 w-3" />
  {task.priority}
</Badge>
```

### Enhanced Empty State

```tsx
<div className="flex flex-col items-center justify-center py-16 text-center">
  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted animate-pulse">
    <Clock className="h-8 w-8 text-muted-foreground" />
  </div>
  <h3 className="mb-2 text-lg font-semibold text-foreground">
    Ready to tackle the world?
  </h3>
  <p className="mb-6 max-w-sm text-sm text-muted-foreground">
    Add your first task and start tracking your progress! 🚀
  </p>
  <Button
    className="bg-gradient-to-br from-primary to-accent hover:scale-105 transition-all"
    onClick={handleAddTask}
  >
    <Plus className="mr-2 h-4 w-4" />
    Create Your First Task
  </Button>
</div>
```

---

## Gamification & Points System

### Overview

TimeBlock includes a fully implemented points system that rewards users for completing tasks. The system is designed to provide positive reinforcement and create a sense of achievement.

### Points Formula

```typescript
const points = Math.floor((estimatedMinutes || 0) / 15)
```

**Every 15 minutes of estimated time = 1 point**

Examples:
- 30-minute task = 2 points
- 45-minute task = 3 points
- 60-minute task = 4 points
- 90-minute task = 6 points

### Implementation Flow

#### 1. Points Calculation

Points are calculated automatically when a task is created or updated based on the `estimatedMinutes` field.

**Location**: [page.tsx:320-322](notesapp/app/page.tsx#L320-L322)

```typescript
const points = updatedTask.estimatedMinutes
  ? Math.floor(updatedTask.estimatedMinutes / 15)
  : 0;
```

#### 2. Points Award on Task Completion

When a user completes a task, points are added to their total.

**Location**: [page.tsx:339-347](notesapp/app/page.tsx#L339-L347)

```typescript
// Award points when task is completed
if (updatedTask.status === "completed" && originalTask?.status !== "completed" && points > 0) {
  const currentPoints = data?.$users?.find((u: any) => u.id === user.id)?.totalPoints || 0;
  transactions.push(
    db.tx.$users[user.id].update({
      totalPoints: currentPoints + points,
    })
  );
}
```

**Conditions**:
- Task must be newly completed (not already completed)
- Task must have points (calculated from estimated time)
- Transaction updates the user's `totalPoints` in the database

#### 3. Points Deduction on Task Deletion

If a completed task is deleted, points are deducted from the user's total.

**Location**: [page.tsx:420-443](notesapp/app/page.tsx#L420-L443)

```typescript
// Calculate total points to deduct if tasks were completed
let pointsToDeduct = 0;
const checkPoints = (task: Task) => {
  if (task.status === "completed" && task.estimatedMinutes) {
    pointsToDeduct += Math.floor(task.estimatedMinutes / 15);
  }
  task.subtasks.forEach(checkPoints); // Recursive for subtasks
};

// Deduct points if necessary
if (pointsToDeduct > 0) {
  const currentPoints = data?.$users?.find((u: any) => u.id === user.id)?.totalPoints || 0;
  transactions.push(
    db.tx.$users[user.id].update({
      totalPoints: Math.max(0, currentPoints - pointsToDeduct),
    })
  );
}
```

**Features**:
- Recursive calculation for nested subtasks
- Minimum points floor at 0 (prevents negative points)

#### 4. Points Display

Points are displayed in the header with an animated trophy badge.

**Location**: [header.tsx:254-268](notesapp/components/header.tsx#L254-L268)

```tsx
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
```

**Features**:
- Only shows when `totalPoints > 0`
- Gradient background matching peachy theme
- Pulsing trophy icon
- Gradient text for points number
- Hover animation (scale + shadow)
- Uses `tabular-nums` for consistent number width

#### 5. Points Notification

When a task is completed, a toast notification displays the points earned.

**Location**: [task-list-view.tsx:203-213](notesapp/components/task-list-view.tsx#L203-L213)

```typescript
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
```

**Features**:
- Shows points earned with trophy emoji
- Falls back to generic celebration if no points
- 3-second duration for visibility

### Database Schema

#### User Points Storage

```typescript
$users: i.entity({
  email: i.string().unique().indexed().optional(),
  name: i.string().optional(),
  imageURL: i.string().optional(),
  totalPoints: i.number().optional(),  // ← Cumulative total
})
```

#### Task Points Storage

```typescript
tasks: i.entity({
  title: i.string(),
  estimatedMinutes: i.number().optional(),
  points: i.number().optional(),  // ← Individual task points
  status: i.string().optional(),
  // ... other fields
})
```

### Real-time Updates

Points updates are **instant and reactive** thanks to InstantDB:

1. User completes task
2. Transaction updates both task status and user totalPoints
3. InstantDB automatically syncs to all connected clients
4. Header badge updates in real-time (via `db.useQuery()`)
5. No manual refetch needed

### UX Considerations

**Positive Reinforcement**:
- Confetti animation on task completion
- Toast notification with points earned
- Visual points badge in header
- Trophy icon for achievement feel

**Transparency**:
- Points formula is consistent and predictable (15min = 1pt)
- Users see points earned immediately
- Clear visual feedback

**Fairness**:
- Points based on estimated time (user's own estimates)
- Deleting completed tasks removes points (prevents gaming)
- Subtasks contribute to total points independently

### Future Enhancements

Potential points system expansions (not yet implemented):

1. **Streaks**: Bonus points for consecutive days
2. **Milestones**: Achievement badges at 100, 500, 1000 points
3. **Leaderboards**: Compare with friends (opt-in)
4. **Accuracy Bonus**: Extra points when actual time ≈ estimated time
5. **Difficulty Multipliers**: Higher points for high-priority tasks
6. **Weekly Goals**: Set point targets and track progress

---

## Research & Trends

### 2026 UI/UX Trends Analysis

Based on research of modern productivity apps and design trends:

#### Micro-Interactions as Personality
"Micro-interactions are a language of communication between users and digital systems that provide clarity, build trust, and create emotional connections." - Motion matters more than ever in 2026.

**Application in TimeBlock**:
- Every button click provides tactile feedback
- Hover states create anticipation
- Completion animations create satisfaction

#### Liquid Glass / Glassmorphism
"Translucent surfaces, blurred backgrounds, and subtle layering wrapped in a sleek, futuristic aesthetic that adds depth and hierarchy."

**Application in TimeBlock**:
- Subtle backdrop-blur on cards
- Translucent overlays on modals
- Glass effect on sidebar when collapsed

#### Bold Typography
"Typography in UI design is doing the heavy lifting in 2026."

**Application in TimeBlock**:
- Larger page titles (text-3xl/4xl)
- Font weight variations for hierarchy
- Gradient text for emphasis

#### Delightful Experiences
"Humanizing interfaces with clever microcopy, subtle animations, and moments of surprise makes products feel more memorable."

**Application in TimeBlock**:
- Playful empty state copy
- Confetti celebrations
- Toast notifications with personality
- Points and achievements

### Inspiration References

**Apps Studied**:
- **Linear**: Speed-focused minimalism, excellent micro-interactions
- **Notion**: Flexible layouts, great empty states
- **Motion**: AI-driven UI, clean scheduling
- **Things 3**: Subtle animations, tactile feel
- **Todoist**: Gamification (karma system)

**Design Systems**:
- Apple Human Interface Guidelines (Motion and depth)
- Material You (Adaptive color and personality)
- Fluent 2 (Rounded corners and soft shadows)

### Sources

- [UI trends 2026: top 10 trends your users will love](https://www.uxstudioteam.com/ux-blog/ui-trends-2019)
- [Top 10 App Design Trends to Watch in 2026](https://uidesignz.com/blogs/top-10-app-design-trends)
- [12 UI/UX Design Trends That Will Dominate 2026](https://www.index.dev/blog/ui-ux-design-trends)
- [UI/UX Evolution 2026: Micro-Interactions & Motion](https://primotech.com/ui-ux-evolution-2026-why-micro-interactions-and-motion-matter-more-than-ever/)
- [Top UI/UX trends to watch in 2026](https://medium.com/design-bootcamp/top-ui-ux-trends-to-watch-in-2026-379a955ce591)
- [Notion vs Linear: Design Philosophy](https://everhour.com/blog/notion-vs-linear/)
- [Motion vs Notion: Productivity App Comparison](https://everhour.com/blog/motion-vs-notion/)

---

## Testing & Verification

### Visual Testing Checklist

- [ ] Open app at http://localhost:3000
- [ ] Verify gradient buttons render correctly
- [ ] Hover over task cards - check lift, shadow, glow
- [ ] Click buttons - verify scale feedback
- [ ] Complete a task - verify confetti animation
- [ ] Check typography hierarchy (titles, weights)
- [ ] Test mobile view (responsive behavior)
- [ ] Toggle dark mode - verify all styles work

### Interaction Testing Checklist

- [ ] Create new task - check form animations
- [ ] Start/stop timer - verify pulsing glow effect
- [ ] Drag tasks - check rotation and shadow on drag
- [ ] Earn points - verify badge animation
- [ ] Hover badges - check bounce animations
- [ ] Complete multiple tasks - test toast notifications
- [ ] Test subtask expansion/collapse
- [ ] Verify all keyboard navigation works

### Accessibility Testing Checklist

- [ ] Tab through all interactive elements
- [ ] Screen reader announcements still work
- [ ] Test with `prefers-reduced-motion` enabled
- [ ] Verify color contrast (WCAG AA minimum)
- [ ] Test with keyboard only (no mouse)
- [ ] Verify focus indicators visible
- [ ] Check gradient text readability

### Performance Testing Checklist

- [ ] Animations run at 60fps (no jank)
- [ ] Page load time unchanged
- [ ] Test on actual mobile device
- [ ] Check memory usage with DevTools
- [ ] Verify smooth scrolling
- [ ] Test with 50+ tasks in list

### Browser Compatibility

- [ ] Chrome/Edge (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Mobile Safari (iOS)
- [ ] Chrome Mobile (Android)

---

## Implementation Checklist

### Day 1: Core Enhancements ✅ COMPLETE
- [x] Create DESIGN.md documentation
- [x] Update globals.css (gradients, animations)
- [x] Install sonner for toasts
- [x] Update task-list-view.tsx (hover states, animations)
- [x] Update header.tsx (gradient buttons)
- [x] Update typography sizes and weights
- [x] Increase border-radius values

### Day 2: Polish & Testing ✅ COMPLETE
- [x] Add gradient progress bars
- [x] Enhance confetti effects
- [x] Implement toast notifications
- [x] Update empty state copy
- [x] Add points badge animation
- [x] Ensure smooth transitions everywhere
- [x] Implement points system (award, deduct, display)
- [x] Update app-sidebar.tsx (staggered animations)
- [x] Document points system in DESIGN.md
- [ ] Run full testing checklist
- [ ] Test on mobile devices
- [ ] Document any issues

---

## Future Enhancements

### Phase 2 (Later)
- Custom illustrations for empty states
- Glassmorphism on modals and sidebar
- Bento box dashboard layout
- Enhanced dark mode personality
- Neumorphism on buttons

### Phase 3 (Future)
- Sound effects (optional)
- Advanced gamification (streaks, levels)
- AI-driven suggestions
- Custom theming system
- Seasonal themes

---

## Accessibility Considerations

### Motion Preferences

Always respect user preferences:

```tsx
const prefersReducedMotion = window.matchMedia(
  '(prefers-reduced-motion: reduce)'
).matches;

<div className={cn(
  !prefersReducedMotion && "transition-all duration-300"
)}>
```

### Color Contrast

- Maintain WCAG AA standards (4.5:1 for normal text)
- Test gradients for readability
- Ensure sufficient contrast in dark mode
- Use semantic colors consistently

### Focus Indicators

- All interactive elements must have visible focus
- Use `ring` utilities for focus states
- Test keyboard navigation thoroughly

### Screen Reader Support

- Maintain semantic HTML
- Use ARIA labels where needed
- Announce dynamic changes (toasts)
- Test with VoiceOver/NVDA

---

## Success Metrics

### Qualitative Goals
- App feels more **alive and responsive**
- Users smile when completing tasks
- Interactions feel **delightful** not distracting
- Design feels **modern and premium**

### Quantitative Metrics (Future)
- User engagement time
- Task completion rate
- Daily active users
- User feedback scores
- A/B test results

---

**Last Updated**: January 29, 2026
**Contributors**: Design system based on research and 2026 trends
**Maintained by**: TimeBlock Team
