import { Field } from "@/types";
import { generateCertificateId, generateVerifyUrl } from "./token-detection";

const STORAGE_KEY = "certigenie_certificates";
const TEMPLATES_KEY = "certigenie_templates";

export interface StoredTemplate {
  id: string;
  name: string;
  fields: Field[];
  imageUrl: string;
  createdAt: string;
  lastModified: string;
}

export interface StoredCertificate {
  certId: string;
  templateId: string;
  values: Record<string, string>;
  verifyUrl: string;
  issuedAt: string;
  templateName: string;
}

// Template Management
export function saveTemplate(template: StoredTemplate): void {
  try {
    const existingTemplates = getTemplates();
    const updatedTemplates = existingTemplates.filter(
      (t) => t.id !== template.id
    );
    updatedTemplates.push(template);

    localStorage.setItem(TEMPLATES_KEY, JSON.stringify(updatedTemplates));
  } catch (error) {
    console.error("Error saving template:", error);
  }
}

export function getTemplates(): StoredTemplate[] {
  try {
    const stored = localStorage.getItem(TEMPLATES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error("Error getting templates:", error);
    return [];
  }
}

export function getTemplateById(id: string): StoredTemplate | null {
  const templates = getTemplates();
  return templates.find((t) => t.id === id) || null;
}

export function deleteTemplate(id: string): void {
  try {
    const templates = getTemplates();
    const updatedTemplates = templates.filter((t) => t.id !== id);
    localStorage.setItem(TEMPLATES_KEY, JSON.stringify(updatedTemplates));
  } catch (error) {
    console.error("Error deleting template:", error);
  }
}

// Certificate Management
export function saveCertificate(certificate: StoredCertificate): void {
  try {
    const existingCertificates = getCertificates();
    const updatedCertificates = existingCertificates.filter(
      (c) => c.certId !== certificate.certId
    );
    updatedCertificates.push(certificate);

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedCertificates));
  } catch (error) {
    console.error("Error saving certificate:", error);
  }
}

export function getCertificates(): StoredCertificate[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error("Error getting certificates:", error);
    return [];
  }
}

export function getCertificateById(certId: string): StoredCertificate | null {
  const certificates = getCertificates();
  return certificates.find((c) => c.certId === certId) || null;
}

export function deleteCertificate(certId: string): void {
  try {
    const certificates = getCertificates();
    const updatedCertificates = certificates.filter((c) => c.certId !== certId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedCertificates));
  } catch (error) {
    console.error("Error deleting certificate:", error);
  }
}

// Helper functions
export function createNewTemplate(
  fields: Field[],
  imageUrl: string,
  name?: string
): StoredTemplate {
  // Ensure all fields have required font properties
  const processedFields = fields.map((field) => ({
    ...field,
    fontFamily: field.fontFamily || "Arial",
    fontSize: field.fontSize || 16,
    fontWeight: field.fontWeight || "normal",
    fontStyle: field.fontStyle || "normal",
    textAlign: field.textAlign || "left",
    textColor: field.textColor || "#000000",
    lineHeight: field.lineHeight || (field.fontSize || 16) * 1.2,
  }));

  return {
    id: `template_${Date.now()}`,
    name: name || `Template ${new Date().toLocaleDateString()}`,
    fields: processedFields,
    imageUrl,
    createdAt: new Date().toISOString(),
    lastModified: new Date().toISOString(),
  };
}

export function createNewCertificate(
  templateId: string,
  templateName: string,
  values: Record<string, string>
): StoredCertificate {
  const certId = generateCertificateId();

  return {
    certId,
    templateId,
    values,
    verifyUrl: generateVerifyUrl(certId),
    issuedAt: new Date().toISOString(),
    templateName,
  };
}

// Validation
export function validateCertificate(certId: string): boolean {
  const certificate = getCertificateById(certId);
  return certificate !== null;
}

export function getCertificateDetails(
  certId: string
): StoredCertificate | null {
  return getCertificateById(certId);
}

// Cleanup
export function clearAllData(): void {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(TEMPLATES_KEY);
}

export function getStorageStats(): { templates: number; certificates: number } {
  return {
    templates: getTemplates().length,
    certificates: getCertificates().length,
  };
}
