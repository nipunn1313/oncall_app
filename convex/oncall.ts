import { mutation, query } from './_generated/server'
import { Document } from "../convex/_generated/dataModel";

export const updateOncallMembers = mutation(async ({ db }, users: any[]) => {
  for (const user of users) {
    const current = await db.query("oncallMembers").filter(q => q.eq(q.field("id"), user.id)).first();
    if (current) {
      db.replace(current._id, user);
    } else {
      await db.insert("oncallMembers", user);
    }
  }
})

export const updateCurrentOncall = mutation(async ({ db }, user: any) => {
  const prev = await db.query("currentOncall").first();
  if (prev) {
    db.delete(prev._id);
  }

  const current = await db.query("oncallMembers").filter(q => q.eq(q.field("id"), user.id)).unique();
  await db.insert("currentOncall", {memberId: current._id});
})

export const getMembers = query(async ({db}): Promise<Document<"oncallMembers">[]> => {
  return await db.query("oncallMembers").collect();
})
