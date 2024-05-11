import { Providers } from "@/components/providers/Provider";
import "./globals.css";
import type { Metadata } from "next";
import { Separator } from "@/components/ui/separator";

export const metadata: Metadata = {
  title: "TV / Movies",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icon-512x512.png"></link>
        <meta name="theme-color" content="#e63946" />
        <title>Spicy TV</title>
      </head>
      <body>
        <Providers
          themes={["redDark", "redLight", "light", "dark"]}
          attribute="class"
          defaultTheme="dark"
          enableSystem
        >
          <div>{children}</div>
        </Providers>
      </body>
    </html>
  );
}
