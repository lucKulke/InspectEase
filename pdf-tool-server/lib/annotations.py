from pypdf import PdfReader


class Reader:
    def __init__(self, path: str) -> None:
        self.reader = PdfReader(path)

    def all_annotations(self):
        annotations = []
        for page_number, page in enumerate(self.reader.pages):
            if "/Annots" in page:
                for annot in page["/Annots"]:
                    obj = annot.get_object()
                    rect = obj.get("/Rect", [])
                    contents = obj.get("/Contents", "")
                    subtype = obj.get("/Subtype", "Unknown")

                    annotations.append({
                        "pageNumber": page_number,
                        "type": str(subtype),  # e.g., '/Text' or '/FreeText'
                        "rect": {
                            "x1": float(rect[0]),
                            "y1": float(rect[1]),
                            "x2": float(rect[2]),
                            "y2": float(rect[3])
                        } if len(rect) == 4 else {"x1": 0, "y1": 0, "x2": 0, "y2": 0},
                        "contents": str(contents),
                    })

        return annotations


