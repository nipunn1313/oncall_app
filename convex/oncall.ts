import { mutation, query } from './_generated/server'
import { Document } from "../convex/_generated/dataModel";
import { Auth } from "convex/server";

export const updateOncallMembers = mutation(async ({ db, auth }, users: any[]) => {
  await checkIdentity(auth);
  for (const user of users) {
    const current = await db.query("oncallMembers").filter(q => q.eq(q.field("id"), user.id)).first();
    if (current) {
      db.replace(current._id, user);
    } else {
      await db.insert("oncallMembers", user);
    }
  }
})

export const updateCurrentOncall = mutation(async ({ db, auth }, user: any) => {
  await checkIdentity(auth);
  const prev = await db.query("currentOncall").first();
  if (prev) {
    db.delete(prev._id);
  }

  const current = await db.query("oncallMembers").filter(q => q.eq(q.field("id"), user.id)).unique();
  await db.insert("currentOncall", {memberId: current._id});
})

export const getMembers = query(async ({db, auth}): Promise<Document<"oncallMembers">[]> => {
  await checkIdentity(auth);
  return await db.query("oncallMembers").collect();
})


async function checkIdentity(auth: Auth) {
  const identity = await auth.getUserIdentity();
  if (!identity) {
    throw new Error("Unauthenticated call");
  }
  if (!identity.email) {
    throw new Error("Requires email");
  }
  if (!identity.email.endsWith("@convex.dev")) {
    throw new Error("Must have @convex.dev email");
  }
  if (!identity.emailVerified) {
    throw new Error("Email must be verified");
  }
}
