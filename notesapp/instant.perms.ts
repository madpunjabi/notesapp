// Docs: https://www.instantdb.com/docs/permissions

import type { InstantRules } from "@instantdb/react";

const rules = {
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
  },
  timeLogs: {
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
  },
} satisfies InstantRules;

export default rules;
