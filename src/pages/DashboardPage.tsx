import { Link } from 'react-router-dom';
import { reefLocations, demoAlerts, demoUploads } from '../data/reefLocations';
import styles from './DashboardPage.module.css';

function getHealthColor(score: number): string {
  if (score >= 75) return '#22c55e';
  if (score >= 50) return '#eab308';
  return '#ef4444';
}

function getAlertIcon(type: 'warning' | 'critical' | 'info'): string {
  switch (type) {
    case 'critical':
      return '🚨';
    case 'warning':
      return '⚠️';
    case 'info':
      return 'ℹ️';
    default:
      return '📢';
  }
}

function getAlertColor(type: 'warning' | 'critical' | 'info'): string {
  switch (type) {
    case 'critical':
      return '#ef4444';
    case 'warning':
      return '#eab308';
    case 'info':
      return '#3b82f6';
    default:
      return '#6b7280';
  }
}

function formatTimeAgo(timestamp: string): string {
  const now = new Date();
  const date = new Date(timestamp);
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  if (diffDays > 0) return `${diffDays}d ago`;
  if (diffHours > 0) return `${diffHours}h ago`;
  return 'Just now';
}

export default function DashboardPage() {
  const avgHealthScore = Math.round(
    reefLocations.reduce((sum, loc) => sum + loc.healthScore, 0) / reefLocations.length
  );

  const healthyCount = reefLocations.filter((loc) => loc.healthScore >= 75).length;
  const atRiskCount = reefLocations.filter(
    (loc) => loc.healthScore >= 50 && loc.healthScore < 75
  ).length;
  const criticalCount = reefLocations.filter((loc) => loc.healthScore < 50).length;

  const totalSpecies = new Set(
    reefLocations.flatMap((loc) => loc.species.map((s) => s.name))
  ).size;

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1>Dashboard</h1>
          <Link to="/upload" className={styles.uploadBtn}>
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M10 4V16M4 10H16"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
            Upload New Video
          </Link>
        </div>

        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>🌊</div>
            <div className={styles.statContent}>
              <span className={styles.statValue}>{reefLocations.length}</span>
              <span className={styles.statLabel}>Reefs Monitored</span>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>📊</div>
            <div className={styles.statContent}>
              <span className={styles.statValue}>{avgHealthScore}</span>
              <span className={styles.statLabel}>Avg Health Score</span>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>🐠</div>
            <div className={styles.statContent}>
              <span className={styles.statValue}>{totalSpecies}</span>
              <span className={styles.statLabel}>Species Identified</span>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>📹</div>
            <div className={styles.statContent}>
              <span className={styles.statValue}>{demoUploads.length}</span>
              <span className={styles.statLabel}>Videos Analyzed</span>
            </div>
          </div>
        </div>

        <div className={styles.healthOverview}>
          <h2>Reef Health Distribution</h2>
          <div className={styles.healthBars}>
            <div className={styles.healthBar}>
              <div className={styles.healthBarHeader}>
                <span className={styles.healthStatus}>
                  <span className={styles.statusDot} style={{ backgroundColor: '#22c55e' }}></span>
                  Healthy
                </span>
                <span className={styles.healthCount}>{healthyCount} reefs</span>
              </div>
              <div className={styles.barContainer}>
                <div
                  className={styles.barFill}
                  style={{
                    width: `${(healthyCount / reefLocations.length) * 100}%`,
                    backgroundColor: '#22c55e',
                  }}
                ></div>
              </div>
            </div>
            <div className={styles.healthBar}>
              <div className={styles.healthBarHeader}>
                <span className={styles.healthStatus}>
                  <span className={styles.statusDot} style={{ backgroundColor: '#eab308' }}></span>
                  At Risk
                </span>
                <span className={styles.healthCount}>{atRiskCount} reefs</span>
              </div>
              <div className={styles.barContainer}>
                <div
                  className={styles.barFill}
                  style={{
                    width: `${(atRiskCount / reefLocations.length) * 100}%`,
                    backgroundColor: '#eab308',
                  }}
                ></div>
              </div>
            </div>
            <div className={styles.healthBar}>
              <div className={styles.healthBarHeader}>
                <span className={styles.healthStatus}>
                  <span className={styles.statusDot} style={{ backgroundColor: '#ef4444' }}></span>
                  Critical
                </span>
                <span className={styles.healthCount}>{criticalCount} reefs</span>
              </div>
              <div className={styles.barContainer}>
                <div
                  className={styles.barFill}
                  style={{
                    width: `${(criticalCount / reefLocations.length) * 100}%`,
                    backgroundColor: '#ef4444',
                  }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.mainContent}>
          <div className={styles.uploadsSection}>
            <h2>Recent Uploads</h2>
            <div className={styles.uploadsList}>
              {demoUploads.map((upload) => (
                <div key={upload.id} className={styles.uploadCard}>
                  <div className={styles.uploadIcon}>📹</div>
                  <div className={styles.uploadInfo}>
                    <span className={styles.uploadFilename}>{upload.filename}</span>
                    <span className={styles.uploadLocation}>{upload.location}</span>
                    <span className={styles.uploadTime}>
                      {formatTimeAgo(upload.timestamp)}
                    </span>
                  </div>
                  <div className={styles.uploadScore}>
                    <span
                      className={styles.scoreValue}
                      style={{ color: getHealthColor(upload.healthScore) }}
                    >
                      {upload.healthScore}
                    </span>
                    <span className={styles.scoreLabel}>Health</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.alertsSection}>
            <h2>Alerts</h2>
            <div className={styles.alertsList}>
              {demoAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className={styles.alertCard}
                  style={{ borderLeftColor: getAlertColor(alert.type) }}
                >
                  <div className={styles.alertIcon}>{getAlertIcon(alert.type)}</div>
                  <div className={styles.alertContent}>
                    <p className={styles.alertMessage}>{alert.message}</p>
                    <div className={styles.alertMeta}>
                      <span>{alert.location}</span>
                      <span>•</span>
                      <span>{formatTimeAgo(alert.timestamp)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className={styles.reefList}>
          <h2>All Monitored Reefs</h2>
          <div className={styles.reefTable}>
            <div className={styles.tableHeader}>
              <span>Reef Name</span>
              <span>Region</span>
              <span>Health Score</span>
              <span>Trend</span>
              <span>Last Updated</span>
            </div>
            {reefLocations.map((reef) => (
              <div key={reef.id} className={styles.tableRow}>
                <span className={styles.reefName}>{reef.name}</span>
                <span className={styles.reefRegion}>{reef.region}</span>
                <span className={styles.reefScore}>
                  <span
                    className={styles.scoreBadge}
                    style={{ backgroundColor: getHealthColor(reef.healthScore) }}
                  >
                    {reef.healthScore}
                  </span>
                </span>
                <span
                  className={styles.reefTrend}
                  style={{
                    color:
                      reef.trend === 'improving'
                        ? '#22c55e'
                        : reef.trend === 'declining'
                          ? '#ef4444'
                          : '#6b7280',
                  }}
                >
                  {reef.trend === 'improving' && '↑'}
                  {reef.trend === 'declining' && '↓'}
                  {reef.trend === 'stable' && '→'}
                  {' '}{reef.trend}
                </span>
                <span className={styles.reefDate}>
                  {new Date(reef.lastUpdated).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
