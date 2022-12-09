import { mutation } from './_generated/server'

export default mutation(async ({ db }, users: any[]) => {
  for (const user of users) {
    const current = await db.query("oncallMembers").filter(q => q.eq(q.field("id"), user.id)).first();
    if (current) {
      db.replace(current._id, user);
    } else {
      await db.insert("oncallMembers", user);
    }
  }
})
