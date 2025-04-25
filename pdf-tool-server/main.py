from fastapi import FastAPI, File, UploadFile, Form
from fastapi.responses import JSONResponse, FileResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, RootModel
import shutil
import uuid
import os
from lib.annotations import Reader, Writer, FormData
from pypdf import PdfReader, PdfWriter
from typing import Dict, List# Replace 'your_module' with actual module name

from fastapi.responses import StreamingResponse
from io import BytesIO


app = FastAPI()

# Optional CORS (useful for frontend dev)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = "uploads"
ANNOTATED_DIR = "annotated_pdfs"
os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(ANNOTATED_DIR, exist_ok=True)


class AnnotationDetail(BaseModel):
    location: List[float]
    page: int

AnnotationsResponse = RootModel[Dict[str, AnnotationDetail]]

@app.post("/extract-annotations/", response_model=AnnotationsResponse)
async def extract_annotations(pdf: UploadFile = File(...)):
    temp_pdf_path = f"{UPLOAD_DIR}/{uuid.uuid4()}.pdf"

    with open(temp_pdf_path, "wb") as buffer:
        shutil.copyfileobj(pdf.file, buffer)

    reader = Reader(temp_pdf_path)
    annotations = reader.all_annotations()

    os.remove(temp_pdf_path)
    return annotations



@app.post("/remove-annotations/")
async def remove_annotations(pdf: UploadFile = File(...)):
    # Read PDF from upload
    input_pdf_bytes = await pdf.read()
    reader = PdfReader(BytesIO(input_pdf_bytes))
    writer = PdfWriter()

    # Remove annotations
    for page in reader.pages:
        if "/Annots" in page:
            del page["/Annots"]
        writer.add_page(page)

    # Write output PDF to memory
    output_stream = BytesIO()
    writer.write(output_stream)
    output_stream.seek(0)

    return StreamingResponse(
        output_stream,
        media_type="application/pdf",
        headers={"Content-Disposition": "attachment; filename=cleaned.pdf"}
    )



# class AnnotationItem(BaseModel):
#     name: str
#     data: dict  # Should match FormData expectations


# @app.post("/annotate-pdf/")
# async def annotate_pdf(
#     pdf: UploadFile = File(...),
#     annotation_json: str = Form(...)
# ):
#     input_pdf_path = f"{UPLOAD_DIR}/{uuid.uuid4()}.pdf"

#     with open(input_pdf_path, "wb") as buffer:
#         shutil.copyfileobj(pdf.file, buffer)

#     # Deserialize form data for the writer
#     annotation_dict = json.loads(annotation_json)
#     form_data = FormData(annotation_dict)

#     output_pdf_path = f"{ANNOTATED_DIR}/annotated_{uuid.uuid4()}.pdf"
#     writer = Writer(output_pdf_path=output_pdf_path, base_pdf_path=input_pdf_path)
#     writer.write_to_pdf(form_data)

#     os.remove(input_pdf_path)
#     return FileResponse(output_pdf_path, media_type='application/pdf', filename="annotated.pdf")
