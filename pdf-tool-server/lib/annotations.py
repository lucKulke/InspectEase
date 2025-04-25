import json
from .data_components import FormData
from pypdf import PdfReader, PdfWriter
from pypdf.annotations import FreeText, Text
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
import pathlib
import time




class Reader:
    def __init__(self, path: str) -> None:
        self.reader = PdfReader(path)
        pass

    def all_annotations(self):
        annotations = {}
        page_number = 0
        for page in self.reader.pages:
            if "/Annots" in page:
                for annot in page["/Annots"]:
                    obj = annot.get_object()
                    annotations[obj["/Contents"]] = {
                        "location": obj["/Rect"],
                        "page": page_number,
                    }
            page_number += 1

        return annotations


class Writer:
    def __init__(
        self,
        output_pdf_path: str,
        base_pdf_path: str,
    ) -> None:
        self.output_pdf_path = output_pdf_path
        self.base_pdf_path = base_pdf_path

    def create_annos(self, form_data):
        annotations = []
        for name in form_data.get_data():
            if form_data[name].is_at_least_one_field_filled():
                for id, data in form_data[name].data_for_annotations().items():
                    value = data["value"]
                    if value:
                        # Use the bottom-left corner of the rectangle for the annotation
                        annotations.append(
                            {
                                "text": value,
                                "x": data["location"][0],
                                "y": data["location"][1],
                                "page": data["page"],
                            }
                        )

        return annotations

    def write_to_pdf(self, form_data: FormData):
        annotations = self.create_annos(form_data)

        # Paths to the PDFs
        base_pdf_path = self.base_pdf_path
        timestr = time.strftime("%Y%m%d-%H%M%S")
        annotation_pdf_path = f"temp_pdfs/temp_{timestr}.pdf"
        path, extention = self.output_pdf_path.split(".")
        output_pdf_path = f"{path}{timestr}.{extention}"

        # Get the page size from the base PDF
        reader = PdfReader(base_pdf_path)
        first_page = reader.pages[0]
        page_width = first_page.mediabox.width
        page_height = first_page.mediabox.height

        # Create the annotation PDF with annotations on the correct pages
        self.create_annotation_pdf(
            annotations,
            annotation_pdf_path,
            (page_width, page_height),
            len(reader.pages),
        )

        # Merge the PDFs
        self.merge_pdfs(base_pdf_path, annotation_pdf_path, output_pdf_path)

    def create_annotation_pdf(self, annotation_data, output_path, page_size, num_pages):
        c = canvas.Canvas(output_path, pagesize=page_size)

        for page_number in range(num_pages):
            for annotation in annotation_data:
                if annotation["page"] == page_number:
                    c.drawString(
                        annotation["x"] + 5, annotation["y"] + 5, annotation["text"]
                    )
            c.showPage()

        c.save()

    def merge_pdfs(self, base_pdf_path, annotation_pdf_path, output_pdf_path):
        # Read the existing PDF
        with open(base_pdf_path, "rb") as base_pdf_file:
            base_pdf = PdfReader(base_pdf_file)
            base_pdf_writer = PdfWriter()

            # Read the annotation PDF
            with open(annotation_pdf_path, "rb") as annotation_pdf_file:
                annotation_pdf = PdfReader(annotation_pdf_file)

                # Merge each page of the base PDF with the corresponding page of the annotation PDF
                for page_num in range(len(base_pdf.pages)):
                    base_page = base_pdf.pages[page_num]
                    annotation_page = annotation_pdf.pages[page_num]

                    base_page.merge_page(annotation_page)
                    base_pdf_writer.add_page(base_page)

            # Save the merged PDF
            with open(output_pdf_path, "wb") as output_pdf_file:
                base_pdf_writer.write(output_pdf_file)

        file_to_rem = pathlib.Path(annotation_pdf_path)
        file_to_rem.unlink()