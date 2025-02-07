"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
//import { uploadPDF } from "../actions/upload-pdf";
import { FileIcon as FilePdf } from "lucide-react";

interface UploadDocumentProps {
  file: File | null;
  setFile: React.Dispatch<React.SetStateAction<File | null>>;
}

export const UploadDocument = ({ file, setFile }: UploadDocumentProps) => {
  const [message, setMessage] = useState<string | null>(null);
  const [summary, setSummary] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
      setMessage(null);
      setSummary(null);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    multiple: false,
  });

  const handleUpload = async () => {
    if (!file) {
      setMessage("Please select a PDF file first");
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append("pdf", file);

    // try {
    //   const result = await uploadPDF(formData);
    //   if (result.success) {
    //     setMessage(result.message);
    //     setSummary(result.summary);
    //   } else {
    //     setMessage(result.message);
    //   }
    // } catch (error) {
    //   setMessage("An error occurred while uploading the file");
    // } finally {
    //   setIsUploading(false);
    // }
  };

  return (
    <div className="max-w-md mx-auto mt-10">
      <div
        {...getRootProps()}
        className={`p-10 border-2 border-dashed rounded-lg text-center cursor-pointer transition-colors ${
          isDragActive ? "border-blue-400 bg-blue-50" : "border-gray-300"
        }`}
      >
        <input {...getInputProps()} />
        <FilePdf
          className={`mx-auto h-12 w-12 ${
            file ? "text-green-400" : "text-gray-400"
          } `}
        />
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
