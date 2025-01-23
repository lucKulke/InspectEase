"use client";
import { useState } from "react";

const UploadFile = () => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const selectedFile = event.target.files[0];

      if (selectedFile.type !== "application/pdf") {
        setMessage("❌ Please upload a PDF file.");
        return;
      }

      setFile(selectedFile);
      setMessage("");
    }
  };


  const handleUpload = async () => {
    if (!file) {
      setMessage("❌ No file selected.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      setUploading(true);
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      if (response.ok) {
        console.log(data);
        setMessage(`✅ Upload successful: ${data.status}`);
      } else {
        setMessage(`❌ Upload failed: ${data.error}`);
      }
    } catch (error) {
      setMessage("❌ Upload error. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto mt-10 p-6 bg-white shadow-md rounded-lg">
      <h2 className="text-xl font-semibold text-gray-700 mb-4">Upload a PDF</h2>

      <label className="block w-full text-center p-4 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500">
        <input
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={handleFileChange}
        />
        <p className="text-gray-600">Click to select a PDF file</p>
      </label>

      {file && <p className="mt-3 text-sm text-gray-700">📄 {file.name}</p>}

      <button
        onClick={handleUpload}
        disabled={uploading}
        className="mt-4 w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg transition disabled:opacity-50"
      >
        {uploading ? "Uploading..." : "Upload"}
      </button>

      {message && (
        <p
          className={`mt-4 text-sm ${
            message.includes("✅") ? "text-green-600" : "text-red-600"
          }`}
        >
          {message}
        </p>
      )}
    </div>
  );
};

export default UploadFile;
