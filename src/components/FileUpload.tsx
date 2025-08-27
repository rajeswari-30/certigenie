"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { FileText, Image } from "lucide-react";
import { Field } from "@/types";
import {
  extractTextPositionsFromPDF,
  convertPDFToImage,
  isPDFFile,
  isImageFile,
} from "@/lib/pdf-processor";
import { detectTokensInImage } from "@/lib/ocr-processor";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface FileUploadProps {
  onTokensDetected: (fields: Field[], imageUrl: string) => void;
  onError: (message: string) => void;
}

export default function FileUpload({
  onTokensDetected,
  onError,
}: FileUploadProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState<string>("");

  const processFile = useCallback(
    async (file: File) => {
      setIsProcessing(true);
      setProcessingStep("Analyzing file...");

      try {
        let fields: Field[] = [];
        let imageUrl: string;

        if (isPDFFile(file)) {
          setProcessingStep("Extracting text from PDF...");

          try {
            // First try to extract text and detect tokens
            const text = await extractTextPositionsFromPDF(file);
            if (text.length > 0) {
              fields = text;
              setProcessingStep("Converting PDF to image...");
              imageUrl = await convertPDFToImage(file);
            } else {
              throw new Error("No text found in PDF");
            }
          } catch {
            setProcessingStep("Text extraction failed, trying OCR...");
            // Fallback to OCR
            imageUrl = await convertPDFToImage(file);
            fields = await detectTokensInImage(file);
          }
        } else if (isImageFile(file)) {
          setProcessingStep("Processing image with OCR...");
          imageUrl = URL.createObjectURL(file);
          fields = await detectTokensInImage(file);
        } else {
          throw new Error(
            "Unsupported file type. Please upload a PDF or image file."
          );
        }

        setProcessingStep("Processing complete!");
        onTokensDetected(fields, imageUrl);
      } catch (error) {
        console.error("Error processing file:", error);
        onError(
          error instanceof Error ? error.message : "Failed to process file"
        );
      } finally {
        setIsProcessing(false);
        setProcessingStep("");
      }
    },
    [onTokensDetected, onError]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        processFile(acceptedFiles[0]);
      }
    },
    accept: {
      "application/pdf": [".pdf"],
      "image/*": [".png", ".jpg", ".jpeg", ".gif", ".bmp", ".webp"],
    },
    multiple: false,
  });

  return (
    <div className="w-full max-w-2xl mx-auto">
      <Card className="border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-neutral-900 dark:text-neutral-100">
            Upload Certificate Template
          </CardTitle>
          <CardDescription className="text-neutral-600 dark:text-neutral-400">
            Upload a PDF or image file. The app will automatically detect tokens
            like {"{NAME}"}, {"{COURSE}"}, {"{DATE}"}, etc.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Dropzone */}
          <div
            {...getRootProps()}
            className={`
              border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
              ${
                isDragActive
                  ? "border-blue-500 bg-blue-50 dark:bg-blue-950/30"
                  : "border-neutral-300 dark:border-neutral-600 hover:border-neutral-400 dark:hover:border-neutral-500 hover:bg-neutral-50 dark:hover:bg-neutral-800/50"
              }
              ${isProcessing ? "pointer-events-none opacity-50" : ""}
            `}
          >
            <input {...getInputProps()} />

            {isProcessing ? (
              <div className="space-y-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-neutral-600 dark:text-neutral-400">
                  {processingStep}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-center space-x-4">
                  <FileText className="h-12 w-12 text-neutral-400 dark:text-neutral-500" />
                  <Image className="h-12 w-12 text-neutral-400 dark:text-neutral-500" />
                </div>
                <div>
                  <p className="text-lg font-medium text-neutral-900 dark:text-neutral-100">
                    {isDragActive
                      ? "Drop your file here"
                      : "Drag & drop your file here"}
                  </p>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                    or click to browse
                  </p>
                </div>
                <p className="text-xs text-neutral-400 dark:text-neutral-500">
                  Supports PDF, PNG, JPG, and other image formats
                </p>
              </div>
            )}
          </div>

          {/* Processing Status */}
          {isProcessing && (
            <Card className="bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  <span className="text-sm text-blue-800 dark:text-blue-300">
                    {processingStep}
                  </span>
                </div>
                <Progress value={100} className="h-2" />
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
