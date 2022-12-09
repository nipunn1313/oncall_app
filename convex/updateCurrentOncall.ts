import { mutation } from './_generated/server'

export default mutation(async ({ db }, user: any) => {
  const prev = await db.query("currentOncall").first();
  if (prev) {
    db.delete(prev._id);
  }

  const current = await db.query("oncallMembers").filter(q => q.eq(q.field("id"), user.id)).unique();
  await db.insert("currentOncall", {memberId: current._id});
})
