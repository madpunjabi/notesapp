# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# Implementation Status

**📋 See [notesapp/plan.md](notesapp/plan.md) for the full implementation plan, including:**
- ✅ **Phase 0 COMPLETE** - MVP with task management, time tracking, and points system
- 🔜 **Phase 1 NEXT** - Calendar Integration with Google Calendar sync
- 📊 **Phase 2** - Voice input & analytics
- 🚀 **Phase 3** - Polish & scale

**📖 See [PRD.md](PRD.md) for detailed product requirements and specifications.**

# Project Overview

**TimeBlock** is a Next.js 16 task management application using InstantDB as the backend database. The app helps users break down large tasks into manageable time blocks with real-time tracking and a points-based reward system.

**Tech Stack:**
- **Next.js 16.1.6** with App Router
- **React 19.2.3**
- **TypeScript 5** (strict mode)
- **Tailwind CSS 4** with PostCSS plugin
- **InstantDB** for real-time database, auth, and storage
- **shadcn/ui** for component library
- **Lucide React** for icons

# Repository Structure

**IMPORTANT:** This repository has a nested structure:
```
/Users/madhupunjabi/Documents/GitHub/notesapp/  (root)
├── CLAUDE.md          # This file
├── PRD.md             # Product requirements
└── notesapp/          # ⚠️ ACTUAL APP DIRECTORY
    ├── app/           # Next.js App Router pages
    ├── components/    # React components
    ├── lib/           # Utilities and db client
    ├── instant.schema.ts
    ├── instant.perms.ts
    ├── plan.md
    └── package.json
```

**⚠️ All development commands must be run from the `notesapp/` directory!**

# Quick Reference

## Common Tasks

**Adding a new field to tasks:**
1. Update [instant.schema.ts](notesapp/instant.schema.ts)
2. Run: `npx instant-cli push schema --yes` (from notesapp/)
3. Update TypeScript types in components
4. Update UI in [task-detail-panel.tsx](notesapp/components/task-detail-panel.tsx)

**Modifying permissions:**
1. Edit [instant.perms.ts](notesapp/instant.perms.ts)
2. Run: `npx instant-cli push perms --yes` (from notesapp/)

**Testing real-time updates:**
1. Open two browser tabs to http://localhost:3000
2. Make changes in one tab
3. Verify updates appear instantly in other tab

**Checking what phase a feature belongs to:**
- See [plan.md](notesapp/plan.md) for feature roadmap
- ✅ Phase 0 = Available now
- 🔜 Phase 1 = Calendar integration (next)
- 📊 Phase 2 = Voice & analytics
- 🚀 Phase 3 = Polish & scale

# Project Structure (Inside notesapp/)

```
notesapp/
├── app/
│   ├── page.tsx         # Main app UI (tasks, auth, routing)
│   ├── layout.tsx       # Root layout with fonts
│   └── globals.css      # Global styles (peachy theme)
├── components/
│   ├── task-list-view.tsx      # Task list with subtasks
│   ├── task-detail-panel.tsx   # Editing sidebar
│   ├── header.tsx              # Auth & navigation
│   ├── app-sidebar.tsx         # Main sidebar navigation
│   ├── analytics-view.tsx      # Analytics dashboard (Phase 2)
│   ├── calendar-view.tsx       # Calendar UI (Phase 1)
│   └── ui/                     # shadcn/ui components
├── lib/
│   ├── db.ts           # InstantDB client initialization
│   └── utils.ts        # Utility functions
├── instant.schema.ts   # Database schema
├── instant.perms.ts    # Access control rules
├── plan.md             # Implementation roadmap
└── .env.local          # NEXT_PUBLIC_INSTANT_APP_ID, INSTANT_ADMIN_TOKEN
```

# Development Commands

**⚠️ CRITICAL: Run all commands from the `notesapp/` directory:**
```bash
cd /Users/madhupunjabi/Documents/GitHub/notesapp/notesapp
# OR from repository root:
cd notesapp
```

## Running the app
```bash
npm run dev        # Start dev server at http://localhost:3000
npm run build      # Build for production
npm start          # Start production server
npm run lint       # Run ESLint
```

## TypeScript checking
```bash
npx tsc --noEmit   # Type check without emitting files (strict mode enabled)
```

