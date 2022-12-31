import { FormEvent, useEffect, useState } from 'react'
import { useMutation, useQuery, useAction } from '../convex/_generated/react'
import { useAuth0 } from '@auth0/auth0-react'
import { ErrorBoundary, FallbackProps } from 'react-error-boundary'
import Head from "next/head";
import Image from 'next/image';
import placeholder from '../public/placeholder.png';

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
      <span>Get colors working better</span><br/>
      <span>Flex boxes?</span><br/>
      <span>Slack integration</span><br/>
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
  const current = useQuery('oncall:getCurrentOncall')
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
              <Image
                src={placeholder}
                alt="Placeholder avatar"
                height={80}
                width={80}
              />
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
  if (current) {
    lastSynced = new Date(current._creationTime).toLocaleString();
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
            <Image
              src={member.avatar_url}
              alt={`Avatar for ${member.name}`}
              placeholder="blur"
              blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD//gA7Q1JFQVRPUjogZ2QtanBlZyB2MS4wICh1c2luZyBJSkcgSlBFRyB2NjIpLCBxdWFsaXR5ID0gOTAK/9sAQwADAgIDAgIDAwMDBAMDBAUIBQUEBAUKBwcGCAwKDAwLCgsLDQ4SEA0OEQ4LCxAWEBETFBUVFQwPFxgWFBgSFBUU/9sAQwEDBAQFBAUJBQUJFA0LDRQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQU/8AAEQgAUABQAwEiAAIRAQMRAf/EAB8AAAEFAQEBAQEBAAAAAAAAAAABAgMEBQYHCAkKC//EALUQAAIBAwMCBAMFBQQEAAABfQECAwAEEQUSITFBBhNRYQcicRQygZGhCCNCscEVUtHwJDNicoIJChYXGBkaJSYnKCkqNDU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6g4SFhoeIiYqSk5SVlpeYmZqio6Slpqeoqaqys7S1tre4ubrCw8TFxsfIycrS09TV1tfY2drh4uPk5ebn6Onq8fLz9PX29/j5+v/EAB8BAAMBAQEBAQEBAQEAAAAAAAABAgMEBQYHCAkKC//EALURAAIBAgQEAwQHBQQEAAECdwABAgMRBAUhMQYSQVEHYXETIjKBCBRCkaGxwQkjM1LwFWJy0QoWJDThJfEXGBkaJicoKSo1Njc4OTpDREVGR0hJSlNUVVZXWFlaY2RlZmdoaWpzdHV2d3h5eoKDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uLj5OXm5+jp6vLz9PX29/j5+v/aAAwDAQACEQMRAD8A+uKKKKACiiigAoq9Y6FqOprutLG4uE/vRxEr+fSlvtB1LTU33VhcW6f35IiF/PpQBQooooAKKKKACiiigAr1LwB8O4fssWp6pEJXkAeG3cfKo7Mw7k+n+RwXhbTl1bxFp9q4zHJKN49VHJH5A19CgYGB0oAFUIoVQFUcADoKGUMCCAQeCDS0UAec+Pvh3BJay6lpcQimjBeW3QYVx3Kjsfbv9evlVfTdfPfi7TV0nxLqFrGNsaSkoo7Kw3AfkaAMiiiigAooooA2vBl6mn+KdNnc4QTBST2DfLn9a+ga+ZOlez+AfHMOuWkVldyhNSjG35j/AK4DuPf1H40AdpRRRQAV4D44vU1DxZqUyHKebsBHfaAv9K9N8eeOYdAs5LS1kD6lINoCnPkg/wAR9/QV4qSSSSck0AFFFFABRRU1naS393DbQIXmlYIijuTQBc0Dw/eeI75bWzj3Hq8jcKg9Sa9g8OfDzS9AVJHjF5eDkzTDIB/2V6D+fvWl4X8OQeGdKjtYgGkPzSy45du5+npWvQAUUUUAcv4k+Hml6+ryLGLO8PPnQjAJ/wBpeh/n7149r/h+88OXzWt5HtPVJF5Vx6g19E1keKPDkHibSpLWUBZB80UuOUbsfp60AfPdFTXlpLYXc1tOhSaJijqexFQ0AFeg/CHRhc6nc6jIuVtl2R5/vt1P4D+defV7T8KbUW/hNJAOZ5ncn6Hb/wCy0AdlRRRQAUUUUAFFFFAHkvxe0YW2p22oxrhbldkmP769D+I/lXn1e0/Fa1Fx4TeQjmCZHB+p2/8As1eLUAf/2Q=="
              height={80}
              width={80}
            />
            <span style={{color: member.color}}>{member.name + (
              (current && member._id.equals(current.primaryId)) ? " (Current Primary)" :
              (current && member._id.equals(current.secondaryId)) ? " (Current Secondary)" : ""
            )}</span>
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
