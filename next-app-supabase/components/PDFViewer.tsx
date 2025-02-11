import React from "react";

export const PDFViewer = () => {
  return (
    <iframe
      src="/annotated.pdf" // Replace with your actual PDF path
      className="w-full h-full"
    />
  );
};
