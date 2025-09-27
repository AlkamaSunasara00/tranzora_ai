import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from "../utils/TranslationContext";
import Loader from "../components/Loader";
import { FaUpload, FaFilePdf, FaFileWord, FaFileAlt, FaImage, FaCloudUploadAlt, FaCheckCircle, FaRobot, FaTimes, FaDownload, FaGlobe } from "react-icons/fa";
import { MdTranslate, MdDocumentScanner } from "react-icons/md";
import { ChevronDown } from "lucide-react";
import { Sparkles } from "lucide-react";

import Prism from "../components/Prism";
import { jsPDF } from "jspdf";
import { Document, Packer, Paragraph, TextRun } from "docx";
import { saveAs } from "file-saver";
import "./Home.css";

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
  { code: "arabic", name: "Arabic", flag: "🇸🇦" }
];

const Home = () => {
  const {
    file, setFile,
    isProcessing, setIsProcessing,
    originalText, setOriginalText,
    translatedText, setTranslatedText,
    isImageFile, setIsImageFile,
    addToHistory
  } = useTranslation();

  const [isDragOver, setIsDragOver] = useState(false);
  const [isCompact, setIsCompact] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("english");
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [currentProgress, setCurrentProgress] = useState(0);
  const [showLanguageSelect, setShowLanguageSelect] = useState(false);
  const fileInputRef = useRef(null);
  const previewRef = useRef(null);

  useEffect(() => {
    setIsCompact(!!(file || isProcessing || translatedText));
  }, [file, isProcessing, translatedText]);

  useEffect(() => {
    if (translatedText && previewRef.current) previewRef.current.scrollIntoView({ behavior: "smooth" });
  }, [translatedText]);

  const isValidFileType = (file) => {
    const docTypes = /\.(pdf|doc|docx|txt)$/i;
    const imgTypes = /\.(jpg|jpeg|png|gif|bmp|webp)$/i;
    return docTypes.test(file.name) || imgTypes.test(file.name);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024; const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const handleFileSelect = (selectedFile) => {
    if (selectedFile && isValidFileType(selectedFile)) {
      setFile(selectedFile);
      setTranslatedText("");
      setOriginalText("");
      setIsImageFile(selectedFile.type.startsWith("image/"));
    } else {
      alert("Please select a valid document or image file.");
    }
  };

  const handleDrop = (e) => {
    e.preventDefault(); setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) handleFileSelect(e.dataTransfer.files[0]);
  };

  const processFile = async () => {
    if (!file) return;
    setIsProcessing(true); setCurrentProgress(0);
    try {
      setCurrentProgress(25); await new Promise(r => setTimeout(r, 800));
      setCurrentProgress(50); await new Promise(r => setTimeout(r, 800));
      setCurrentProgress(75);
      const formData = new FormData();
      formData.append("file", file);
      const response = await fetch(`http://209.182.232.43:3000/translate-text?target_language=${selectedLanguage}`, {
        method: "POST", body: formData, mode: "cors"
      });
      if (!response.ok) throw new Error(`API Error: ${response.status}`);
      const result = await response.json();
      const original = result?.translation_data?.pages?.[0]?.original_text || "Original text not available.";
      const translated = result?.translation_data?.pages?.[0]?.translated_text || "⚠️ No translated text found.";
      setCurrentProgress(100); await new Promise(r => setTimeout(r, 600));
      setOriginalText(original.replace(/\\n/g, "\n"));
      setTranslatedText(translated.replace(/\\n/g, "\n"));
    } catch (error) {
      setOriginalText("Could not retrieve original text.");
      setTranslatedText("⚠️ Translation failed. Please try again later.");
    } finally {
      setIsProcessing(false);
    }
  };

  const createHistoryItemAndDownload = async (downloadFunction, format) => {
    if (!file || !translatedText) return;
    addToHistory({
      id: Date.now(),
      fileName: file.name,
      date: new Date().toISOString(),
      originalText,
      translatedText,
    });
    await downloadFunction();
    setShowDownloadModal(false);
  };

  const resetUpload = () => {
    setFile(null); setTranslatedText(""); setOriginalText(""); setIsImageFile(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const getFileIcon = () => {
    if (!file) return <FaUpload className="upload-icon" />;
    if (isImageFile) return <FaImage className="file-type-icon" />;
    const extension = file.name.split(".").pop().toLowerCase();
    switch (extension) {
      case "pdf": return <FaFilePdf className="file-type-icon" />;
      case "doc": case "docx": return <FaFileWord className="file-type-icon" />;
      case "txt": return <FaFileAlt className="file-type-icon" />;
      default: return <FaUpload className="file-type-icon" />;
    }
  };

  const selectedLang = languages.find(l => l.code === selectedLanguage);

  const handleDownloadTxt = () => {
    const blob = new Blob([translatedText], { type: "text/plain;charset=utf-8" });
    saveAs(blob, `translation_${selectedLanguage}.txt`);
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF({ orientation: "p", unit: "pt", format: "a4" });
    doc.setFont("helvetica", "bold"); doc.setFontSize(18);
    doc.text("Translation Result", 40, 60);
    doc.setFont("helvetica", "normal"); doc.setFontSize(12);
    doc.setTextColor(100);
    doc.text(`Language: ${selectedLang?.name || "Unknown"}`, 40, 80);
    doc.setTextColor(20);
    const textLines = doc.splitTextToSize(translatedText, 500);
    doc.text(textLines, 40, 110);
    doc.save(`translation_${selectedLanguage}.pdf`);
  };

  const handleDownloadDOCX = async () => {
    const paragraphs = translatedText.split("\n").map(l => new Paragraph({ children: [new TextRun(l)] }));
    const doc = new Document({
      sections: [
        {
          children: [
            new Paragraph({ children: [new TextRun({ text: "Translation Result", bold: true, size: 28 })] }),
            new Paragraph({ children: [new TextRun({ text: `Language: ${selectedLang?.name || "Unknown"}`, italics: true, size: 22 })] }),
            new Paragraph({}),
            ...paragraphs
          ]
        }
      ]
    });
    const blob = await Packer.toBlob(doc);
    saveAs(blob, `translation_${selectedLanguage}.docx`);
  };

  const uploadAreaClasses = [
    "upload-area",
    isCompact ? "compact" : "",
    isDragOver ? "drag-over" : "",
    file && !isProcessing ? "file-selected" : "",
    isProcessing ? "processing" : ""
  ].filter(Boolean).join(" ");

  return (
    <div className="page-container">
      <div className="background-effects">
        <div style={{ width: "100vw", height: "100vh", position: "absolute", inset: 0 }}>
          <Prism
            animationType="rotate"
            timeScale={0.5}
            height={3.5}
            baseWidth={5.5}
            scale={3.6}
            hueShift={0}
            colorFrequency={1}
            noise={0.5}
            glow={1}
          />
        </div>
      </div>
      <div className="main-container">
        <header className="header-section">
          <p className="subtitle">AI-Powered Translation Magic</p>
          <div className="tagline">
            <Sparkles className="sparkle-icon" />
            Upload • Translate • Download
            <Sparkles className="sparkle-icon" />
          </div>

        </header>
        {translatedText && (
          <div ref={previewRef} className="results-preview-container">
            <div className="preview-card">
              <div className="preview-header">
                <div className="preview-header-text">
                  <MdTranslate className="preview-translate-icon" />
                  <div>
                    <h3 className="preview-title">Translation Result</h3>
                    <p className="preview-language-info">Translated to {selectedLang?.flag} {selectedLang?.name}</p>
                  </div>
                </div>
                <button onClick={() => setShowDownloadModal(true)} className="btn btn-primary">
                  <FaDownload /> Download
                </button>
              </div>
              <div className="document-content-wrapper">
                <pre className="translated-text-content">{translatedText}</pre>
              </div>
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
            <div className="download-modal" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h3>Download Translation</h3>
                <button className="close-modal" onClick={() => setShowDownloadModal(false)}>
                  <FaTimes />
                </button>
              </div>
              <div className="download-options">
                <div className="download-option txt" onClick={() => createHistoryItemAndDownload(handleDownloadTxt, "TXT")}>
                  <FaFileAlt className="download-icon" />
                  <div className="download-info"><strong>Plain Text</strong><p>.txt file</p></div>
                </div>
                <div className="download-option pdf" onClick={() => createHistoryItemAndDownload(handleDownloadPDF, "PDF")}>
                  <FaFilePdf className="download-icon" />
                  <div className="download-info"><strong>PDF Document</strong><p>.pdf file</p></div>
                </div>
                <div className="download-option docx" onClick={() => createHistoryItemAndDownload(handleDownloadDOCX, "DOCX")}>
                  <FaFileWord className="download-icon" />
                  <div className="download-info"><strong>Word Document</strong><p>.docx file</p></div>
                </div>
              </div>
            </div>
          </div>
        )}
        {!translatedText && (
          <div className="main-content-card">
            {file && !isProcessing && (
              <div className="language-selection-container">
                <FaGlobe className="globe-icon" /><span>Translate to:</span>
                <div className="language-select-wrapper">
                  <button onClick={() => setShowLanguageSelect(!showLanguageSelect)} className="language-select-button">
                    <span>{selectedLang?.flag}</span>
                    <span>{selectedLang?.name}</span>
                    <ChevronDown size={16} />
                  </button>
                  {showLanguageSelect && (
                    <div className="language-dropdown">
                      {languages.map(lang => (
                        <button key={lang.code} onClick={() => { setSelectedLanguage(lang.code); setShowLanguageSelect(false); }} className={selectedLanguage === lang.code ? "selected" : ""}>
                          <span>{lang.flag}</span>{lang.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
            <div
              className={uploadAreaClasses}
              onDrop={handleDrop}
              onDragOver={e => { e.preventDefault(); setIsDragOver(true); }}
              onDragLeave={() => setIsDragOver(false)}
              onClick={() => !isProcessing && !file && fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif,.bmp,.webp"
                onChange={e => handleFileSelect(e.target.files[0])}
                hidden
              />
              {isProcessing ? (
                <div className="processing-view">
                  <Loader />
                  <p className="status-text processing">Processing...</p>
                </div>
              ) : file ? (
                <div className="file-info-view">
                  <div className="upload-icon-wrapper">{getFileIcon()}</div>
                  <div className="file-details">
                    <p className="file-name">{file.name}</p>
                    <p className="file-size">{formatFileSize(file.size)}</p>
                  </div>
                  <p className="status-text ready">Ready to translate</p>
                </div>
              ) : (
                <div className="upload-prompt">
                  <div className="upload-icon-wrapper"><FaUpload /></div>
                  <h3>Drop your document here</h3>
                  <p>or click to browse files</p>
                  <div className="supported-file-types">
                    <div className="file-type"><FaImage className="file-type-icon image" /><span>Image</span></div>
                    <div className="file-type"><FaFilePdf className="file-type-icon pdf" /><span>PDF</span></div>
                    <div className="file-type"><FaFileWord className="file-type-icon docx" /><span>DOC/DOCX</span></div>
                    <div className="file-type"><FaFileAlt className="file-type-icon txt" /><span>TXT</span></div>
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
    </div>
  );
};

export default Home;
