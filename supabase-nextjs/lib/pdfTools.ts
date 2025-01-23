import * as pdfjsLib from "pdfjs-dist";

interface AnnotationData {
  pageNumber: number;
  type: string;
  rect: {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
  };
  contents: string | null;
}

export async function extractAnnotations(pdfBytes: Uint8Array) {
  const extractedAnnoations: AnnotationData[] = [];
  const pdfDoc = await pdfjsLib.getDocument(pdfBytes).promise;

  // Get the annotations for each page
  for (let pageNum = 1; pageNum <= pdfDoc.numPages; pageNum++) {
    const page = await pdfDoc.getPage(pageNum);
    const annotations = await page.getAnnotations();

    annotations.forEach((annotation) => {
      if (annotation.subtype === "FreeText") {
        const annoData: AnnotationData = {
          pageNumber: pageNum,
          type: annotation.subtype,
          contents: annotation.textContent[0],
          rect: {
            x1: annotation.rect[0],
            y1: annotation.rect[1],
            x2: annotation.rect[2],
            y2: annotation.rect[3],
          },
        };
        extractedAnnoations.push(annoData);
        console.log(`Annotation on Page ${pageNum}:`);
        console.log(`Type: ${annotation.subtype}`);
        console.log(`Position: ${annotation.rect}`); // Position [x, y, width, height]
        console.log(`Contents: ${annotation.textContent[0]}`);
      }
    });
  }
  console.log("extracted annotations", extractedAnnoations);
  return extractedAnnoations;
}
