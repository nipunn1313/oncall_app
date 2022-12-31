import { defineSchema, defineTable, s } from 'convex/schema'

export default defineSchema({
  oncallMembers: defineTable({
    id: s.string(),
    name: s.string(),
    email: s.string(),
    color: s.string(),
    avatar_url: s.string(),
    in_rotation: s.boolean(),
    // there are more fields
  }),
  currentOncall: defineTable({
    primaryId: s.id("oncallMembers"),
    secondaryId: s.id("oncallMembers"),
  }),
})
