import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("shelters").order("desc").collect();
  },
});

export const add = mutation({
  args: {
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
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("shelters", args);
  },
});

export const remove = mutation({
  args: { id: v.id("shelters") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
