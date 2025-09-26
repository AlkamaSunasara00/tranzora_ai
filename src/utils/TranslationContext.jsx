// src/utils/TranslationContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';

const TranslationContext = createContext();

export const useTranslation = () => useContext(TranslationContext);

// The key must match what your History component uses
const HISTORY_STORAGE_KEY = "translations";

export const TranslationProvider = ({ children }) => {
  // State for the current translation job
  const [file, setFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [originalText, setOriginalText] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [isImageFile, setIsImageFile] = useState(false);
  
  // State for persistent history
  const [history, setHistory] = useState([]);

  // Load history from localStorage when the app starts
  useEffect(() => {
    try {
      const savedHistory = localStorage.getItem(HISTORY_STORAGE_KEY);
      if (savedHistory) {
        setHistory(JSON.parse(savedHistory));
      }
    } catch (error) {
      console.error("Failed to load translation history:", error);
      setHistory([]);
    }
  }, []);

  const updateAndSaveHistory = (newHistory) => {
    setHistory(newHistory);
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(newHistory));
  };

  const addToHistory = (item) => {
    // Add the newest item to the beginning of the array
    const newHistory = [item, ...history];
    updateAndSaveHistory(newHistory);
  };

  const deleteFromHistory = (id) => {
    const newHistory = history.filter((item) => item.id !== id);
    updateAndSaveHistory(newHistory);
  };
  
  const clearHistory = () => {
    if (window.confirm("Are you sure you want to clear all translation history?")) {
        updateAndSaveHistory([]);
    }
  };

  const value = {
    file, setFile,
    isProcessing, setIsProcessing,
    originalText, setOriginalText,
    translatedText, setTranslatedText,
    isImageFile, setIsImageFile,
    history,
    addToHistory,
    deleteFromHistory,
    clearHistory
  };

  return (
    <TranslationContext.Provider value={value}>
      {children}
    </TranslationContext.Provider>
  );
};