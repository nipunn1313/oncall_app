import { defineSchema, defineTable, s } from 'convex/schema'

export default defineSchema({
  messages: defineTable({
    author: s.string(),
    body: s.string(),
  }),
  oncallMembers: defineTable(s.any()),
  currentOncall: defineTable(s.any()),
})
