export interface ReefLocation {
  id: string;
  name: string;
  region: string;
  lat: number;
  lng: number;
  healthScore: number;
  trend: 'improving' | 'stable' | 'declining';
  lastUpdated: string;
  species: SpeciesCount[];
  biodiversityScore: number;
}

export interface SpeciesCount {
  name: string;
  count: number;
  category: 'fish' | 'coral' | 'invertebrate';
}

export interface AnalysisResult {
  healthScore: number;
  species: SpeciesCount[];
  biodiversityScore: number;
  trend: 'improving' | 'stable' | 'declining';
  summary: string;
  timestamp: string;
  totalFishCount?: number;
  confidence?: number;
  analyzedFrame?: string; // Base64 of the frame that was analyzed (for videos)
}

export interface UploadRecord {
  id: string;
  filename: string;
  location: string;
  timestamp: string;
  healthScore: number;
  status: 'processing' | 'completed' | 'failed';
}

export interface Alert {
  id: string;
  type: 'warning' | 'critical' | 'info';
  message: string;
  location: string;
  timestamp: string;
}
