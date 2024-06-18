import { GeistSans } from "geist/font/sans";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div>{children}</div>;
}
