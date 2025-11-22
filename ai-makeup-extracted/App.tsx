import React, { useState, useEffect } from 'react';
import { ImageUploader } from './components/ImageUploader';
import { RecommendationCard } from './components/RecommendationCard';
import { Loader } from './components/Loader';
import { ErrorMessage } from './components/ErrorMessage';
import { getMakeupRecommendations, applyMakeup } from './services/geminiService';
import type { MakeupRecommendation, Product, UserProfile as UserProfileType } from './types';
import { SparklesIcon } from './components/icons/SparklesIcon';
import { TutorialOverlay } from './components/TutorialOverlay';
import { RestartIcon } from './components/icons/RestartIcon';
import { UserProfile } from './components/UserProfile';
import { UserIcon } from './components/icons/UserIcon';
import { MoonIcon } from './components/icons/MoonIcon';
import { SunIcon } from './components/icons/SunIcon';
import { ImageCropper } from './components/ImageCropper';
import { InfoIcon } from './components/icons/InfoIcon';


const getProductKey = (product: Product): string => {
  return `${product.brand}-${product.name}`.toLowerCase().replace(/\s+/g, '-');
};


function App() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [afterImageUrl, setAfterImageUrl] = useState<string | null>(null);
  const [recommendations, setRecommendations] = useState<MakeupRecommendation | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isGeneratingAfterImage, setIsGeneratingAfterImage] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showTutorial, setShowTutorial] = useState<boolean>(false);
  const [ratings, setRatings] = useState<{ [key: string]: number }>({});
  const [userProfile, setUserProfile] = useState<UserProfileType>({
    name: '',
    style: 'Natural',
    concerns: [],
    finish: 'Satin',
    priorities: [],
    avoidances: [],
  });
  const [showProfile, setShowProfile] = useState<boolean>(false);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light' || savedTheme === 'dark') return savedTheme;
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark';
    return 'light';
  });

  // Apply theme class and save to localStorage
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);
  
  const handleThemeToggle = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  // Load data from localStorage on initial render
  useEffect(() => {
    const storedRatings = localStorage.getItem('productRatings');
    if (storedRatings) {
        setRatings(JSON.parse(storedRatings));
    }
    const storedProfile = localStorage.getItem('userProfile');
    if (storedProfile) {
        const loadedProfile = JSON.parse(storedProfile);
        // Merge with defaults to ensure new fields exist for users with old saved profiles
        setUserProfile(prevProfile => ({
            ...prevProfile,
            ...loadedProfile
        }));
    }
  }, []);
  
  useEffect(() => {
    localStorage.setItem('productRatings', JSON.stringify(ratings));
  }, [ratings]);

  useEffect(() => {
    localStorage.setItem('userProfile', JSON.stringify(userProfile));
  }, [userProfile]);

  const handleImageChange = (file: File) => {
    setImageFile(file);
    setImageUrl(URL.createObjectURL(file));
    setRecommendations(null);
    setError(null);
  };

  const handleAnalysisRequest = async (croppedImageBase64: string, mimeType: string) => {
    if (!croppedImageBase64) {
      setError('Could not process the cropped image.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setRecommendations(null);
    // Clear the image file to prevent re-showing the cropper
    setImageFile(null);


    try {
      const result = await getMakeupRecommendations(croppedImageBase64, mimeType, userProfile);
      
      // We need to reconstruct the URL for the recommendation card to display the cropped image
      const byteCharacters = atob(croppedImageBase64);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], {type: mimeType});
      const croppedUrl = URL.createObjectURL(blob);

      setImageUrl(croppedUrl); // This is the 'before' image URL
      setRecommendations(result);
      setIsLoading(false); // Main analysis complete

      // Now, generate the 'after' image
      setIsGeneratingAfterImage(true);
      try {
        const afterImageBase64 = await applyMakeup(croppedImageBase64, mimeType, result);
        const afterByteCharacters = atob(afterImageBase64);
        const afterByteNumbers = new Array(afterByteCharacters.length);
        for (let i = 0; i < afterByteCharacters.length; i++) {
          afterByteNumbers[i] = afterByteCharacters.charCodeAt(i);
        }
        const afterByteArray = new Uint8Array(afterByteNumbers);
        const afterBlob = new Blob([afterByteArray], {type: mimeType});
        setAfterImageUrl(URL.createObjectURL(afterBlob));
      } catch (err) {
        console.error("Could not generate the 'after' image.", err);
        // Proceed without the after image if generation fails.
      } finally {
        setIsGeneratingAfterImage(false);
      }
    } catch (err) {
      setError('An error occurred while fetching recommendations. Please try again.');
      console.error(err);
      setIsLoading(false);
    }
  };

  const handleRestart = () => {
    setImageFile(null);
    setImageUrl(null);
    setAfterImageUrl(null);
    setRecommendations(null);
    setError(null);
    setIsLoading(false);
  };

  const handleDismissTutorial = () => {
    setShowTutorial(false);
  };

  const handleRateProduct = (product: Product, rating: number) => {
    const key = getProductKey(product);
    setRatings(prev => ({...prev, [key]: rating}));
  };

  return (
    <>
      {showTutorial && <TutorialOverlay onDismiss={handleDismissTutorial} />}
      {showProfile && <UserProfile profile={userProfile} onSave={setUserProfile} onClose={() => setShowProfile(false)} />}
      <div className="bg-stone-50 dark:bg-gray-900 min-h-screen font-sans text-gray-800 dark:text-gray-200">
        <header className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-40">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center py-4">
                    <h1 className="text-2xl sm:text-3xl font-bold text-[#3a3a3a] dark:text-gray-100">
                        AI Makeup<span className="text-[#c5a78f]">Stylist</span>
                    </h1>
                    <div className="flex items-center gap-2 sm:gap-4">
                        <button 
                            onClick={handleThemeToggle}
                            className="flex items-center gap-2 text-sm font-semibold py-2 px-3 sm:px-4 rounded-lg transition-colors bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600"
                            aria-label="Toggle theme"
                        >
                            {theme === 'light' ? <MoonIcon /> : <SunIcon />}
                        </button>
                         <button 
                            onClick={() => setShowTutorial(true)}
                            className="flex items-center gap-2 text-sm font-semibold py-2 px-3 sm:px-4 rounded-lg transition-colors bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600"
                        >
                            <InfoIcon />
                            <span className="hidden sm:inline">How It Works</span>
                        </button>
                        <button 
                            onClick={() => setShowProfile(true)}
                            className="flex items-center gap-2 text-sm font-semibold py-2 px-3 sm:px-4 rounded-lg transition-colors bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600"
                        >
                            <UserIcon />
                            <span className="hidden sm:inline">My Profile</span>
                        </button>
                        {(recommendations || imageUrl || imageFile) && (
                             <button
                                onClick={handleRestart}
                                className="flex items-center gap-2 text-sm font-semibold py-2 px-3 sm:px-4 rounded-lg transition-colors bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600"
                             >
                                <RestartIcon />
                                <span className="hidden sm:inline">Start Over</span>
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </header>

        <main className="container mx-auto p-4 sm:p-6 lg:p-8">
          {!recommendations && !imageFile && (
            <div className="max-w-2xl mx-auto text-center animate-fade-in">
              <h2 className="text-3xl font-bold text-gray-800 sm:text-4xl dark:text-gray-100">Find Your Perfect Makeup Match</h2>
              <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
                Upload a photo to get a personalized skin analysis and product recommendations powered by AI.
              </p>
              <div className="mt-8 space-y-6">
                <ImageUploader onImageChange={handleImageChange} imageUrl={null} />
              </div>
            </div>
          )}
          
          {!recommendations && imageFile && imageUrl && (
             <ImageCropper 
                imageUrl={imageUrl} 
                imageFile={imageFile}
                onAnalyze={handleAnalysisRequest} 
                onCancel={handleRestart}
            />
          )}

          {isLoading && (
            <div className="flex flex-col justify-center items-center h-64">
              <Loader size="lg" />
              <p className="mt-4 text-lg text-gray-600 dark:text-gray-300 font-semibold">Analyzing your photo...</p>
              <p className="text-gray-500 dark:text-gray-400">This might take a moment.</p>
            </div>
          )}

          {error && <ErrorMessage message={error} />}

          {recommendations && (
            <RecommendationCard 
                recommendations={recommendations}
                beforeImageUrl={imageUrl}
                afterImageUrl={afterImageUrl}
                isGeneratingAfterImage={isGeneratingAfterImage}
                ratings={ratings}
                onRateProduct={handleRateProduct}
            />
          )}
        </main>
      </div>
    </>
  );
}

export default App;