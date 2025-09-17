import React, { useState, useCallback } from 'react';
import { Header } from './components/Header';
import { ScriptInput } from './components/ScriptInput';
import { StoryboardDisplay } from './components/StoryboardDisplay';
import { generateStoryboardFromScript } from './services/geminiService';
import type { StoryboardFrame } from './types';
import { ART_STYLES, SCRIPT_PLACEHOLDER } from './constants';

const App: React.FC = () => {
  const [script, setScript] = useState<string>(SCRIPT_PLACEHOLDER);
  const [storyboardFrames, setStoryboardFrames] = useState<StoryboardFrame[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [artStyle, setArtStyle] = useState<string>(ART_STYLES[0]);

  const handleGenerate = useCallback(async () => {
    if (!script.trim()) {
      setError("Script cannot be empty.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setStoryboardFrames([]);

    try {
      // The service will now call back to update the state for each frame
      await generateStoryboardFromScript(
        script,
        artStyle,
        (newFrame) => {
          setStoryboardFrames((prevFrames) => {
            const updatedFrames = [...prevFrames, newFrame];
            // Keep frames sorted by scene number
            updatedFrames.sort((a, b) => a.scene - b.scene);
            return updatedFrames;
          });
        }
      );
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "An unknown error occurred. Check the console for details.");
    } finally {
      setIsLoading(false);
    }
  }, [script, artStyle]);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto p-4 md:p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <div className="w-full h-full">
          <ScriptInput
            script={script}
            onScriptChange={setScript}
            artStyle={artStyle}
            onArtStyleChange={setArtStyle}
            onGenerate={handleGenerate}
            isLoading={isLoading}
          />
        </div>
        <div className="w-full h-full">
          <StoryboardDisplay
            frames={storyboardFrames}
            isLoading={isLoading}
            error={error}
          />
        </div>
      </main>
    </div>
  );
};

export default App;