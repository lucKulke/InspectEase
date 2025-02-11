import React from "react";

interface PDFViewerProps {
  pdfUrl: string;
}

export const PDFViewer = ({ pdfUrl }: PDFViewerProps) => {
  return (
    <iframe
      src={pdfUrl} // Replace with your actual PDF path
      className="w-full h-full"
    />
  );
};
