import * as pdfjsLib from "pdfjs-dist";
import { Field } from "@/types";

// Configure PDF.js worker with fallback handling
if (typeof window !== "undefined") {
  // In browser environment
  const setWorkerSrc = (src: string) => {
    try {
      pdfjsLib.GlobalWorkerOptions.workerSrc = src;
      return true;
    } catch (error) {
      console.warn(`Failed to set PDF.js worker to ${src}:`, error);
      return false;
    }
  };

  // Try worker sources in order of preference
  const workerSources = [
    "/pdf.worker.min.js", // Local worker file (most reliable)
    `//unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`, // Unpkg CDN
    `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`, // Cloudflare CDN
  ];

  let workerSet = false;
  for (const src of workerSources) {
    if (setWorkerSrc(src)) {
      console.log(`PDF.js worker set to: ${src}`);
      workerSet = true;
      break;
    }
  }

  if (!workerSet) {
    console.warn(
      "All PDF.js worker sources failed, PDF processing will continue without worker (slower)"
    );
    // Set a dummy worker to prevent errors
    try {
      pdfjsLib.GlobalWorkerOptions.workerSrc = "";
    } catch {
      console.warn("Could not set empty worker source");
    }
  }
}

export async function extractTextFromPDF(file: File): Promise<string> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let fullText = "";

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .filter((item) => "str" in item)
        .map((item) => (item as { str: string }).str)
        .join(" ");
      fullText += pageText + "\n";
    }

    return fullText;
  } catch (error) {
    console.error("Error extracting text from PDF:", error);
    throw new Error("Failed to extract text from PDF");
  }
}

export async function extractTextPositionsFromPDF(
  file: File
): Promise<Field[]> {
  try {
    const arrayBuffer = await file.arrayBuffer();

    // Load PDF with error handling
    let pdf;
    try {
      pdf = await pdfjsLib.getDocument({
        data: arrayBuffer,
      }).promise;
    } catch (workerError) {
      console.warn(
        "PDF.js worker failed, trying alternative approach:",
        workerError
      );
      // Fallback: try loading with different options
      try {
        pdf = await pdfjsLib.getDocument({
          data: arrayBuffer,
        }).promise;
      } catch (fallbackError) {
        console.error("All PDF loading attempts failed:", fallbackError);
        throw new Error(
          "Unable to load PDF. Please try a different file or refresh the page."
        );
      }
    }

    const fields: Field[] = [];

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      const viewport = page.getViewport({ scale: 1.0 });

      textContent.items
        .filter((item) => "str" in item && "transform" in item)
        .forEach((item, index) => {
          const textItem = item as {
            str: string;
            transform: number[];
            width?: number;
            height?: number;
            fontName?: string;
            fontSize?: number;
            color?: number[];
          };
          const text = textItem.str;
          const tokenMatch = text.match(/\{([A-Z_]+)\}/);

          if (tokenMatch) {
            const tokenName = tokenMatch[1];
            const transform = textItem.transform;

            // Convert PDF coordinates to canvas coordinates
            const x = transform[4];
            const y = viewport.height - transform[5]; // Flip Y coordinate

            // Extract font properties
            const fontFamily = textItem.fontName || "Arial";
            const fontSize = textItem.height || textItem.fontSize || 16;
            const fontWeight = fontSize > 20 ? "bold" : "normal"; // Simple heuristic
            const fontStyle = "normal";
            const textAlign = "left";

            // Convert PDF color array to hex
            let textColor = "#000000";
            if (textItem.color && textItem.color.length >= 3) {
              const r = Math.round(textItem.color[0] * 255);
              const g = Math.round(textItem.color[1] * 255);
              const b = Math.round(textItem.color[2] * 255);
              textColor = `#${r.toString(16).padStart(2, "0")}${g
                .toString(16)
                .padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
            }

            const field: Field = {
              id: `field_${tokenName}_${pageNum}_${index}`,
              name: tokenName,
              type:
                tokenName === "QR_CODE" || tokenName === "CERT_ID"
                  ? "qr"
                  : "text",
              sample: text,
              x,
              y,
              width: textItem.width || 100,
              height: textItem.height || 20,
              fontFamily,
              fontSize,
              fontWeight,
              fontStyle,
              textAlign,
              textColor,
              lineHeight: fontSize * 1.2,
              source: "pdf-text",
            };

            fields.push(field);
          }
        });
    }

    return fields;
  } catch (error) {
    console.error("Error extracting text positions from PDF:", error);

    // Provide more helpful error messages
    if (error instanceof Error) {
      if (error.message.includes("worker")) {
        throw new Error(
          "PDF processing failed due to worker issues. Please try refreshing the page or check your internet connection."
        );
      } else if (error.message.includes("Invalid PDF")) {
        throw new Error(
          "The uploaded file is not a valid PDF. Please check the file and try again."
        );
      }
    }

    throw new Error(
      "Failed to extract text positions from PDF. Please ensure the file is not corrupted and try again."
    );
  }
}

export async function convertPDFToImage(file: File): Promise<string> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const page = await pdf.getPage(1); // Get first page

    const viewport = page.getViewport({ scale: 1.5 });
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d")!;

    canvas.height = viewport.height;
    canvas.width = viewport.width;

    const renderContext = {
      canvasContext: context,
      viewport: viewport,
    };

    await page.render(renderContext).promise;

    return canvas.toDataURL("image/png");
  } catch (error) {
    console.error("Error converting PDF to image:", error);
    throw new Error("Failed to convert PDF to image");
  }
}

export function isPDFFile(file: File): boolean {
  return (
    file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")
  );
}

export function isImageFile(file: File): boolean {
  return (
    file.type.startsWith("image/") ||
    /\.(png|jpg|jpeg|gif|bmp|webp)$/i.test(file.name)
  );
}
