import { mutation, query } from './_generated/server'
import { Document, Id } from '../convex/_generated/dataModel'
import { Auth } from 'convex/server'

export const updateOncallMembers = mutation(
  async ({ db }, syncKey: string, users: any[]) => {
    if (!syncKey || syncKey != process.env['SYNC_KEY']) {
      throw new Error('Bad Sync Key')
    }

    for (const user of users) {
      const current = await db
        .query('oncallMembers')
        .filter((q) => q.eq(q.field('id'), user.id))
        .unique()
      if (current) {
        db.replace(current._id, user)
      } else {
        await db.insert('oncallMembers', user)
      }
    }
  }
)

export const updateCurrentOncall = mutation(
  async ({ db }, syncKey: string, primary: any, secondary: any) => {
    if (!syncKey || syncKey != process.env['SYNC_KEY']) {
      throw new Error('Bad Sync Key')
    }

    const prev = await db.query('currentOncall').unique()
    if (prev) {
      db.delete(prev._id)
    }

    const currPrimary = await db
      .query('oncallMembers')
      .filter((q) => q.eq(q.field('id'), primary.id))
      .unique()
    const currSecondary = await db
      .query('oncallMembers')
      .filter((q) => q.eq(q.field('id'), secondary.id))
      .unique()
    if (currPrimary && currSecondary) {
      await db.insert('currentOncall', {
        primaryId: currPrimary._id,
        secondaryId: currSecondary._id,
      })
    }
  }
)

export const getMembers = query(
  async ({ db, auth }): Promise<Document<'oncallMembers'>[]> => {
    await checkIdentity(auth)
    const members = await db.query('oncallMembers').collect()
    const current = await db.query('currentOncall').unique()
    const key = (m: Document<'oncallMembers'>) => {
      return (
        +m.in_rotation +
        2 * +m._id.equals(current!.primaryId) +
        +m._id.equals(current!.secondaryId)
      )
    }
    return members.sort((a, b) => key(b) - key(a))
  }
)

export const getCurrentOncall = query(
  async ({ db, auth }): Promise<Document<'currentOncall'> | null> => {
    return db.query('currentOncall').unique()
  }
)

async function checkIdentity(auth: Auth) {
  const identity = await auth.getUserIdentity()
  if (!identity) {
    throw new Error('Unauthenticated call')
  }
  if (
    identity.tokenIdentifier ==
    'https://dev-6nkf1fvj.us.auth0.com/|ggwCKUkxxiQtdLMP9Q6Z2DQXSavPd9xc@clients'
  ) {
    // It's the PD sync app. We're ok to go
    return
  }
  if (!identity.email) {
    throw new Error('Requires email')
  }
  if (!identity.email.endsWith('@convex.dev')) {
    throw new Error('Must have @convex.dev email')
  }
  if (!identity.emailVerified) {
    throw new Error('Email must be verified')
  }
}