## InstantDB CLI commands
```bash
# All InstantDB commands run from notesapp/ directory
npx instant-cli init-without-files --title notesapp  # Initialize new Instant app
npx instant-cli pull --yes                           # Pull schema/perms from cloud
npx instant-cli push schema --yes                    # Push schema changes
npx instant-cli push perms --yes                     # Push permission changes
```

# Key Configuration

## Path Aliases
- `@/*` maps to the root directory (configured in tsconfig.json)
- Import example: `import { db } from '@/lib/db'`

## Fonts
- Uses Geist Sans and Geist Mono from next/font/google
- Configured in app/layout.tsx with CSS variables

## Tailwind CSS 4
- Uses the new `@tailwindcss/postcss` plugin
- Global styles in [app/globals.css](notesapp/app/globals.css) with peachy color theme
- Supports dark mode via `dark:` prefix (toggle planned for Phase 0 polish)

# Component Architecture

## Main Components

### [app/page.tsx](notesapp/app/page.tsx)
**Main app orchestrator** - handles routing between views and authentication flow
- Manages auth state with `db.useAuth()`
- Uses Magic Code authentication (email-based login)
- Routes between Tasks, Calendar (Phase 1), and Analytics (Phase 2) views
- Contains `LoginPage` component

### [components/task-list-view.tsx](notesapp/components/task-list-view.tsx)
**Task list display** - shows hierarchical task tree with real-time updates
- Queries tasks with InstantDB: `db.useQuery({ tasks: { owner: {}, subtasks: {}, timeLogs: {} } })`
- Displays tasks with subtasks (recursive rendering)
- Play/pause timer buttons
- Task completion checkboxes
- Expandable subtask trees
- Shows estimated vs actual time, priority, progress bars

### [components/task-detail-panel.tsx](notesapp/components/task-detail-panel.tsx)
**Task editing sidebar** - slide-in panel for creating/editing tasks
- Create new tasks with `db.transact(db.tx.tasks[id()].create({...}).link({ owner: userId }))`
- Edit task properties (title, description, estimated time, priority, due date, tags)
- Add/remove subtasks (links via parentTask)
- Manual time adjustment
- Delete tasks with cascade (deletes subtasks and timeLogs)
- Save button commits all changes

### [components/header.tsx](notesapp/components/header.tsx)
**Top navigation bar** - auth, search, and view switching
- Displays user info and sign-out button
- Search bar (functionality planned for Phase 0 polish)
- View toggle buttons (Tasks, Calendar, Analytics)
- Filter buttons (All, In Progress, Completed, Due Soon) - UI only, functionality pending

### [components/app-sidebar.tsx](notesapp/components/app-sidebar.tsx)
**Main navigation sidebar** - collapsible left sidebar
- Navigation links with icons
- User profile display
- Points display (total points earned from completed tasks)

## Data Flow Patterns

### Task Creation
```typescript
import { id } from "@instantdb/react"

// Create task and link to owner
db.transact(
  db.tx.tasks[id()].create({
    title: "New Task",
    priority: "medium",
    status: "not-started",
    createdAt: Date.now(),
    actualMinutes: 0,
    tags: [],
  }).link({ owner: userId })
)
```

### Task Hierarchy (Subtasks)
```typescript
// Create subtask linked to parent
db.transact(
  db.tx.tasks[id()].create({...})
    .link({ owner: userId })
    .link({ parentTask: parentTaskId })
)
```

### Time Tracking
```typescript
// Start timer: update task
db.transact(
  db.tx.tasks[taskId].update({
    isTracking: true,
    trackingStartedAt: Date.now(),
    status: "in-progress"
  })
)

// Stop timer: create timeLog
const duration = Math.floor((Date.now() - startTime) / 60000)
db.transact([
  db.tx.tasks[taskId].update({
    isTracking: false,
    trackingStartedAt: null,
    actualMinutes: task.actualMinutes + duration
  }),
  db.tx.timeLogs[id()].create({
    startedAt: startTime,
    endedAt: Date.now(),
    durationMinutes: duration,
    createdAt: Date.now()
  }).link({ task: taskId, owner: userId })
])
```

### Real-time Updates
- All components use `db.useQuery()` for automatic real-time subscriptions
- InstantDB handles optimistic updates and conflict resolution
- Timer states sync across browser tabs automatically

---

# InstantDB Integration Guide

Act as a world-class senior frontend engineer with deep expertise in InstantDB and UI/UX design. Your primary goal is to generate complete and functional apps with excellent visual aesthetics using InstantDB as the backend.

