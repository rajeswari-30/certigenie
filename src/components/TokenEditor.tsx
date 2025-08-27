"use client";

import { useState, useEffect } from "react";
import {
  Edit,
  Trash2,
  Plus,
  QrCode,
  Hash,
  Save,
  Search,
  Filter,
  Settings,
  Type,
  Move,
  Copy,
  Check,
  AlertCircle,
  Sparkles,
  ArrowLeft,
  Upload,
  Layout,
} from "lucide-react";
import { Field } from "@/types";
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { createNewTemplate, saveTemplate } from "@/lib/certificate-storage";

interface TokenEditorProps {
  fields: Field[];
  onFieldsChange: (fields: Field[]) => void;
  onGenerateCertificate: () => void;
  templateImageUrl: string;
  onBack?: () => void;
}

export default function TokenEditor({
  fields,
  onFieldsChange,
  onGenerateCertificate,
  templateImageUrl,
  onBack,
}: TokenEditorProps) {
  const [editingField, setEditingField] = useState<string | null>(null);
  const [newFieldName, setNewFieldName] = useState("");
  const [templateName, setTemplateName] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<"all" | "text" | "qr">("all");
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Auto-generate template name on first load
  useEffect(() => {
    if (!templateName && fields.length > 0) {
      setTemplateName(`Template ${new Date().toLocaleDateString()}`);
    }
  }, [fields, templateName]);

  // Filter fields based on search and type
  const filteredFields = fields.filter((field) => {
    const matchesSearch = field.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all" || field.type === filterType;
    return matchesSearch && matchesType;
  });

  const addField = () => {
    if (newFieldName.trim() && /^[A-Z_]+$/.test(newFieldName.trim())) {
      const newField: Field = {
        id: `field_manual_${Date.now()}`,
        name: newFieldName.trim(),
        type:
          newFieldName.trim() === "QR_CODE" || newFieldName.trim() === "CERT_ID"
            ? "qr"
            : "text",
        x: 100,
        y: 100,
        width: 150,
        height: 30,
        fontFamily: "Arial",
        fontSize: 16,
        fontWeight: "normal",
        fontStyle: "normal",
        textAlign: "left",
        textColor: "#000000",
        lineHeight: 20,
        source: "manual",
        bboxMask: { x: 0, y: 0, w: 0, h: 0 },
      };

      onFieldsChange([...fields, newField]);
      setNewFieldName("");
    }
  };

  const updateField = (fieldId: string, updates: Partial<Field>) => {
    const updatedFields = fields.map((field) =>
      field.id === fieldId ? { ...field, ...updates } : field
    );
    onFieldsChange(updatedFields);
  };

  const deleteField = (fieldId: string) => {
    const updatedFields = fields.filter((field) => field.id !== fieldId);
    onFieldsChange(updatedFields);
  };

  const duplicateField = (field: Field) => {
    const duplicatedField: Field = {
      ...field,
      id: `field_duplicate_${Date.now()}`,
      name: `${field.name}_COPY`,
      x: field.x + 20,
      y: field.y + 20,
    };
    onFieldsChange([...fields, duplicatedField]);
    setCopiedField(duplicatedField.id);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const saveTemplateToStorage = async () => {
    if (!templateName.trim() || fields.length === 0) {
      setSaveMessage(
        "Please provide a template name and ensure fields are configured."
      );
      return;
    }

    setIsSaving(true);
    try {
      const template = createNewTemplate(
        fields,
        templateImageUrl,
        templateName.trim()
      );
      saveTemplate(template);
      setSaveMessage("Template saved successfully! ✓");

      setTimeout(() => setSaveMessage(""), 3000);
    } catch {
      setSaveMessage("Failed to save template. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const getFieldIcon = (field: Field) => {
    if (field.name === "QR_CODE")
      return <QrCode className="h-5 w-5 text-emerald-600" />;
    if (field.name === "CERT_ID")
      return <Hash className="h-5 w-5 text-purple-600" />;
    return <Type className="h-5 w-5 text-slate-600" />;
  };

  const getFieldTypeLabel = (field: Field) => {
    if (field.name === "QR_CODE") return "QR Code Field";
    if (field.name === "CERT_ID") return "Certificate ID Field";
    return "Text Field";
  };

  const getSourceBadge = (source: string) => {
    const variants: Record<
      string,
      "default" | "secondary" | "destructive" | "outline"
    > = {
      "pdf-text": "default",
      ocr: "secondary",
      manual: "outline",
      color: "secondary",
    };

    const labels: Record<string, string> = {
      "pdf-text": "PDF Text",
      ocr: "OCR Detected",
      manual: "Manual",
      color: "Color Detected",
    };

    return (
      <Badge variant={variants[source] || "outline"}>
        {labels[source] || source}
      </Badge>
    );
  };

  const getFieldStats = () => {
    const textFields = fields.filter((f) => f.type === "text").length;
    const qrFields = fields.filter((f) => f.type === "qr").length;
    const autoDetected = fields.filter((f) => f.source !== "manual").length;
    const manualAdded = fields.filter((f) => f.source === "manual").length;

    return { textFields, qrFields, autoDetected, manualAdded };
  };

  const stats = getFieldStats();

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-slate-50 to-neutral-50 dark:from-slate-900 dark:to-neutral-900 rounded-xl border border-slate-200 dark:border-slate-800 p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-3">
              Edit Token Fields
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl">
              Configure and customize the detected placeholders for your
              certificate template. Set fonts, colors, positioning, and styling
              for each field.
            </p>
          </div>
          {onBack && (
            <Button
              variant="outline"
              onClick={onBack}
              className="flex items-center space-x-2 px-6 py-3 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Upload</span>
            </Button>
          )}
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-slate-800 rounded-lg p-5 border border-slate-200 dark:border-slate-700 shadow-sm">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Type className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  Text Fields
                </p>
                <p className="text-2xl font-bold text-blue-600">
                  {stats.textFields}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-lg p-5 border border-slate-200 dark:border-slate-700 shadow-sm">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                <QrCode className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  QR Fields
                </p>
                <p className="text-2xl font-bold text-emerald-600">
                  {stats.qrFields}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-lg p-5 border border-slate-200 dark:border-slate-700 shadow-sm">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <Sparkles className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  Auto-Detected
                </p>
                <p className="text-2xl font-bold text-purple-600">
                  {stats.autoDetected}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-lg p-5 border border-slate-200 dark:border-slate-700 shadow-sm">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                <Edit className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  Manual
                </p>
                <p className="text-2xl font-bold text-orange-600">
                  {stats.manualAdded}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Action Section */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="flex-1">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
              Ready to Generate?
            </h2>
            <p className="text-slate-600 dark:text-slate-400">
              Configure your fields and generate certificates with custom
              styling
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-4">
            {onBack && (
              <Button
                variant="outline"
                onClick={onBack}
                className="flex items-center space-x-2 px-6 py-3 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                <Upload className="h-4 w-4" />
                <span>Upload New Template</span>
              </Button>
            )}
            {fields.length > 0 && (
              <Button
                onClick={onGenerateCertificate}
                size="lg"
                className="px-8 py-3 text-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg"
              >
                <Sparkles className="h-5 w-5 mr-2" />
                Generate Certificate
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Template Management */}
      <Card className="border border-slate-200 dark:border-slate-800 shadow-sm">
        <CardHeader className="bg-slate-50 dark:bg-slate-800/50">
          <CardTitle className="text-xl flex items-center space-x-2 text-slate-900 dark:text-slate-100">
            <Save className="h-5 w-5 text-emerald-600" />
            <span>Template Management</span>
          </CardTitle>
          <CardDescription className="text-slate-600 dark:text-slate-400">
            Save your template configuration for future use
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4">
            <div className="flex-1">
              <Label
                htmlFor="templateName"
                className="text-sm font-medium text-slate-700 dark:text-slate-300"
              >
                Template Name
              </Label>
              <Input
                id="templateName"
                type="text"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                placeholder="Enter a descriptive name for your template"
                className="mt-2 border-slate-300 dark:border-slate-600"
              />
            </div>
            <Button
              onClick={saveTemplateToStorage}
              disabled={isSaving || !templateName.trim() || fields.length === 0}
              className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 px-6 py-2"
            >
              <Save className="h-4 w-4" />
              <span>{isSaving ? "Saving..." : "Save Template"}</span>
            </Button>
          </div>

          {saveMessage && (
            <div
              className={`mt-4 p-3 rounded-lg text-sm ${
                saveMessage.includes("successfully")
                  ? "bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-200 dark:border-emerald-700"
                  : "bg-red-50 text-red-800 border border-red-200 dark:bg-red-950/30 dark:text-red-200 dark:border-red-700"
              }`}
            >
              {saveMessage}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add New Field Section */}
      <Card className="border border-slate-200 dark:border-slate-800 shadow-sm">
        <CardHeader className="bg-slate-50 dark:bg-slate-800/50">
          <CardTitle className="text-xl flex items-center space-x-2 text-slate-900 dark:text-slate-100">
            <Plus className="h-5 w-5 text-orange-600" />
            <span>Add New Token Field</span>
          </CardTitle>
          <CardDescription className="text-slate-600 dark:text-slate-400">
            Create custom placeholder fields for your certificate
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4">
            <div className="flex-1">
              <Label
                htmlFor="newFieldName"
                className="text-sm font-medium text-slate-700 dark:text-slate-300"
              >
                Field Name
              </Label>
              <Input
                id="newFieldName"
                type="text"
                value={newFieldName}
                onChange={(e) => setNewFieldName(e.target.value.toUpperCase())}
                placeholder="Enter token name (e.g., COMPANY_NAME)"
                pattern="[A-Z_]+"
                title="Only uppercase letters and underscores allowed"
                className="mt-2 border-slate-300 dark:border-slate-600"
              />
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                Token names must be UPPERCASE with underscores only
              </p>
            </div>
            <Button
              onClick={addField}
              disabled={
                !newFieldName.trim() || !/^[A-Z_]+$/.test(newFieldName.trim())
              }
              className="flex items-center space-x-2 bg-orange-600 hover:bg-orange-700 px-6 py-2"
            >
              <Plus className="h-4 w-4" />
              <span>Add Field</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Template Preview */}
      <Card className="border border-slate-200 dark:border-slate-800 shadow-sm">
        <CardHeader className="bg-slate-50 dark:bg-slate-800/50">
          <CardTitle className="text-xl flex items-center space-x-2 text-slate-900 dark:text-slate-100">
            <Layout className="h-5 w-5 text-slate-600" />
            <span>Template Preview</span>
          </CardTitle>
          <CardDescription className="text-slate-600 dark:text-slate-400">
            View your uploaded template to see where tokens are positioned
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden bg-white dark:bg-slate-900">
            <img
              src={templateImageUrl}
              alt="Certificate Template"
              className="w-full h-auto max-h-96 object-contain"
            />
          </div>
          <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
            <p className="text-sm text-slate-600 dark:text-slate-400 text-center">
              💡 <strong>Tip:</strong> Use this preview to see where your
              detected tokens are positioned and adjust their coordinates if
              needed
            </p>
          </div>
        </CardContent>
      </Card>

      {/* QR Code & Certificate ID Management */}
      <Card className="border border-slate-200 dark:border-slate-800 shadow-sm">
        <CardHeader className="bg-slate-50 dark:bg-slate-800/50">
          <CardTitle className="text-xl flex items-center space-x-2 text-slate-900 dark:text-slate-100">
            <QrCode className="h-5 w-5 text-emerald-600" />
            <span>QR Code & Certificate ID</span>
          </CardTitle>
          <CardDescription className="text-slate-600 dark:text-slate-400">
            Manage QR codes and certificate identifiers for verification
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-6">
            {/* Auto-Detection Status */}
            <div className="p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-start space-x-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
                  <Hash className="h-4 w-4 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                    Auto-Detection Status
                  </h4>
                  <div className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
                    <div className="flex items-center space-x-2">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          fields.some((f) => f.name === "QR_CODE")
                            ? "bg-green-500"
                            : "bg-gray-400"
                        }`}
                      ></div>
                      <span>
                        QR Code Placeholder:{" "}
                        {fields.some((f) => f.name === "QR_CODE")
                          ? "Detected ✓"
                          : "Not Found"}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          fields.some((f) => f.name === "CERT_ID")
                            ? "bg-green-500"
                            : "bg-gray-400"
                        }`}
                      ></div>
                      <span>
                        Certificate ID Placeholder:{" "}
                        {fields.some((f) => f.name === "CERT_ID")
                          ? "Detected ✓"
                          : "Not Found"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Manual Placement Options */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* QR Code Placement */}
              <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 rounded-lg border border-emerald-200 dark:border-emerald-800">
                <div className="flex items-center space-x-2 mb-3">
                  <QrCode className="h-4 w-4 text-emerald-600" />
                  <h4 className="font-medium text-emerald-900 dark:text-emerald-100">
                    QR Code Placement
                  </h4>
                </div>
                <p className="text-sm text-emerald-800 dark:text-emerald-200 mb-3">
                  {fields.some((f) => f.name === "QR_CODE")
                    ? "QR code placeholder detected in template"
                    : "No QR code placeholder found"}
                </p>
                {!fields.some((f) => f.name === "QR_CODE") && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const newField: Field = {
                        id: `field_qr_${Date.now()}`,
                        name: "QR_CODE",
                        type: "qr",
                        x: 100,
                        y: 100,
                        width: 80,
                        height: 80,
                        fontFamily: "Arial",
                        fontSize: 16,
                        fontWeight: "normal",
                        fontStyle: "normal",
                        textAlign: "center",
                        textColor: "#000000",
                        lineHeight: 20,
                        source: "manual",
                        bboxMask: { x: 0, y: 0, w: 0, h: 0 },
                      };
                      onFieldsChange([...fields, newField]);
                    }}
                    className="w-full border-emerald-300 dark:border-emerald-700 text-emerald-600 hover:bg-emerald-100 dark:hover:bg-emerald-900/50"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add QR Code Field
                  </Button>
                )}
              </div>

              {/* Certificate ID Placement */}
              <div className="p-4 bg-purple-50 dark:bg-purple-950/30 rounded-lg border border-purple-200 dark:border-purple-800">
                <div className="flex items-center space-x-2 mb-3">
                  <Hash className="h-4 w-4 text-purple-600" />
                  <h4 className="font-medium text-purple-900 dark:text-purple-100">
                    Certificate ID Placement
                  </h4>
                </div>
                <p className="text-sm text-purple-800 dark:text-purple-200 mb-3">
                  {fields.some((f) => f.name === "CERT_ID")
                    ? "Certificate ID placeholder detected in template"
                    : "No Certificate ID placeholder found"}
                </p>
                {!fields.some((f) => f.name === "CERT_ID") && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const newField: Field = {
                        id: `field_cert_id_${Date.now()}`,
                        name: "CERT_ID",
                        type: "qr",
                        x: 100,
                        y: 200,
                        width: 150,
                        height: 30,
                        fontFamily: "Arial",
                        fontSize: 16,
                        fontWeight: "normal",
                        fontStyle: "normal",
                        textAlign: "left",
                        textColor: "#000000",
                        lineHeight: 20,
                        source: "manual",
                        bboxMask: { x: 0, y: 0, w: 0, h: 0 },
                      };
                      onFieldsChange([...fields, newField]);
                    }}
                    className="w-full border-purple-300 dark:border-purple-700 text-purple-600 hover:bg-purple-100 dark:hover:bg-purple-900/50"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Certificate ID Field
                  </Button>
                )}
              </div>
            </div>

            {/* Information Panel */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
              <div className="flex items-start space-x-3">
                <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded-lg">
                  <Settings className="h-4 w-4 text-slate-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-slate-900 dark:text-slate-100 mb-2">
                    How It Works
                  </h4>
                  <div className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
                    <div className="flex items-start space-x-2">
                      <div className="w-1.5 h-1.5 bg-slate-400 rounded-full mt-2 flex-shrink-0"></div>
                      <span>
                        <strong>QR Code:</strong> Automatically generates a QR
                        code linking to{" "}
                        <code className="bg-slate-200 dark:bg-slate-700 px-1 rounded">
                          certigenie.app/verify/{`{CERT_ID}`}
                        </code>
                      </span>
                    </div>
                    <div className="flex items-start space-x-2">
                      <div className="w-1.5 h-1.5 bg-slate-400 rounded-full mt-2 flex-shrink-0"></div>
                      <span>
                        <strong>Certificate ID:</strong> Generates unique
                        identifier like{" "}
                        <code className="bg-slate-200 dark:bg-slate-700 px-1 rounded">
                          CERT-2025-0001
                        </code>
                      </span>
                    </div>
                    <div className="flex items-start space-x-2">
                      <div className="w-1.5 h-1.5 bg-slate-400 rounded-full mt-2 flex-shrink-0"></div>
                      <span>
                        <strong>Verification:</strong> Anyone can scan QR code
                        to verify certificate authenticity
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Token Detection Status */}
      {fields.length === 0 && (
        <Card className="border-yellow-200 bg-yellow-50 dark:bg-yellow-950/30 dark:border-yellow-800">
          <CardContent className="p-8 text-center">
            <div className="text-yellow-800 dark:text-yellow-200">
              <AlertCircle className="h-12 w-12 mx-auto mb-4 text-yellow-600" />
              <h3 className="text-xl font-semibold mb-3">
                No Placeholders Detected
              </h3>
              <p className="text-base mb-4">
                No tokens were found in your template. You can add fields
                manually above.
              </p>
              <div className="bg-yellow-100 dark:bg-yellow-900/50 p-4 rounded-lg max-w-md mx-auto">
                <p className="text-sm font-medium mb-2">💡 Design Tips:</p>
                <ul className="text-sm space-y-1 text-left">
                  <li>
                    • Use{" "}
                    <code className="bg-yellow-200 dark:bg-yellow-800 px-1 rounded">{`{UPPERCASE_UNDERSCORE}`}</code>{" "}
                    format
                  </li>
                  <li>
                    • Examples:{" "}
                    <code className="bg-yellow-200 dark:bg-yellow-800 px-1 rounded">{`{NAME}`}</code>
                    ,{" "}
                    <code className="bg-yellow-200 dark:bg-yellow-800 px-1 rounded">{`{COURSE}`}</code>
                    ,{" "}
                    <code className="bg-yellow-200 dark:bg-yellow-800 px-1 rounded">{`{DATE}`}</code>
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Masking Information */}
      <Card className="border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/30">
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
              <Settings className="h-4 w-4 text-blue-600" />
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                Automatic Text Masking
              </h4>
              <div className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
                <div className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span>
                    <strong>Always Active:</strong> Original placeholder text
                    (like{" "}
                    <code className="bg-blue-200 dark:bg-blue-800 px-1 rounded">{`{NAME}`}</code>
                    ) is automatically hidden
                  </span>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span>
                    <strong>Clean Preview:</strong> See exactly how your final
                    certificate will look
                  </span>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span>
                    <strong>No Confusion:</strong> Text replacement
                    automatically handles masking for you
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Token Editor */}
      <Card className="border border-slate-200 dark:border-slate-800 shadow-sm">
        <CardHeader className="bg-slate-50 dark:bg-slate-800/50">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-xl flex items-center space-x-2 text-slate-900 dark:text-slate-100">
                <Layout className="h-5 w-5 text-slate-600" />
                <span>Token Fields Configuration</span>
              </CardTitle>
              <CardDescription className="text-slate-600 dark:text-slate-400">
                Manage and customize your certificate placeholders
              </CardDescription>
            </div>
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search fields..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-48 border-slate-300 dark:border-slate-600"
                />
              </div>
              <Select
                value={filterType}
                onValueChange={(value: "all" | "text" | "qr") =>
                  setFilterType(value)
                }
              >
                <SelectTrigger className="w-32 border-slate-300 dark:border-slate-600">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="text">Text Only</SelectItem>
                  <SelectItem value="qr">QR Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {/* Fields List */}
          <div className="space-y-4">
            {filteredFields.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                <Search className="h-8 w-8 mx-auto mb-3 text-slate-400" />
                <p className="text-base font-medium">No fields found</p>
                <p className="text-sm">
                  Try adjusting your search or filter criteria
                </p>
              </div>
            ) : (
              filteredFields.map((field) => (
                <Card
                  key={field.id}
                  className="border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-colors"
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4 flex-1">
                        <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-lg">
                          {getFieldIcon(field)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-3">
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                              {field.name}
                            </h3>
                            {getSourceBadge(field.source)}
                          </div>
                          <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                            {getFieldTypeLabel(field)}
                          </p>
                          {field.sample && (
                            <p className="text-xs text-slate-500 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded inline-block">
                              Sample: {field.sample}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => duplicateField(field)}
                                className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 border-emerald-300 dark:border-emerald-700"
                                title="Duplicate field"
                              >
                                {copiedField === field.id ? (
                                  <Check className="h-4 w-4" />
                                ) : (
                                  <Copy className="h-4 w-4" />
                                )}
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Duplicate this field</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>

                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  setEditingField(
                                    editingField === field.id ? null : field.id
                                  )
                                }
                                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950/30 border-blue-300 dark:border-blue-700"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Edit field properties</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>

                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => deleteField(field.id)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30 border-red-300 dark:border-red-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Delete this field</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </div>

                    {/* Field Properties Editor */}
                    {editingField === field.id && (
                      <div className="mt-6 p-6 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700 space-y-6">
                        <div className="flex items-center space-x-2 mb-4">
                          <Settings className="h-5 w-5 text-slate-600" />
                          <h4 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                            Field Properties
                          </h4>
                        </div>

                        {/* Position and Size */}
                        <div>
                          <h5 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-4 flex items-center space-x-2">
                            <Move className="h-4 w-4" />
                            <span>Position & Size</span>
                          </h5>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                              <Label
                                htmlFor={`x-${field.id}`}
                                className="text-sm text-slate-600 dark:text-slate-400"
                              >
                                X Position
                              </Label>
                              <Input
                                id={`x-${field.id}`}
                                type="number"
                                value={field.x}
                                onChange={(e) =>
                                  updateField(field.id, {
                                    x: parseInt(e.target.value) || 0,
                                  })
                                }
                                className="mt-2 border-slate-300 dark:border-slate-600"
                              />
                            </div>
                            <div>
                              <Label
                                htmlFor={`y-${field.id}`}
                                className="text-sm text-slate-600 dark:text-slate-400"
                              >
                                Y Position
                              </Label>
                              <Input
                                id={`y-${field.id}`}
                                type="number"
                                value={field.y}
                                onChange={(e) =>
                                  updateField(field.id, {
                                    y: parseInt(e.target.value) || 0,
                                  })
                                }
                                className="mt-2 border-slate-300 dark:border-slate-600"
                              />
                            </div>
                            <div>
                              <Label
                                htmlFor={`width-${field.id}`}
                                className="text-sm text-slate-600 dark:text-slate-400"
                              >
                                Width
                              </Label>
                              <Input
                                id={`width-${field.id}`}
                                type="number"
                                value={field.width}
                                onChange={(e) =>
                                  updateField(field.id, {
                                    width: parseInt(e.target.value) || 0,
                                  })
                                }
                                className="mt-2 border-slate-300 dark:border-slate-600"
                              />
                            </div>
                            <div>
                              <Label
                                htmlFor={`height-${field.id}`}
                                className="text-sm text-slate-600 dark:text-slate-400"
                              >
                                Height
                              </Label>
                              <Input
                                id={`height-${field.id}`}
                                type="number"
                                value={field.height}
                                onChange={(e) =>
                                  updateField(field.id, {
                                    height: parseInt(e.target.value) || 0,
                                  })
                                }
                                className="mt-2 border-slate-300 dark:border-slate-600"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Typography */}
                        <div>
                          <h5 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-4 flex items-center space-x-2">
                            <Type className="h-4 w-4" />
                            <span>Typography</span>
                          </h5>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            <div>
                              <Label
                                htmlFor={`fontFamily-${field.id}`}
                                className="text-sm text-slate-600 dark:text-slate-400"
                              >
                                Font Family
                              </Label>
                              <Select
                                value={field.fontFamily || "Arial"}
                                onValueChange={(value) =>
                                  updateField(field.id, {
                                    fontFamily: value,
                                  })
                                }
                              >
                                <SelectTrigger className="mt-2 border-slate-300 dark:border-slate-600">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Arial">
                                    Arial (Sans Serif)
                                  </SelectItem>
                                  <SelectItem value="Times New Roman">
                                    Times New Roman (Serif)
                                  </SelectItem>
                                  <SelectItem value="Helvetica">
                                    Helvetica (Sans Serif)
                                  </SelectItem>
                                  <SelectItem value="Georgia">
                                    Georgia (Serif)
                                  </SelectItem>
                                  <SelectItem value="Verdana">
                                    Verdana (Sans Serif)
                                  </SelectItem>
                                  <SelectItem value="Courier New">
                                    Courier New (Monospace)
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label
                                htmlFor={`fontSize-${field.id}`}
                                className="text-sm text-slate-600 dark:text-slate-400"
                              >
                                Font Size
                              </Label>
                              <Input
                                id={`fontSize-${field.id}`}
                                type="number"
                                value={field.fontSize || 16}
                                onChange={(e) =>
                                  updateField(field.id, {
                                    fontSize: parseInt(e.target.value) || 16,
                                  })
                                }
                                className="mt-2 border-slate-300 dark:border-slate-600"
                              />
                            </div>
                            <div>
                              <Label
                                htmlFor={`fontWeight-${field.id}`}
                                className="text-sm text-slate-600 dark:text-slate-400"
                              >
                                Font Weight
                              </Label>
                              <Select
                                value={field.fontWeight || "normal"}
                                onValueChange={(value) =>
                                  updateField(field.id, {
                                    fontWeight: value as "normal" | "bold",
                                  })
                                }
                              >
                                <SelectTrigger className="mt-2 border-slate-300 dark:border-slate-600">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="normal">Normal</SelectItem>
                                  <SelectItem value="bold">Bold</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label
                                htmlFor={`fontStyle-${field.id}`}
                                className="text-sm text-slate-600 dark:text-slate-400"
                              >
                                Font Style
                              </Label>
                              <Select
                                value={field.fontStyle || "normal"}
                                onValueChange={(value) =>
                                  updateField(field.id, {
                                    fontStyle: value as "normal" | "italic",
                                  })
                                }
                              >
                                <SelectTrigger className="mt-2 border-slate-300 dark:border-slate-600">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="normal">Normal</SelectItem>
                                  <SelectItem value="italic">Italic</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label
                                htmlFor={`textAlign-${field.id}`}
                                className="text-sm text-slate-600 dark:text-slate-400"
                              >
                                Text Align
                              </Label>
                              <Select
                                value={field.textAlign || "left"}
                                onValueChange={(value) =>
                                  updateField(field.id, {
                                    textAlign: value as
                                      | "left"
                                      | "center"
                                      | "right",
                                  })
                                }
                              >
                                <SelectTrigger className="mt-2 border-slate-300 dark:border-slate-600">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="left">Left</SelectItem>
                                  <SelectItem value="center">Center</SelectItem>
                                  <SelectItem value="right">Right</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label
                                htmlFor={`textColor-${field.id}`}
                                className="text-sm text-slate-600 dark:text-slate-400"
                              >
                                Text Color
                              </Label>
                              <div className="flex items-center space-x-2 mt-2">
                                <Input
                                  id={`textColor-${field.id}`}
                                  type="color"
                                  value={field.textColor || "#000000"}
                                  onChange={(e) =>
                                    updateField(field.id, {
                                      textColor: e.target.value,
                                    })
                                  }
                                  className="w-12 h-10 p-1 border rounded border-slate-300 dark:border-slate-600"
                                />
                                <Input
                                  type="text"
                                  value={field.textColor || "#000000"}
                                  onChange={(e) =>
                                    updateField(field.id, {
                                      textColor: e.target.value,
                                    })
                                  }
                                  className="flex-1 border-slate-300 dark:border-slate-600"
                                  placeholder="#000000"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* No Fields Message */}
          {fields.length === 0 && (
            <div className="text-center py-12 text-slate-500">
              <Layout className="h-12 w-12 mx-auto mb-4 text-slate-400" />
              <p className="text-lg font-medium mb-2">
                No tokens configured yet
              </p>
              <p className="text-base">
                Upload a template file to get started or add fields manually
                above
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
