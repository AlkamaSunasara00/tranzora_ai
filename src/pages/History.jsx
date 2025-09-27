import React, { useState } from "react"
import { useTranslation } from '../utils/TranslationContext';
import { FaDownload } from "react-icons/fa6";
import { MdDelete } from "react-icons/md";
import { FaFileAlt } from "react-icons/fa";
import { FaHistory , FaUpload} from "react-icons/fa";
import "./History.css"
import { Link } from "react-router-dom";

const History = () => {
  const { history, deleteFromHistory, clearHistory } = useTranslation();
  const [selectedTranslation, setSelectedTranslation] = useState(null);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric", month: "short", day: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  };

  const getPreviewText = (text) => {
    return text.length > 150 ? text.substring(0, 150) + "..." : text;
  };

  const downloadTranslation = (translation) => {
    const element = document.createElement("a");
    const file = new Blob([translation.translatedText], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = `translated-${translation.fileName}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };
  
  const handleDelete = (e, id) => {
    e.stopPropagation();
    deleteFromHistory(id);
    if (selectedTranslation?.id === id) {
      setSelectedTranslation(null);
    }
  };

  const handleClearAll = () => {
      clearHistory();
      setSelectedTranslation(null);
  };

  return (
    <div className="history">
      <div className="history-container">
        <div className="history-header">
          <h1>Translation History</h1>
          <p className="history-subtitle">View and manage your past translations</p>
          {history.length > 0 && (
            <button className="btn btn-secondary clear-btn" onClick={handleClearAll}>
              Clear All History
            </button>
          )}
        </div>

        {history.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon"><FaHistory /></div>
              <div className="supported-file-types">
    <div className="file-type">
      <FaImage className="file-type-icon image" /><span>Image</span>
    </div>
    <div className="file-type">
      <FaFilePdf className="file-type-icon pdf" /><span>PDF</span>
    </div>
    <div className="file-type">
      <FaFileWord className="file-type-icon docx" /><span>DOC/DOCX</span>
    </div>
    <div className="file-type">
      <FaFileAlt className="file-type-icon txt" /><span>TXT</span>
    </div>
  </div>
            <h3>No translations yet</h3>
            <p>Your translation history will appear here after you download a file.</p>
             <Link to="/" className="btn btn-primary upload-link-btn">
              <FaUpload /> Translate a Document
            </Link>
          </div>
        ) : (
          <div className="history-content">
            <div className="translations-grid">
              {history.map((translation) => (
                <div
                  key={translation.id}
                  className={`translation-card ${selectedTranslation?.id === translation.id ? "selected" : ""}`}
                  onClick={() => setSelectedTranslation(translation)}
                >
                  <div className="card-header">
                    <div className="file-info">
                      <div className="file-icon"><FaFileAlt /></div>
                      <div className="file-details">
                        <h3 className="file-name">{translation.fileName}</h3>
                        <p className="file-date">{formatDate(translation.date)}</p>
                      </div>
                    </div>
                    <div className="card-actions">
                      <button className="action-btn download-btn" onClick={(e) => { e.stopPropagation(); downloadTranslation(translation); }} title="Download translation"><FaDownload /></button>
                      <button className="action-btn delete-btn" onClick={(e) => handleDelete(e, translation.id)} title="Delete translation"><MdDelete />
</button>
                    </div>
                  </div>
                  <div className="translation-preview">
                    <p>{getPreviewText(translation.translatedText)}</p>
                  </div>
                  <div className="card-footer">
                    <span className="view-full">Click to view full translation</span>
                  </div>
                </div>
              ))}
            </div>

            {selectedTranslation && (
              <div className="translation-modal" onClick={() => setSelectedTranslation(null)}>
                <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                  <div className="modal-header">
                    <h2>{selectedTranslation.fileName}</h2>
                    <button className="close-btn" onClick={() => setSelectedTranslation(null)}>✕</button>
                  </div>
                  <div className="modal-body">
                    <div className="translation-section">
                      <h4>Original Text</h4>
                      <div className="text-content original">
                        <pre>{selectedTranslation.originalText}</pre>
                      </div>
                    </div>
                    <div className="translation-section">
                      <h4>Translated Text</h4>
                      <div className="text-content translated">
                        <pre>{selectedTranslation.translatedText}</pre>
                      </div>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button className="btn btn-primary" onClick={() => downloadTranslation(selectedTranslation)}>Download Translation</button>
                    <button className="btn btn-secondary" onClick={() => setSelectedTranslation(null)}>Close</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default History;