## About InstantDB

Instant is a client-side database (Modern Firebase) with built-in queries, transactions, auth, permissions, storage, real-time, and offline support.

## Instant SDKs

- `@instantdb/core` --- vanilla JS
- `@instantdb/react` --- React (use this for Next.js)
- `@instantdb/react-native` --- React Native / Expo
- `@instantdb/admin` --- backend scripts / servers

Always check the package manager (this project uses **npm**) before installing.

# Current Database Schema

**⚠️ IMPORTANT:** The app is currently in **Phase 0 (MVP)**. Calendar features with `timeBlocks` entity are planned for **Phase 1**.

## Current Schema (instant.schema.ts)

```typescript
// Phase 0 implementation
entities: {
  $users: i.entity({
    email: i.string().unique().indexed().optional(),
    name: i.string().optional(),
    imageURL: i.string().optional(),
    totalPoints: i.number().optional(),
  }),

  tasks: i.entity({
    title: i.string(),
    description: i.string().optional(),
    estimatedMinutes: i.number().optional(),
    actualMinutes: i.number().optional(),
    priority: i.string().optional(), // 'low' | 'medium' | 'high'
    status: i.string().optional(), // 'not-started' | 'in-progress' | 'completed'
    dueDate: i.number().optional(), // Unix timestamp
    points: i.number().optional(),
    isTracking: i.boolean().optional(),
    trackingStartedAt: i.number().optional(),
    completedAt: i.number().optional(),
    createdAt: i.number(),
    tags: i.json().optional(), // Array of strings
  }),

  timeLogs: i.entity({
    startedAt: i.number(),
    endedAt: i.number().optional(),
    durationMinutes: i.number().optional(),
    createdAt: i.number(),
  }),
},

links: {
  userTasks: { tasks.owner ← $users.tasks },
  taskSubtasks: { tasks.parentTask ← tasks.subtasks },  // Recursive hierarchy
  taskTimeLogs: { timeLogs.task ← tasks.timeLogs },
  userTimeLogs: { timeLogs.owner ← $users.timeLogs },
}
```

## Current Permissions (instant.perms.ts)

```typescript
tasks: {
  allow: {
    view: "isOwner",
    create: "isAuthenticated",
    update: "isOwner",
    delete: "isOwner",
  },
  bind: {
    isAuthenticated: "auth.id != null",
    isOwner: "auth.id in data.ref('owner.id')",
  },
}

timeLogs: {
  allow: { view: "isOwner", create: "isAuthenticated", update: "isOwner", delete: "isOwner" },
  bind: { isAuthenticated: "auth.id != null", isOwner: "auth.id in data.ref('owner.id')" },
}
```

## Managing Instant Apps

### Prerequisites

Look for [instant.schema.ts](notesapp/instant.schema.ts) and [instant.perms.ts](notesapp/instant.perms.ts) in the notesapp directory. These define the schema and permissions.
Look for an app id and admin token in [.env.local](notesapp/.env.local) or another env file.

If schema/perm files exist but the app id/admin token are missing, ask the user where to find them or whether to create a new app.

To create a new app:
```bash
cd notesapp
npx instant-cli init-without-files --title notesapp
```

This outputs an app id and admin token. Store them in `.env.local`:
```
NEXT_PUBLIC_INSTANT_APP_ID=your_app_id
INSTANT_ADMIN_TOKEN=your_admin_token
```

If you get a login error, tell the user to:
- Sign up for free or log in at https://instantdb.com
- Then run `npx instant-cli login`
- Then re-run the init command

If you have an app id/admin token but no schema/perm files:
```bash
cd notesapp
npx instant-cli pull --yes
```

### Schema changes

Edit `instant.schema.ts`, then push:
```bash
cd notesapp
npx instant-cli push schema --yes
```

New fields = additions; missing fields = deletions.

To rename fields:
```bash
npx instant-cli push schema --rename 'posts.author:posts.creator stores.owner:stores.manager' --yes
```

### Permission changes

Edit `instant.perms.ts`, then push:
```bash
cd notesapp
npx instant-cli push perms --yes
```

## CRITICAL Query Guidelines

**CRITICAL**: When using React make sure to follow the rules of hooks. Remember, you can't have hooks show up conditionally.

**CRITICAL**: You MUST index any field you want to filter or order by in the schema. If you do not, you will get an error when you try to filter or order by it.

