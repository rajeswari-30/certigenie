"use client";

import { useState } from "react";
import { QrCode, Users } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { Field } from "@/types";
import FileUpload from "@/components/FileUpload";
import TokenEditor from "@/components/TokenEditor";
import CertificateGenerator from "@/components/CertificateGenerator";
import BulkGenerator from "@/components/BulkGenerator";
import Logo from "@/components/Logo";
import ThemeToggle from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

type AppStep = "upload" | "editor" | "generator" | "bulk";

export default function Home() {
  const [currentStep, setCurrentStep] = useState<AppStep>("upload");
  const [fields, setFields] = useState<Field[]>([]);
  const [templateImageUrl, setTemplateImageUrl] = useState<string>("");

  const handleTokensDetected = (detectedFields: Field[], imageUrl: string) => {
    if (detectedFields.length === 0) {
      // No tokens detected - show helpful toast but allow proceeding
      toast.info("No tokens detected", {
        description:
          "No tokens were detected in your template. You can proceed to add tokens manually, or ensure your template contains placeholders in the format {NAME}, {COURSE}, {DATE}, etc.",
        duration: 6000,
        action: {
          label: "Proceed Anyway",
          onClick: () => {
            setTemplateImageUrl(imageUrl);
            setFields([]);
            setCurrentStep("editor");
          },
        },
      });
      return;
    }

    setFields(detectedFields);
    setTemplateImageUrl(imageUrl);
    setCurrentStep("editor");

    // Show success toast
    toast.success("Tokens detected!", {
      description: `Found ${detectedFields.length} token(s) in your template.`,
      duration: 3000,
    });
  };

  const handleError = (message: string) => {
    toast.error("Upload Error", {
      description: message,
      duration: 6000,
    });
  };

  const handleGenerateCertificate = () => {
    setCurrentStep("generator");
  };

  const handleBulkGeneration = () => {
    setCurrentStep("bulk");
  };

  const handleBackToEditor = () => {
    setCurrentStep("editor");
  };

  const handleBackToUpload = () => {
    setCurrentStep("upload");
    setFields([]);
    setTemplateImageUrl("");
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case "upload":
        return (
          <div className="space-y-8">
            <FileUpload
              onTokensDetected={handleTokensDetected}
              onError={handleError}
            />

            {/* Guidelines Section */}
            <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-8">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Template Design Guidelines */}
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold text-blue-900 dark:text-blue-100 flex items-center">
                    <QrCode className="h-5 w-5 mr-2" />
                    Template Design Guidelines
                  </h2>
                  <div className="space-y-3 text-sm text-blue-800 dark:text-blue-200">
                    <div className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                      <p>
                        Use <strong>{`{UPPERCASE_UNDERSCORE}`}</strong> format
                        for placeholders (e.g., {"{NAME}"}, {"{COURSE}"},{" "}
                        {"{DATE}"})
                      </p>
                    </div>
                    <div className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                      <div className="flex-1">
                        <p>
                          Design tokens in <strong>magenta (#FF00FF)</strong>{" "}
                          for automatic color detection
                        </p>
                        <div className="flex items-center space-x-2 mt-2">
                          <div className="w-4 h-4 bg-[#FF00FF] rounded border border-gray-300 dark:border-gray-600"></div>
                          <code className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded font-mono">
                            #FF00FF
                          </code>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              navigator.clipboard.writeText("#FF00FF");
                              // You could add a toast notification here
                            }}
                            className="h-6 px-2 text-xs hover:bg-blue-50 dark:hover:bg-blue-950/30"
                          >
                            Copy
                          </Button>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                      <p>
                        Include <strong>{"{QR_CODE}"}</strong> and{" "}
                        <strong>{"{CERT_ID}"}</strong> fields for verification
                      </p>
                    </div>
                    <div className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                      <p>
                        Use high-quality images (PNG/JPG) or PDFs with clear
                        text
                      </p>
                    </div>
                  </div>
                </div>

                {/* How to Use */}
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold text-blue-900 dark:text-blue-100 flex items-center">
                    <Users className="h-5 w-5 mr-2" />
                    How to Use CertiGenie
                  </h2>
                  <div className="space-y-3 text-sm text-blue-800 dark:text-blue-200">
                    <div className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                      <p>
                        <strong>Step 1:</strong> Upload your certificate
                        template (PDF/PNG/JPG)
                      </p>
                    </div>
                    <div className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                      <p>
                        <strong>Step 2:</strong> Review and edit detected
                        tokens, add missing ones
                      </p>
                    </div>
                    <div className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                      <p>
                        <strong>Step 3:</strong> Generate single certificates or
                        bulk generate from CSV
                      </p>
                    </div>
                    <div className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                      <p>
                        <strong>Step 4:</strong> Download certificates and
                        verify them using QR codes
                      </p>
                    </div>
                  </div>
                </div>

                {/* Pro Tips */}
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold text-blue-900 dark:text-blue-100 flex items-center">
                    <QrCode className="h-5 w-5 mr-2" />
                    Pro Tips
                  </h2>
                  <div className="space-y-3 text-sm text-blue-800 dark:text-blue-200">
                    <div className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                      <p>
                        Use <strong>magenta tokens</strong> for auto-detection
                      </p>
                    </div>
                    <div className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                      <p>
                        CSV format: <strong>NAME,COURSE,DATE</strong>
                      </p>
                    </div>
                    <div className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                      <p>
                        Export as <strong>PNG for best quality</strong>
                      </p>
                    </div>
                    <div className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                      <p>
                        Verify certificates via <strong>QR codes</strong>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case "editor":
        return (
          <div className="space-y-8">
            <TokenEditor
              fields={fields}
              onFieldsChange={setFields}
              onGenerateCertificate={handleGenerateCertificate}
              templateImageUrl={templateImageUrl}
              onBack={handleBackToUpload}
            />

            <div className="text-center">
              <Button
                onClick={handleBulkGeneration}
                size="lg"
                className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Users className="h-5 w-5" />
                <span>Bulk Generation</span>
              </Button>
            </div>
          </div>
        );

      case "generator":
        return (
          <CertificateGenerator
            fields={fields}
            templateImageUrl={templateImageUrl}
            onBack={handleBackToEditor}
          />
        );

      case "bulk":
        return (
          <BulkGenerator
            fields={fields}
            templateImageUrl={templateImageUrl}
            onBack={handleBackToEditor}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-neutral-950">
      {/* Header */}
      <header className="bg-white dark:bg-neutral-900 shadow-sm border-b border-slate-200 dark:border-neutral-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-3">
              <Logo size="md" />
            </div>

            <nav className="flex items-center space-x-6">
              <Button variant="ghost" asChild>
                <Link
                  href="/verify"
                  className="text-slate-600 dark:text-neutral-300 hover:text-blue-600 dark:hover:text-blue-400 px-3 py-2 rounded-md text-sm font-medium flex items-center space-x-2 transition-colors"
                >
                  <QrCode className="h-4 w-4" />
                  <span>Verify</span>
                </Link>
              </Button>

              <ThemeToggle />
            </nav>
          </div>
        </div>
      </header>

      {/* Progress Steps */}
      <div className="bg-white dark:bg-neutral-900 border-b border-slate-200 dark:border-neutral-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center py-4">
            <div className="flex items-center space-x-4">
              <div
                className={`flex items-center space-x-2 ${
                  currentStep === "upload"
                    ? "text-blue-600 dark:text-blue-400"
                    : "text-slate-400 dark:text-neutral-500"
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    currentStep === "upload"
                      ? "bg-blue-600 dark:bg-blue-500 text-white"
                      : "bg-slate-200 dark:bg-neutral-800 text-slate-600 dark:text-neutral-400"
                  }`}
                >
                  1
                </div>
                <span className="font-medium">Upload Template</span>
              </div>

              <div className="w-16 h-0.5 bg-slate-200 dark:bg-neutral-800"></div>

              <div
                className={`flex items-center space-x-2 ${
                  currentStep === "editor"
                    ? "text-blue-600 dark:text-blue-400"
                    : "text-slate-400 dark:text-neutral-500"
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    currentStep === "editor"
                      ? "bg-blue-600 dark:bg-blue-500 text-white"
                      : "bg-slate-200 dark:bg-neutral-800 text-slate-600 dark:text-neutral-400"
                  }`}
                >
                  2
                </div>
                <span className="font-medium">Edit Tokens</span>
              </div>

              <div className="w-16 h-0.5 bg-slate-200 dark:bg-neutral-800"></div>

              <div
                className={`flex items-center space-x-2 ${
                  currentStep === "generator" || currentStep === "bulk"
                    ? "text-blue-600 dark:text-blue-400"
                    : "text-slate-400 dark:text-neutral-500"
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    currentStep === "generator" || currentStep === "bulk"
                      ? "bg-blue-600 dark:bg-blue-500 text-white"
                      : "bg-slate-200 dark:bg-neutral-800 text-slate-600 dark:text-neutral-400"
                  }`}
                >
                  3
                </div>
                <span className="font-medium">Generate</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderCurrentStep()}
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-neutral-900 border-t border-slate-200 dark:border-neutral-800 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Company Info */}
            <div className="col-span-1 md:col-span-2">
              <Logo size="lg" />
              <p className="mt-4 text-slate-600 dark:text-neutral-400 max-w-md">
                Generate, customize, and verify certificates with AI-powered
                token detection and QR code verification.
              </p>
            </div>

            {/* Features */}
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-neutral-100 uppercase tracking-wider mb-4">
                Features
              </h3>
              <ul className="space-y-2">
                <li className="text-slate-600 dark:text-neutral-400 text-sm">
                  PDF & Image Support
                </li>
                <li className="text-slate-600 dark:text-neutral-400 text-sm">
                  QR Code Verification
                </li>
                <li className="text-slate-600 dark:text-neutral-400 text-sm">
                  Bulk Generation
                </li>
                <li className="text-slate-600 dark:text-neutral-400 text-sm">
                  OCR & Color Detection
                </li>
                <li className="text-slate-600 dark:text-neutral-400 text-sm">
                  Token Auto-Detection
                </li>
                <li className="text-slate-600 dark:text-neutral-400 text-sm">
                  Local Storage
                </li>
              </ul>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-neutral-100 uppercase tracking-wider mb-4">
                Quick Links
              </h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/"
                    className="text-slate-600 dark:text-neutral-400 text-sm hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  >
                    Home
                  </Link>
                </li>
                <li>
                  <Link
                    href="/verify"
                    className="text-slate-600 dark:text-neutral-400 text-sm hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  >
                    Verify Certificate
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <Separator className="my-8" />

          {/* Copyright */}
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-center md:text-left">
              <p className="text-slate-600 dark:text-neutral-400 text-sm">
                © 2025 CertiGenie. All rights reserved. Developed by{" "}
                <span className="font-semibold text-blue-600 dark:text-blue-400">
                  Rajarajeswari V
                </span>
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
