import React from "react";

interface PageHeadingProps {
  children: React.ReactNode; // Allows any valid React child (string, JSX, etc.)
}

export const PageHeading = ({ children }: PageHeadingProps) => {
  return <div className="text-lg m-7 text-slate-500">{children}</div>;
};
