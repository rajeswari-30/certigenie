"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { QrCode, ArrowRight, Shield, Clock, Moon, Sun } from "lucide-react";
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
import { useTheme } from "@/contexts/theme-context";

export default function VerifyLandingPage() {
  const [certId, setCertId] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();

  const handleVerify = async () => {
    if (certId.trim()) {
      setIsVerifying(true);
      // Small delay for better UX
      await new Promise((resolve) => setTimeout(resolve, 500));
      router.push(`/verify/${certId.trim()}`);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleVerify();
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header with Theme Toggle */}
        <div className="flex justify-between items-center mb-12">
          <Link
            href="/"
            className="text-neutral-600 dark:text-neutral-400 hover:text-blue-600 dark:hover:text-blue-400"
          >
            ← Back to Generator
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

        {/* Main Content */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="bg-blue-600 p-4 rounded-2xl shadow-lg">
              <QrCode className="h-12 w-12 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">
            Certificate Verification
          </h1>
          <p className="text-xl text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
            Verify the authenticity and validity of your certificates
          </p>
        </div>

        {/* Verification Form */}
        <Card className="max-w-2xl mx-auto mb-12 shadow-lg border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900">
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
              Enter Certificate ID
            </CardTitle>
            <CardDescription className="text-neutral-600 dark:text-neutral-400">
              Input your unique certificate identifier to begin verification
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 px-8 pb-8">
            <div className="space-y-2">
              <Label
                htmlFor="certId"
                className="text-sm font-medium text-neutral-700 dark:text-neutral-300"
              >
                Certificate ID
              </Label>
              <Input
                id="certId"
                type="text"
                value={certId}
                onChange={(e) => setCertId(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="e.g., CERT-2025-001"
                className="text-center text-lg h-14 border-2 border-neutral-300 dark:border-neutral-600 focus:border-blue-500 dark:focus:border-blue-400 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                disabled={isVerifying}
              />
            </div>

            <Button
              onClick={handleVerify}
              disabled={!certId.trim() || isVerifying}
              className="w-full h-14 text-lg font-semibold bg-blue-600 hover:bg-blue-700 text-white"
              size="lg"
            >
              {isVerifying ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Verifying...
                </>
              ) : (
                <>
                  <Shield className="h-5 w-5 mr-2" />
                  Verify Certificate
                  <ArrowRight className="h-5 w-5 ml-2" />
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <div className="text-center p-6">
            <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Shield className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
              Secure Verification
            </h3>
            <p className="text-neutral-600 dark:text-neutral-400">
              Advanced cryptographic verification ensures authenticity
            </p>
          </div>

          <div className="text-center p-6">
            <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <QrCode className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
              QR Code Support
            </h3>
            <p className="text-neutral-600 dark:text-neutral-400">
              Scan QR codes for instant verification
            </p>
          </div>

          <div className="text-center p-6">
            <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Clock className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
              Real-time Results
            </h3>
            <p className="text-neutral-600 dark:text-neutral-400">
              Instant verification with detailed results
            </p>
          </div>
        </div>

        {/* Demo Notice */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-full">
            <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <span className="text-sm text-blue-800 dark:text-blue-200">
              Demo Mode: Certificates stored locally in your browser
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
