import { Field } from "@/types";

// Token pattern: {UPPERCASE_UNDERSCORE}
const TOKEN_PATTERN = /\{([A-Z_]+)\}/g;

export function detectTokensFromText(text: string): Field[] {
  const tokens: Field[] = [];
  const matches = text.matchAll(TOKEN_PATTERN);

  for (const match of matches) {
    const tokenName = match[1];
    const index = match.index!;

    // Calculate approximate position based on character index
    // This is a simplified approach - in practice, you'd want to use PDF.js to get actual coordinates
    const lines = text.substring(0, index).split("\n");
    const lineNumber = lines.length - 1;
    const charInLine = lines[lines.length - 1].length;

    const field: Field = {
      id: `field_${tokenName}_${index}`,
      name: tokenName,
      type: tokenName === "QR_CODE" || tokenName === "CERT_ID" ? "qr" : "text",
      sample: `{${tokenName}}`,
      x: charInLine * 8, // Approximate character width
      y: lineNumber * 20, // Approximate line height
      width: tokenName.length * 8 + 20, // Token width + padding
      height: 20,
      fontFamily: "Arial",
      fontSize: 16,
      fontWeight: "normal",
      fontStyle: "normal",
      textAlign: "left",
      textColor: "#000000",
      lineHeight: 20,
      source: "pdf-text",
    };

    tokens.push(field);
  }

  return tokens;
}

export function detectTokensByColor(imageData: ImageData): Field[] {
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

export function generateCertificateId(
  prefix: string = "CERT",
  year: number = new Date().getFullYear()
): string {
  const random = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, "0");
  return `${prefix}-${year}-${random}`;
}

export function generateVerifyUrl(certId: string): string {
  return `https://certigenie.app/verify/${certId}`;
}

export function validateTokenName(name: string): boolean {
  return /^[A-Z_]+$/.test(name);
}
