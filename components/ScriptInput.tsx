import React from 'react';
import { ART_STYLES } from '../constants';

interface ScriptInputProps {
  script: string;
  onScriptChange: (value: string) => void;
  artStyle: string;
  onArtStyleChange: (value: string) => void;
  onGenerate: () => void;
  isLoading: boolean;
}

export const ScriptInput: React.FC<ScriptInputProps> = ({
  script,
  onScriptChange,
  artStyle,
  onArtStyleChange,
  onGenerate,
  isLoading,
}) => {
  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-2xl flex flex-col h-full sticky top-24">
      <h2 className="text-lg font-semibold mb-4 text-cyan-300">1. Enter Your Script</h2>
      <textarea
        value={script}
        onChange={(e) => onScriptChange(e.target.value)}
        placeholder="Paste your script here..."
        className="w-full flex-grow bg-gray-900 border border-gray-700 rounded-md p-3 text-sm text-gray-200 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all duration-200 resize-none min-h-[300px] lg:min-h-[500px]"
        disabled={isLoading}
      />
      <div className="mt-6">
        <h2 className="text-lg font-semibold mb-4 text-cyan-300">2. Select Art Style</h2>
        <select
          value={artStyle}
          onChange={(e) => onArtStyleChange(e.target.value)}
          className="w-full bg-gray-900 border border-gray-700 rounded-md p-3 text-sm text-gray-200 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all duration-200"
          disabled={isLoading}
        >
          {ART_STYLES.map((style) => (
            <option key={style} value={style}>
              {style}
            </option>
          ))}
        </select>
      </div>
      <div className="mt-6">
        <button
          onClick={onGenerate}
          disabled={isLoading || !script.trim()}
          className="w-full bg-cyan-600 hover:bg-cyan-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-cyan-500 flex items-center justify-center space-x-2"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Generating...
            </>
          ) : (
            <span>Generate Storyboard</span>
          )}
        </button>
      </div>
    </div>
  );
};
