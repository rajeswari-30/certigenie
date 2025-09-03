# CertiGenie - AI-Powered Certificate Generator

A comprehensive certificate generation and verification system with AI-powered token detection, QR code generation, and bulk processing capabilities.

## 🚀 Features

### Core Functionality

- **Multi-format Support**: Upload PDFs and images (PNG, JPG, etc.)
- **Smart Token Detection**: Automatically detects `{TOKEN_NAME}` placeholders
- **OCR Fallback**: Uses Tesseract.js when PDF text extraction fails
- **Color-based Detection**: Detects tokens designed in magenta (#FF00FF)

### Special Fields

- **QR_CODE**: Automatically generates QR codes linking to verification page
- **CERT_ID**: Generates unique certificate identifiers
- **Custom Tokens**: Support for any `{UPPERCASE_UNDERSCORE}` format

### Generation Options

- **Single Certificate**: Generate individual certificates with form inputs
- **Bulk Generation**: Process CSV files for multiple certificates
- **Output Formats**: PNG images or PDF documents
- **ZIP Export**: Bulk certificates packaged in downloadable ZIP files

### Verification System

- **QR Code Scanning**: Scan QR codes to verify certificates
- **Manual Verification**: Enter certificate IDs manually
- **Real-time Validation**: Instant verification results
- **Certificate Details**: View complete certificate information

## 🛠️ Technology Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS 4
- **PDF Processing**: PDF.js, pdf-parse
- **OCR**: Tesseract.js
- **QR Codes**: qrcode library
- **File Handling**: react-dropzone, JSZip
- **Icons**: Lucide React

## 📦 Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd certigenie
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Start development server**

   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000`

## 🎯 Usage Guide

### 1. Upload Template

- Drag & drop a PDF or image file
- Enable color detection if tokens are designed in magenta
- App automatically detects tokens like `{NAME}`, `{COURSE}`, `{DATE}`, etc.

### 2. Edit Tokens

- Review detected tokens
- Adjust positions, sizes, and formatting
- Add custom fields manually
- Configure special fields (QR_CODE, CERT_ID)

### 3. Generate Certificates

- **Single Generation**: Fill form fields and generate individual certificates
- **Bulk Generation**: Upload CSV with data and generate multiple certificates
- Choose output format (PNG/PDF)
- Download generated files

### 4. Verify Certificates

- Scan QR codes on certificates
- Enter certificate IDs manually
- View verification results and certificate details

## 📋 CSV Format for Bulk Generation

Your CSV should have headers that match your token names:

```csv
NAME,COURSE,DATE,INSTRUCTOR
John Doe,Data Structures,2025-01-15,Dr. Smith
Jane Smith,Algorithms,2025-01-16,Dr. Johnson
```

**Note**: `QR_CODE` and `CERT_ID` fields are automatically generated and don't need CSV columns.

## 🔧 Configuration

### Token Detection

- **PDF Text**: Primary method for PDFs with extractable text
- **OCR**: Fallback for images and flattened PDFs
- **Color Detection**: For tokens designed in magenta (#FF00FF)

### QR Code Settings

- **URL Format**: `https://certigenie.app/verify/{CERT_ID}`
- **Size**: 200x200 pixels (configurable)
- **Colors**: Black on white (customizable)

### Certificate ID Format

- **Pattern**: `CERT-{YEAR}-{RANDOM}`
- **Example**: `CERT-2025-001`

## 🏗️ Project Structure

```
src/
├── app/
│   ├── page.tsx              # Main application
│   ├── verify/
│   │   ├── page.tsx          # Verification landing
│   │   └── [certId]/page.tsx # Certificate verification
│   └── layout.tsx            # App layout
├── components/
│   ├── FileUpload.tsx        # File upload component
│   ├── TokenEditor.tsx       # Token editing interface
│   ├── CertificateGenerator.tsx # Single certificate generation
│   └── BulkGenerator.tsx     # Bulk certificate generation
├── lib/
│   ├── token-detection.ts    # Token detection utilities
│   ├── qr-generator.ts       # QR code generation
│   ├── pdf-processor.ts      # PDF processing utilities
│   └── ocr-processor.ts     # OCR processing utilities
└── types/
    └── index.ts              # TypeScript type definitions
```

## 🔒 Security & Verification

### MVP Implementation

- **Local Storage**: Certificates stored in browser localStorage
- **Demo Mode**: Suitable for college projects and demonstrations
- **Hash Verification**: Basic certificate validation

### Production Considerations

- **Database**: Supabase or similar for certificate storage
- **Digital Signatures**: Cryptographic verification
- **Access Control**: User authentication and authorization
- **Audit Logs**: Track certificate generation and verification

## 🚧 Development Status

### ✅ Completed Features

- File upload and processing
- Token detection (PDF text, OCR, color)
- Token editing interface
- Single certificate generation
- Bulk certificate generation
- QR code generation
- Certificate verification system
- Responsive UI design

### 🔄 Future Enhancements

- Advanced PDF processing
- Custom font support
- Template library
- User authentication
- Cloud storage integration
- Advanced verification methods
- Mobile app development

## 🎓 College Project Features

This MVP is perfect for college projects demonstrating:

- **AI/ML Integration**: OCR and token detection
- **Full-Stack Development**: Frontend + backend processing
- **Modern Web Technologies**: Next.js, React, TypeScript
- **Real-world Applications**: Certificate generation and verification
- **QR Code Technology**: Modern verification methods
- **Bulk Processing**: CSV handling and automation

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is open source and available under the MIT License.

## 🆘 Support

For questions or issues:

- Create an issue in the repository
- Check the documentation
- Review the code examples

---

Beny
**CertiGenie** - Making certificate generation smart, simple, and verifiable! 🎓✨
Rara
