import React, { useState, useEffect, useRef } from "react"
import { useTranslation } from "../utils/TranslationContext"
import Loader from "../components/Loader"
import {
  FaUpload,
  FaFilePdf,
  FaFileWord,
  FaFileAlt,
  FaImage,
  FaCloudUploadAlt,
  FaCheckCircle,
  FaRobot,
  FaTimes,
  FaDownload,
  FaGlobe,
  FaFileImage,
} from "react-icons/fa"
import { MdTranslate, MdDocumentScanner } from "react-icons/md"
import { ChevronDown, Sparkles } from "lucide-react"

import Prism from "../components/Prism"
import { jsPDF } from "jspdf"
import { Document, Packer, Paragraph, TextRun } from "docx"
import { saveAs } from "file-saver"
import "./Home.css"
import Footer from "../components/Footer"

const languages = [
  { code: "english", name: "English", flag: "🇺🇸" },
  { code: "spanish", name: "Spanish", flag: "🇪🇸" },
  { code: "french", name: "French", flag: "🇫🇷" },
  { code: "german", name: "German", flag: "🇩🇪" },
  { code: "italian", name: "Italian", flag: "🇮🇹" },
  { code: "portuguese", name: "Portuguese", flag: "🇵🇹" },
  { code: "russian", name: "Russian", flag: "🇷🇺" },
  { code: "japanese", name: "Japanese", flag: "🇯🇵" },
  { code: "chinese", name: "Chinese", flag: "🇨🇳" },
  { code: "korean", name: "Korean", flag: "🇰🇷" },
  { code: "hindi", name: "Hindi", flag: "🇮🇳" },
  { code: "arabic", name: "Arabic", flag: "🇸🇦" },
]

