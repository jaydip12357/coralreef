import { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { analyzeReefMedia } from '../services/geminiService';
import styles from './MediaUpload.module.css';

type MediaType = 'image' | 'video';

export default function MediaUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [mediaType, setMediaType] = useState<MediaType | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const [activeTab, setActiveTab] = useState<MediaType>('image');
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

  const validateFile = (file: File, type: MediaType): boolean => {
    if (type === 'image') {
      const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
      if (!validTypes.includes(file.type)) {
        setError('Please upload a valid image file (JPG, PNG, WebP, GIF)');
        return false;
      }
      if (file.size > 20 * 1024 * 1024) {
        setError('Image size must be less than 20MB');
        return false;
      }
    } else {
      const validTypes = ['video/mp4', 'video/quicktime', 'video/x-m4v', 'video/webm'];
      if (!validTypes.includes(file.type)) {
        setError('Please upload a valid video file (MP4, MOV, WebM)');
        return false;
      }
      if (file.size > 50 * 1024 * 1024) {
        setError('Video size must be less than 50MB for best results');
        return false;
      }
    }
    return true;
  };

  const handleFile = (file: File) => {
    setError(null);
    const isImage = file.type.startsWith('image/');
    const type: MediaType = isImage ? 'image' : 'video';

    if (validateFile(file, type)) {
      setFile(file);
      setMediaType(type);
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
    if (!file || !mediaType) return;

    setIsAnalyzing(true);
    setError(null);
    setProgress(0);

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) return prev;
        return prev + Math.random() * 15;
      });
    }, 500);

    try {
      const result = await analyzeReefMedia(file, mediaType);

      setProgress(100);
      clearInterval(progressInterval);

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
    setMediaType(null);
    setPreview(null);
    setError(null);
    setProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getAcceptTypes = () => {
    if (activeTab === 'image') {
      return 'image/jpeg,image/png,image/webp,image/gif,.jpg,.jpeg,.png,.webp,.gif';
    }
    return 'video/mp4,video/quicktime,video/x-m4v,video/webm,.mp4,.mov,.webm';
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Analyze Reef Media</h2>
        <p>Upload underwater photos or videos for AI-powered reef health analysis</p>
      </div>

      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === 'image' ? styles.activeTab : ''}`}
          onClick={() => { setActiveTab('image'); handleClear(); }}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <rect x="2" y="3" width="16" height="14" rx="2" stroke="currentColor" strokeWidth="1.5"/>
            <circle cx="7" cy="8" r="2" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M2 14L6 10L9 13L14 8L18 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Photo
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'video' ? styles.activeTab : ''}`}
          onClick={() => { setActiveTab('video'); handleClear(); }}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <rect x="2" y="4" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M14 8L18 5V15L14 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Video
        </button>
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
            accept={getAcceptTypes()}
            onChange={handleChange}
            className={styles.fileInput}
          />
          <div className={styles.dropzoneContent}>
            {activeTab === 'image' ? (
              <svg className={styles.uploadIcon} viewBox="0 0 48 48" fill="none">
                <rect x="6" y="10" width="36" height="28" rx="4" stroke="currentColor" strokeWidth="3"/>
                <circle cx="16" cy="20" r="4" stroke="currentColor" strokeWidth="3"/>
                <path d="M6 32L16 22L24 30L34 20L42 28" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            ) : (
              <svg className={styles.uploadIcon} viewBox="0 0 48 48" fill="none">
                <rect x="4" y="8" width="28" height="32" rx="4" stroke="currentColor" strokeWidth="3"/>
                <path d="M32 16L44 8V40L32 32" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="18" cy="24" r="6" stroke="currentColor" strokeWidth="3"/>
                <path d="M16 24L21 21V27L16 24Z" fill="currentColor"/>
              </svg>
            )}
            <p className={styles.dropzoneText}>
              <span className={styles.dropzoneHighlight}>Click to upload</span> or drag and drop
            </p>
            <p className={styles.dropzoneHint}>
              {activeTab === 'image'
                ? 'JPG, PNG, WebP up to 20MB'
                : 'MP4, MOV, WebM up to 50MB'}
            </p>
          </div>
        </div>
      ) : (
        <div className={styles.preview}>
          {mediaType === 'image' ? (
            <img src={preview || undefined} className={styles.image} alt="Preview" />
          ) : (
            <video src={preview || undefined} className={styles.video} controls />
          )}
          <div className={styles.fileInfo}>
            <div className={styles.fileName}>
              <span className={styles.mediaTypeBadge}>
                {mediaType === 'image' ? '🖼️' : '🎬'}
              </span>
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
              <div className={styles.progressFill} style={{ width: `${progress}%` }}></div>
            </div>
            <span className={styles.progressText}>{Math.round(progress)}%</span>
          </div>
          <div className={styles.analyzingStatus}>
            <div className="spinner"></div>
            <div className={styles.analyzingText}>
              <p className={styles.analyzingTitle}>Analyzing reef {mediaType}...</p>
              <p className={styles.analyzingHint}>
                AI is identifying species and assessing reef health
              </p>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className={styles.error}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.5" />
            <path d="M10 6V10M10 14H10.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      <div className={styles.tips}>
        <h3>Tips for best results</h3>
        <ul>
          {activeTab === 'image' ? (
            <>
              <li>Use clear, well-lit underwater photos</li>
              <li>Include visible coral and fish in the frame</li>
              <li>Higher resolution images provide better analysis</li>
              <li>Avoid blurry or heavily filtered images</li>
            </>
          ) : (
            <>
              <li>Use clear, well-lit underwater footage</li>
              <li>Include a variety of reef areas and species</li>
              <li>Steady camera movement helps identification</li>
              <li>Videos 10-60 seconds work best</li>
            </>
          )}
        </ul>
      </div>
    </div>
  );
}
