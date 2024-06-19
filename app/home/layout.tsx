import { GeistSans } from "geist/font/sans";
import Head from "next/head";

export default function RootLayout({ children }: { children: any }) {
  return (
    <>
      <Head>
        <meta name="theme-color" content="#e63946" />
        <meta name="referrer" content="origin" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0"
        />
      </Head>
      <div>{children}</div>
    </>
  );
}
