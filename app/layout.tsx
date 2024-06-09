import { Providers } from "@/components/providers/Provider";
import "./globals.css";
import type { Metadata } from "next";
import { Separator } from "@/components/ui/separator";
import QueryProvider from "@/components/container/TanStackQueryProvider";
import { GeistSans } from "geist/font/sans";
import { Header } from "@/components/common/header";

export const metadata: Metadata = {
  title: "TV / Movies",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html className={GeistSans.className} lang="en" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icon-512x512.png"></link>
        <meta name="theme-color" content="#e63946" />
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
          </QueryProvider>
        </Providers>
      </body>
    </html>
  );
}
