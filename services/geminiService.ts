import { GoogleGenAI, Type } from "@google/genai";
import type { StoryboardFrame, ParsedScene } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

async function parseScriptToScenes(script: string): Promise<ParsedScene[]> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Parse the following film script into a JSON array of distinct scenes. Each object in the array should represent one scene. For each scene, provide a scene number, the setting, the characters present, and a concise description of the key action.
      
      Example:
      Script: "SCENE 1 INT. DINER - NIGHT. RACHEL sips coffee. LEO enters, looking nervous."
      Output: [{ "scene": 1, "setting": "Diner at night", "characters": ["Rachel", "Leo"], "action": "Rachel sips coffee as a nervous Leo enters." }]

      Now, parse this script:
      ---
      ${script}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              scene: { type: Type.INTEGER, description: "Scene number" },
              setting: { type: Type.STRING, description: "Description of the location and time." },
              characters: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "List of characters in the scene."
              },
              action: { type: Type.STRING, description: "A concise summary of the key action." },
            },
            required: ["scene", "setting", "characters", "action"],
          },
        },
      },
    });

    const jsonString = response.text.trim();
    const parsedScenes = JSON.parse(jsonString);
    if (!Array.isArray(parsedScenes)) {
        throw new Error("AI did not return a valid array of scenes.");
    }
    return parsedScenes;
  } catch (error) {
    console.error("Error parsing script:", error);
    throw new Error("Failed to parse the script. The AI couldn't structure the scenes. Please check your script format.");
  }
}

async function generateImageForScene(scene: ParsedScene, artStyle: string): Promise<string> {
    const MAX_RETRIES = 5;
    let attempt = 0;

    while (attempt < MAX_RETRIES) {
        try {
            const prompt = `Storyboard panel in a "${artStyle}" style.
            - Setting: ${scene.setting}
            - Characters: ${scene.characters.join(', ') || 'None specified'}
            - Action: ${scene.action}
            Focus on clear composition, character poses, and mood. This is for a visual storyboard. Cinematic, detailed.`;

            const response = await ai.models.generateImages({
                model: 'imagen-4.0-generate-001',
                prompt: prompt,
                config: {
                  numberOfImages: 1,
                  outputMimeType: 'image/png',
                  aspectRatio: '16:9',
                },
            });
            
            const base64ImageBytes = response.generatedImages[0]?.image?.imageBytes;

            if (base64ImageBytes) {
                return `data:image/png;base64,${base64ImageBytes}`;
            } else {
                throw new Error("No image data was returned by the API.");
            }

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            console.error(`Attempt ${attempt + 1} failed for scene ${scene.scene}:`, errorMessage);

            // Check if it's a rate limit error (429)
            if (errorMessage.includes('429') || errorMessage.includes('RESOURCE_EXHAUSTED')) {
                attempt++;
                if (attempt >= MAX_RETRIES) {
                    console.error(`Max retries reached for scene ${scene.scene}.`);
                    throw new Error(`Rate limit exceeded after ${MAX_RETRIES} attempts for Scene ${scene.scene}. Please try again later.`);
                }
                // Exponential backoff with jitter: 2^attempt * 3000ms + random jitter up to 1s
                const delay = Math.pow(2, attempt) * 3000 + Math.random() * 1000;
                console.log(`Rate limit hit. Retrying in ${Math.round(delay / 1000)}s...`);
                await new Promise(resolve => setTimeout(resolve, delay));
            } else {
                // For non-rate-limit errors, fail immediately
                throw new Error(`Failed to generate an image for Scene ${scene.scene}: ${errorMessage}`);
            }
        }
    }
    // This should not be reached, but it's a fallback.
    throw new Error(`Failed to generate an image for Scene ${scene.scene} after ${MAX_RETRIES} attempts.`);
}

export async function generateStoryboardFromScript(
  script: string,
  artStyle: string,
  onFrameGenerated: (frame: StoryboardFrame) => void
): Promise<void> {
  const parsedScenes = await parseScriptToScenes(script);

  if (parsedScenes.length === 0) {
    throw new Error("No scenes were found in the script. Please ensure it's formatted correctly.");
  }

  // Process scenes sequentially with a proactive delay to avoid rate limiting.
  for (const [index, scene] of parsedScenes.entries()) {
    try {
      const imageUrl = await generateImageForScene(scene, artStyle);
      const fullDescription = `Setting: ${scene.setting}. Action: ${scene.action}`;
      const newFrame: StoryboardFrame = {
        scene: scene.scene,
        description: fullDescription,
        imageUrl: imageUrl,
      };
      // Send the newly created frame back to the UI immediately
      onFrameGenerated(newFrame);

      // Proactively wait to avoid hitting requests-per-minute limits.
      // Do not wait after the very last scene.
      if (index < parsedScenes.length - 1) {
        console.log("Waiting 15 seconds before generating the next image to respect API rate limits.");
        await new Promise(resolve => setTimeout(resolve, 15000));
      }

    } catch (error) {
        // If one scene fails, we should stop and report the error
        console.error(`Stopping generation due to error at scene ${scene.scene}:`, error);
        if (error instanceof Error) {
            throw error;
        } else {
            throw new Error(`An unknown error occurred at scene ${scene.scene}`);
        }
    }
  }
}