### Ordering

```
Ordering:        order: { field: 'asc' | 'desc' }
Example:         $: { order: { dueDate: 'asc' } }
Notes:           - Field must be indexed + typed in schema
                 - Cannot order by nested attributes (e.g. 'owner.name')
```

### Where Operator Map

This is the COMPLETE set of filters Instant supports:

```
Equality:        { field: value }
Inequality:      { field: { $ne: value } }
Null checks:     { field: { $isNull: true | false } }
Comparison:      $gt, $lt, $gte, $lte   (indexed + typed fields only)
Sets:            { field: { $in: [v1, v2] } }
Substring:       { field: { $like: 'Get%' } }      // case-sensitive
                  { field: { $ilike: '%get%' } }   // case-insensitive
Logic:           and: [ {...}, {...} ]
                  or:  [ {...}, {...} ]
Nested fields:   'relation.field': value
```

**CRITICAL**: There is no `$exists`, `$nin`, or `$regex`. Use `$like` and `$ilike` for startsWith/endsWith/includes.

**CRITICAL**: Pagination keys (`limit`, `offset`, `first`, `after`, `last`, `before`) only work on top-level namespaces. DO NOT use them on nested relations.

**CRITICAL**: If unsure how something works in InstantDB, fetch the relevant documentation URLs to learn more.

## CRITICAL Permission Guidelines

### data.ref

- Use `data.ref("<path.to.attr>")` for linked attributes
- Always returns a **list**
- Must end with an **attribute**

**Correct:**
```cel
auth.id in data.ref('post.author.id')
data.ref('owner.id') == []
```

**Errors:**
```cel
auth.id in data.post.author.id
auth.id in data.ref('author')
data.ref('admins.id') == auth.id
auth.id == data.ref('owner.id')
data.ref('owner.id') == null
data.ref('owner.id').length > 0
```

### auth.ref

- Same as `data.ref` but path must start with `$user`
- Returns a list

**Correct:**
```cel
'admin' in auth.ref('$user.role.type')
auth.ref('$user.role.type')[0] == 'admin'
```

**Errors:**
```cel
auth.ref('role.type')
auth.ref('$user.role.type') == 'admin'
```

### $users Permissions

- Default `view` permission is `auth.id == data.id`
- Default `create`, `update`, and `delete` permissions are false
- Can override `view` and `update`
- Cannot override `create` or `delete`

### $files Permissions

- Default permissions are all false
- `data.ref` does not work for `$files` permissions
- Use `data.path.startsWith(...)` or `data.path.endsWith(...)` for path-based rules

### Field-level Permissions

Restrict access to specific fields while keeping the entity public:

```json
{
  "$users": {
    "allow": {
      "view": "true"
    },
    "fields": {
      "email": "auth.id == data.id"
    }
  }
}
```

## Best Practices

### Pass `schema` when initializing Instant

Always pass `schema` when initializing Instant to get type safety:

```tsx
import schema from '@/instant.schema'

// On client
import { init } from '@instantdb/react';
const db = init({ appId: process.env.NEXT_PUBLIC_INSTANT_APP_ID!, schema });

// On backend
import { init } from '@instantdb/admin';
const adminDb = init({
  appId: process.env.NEXT_PUBLIC_INSTANT_APP_ID!,
  adminToken: process.env.INSTANT_ADMIN_TOKEN!,
  schema
});
```

### Use `id()` to generate ids

Always use `id()` to generate ids for new entities:

```tsx
import { id } from '@instantdb/react';
db.transact(db.tx.todos[id()].create({ title: 'New Todo' }));
```

### Use Instant utility types for data models

```tsx
import { InstaQLEntity } from '@instantdb/react';
import { AppSchema } from '@/instant.schema';

type Todo = InstaQLEntity<AppSchema, 'todos'>;
type PostWithAuthor = InstaQLEntity<AppSchema, 'posts', { author: { avatar: {} } }>;
```

### Use `db.useAuth` for auth state

**Current Implementation:** Magic Code authentication (email-based, no passwords)

```tsx
import { db } from '@/lib/db';

function App() {
  const { isLoading, user, error } = db.useAuth();
  if (isLoading) return null;
  if (error) return <Error message={error.message} />;
  if (user) return <Main />;
  return <Login />;
}

// Magic Code Login Flow
async function sendCode(email: string) {
  await db.auth.sendMagicCode({ email });
}

async function signIn(email: string, code: string) {
  await db.auth.signInWithMagicCode({ email, code });
}
```

