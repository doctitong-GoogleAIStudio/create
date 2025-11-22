import React from 'react';

interface TutorialOverlayProps {
  onDismiss: () => void;
}

export const TutorialOverlay: React.FC<TutorialOverlayProps> = ({ onDismiss }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 z-50 flex justify-center items-center p-4 animate-fade-in" onClick={onDismiss}>
      <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-2xl max-w-md w-full text-center relative" onClick={(e) => e.stopPropagation()}>
         <button onClick={onDismiss} className="absolute top-2 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-3xl font-bold">&times;</button>
         <h2 className="text-3xl font-bold text-[#3a3a3a] dark:text-gray-100 mb-4">How It Works</h2>

         <div className="space-y-6 text-left mt-6">
            <div className="flex items-start gap-4">
                <div className="flex-shrink-0 bg-[#c5a78f] text-white rounded-full h-8 w-8 flex items-center justify-center font-bold text-lg">1</div>
                <div>
                    <h3 className="font-semibold text-lg text-[#4a4a4a] dark:text-gray-200">Upload Your Photo</h3>
                    <p className="text-gray-600 dark:text-gray-300">
                        Click the upload box and select a clear, well-lit photo of your face. Natural lighting works best!
                    </p>
                </div>
            </div>

             <div className="flex items-start gap-4">
                <div className="flex-shrink-0 bg-[#c5a78f] text-white rounded-full h-8 w-8 flex items-center justify-center font-bold text-lg">2</div>
                <div>
                    <h3 className="font-semibold text-lg text-[#4a4a4a] dark:text-gray-200">Get Your Analysis</h3>
                    <p className="text-gray-600 dark:text-gray-300">
                        Click the "Find My Makeup" button. Our AI will analyze your skin tone, type, and undertone.
                    </p>
                </div>
            </div>

             <div className="flex items-start gap-4">
                <div className="flex-shrink-0 bg-[#c5a78f] text-white rounded-full h-8 w-8 flex items-center justify-center font-bold text-lg">3</div>
                <div>
                    <h3 className="font-semibold text-lg text-[#4a4a4a] dark:text-gray-200">Discover Products</h3>
                    <p className="text-gray-600 dark:text-gray-300">
                        Explore your personalized recommendations, with both high-end and drugstore options for a complete look.
                    </p>
                </div>
            </div>
         </div>

         <button
            onClick={onDismiss}
            className="mt-8 w-full bg-[#c5a78f] text-white font-bold py-3 px-4 rounded-xl hover:bg-[#b9987e] transition-all duration-300 text-lg shadow-md hover:shadow-lg"
         >
            Get Started!
         </button>
      </div>
    </div>
  );
};