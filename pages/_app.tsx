import '../styles/globals.css'
import type { AppProps } from 'next/app'

import { ConvexProviderWithAuth0 } from 'convex/react-auth0'
import { ConvexReactClient } from 'convex/react'

import convexConfig from "../convex.json";
const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!)
const authInfo = convexConfig.authInfo[0];

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ConvexProviderWithAuth0 client={convex} authInfo={authInfo}>
      <Component {...pageProps} />
    </ConvexProviderWithAuth0>
  )
}

export default MyApp
