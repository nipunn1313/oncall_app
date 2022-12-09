import { defineSchema, defineTable, s } from 'convex/schema'

export default defineSchema({
  messages: defineTable({
    author: s.string(),
    body: s.string(),
  }),
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
