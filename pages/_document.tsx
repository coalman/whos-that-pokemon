/**
 * @module
 *
 * Atm, this only adds some class names to the body of each page.
 */

import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html>
      <Head />
      <body className="bg-slate-900 text-slate-50">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
