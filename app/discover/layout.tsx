import Navbar from "@/components/common/Navbar";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Navbar text="genre" />
        {children}
      </body>
    </html>
  );
}
