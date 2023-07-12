import '../styles/globals.css'
import type { AppProps } from 'next/app'

import { ConvexProviderWithAuth0 } from 'convex/react-auth0'
import { ConvexReactClient } from 'convex/react'
import { Auth0Provider } from '@auth0/auth0-react'

import authConfig from '../convex/auth.config.js'
const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!)
const authInfo = authConfig.providers[0]

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <Auth0Provider
      domain={authInfo.domain}
      clientId={authInfo.applicationID}
      authorizationParams={{
        redirect_uri:
          typeof window === 'undefined' ? undefined : window.location.origin,
      }}
      useRefreshTokens={true}
      cacheLocation="localstorage"
    >
      <ConvexProviderWithAuth0 client={convex}>
        <Component {...pageProps} />
      </ConvexProviderWithAuth0>
    </Auth0Provider>
  )
}

export default MyApp