const Home = () => {
  const {
    file,
    setFile,
    isProcessing,
    setIsProcessing,
    originalText,
    setOriginalText,
    translatedText,
    setTranslatedText,
    isImageFile,
    setIsImageFile,
    addToHistory,
  } = useTranslation()

  const [isDragOver, setIsDragOver] = useState(false)
  const [isCompact, setIsCompact] = useState(false)
  const [selectedLanguage, setSelectedLanguage] = useState("english")
  const [showDownloadModal, setShowDownloadModal] = useState(false)
  const [currentProgress, setCurrentProgress] = useState(0)
  const [showLanguageSelect, setShowLanguageSelect] = useState(false)
  const [documentStructure, setDocumentStructure] = useState(null)
  const [layoutPreserved, setLayoutPreserved] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const fileInputRef = useRef(null)
  const previewRef = useRef(null)

  useEffect(() => {
    const checkMobile = () => {
      const mobile =
        window.innerWidth <= 768 ||
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
      setIsMobile(mobile)
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  useEffect(() => {
    setIsCompact(!!(file || isProcessing || translatedText))
  }, [file, isProcessing, translatedText])

  useEffect(() => {
    if (translatedText && previewRef.current) {
      previewRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [translatedText])

  const isValidFileType = (file) => {
    const docTypes = /\.(pdf|doc|docx|txt)$/i
    const imgTypes = /\.(jpg|jpeg|png|gif|bmp|webp)$/i
    return docTypes.test(file.name) || imgTypes.test(file.name)
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const handleFileSelect = (selectedFile) => {
    if (selectedFile && isValidFileType(selectedFile)) {
      setFile(selectedFile)
      setTranslatedText("")
      setOriginalText("")
      setDocumentStructure(null)
      setLayoutPreserved(false)
      setIsImageFile(selectedFile.type.startsWith("image/"))
    } else {
      alert("Please select a valid document or image file.")
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragOver(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0])
    }
  }

  const processFile = async () => {
    if (!file) return
    setIsProcessing(true)
    setCurrentProgress(0)

    try {
      setCurrentProgress(25)
      await new Promise((r) => setTimeout(r, 800))

      setCurrentProgress(50)
      await new Promise((r) => setTimeout(r, 800))

      setCurrentProgress(75)
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch(
        `http://209.182.232.43:3000/translate-text?target_language=${selectedLanguage}&preserve_layout=true`,
        {
          method: "POST",
          body: formData,
          mode: "cors",
        },
      )

      if (!response.ok) throw new Error(`API Error: ${response.status}`)

      const result = await response.json()
      const translationData = result?.translation_data
      const pages = translationData?.pages || []

      if (pages.length > 0) {
        const originalTexts = pages.map((page) => page.original_text || "").join("\n\n")
        const translatedTexts = pages.map((page) => page.translated_text || "").join("\n\n")
        const hasLayout = pages.some((page) => page.layout_elements && page.layout_elements.length > 0)

        if (hasLayout) {
          setDocumentStructure({
            pages: pages.map((page, index) => ({
              pageNumber: index + 1,
              layoutElements: page.layout_elements || [],
              originalText: page.original_text || "",
              translatedText: page.translated_text || "",
            })),
          })
          setLayoutPreserved(true)
        }

        setOriginalText(originalTexts.replace(/\\n/g, "\n"))
        setTranslatedText(translatedTexts.replace(/\\n/g, "\n"))
      } else {
        const original = result?.translation_data?.original_text || "Original text not available."
        const translated = result?.translation_data?.translated_text || "⚠️ No translated text found."

        setOriginalText(original.replace(/\\n/g, "\n"))
        setTranslatedText(translated.replace(/\\n/g, "\n"))
      }

      setCurrentProgress(100)
      await new Promise((r) => setTimeout(r, 600))
    } catch (error) {
      console.error("Translation error:", error)
      setOriginalText("Could not retrieve original text.")
      setTranslatedText("⚠️ Translation failed. Please try again later.")
    } finally {
      setIsProcessing(false)
    }
  }

  const createHistoryItemAndDownload = async (downloadFunction, format) => {
    if (!file || !translatedText) return

    addToHistory({
      id: Date.now(),
      fileName: file.name,
      date: new Date().toISOString(),
      originalText,
      translatedText,
      documentStructure,
      layoutPreserved,
    })

    await downloadFunction()
    setShowDownloadModal(false)
  }

  const resetUpload = () => {
    setFile(null)
    setTranslatedText("")
    setOriginalText("")
    setDocumentStructure(null)
    setLayoutPreserved(false)
    setIsImageFile(false)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const getFileIcon = () => {
    if (!file) return <FaUpload className="upload-icon" />
    if (isImageFile) return <FaImage className="file-type-icon" />

    const extension = file.name.split(".").pop().toLowerCase()
    switch (extension) {
      case "pdf":
        return <FaFilePdf className="file-type-icon" />
      case "doc":
      case "docx":
        return <FaFileWord className="file-type-icon" />
      case "txt":
        return <FaFileAlt className="file-type-icon" />
      default:
        return <FaUpload className="file-type-icon" />
    }
  }

  const selectedLang = languages.find((l) => l.code === selectedLanguage)

  const handleDownloadTxt = () => {
    let content = translatedText
    if (layoutPreserved && documentStructure) {
      content = documentStructure.pages
        .map((page) => `--- Page ${page.pageNumber} ---\n\n${page.translatedText}`)
        .join("\n\n")
    }
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" })
    saveAs(blob, `translation_${selectedLanguage}.txt`)
  }

  const handleDownloadPDF = () => {
    const doc = new jsPDF({ orientation: "p", unit: "pt", format: "a4" })
    doc.setFont("helvetica", "bold")
    doc.setFontSize(18)
    doc.text("Translation Result", 40, 60)
    doc.setFont("helvetica", "normal")
    doc.setFontSize(12)
    doc.setTextColor(100)
    doc.text(`Language: ${selectedLang?.name || "Unknown"}`, 40, 80)
    doc.text(`File: ${file?.name || "Unknown"}`, 40, 95)

    if (layoutPreserved && documentStructure) {
      let yPosition = 130
      documentStructure.pages.forEach((page, pageIndex) => {
        if (pageIndex > 0) {
          doc.addPage()
          yPosition = 60
        }
        doc.setTextColor(150)
        doc.setFontSize(10)
        doc.text(`Page ${page.pageNumber}`, 40, yPosition)
        yPosition += 30
        doc.setTextColor(20)
        doc.setFontSize(11)
        const textLines = doc.splitTextToSize(page.translatedText, 500)
        doc.text(textLines, 40, yPosition)
      })
    } else {
      doc.setTextColor(20)
      doc.setFontSize(11)
      const textLines = doc.splitTextToSize(translatedText, 500)
      doc.text(textLines, 40, 130)
    }
    doc.save(`translation_${selectedLanguage}.pdf`)
  }

  const handleDownloadDOCX = async () => {
    let docSections = []
    if (layoutPreserved && documentStructure) {
      const paragraphs = [
        new Paragraph({ children: [new TextRun({ text: "Translation Result", bold: true, size: 32 })] }),
        new Paragraph({ children: [new TextRun({ text: `Language: ${selectedLang?.name || "Unknown"}`, italics: true, size: 24 })] }),
        new Paragraph({ children: [new TextRun({ text: `File: ${file?.name || "Unknown"}`, italics: true, size: 24 })] }),
        new Paragraph({}),
      ]
      documentStructure.pages.forEach((page, pageIndex) => {
        if (pageIndex > 0) paragraphs.push(new Paragraph({ pageBreakBefore: true }))
        paragraphs.push(new Paragraph({ children: [new TextRun({ text: `Page ${page.pageNumber}`, bold: true, size: 24 })] }))
        paragraphs.push(new Paragraph({}))
        page.translatedText.split("\n").forEach((line) => {
          paragraphs.push(new Paragraph({ children: [new TextRun({ text: line, size: 22 })] }))
        })
      })
      docSections = paragraphs
    } else {
      const paragraphs = translatedText.split("\n").map((line) => new Paragraph({ children: [new TextRun({ text: line, size: 22 })] }))
      docSections = [
        new Paragraph({ children: [new TextRun({ text: "Translation Result", bold: true, size: 32 })] }),
        new Paragraph({ children: [new TextRun({ text: `Language: ${selectedLang?.name || "Unknown"}`, italics: true, size: 24 })] }),
        new Paragraph({}),
        ...paragraphs,
      ]
    }
    const doc = new Document({ sections: [{ children: docSections }] })
    const blob = await Packer.toBlob(doc)
    saveAs(blob, `translation_${selectedLanguage}.docx`)
  }

  const renderPreservedLayout = () => {
    if (!layoutPreserved || !documentStructure) {
      return <pre className="translated-text-content">{translatedText}</pre>
    }
    return (
      <div className="document-layout-container">
        {documentStructure.pages.map((page, pageIndex) => (
          <div key={pageIndex} className="document-page">
            <div className="page-header">
              <span className="page-number">Page {page.pageNumber}</span>
              <span>Layout Preserved</span>
            </div>
            <div className="layout-preserved-content">
              {page.layoutElements && page.layoutElements.length > 0 ? (
                page.layoutElements.map((element, elemIndex) => (
                  <div key={elemIndex} className={`text-block ${element.type || "paragraph"}`}>
                    {element.translatedText || element.text}
                  </div>
                ))
              ) : (
                <div className="layout-preserved-content">{page.translatedText}</div>
              )}
            </div>
          </div>
        ))}
      </div>
    )
  }

  const uploadAreaClasses = ["upload-area", isCompact && "compact", isDragOver && "drag-over", file && !isProcessing && "file-selected", isProcessing && "processing"].filter(Boolean).join(" ")

  return (
    <div className="page-container">
        <div className="background-effects">
            <div style={{ width: "100vw", height: "100vh", position: "absolute", inset: 0 }}>
                <Prism
                    animationType="hover"
                    timeScale={0.5}
                    height={isMobile ? 5 : 5}
                    baseWidth={isMobile ? 3 : 5.5}
                    scale={isMobile ? 3 : 3.6}
                    hueShift={0}
                    colorFrequency={isMobile ? 0.2 : 1}
                    noise={isMobile ? 0.2 : 0.5}
                    glow={isMobile ? 0.5 : 1}
                />
            </div>
        </div>
        <main className="main-scroll-container">
            <section className="ai-translation-section">
                <div className="main-container">
                    {!translatedText && (
                        <header className={`header-section ${isCompact ? "compact" : ""}`}>
                            <p className={`subtitle ${isCompact ? "compact" : ""}`}>AI-Powered Translation Magic</p>
                            <div className="tagline">
                                <Sparkles className="sparkle-icon" />
                                Upload • Translate • Download
                                <Sparkles className="sparkle-icon" />
                            </div>
                        </header>
                    )}

                    {translatedText && (
                        <div ref={previewRef} className="results-preview-container">
                            <div className="preview-card">
                                <div className="preview-header">
                                    <div className="preview-header-text">
                                        <MdTranslate className="preview-translate-icon" />
                                        <div>
                                            <h3 className="preview-title">Translation Result</h3>
                                            <p className="preview-language-info">
                                                Translated to {selectedLang?.flag} {selectedLang?.name}
                                                {layoutPreserved && " • Layout Preserved"}
                                            </p>
                                        </div>
                                    </div>
                                    <button onClick={() => setShowDownloadModal(true)} className="btn btn-primary">
                                        <FaDownload /> Download
                                    </button>
                                </div>
                                <div className="document-content-wrapper">{renderPreservedLayout()}</div>
                            </div>
                            <div className="action-buttons-container">
                                <button onClick={resetUpload} className="btn btn-secondary">
                                    <FaUpload /> Translate New Document
                                </button>
                            </div>
                        </div>
                    )}

                    {showDownloadModal && (
                        <div className="modal-overlay" onClick={() => setShowDownloadModal(false)}>
                            <div className="download-modal" onClick={(e) => e.stopPropagation()}>
                                <div className="modal-header">
                                    <h3>Download Translation</h3>
                                    <button className="close-modal" onClick={() => setShowDownloadModal(false)}>
                                        <FaTimes />
                                    </button>
                                </div>
                                <div className="download-options">
                                    <div className="download-option txt" onClick={() => createHistoryItemAndDownload(handleDownloadTxt, "TXT")}>
                                        <FaFileAlt className="download-icon" />
                                        <div className="download-info">
                                            <strong>Plain Text</strong>
                                            <p>.txt file {layoutPreserved ? "• Layout preserved" : ""}</p>
                                        </div>
                                    </div>
                                    <div className="download-option pdf" onClick={() => createHistoryItemAndDownload(handleDownloadPDF, "PDF")}>
                                        <FaFilePdf className="download-icon" />
                                        <div className="download-info">
                                            <strong>PDF Document</strong>
                                            <p>.pdf file {layoutPreserved ? "• Layout preserved" : ""}</p>
                                        </div>
                                    </div>
                                    <div className="download-option docx" onClick={() => createHistoryItemAndDownload(handleDownloadDOCX, "DOCX")}>
                                        <FaFileWord className="download-icon" />
                                        <div className="download-info">
                                            <strong>Word Document</strong>
                                            <p>.docx file {layoutPreserved ? "• Layout preserved" : ""}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {!translatedText && (
                        <div className="main-content-card">
                            {file && !isProcessing && (
                                <div className="language-selection-container">
                                    <FaGlobe className="globe-icon" />
                                    <span>Translate to:</span>
                                    <div className="language-select-wrapper">
                                        <button onClick={() => setShowLanguageSelect(!showLanguageSelect)} className="language-select-button">
                                            <span>{selectedLang?.flag}</span>
                                            <span>{selectedLang?.name}</span>
                                            <ChevronDown size={16} />
                                        </button>
                                        {showLanguageSelect && (
                                            <div className="language-dropdown">
                                                {languages.map((lang) => (
                                                    <button key={lang.code} onClick={() => { setSelectedLanguage(lang.code); setShowLanguageSelect(false) }} className={selectedLanguage === lang.code ? "selected" : ""}>
                                                        <span>{lang.flag}</span>
                                                        {lang.name}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            <div className={uploadAreaClasses} onDrop={handleDrop} onDragOver={(e) => { e.preventDefault(); setIsDragOver(true) }} onDragLeave={() => setIsDragOver(false)} onClick={() => !isProcessing && !file && fileInputRef.current?.click()}>
                                <input ref={fileInputRef} type="file" accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif,.bmp,.webp" onChange={(e) => handleFileSelect(e.target.files[0])} hidden />
                                {isProcessing ? (
                                    <div className="processing-view">
                                        <Loader />
                                        <p className="status-text processing">Processing with layout preservation...</p>
                                    </div>
                                ) : file ? (
                                    <div className="file-info-view">
                                        <div className="upload-icon-wrapper">{getFileIcon()}</div>
                                        <div className="file-details">
                                            <p className="file-name">{file.name}</p>
                                            <p className="file-size">{formatFileSize(file.size)}</p>
                                        </div>
                                        <p className="status-text ready">Ready to translate with layout preservation</p>
                                    </div>
                                ) : (
                                    <div className="upload-prompt">
                                        <div className="upload-icon-wrapper">
                                            <FaUpload />
                                        </div>
                                        <h3>Drop your document here</h3>
                                        <p>or click to browse files</p>
                                        <div className="supported-file-types">
                                            <div className="file-type">
                                                <FaImage className="file-type-icon image" />
                                                <span>Image</span>
                                            </div>
                                            <div className="file-type">
                                                <FaFilePdf className="file-type-icon pdf" />
                                                <span>PDF</span>
                                            </div>
                                            <div className="file-type">
                                                <FaFileWord className="file-type-icon docx" />
                                                <span>DOC/DOCX</span>
                                            </div>
                                            <div className="file-type">
                                                <FaFileAlt className="file-type-icon txt" />
                                                <span>TXT</span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {file && !isProcessing && (
                                <div className="action-buttons-container">
                                    <button onClick={resetUpload} className="btn btn-secondary">Cancel</button>
                                    <button onClick={processFile} className="btn btn-primary">Translate</button>
                                </div>
                            )}

                            {isProcessing && (
                                <div className="processing-steps-container">
                                    <div className={`step-indicator ${currentProgress >= 25 ? "active" : ""}`}><FaCloudUploadAlt /><span>Upload</span></div>
                                    <div className={`step-indicator ${currentProgress >= 50 ? "active" : ""}`}><MdDocumentScanner /><span>Extract</span></div>
                                    <div className={`step-indicator ${currentProgress >= 75 ? "active" : ""}`}><FaRobot /><span>Translate</span></div>
                                    <div className={`step-indicator ${currentProgress >= 100 ? "active" : ""}`}><FaCheckCircle /><span>Complete</span></div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </section>
            {!translatedText && !file && (
                <section  className="info-sections-container">
                    <div id="how-it-works" className="info-section">
                        <div className="info-card">
                            <div className="info-header">
                                <FaRobot className="info-icon" />
                                <h3>How It Works</h3>
                            </div>
                            <div className="info-content">
                                <div className="step-item">
                                    <div className="step-number">1</div>
                                    <div className="step-text">
                                        <strong>Upload Document</strong>
                                        <p>Upload your Nepali or Sinhala document in PDF, DOC, or image format</p>
                                    </div>
                                </div>
                                <div className="step-item">
                                    <div className="step-number">2</div>
                                    <div className="step-text">
                                        <strong>AI Processing</strong>
                                        <p>Our advanced AI model extracts and translates text while preserving layout</p>
                                    </div>
                                </div>
                                <div className="step-item">
                                    <div className="step-number">3</div>
                                    <div className="step-text">
                                        <strong>Download Result</strong>
                                        <p>Get your translated document in multiple formats with original formatting</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div  id="features" className="info-section">
                        <div className="info-card">
                            <div className="info-header">
                                <Sparkles className="info-icon" />
                                <h3>Why We're Different</h3>
                            </div>
                            <div className="info-content">
                                <div className="feature-grid">
                                    <div className="feature-item">
                                        <MdTranslate className="feature-icon" />
                                        <h4>Specialized Languages</h4>
                                        <p>Focused specifically on Nepali and Sinhala to English translation with cultural context understanding</p>
                                    </div>
                                    <div className="feature-item">
                                        <FaFileImage className="feature-icon" />
                                        <h4>Layout Preservation</h4>
                                        <p>Maintains original document formatting and structure, unlike generic translation tools</p>
                                    </div>
                                    <div className="feature-item">
                                        <FaRobot className="feature-icon" />
                                        <h4>Advanced AI Model</h4>
                                        <p>Custom-trained AI specifically for South Asian languages with high accuracy</p>
                                    </div>
                                    <div className="feature-item">
                                        <FaDownload className="feature-icon" />
                                        <h4>Multiple Formats</h4>
                                        <p>Export in PDF, DOCX, or TXT while preserving original document structure</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div id="problem-solution" className="info-section">
                        <div className="info-card problem-solution">
                            <div className="info-header">
                                <FaGlobe className="info-icon" />
                                <h3>The Problem & Our Solution</h3>
                            </div>
                            <div className="info-content">
                                <div className="problem-solution-grid">
                                    <div className="problem-side">
                                        <h4 className="problem-title">The Problem</h4>
                                        <ul className="problem-list">
                                            <li>Limited translation tools for Nepali and Sinhala languages</li>
                                            <li>Generic translators lose document formatting and context</li>
                                            <li>Poor accuracy for South Asian language nuances</li>
                                            <li>No specialized tools for official document translation</li>
                                            <li>Time-consuming manual translation processes</li>
                                        </ul>
                                    </div>
                                    <div className="solution-side">
                                        <h4 className="solution-title">Our Solution</h4>
                                        <ul className="solution-list">
                                            <li>AI model specifically trained for Nepali & Sinhala languages</li>
                                            <li>Advanced layout preservation technology</li>
                                            <li>Cultural context-aware translation algorithms</li>
                                            <li>Professional-grade document processing</li>
                                            <li>Instant, accurate translations with formatting intact</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            )}
            <Footer/>
        </main>
        
    </div>
  )
}

export default Home