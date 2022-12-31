import { mutation, query } from './_generated/server'
import { Document } from "../convex/_generated/dataModel";
import { Auth } from "convex/server";

export const updateOncallMembers = mutation(async ({ db, auth }, users: any[]) => {
  await checkIdentity(auth);
  for (const user of users) {
    const current = await db.query("oncallMembers").filter(q => q.eq(q.field("id"), user.id)).unique();
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
  if (current) {
    await db.insert("currentOncall", {memberId: current._id});
  }
})

export const getMembers = query(async ({db, auth}): Promise<Document<"oncallMembers">[]> => {
  await checkIdentity(auth);
  const members = await db.query("oncallMembers").collect();
  return members.sort((a, b) => +b.in_rotation - +a.in_rotation);
})


async function checkIdentity(auth: Auth) {
  const identity = await auth.getUserIdentity();
  if (!identity) {
    throw new Error("Unauthenticated call");
  }
  if (identity.tokenIdentifier == "https://dev-6nkf1fvj.us.auth0.com/|ggwCKUkxxiQtdLMP9Q6Z2DQXSavPd9xc@clients") {
    // It's the PD sync app. We're ok to go
    return;
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
