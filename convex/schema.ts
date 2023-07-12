import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'

export default defineSchema(
  {
    oncallMembers: defineTable({
      id: v.string(),
      name: v.string(),
      email: v.string(),
      color: v.string(),
      avatar_url: v.string(),
      in_rotation: v.boolean(),
      // there are more fields
    }),
    currentOncall: defineTable({
      primaryId: v.id('oncallMembers'),
      secondaryId: v.id('oncallMembers'),
    }),
  },
  { schemaValidation: false }
)
