import React, { useState } from 'react';

interface TutorialOverlayProps {
  onDismiss: () => void;
}

type ActiveTab = 'how' | 'about' | 'tiers';

const TabButton: React.FC<{ label: string; active: boolean; onClick: () => void }> = ({ label, active, onClick }) => (
    <button
        onClick={onClick}
        className={`px-4 py-2 text-sm font-semibold rounded-t-lg transition-colors border-b-2 ${
            active
                ? 'border-[#c5a78f] text-[#c5a78f]'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600 hover:text-gray-700 dark:hover:text-gray-200'
        }`}
    >
        {label}
    </button>
);


export const TutorialOverlay: React.FC<TutorialOverlayProps> = ({ onDismiss }) => {
    const [activeTab, setActiveTab] = useState<ActiveTab>('how');

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 z-50 flex justify-center items-center p-4 animate-fade-in" onClick={onDismiss}>
      <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-2xl max-w-md w-full text-center relative max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
         <button onClick={onDismiss} className="absolute top-2 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-3xl font-bold">&times;</button>
         
         <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
            <div className="flex items-center gap-2 -mb-px">
                <TabButton label="How It Works" active={activeTab === 'how'} onClick={() => setActiveTab('how')} />
                <TabButton label="Tiers Explained" active={activeTab === 'tiers'} onClick={() => setActiveTab('tiers')} />
                <TabButton label="About" active={activeTab === 'about'} onClick={() => setActiveTab('about')} />
            </div>
        </div>
        
        {activeTab === 'how' && (
             <div className="space-y-6 text-left mt-6 animate-fade-in">
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
                            Our AI will analyze your skin tone, type, and undertone to find your perfect product matches.
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
        )}
        
        {activeTab === 'tiers' && (
            <div className="text-left space-y-4 text-gray-600 dark:text-gray-300 animate-fade-in">
                <h3 className="font-semibold text-lg text-center text-[#4a4a4a] dark:text-gray-200">Understanding Product Tiers</h3>
                <p className="text-center text-sm">
                    We categorize products to help you find the perfect match for your budget and preferences.
                </p>
                <div className="space-y-3 pt-2">
                    <div>
                        <h4 className="font-semibold text-[#c5a78f]">High-End</h4>
                        <p className="text-sm">Premium, luxury brands known for high-quality ingredients and performance. Often found in department stores or specialty beauty retailers.</p>
                    </div>
                    <div>
                        <h4 className="font-semibold text-[#c5a78f]">Commonly Available</h4>
                        <p className="text-sm">Popular, mid-range products that are widely accessible and offer a good balance of quality and price.</p>
                    </div>
                    <div>
                        <h4 className="font-semibold text-[#c5a78f]">Drugstore</h4>
                        <p className="text-sm">Affordable and readily available products found in local drugstores, pharmacies, and supermarkets. Great for everyday use.</p>
                    </div>
                    <div>
                        <h4 className="font-semibold text-[#c5a78f]">Dupes/Affordable</h4>
                        <p className="text-sm">Budget-friendly alternatives that are similar in color, texture, or effect to popular high-end products. A great way to get a luxury look for less.</p>
                    </div>
                </div>
            </div>
        )}

        {activeTab === 'about' && (
            <div className="text-left space-y-4 text-gray-600 dark:text-gray-300 animate-fade-in">
                <h3 className="font-semibold text-lg text-center text-[#4a4a4a] dark:text-gray-200">About GeminiGlow</h3>
                <p>
                    GeminiGlow is an AI-powered makeup recommendation engine designed to help you discover products that perfectly match your unique skin profile.
                </p>
                <p>
                    By analyzing your photo, our advanced AI provides personalized suggestions for a complete makeup look, from foundation to lipstick, tailored to your skin tone, undertone, and personal style preferences.
                </p>
                <div className="text-xs text-gray-500 dark:text-gray-400 text-center pt-4">
                    <p>Version: 1.3.0</p>
                    <p>Build: 20240726.1</p>
                </div>
            </div>
        )}

         <button
            onClick={onDismiss}
            className="mt-8 w-full bg-[#c5a78f] text-white font-bold py-3 px-4 rounded-xl hover:bg-[#b9987e] transition-all duration-300 text-lg shadow-md hover:shadow-lg"
         >
            Close
         </button>
      </div>
    </div>
  );
};
