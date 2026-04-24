import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  shelters: defineTable({
    name: v.string(),
    titleRole: v.string(),
    email: v.string(),
    organization: v.string(),
    interests: v.object({
      esaInformation: v.boolean(),
      esaLetterOnline: v.boolean(),
      blogPost: v.boolean(),
      resourcesPage: v.boolean(),
      contactForm: v.boolean(),
      videoTraining: v.boolean(),
    }),
    notes: v.optional(v.string()),
  }),
});
