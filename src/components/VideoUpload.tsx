import { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { analyzeReefVideo } from '../services/geminiService';
import type { AnalysisResult } from '../types';
import styles from './VideoUpload.module.css';

interface VideoUploadProps {
  onAnalysisComplete?: (result: AnalysisResult, filename: string) => void;
}

export default function VideoUpload({ onAnalysisComplete }: VideoUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const validateFile = (file: File): boolean => {
    const validTypes = ['video/mp4', 'video/quicktime', 'video/x-m4v'];
    if (!validTypes.includes(file.type)) {
      setError('Please upload a valid video file (MP4, MOV)');
      return false;
    }
    if (file.size > 100 * 1024 * 1024) {
      setError('File size must be less than 100MB');
      return false;
    }
    return true;
  };

  const handleFile = (file: File) => {
    setError(null);
    if (validateFile(file)) {
      setFile(file);
      const url = URL.createObjectURL(file);
      setPreview(url);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleAnalyze = async () => {
    if (!file) return;

    setIsAnalyzing(true);
    setError(null);
    setProgress(0);

    // Simulate progress updates
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) return prev;
        return prev + Math.random() * 15;
      });
    }, 500);

    try {
      // analyzeReefVideo handles API key check and falls back to demo mode automatically
      const result = await analyzeReefVideo(file);

      setProgress(100);
      clearInterval(progressInterval);

      if (onAnalysisComplete) {
        onAnalysisComplete(result, file.name);
      }

      // Store result and navigate to results page
      sessionStorage.setItem('analysisResult', JSON.stringify(result));
      sessionStorage.setItem('analysisFilename', file.name);

      setTimeout(() => {
        navigate('/results');
      }, 500);
    } catch (err) {
      clearInterval(progressInterval);
      setError(err instanceof Error ? err.message : 'Analysis failed. Please try again.');
      setIsAnalyzing(false);
      setProgress(0);
    }
  };

  const handleClear = () => {
    setFile(null);
    setPreview(null);
    setError(null);
    setProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Upload Reef Footage</h2>
        <p>Upload underwater video footage for AI-powered reef health analysis</p>
      </div>

      {!file ? (
        <div
          className={`${styles.dropzone} ${dragActive ? styles.active : ''}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={handleClick}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="video/mp4,video/quicktime,video/x-m4v,.mp4,.mov"
            onChange={handleChange}
            className={styles.fileInput}
          />
          <div className={styles.dropzoneContent}>
            <svg
              className={styles.uploadIcon}
              viewBox="0 0 48 48"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M24 4L24 32M24 4L32 12M24 4L16 12"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M8 28V40C8 41.1046 8.89543 42 10 42H38C39.1046 42 40 41.1046 40 40V28"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <p className={styles.dropzoneText}>
              <span className={styles.dropzoneHighlight}>Click to upload</span> or drag and
              drop
            </p>
            <p className={styles.dropzoneHint}>MP4 or MOV up to 100MB</p>
          </div>
        </div>
      ) : (
        <div className={styles.preview}>
          <video src={preview || undefined} className={styles.video} controls />
          <div className={styles.fileInfo}>
            <div className={styles.fileName}>
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M4 3C4 2.44772 4.44772 2 5 2H11L16 7V17C16 17.5523 15.5523 18 15 18H5C4.44772 18 4 17.5523 4 17V3Z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
                <path d="M11 2V7H16" stroke="currentColor" strokeWidth="1.5" />
              </svg>
              <span>{file.name}</span>
            </div>
            <span className={styles.fileSize}>
              {(file.size / (1024 * 1024)).toFixed(2)} MB
            </span>
          </div>

          {!isAnalyzing && (
            <div className={styles.actions}>
              <button onClick={handleClear} className="secondary">
                Remove
              </button>
              <button onClick={handleAnalyze} className="accent">
                Analyze Reef
              </button>
            </div>
          )}
        </div>
      )}

      {isAnalyzing && (
        <div className={styles.analyzing}>
          <div className={styles.progressContainer}>
            <div className={styles.progressBar}>
              <div
                className={styles.progressFill}
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <span className={styles.progressText}>{Math.round(progress)}%</span>
          </div>
          <div className={styles.analyzingStatus}>
            <div className="spinner"></div>
            <div className={styles.analyzingText}>
              <p className={styles.analyzingTitle}>Analyzing reef footage...</p>
              <p className={styles.analyzingHint}>
                AI is identifying species and assessing reef health
              </p>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className={styles.error}>
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.5" />
            <path
              d="M10 6V10M10 14H10.01"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
          <span>{error}</span>
        </div>
      )}

      <div className={styles.tips}>
        <h3>Tips for best results</h3>
        <ul>
          <li>Use clear, well-lit underwater footage</li>
          <li>Include a variety of reef areas and fish species</li>
          <li>Steady camera movement helps with species identification</li>
          <li>Videos between 30 seconds and 5 minutes work best</li>
        </ul>
      </div>
    </div>
  );
}
