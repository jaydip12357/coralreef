import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import HealthScore from '../components/HealthScore';
import SpeciesTable from '../components/SpeciesTable';
import type { AnalysisResult } from '../types';
import styles from './ResultsPage.module.css';

function getTrendIcon(trend: 'improving' | 'stable' | 'declining'): string {
  switch (trend) {
    case 'improving':
      return '↑';
    case 'declining':
      return '↓';
    default:
      return '→';
  }
}

function getTrendColor(trend: 'improving' | 'stable' | 'declining'): string {
  switch (trend) {
    case 'improving':
      return '#22c55e';
    case 'declining':
      return '#ef4444';
    default:
      return '#6b7280';
  }
}

export default function ResultsPage() {
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [filename, setFilename] = useState<string>('');
  const navigate = useNavigate();

  useEffect(() => {
    const storedResult = sessionStorage.getItem('analysisResult');
    const storedFilename = sessionStorage.getItem('analysisFilename');

    if (storedResult) {
      setResult(JSON.parse(storedResult));
      setFilename(storedFilename || 'Unknown file');
    } else {
      navigate('/upload');
    }
  }, [navigate]);

  if (!result) {
    return (
      <div className={styles.loading}>
        <div className="spinner"></div>
        <p>Loading results...</p>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.headerContent}>
            <h1>Analysis Complete</h1>
            <p className={styles.filename}>{filename}</p>
            <p className={styles.timestamp}>
              Analyzed on {new Date(result.timestamp).toLocaleString()}
            </p>
          </div>
          <div className={styles.headerActions}>
            <Link to="/upload" className={styles.uploadBtn}>
              Analyze Another
            </Link>
          </div>
        </div>

        <div className={styles.overview}>
          <div className={styles.scoreSection}>
            <HealthScore score={result.healthScore} size="large" />
            <div className={styles.scoreDetails}>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Reef Health</span>
                <span className={styles.detailValue}>{result.healthScore}/100</span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Biodiversity</span>
                <span className={styles.detailValue}>{result.biodiversityScore}/100</span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Trend</span>
                <span
                  className={styles.detailValue}
                  style={{ color: getTrendColor(result.trend) }}
                >
                  {getTrendIcon(result.trend)} {result.trend}
                </span>
              </div>
              {result.totalFishCount !== undefined && (
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Total Fish</span>
                  <span className={styles.detailValue}>{result.totalFishCount}</span>
                </div>
              )}
              {result.confidence !== undefined && (
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Confidence</span>
                  <span className={styles.detailValue}>{result.confidence}%</span>
                </div>
              )}
            </div>
          </div>

          <div className={styles.summaryCard}>
            <h3>Analysis Summary</h3>
            <p>{result.summary}</p>
          </div>
        </div>

        {result.analyzedFrame && (
          <div className={styles.analyzedFrameSection}>
            <h2>Analyzed Frame</h2>
            <p className={styles.frameHint}>This frame was selected as having the most fish visible</p>
            <div className={styles.frameContainer}>
              <img src={result.analyzedFrame} alt="Analyzed frame" className={styles.analyzedFrame} />
            </div>
          </div>
        )}

        <div className={styles.speciesSection}>
          <h2>Species Breakdown</h2>
          <SpeciesTable species={result.species} />
        </div>

        <div className={styles.recommendations}>
          <h2>Recommendations</h2>
          <div className={styles.recGrid}>
            {result.healthScore < 50 && (
              <div className={`${styles.recCard} ${styles.critical}`}>
                <div className={styles.recIcon}>⚠️</div>
                <h3>Critical Attention Needed</h3>
                <p>
                  This reef shows signs of significant stress. Consider implementing
                  protective measures and increasing monitoring frequency.
                </p>
              </div>
            )}
            {result.healthScore >= 50 && result.healthScore < 75 && (
              <div className={`${styles.recCard} ${styles.warning}`}>
                <div className={styles.recIcon}>👁️</div>
                <h3>Monitor Closely</h3>
                <p>
                  This reef is at risk. Regular monitoring and proactive conservation
                  efforts are recommended.
                </p>
              </div>
            )}
            {result.healthScore >= 75 && (
              <div className={`${styles.recCard} ${styles.healthy}`}>
                <div className={styles.recIcon}>✅</div>
                <h3>Healthy Ecosystem</h3>
                <p>
                  This reef is in good condition. Continue current conservation practices
                  and periodic monitoring.
                </p>
              </div>
            )}
            <div className={styles.recCard}>
              <div className={styles.recIcon}>📊</div>
              <h3>Track Changes</h3>
              <p>
                Upload periodic footage to track ecosystem changes over time and identify
                trends.
              </p>
            </div>
            <div className={styles.recCard}>
              <div className={styles.recIcon}>🌍</div>
              <h3>Share Data</h3>
              <p>
                Consider sharing your findings with local conservation organizations and
                research institutions.
              </p>
            </div>
          </div>
        </div>

        <div className={styles.actions}>
          <Link to="/" className={styles.mapLink}>
            View on Global Map
          </Link>
          <Link to="/dashboard" className={styles.dashboardLink}>
            Go to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
