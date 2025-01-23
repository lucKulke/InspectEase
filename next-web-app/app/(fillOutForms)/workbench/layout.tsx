export default function WorkbenchLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <h1>Workbench Navbar</h1>
      <div>{children}</div>
    </>
  );
}
