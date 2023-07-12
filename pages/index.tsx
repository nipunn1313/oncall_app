import { useMutation, useQuery, useAction } from 'convex/react'
import { api } from '../convex/_generated/api'
import { useAuth0 } from '@auth0/auth0-react'
import { Authenticated, Unauthenticated, AuthLoading } from 'convex/react'
import { ErrorBoundary, FallbackProps } from 'react-error-boundary'
import { Doc } from '../convex/_generated/dataModel'
import Head from 'next/head'
import Image from 'next/image'
import placeholder from '../public/placeholder.png'

const blurPlaceholder =
  'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD//gA7Q1JFQVRPUjogZ2QtanBlZyB2MS4wICh1c2luZyBJSkcgSlBFRyB2NjIpLCBxdWFsaXR5ID0gOTAK/9sAQwADAgIDAgIDAwMDBAMDBAUIBQUEBAUKBwcGCAwKDAwLCgsLDQ4SEA0OEQ4LCxAWEBETFBUVFQwPFxgWFBgSFBUU/9sAQwEDBAQFBAUJBQUJFA0LDRQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQU/8AAEQgAUABQAwEiAAIRAQMRAf/EAB8AAAEFAQEBAQEBAAAAAAAAAAABAgMEBQYHCAkKC//EALUQAAIBAwMCBAMFBQQEAAABfQECAwAEEQUSITFBBhNRYQcicRQygZGhCCNCscEVUtHwJDNicoIJChYXGBkaJSYnKCkqNDU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6g4SFhoeIiYqSk5SVlpeYmZqio6Slpqeoqaqys7S1tre4ubrCw8TFxsfIycrS09TV1tfY2drh4uPk5ebn6Onq8fLz9PX29/j5+v/EAB8BAAMBAQEBAQEBAQEAAAAAAAABAgMEBQYHCAkKC//EALURAAIBAgQEAwQHBQQEAAECdwABAgMRBAUhMQYSQVEHYXETIjKBCBRCkaGxwQkjM1LwFWJy0QoWJDThJfEXGBkaJicoKSo1Njc4OTpDREVGR0hJSlNUVVZXWFlaY2RlZmdoaWpzdHV2d3h5eoKDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uLj5OXm5+jp6vLz9PX29/j5+v/aAAwDAQACEQMRAD8A+uKKKKACiiigAoq9Y6FqOprutLG4uE/vRxEr+fSlvtB1LTU33VhcW6f35IiF/PpQBQooooAKKKKACiiigAr1LwB8O4fssWp6pEJXkAeG3cfKo7Mw7k+n+RwXhbTl1bxFp9q4zHJKN49VHJH5A19CgYGB0oAFUIoVQFUcADoKGUMCCAQeCDS0UAec+Pvh3BJay6lpcQimjBeW3QYVx3Kjsfbv9evlVfTdfPfi7TV0nxLqFrGNsaSkoo7Kw3AfkaAMiiiigAooooA2vBl6mn+KdNnc4QTBST2DfLn9a+ga+ZOlez+AfHMOuWkVldyhNSjG35j/AK4DuPf1H40AdpRRRQAV4D44vU1DxZqUyHKebsBHfaAv9K9N8eeOYdAs5LS1kD6lINoCnPkg/wAR9/QV4qSSSSck0AFFFFABRRU1naS393DbQIXmlYIijuTQBc0Dw/eeI75bWzj3Hq8jcKg9Sa9g8OfDzS9AVJHjF5eDkzTDIB/2V6D+fvWl4X8OQeGdKjtYgGkPzSy45du5+npWvQAUUUUAcv4k+Hml6+ryLGLO8PPnQjAJ/wBpeh/n7149r/h+88OXzWt5HtPVJF5Vx6g19E1keKPDkHibSpLWUBZB80UuOUbsfp60AfPdFTXlpLYXc1tOhSaJijqexFQ0AFeg/CHRhc6nc6jIuVtl2R5/vt1P4D+defV7T8KbUW/hNJAOZ5ncn6Hb/wCy0AdlRRRQAUUUUAFFFFAHkvxe0YW2p22oxrhbldkmP769D+I/lXn1e0/Fa1Fx4TeQjmCZHB+p2/8As1eLUAf/2Q=='

