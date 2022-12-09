import { FormEvent, useEffect, useState } from 'react'
import { useMutation, useQuery, useAction } from '../convex/_generated/react'

export default function App() {
  const members = useQuery('oncall:getMembers') || []
  const page = useAction('actions/page')

  let lastSynced = "unknown";
  if (members[0]) {
    lastSynced = new Date(members[0]._creationTime).toLocaleString();
  }
  const style = `color:{member.color}`;

  async function handlePage(destUserId: string, destName: string) {
    await page(destUserId);
    console.log(`Paging ${destName}`);
  }

  return (
    <main>
      <h1>Convex Oncall</h1>
      <p className="badge">
        <span>Last synced: {lastSynced}</span>
      </p>
      <ul>
        {members.map((member) => (
          <li key={member._id.toString()}>
            <img src={member.avatar_url} />
            <span>{member.name}:</span>
            <span>{member.email}</span>
            <span>color: {member.color}?</span>
            <button onClick={() => handlePage(member.id, member.name)}>Page Me!</button>
          </li>
        ))}
      </ul>
    </main>
  )
}
