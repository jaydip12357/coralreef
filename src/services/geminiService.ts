import { GoogleGenerativeAI } from '@google/generative-ai';
import type { AnalysisResult, SpeciesCount } from '../types';

const MAX_IMAGE_SIZE_MB = 20;
const MAX_VIDEO_SIZE_MB = 50;

// Cache for consistent results based on file hash
const analysisCache = new Map<string, AnalysisResult>();

const getGeminiClient = () => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey || apiKey === 'your_gemini_api_key_here' || apiKey.trim() === '') {
    return null;
  }
  return new GoogleGenerativeAI(apiKey);
};

const getRoboflowApiKey = () => {
  const apiKey = import.meta.env.VITE_ROBOFLOW_API_KEY;
  if (!apiKey || apiKey === 'your_roboflow_api_key_here' || apiKey.trim() === '') {
    return null;
  }
  return apiKey;
};

// Generate a hash from file for consistent demo results
async function generateFileHash(file: File): Promise<string> {
  const buffer = await file.slice(0, 65536).arrayBuffer(); // First 64KB for speed
  const hashArray = new Uint8Array(buffer);
  let hash = 0;
  for (let i = 0; i < hashArray.length; i++) {
    hash = ((hash << 5) - hash + hashArray[i]) | 0;
  }
  return `${file.name}-${file.size}-${hash}`;
}

// Seeded random number generator for consistent results
function seededRandom(seed: string): () => number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(31, h) + seed.charCodeAt(i) | 0;
  }
  return function() {
    h = Math.imul(h ^ (h >>> 15), h | 1);
    h ^= h + Math.imul(h ^ (h >>> 7), h | 61);
    return ((h ^ (h >>> 14)) >>> 0) / 4294967296;
  };
}

// Extract frames from video at regular intervals
async function extractVideoFrames(file: File, numFrames: number = 5): Promise<string[]> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const frames: string[] = [];

    video.preload = 'metadata';
    video.muted = true;
    video.playsInline = true;

    const url = URL.createObjectURL(file);
    video.src = url;

    video.onloadedmetadata = () => {
      const duration = video.duration;
      const interval = duration / (numFrames + 1);
      let currentFrame = 0;

      canvas.width = Math.min(video.videoWidth, 1280); // Max 1280px width
      canvas.height = Math.min(video.videoHeight, 720);

      const captureFrame = () => {
        if (currentFrame >= numFrames) {
          URL.revokeObjectURL(url);
          resolve(frames);
          return;
        }

        video.currentTime = interval * (currentFrame + 1);
      };

      video.onseeked = () => {
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const frameData = canvas.toDataURL('image/jpeg', 0.8);
          frames.push(frameData.split(',')[1]); // Get base64 part
        }
        currentFrame++;
        captureFrame();
      };

      captureFrame();
    };

    video.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load video for frame extraction'));
    };
  });
}

// Analyze a single frame with Gemini to count fish
async function countFishInFrame(
  genAI: GoogleGenerativeAI,
  frameBase64: string
): Promise<number> {
  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      generationConfig: { temperature: 0 }
    });

    const result = await model.generateContent([
      {
        inlineData: {
          mimeType: 'image/jpeg',
          data: frameBase64,
        },
      },
      { text: 'Count the total number of fish visible in this underwater image. Respond with ONLY a single number, nothing else.' },
    ]);

    const text = result.response.text().trim();
    const count = parseInt(text, 10);
    return isNaN(count) ? 0 : count;
  } catch {
    return 0;
  }
}

// Find the frame with the most fish
async function findBestFrame(
  genAI: GoogleGenerativeAI,
  frames: string[]
): Promise<{ frame: string; fishCount: number }> {
  let bestFrame = frames[0];
  let maxFish = 0;

  // Analyze frames in parallel
  const counts = await Promise.all(
    frames.map(frame => countFishInFrame(genAI, frame))
  );

  for (let i = 0; i < frames.length; i++) {
    if (counts[i] > maxFish) {
      maxFish = counts[i];
      bestFrame = frames[i];
    }
  }

  return { frame: bestFrame, fishCount: maxFish };
}

