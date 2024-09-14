import { Providers } from "@/components/providers/Provider";
import "./globals.css";
import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { Header } from "@/components/common/header";
import MinimalSocialsFooter from "@/components/common/Footer";
import { Toaster } from "@/components/ui/toaster";
import TanstackQueryProvider from "@/components/providers/TanstackQueryProvider";

export const metadata: Metadata = {
  title: "Watvh TV",
  description: "Watch any TV / Movies / Anime with Watvh ",
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
        <link rel="apple-touch-icon" href="/icon512_maskable.png"></link>
        <meta name="theme-color" content="#e63946" />
        <meta name="referrer" content="origin" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
        />
      </head>
      <body>
        <Providers
          themes={["redDark", "redLight", "light", "dark"]}
          attribute="class"
          defaultTheme="redDark"
          enableSystem
        >
          <TanstackQueryProvider>
            {children}
            <Toaster />
          </TanstackQueryProvider>
        </Providers>
      </body>
    </html>
  );
}