export default function App() {
  return (
    <main>
      <Head>
        <link rel="icon" href="/convex-logo-only.svg" />
      </Head>
      <h1>Convex Oncall</h1>
      <Authenticated>
        <ErrorBoundary FallbackComponent={ErrorFallback}>
          <Members />
        </ErrorBoundary>
        <LogoutButton />
      </Authenticated>
      <Unauthenticated>
        <LoginButton />
      </Unauthenticated>
      <AuthLoading>Still loading auth</AuthLoading>
      <br />
      <span>Source: https://github.com/nipunn1313/oncall_app</span>
      <br />
      <span>TODOs</span>
      <br />
      <span>Slack integration</span>
      <br />
    </main>
  )
}

function ErrorFallback({ error }: FallbackProps) {
  return (
    <>
      <p>Something went wrong:</p>
      <pre>{error.message}</pre>
    </>
  )
}

function Members() {
  const members = useQuery(api.oncall.getMembers)
  const current = useQuery(api.oncall.getCurrentOncall)

  if (members === undefined) {
    return (
      <>
        <p className="badge">
          <UserName />
          <br />
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
    return <span>No members found.</span>
  }

  let lastSynced = 'unknown'
  if (current) {
    lastSynced = new Date(current._creationTime).toLocaleString()
  }
  //const style = `color:{member.color}`

  return (
    <>
      <p className="badge">
        <UserName />
        <br />
        <span>Last synced: {lastSynced}</span>
      </p>
      <ul>
        {members.map((member) => (
          <Member
            key={member._id.toString()}
            member={member}
            current={current}
          />
        ))}
      </ul>
    </>
  )
}

type MemberProps = {
  member: Doc<'oncallMembers'>
  current: Doc<'currentOncall'> | null | undefined
}

function Member({ member, current }: MemberProps) {
  const membersMutation = useMutation(api.oncall.getMembersMutation)
  const page = useAction(api.page.default)
  const { user } = useAuth0()

  async function handlePage() {
    const result = await membersMutation()
    console.log(result)
    console.log(`Paging ${member.name}`)
    const url = await page({ destUserId: member.id, from: user!.email! })
    alert(`Paged ${member.name} at ${url}`)
  }

  let color = member.color.replace(/-/g, '')
  switch (color) {
    case 'cayenne':
      color = '#ac0000'
      break
  }

  return (
    <li>
      <div className="leftAlignedPageTag">
        <Image
          src={member.avatar_url}
          alt={`Avatar for ${member.name}`}
          placeholder="blur"
          blurDataURL={blurPlaceholder}
          height={80}
          width={80}
        />
        <div
          style={{
            backgroundColor: color,
            color: 'white',
            padding: '8px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flex: '1 1 auto',
          }}
        >
          {member.name}
          <br />
          {current && member._id === current.primaryId
            ? '(Current Primary)'
            : current && member._id === current.secondaryId
            ? ' (Current Secondary)'
            : ''}
        </div>
      </div>
      <div className="rightAlignedPageTag">
        <span>{member.email}</span>
        <button className="pageMeButton" onClick={handlePage}>
          Page Me!
        </button>
      </div>
    </li>
  )
}

function LoginButton() {
  const { loginWithRedirect } = useAuth0()
  return <button onClick={() => loginWithRedirect()}>Log in</button>
}

function LogoutButton() {
  const { logout } = useAuth0()
  return (
    <button
      onClick={() =>
        logout({ logoutParams: { returnTo: window.location.origin } })
      }
    >
      Log out
    </button>
  )
}

function UserName() {
  const x = useAuth0()
  const { user } = useAuth0()
  console.log('Loading UserName')
  console.log(x)
  return <>Logged in{user!.email ? ` as ${user!.email}` : ''}</>
}
