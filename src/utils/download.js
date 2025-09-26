// Download utilities for Tranzora translation app

/**
 * Downloads text content as a plain text file
 * @param {string} content - The text content to download
 * @param {string} filename - The name of the file to download
 */
export const downloadAsText = (content, filename = "translated-document.txt") => {
  const element = document.createElement("a")
  const file = new Blob([content], { type: "text/plain;charset=utf-8" })
  element.href = URL.createObjectURL(file)
  element.download = filename
  document.body.appendChild(element)
  element.click()
  document.body.removeChild(element)
  URL.revokeObjectURL(element.href)
}

/**
 * Downloads content as a simulated PDF (actually a text file with PDF extension)
 * In a real implementation, this would use a PDF generation library
 * @param {string} content - The text content to download
 * @param {string} filename - The name of the file to download
 */
export const downloadAsPDF = (content, filename = "translated-document.pdf") => {
  // For demo purposes, we'll create a formatted text file
  const formattedContent = `
TRANZORA - AI TRANSLATION RESULT
================================

Document: ${filename.replace(".pdf", "")}
Generated: ${new Date().toLocaleString()}
Translation Engine: Tranzora AI v1.0

TRANSLATED CONTENT:
-------------------

${content}

-------------------
End of Translation

This is a demo version. In production, this would be a properly formatted PDF document.
`

  const element = document.createElement("a")
  const file = new Blob([formattedContent], { type: "application/pdf" })
  element.href = URL.createObjectURL(file)
  element.download = filename
  document.body.appendChild(element)
  element.click()
  document.body.removeChild(element)
  URL.revokeObjectURL(element.href)
}

/**
 * Downloads content as a simulated DOCX (actually a text file with DOCX extension)
 * In a real implementation, this would use a DOCX generation library
 * @param {string} content - The text content to download
 * @param {string} filename - The name of the file to download
 */
export const downloadAsDOCX = (content, filename = "translated-document.docx") => {
  // For demo purposes, we'll create a formatted text file
  const formattedContent = `
TRANZORA - AI TRANSLATION RESULT

Document: ${filename.replace(".docx", "")}
Generated: ${new Date().toLocaleString()}
Translation Engine: Tranzora AI v1.0

TRANSLATED CONTENT:

${content}

---
This is a demo version. In production, this would be a properly formatted DOCX document.
`

  const element = document.createElement("a")
  const file = new Blob([formattedContent], {
    type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  })
  element.href = URL.createObjectURL(file)
  element.download = filename
  document.body.appendChild(element)
  element.click()
  document.body.removeChild(element)
  URL.revokeObjectURL(element.href)
}

/**
 * Simulates file reading and text extraction
 * In a real implementation, this would use libraries like PDF.js or mammoth.js
 * @param {File} file - The file to extract text from
 * @returns {Promise<string>} - Promise that resolves to extracted text
 */
export const extractTextFromFile = (file) => {
  return new Promise((resolve) => {
    // Simulate processing time
    setTimeout(() => {
      const fileType = file.type
      let mockContent = ""

      if (fileType.includes("pdf")) {
        mockContent = `Sample PDF content from ${file.name}

This is a demonstration of text extraction from a PDF file. In a real implementation, this would use PDF.js or similar library to extract actual text content from the PDF document.

The extracted text would include:
- All readable text from the document
- Proper formatting and structure
- Tables and lists where applicable

Original language: Nepali/Sinhala
Ready for AI translation processing...`
      } else if (fileType.includes("word") || fileType.includes("document")) {
        mockContent = `Sample Word document content from ${file.name}

This is a demonstration of text extraction from a Word document. In a real implementation, this would use mammoth.js or similar library to extract actual text content from the DOCX/DOC file.

The extracted content would preserve:
- Document structure and formatting
- Headers and paragraphs
- Lists and tables
- Special characters and symbols

Original language: Nepali/Sinhala
Ready for AI translation processing...`
      } else {
        mockContent = `Sample document content from ${file.name}

This is a generic text extraction simulation. The actual implementation would handle various file formats and extract their textual content for translation.

Original language: Nepali/Sinhala
Ready for AI translation processing...`
      }

      resolve(mockContent)
    }, 1000) // Simulate 1 second processing time
  })
}

/**
 * Simulates AI translation processing
 * In a real implementation, this would call an actual translation API
 * @param {string} text - The text to translate
 * @param {string} sourceLang - Source language (default: 'auto')
 * @param {string} targetLang - Target language (default: 'en')
 * @returns {Promise<string>} - Promise that resolves to translated text
 */
export const translateText = (text, sourceLang = "auto", targetLang = "en") => {
  return new Promise((resolve) => {
    // Simulate AI processing time
    setTimeout(() => {
      // For demo purposes, we'll create a mock translation
      const translatedText = `[AI TRANSLATED FROM ${sourceLang.toUpperCase()} TO ${targetLang.toUpperCase()}]

ORIGINAL TEXT ANALYSIS:
- Detected language: ${sourceLang === "auto" ? "Nepali/Sinhala" : sourceLang}
- Text length: ${text.length} characters
- Processing method: Advanced Neural Translation

TRANSLATED CONTENT:
${text.split("").reverse().join("").toUpperCase()}

TRANSLATION CONFIDENCE: 95.7%
PROCESSING TIME: 2.3 seconds

Note: This is a demonstration translation. In production, this would be processed by advanced AI translation models specifically trained for Nepali and Sinhala languages.

Quality assurance checks:
✓ Grammar and syntax verification
✓ Context preservation
✓ Cultural nuance adaptation
✓ Technical terminology accuracy

Translation completed successfully.`

      resolve(translatedText)
    }, 2000) // Simulate 2 seconds processing time
  })
}

/**
 * Validates file type for translation
 * @param {File} file - The file to validate
 * @returns {boolean} - True if file type is supported
 */
export const isValidFileType = (file) => {
  const supportedTypes = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ]

  return supportedTypes.includes(file.type)
}

/**
 * Formats file size for display
 * @param {number} bytes - File size in bytes
 * @returns {string} - Formatted file size string
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return "0 Bytes"

  const k = 1024
  const sizes = ["Bytes", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
}

/**
 * Generates a unique ID for translations
 * @returns {string} - Unique identifier
 */
export const generateTranslationId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}
