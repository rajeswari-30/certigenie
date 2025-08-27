export interface Field {
  id: string;
  name: string; // e.g. NAME, DATE, QR_CODE
  type: "text" | "qr"; // text fields vs QR
  sample?: string;
  x: number;
  y: number;
  width: number;
  height: number;

  // Font properties
  fontFamily: string;
  fontSize: number;
  fontWeight:
    | "normal"
    | "bold"
    | "100"
    | "200"
    | "300"
    | "400"
    | "500"
    | "600"
    | "700"
    | "800"
    | "900";
  fontStyle: "normal" | "italic";
  textAlign: "left" | "center" | "right";
  textColor: string;
  lineHeight?: number;

  source: "pdf-text" | "ocr" | "manual" | "color";
  bboxMask?: { x: number; y: number; w: number; h: number };
}

export interface CertificateRecord {
  certId: string; // unique
  values: Record<string, string>; // fieldName → value
  verifyUrl: string; // /verify/certId
  issuedAt: string;
}

export interface Template {
  id: string;
  name: string;
  fields: Field[];
  imageUrl: string;
  createdAt: string;
}

export interface BulkGenerationData {
  templateId: string;
  records: Array<Record<string, string>>; // CSV data
  outputFormat: "png" | "pdf";
}

export interface TokenDetectionResult {
  tokens: Field[];
  confidence: number;
  method: "pdf-text" | "ocr" | "color";
}

export interface QRCodeData {
  certId: string;
  verifyUrl: string;
  timestamp: string;
}
