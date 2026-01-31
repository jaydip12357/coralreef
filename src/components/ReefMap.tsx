import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import { useEffect } from 'react';
import type { ReefLocation } from '../types';
import styles from './ReefMap.module.css';

interface ReefMapProps {
  locations: ReefLocation[];
  selectedLocation?: ReefLocation | null;
  onLocationSelect?: (location: ReefLocation) => void;
}

function getHealthColor(score: number): string {
  if (score >= 75) return '#22c55e'; // Green - Healthy
  if (score >= 50) return '#eab308'; // Yellow - At Risk
  return '#ef4444'; // Red - Critical
}

function getHealthLabel(score: number): string {
  if (score >= 75) return 'Healthy';
  if (score >= 50) return 'At Risk';
  return 'Critical';
}

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

function MapController({ selectedLocation }: { selectedLocation?: ReefLocation | null }) {
  const map = useMap();

  useEffect(() => {
    if (selectedLocation) {
      map.flyTo([selectedLocation.lat, selectedLocation.lng], 6, {
        duration: 1.5,
      });
    }
  }, [selectedLocation, map]);

  return null;
}

export default function ReefMap({ locations, selectedLocation, onLocationSelect }: ReefMapProps) {
  return (
    <div className={styles.mapWrapper}>
      <MapContainer
        center={[20, 0]}
        zoom={2}
        className={styles.map}
        scrollWheelZoom={true}
        minZoom={2}
        maxZoom={12}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />
        <MapController selectedLocation={selectedLocation} />

        {locations.map((location) => (
          <CircleMarker
            key={location.id}
            center={[location.lat, location.lng]}
            radius={12}
            pathOptions={{
              color: getHealthColor(location.healthScore),
              fillColor: getHealthColor(location.healthScore),
              fillOpacity: 0.7,
              weight: 2,
            }}
            eventHandlers={{
              click: () => onLocationSelect?.(location),
            }}
          >
            <Popup>
              <div className={styles.popup}>
                <h3 className={styles.popupTitle}>{location.name}</h3>
                <p className={styles.popupRegion}>{location.region}</p>

                <div className={styles.popupStats}>
                  <div className={styles.popupStat}>
                    <span className={styles.popupLabel}>Health Score</span>
                    <span
                      className={styles.popupValue}
                      style={{ color: getHealthColor(location.healthScore) }}
                    >
                      {location.healthScore}
                    </span>
                  </div>
                  <div className={styles.popupStat}>
                    <span className={styles.popupLabel}>Status</span>
                    <span
                      className={styles.popupBadge}
                      style={{ backgroundColor: getHealthColor(location.healthScore) }}
                    >
                      {getHealthLabel(location.healthScore)}
                    </span>
                  </div>
                </div>

                <div className={styles.popupTrend}>
                  <span>Trend:</span>
                  <span style={{ color: getTrendColor(location.trend) }}>
                    {getTrendIcon(location.trend)} {location.trend}
                  </span>
                </div>

                <div className={styles.popupSpecies}>
                  <span className={styles.popupLabel}>Species Identified:</span>
                  <span>{location.species.length}</span>
                </div>

                <p className={styles.popupDate}>
                  Last updated: {new Date(location.lastUpdated).toLocaleDateString()}
                </p>
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>

      <div className={styles.legend}>
        <h4 className={styles.legendTitle}>Reef Health</h4>
        <div className={styles.legendItem}>
          <span className={styles.legendDot} style={{ backgroundColor: '#22c55e' }}></span>
          <span>Healthy (75-100)</span>
        </div>
        <div className={styles.legendItem}>
          <span className={styles.legendDot} style={{ backgroundColor: '#eab308' }}></span>
          <span>At Risk (50-74)</span>
        </div>
        <div className={styles.legendItem}>
          <span className={styles.legendDot} style={{ backgroundColor: '#ef4444' }}></span>
          <span>Critical (0-49)</span>
        </div>
      </div>
    </div>
  );
}
