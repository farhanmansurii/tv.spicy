import { Providers } from "@/components/providers/Provider";
import "./globals.css";
import type { Metadata } from "next";
import { Separator } from "@/components/ui/separator";
import QueryProvider from "@/components/container/TanStackQueryProvider";
import { GeistSans } from "geist/font/sans";
import { Header } from "@/components/common/header";
import MinimalSocialsFooter from "@/components/common/Footer";
import BackgroundGrid from "@/components/animated-common/GridBackground";
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: "TV / Movies",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html className={GeistSans.className} lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icon-512x512.png"></link>
        <meta name="theme-color" content="#e63946" />
        <meta name="referrer" content="origin" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0"
        />
        <title>watvh app</title>
      </head>
      <body>
        <Providers
          themes={["redDark", "redLight", "light", "dark"]}
          attribute="class"
          defaultTheme="redDark"
          enableSystem
        >
          {" "}
          <QueryProvider>
            <Header />
            {children}
            <Toaster />
          </QueryProvider>
        </Providers>
      </body>
    </html>
  );
}
