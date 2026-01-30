// Docs: https://www.instantdb.com/docs/modeling-data

import { i } from "@instantdb/react";

const _schema = i.schema({
  entities: {
    $files: i.entity({
      path: i.string().unique().indexed(),
      url: i.string(),
    }),
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
      trackingStartedAt: i.number().optional(), // Unix timestamp
      completedAt: i.number().optional(), // Unix timestamp
      createdAt: i.number(), // Unix timestamp
      tags: i.json().optional(), // Array of strings stored as JSON
      order: i.number().indexed().optional(), // For drag-and-drop ordering
    }),
    timeLogs: i.entity({
      startedAt: i.number(), // Unix timestamp
      endedAt: i.number().optional(), // Unix timestamp
      durationMinutes: i.number().optional(),
      createdAt: i.number(), // Unix timestamp
    }),
  },
  links: {
    $usersLinkedPrimaryUser: {
      forward: {
        on: "$users",
        has: "one",
        label: "linkedPrimaryUser",
        onDelete: "cascade",
      },
      reverse: {
        on: "$users",
        has: "many",
        label: "linkedGuestUsers",
      },
    },
    userTasks: {
      forward: {
        on: "tasks",
        has: "one",
        label: "owner",
      },
      reverse: {
        on: "$users",
        has: "many",
        label: "tasks",
      },
    },
    taskSubtasks: {
      forward: {
        on: "tasks",
        has: "one",
        label: "parentTask",
      },
      reverse: {
        on: "tasks",
        has: "many",
        label: "subtasks",
      },
    },
    taskTimeLogs: {
      forward: {
        on: "timeLogs",
        has: "one",
        label: "task",
      },
      reverse: {
        on: "tasks",
        has: "many",
        label: "timeLogs",
      },
    },
    userTimeLogs: {
      forward: {
        on: "timeLogs",
        has: "one",
        label: "owner",
      },
      reverse: {
        on: "$users",
        has: "many",
        label: "timeLogs",
      },
    },
  },
  rooms: {},
});

// This helps TypeScript display nicer intellisense
type _AppSchema = typeof _schema;
interface AppSchema extends _AppSchema {}
const schema: AppSchema = _schema;

export type { AppSchema };
export default schema;
