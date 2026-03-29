import React, { useState, useRef } from 'react';
import './App.css';

function App() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);

  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (file) => {
    if (!file.type.match('image.*')) {
      alert('Please upload an image file.');
      return;
    }

    setSelectedImage(file);

    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target.result);
      setResult(null);
    };
    reader.readAsDataURL(file);
  };

  const handleUploadClick = () => {
    fileInputRef.current.click();
  };

  // ✅ FIXED API CALL
  const handlePredict = async () => {
    if (!selectedImage) return;

    setIsLoading(true);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("file", selectedImage);

      const response = await fetch("http://127.0.0.1:8000/predict", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      // ✅ FIX: match backend response keys
      const resultData = {
        diseaseName: data.label,
        confidence: data.confidence,
        isHealthy: data.is_healthy,
      };

      setResult(resultData);

    } catch (error) {
      console.error("Error:", error);
      alert("Error connecting to backend");
    }

    setIsLoading(false);
  };

  const handleReset = () => {
    setSelectedImage(null);
    setPreviewUrl(null);
    setResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="app-container">
      <div className="card-container">
        
        <header className="header">
          <div className="icon-wrapper">🌿</div>
          <h1>Plant Disease Detector</h1>
          <p>Upload a leaf image to detect plant diseases using AI</p>
        </header>

        <main className="main-content">
          {!previewUrl ? (
            <div 
              className={`upload-area ${isDragging ? 'dragging' : ''}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={handleUploadClick}
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                accept="image/*"
                style={{ display: 'none' }}
              />
              <div className="upload-content">
                <svg className="upload-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <p className="upload-text"><strong>Click to upload</strong> or drag and drop</p>
                <p className="upload-hint">PNG, JPG, JPEG (max 5MB)</p>
              </div>
            </div>
          ) : (
            <div className="preview-section">
              <div className="image-preview-container">
                <img src={previewUrl} alt="Leaf Preview" className="image-preview" />
              </div>
              
              {!result && !isLoading && (
                <div className="action-buttons">
                  <button className="btn-secondary" onClick={handleReset}>Cancel</button>
                  <button className="btn-primary predict-btn" onClick={handlePredict}>
                    Detect Disease
                  </button>
                </div>
              )}

              {isLoading && (
                <div className="loading-state">
                  <div className="spinner"></div>
                  <p>Analyzing leaf patterns with AI...</p>
                </div>
              )}

              {result && (
                <div className={`result-card ${result.isHealthy ? 'healthy' : 'diseased'}`}>
                  <div className="result-header">
                    <span className="badge">
                      {result.isHealthy ? '✅ Healthy' : '⚠️ Disease Detected'}
                    </span>
                    <span className="confidence-text">
                      Confidence: {result.confidence}%
                    </span>
                  </div>

                  {/* ✅ Clean disease name */}
                  <h3 className="disease-name">{result.diseaseName}</h3>

                  <button className="btn-outline mt-4" onClick={handleReset}>
                    Try Another Image
                  </button>
                </div>
              )}
            </div>
          )}
        </main>

        <footer className="footer">
          <p>Powered by Artificial Intelligence</p>
        </footer>

      </div>
    </div>
  );
}

export default App;