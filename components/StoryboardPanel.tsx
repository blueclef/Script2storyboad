import React from 'react';
import type { StoryboardFrame } from '../types';

interface StoryboardPanelProps {
  frame: StoryboardFrame;
}

export const StoryboardPanel: React.FC<StoryboardPanelProps> = ({ frame }) => {
  return (
    <div className="bg-gray-800 rounded-lg shadow-xl overflow-hidden animate-fade-in">
      <div className="relative aspect-video bg-gray-900">
        <img 
          src={frame.imageUrl} 
          alt={`Storyboard for scene ${frame.scene}`} 
          className="w-full h-full object-cover" 
        />
         <div className="absolute top-2 left-2 bg-black/50 text-white text-xs font-bold px-2 py-1 rounded-full">
            SCENE {frame.scene}
        </div>
      </div>
      <div className="p-4">
        <p className="text-sm text-gray-300">{frame.description}</p>
      </div>
    </div>
  );
};