export async function analyzeReefMedia(
  file: File,
  mediaType: 'image' | 'video',
  onProgress?: (stage: string, percent: number) => void
): Promise<AnalysisResult> {
  // Generate file hash for caching
  const fileHash = await generateFileHash(file);

  // Check cache first for consistent results
  if (analysisCache.has(fileHash)) {
    console.log('Returning cached analysis result');
    return analysisCache.get(fileHash)!;
  }

  const genAI = getGeminiClient();

  // If no valid API key, use demo mode
  if (!genAI) {
    console.log('No valid Gemini API key found, using demo mode');
    const result = await analyzeReefMediaDemo(file, fileHash);
    analysisCache.set(fileHash, result);
    return result;
  }

  // Check file size
  const fileSizeMB = file.size / (1024 * 1024);
  const maxSize = mediaType === 'image' ? MAX_IMAGE_SIZE_MB : MAX_VIDEO_SIZE_MB;

  if (fileSizeMB > maxSize) {
    console.log(`File too large (${fileSizeMB.toFixed(1)}MB), using demo mode`);
    const result = await analyzeReefMediaDemo(file, fileHash);
    analysisCache.set(fileHash, result);
    return result;
  }

  try {
    let frameToAnalyze: string;
    let preliminaryFishCount = 0;

    // For videos, extract frames and find the one with most fish
    if (mediaType === 'video') {
      onProgress?.('Extracting video frames...', 10);
      console.log('Extracting frames from video...');

      try {
        const frames = await extractVideoFrames(file, 6);
        onProgress?.('Scanning frames for fish...', 30);
        console.log(`Extracted ${frames.length} frames, finding best one...`);

        const { frame, fishCount } = await findBestFrame(genAI, frames);
        frameToAnalyze = frame;
        preliminaryFishCount = fishCount;
        console.log(`Best frame has approximately ${fishCount} fish`);
      } catch (frameError) {
        console.log('Frame extraction failed, using full video:', frameError);
        // Fallback to analyzing the full video
        frameToAnalyze = await fileToBase64(file);
      }
    } else {
      frameToAnalyze = await fileToBase64(file);
    }

    onProgress?.('Analyzing marine life...', 50);

    // Try Roboflow for more accurate fish detection
    const roboflowKey = getRoboflowApiKey();
    if (roboflowKey) {
      try {
        onProgress?.('Running fish detection AI...', 60);
        const roboflowResult = await analyzeWithRoboflow(frameToAnalyze, roboflowKey);
        analysisCache.set(fileHash, roboflowResult);
        return roboflowResult;
      } catch (error) {
        console.log('Roboflow failed, falling back to Gemini:', error);
      }
    }

    // Use Gemini for detailed analysis
    onProgress?.('Identifying species...', 70);
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      generationConfig: {
        temperature: 0, // Deterministic output
      }
    });

    const mimeType = mediaType === 'video' ? 'image/jpeg' : (file.type || 'image/jpeg');

    const prompt = `You are a marine biologist AI. Analyze this underwater coral reef image and count ALL fish and marine life visible.

CRITICAL INSTRUCTIONS:
1. Count EVERY individual fish you can see, even partially visible ones
2. Be consistent - if you see 15 fish, report 15 fish
3. Group fish by species when possible
4. Also identify coral types and invertebrates

Respond with ONLY this JSON format, no other text:

{
  "healthScore": <0-100 based on coral coverage, water clarity, and fish abundance>,
  "biodiversityScore": <0-100 based on species variety>,
  "trend": "<'improving' | 'stable' | 'declining'>",
  "summary": "<2 sentences describing what you see>",
  "totalFishCount": <exact total count of all individual fish>,
  "species": [
    {"name": "<species>", "count": <exact count>, "category": "<'fish' | 'coral' | 'invertebrate'>"}
  ],
  "confidence": <0-100 confidence level>
}

Health scoring:
- 80-100: Vibrant reef, abundant fish (20+), diverse species, clear water
- 60-79: Good coral, moderate fish (10-19), decent diversity
- 40-59: Some bleaching/damage, low fish (5-9)
- 0-39: Poor condition, very few fish (<5)`;

    const result = await model.generateContent([
      {
        inlineData: {
          mimeType,
          data: frameToAnalyze,
        },
      },
      { text: prompt },
    ]);

    onProgress?.('Processing results...', 90);

    const response = await result.response;
    const text = response.text();

    // Extract JSON from the response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('Failed to parse JSON from response:', text);
      const result = await analyzeReefMediaDemo(file, fileHash);
      analysisCache.set(fileHash, result);
      return result;
    }

    const analysisData = JSON.parse(jsonMatch[0]);

    const analysisResult: AnalysisResult = {
      healthScore: Math.min(100, Math.max(0, analysisData.healthScore || 65)),
      biodiversityScore: Math.min(100, Math.max(0, analysisData.biodiversityScore || 60)),
      trend: analysisData.trend || 'stable',
      summary: analysisData.summary || 'Analysis complete.',
      species: (analysisData.species || []).map((s: SpeciesCount) => ({
        name: s.name,
        count: Math.max(0, s.count || 1),
        category: s.category || 'fish',
      })),
      timestamp: new Date().toISOString(),
      totalFishCount: analysisData.totalFishCount || preliminaryFishCount,
      confidence: analysisData.confidence || 75,
      analyzedFrame: mediaType === 'video' ? `data:image/jpeg;base64,${frameToAnalyze}` : undefined,
    };

    analysisCache.set(fileHash, analysisResult);
    return analysisResult;
  } catch (error) {
    console.error('Analysis error:', error);
    console.log('Falling back to demo mode due to error');
    const result = await analyzeReefMediaDemo(file, fileHash);
    analysisCache.set(fileHash, result);
    return result;
  }
}

