"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import {
  FileText,
  Download,
  CheckCircle,
  QrCode,
  Hash,
  AlertTriangle,
} from "lucide-react";
import { Field } from "@/types";
import { generateCertificateId } from "@/lib/token-detection";
import { generateCertificateQRCode } from "@/lib/qr-generator";
import JSZip from "jszip";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface BulkGeneratorProps {
  fields: Field[];
  templateImageUrl: string;
  onBack: () => void;
}

export default function BulkGenerator({
  fields,
  templateImageUrl,
  onBack,
}: BulkGeneratorProps) {
  const [csvData, setCsvData] = useState<Array<Record<string, string>>>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState<string>("");
  const [outputFormat, setOutputFormat] = useState<"png" | "pdf">("png");
  const [fieldMappings, setFieldMappings] = useState<Record<string, string>>(
    {}
  );
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [samplePreview, setSamplePreview] = useState<string | null>(null);

  const generateSamplePreview = useCallback(
    async (
      sampleRow: Record<string, string>,
      mappings: Record<string, string>
    ) => {
      try {
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

        // Set default font properties
        ctx.font = "16px Arial";
        ctx.fillStyle = "#000000";

        // Generate sample certificate ID
        const sampleCertId = generateCertificateId();

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
            // Draw sample certificate ID
            ctx.font = `${field.fontWeight === "bold" ? "bold" : "normal"} ${
              field.fontSize || 16
            }px Arial`;
            ctx.textAlign = field.textAlign || "left";
            ctx.fillText(
              sampleCertId,
              field.x,
              field.y + (field.fontSize || 16)
            );
          } else {
            // Draw regular text field from CSV data
            const csvHeader = mappings[field.name];
            const value = csvHeader ? sampleRow[csvHeader] : "";

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

        const previewUrl = canvas.toDataURL("image/png");
        setSamplePreview(previewUrl);
      } catch (error) {
        console.error("Error generating sample preview:", error);
      }
    },
    [fields, templateImageUrl]
  );

  const processCSV = useCallback(
    async (file: File) => {
      try {
        const text = await file.text();
        const lines = text.split("\n").filter((line) => line.trim());

        if (lines.length < 2) {
          throw new Error(
            "CSV must have at least a header row and one data row"
          );
        }

        const headers = lines[0]
          .split(",")
          .map((h) => h.trim().replace(/"/g, ""));
        const data: Array<Record<string, string>> = [];

        for (let i = 1; i < lines.length; i++) {
          const values = lines[i]
            .split(",")
            .map((v) => v.trim().replace(/"/g, ""));
          const row: Record<string, string> = {};

          headers.forEach((header, index) => {
            row[header] = values[index] || "";
          });

          data.push(row);
        }

        setCsvData(data);

        // Auto-map fields to CSV headers
        const mappings: Record<string, string> = {};
        fields.forEach((field) => {
          if (field.name === "QR_CODE" || field.name === "CERT_ID") {
            // These are auto-generated, not mapped from CSV
            return;
          }

          // Try to find matching header
          const matchingHeader = headers.find(
            (header) =>
              header
                .toLowerCase()
                .includes(field.name.toLowerCase().replace(/_/g, "")) ||
              field.name
                .toLowerCase()
                .replace(/_/g, "")
                .includes(header.toLowerCase())
          );

          if (matchingHeader) {
            mappings[field.name] = matchingHeader;
          }
        });

        setFieldMappings(mappings);

        // Generate sample preview
        if (data.length > 0) {
          generateSamplePreview(data[0], mappings);
        }
      } catch (error) {
        console.error("Error processing CSV:", error);
        alert("Failed to process CSV file. Please check the format.");
      }
    },
    [fields, generateSamplePreview]
  );

  const {
    getRootProps: getCSVDropProps,
    getInputProps: getCSVInputProps,
    isDragActive: isCSVDragActive,
  } = useDropzone({
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        processCSV(acceptedFiles[0]);
      }
    },
    accept: {
      "text/csv": [".csv"],
      "application/vnd.ms-excel": [".csv"],
    },
    multiple: false,
  });

  const validateFieldMappings = (): boolean => {
    const errors: string[] = [];

    // Check if required fields are mapped
    fields.forEach((field) => {
      if (field.name !== "QR_CODE" && field.name !== "CERT_ID") {
        if (!fieldMappings[field.name]) {
          errors.push(`Field "${field.name}" is not mapped to any CSV column`);
        }
      }
    });

    // Check if CSV has data
    if (csvData.length === 0) {
      errors.push("No CSV data found. Please upload a valid CSV file.");
    }

    setValidationErrors(errors);
    return errors.length === 0;
  };

  const generateBulkCertificates = async () => {
    if (!validateFieldMappings()) {
      return;
    }

    setIsProcessing(true);

    try {
      const zip = new JSZip();
      const generatedCount = csvData.length;

      for (let i = 0; i < csvData.length; i++) {
        const row = csvData[i];
        setProcessingStep(
          `Generating certificate ${i + 1} of ${generatedCount}...`
        );

        // Generate certificate with current row data
        const certificateImage = await generateSingleCertificate(row);

        // Add to ZIP
        const fileName = generateFileName(row);
        zip.file(`${fileName}.${outputFormat}`, certificateImage, {
          binary: true,
        });
      }

      setProcessingStep("Creating ZIP file...");

      // Generate and download ZIP
      const zipBlob = await zip.generateAsync({ type: "blob" });
      const link = document.createElement("a");
      link.download = `certificates_bulk_${
        new Date().toISOString().split("T")[0]
      }.zip`;
      link.href = URL.createObjectURL(zipBlob);
      link.click();

      setProcessingStep("Bulk generation complete!");
    } catch (error) {
      console.error("Error in bulk generation:", error);
      alert("Failed to generate bulk certificates. Please try again.");
    } finally {
      setIsProcessing(false);
      setProcessingStep("");
    }
  };

  const generateSingleCertificate = async (
    rowData: Record<string, string>
  ): Promise<Blob> => {
    return new Promise(async (resolve, reject) => {
      try {
        // Create canvas and load template image
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d")!;
        const img = document.createElement("img");

        await new Promise((resolveImg, rejectImg) => {
          img.onload = resolveImg;
          img.onerror = rejectImg;
          img.src = templateImageUrl;
        });

        canvas.width = img.width;
        canvas.height = img.height;

        // Draw template image
        ctx.drawImage(img, 0, 0);

        // Set default font properties
        ctx.font = "16px Arial";
        ctx.fillStyle = "#000000";

        // Generate unique certificate ID for this certificate
        const certId = generateCertificateId();

        // Process each field
        for (const field of fields) {
          if (field.name === "QR_CODE") {
            // Generate QR code for this certificate
            const qrDataUrl = await generateCertificateQRCode(certId);

            // Load and draw QR code
            const qrImg = document.createElement("img");
            await new Promise((resolveImg, rejectImg) => {
              qrImg.onload = resolveImg;
              qrImg.onerror = rejectImg;
              qrImg.src = qrDataUrl;
            });

            ctx.drawImage(qrImg, field.x, field.y, field.width, field.height);
          } else if (field.name === "CERT_ID") {
            // Draw certificate ID text
            ctx.font = `${field.fontWeight === "bold" ? "bold" : "normal"} ${
              field.fontSize || 16
            }px Arial`;
            ctx.textAlign = field.textAlign || "left";
            ctx.save();
            ctx.font = `${field.fontStyle} ${field.fontWeight} ${field.fontSize}px ${field.fontFamily}`;
            ctx.fillStyle = field.textColor;
            ctx.textAlign = field.textAlign;
            ctx.textBaseline = "top";
            ctx.fillText(certId, field.x, field.y);
            ctx.restore();
          } else {
            // Draw regular text field from CSV data
            const csvHeader = fieldMappings[field.name];
            const value = csvHeader ? rowData[csvHeader] : "";

            if (value) {
              ctx.font = `${field.fontWeight === "bold" ? "bold" : "normal"} ${
                field.fontSize || 16
              }px Arial`;
              ctx.textAlign = field.textAlign || "left";
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

        // Convert canvas to blob
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error("Failed to convert canvas to blob"));
          }
        }, "image/png");
      } catch (error) {
        reject(error);
      }
    });
  };

  const generateFileName = (rowData: Record<string, string>): string => {
    const name = fieldMappings["NAME"]
      ? rowData[fieldMappings["NAME"]]
      : "unnamed";
    const course = fieldMappings["COURSE"]
      ? rowData[fieldMappings["COURSE"]]
      : "no-course";
    const certId = generateCertificateId();

    return `${name}_${course}_${certId}`.replace(/[^a-zA-Z0-9_-]/g, "_");
  };

  const updateFieldMapping = (fieldName: string, csvHeader: string) => {
    const newMappings = { ...fieldMappings, [fieldName]: csvHeader };
    setFieldMappings(newMappings);

    // Regenerate sample preview with new mappings
    if (csvData.length > 0) {
      generateSamplePreview(csvData[0], newMappings);
    }
  };

  const getAvailableHeaders = () => {
    if (csvData.length === 0) return [];
    return Object.keys(csvData[0] || {});
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
          <CardTitle className="text-2xl">
            Bulk Certificate Generation
          </CardTitle>
          <CardDescription>
            Upload a CSV file to generate multiple certificates at once.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* CSV Upload and Configuration */}
            <div className="space-y-6">
              {/* CSV Upload */}
              <Card>
                <CardHeader>
                  <CardTitle>Upload CSV Data</CardTitle>
                </CardHeader>
                <CardContent>
                  <div
                    {...getCSVDropProps()}
                    className={`
                      border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
                      ${
                        isCSVDragActive
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-300 hover:border-gray-400 hover:bg-gray-50"
                      }
                    `}
                  >
                    <input {...getCSVInputProps()} />
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-lg font-medium text-gray-900">
                      {isCSVDragActive
                        ? "Drop CSV file here"
                        : "Drag & drop CSV file here"}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      or click to browse
                    </p>
                    <p className="text-xs text-gray-400 mt-2">
                      CSV should have headers: NAME, COURSE, DATE, etc.
                    </p>
                  </div>

                  {csvData.length > 0 && (
                    <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center space-x-2 text-green-800">
                        <CheckCircle className="h-5 w-5" />
                        <span>CSV loaded with {csvData.length} records</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Field Mappings */}
              {csvData.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Field Mappings</CardTitle>
                    <CardDescription>
                      Map your CSV columns to certificate fields. Special fields
                      like QR_CODE and CERT_ID are auto-generated.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {fields.map((field) => {
                      if (
                        field.name === "QR_CODE" ||
                        field.name === "CERT_ID"
                      ) {
                        return (
                          <div
                            key={field.id}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                          >
                            <div className="flex items-center space-x-2">
                              {field.name === "QR_CODE" && (
                                <QrCode className="h-4 w-4 text-blue-600" />
                              )}
                              {field.name === "CERT_ID" && (
                                <Hash className="h-4 w-4 text-green-600" />
                              )}
                              <span className="font-medium">{field.name}</span>
                              <Badge variant="outline">
                                {field.name === "QR_CODE"
                                  ? "Auto-generated QR"
                                  : "Auto-generated ID"}
                              </Badge>
                            </div>
                          </div>
                        );
                      }

                      return (
                        <div
                          key={field.id}
                          className="flex items-center justify-between"
                        >
                          <Label className="font-medium">{field.name}</Label>
                          <Select
                            value={fieldMappings[field.name] || ""}
                            onValueChange={(value) =>
                              updateFieldMapping(field.name, value)
                            }
                          >
                            <SelectTrigger className="w-48">
                              <SelectValue placeholder="Select CSV column" />
                            </SelectTrigger>
                            <SelectContent>
                              {getAvailableHeaders().map((header) => (
                                <SelectItem key={header} value={header}>
                                  {header}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>
              )}

              {/* Validation Errors */}
              {validationErrors.length > 0 && (
                <Card className="border-red-200 bg-red-50">
                  <CardHeader>
                    <CardTitle className="text-red-800">
                      Validation Errors
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {validationErrors.map((error, index) => (
                        <div
                          key={index}
                          className="flex items-center space-x-2 text-red-700"
                        >
                          <AlertTriangle className="h-4 w-4" />
                          <span className="text-sm">{error}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Output Format and Generate */}
              {csvData.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Generate Certificates</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
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
                          <SelectItem value="png">PNG Images</SelectItem>
                          <SelectItem value="pdf">PDF Documents</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Button
                      onClick={generateBulkCertificates}
                      disabled={isProcessing || validationErrors.length > 0}
                      className="w-full"
                      size="lg"
                    >
                      {isProcessing ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                          <span>Generating...</span>
                        </>
                      ) : (
                        <>
                          <Download className="h-5 w-5 mr-2" />
                          <span>Generate {csvData.length} Certificates</span>
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Preview and Status */}
            <div className="space-y-6">
              {/* Sample Certificate Preview */}
              {samplePreview && (
                <Card>
                  <CardHeader>
                    <CardTitle>Sample Certificate Preview</CardTitle>
                    <CardDescription>
                      Preview of how the first certificate will look
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={samplePreview}
                        alt="Sample Certificate"
                        className="w-full h-auto"
                      />
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Template Preview */}
              <Card>
                <CardHeader>
                  <CardTitle>Template Preview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={templateImageUrl}
                      alt="Certificate Template"
                      className="w-full h-auto"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Processing Status */}
              {isProcessing && (
                <Card>
                  <CardHeader>
                    <CardTitle>Processing Status</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                      <span className="text-blue-800">{processingStep}</span>
                    </div>
                    <Progress value={100} className="h-2" />
                  </CardContent>
                </Card>
              )}

              {/* CSV Preview */}
              {csvData.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>CSV Preview</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="min-w-full text-sm">
                        <thead>
                          <tr className="border-b">
                            {Object.keys(csvData[0] || {}).map((header) => (
                              <th
                                key={header}
                                className="text-left py-2 px-2 font-medium text-gray-700"
                              >
                                {header}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {csvData.slice(0, 5).map((row, index) => (
                            <tr key={index} className="border-b">
                              {Object.values(row).map((value, colIndex) => (
                                <td
                                  key={colIndex}
                                  className="py-2 px-2 text-gray-600"
                                >
                                  {value}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {csvData.length > 5 && (
                        <p className="text-xs text-gray-500 mt-2 text-center">
                          Showing first 5 of {csvData.length} records
                        </p>
                      )}
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
