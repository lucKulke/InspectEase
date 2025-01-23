import StudioNavbar from "@/app/customComponents/StudioNavbar";

export default function StudioLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="border-2 rounded-2xl p-4 min-h-screen ">
      <StudioNavbar />
      <div>{children}</div>
    </div>
  );
}
