import Navbar from "@/components/common/Navbar";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <Navbar text="genre" />
      {children}
    </div>
  );
}
