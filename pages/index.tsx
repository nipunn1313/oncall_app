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
    console.log(`Paging ${destName}`);
    const url = await page(destUserId);
    alert(`Paged ${destName} at ${url}`);
  }
  console.log(members);

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
            <span style={{color: member.color}}>{member.name}:</span>
            <span>{member.email}</span>
            <button onClick={() => handlePage(member.id, member.name)}>Page Me!</button>
          </li>
        ))}
      </ul>
      <span>TODOs</span><br/>
      <span>Require login</span><br/>
      <span>Include users not in rotation?</span><br/>
      <span>Include the identity of the person paging in the page details</span><br/>
      <span>Get colors working better</span><br/>
      <span>Flex boxes?</span><br/>
      <span>Slack integration</span><br/>
      <span>Favicon</span><br/>
    </main>
  )
}
