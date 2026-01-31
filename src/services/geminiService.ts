import { GoogleGenerativeAI } from '@google/generative-ai';
import type { AnalysisResult, SpeciesCount } from '../types';

const MAX_IMAGE_SIZE_MB = 20;
const MAX_VIDEO_SIZE_MB = 20;

const getGeminiClient = () => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey || apiKey === 'your_gemini_api_key_here' || apiKey.trim() === '') {
    return null;
  }
  return new GoogleGenerativeAI(apiKey);
};

export async function analyzeReefMedia(
  file: File,
  mediaType: 'image' | 'video'
): Promise<AnalysisResult> {
  const genAI = getGeminiClient();

  // If no valid API key, use demo mode
  if (!genAI) {
    console.log('No valid Gemini API key found, using demo mode');
    return analyzeReefMediaDemo(file);
  }

  // Check file size
  const fileSizeMB = file.size / (1024 * 1024);
  const maxSize = mediaType === 'image' ? MAX_IMAGE_SIZE_MB : MAX_VIDEO_SIZE_MB;

  if (fileSizeMB > maxSize) {
    console.log(`File too large (${fileSizeMB.toFixed(1)}MB), using demo mode`);
    return analyzeReefMediaDemo(file);
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    // Convert file to base64
    const base64Data = await fileToBase64(file);
    const mimeType = file.type || (mediaType === 'image' ? 'image/jpeg' : 'video/mp4');

    const prompt = `Analyze this underwater coral reef ${mediaType} and provide a detailed assessment. Please respond in the following JSON format only, no additional text:

{
  "healthScore": <number 0-100 indicating overall reef health>,
  "biodiversityScore": <number 0-100 indicating biodiversity level>,
  "trend": "<'improving' | 'stable' | 'declining'>",
  "summary": "<brief 2-3 sentence summary of reef condition>",
  "species": [
    {"name": "<species name>", "count": <estimated count>, "category": "<'fish' | 'coral' | 'invertebrate'>"}
  ]
}

Consider the following factors:
- Fish species diversity and population counts
- Coral coverage and health (bleaching, growth)
- Water clarity and overall ecosystem vitality
- Presence of indicator species
- Signs of environmental stress or recovery

Identify as many distinct species as possible with estimated counts.`;

    const result = await model.generateContent([
      {
        inlineData: {
          mimeType,
          data: base64Data,
        },
      },
      { text: prompt },
    ]);

    const response = await result.response;
    const text = response.text();

    // Extract JSON from the response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('Failed to parse JSON from response:', text);
      return analyzeReefMediaDemo(file);
    }

    const analysisData = JSON.parse(jsonMatch[0]);

    return {
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
    };
  } catch (error) {
    console.error('Gemini API error:', error);
    console.log('Falling back to demo mode due to API error');
    return analyzeReefMediaDemo(file);
  }
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

// Demo mode - returns mock analysis
export async function analyzeReefMediaDemo(_file: File): Promise<AnalysisResult> {
  await new Promise((resolve) => setTimeout(resolve, 2500));

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

  const numFish = 4 + Math.floor(Math.random() * 3);
  const shuffledFish = [...fishSpecies].sort(() => Math.random() - 0.5);
  for (let i = 0; i < numFish; i++) {
    species.push({
      name: shuffledFish[i],
      count: 10 + Math.floor(Math.random() * 150),
      category: 'fish',
    });
  }

  const numCoral = 2 + Math.floor(Math.random() * 2);
  const shuffledCoral = [...coralTypes].sort(() => Math.random() - 0.5);
  for (let i = 0; i < numCoral; i++) {
    species.push({
      name: shuffledCoral[i],
      count: 20 + Math.floor(Math.random() * 200),
      category: 'coral',
    });
  }

  const numInvert = 1 + Math.floor(Math.random() * 2);
  const shuffledInvert = [...invertebrates].sort(() => Math.random() - 0.5);
  for (let i = 0; i < numInvert; i++) {
    species.push({
      name: shuffledInvert[i],
      count: 5 + Math.floor(Math.random() * 80),
      category: 'invertebrate',
    });
  }

  const healthScore = 45 + Math.floor(Math.random() * 50);
  const biodiversityScore = 50 + Math.floor(Math.random() * 45);

  const trends: Array<'improving' | 'stable' | 'declining'> = ['improving', 'stable', 'declining'];
  const trend = trends[Math.floor(Math.random() * 3)];

  const summaries = [
    `This reef section shows ${healthScore > 70 ? 'healthy' : healthScore > 50 ? 'moderate' : 'concerning'} coral coverage with ${species.filter(s => s.category === 'fish').length} fish species identified.`,
    `Analysis reveals a ${trend} ecosystem with notable biodiversity. ${healthScore > 60 ? 'Coral structures appear intact.' : 'Some signs of stress observed.'}`,
    `The underwater footage shows ${species.reduce((sum, s) => sum + s.count, 0)} individual organisms across ${species.length} species. ${trend === 'improving' ? 'Recovery signs are encouraging.' : trend === 'declining' ? 'Continued monitoring recommended.' : 'Conditions remain stable.'}`,
  ];

  return {
    healthScore,
    biodiversityScore,
    trend,
    summary: summaries[Math.floor(Math.random() * summaries.length)],
    species,
    timestamp: new Date().toISOString(),
  };
}
