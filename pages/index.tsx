import { FormEvent, useEffect, useState } from 'react'
import { useMutation, useQuery, useAction } from '../convex/_generated/react'
import { useAuth0 } from '@auth0/auth0-react'
import { ErrorBoundary, FallbackProps } from 'react-error-boundary'
import Head from "next/head";

export default function App() {
  return (
    <main>
      <Head>
        <link rel="icon" href="/convex-logo-only.svg" />
      </Head>
      <h1>Convex Oncall</h1>
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <Members/>
      </ErrorBoundary>
      <LogoutButton/><br/>
      <span>Source: https://github.com/nipunn1313/oncall_app</span><br/>
      <span>TODOs</span><br/>
      <span>Include users not in rotation?</span><br/>
      <span>Get colors working better</span><br/>
      <span>Flex boxes?</span><br/>
      <span>Slack integration</span><br/>
      <span>Highlight current oncall?</span><br/>
    </main>
  )
}

function ErrorFallback({error}: FallbackProps) {
  return (
    <>
      <p>Something went wrong:</p>
      <pre>{error.message}</pre>
    </>
  )
}

function Members() {
  const members = useQuery('oncall:getMembers')
  const page = useAction('actions/page')
  const { user } = useAuth0();

  if (members === undefined) {
    return (
      <>
        <p className="badge">
          <UserName/><br/>
          <span>Loading...</span>
        </p>
        <ul>
          {Array.from(Array(8).keys()).map((i) => (
            <li key={i}>
              <img src="https://secure.gravatar.com/avatar/b751bc1b59c51e44f7273af171452236.png?d=mm&r=PG" />
            </li>
          ))}
        </ul>
      </>
    )
  }
  if (members.length === 0) {
    return (
        <span>No members found.</span>
    )
  }

  let lastSynced = "unknown";
  if (members[0]) {
    lastSynced = new Date(members[0]._creationTime).toLocaleString();
  }
  const style = `color:{member.color}`;

  async function handlePage(destUserId: string, destName: string) {
    console.log(`Paging ${destName}`);
    const url = await page(destUserId, user!.email!);
    alert(`Paged ${destName} at ${url}`);
  }

  return (
    <>
      <p className="badge">
        <UserName/><br/>
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
    </>
  )
}

function LogoutButton() {
  const { logout } = useAuth0();
  return (
    <button
      className="btn btn-primary"
      onClick={() => logout({ returnTo: window.location.origin })}
    >
      Log out
    </button>
  );
}

function UserName() {
  const { user } = useAuth0();
  return <>Logged in{user!.email ? ` as ${user!.email}` : ""}</>;
}