**Note:** Google OAuth integration is planned for Phase 1 alongside calendar features.

## TimeBlock App-Specific Patterns

### Points Calculation
Tasks earn points based on estimated time:
```typescript
const points = Math.floor((estimatedMinutes || 0) / 15); // 15 min = 1 point
```

Points are awarded when tasks are completed. User's `totalPoints` should be incremented accordingly.

### Timer Background Persistence
Timers continue running even when the browser tab is closed:
- Store `isTracking: true` and `trackingStartedAt: timestamp` in the task
- On component mount, check if any tasks have `isTracking: true`
- Calculate elapsed time: `Date.now() - trackingStartedAt`
- Update displayed time in real-time using `setInterval`

### Task Completion
When marking a task complete:
```typescript
db.transact(
  db.tx.tasks[taskId].update({
    status: "completed",
    completedAt: Date.now(),
    isTracking: false,
    trackingStartedAt: null,
  })
)
// Then update user's totalPoints
```

### Subtask Hierarchy
- Use `taskSubtasks` link for parent-child relationships
- Query with nested structure: `{ tasks: { subtasks: { subtasks: {} } } }` for 2 levels
- When deleting parent task, cascade delete subtasks and timeLogs
- Subtasks can have their own time estimates (independent of parent)

### Tags
Tags are stored as JSON array in the `tags` field:
```typescript
tags: ["work", "urgent", "client-project"]
```
Parse and display as chips/badges in the UI.

## Ad-hoc queries & transactions

Use `@instantdb/admin` to run ad-hoc queries and transactions on the backend. Example seed/reset scripts:

```tsx
// scripts/seed.ts
import { id } from "@instantdb/admin";
import { adminDb } from "@/lib/adminDb";

function seed() {
  const userTxs = users.map(u => adminDb.tx.$users[u.id].create({}));
  const taskTxs = tasks.map(t =>
    adminDb.tx.tasks[id()].create({
      title: t.title,
      description: t.description,
      priority: t.priority,
      status: "not-started",
      createdAt: Date.now(),
      actualMinutes: 0,
      tags: []
    }).link({ owner: t.ownerId })
  );
  adminDb.transact([...userTxs, ...taskTxs]);
}
```

## Instant Documentation

Fetch these URLs to learn more about specific features:

- [Common mistakes](https://instantdb.com/docs/common-mistakes.md)
- [Initializing Instant](https://instantdb.com/docs/init.md)
- [Modeling data](https://instantdb.com/docs/modeling-data.md)
- [Writing data](https://instantdb.com/docs/instaml.md)
- [Reading data](https://instantdb.com/docs/instaql.md)
- [Instant on the Backend](https://instantdb.com/docs/backend.md)
- [Patterns](https://instantdb.com/docs/patterns.md)
- [Auth](https://instantdb.com/docs/auth.md)
- [Magic code auth](https://instantdb.com/docs/auth/magic-codes.md)
- [Managing users](https://instantdb.com/docs/users.md)
- [Presence, Cursors, and Activity](https://instantdb.com/docs/presence-and-topics.md)
- [Instant CLI](https://instantdb.com/docs/cli.md)
- [Storage](https://instantdb.com/docs/storage.md)

## Final Note

**Development Guidelines:**
1. **Always check [plan.md](notesapp/plan.md) for current implementation status** before adding features
2. **Phase 0 is complete** - Calendar and Voice features are Phase 1-2, not yet implemented
3. **Run type checks** before committing: `npx tsc --noEmit` (strict mode enabled)
4. **Test real-time updates** across multiple browser tabs
5. **Mobile-first design** - test responsiveness at mobile, tablet, and desktop breakpoints

**Key Reminders:**
- All commands run from `notesapp/` directory
- Authentication is Magic Code (email-based), not OAuth
- Timer persistence uses `isTracking` + `trackingStartedAt` fields
- Points formula: `Math.floor(estimatedMinutes / 15)`
- Tasks use recursive `parentTask` links for subtask hierarchy
- Real-time updates are automatic via `db.useQuery()`

**AESTHETICS ARE CRITICAL** - The app uses a peachy color theme with clean, minimal design inspired by Todoist and Things 3. Maintain visual consistency!
