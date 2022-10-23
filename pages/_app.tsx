/**
 * @module
 *
 * This adds styles/globals.css to each page.
 *
 * Nothing else is added in this module atm.
 */

import "../styles/globals.css";
import type { AppProps } from "next/app";

export default function MyApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}
