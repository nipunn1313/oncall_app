import { defineSchema, defineTable, s } from 'convex/schema'

export default defineSchema({
  oncallMembers: defineTable({
    id: s.string(),
    name: s.string(),
    email: s.string(),
    color: s.string(),
    avatar_url: s.string(),
    // there are more fields
  }),
  currentOncall: defineTable(s.any()),
})
