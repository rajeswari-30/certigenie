import QRCode from "qrcode";
import { QRCodeData } from "@/types";

export async function generateQRCode(data: string): Promise<string> {
  try {
    const qrDataUrl = await QRCode.toDataURL(data, {
      width: 200,
      margin: 2,
      color: {
        dark: "#000000",
        light: "#FFFFFF",
      },
    });
    return qrDataUrl;
  } catch (error) {
    console.error("Error generating QR code:", error);
    throw new Error("Failed to generate QR code");
  }
}

export async function generateCertificateQRCode(
  certId: string
): Promise<string> {
  const verifyUrl = `https://certigenie.app/verify/${certId}`;
  return generateQRCode(verifyUrl);
}

export function createQRCodeData(certId: string): QRCodeData {
  return {
    certId,
    verifyUrl: `https://certigenie.app/verify/${certId}`,
    timestamp: new Date().toISOString(),
  };
}

export function validateQRCodeData(data: string): boolean {
  try {
    const url = new URL(data);
    return (
      url.hostname === "certigenie.app" && url.pathname.startsWith("/verify/")
    );
  } catch {
    return false;
  }
}

export function extractCertIdFromUrl(url: string): string | null {
  try {
    const urlObj = new URL(url);
    if (
      urlObj.hostname === "certigenie.app" &&
      urlObj.pathname.startsWith("/verify/")
    ) {
      return urlObj.pathname.split("/")[2];
    }
    return null;
  } catch {
    return null;
  }
}
