// InstantDB client initialization
import { init } from "@instantdb/react";
import schema from "@/instant.schema";

// Initialize InstantDB with schema for type safety
export const db = init({
  appId: process.env.NEXT_PUBLIC_INSTANT_APP_ID!,
  schema,
});

// Export types for use in components
export type { AppSchema } from "@/instant.schema";
