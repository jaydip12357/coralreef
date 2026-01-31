# ReefWatch AI

AI-powered coral reef monitoring platform that automates fish species identification and generates global reef health insights.

## Features

- **Video Upload & Analysis**: Upload underwater video (MP4, MOV) for AI-powered analysis
  - Fish species identification
  - Population counts
  - Biodiversity scoring
  - Reef health assessment (0-100)

- **Global Reef Health Heatmap**: Interactive world map showing reef health by location
  - Color-coded health status (Green: Healthy, Yellow: At Risk, Red: Critical)
  - Click locations to see detailed health data
  - Demo data for 13 major reef locations worldwide

- **Dashboard**: Overview of reef monitoring status
  - Recent uploads
  - Quick stats (Total reefs, average health score)
  - Alerts section

## Tech Stack

- **Frontend**: React + TypeScript + Vite
- **Map**: Leaflet.js with React-Leaflet
- **AI**: Google Gemini API for video analysis
- **Styling**: CSS Modules with Duke University theme colors

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- (Optional) Gemini API key for real video analysis

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd coralreef
```

2. Install dependencies:
```bash
npm install
```

3. (Optional) Set up Gemini API key:
```bash
cp .env.example .env
# Edit .env and add your Gemini API key
```

4. Start the development server:
```bash
npm run dev
```

5. Open http://localhost:5173 in your browser

### Demo Mode

If no Gemini API key is provided, the app runs in demo mode with simulated analysis results.

## Project Structure

```
src/
├── components/       # Reusable UI components
│   ├── Header.tsx
│   ├── ReefMap.tsx
│   ├── VideoUpload.tsx
│   ├── HealthScore.tsx
│   └── SpeciesTable.tsx
├── pages/           # Page components
│   ├── HomePage.tsx
│   ├── UploadPage.tsx
│   ├── ResultsPage.tsx
│   └── DashboardPage.tsx
├── data/            # Demo data
│   └── reefLocations.ts
├── services/        # API services
│   └── geminiService.ts
├── types/           # TypeScript types
│   └── index.ts
├── App.tsx
└── main.tsx
```

## Duke Theme Colors

- **Primary**: Duke Blue (#012169)
- **Accent**: Teal (#339898)
- **Health Status**:
  - Healthy: Green (#22c55e)
  - At Risk: Yellow (#eab308)
  - Critical: Red (#ef4444)

## License

MIT
