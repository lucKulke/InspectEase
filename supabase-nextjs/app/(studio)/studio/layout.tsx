import StudioNavbar from "@/components/StudioNavbar";

export default function StudioLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="border-2 rounded-2xl p-5 min-h-screen">
      <StudioNavbar></StudioNavbar>
      {children}
    </div>
  );
}
