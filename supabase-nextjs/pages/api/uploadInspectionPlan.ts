import { NextApiRequest, NextApiResponse } from "next";
// import formidable from "formidable";
import { IncomingForm } from "formidable";

import fs from "fs";

import { UUID, randomUUID } from "crypto";
import { extractAnnotations } from "@/lib/pdfTools";

export const config = {
  api: {
    bodyParser: false, // Disables Next.js bodyParser to handle file upload manually
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res
      .status(405)
      .json({ status: "fail", error: "Method Not Allowed" });
  }

  const form = new IncomingForm();

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error("Error parsing form:", err);
      return res
        .status(500)
        .json({ status: "fail", error: "File parsing error" });
    }

    const file = Array.isArray(files.file) ? files.file[0] : files.file;
    if (!file) {
      return res
        .status(400)
        .json({ status: "fail", error: "No file uploaded" });
    }

    const fileName = `${randomUUID()}-${file.originalFilename}`;
    const fileBuffer = fs.readFileSync(file.filepath);

    const uint8Array = new Uint8Array(fileBuffer);

    const annotations = await extractAnnotations(uint8Array);

    // Upload to Supabase Storage

    return res.status(200).json({
      status: "success",
      annotations: annotations,
      filename: fileName,
    });
  });
}
