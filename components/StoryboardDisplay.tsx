import React from 'react';
import type { StoryboardFrame } from '../types';
import { StoryboardPanel } from './StoryboardPanel';
import { Loader } from './Loader';

interface StoryboardDisplayProps {
  frames: StoryboardFrame[];
  isLoading: boolean;
  error: string | null;
}

const EmptyState: React.FC = () => (
  <div className="text-center text-gray-400 p-8 border-2 border-dashed border-gray-700 rounded-lg">
    <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
    <h3 className="mt-2 text-lg font-medium text-white">Your storyboard will appear here</h3>
    <p className="mt-1 text-sm text-gray-500">Enter a script, choose a style, and click "Generate" to see the magic happen.</p>
  </div>
);

const ErrorDisplay: React.FC<{ message: string }> = ({ message }) => (
    <div className="text-center text-red-400 p-8 border-2 border-dashed border-red-700/50 bg-red-900/20 rounded-lg">
        <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3 className="mt-2 text-lg font-medium text-white">An Error Occurred</h3>
        <p className="mt-1 text-sm text-red-400">{message}</p>
    </div>
);


export const StoryboardDisplay: React.FC<StoryboardDisplayProps> = ({ frames, isLoading, error }) => {
  if (isLoading) {
    return <Loader />;
  }

  if (error) {
    return <ErrorDisplay message={error} />;
  }

  if (frames.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="space-y-8">
      {frames.map((frame) => (
        <StoryboardPanel key={frame.scene} frame={frame} />
      ))}
    </div>
  );
};
