"use client";

import Link from "next/link";
import { Home, Search, ArrowLeft, FileText, QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import Logo from "@/components/Logo";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900">
      {/* Header */}
      <header className="bg-white dark:bg-neutral-900 shadow-sm border-b border-neutral-200 dark:border-neutral-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <Logo size="md" />
            <nav className="flex items-center space-x-6">
              <Button variant="ghost" asChild>
                <Link
                  href="/verify"
                  className="text-neutral-600 dark:text-neutral-300 hover:text-blue-600 dark:hover:text-blue-400 px-3 py-2 rounded-md text-sm font-medium flex items-center space-x-2 transition-colors"
                >
                  <QrCode className="h-4 w-4" />
                  <span>Verify</span>
                </Link>
              </Button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          {/* 404 Icon */}
          <div className="mb-8">
            <div className="bg-red-100 dark:bg-red-900/30 p-6 rounded-full w-24 h-24 mx-auto flex items-center justify-center">
              <FileText className="h-12 w-12 text-red-600 dark:text-red-400" />
            </div>
          </div>

          {/* Error Message */}
          <h1 className="text-6xl font-bold text-red-600 dark:text-red-400 mb-4">
            404
          </h1>
          <h2 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">
            Page Not Found
          </h2>
          <p className="text-lg text-neutral-600 dark:text-neutral-400 mb-8 max-w-2xl mx-auto">
            Sorry, the page you&apos;re looking for doesn&apos;t exist. It might have been moved, deleted, or you entered the wrong URL.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4 mb-12">
            <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700">
              <Link href="/" className="flex items-center space-x-2">
                <Home className="h-5 w-5" />
                <span>Go to Homepage</span>
              </Link>
            </Button>
            
            <Button variant="outline" asChild size="lg">
              <Link href="/verify" className="flex items-center space-x-2">
                <Search className="h-5 w-5" />
                <span>Verify Certificate</span>
              </Link>
            </Button>
          </div>

          {/* Helpful Links */}
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg p-6 max-w-2xl mx-auto">
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
              What you can do:
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
              <div className="space-y-2">
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    <strong>Check the URL</strong> - Make sure you typed it correctly
                  </p>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    <strong>Go to Homepage</strong> - Start from the main page
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    <strong>Verify Certificate</strong> - Check certificate validity
                  </p>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    <strong>Use Navigation</strong> - Browse through the app
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Back Button */}
          <div className="mt-8">
            <Button
              variant="ghost"
              onClick={() => window.history.back()}
              className="text-neutral-600 dark:text-neutral-400 hover:text-blue-600 dark:hover:text-blue-400"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </Button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-800 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p className="text-neutral-600 dark:text-neutral-400 text-sm">
              © 2025 CertiGenie. All rights reserved. Developed by{" "}
              <span className="font-semibold text-blue-600 dark:text-blue-400">
                Rajarajeswari V
              </span>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
