import React from 'react';

const messages = [
  "Warming up the AI's imagination...",
  "Translating words into pixels...",
  "Directing the digital actors...",
  "Setting up the virtual cameras...",
  "Sketching your scenes...",
  "This might take a moment, great art needs patience!",
];

export const Loader: React.FC = () => {
    const [message, setMessage] = React.useState(messages[0]);

    React.useEffect(() => {
        const intervalId = setInterval(() => {
            setMessage(prevMessage => {
                const currentIndex = messages.indexOf(prevMessage);
                const nextIndex = (currentIndex + 1) % messages.length;
                return messages[nextIndex];
            });
        }, 3000);

        return () => clearInterval(intervalId);
    }, []);


  return (
    <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-700 rounded-lg h-full min-h-[600px]">
        <div className="w-16 h-16 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
        <h3 className="mt-4 text-lg font-semibold text-white">Generating Your Storyboard</h3>
        <p className="mt-2 text-sm text-gray-400 text-center transition-opacity duration-500">{message}</p>
    </div>
  );
};