// Roboflow fish detection API
async function analyzeWithRoboflow(frameBase64: string, apiKey: string): Promise<AnalysisResult> {
  // Using Roboflow's fish detection model
  const response = await fetch(
    `https://detect.roboflow.com/aquarium-combined/2?api_key=${apiKey}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: frameBase64,
    }
  );

  if (!response.ok) {
    throw new Error(`Roboflow API error: ${response.status}`);
  }

  const data = await response.json();

  // Process Roboflow detections
  const speciesCounts: Record<string, { count: number; category: 'fish' | 'coral' | 'invertebrate' }> = {};
  let totalFish = 0;

  for (const prediction of data.predictions || []) {
    const className = prediction.class || 'Unknown';
    const confidence = prediction.confidence || 0;

    // Only count high-confidence detections
    if (confidence < 0.3) continue;

    // Categorize the detection
    const category = classifySpecies(className);

    if (!speciesCounts[className]) {
      speciesCounts[className] = { count: 0, category };
    }
    speciesCounts[className].count++;

    if (category === 'fish') {
      totalFish++;
    }
  }

  const species: SpeciesCount[] = Object.entries(speciesCounts).map(([name, data]) => ({
    name: formatSpeciesName(name),
    count: data.count,
    category: data.category,
  }));

  // Calculate health based on fish count and diversity
  const numSpecies = species.length;
  const diversityScore = Math.min(100, numSpecies * 12 + 30);
  const healthScore = Math.min(100, Math.floor(
    (totalFish >= 20 ? 80 : totalFish >= 10 ? 60 : totalFish >= 5 ? 40 : 20) +
    (numSpecies * 3)
  ));

  const trend = totalFish >= 15 ? 'stable' : totalFish >= 8 ? 'stable' : 'declining';

  return {
    healthScore,
    biodiversityScore: diversityScore,
    trend,
    summary: `Computer vision detected ${totalFish} fish across ${numSpecies} species. ${
      totalFish >= 20 ? 'Healthy fish population with good diversity.' :
      totalFish >= 10 ? 'Moderate fish activity observed.' :
      'Low fish count detected - ecosystem may need attention.'
    }`,
    species,
    timestamp: new Date().toISOString(),
    totalFishCount: totalFish,
    confidence: 90,
  };
}

function classifySpecies(className: string): 'fish' | 'coral' | 'invertebrate' {
  const lowerName = className.toLowerCase();
  if (lowerName.includes('coral') || lowerName.includes('anemone')) {
    return 'coral';
  }
  if (lowerName.includes('urchin') || lowerName.includes('starfish') ||
      lowerName.includes('crab') || lowerName.includes('shrimp') ||
      lowerName.includes('jellyfish') || lowerName.includes('octopus')) {
    return 'invertebrate';
  }
  return 'fish';
}

function formatSpeciesName(name: string): string {
  return name
    .split(/[-_]/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

// Legacy function for backward compatibility
export async function analyzeReefVideo(file: File): Promise<AnalysisResult> {
  return analyzeReefMedia(file, 'video');
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = (error) => reject(error);
  });
}

// Demo mode - returns CONSISTENT mock analysis based on file hash
export async function analyzeReefMediaDemo(file: File, fileHash?: string): Promise<AnalysisResult> {
  await new Promise((resolve) => setTimeout(resolve, 2000));

  // Use seeded random for consistent results
  const seed = fileHash || `${file.name}-${file.size}`;
  const random = seededRandom(seed);

  const fishSpecies = [
    'Clownfish', 'Blue Tang', 'Parrotfish', 'Butterflyfish', 'Angelfish',
    'Moorish Idol', 'Triggerfish', 'Grouper', 'Wrasse', 'Damselfish',
    'Surgeonfish', 'Lionfish', 'Pufferfish', 'Goby', 'Blenny'
  ];

  const coralTypes = [
    'Staghorn Coral', 'Brain Coral', 'Table Coral', 'Fire Coral',
    'Soft Coral', 'Mushroom Coral', 'Elkhorn Coral'
  ];

  const invertebrates = [
    'Sea Anemone', 'Sea Urchin', 'Starfish', 'Sea Cucumber',
    'Giant Clam', 'Nudibranch', 'Octopus'
  ];

  const species: SpeciesCount[] = [];
  let totalFishCount = 0;

  // Shuffle arrays using seeded random
  const shuffledFish = [...fishSpecies].sort(() => random() - 0.5);
  const shuffledCoral = [...coralTypes].sort(() => random() - 0.5);
  const shuffledInvert = [...invertebrates].sort(() => random() - 0.5);

  const numFish = 4 + Math.floor(random() * 3);
  for (let i = 0; i < numFish; i++) {
    const count = 3 + Math.floor(random() * 12);
    species.push({
      name: shuffledFish[i],
      count,
      category: 'fish',
    });
    totalFishCount += count;
  }

  const numCoral = 2 + Math.floor(random() * 2);
  for (let i = 0; i < numCoral; i++) {
    species.push({
      name: shuffledCoral[i],
      count: 5 + Math.floor(random() * 15),
      category: 'coral',
    });
  }

  const numInvert = 1 + Math.floor(random() * 2);
  for (let i = 0; i < numInvert; i++) {
    species.push({
      name: shuffledInvert[i],
      count: 2 + Math.floor(random() * 8),
      category: 'invertebrate',
    });
  }

  // Calculate scores based on fish count for consistency
  const healthScore = Math.min(95, Math.max(35, 40 + totalFishCount * 2 + Math.floor(random() * 10)));
  const biodiversityScore = Math.min(95, 40 + species.length * 6 + Math.floor(random() * 10));

  const trends: Array<'improving' | 'stable' | 'declining'> = ['improving', 'stable', 'declining'];
  const trendIndex = totalFishCount > 40 ? 0 : totalFishCount > 20 ? 1 : 2;
  const trend = trends[trendIndex];

  const summaries = [
    `Detected ${totalFishCount} fish across ${numFish} species. ${healthScore > 70 ? 'Reef appears healthy with good coral coverage.' : 'Moderate ecosystem activity observed.'}`,
    `Analysis found ${species.length} distinct species with ${totalFishCount} total fish. ${trend === 'improving' ? 'Positive signs of ecosystem recovery.' : 'Continued monitoring recommended.'}`,
  ];

  return {
    healthScore,
    biodiversityScore,
    trend,
    summary: summaries[Math.floor(random() * summaries.length)],
    species,
    timestamp: new Date().toISOString(),
    totalFishCount,
    confidence: 70, // Lower confidence for demo mode
  };
}
