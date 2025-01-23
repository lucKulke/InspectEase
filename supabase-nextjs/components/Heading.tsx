import React from "react";

interface HeadingProps {
  children: React.ReactNode; // Allows any valid React child (string, JSX, etc.)
}

const Heading = ({ children }: HeadingProps) => {
  return <div className="text-lg m-7 text-slate-500">{children}</div>;
};

export default Heading;
