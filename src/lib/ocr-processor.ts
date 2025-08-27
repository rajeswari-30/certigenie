import Tesseract from "tesseract.js";
import { Field } from "@/types";

export async function performOCR(imageFile: File): Promise<string> {
  try {
    const result = await Tesseract.recognize(imageFile, "eng", {
      logger: (m) => console.log(m), // Optional: log progress
    });

    return result.data.text;
  } catch (error) {
    console.error("Error performing OCR:", error);
    throw new Error("Failed to perform OCR on image");
  }
}

export async function performOCRWithPositions(
  imageFile: File
): Promise<Field[]> {
  try {
    const result = await Tesseract.recognize(imageFile, "eng", {
      logger: (m) => console.log(m),
    });

    const fields: Field[] = [];
    const words = result.data.words || [];

    words.forEach(
      (
        word: {
          text: string;
          bbox: { x0: number; y0: number; x1: number; y1: number };
        },
        index: number
      ) => {
        const text = word.text;
        const tokenMatch = text.match(/\{([A-Z_]+)\}/);

        if (tokenMatch) {
          const tokenName = tokenMatch[1];
          const bbox = word.bbox;
          const fontSize = bbox.y1 - bbox.y0;

          const field: Field = {
            id: `field_ocr_${tokenName}_${index}`,
            name: tokenName,
            type:
              tokenName === "QR_CODE" || tokenName === "CERT_ID"
                ? "qr"
                : "text",
            sample: text,
            x: bbox.x0,
            y: bbox.y0,
            width: bbox.x1 - bbox.x0,
            height: bbox.y1 - bbox.y0,
            fontFamily: "Arial", // Default for OCR
            fontSize: fontSize || 16,
            fontWeight: fontSize > 20 ? "bold" : "normal",
            fontStyle: "normal",
            textAlign: "left",
            textColor: "#000000", // Default black
            lineHeight: fontSize * 1.2,
            source: "ocr",
          };

          fields.push(field);
        }
      }
    );

    return fields;
  } catch (error) {
    console.error("Error performing OCR with positions:", error);
    // Return empty array instead of throwing error for graceful handling
    return [];
  }
}

export async function detectTokensInImage(imageFile: File): Promise<Field[]> {
  try {
    // First try to detect tokens by color (magenta)
    const imageData = await getImageData(imageFile);
    const colorTokens = detectTokensByColor(imageData);

    if (colorTokens.length > 0) {
      return colorTokens;
    }

    // Fallback to OCR
    return await performOCRWithPositions(imageFile);
  } catch (error) {
    console.error("Error detecting tokens in image:", error);
    // Return empty array instead of throwing error for graceful handling
    return [];
  }
}

async function getImageData(file: File): Promise<ImageData> {
  return new Promise((resolve, reject) => {
    const img = document.createElement("img");
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d")!;

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      resolve(imageData);
    };

    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

function detectTokensByColor(imageData: ImageData): Field[] {
  const tokens: Field[] = [];
  const { data, width, height } = imageData;

  // Scan for magenta pixels (#FF00FF)
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const index = (y * width + x) * 4;
      const r = data[index];
      const g = data[index + 1];
      const b = data[index + 2];

      // Check if pixel is magenta (with some tolerance)
      if (r > 240 && g < 20 && b > 240) {
        // Found magenta pixel, scan for connected region
        const region = scanConnectedRegion(imageData, x, y, width, height);
        if (region.width > 10 && region.height > 10) {
          // Minimum size threshold
          tokens.push({
            id: `field_color_${tokens.length}`,
            name: `TOKEN_${tokens.length + 1}`,
            type: "text",
            x: region.x,
            y: region.y,
            width: region.width,
            height: region.height,
            fontFamily: "Arial",
            fontSize: region.height,
            fontWeight: "normal",
            fontStyle: "normal",
            textAlign: "left",
            textColor: "#000000",
            lineHeight: region.height * 1.2,
            source: "color",
          });
        }
      }
    }
  }

  return tokens;
}

function scanConnectedRegion(
  imageData: ImageData,
  startX: number,
  startY: number,
  width: number,
  height: number
): { x: number; y: number; width: number; height: number } {
  const visited = new Set<string>();
  const queue: [number, number][] = [[startX, startY]];
  const { data } = imageData;

  let minX = startX,
    maxX = startX;
  let minY = startY,
    maxY = startY;

  while (queue.length > 0) {
    const [x, y] = queue.shift()!;
    const key = `${x},${y}`;

    if (visited.has(key)) continue;
    visited.add(key);

    // Update bounds
    minX = Math.min(minX, x);
    maxX = Math.max(maxX, x);
    minY = Math.min(minY, y);
    maxY = Math.max(maxY, y);

    // Check 8-connected neighbors
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        if (dx === 0 && dy === 0) continue;

        const nx = x + dx;
        const ny = y + dy;

        if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
          const index = (ny * width + nx) * 4;
          const r = data[index];
          const g = data[index + 1];
          const b = data[index + 2];

          // Check if neighbor is also magenta
          if (r > 240 && g < 20 && b > 240) {
            queue.push([nx, ny]);
          }
        }
      }
    }
  }

  return {
    x: minX,
    y: minY,
    width: maxX - minX + 1,
    height: maxY - minY + 1,
  };
}
