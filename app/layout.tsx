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
          <Separator className="my-10" />
          <div className=" mx-auto pb-10 flex gap-4 flex-col  w-[96%]">
            <p className="">
              This site does not store any files on our server, we only linked
              to the media which is hosted on 3rd party services.
            </p>
            <p>Copyright ©SpicyTV 2024</p>
          </div>
        </Providers>
      </body>
    </html>
  );
}
