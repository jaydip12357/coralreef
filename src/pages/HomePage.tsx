import { useState } from 'react';
import { Link } from 'react-router-dom';
import ReefMap from '../components/ReefMap';
import HealthScore from '../components/HealthScore';
import { reefLocations } from '../data/reefLocations';
import type { ReefLocation } from '../types';
import styles from './HomePage.module.css';

export default function HomePage() {
  const [selectedLocation, setSelectedLocation] = useState<ReefLocation | null>(null);

  const avgHealthScore = Math.round(
    reefLocations.reduce((sum, loc) => sum + loc.healthScore, 0) / reefLocations.length
  );

  const healthyCount = reefLocations.filter((loc) => loc.healthScore >= 75).length;
  const atRiskCount = reefLocations.filter(
    (loc) => loc.healthScore >= 50 && loc.healthScore < 75
  ).length;
  const criticalCount = reefLocations.filter((loc) => loc.healthScore < 50).length;

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <h1>Global Coral Reef Health Monitor</h1>
          <p>
            AI-powered analysis of coral reef ecosystems worldwide. Upload underwater
            footage to contribute to reef conservation efforts.
          </p>
          <div className={styles.heroActions}>
            <Link to="/upload" className={styles.primaryBtn}>
              Upload Footage
            </Link>
            <Link to="/dashboard" className={styles.secondaryBtn}>
              View Dashboard
            </Link>
          </div>
        </div>
        <div className={styles.heroStats}>
          <div className={styles.statCard}>
            <span className={styles.statValue}>{reefLocations.length}</span>
            <span className={styles.statLabel}>Reefs Monitored</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statValue}>{avgHealthScore}</span>
            <span className={styles.statLabel}>Avg Health Score</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statValue} style={{ color: '#22c55e' }}>
              {healthyCount}
            </span>
            <span className={styles.statLabel}>Healthy</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statValue} style={{ color: '#eab308' }}>
              {atRiskCount}
            </span>
            <span className={styles.statLabel}>At Risk</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statValue} style={{ color: '#ef4444' }}>
              {criticalCount}
            </span>
            <span className={styles.statLabel}>Critical</span>
          </div>
        </div>
      </section>

      <section className={styles.mapSection}>
        <div className={styles.mapContainer}>
          <ReefMap
            locations={reefLocations}
            selectedLocation={selectedLocation}
            onLocationSelect={setSelectedLocation}
          />
        </div>

        {selectedLocation && (
          <div className={styles.detailPanel}>
            <button
              className={styles.closeBtn}
              onClick={() => setSelectedLocation(null)}
              aria-label="Close panel"
            >
              ×
            </button>
            <div className={styles.detailHeader}>
              <h2>{selectedLocation.name}</h2>
              <p>{selectedLocation.region}</p>
            </div>

            <div className={styles.detailScore}>
              <HealthScore score={selectedLocation.healthScore} size="medium" />
            </div>

            <div className={styles.detailStats}>
              <div className={styles.detailStat}>
                <span className={styles.detailLabel}>Biodiversity Score</span>
                <span className={styles.detailValue}>
                  {selectedLocation.biodiversityScore}
                </span>
              </div>
              <div className={styles.detailStat}>
                <span className={styles.detailLabel}>Trend</span>
                <span
                  className={styles.detailValue}
                  style={{
                    color:
                      selectedLocation.trend === 'improving'
                        ? '#22c55e'
                        : selectedLocation.trend === 'declining'
                          ? '#ef4444'
                          : '#6b7280',
                  }}
                >
                  {selectedLocation.trend === 'improving' && '↑ '}
                  {selectedLocation.trend === 'declining' && '↓ '}
                  {selectedLocation.trend === 'stable' && '→ '}
                  {selectedLocation.trend.charAt(0).toUpperCase() +
                    selectedLocation.trend.slice(1)}
                </span>
              </div>
              <div className={styles.detailStat}>
                <span className={styles.detailLabel}>Species Identified</span>
                <span className={styles.detailValue}>
                  {selectedLocation.species.length}
                </span>
              </div>
            </div>

            <div className={styles.speciesList}>
              <h3>Top Species</h3>
              <ul>
                {selectedLocation.species.slice(0, 5).map((s, i) => (
                  <li key={i}>
                    <span>{s.name}</span>
                    <span className={styles.speciesCount}>{s.count}</span>
                  </li>
                ))}
              </ul>
            </div>

            <p className={styles.lastUpdated}>
              Last updated: {new Date(selectedLocation.lastUpdated).toLocaleDateString()}
            </p>
          </div>
        )}
      </section>

      <section className={styles.features}>
        <h2>How It Works</h2>
        <div className={styles.featureGrid}>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>📹</div>
            <h3>Upload Video</h3>
            <p>
              Upload underwater reef footage in MP4 or MOV format for AI analysis.
            </p>
          </div>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>🤖</div>
            <h3>AI Analysis</h3>
            <p>
              Our AI identifies fish species, counts populations, and assesses reef
              health.
            </p>
          </div>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>📊</div>
            <h3>Get Results</h3>
            <p>
              Receive detailed health scores, species breakdowns, and trend analysis.
            </p>
          </div>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>🌍</div>
            <h3>Global Impact</h3>
            <p>
              Contribute to worldwide reef monitoring and conservation efforts.
            </p>
          </div>
        </div>
      </section>

      <section className={styles.liveStream}>
        <h2>Live Reef Camera</h2>
        <p className={styles.liveStreamDescription}>
          Watch coral reef ecosystems in real-time from underwater cameras around the world
        </p>
        <div className={styles.monitorFrame}>
          <div className={styles.monitorHeader}>
            <div className={styles.monitorHeaderLeft}>
              <span className={styles.liveDot}></span>
              <span className={styles.liveText}>LIVE</span>
              <span className={styles.cameraId}>CAM-01</span>
            </div>
            <div className={styles.monitorHeaderRight}>
              <span>CORAL REEF MONITORING STATION</span>
            </div>
          </div>
          <div className={styles.videoWrapper}>
            <iframe
              src="https://www.youtube.com/embed/THnF0IQ8JJM?autoplay=1&mute=1&controls=0&modestbranding=1&rel=0&showinfo=0&loop=1&playlist=THnF0IQ8JJM"
              title="Live Coral Reef Camera"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
            <div className={styles.videoOverlay}>
              <div className={styles.overlayCorner + ' ' + styles.topLeft}></div>
              <div className={styles.overlayCorner + ' ' + styles.topRight}></div>
              <div className={styles.overlayCorner + ' ' + styles.bottomLeft}></div>
              <div className={styles.overlayCorner + ' ' + styles.bottomRight}></div>
            </div>
          </div>
          <div className={styles.monitorFooter}>
            <div className={styles.monitorStats}>
              <span>DEPTH: 12m</span>
              <span>TEMP: 26°C</span>
              <span>VISIBILITY: GOOD</span>
            </div>
            <div className={styles.monitorLocation}>
              <span>Great Barrier Reef, Australia</span>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.futureFeatures}>
        <h2>Coming Soon</h2>
        <div className={styles.futureGrid}>
          <div className={styles.futureCard}>
            <span className={styles.futureBadge}>Future</span>
            <h3>Multi-Camera Network</h3>
            <p>Access live feeds from multiple reef locations worldwide.</p>
          </div>
          <div className={styles.futureCard}>
            <span className={styles.futureBadge}>Future</span>
            <h3>Historical Data Analysis</h3>
            <p>Track reef health changes over time with comprehensive historical data.</p>
          </div>
          <div className={styles.futureCard}>
            <span className={styles.futureBadge}>Future</span>
            <h3>Alert System</h3>
            <p>Automated alerts for bleaching events, illegal fishing, and ecosystem changes.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
