import React, { useState, useEffect, useCallback } from 'react';
import { ImageUploader } from './components/ImageUploader';
import { ImageCropper } from './components/ImageCropper';
import { RecommendationCard } from './components/RecommendationCard';
import { ErrorMessage } from './components/ErrorMessage';
import { Loader } from './components/Loader';
import { getMakeupRecommendations, generateAfterImage } from './services/geminiService';
import { base64ToDataUrl } from './services/imageProcessingService';
import type { MakeupRecommendation, Product, ProductRecommendation, SavedAnalysis, SavedProduct, UserProfile } from './types';
import { TutorialOverlay } from './components/TutorialOverlay';
import { UserProfile as UserProfileModal } from './components/UserProfile';
import { SunIcon } from './components/icons/SunIcon';
import { MoonIcon } from './components/icons/MoonIcon';
import { UserIcon } from './components/icons/UserIcon';
import { RestartIcon } from './components/icons/RestartIcon';
import { BookmarkIcon } from './components/icons/BookmarkIcon';
import { SavedItemsModal } from './components/SavedItemsModal';
import { InfoIcon } from './components/icons/InfoIcon';
import { InstallPWAButton } from './components/InstallPWAButton';
import { verifyStoredLicense } from './services/licensingService';
import { ActivationScreen } from './components/ActivationScreen';
import { ActivationHelpModal } from './components/ActivationHelpModal';
import { HelpCircleIcon } from './components/icons/HelpCircleIcon';

type AppState = 'upload' | 'crop' | 'loading' | 'results' | 'error';
type LicenseStatus = 'checking' | 'valid' | 'unlicensed';

