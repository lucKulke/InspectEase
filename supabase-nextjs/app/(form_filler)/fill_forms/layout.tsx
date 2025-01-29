import FillFormsNavbar from "@/components/FillFormsNavbar";

export default function FillFormsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="border-2 rounded-2xl p-5 min-h-screen">
      <FillFormsNavbar></FillFormsNavbar>
      {children}
    </div>
  );
}
