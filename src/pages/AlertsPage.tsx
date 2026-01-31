import { useState } from 'react';
import { Link } from 'react-router-dom';
import styles from './AlertsPage.module.css';

interface Alert {
  id: string;
  type: 'critical' | 'warning' | 'info';
  title: string;
  message: string;
  location: string;
  coordinates: string;
  timestamp: string;
  status: 'active' | 'monitoring' | 'resolved';
  details: string[];
}

const alerts: Alert[] = [
  {
    id: 'a1',
    type: 'critical',
    title: 'Illegal Fishing Activity Detected',
    message: 'Unauthorized vessel detected in protected marine zone with fishing equipment deployed.',
    location: 'Florida Keys Marine Sanctuary',
    coordinates: '24.5551°N, 81.7800°W',
    timestamp: '2026-01-31T08:32:00Z',
    status: 'active',
    details: [
      'Vessel ID: Unknown (no AIS signal)',
      'Equipment: Long-line fishing gear detected',
      'Duration: Active for 2+ hours',
      'Local authorities notified at 08:45 UTC',
    ],
  },
  {
    id: 'a2',
    type: 'critical',
    title: 'Coral Bleaching Event',
    message: 'Significant coral bleaching observed across 40% of monitored reef section.',
    location: 'Great Barrier Reef - Outer Reef',
    coordinates: '18.2871°S, 147.6992°E',
    timestamp: '2026-01-30T14:15:00Z',
    status: 'monitoring',
    details: [
      'Water temperature: 29.2°C (2.1°C above average)',
      'Affected species: Acropora, Pocillopora',
      'Bleaching severity: Moderate to severe',
      'Marine biologists dispatched for assessment',
    ],
  },
  {
    id: 'a3',
    type: 'warning',
    title: 'Crown-of-Thorns Starfish Outbreak',
    message: 'Population density exceeds safe threshold. Reef degradation risk elevated.',
    location: 'Tubbataha Reef Natural Park',
    coordinates: '8.8500°N, 119.9167°E',
    timestamp: '2026-01-29T11:20:00Z',
    status: 'active',
    details: [
      'Population density: 1,200 per hectare',
      'Safe threshold: 300 per hectare',
      'Coral consumption rate: High',
      'Control measures being evaluated',
    ],
  },
  {
    id: 'a4',
    type: 'warning',
    title: 'Water Quality Degradation',
    message: 'Elevated sediment levels detected following recent storm activity.',
    location: 'Belize Barrier Reef',
    coordinates: '17.5000°N, 87.5000°W',
    timestamp: '2026-01-28T16:45:00Z',
    status: 'monitoring',
    details: [
      'Turbidity: 15 NTU (normal: <5 NTU)',
      'Visibility reduced to 8 meters',
      'Cause: Storm runoff and coastal erosion',
      'Expected to normalize within 72 hours',
    ],
  },
  {
    id: 'a5',
    type: 'info',
    title: 'Rare Species Sighting',
    message: 'Confirmed sighting of endangered hawksbill sea turtle nesting behavior.',
    location: 'Seychelles Reef - Aldabra Atoll',
    coordinates: '4.6796°S, 55.4920°E',
    timestamp: '2026-01-27T09:30:00Z',
    status: 'resolved',
    details: [
      'Species: Eretmochelys imbricata (Hawksbill)',
      'Behavior: Nesting preparation observed',
      'Nest protection measures activated',
      'Data shared with IUCN conservation team',
    ],
  },
  {
    id: 'a6',
    type: 'info',
    title: 'Reef Recovery Progress',
    message: 'Coral transplantation site showing 85% survival rate after 6 months.',
    location: 'Maldives - North Malé Atoll',
    coordinates: '3.2028°N, 73.2207°E',
    timestamp: '2026-01-26T13:00:00Z',
    status: 'resolved',
    details: [
      'Transplanted fragments: 2,400',
      'Survival rate: 85% (target: 70%)',
      'New growth observed on 60% of fragments',
      'Project expanded to additional sites',
    ],
  },
];

