import { useState } from 'react';
import { Link } from 'react-router-dom';
import { reefLocations } from '../data/reefLocations';
import styles from './HistoricalPage.module.css';

interface DataPoint {
  month: string;
  healthScore: number;
  biodiversity: number;
  temperature: number;
}

const generateHistoricalData = (baseScore: number): DataPoint[] => {
  const months = ['Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan'];
  return months.map((month, index) => ({
    month,
    healthScore: Math.max(20, Math.min(100, baseScore + (Math.random() - 0.5) * 20 - index * 2)),
    biodiversity: Math.max(30, Math.min(100, baseScore + 10 + (Math.random() - 0.5) * 15)),
    temperature: 24 + Math.random() * 4 + index * 0.3,
  }));
};

export default function HistoricalPage() {
  const [selectedReef, setSelectedReef] = useState(reefLocations[0]);
  const historicalData = generateHistoricalData(selectedReef.healthScore);

  const maxHealth = Math.max(...historicalData.map((d) => d.healthScore));
  const minHealth = Math.min(...historicalData.map((d) => d.healthScore));
  const avgHealth = Math.round(historicalData.reduce((sum, d) => sum + d.healthScore, 0) / historicalData.length);
  const trend = historicalData[historicalData.length - 1].healthScore - historicalData[0].healthScore;

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.header}>
          <div>
            <h1>Historical Data Analysis</h1>
            <p>Track reef health changes over time</p>
          </div>
          <Link to="/dashboard" className={styles.backBtn}>
            Back to Dashboard
          </Link>
        </div>

        <div className={styles.reefSelector}>
          <label>Select Reef Location:</label>
          <select
            value={selectedReef.id}
            onChange={(e) => setSelectedReef(reefLocations.find((r) => r.id === e.target.value) || reefLocations[0])}
          >
            {reefLocations.map((reef) => (
              <option key={reef.id} value={reef.id}>
                {reef.name} - {reef.region}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <span className={styles.statLabel}>Current Score</span>
            <span className={styles.statValue}>{selectedReef.healthScore}</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statLabel}>6-Month Average</span>
            <span className={styles.statValue}>{avgHealth}</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statLabel}>Peak (6 mo)</span>
            <span className={styles.statValue} style={{ color: '#22c55e' }}>{Math.round(maxHealth)}</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statLabel}>Low (6 mo)</span>
            <span className={styles.statValue} style={{ color: '#ef4444' }}>{Math.round(minHealth)}</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statLabel}>Trend</span>
            <span className={styles.statValue} style={{ color: trend >= 0 ? '#22c55e' : '#ef4444' }}>
              {trend >= 0 ? '↑' : '↓'} {Math.abs(Math.round(trend))}%
            </span>
          </div>
        </div>

        <div className={styles.chartSection}>
          <h2>Health Score Trend</h2>
          <div className={styles.chart}>
            <div className={styles.yAxis}>
              <span>100</span>
              <span>75</span>
              <span>50</span>
              <span>25</span>
              <span>0</span>
            </div>
            <div className={styles.chartArea}>
              <div className={styles.gridLines}>
                <div className={styles.gridLine}></div>
                <div className={styles.gridLine}></div>
                <div className={styles.gridLine}></div>
                <div className={styles.gridLine}></div>
              </div>
              <div className={styles.bars}>
                {historicalData.map((data, index) => (
                  <div key={index} className={styles.barGroup}>
                    <div
                      className={styles.bar}
                      style={{
                        height: `${data.healthScore}%`,
                        backgroundColor:
                          data.healthScore >= 75 ? '#22c55e' : data.healthScore >= 50 ? '#eab308' : '#ef4444',
                      }}
                    >
                      <span className={styles.barValue}>{Math.round(data.healthScore)}</span>
                    </div>
                    <span className={styles.barLabel}>{data.month}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className={styles.metricsGrid}>
          <div className={styles.metricCard}>
            <h3>Biodiversity Index</h3>
            <div className={styles.metricChart}>
              {historicalData.map((data, index) => (
                <div key={index} className={styles.metricBar}>
                  <div
                    className={styles.metricFill}
                    style={{
                      width: `${data.biodiversity}%`,
                      backgroundColor: '#3b82f6',
                    }}
                  ></div>
                  <span>{data.month}</span>
                </div>
              ))}
            </div>
          </div>
          <div className={styles.metricCard}>
            <h3>Water Temperature (°C)</h3>
            <div className={styles.metricChart}>
              {historicalData.map((data, index) => (
                <div key={index} className={styles.metricBar}>
                  <div
                    className={styles.metricFill}
                    style={{
                      width: `${(data.temperature / 32) * 100}%`,
                      backgroundColor: data.temperature > 27 ? '#ef4444' : '#22c55e',
                    }}
                  ></div>
                  <span>{data.month}: {data.temperature.toFixed(1)}°C</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className={styles.insights}>
          <h2>Key Insights</h2>
          <div className={styles.insightsList}>
            <div className={styles.insight}>
              <span className={styles.insightIcon}>📊</span>
              <div>
                <h4>Health Score Analysis</h4>
                <p>
                  {selectedReef.name} has shown a {trend >= 0 ? 'positive' : 'negative'} trend over the past 6 months,
                  with health scores {trend >= 0 ? 'improving' : 'declining'} by approximately {Math.abs(Math.round(trend))} points.
                </p>
              </div>
            </div>
            <div className={styles.insight}>
              <span className={styles.insightIcon}>🌡️</span>
              <div>
                <h4>Temperature Impact</h4>
                <p>
                  Water temperatures have {historicalData[historicalData.length - 1].temperature > historicalData[0].temperature ? 'increased' : 'remained stable'}.
                  Elevated temperatures above 27°C may contribute to coral stress.
                </p>
              </div>
            </div>
            <div className={styles.insight}>
              <span className={styles.insightIcon}>🐠</span>
              <div>
                <h4>Biodiversity Status</h4>
                <p>
                  Species diversity remains {avgHealth > 70 ? 'strong' : avgHealth > 50 ? 'moderate' : 'concerning'} with {selectedReef.species.length} species identified in recent surveys.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