const getProductKey = (product: Product): string => {
  return product.id;
};

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>('upload');
  const [licenseStatus, setLicenseStatus] = useState<LicenseStatus>('checking');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [croppedImage, setCroppedImage] = useState<{ base64: string; mimeType: string; url: string } | null>(null);
  const [recommendations, setRecommendations] = useState<MakeupRecommendation | null>(null);
  const [afterImageUrl, setAfterImageUrl] = useState<string | null>(null);
  const [isGeneratingAfterImage, setIsGeneratingAfterImage] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // UI State
  const [showTutorial, setShowTutorial] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showSavedItemsModal, setShowSavedItemsModal] = useState(false);
  const [showActivationHelp, setShowActivationHelp] = useState(false);

  // User Data State
  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    try {
      const savedProfile = localStorage.getItem('userProfile');
      return savedProfile ? JSON.parse(savedProfile) : { name: '', style: 'Natural', concerns: [], finish: 'Satin', priorities: [], avoidances: [] };
    } catch (e) {
      console.error("Failed to parse user profile from localStorage", e);
      return { name: '', style: 'Natural', concerns: [], finish: 'Satin', priorities: [], avoidances: [] };
    }
  });

  const [savedAnalyses, setSavedAnalyses] = useState<SavedAnalysis[]>(() => {
    try {
        const saved = localStorage.getItem('savedAnalyses');
        return saved ? JSON.parse(saved) : [];
    } catch (e) {
        console.error("Failed to parse saved analyses from localStorage", e);
        return [];
    }
  });
  
  const [savedProducts, setSavedProducts] = useState<SavedProduct[]>(() => {
    try {
      const saved = localStorage.getItem('savedProducts');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error("Failed to parse saved products from localStorage", e);
      return [];
    }
  });

  const [productRatings, setProductRatings] = useState<{ [key: string]: number }>(() => {
    try {
      const saved = localStorage.getItem('productRatings');
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      console.error("Failed to parse product ratings from localStorage", e);
      return {};
    }
  });
  
  useEffect(() => {
    localStorage.setItem('userProfile', JSON.stringify(userProfile));
  }, [userProfile]);

  useEffect(() => {
    localStorage.setItem('savedAnalyses', JSON.stringify(savedAnalyses));
  }, [savedAnalyses]);
  
  useEffect(() => {
    localStorage.setItem('savedProducts', JSON.stringify(savedProducts));
  }, [savedProducts]);
  
  useEffect(() => {
    localStorage.setItem('productRatings', JSON.stringify(productRatings));
  }, [productRatings]);
  
  useEffect(() => {
    const isSystemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark' || (!savedTheme && isSystemDark)) {
      document.documentElement.classList.add('dark');
      setIsDarkMode(true);
    } else {
      document.documentElement.classList.remove('dark');
      setIsDarkMode(false);
    }
  }, []);

  useEffect(() => {
    const checkLicense = async () => {
        const isValid = await verifyStoredLicense();
        setLicenseStatus(isValid ? 'valid' : 'unlicensed');
    };
    checkLicense();
    
    // Show tutorial on first visit
    const hasSeenTutorial = localStorage.getItem('hasSeenTutorial');
    if (!hasSeenTutorial) {
        setShowTutorial(true);
        localStorage.setItem('hasSeenTutorial', 'true');
    }
  }, []);
  
  const toggleDarkMode = () => {
    setIsDarkMode(prevMode => {
      const newMode = !prevMode;
      if (newMode) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('theme', 'light');
      }
      return newMode;
    });
  };

  const handleImageChange = (file: File) => {
    setImageFile(file);
    setImageUrl(URL.createObjectURL(file));
    setAppState('crop');
  };

  const handleAnalyze = async (base64: string, mimeType: string) => {
    setAppState('loading');
    setCroppedImage({ base64, mimeType, url: base64ToDataUrl(base64, mimeType) });
    setError(null);
    setAfterImageUrl(null);

    try {
      const result = await getMakeupRecommendations(base64, mimeType, userProfile);
      setRecommendations(result);
      setAppState('results');

      // Kick off after-image generation in the background
      setIsGeneratingAfterImage(true);
      generateAfterImage(base64, mimeType, result)
        .then(afterImageBase64 => {
          setAfterImageUrl(base64ToDataUrl(afterImageBase64, 'image/jpeg'));
        })
        .catch(err => {
          console.error("Failed to generate after image:", err);
          // Don't show an error to the user, it's a non-critical feature
        })
        .finally(() => {
          setIsGeneratingAfterImage(false);
        });

    } catch (err: any) {
      setError(err.message || 'An unknown error occurred.');
      setAppState('error');
    }
  };

  const handleRestart = () => {
    setAppState('upload');
    setImageFile(null);
    setImageUrl(null);
    setCroppedImage(null);
    setRecommendations(null);
    setAfterImageUrl(null);
    setError(null);
  };
  
  const handleSaveUserProfile = (profile: UserProfile) => {
    setUserProfile(profile);
  };

  const handleRateProduct = (product: Product, rating: number) => {
    const key = getProductKey(product);
    setProductRatings(prev => ({
        ...prev,
        [key]: rating,
    }));
  };

  const handleSaveAnalysis = () => {
    if (!croppedImage || !recommendations) return;
    const newSavedAnalysis: SavedAnalysis = {
        id: new Date().toISOString(),
        imageUrl: croppedImage.url,
        skinAnalysis: recommendations.skinAnalysis,
    };
    setSavedAnalyses(prev => [newSavedAnalysis, ...prev]);
    alert('Analysis saved!');
  };

  const handleSaveProduct = (productRec: ProductRecommendation, ratingsToSave: { [key: string]: number }) => {
    const newSavedProduct: SavedProduct = {
      ...productRec,
      id: `${productRec.category}-${new Date().toISOString()}`,
      savedRatings: ratingsToSave,
    };
    setSavedProducts(prev => [newSavedProduct, ...prev]);
    alert(`${productRec.category} look saved!`);
  };

  const handleDeleteAnalysis = useCallback((id: string) => {
    setSavedAnalyses(prev => prev.filter(a => a.id !== id));
  }, []);

  const handleDeleteProduct = useCallback((id: string) => {
    setSavedProducts(prev => prev.filter(p => p.id !== id));
  }, []);

  const handleDeleteAllAnalyses = useCallback(() => {
    setSavedAnalyses([]);
  }, []);

  const handleDeleteAllProducts = useCallback(() => {
    setSavedProducts([]);
  }, []);

  const renderContent = () => {
    if (licenseStatus === 'checking') {
      return <div className="flex justify-center items-center h-64"><Loader size="lg" /></div>;
    }
    
    if (licenseStatus === 'unlicensed') {
      return <ActivationScreen onActivated={() => setLicenseStatus('valid')} />;
    }
    
    switch (appState) {
      case 'upload':
        return <ImageUploader onImageChange={handleImageChange} />;
      case 'crop':
        if (imageUrl && imageFile) {
          return (
            <ImageCropper
              imageUrl={imageUrl}
              imageFile={imageFile}
              onAnalyze={handleAnalyze}
              onCancel={handleRestart}
            />
          );
        }
        return null;
      case 'loading':
        return (
            <div className="text-center py-16">
                <Loader size="lg" />
                <h2 className="mt-6 text-xl font-semibold text-gray-700 dark:text-gray-200">Analyzing Your Photo...</h2>
                <p className="text-gray-500 dark:text-gray-400">This may take a few moments.</p>
            </div>
        );
      case 'results':
        if (recommendations) {
          return (
            <RecommendationCard
              recommendations={recommendations}
              beforeImageUrl={croppedImage?.url || null}
              afterImageUrl={afterImageUrl}
              isGeneratingAfterImage={isGeneratingAfterImage}
              ratings={productRatings}
              onRateProduct={handleRateProduct}
              onSaveAnalysis={handleSaveAnalysis}
              onSaveProduct={handleSaveProduct}
            />
          );
        }
        return null;
      case 'error':
        return <ErrorMessage message={error || 'An unexpected error occurred.'} />;
      default:
        return null;
    }
  };

  return (
    <>
      {showTutorial && <TutorialOverlay onDismiss={() => setShowTutorial(false)} />}
      {showProfileModal && <UserProfileModal profile={userProfile} onSave={handleSaveUserProfile} onClose={() => setShowProfileModal(false)} />}
      {showSavedItemsModal && 
        <SavedItemsModal 
            savedAnalyses={savedAnalyses}
            savedProducts={savedProducts}
            ratings={productRatings}
            onRateProduct={handleRateProduct}
            onDeleteAnalysis={handleDeleteAnalysis}
            onDeleteProduct={handleDeleteProduct}
            onDeleteAllAnalyses={handleDeleteAllAnalyses}
            onDeleteAllProducts={handleDeleteAllProducts}
            onClose={() => setShowSavedItemsModal(false)} 
        />
      }
      {showActivationHelp && <ActivationHelpModal onClose={() => setShowActivationHelp(false)} />}
      <div className="min-h-screen text-gray-800 dark:text-gray-100 transition-colors duration-200">
        <header className="py-4 px-6 sm:px-8 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm sticky top-0 z-40 border-b border-gray-200 dark:border-gray-700">
          <div className="container mx-auto flex justify-between items-center">
            <div className="flex items-center gap-3">
                <h1 className="text-xl sm:text-2xl font-bold text-[#3a3a3a] dark:text-gray-100">
                Gemini<span className="text-[#c5a78f]">Glow</span>
                </h1>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
                <InstallPWAButton />
                <button
                    onClick={() => setShowSavedItemsModal(true)}
                    className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
                    aria-label="View saved items"
                >
                    <BookmarkIcon className="w-5 h-5" />
                </button>
                <button
                    onClick={() => setShowActivationHelp(true)}
                    className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
                    aria-label="How to activate"
                >
                    <HelpCircleIcon className="w-5 h-5" />
                </button>
                <button
                    onClick={() => setShowProfileModal(true)}
                    className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
                    aria-label="User Profile"
                >
                    <UserIcon />
                </button>
                 <button
                    onClick={() => setShowTutorial(true)}
                    className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
                    aria-label="Show help"
                >
                    <InfoIcon className="w-5 h-5"/>
                </button>
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
                aria-label="Toggle dark mode"
              >
                {isDarkMode ? <SunIcon /> : <MoonIcon />}
              </button>
            </div>
          </div>
        </header>

        <main className="container mx-auto p-4 sm:p-8">
            <div className="flex justify-end mb-4 h-10">
               {appState !== 'upload' && licenseStatus === 'valid' && (
                 <button 
                   onClick={handleRestart} 
                   className="flex items-center gap-2 text-sm font-semibold py-2 px-4 rounded-lg transition-colors bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 animate-fade-in"
                 >
                   <RestartIcon />
                   Start Over
                 </button>
               )}
            </div>
          <div className="w-full max-w-5xl mx-auto">
            {renderContent()}
          </div>
        </main>
      </div>
    </>
  );
};

export default App;