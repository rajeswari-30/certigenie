"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Download,
  QrCode,
  Hash,
  Eye,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";
import { Field } from "@/types";
import { generateCertificateId } from "@/lib/token-detection";
import { generateCertificateQRCode } from "@/lib/qr-generator";
import {
  createNewCertificate,
  saveCertificate,
} from "@/lib/certificate-storage";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

interface CertificateGeneratorProps {
  fields: Field[];
  templateImageUrl: string;
  onBack: () => void;
}

export default function CertificateGenerator({
  fields,
  templateImageUrl,
  onBack,
}: CertificateGeneratorProps) {
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(
    null
  );
  const [outputFormat, setOutputFormat] = useState<"png" | "pdf">("png");
  const [warnings, setWarnings] = useState<string[]>([]);
  const [certificateId, setCertificateId] = useState<string>("");
  const [useTextReplacement, setUseTextReplacement] = useState(true);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Function to replace text in the template image
  const replaceTextInTemplate =
    useCallback(async (): Promise<HTMLCanvasElement> => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d")!;
      const img = document.createElement("img");

      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = templateImageUrl;
      });

      canvas.width = img.width;
      canvas.height = img.height;

      // Draw template image
      ctx.drawImage(img, 0, 0);

      // Note: imageData is available for future advanced text manipulation
      // const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

      // For each field, implement TRUE PLACEHOLDER REPLACEMENT
      for (const field of fields) {
        if (field.name === "QR_CODE" || field.name === "CERT_ID") {
          continue; // Skip special fields for text replacement
        }

        const value = formData[field.name] || "";
        if (!value) continue;

        // STEP 1: MASK THE ORIGINAL PLACEHOLDER TEXT
        // Create a background rectangle to cover the original {PLACEHOLDER} text
        ctx.save();
        ctx.fillStyle = "#FFFFFF"; // White background to cover original text
        ctx.fillRect(field.x, field.y, field.width, field.height);
        ctx.restore();

        // STEP 2: DRAW THE NEW TEXT IN THE EXACT SAME POSITION
        const textX = field.x;
        const textY = field.y + field.fontSize; // Adjust for baseline

        ctx.save();
        ctx.font = `${field.fontStyle} ${field.fontWeight} ${field.fontSize}px ${field.fontFamily}`;
        ctx.fillStyle = field.textColor;
        ctx.textAlign = field.textAlign;
        ctx.textBaseline = "top";

        // Handle text wrapping for long values
        const words = value.split(" ");
        let line = "";
        let y = textY;

        for (let n = 0; n < words.length; n++) {
          const testLine = line + words[n] + " ";
          const metrics = ctx.measureText(testLine);

          if (metrics.width > field.width && n > 0) {
            ctx.fillText(line, textX, y);
            line = words[n] + " ";
            y += field.lineHeight || field.fontSize * 1.2;
          } else {
            line = testLine;
          }
        }
        ctx.fillText(line, textX, y);
        ctx.restore();
      }

      return canvas;
    }, [fields, formData, templateImageUrl]);

  const generateLivePreview = useCallback(async () => {
    if (!canvasRef.current) return;

    try {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d")!;

      if (useTextReplacement) {
        // Use text replacement approach
        const processedCanvas = await replaceTextInTemplate();
        canvas.width = processedCanvas.width;
        canvas.height = processedCanvas.height;
        ctx.drawImage(processedCanvas, 0, 0);
      } else {
        // Use original positioned field approach
        const img = document.createElement("img");

        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
          img.src = templateImageUrl;
        });

        canvas.width = img.width;
        canvas.height = img.height;

        // Draw template image
        ctx.drawImage(img, 0, 0);

        // Process each field for preview
        for (const field of fields) {
          if (field.name === "QR_CODE") {
            // Show placeholder for QR code in preview
            ctx.fillStyle = "#e5e7eb";
            ctx.fillRect(field.x, field.y, field.width, field.height);
            ctx.fillStyle = "#6b7280";
            ctx.font = "12px Arial";
            ctx.textAlign = "center";
            ctx.fillText(
              "QR Code",
              field.x + field.width / 2,
              field.y + field.height / 2 + 4
            );
          } else if (field.name === "CERT_ID") {
            // Draw certificate ID text
            const value = formData[field.name] || certificateId;
            if (value) {
              ctx.save();
              ctx.font = `${field.fontStyle} ${field.fontWeight} ${field.fontSize}px ${field.fontFamily}`;
              ctx.fillStyle = field.textColor;
              ctx.textAlign = field.textAlign;
              ctx.textBaseline = "top";
              ctx.fillText(value, field.x, field.y);
              ctx.restore();
            }
          } else {
            // Draw regular text field
            const value = formData[field.name] || "";
            if (value) {
              ctx.save();
              ctx.font = `${field.fontStyle} ${field.fontWeight} ${field.fontSize}px ${field.fontFamily}`;
              ctx.fillStyle = field.textColor;
              ctx.textAlign = field.textAlign;
              ctx.textBaseline = "top";

              // Handle text wrapping for long values
              const words = value.split(" ");
              let line = "";
              let y = field.y;

              for (let n = 0; n < words.length; n++) {
                const testLine = line + words[n] + " ";
                const metrics = ctx.measureText(testLine);

                if (metrics.width > field.width && n > 0) {
                  ctx.fillText(line, field.x, y);
                  line = words[n] + " ";
                  y += field.lineHeight || field.fontSize * 1.2;
                } else {
                  line = testLine;
                }
              }
              ctx.fillText(line, field.x, y);
              ctx.restore();
            }
          }
        }
      }

      // Canvas is already drawn to the DOM via canvasRef
    } catch (error) {
      console.error("Error generating live preview:", error);
    }
  }, [
    fields,
    formData,
    certificateId,
    templateImageUrl,
    useTextReplacement,
    replaceTextInTemplate,
  ]);

  // Initialize form data with default values for special fields
  useEffect(() => {
    const initialData: Record<string, string> = {};
    const newCertId = generateCertificateId();
    setCertificateId(newCertId);

    fields.forEach((field) => {
      if (field.name === "CERT_ID") {
        initialData[field.name] = newCertId;
      } else if (field.name === "QR_CODE") {
        // QR_CODE will be auto-generated from CERT_ID
        initialData[field.name] = "";
      } else if (field.name === "DATE") {
        initialData[field.name] = new Date().toLocaleDateString();
      } else {
        initialData[field.name] = "";
      }
    });
    setFormData(initialData);
  }, [fields]);

  // Live preview generation
  useEffect(() => {
    if (Object.keys(formData).length > 0 && canvasRef.current) {
      generateLivePreview();
    }
  }, [formData, fields, generateLivePreview]);

  const handleInputChange = (fieldName: string, value: string) => {
    const newFormData = { ...formData, [fieldName]: value };
    setFormData(newFormData);

    // Auto-update CERT_ID if it's being edited
    if (fieldName === "CERT_ID") {
      const certId = value || generateCertificateId();
      setCertificateId(certId);
      setFormData((prev) => ({ ...prev, CERT_ID: certId }));
    }

    // Check for text overflow warnings
    checkTextOverflow(fieldName, value);
  };

  const checkTextOverflow = (fieldName: string, value: string) => {
    const field = fields.find((f) => f.name === fieldName);
    if (field && value.length > 0) {
      const estimatedWidth = value.length * (field.fontSize || 16) * 0.6; // Rough estimate
      if (estimatedWidth > field.width) {
        setWarnings((prev) => {
          const newWarnings = prev.filter((w) => !w.includes(fieldName));
          return [
            ...newWarnings,
            `Text for ${fieldName} may be too long and could be clipped.`,
          ];
        });
      } else {
        setWarnings((prev) => prev.filter((w) => !w.includes(fieldName)));
      }
    }
  };

  const generateCertificate = async () => {
    setIsGenerating(true);

    try {
      let canvas: HTMLCanvasElement;

      if (useTextReplacement) {
        // Use text replacement approach
        canvas = await replaceTextInTemplate();
      } else {
        // Use original positioned field approach
        canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d")!;
        const img = document.createElement("img");

        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
          img.src = templateImageUrl;
        });

        canvas.width = img.width;
        canvas.height = img.height;

        // Draw template image
        ctx.drawImage(img, 0, 0);

        // Set default font properties
        ctx.font = "16px Arial";
        ctx.fillStyle = "#000000";

        // Process each field
        for (const field of fields) {
          if (field.name === "QR_CODE") {
            // Generate QR code for the certificate
            const certId = formData["CERT_ID"] || certificateId;
            const qrDataUrl = await generateCertificateQRCode(certId);

            // Load and draw QR code
            const qrImg = document.createElement("img");
            await new Promise((resolve, reject) => {
              qrImg.onload = resolve;
              qrImg.onerror = reject;
              qrImg.src = qrDataUrl;
            });

            ctx.drawImage(qrImg, field.x, field.y, field.width, field.height);
          } else if (field.name === "CERT_ID") {
            // Draw certificate ID text
            const certId = formData[field.name] || certificateId;
            ctx.save();
            ctx.font = `${field.fontStyle} ${field.fontWeight} ${field.fontSize}px ${field.fontFamily}`;
            ctx.fillStyle = field.textColor;
            ctx.textAlign = field.textAlign;
            ctx.textBaseline = "top";
            ctx.fillText(certId, field.x, field.y);
            ctx.restore();
          } else {
            // Draw regular text field
            const value = formData[field.name] || "";
            if (value) {
              ctx.save();
              ctx.font = `${field.fontStyle} ${field.fontWeight} ${field.fontSize}px ${field.fontFamily}`;
              ctx.fillStyle = field.textColor;
              ctx.textAlign = field.textAlign;
              ctx.textBaseline = "top";

              // Handle text wrapping for long values
              const words = value.split(" ");
              let line = "";
              let y = field.y;

              for (let n = 0; n < words.length; n++) {
                const testLine = line + words[n] + " ";
                const metrics = ctx.measureText(testLine);

                if (metrics.width > field.width && n > 0) {
                  ctx.fillText(line, field.x, y);
                  line = words[n] + " ";
                  y += field.lineHeight || field.fontSize * 1.2;
                } else {
                  line = testLine;
                }
              }
              ctx.fillText(line, field.x, y);
              ctx.restore();
            }
          }
        }
      }

      // Add QR code and CERT_ID if using text replacement
      if (useTextReplacement) {
        const ctx = canvas.getContext("2d")!;

        for (const field of fields) {
          if (field.name === "QR_CODE") {
            // Generate QR code for the certificate
            const certId = formData["CERT_ID"] || certificateId;
            const qrDataUrl = await generateCertificateQRCode(certId);

            // Load and draw QR code
            const qrImg = document.createElement("img");
            await new Promise((resolve, reject) => {
              qrImg.onload = resolve;
              qrImg.onerror = reject;
              qrImg.src = qrDataUrl;
            });

            ctx.drawImage(qrImg, field.x, field.y, field.width, field.height);
          } else if (field.name === "CERT_ID") {
            // Draw certificate ID text
            const certId = formData[field.name] || certificateId;
            ctx.save();
            ctx.font = `${field.fontStyle} ${field.fontWeight} ${field.fontSize}px ${field.fontFamily}`;
            ctx.fillStyle = field.textColor;
            ctx.textAlign = field.textAlign;
            ctx.textBaseline = "top";
            ctx.fillText(certId, field.x, field.y);
            ctx.restore();
          }
        }
      }

      // Convert canvas to data URL
      const generatedUrl = canvas.toDataURL("image/png");
      setGeneratedImageUrl(generatedUrl);

      // Save certificate to localStorage
      const certificate = createNewCertificate(
        `template_${Date.now()}`, // Generate a template ID
        "Generated Certificate",
        formData
      );
      saveCertificate(certificate);
    } catch (error) {
      console.error("Error generating certificate:", error);
      alert("Failed to generate certificate. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadCertificate = async () => {
    if (!generatedImageUrl) return;

    if (outputFormat === "pdf") {
      // Export as PDF
      await exportAsPDF();
    } else {
      // Export as PNG
      const link = document.createElement("a");
      link.download = `certificate_${formData["NAME"] || "unnamed"}_${
        formData["CERT_ID"] || certificateId || "unknown"
      }.png`;
      link.href = generatedImageUrl;
      link.click();
    }
  };

  const exportAsPDF = async () => {
    try {
      if (!generatedImageUrl) {
        alert(
          "No certificate generated yet. Please generate a certificate first."
        );
        return;
      }

      // Create a new canvas with the generated certificate
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d")!;
      const img = document.createElement("img");

      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = generatedImageUrl!;
      });

      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      // Convert canvas to blob (not used in current implementation but available for future use)
      await new Promise<Blob>((resolve) => {
        canvas.toBlob((blob) => {
          if (blob) resolve(blob);
        }, "image/png");
      });

      // Create PDF using jsPDF
      const { jsPDF } = await import("jspdf");
      const pdf = new jsPDF({
        orientation: img.width > img.height ? "landscape" : "portrait",
        unit: "px",
        format: [img.width, img.height],
      });

      // Add the image to PDF
      const imgData = canvas.toDataURL("image/png");
      pdf.addImage(imgData, "PNG", 0, 0, img.width, img.height);

      // Save the PDF
      const fileName = `certificate_${formData["NAME"] || "unnamed"}_${
        formData["CERT_ID"] || certificateId || "unknown"
      }.pdf`;
      pdf.save(fileName);
    } catch (error) {
      console.error("Error exporting PDF:", error);
      alert("Failed to export PDF. Please try again.");
    }
  };

  const previewCertificate = () => {
    if (!generatedImageUrl) return;

    const newWindow = window.open();
    if (newWindow) {
      newWindow.document.write(`
        <html>
          <head><title>Certificate Preview</title></head>
          <body style="margin:0;padding:20px;text-align:center;">
            <img src="${generatedImageUrl}" style="max-width:100%;height:auto;" />
          </body>
        </html>
      `);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      <div className="flex items-center space-x-2">
        <Button
          variant="ghost"
          onClick={onBack}
          className="text-blue-600 hover:text-blue-800"
        >
          ← Back to Token Editor
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Generate Certificate</CardTitle>
          <CardDescription>
            Fill in the values for each token and generate your certificate.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Form Section */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Certificate Details</CardTitle>
                  <CardDescription>
                    Fill in the values for each placeholder. The system will
                    replace {`{NAME}`}, {`{COURSE}`}, etc. with your input.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Text Replacement Toggle */}
                  <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center space-x-2">
                      <RefreshCw className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                        Text Replacement Mode
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-blue-700 dark:text-blue-300">
                        {useTextReplacement ? "ON" : "OFF"}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setUseTextReplacement(!useTextReplacement)
                        }
                        className="h-8 px-3 text-xs"
                      >
                        {useTextReplacement ? "Disable" : "Enable"}
                      </Button>
                    </div>
                  </div>

                  {useTextReplacement && (
                    <div className="p-3 bg-green-50 dark:bg-green-950/30 rounded-lg border border-green-200 dark:border-green-800">
                      <p className="text-sm text-green-800 dark:text-green-200">
                        ✅ <strong>Text Replacement Active:</strong> Your input
                        will replace placeholder text like {`{NAME}`},{" "}
                        {`{COURSE}`}, {`{DATE}`} in the template.
                      </p>
                    </div>
                  )}
                  {fields.map((field) => (
                    <div key={field.id} className="space-y-2">
                      <Label className="flex items-center space-x-2">
                        {field.name === "QR_CODE" && (
                          <QrCode className="h-4 w-4 text-blue-600" />
                        )}
                        {field.name === "CERT_ID" && (
                          <Hash className="h-4 w-4 text-green-600" />
                        )}
                        <span>{field.name.replace(/_/g, " ")}</span>
                        {field.name === "QR_CODE" && (
                          <Badge variant="outline" className="text-blue-600">
                            Auto-generated
                          </Badge>
                        )}
                        {field.name === "CERT_ID" && (
                          <Badge variant="outline" className="text-green-600">
                            Auto-generated
                          </Badge>
                        )}
                      </Label>

                      {field.name === "QR_CODE" ? (
                        <div className="text-sm text-gray-500 bg-gray-50 p-3 rounded-md">
                          QR code will be automatically generated from the
                          Certificate ID
                        </div>
                      ) : (
                        <Input
                          type="text"
                          value={formData[field.name] || ""}
                          onChange={(e) =>
                            handleInputChange(field.name, e.target.value)
                          }
                          placeholder={`Enter ${field.name
                            .replace(/_/g, " ")
                            .toLowerCase()}`}
                          disabled={field.name === "CERT_ID"}
                        />
                      )}
                    </div>
                  ))}

                  {/* Warnings */}
                  {warnings.length > 0 && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                      <div className="flex items-center space-x-2 mb-2">
                        <AlertTriangle className="h-4 w-4 text-yellow-600" />
                        <span className="text-sm font-medium text-yellow-800">
                          Text Overflow Warnings
                        </span>
                      </div>
                      <ul className="text-xs text-yellow-700 space-y-1">
                        {warnings.map((warning, index) => (
                          <li key={index}>• {warning}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Output Format Selection */}
                  <div className="space-y-2">
                    <Label>Output Format</Label>
                    <Select
                      value={outputFormat}
                      onValueChange={(value) =>
                        setOutputFormat(value as "png" | "pdf")
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="png">PNG Image</SelectItem>
                        <SelectItem value="pdf">PDF Document</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Generate Button */}
                  <Button
                    onClick={generateCertificate}
                    disabled={isGenerating}
                    className="w-full"
                    size="lg"
                  >
                    {isGenerating ? "Generating..." : "Generate Certificate"}
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Live Preview Section */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Live Preview</CardTitle>
                  <CardDescription>
                    See your certificate as you type with real-time updates
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-gray-900">
                    <canvas
                      ref={canvasRef}
                      className="w-full h-auto"
                      style={{ maxHeight: "500px" }}
                    />
                  </div>

                  {/* Preview Controls */}
                  <div className="mt-4 space-y-3">
                    <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                      <span>Preview updates automatically as you type</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span>Live</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Generated Certificate Actions */}
              {generatedImageUrl && (
                <Card>
                  <CardHeader>
                    <CardTitle>Certificate Ready</CardTitle>
                    <CardDescription>
                      Your certificate has been generated successfully
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex space-x-3">
                      <Button
                        variant="outline"
                        onClick={previewCertificate}
                        className="flex-1"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Preview
                      </Button>
                      <Button onClick={downloadCertificate} className="flex-1">
                        <Download className="h-4 w-4 mr-2" />
                        Download {outputFormat.toUpperCase()}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
