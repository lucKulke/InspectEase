"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
//import { uploadPDF } from "../actions/upload-pdf";
import { FileIcon as FilePdf, X } from "lucide-react";

interface UploadDocumentProps {
  file: File | null;
  setFile: React.Dispatch<React.SetStateAction<File | null>>;
}

export const UploadDocument = ({ file, setFile }: UploadDocumentProps) => {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    multiple: false,
  });

  return (
    <div className="max-w-md mx-auto mt-10">
      <div
        {...getRootProps()}
        className={`p-10 border-2 border-dashed rounded-lg text-center cursor-pointer transition-colors ${
          isDragActive ? "border-blue-400 bg-blue-50" : "border-gray-300"
        }`}
      >
        <div className="relative inline-block">
          <input {...getInputProps()} />
          <FilePdf
            className={`mx-auto h-12 w-12 ${
              file ? "text-green-400" : "text-gray-400"
            } `}
          />
          {file && (
            <button
              className="absolute -top-4 -right-4 rounded-full border-2 bg-slate-100 hover:bg-slate-300 active:bg-slate-600"
              onClick={() => setFile(null)}
            >
              <X></X>
            </button>
          )}
        </div>
        {file ? (
          <p className="mt-2 text-sm text-gray-600">
            Selected file: {file.name}
          </p>
        ) : (
          <p className="mt-2 text-sm text-gray-600">
            Drag & drop a PDF here, or click to select one
          </p>
        )}
      </div>
    </div>
  );
};
