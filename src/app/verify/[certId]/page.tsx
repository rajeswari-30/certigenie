"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  QrCode,
  CheckCircle,
  XCircle,
  Download,
  ArrowLeft,
  Calendar,
  FileText,
  ExternalLink,
  Moon,
  Sun,
} from "lucide-react";
import { StoredCertificate } from "@/lib/certificate-storage";
import { getCertificateDetails } from "@/lib/certificate-storage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTheme } from "@/contexts/theme-context";

export default function VerifyPage() {
  const params = useParams();
  const [certificate, setCertificate] = useState<StoredCertificate | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    if (params.certId) {
      verifyCertificate(params.certId as string);
    }
  }, [params.certId]);

  const verifyCertificate = async (id: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const foundCertificate = getCertificateDetails(id);

      if (foundCertificate) {
        setCertificate(foundCertificate);
        setIsValid(true);
      } else {
        setIsValid(false);
        setError("Certificate not found");
      }
    } catch {
      setError("Failed to verify certificate");
      setIsValid(false);
    } finally {
      setIsLoading(false);
    }
  };

  const downloadCertificate = () => {
    if (!certificate) return;

    // Create a simple certificate image for download
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d")!;

    canvas.width = 800;
    canvas.height = 600;

    // Background
    ctx.fillStyle = "#f8fafc";
    ctx.fillRect(0, 0, 800, 600);

    // Border
    ctx.strokeStyle = "#1e40af";
    ctx.lineWidth = 3;
    ctx.strokeRect(10, 10, 780, 580);

    // Title
    ctx.fillStyle = "#1e40af";
    ctx.font = "bold 32px Arial";
    ctx.textAlign = "center";
    ctx.fillText("Certificate of Completion", 400, 80);

    // Certificate details
    ctx.fillStyle = "#374151";
    ctx.font = "20px Arial";
    ctx.textAlign = "left";
    let y = 150;

    Object.entries(certificate.values).forEach(([key, value]) => {
      if (key !== "QR_CODE" && key !== "CERT_ID") {
        ctx.fillText(`${key.replace(/_/g, " ")}: ${value}`, 100, y);
        y += 40;
      }
    });

    // Certificate ID
    ctx.fillText(`Certificate ID: ${certificate.certId}`, 100, y + 20);
    ctx.fillText(
      `Issued: ${new Date(certificate.issuedAt).toLocaleDateString()}`,
      100,
      y + 60
    );

    // Download
    const link = document.createElement("a");
    link.download = `certificate_${certificate.certId}.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header with Theme Toggle */}
        <div className="flex justify-between items-center mb-8">
          <Link
            href="/verify"
            className="text-neutral-600 dark:text-neutral-400 hover:text-blue-600 dark:hover:text-blue-400"
          >
            <ArrowLeft className="h-5 w-5 mr-2 inline" />
            Back to Verification
          </Link>
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleTheme}
            className="w-9 px-0"
            title={`Switch to ${theme === "light" ? "dark" : "light"} theme`}
          >
            <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 dark:border-neutral-700 dark:border-t-blue-400 mx-auto mb-6"></div>
            <h3 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
              Verifying Certificate
            </h3>
            <p className="text-neutral-600 dark:text-neutral-400">
              Please wait while we validate your certificate...
            </p>
          </div>
        )}

        {/* Valid Certificate Result */}
        {!isLoading && isValid === true && certificate && (
          <div className="space-y-8">
            {/* Success Header */}
            <div className="text-center">
              <div className="bg-green-600 p-4 rounded-2xl inline-flex mb-6 shadow-lg">
                <CheckCircle className="h-12 w-12 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-green-800 dark:text-green-400 mb-3">
                Valid Certificate
              </h2>
              <p className="text-green-600 dark:text-green-400 text-lg">
                This certificate has been verified and is authentic.
              </p>
            </div>

            {/* Certificate Details */}
            <Card className="border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-neutral-900 dark:text-neutral-100">
                  <FileText className="h-5 w-5 text-neutral-600 dark:text-neutral-400" />
                  <span>Certificate Details</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Dynamic Fields */}
                {Object.entries(certificate.values).map(([key, value]) => {
                  if (key !== "QR_CODE" && key !== "CERT_ID") {
                    return (
                      <div
                        key={key}
                        className="flex justify-between items-center p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg"
                      >
                        <span className="font-medium text-neutral-700 dark:text-neutral-300">
                          {key.replace(/_/g, " ")}
                        </span>
                        <span className="text-neutral-900 dark:text-neutral-100 font-medium">
                          {value}
                        </span>
                      </div>
                    );
                  }
                  return null;
                })}

                {/* Static Fields */}
                <div className="flex justify-between items-center p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                  <span className="font-medium text-neutral-700 dark:text-neutral-300">
                    Certificate ID
                  </span>
                  <Badge
                    variant="outline"
                    className="text-green-600 dark:text-green-400 font-mono text-sm px-3 py-1"
                  >
                    {certificate.certId}
                  </Badge>
                </div>

                <div className="flex justify-between items-center p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                  <span className="font-medium text-neutral-700 dark:text-neutral-300 flex items-center">
                    <Calendar className="h-4 w-4 mr-2" />
                    Issued on
                  </span>
                  <span className="text-neutral-900 dark:text-neutral-100 font-medium">
                    {new Date(certificate.issuedAt).toLocaleDateString()}
                  </span>
                </div>

                <div className="flex justify-between items-center p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                  <span className="font-medium text-neutral-700 dark:text-neutral-300">
                    Template
                  </span>
                  <span className="text-neutral-900 dark:text-neutral-100 font-medium">
                    {certificate.templateName}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Verification URL */}
            <Card className="border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <QrCode className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  <span className="font-semibold text-neutral-900 dark:text-neutral-100 text-lg">
                    Verification URL
                  </span>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                  <p className="text-sm text-blue-700 dark:text-blue-300 break-all flex-1 font-mono">
                    {certificate.verifyUrl}
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(certificate.verifyUrl)}
                    className="shrink-0"
                  >
                    Copy
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-4">
              <Button
                onClick={downloadCertificate}
                className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white"
                size="lg"
              >
                <Download className="h-5 w-5" />
                <span>Download Certificate</span>
              </Button>

              <Button
                variant="outline"
                onClick={() => window.open(certificate.verifyUrl, "_blank")}
                className="flex items-center space-x-2"
                size="lg"
              >
                <ExternalLink className="h-5 w-5" />
                <span>Open Verification URL</span>
              </Button>
            </div>
          </div>
        )}

        {/* Invalid Certificate Result */}
        {!isLoading && isValid === false && (
          <div className="text-center py-16">
            <div className="bg-red-600 p-4 rounded-2xl inline-flex mb-6 shadow-lg">
              <XCircle className="h-12 w-12 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-red-800 dark:text-red-400 mb-3">
              Invalid Certificate
            </h2>
            <p className="text-red-600 dark:text-red-400 text-lg mb-6">
              {error ||
                "This certificate could not be verified or does not exist."}
            </p>

            <div className="inline-flex items-center space-x-2 px-4 py-2 bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 rounded-full">
              <span className="text-yellow-800 dark:text-yellow-200 text-sm">
                If you believe this is an error, please contact the certificate
                issuer.
              </span>
            </div>
          </div>
        )}

        {/* Demo Mode Notice */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-full">
            <span className="text-blue-800 dark:text-blue-200 text-sm">
              Demo Mode: Certificates stored locally in your browser
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
