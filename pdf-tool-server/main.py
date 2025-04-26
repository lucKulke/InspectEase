from fastapi import FastAPI, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
import json
import io
from pydantic import BaseModel
import shutil
import uuid
import os
from lib.annotations import Reader
from pypdf import PdfReader, PdfWriter
from typing import Dict, List# Replace 'your_module' with actual module name

from fastapi.responses import StreamingResponse
from io import BytesIO
from reportlab.pdfgen import canvas


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


class Rect(BaseModel):
    x1: float
    y1: float
    x2: float
    y2: float

class AnnotationData(BaseModel):
    pageNumber: int
    type: str
    rect: Rect
    contents: str

@app.post("/extract-annotations", response_model=List[AnnotationData])
async def extract_annotations(pdf: UploadFile = File(...)):
    temp_pdf_path = f"{UPLOAD_DIR}/{uuid.uuid4()}.pdf"

    with open(temp_pdf_path, "wb") as buffer:
        shutil.copyfileobj(pdf.file, buffer)

    reader = Reader(temp_pdf_path)
    annotations = reader.all_annotations()

    os.remove(temp_pdf_path)
    return annotations



@app.post("/remove-annotations")
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


class Position(BaseModel):
    x1: float
    y1: float
    x2: float
    y2: float

class Location(BaseModel):
    page: int
    content: str
    position: Position

class LocationsWrapper(BaseModel):
    locations: List[Location]

@app.post("/fill-pdf/")
async def fill_pdf(file: UploadFile = File(...), locations: str = Form(...)):
    # Parse the incoming JSON string
    parsed_locations = LocationsWrapper(**json.loads(locations))

    file_content = await file.read()
    input_pdf = PdfReader(io.BytesIO(file_content))
    output_pdf = PdfWriter()

    # Prepare a per-page list of overlays
    overlays = {}

    for loc in parsed_locations.locations:
        if loc.page not in overlays:
            overlays[loc.page] = []
        overlays[loc.page].append(loc)
    
    

    for page_number, page in enumerate(input_pdf.pages):
        packet = io.BytesIO()

        page_width = float(page.mediabox.width)
        page_height = float(page.mediabox.height)

        can = canvas.Canvas(packet, pagesize=(page_width, page_height))

        has_overlay = False

        if page_number in overlays:
            for loc in overlays[page_number]:
                pos = loc.position
                x = pos.x1
                y = pos.y1
                can.drawString(x, y, loc.content)
                has_overlay = True

        can.save()
        packet.seek(0)

        if has_overlay:
            new_pdf = PdfReader(packet)
            page.merge_page(new_pdf.pages[0])

        output_pdf.add_page(page)

    output_stream = io.BytesIO()
    output_pdf.write(output_stream)
    output_stream.seek(0)

    return StreamingResponse(output_stream, media_type="application/pdf", headers={"Content-Disposition": "attachment;filename=filled.pdf"})