function getAlertIcon(type: 'critical' | 'warning' | 'info'): string {
  switch (type) {
    case 'critical':
      return '🚨';
    case 'warning':
      return '⚠️';
    case 'info':
      return 'ℹ️';
  }
}

function getStatusLabel(status: 'active' | 'monitoring' | 'resolved'): string {
  switch (status) {
    case 'active':
      return 'Active';
    case 'monitoring':
      return 'Monitoring';
    case 'resolved':
      return 'Resolved';
  }
}

function formatTime(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  if (diffHours > 0) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  return 'Just now';
}

export default function AlertsPage() {
  const [filter, setFilter] = useState<'all' | 'critical' | 'warning' | 'info'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'monitoring' | 'resolved'>('all');

  const filteredAlerts = alerts.filter((alert) => {
    if (filter !== 'all' && alert.type !== filter) return false;
    if (statusFilter !== 'all' && alert.status !== statusFilter) return false;
    return true;
  });

  const criticalCount = alerts.filter((a) => a.type === 'critical' && a.status === 'active').length;
  const warningCount = alerts.filter((a) => a.type === 'warning' && a.status !== 'resolved').length;
  const activeCount = alerts.filter((a) => a.status === 'active').length;

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.header}>
          <div>
            <h1>Alert System</h1>
            <p>Real-time monitoring alerts for reef ecosystems worldwide</p>
          </div>
          <Link to="/dashboard" className={styles.backBtn}>
            Back to Dashboard
          </Link>
        </div>

        <div className={styles.statsBar}>
          <div className={`${styles.statBadge} ${styles.critical}`}>
            <span className={styles.statCount}>{criticalCount}</span>
            <span className={styles.statLabel}>Critical</span>
          </div>
          <div className={`${styles.statBadge} ${styles.warning}`}>
            <span className={styles.statCount}>{warningCount}</span>
            <span className={styles.statLabel}>Warnings</span>
          </div>
          <div className={`${styles.statBadge} ${styles.active}`}>
            <span className={styles.statCount}>{activeCount}</span>
            <span className={styles.statLabel}>Active</span>
          </div>
          <div className={`${styles.statBadge} ${styles.total}`}>
            <span className={styles.statCount}>{alerts.length}</span>
            <span className={styles.statLabel}>Total Alerts</span>
          </div>
        </div>

        <div className={styles.filters}>
          <div className={styles.filterGroup}>
            <label>Type:</label>
            <select value={filter} onChange={(e) => setFilter(e.target.value as typeof filter)}>
              <option value="all">All Types</option>
              <option value="critical">Critical</option>
              <option value="warning">Warning</option>
              <option value="info">Info</option>
            </select>
          </div>
          <div className={styles.filterGroup}>
            <label>Status:</label>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}>
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="monitoring">Monitoring</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>
        </div>

        <div className={styles.alertsList}>
          {filteredAlerts.map((alert) => (
            <div key={alert.id} className={`${styles.alertCard} ${styles[alert.type]}`}>
              <div className={styles.alertHeader}>
                <div className={styles.alertTitle}>
                  <span className={styles.alertIcon}>{getAlertIcon(alert.type)}</span>
                  <h3>{alert.title}</h3>
                </div>
                <div className={`${styles.statusBadge} ${styles[alert.status]}`}>
                  {getStatusLabel(alert.status)}
                </div>
              </div>
              <p className={styles.alertMessage}>{alert.message}</p>
              <div className={styles.alertMeta}>
                <span className={styles.location}>📍 {alert.location}</span>
                <span className={styles.coordinates}>{alert.coordinates}</span>
                <span className={styles.time}>🕐 {formatTime(alert.timestamp)}</span>
              </div>
              <div className={styles.alertDetails}>
                <h4>Details</h4>
                <ul>
                  {alert.details.map((detail, index) => (
                    <li key={index}>{detail}</li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        {filteredAlerts.length === 0 && (
          <div className={styles.noAlerts}>
            <span>✓</span>
            <p>No alerts match your current filters</p>
          </div>
        )}
      </div>
    </div>
  );
}
