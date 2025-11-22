import React, { useState, useEffect, useCallback } from 'react';
import { getSkinDiagnosis } from './services/geminiService';
import { Diagnosis, HistoryItem, AnalyzedImageInfo } from './types';
import Header from './components/Header';
import ImageUploader from './components/ImageUploader';
import DiagnosisResult from './components/DiagnosisResult';
import Loader from './components/Loader';
import ImageCropper from './components/ImageCropper';
import HistoryPanel from './components/HistoryPanel';
import AboutModal from './components/AboutModal';
import ShareModal from './components/ShareModal';
import License from './components/License';
import { getInstallationId, verifyLicense } from './services/licenseService';

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

const getImageDimensions = (file: File): Promise<{ width: number; height: number }> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
      URL.revokeObjectURL(objectUrl);
    };
    img.onerror = (err) => {
      reject(err);
      URL.revokeObjectURL(objectUrl);
    };
    img.src = objectUrl;
  });
};

type Theme = 'light' | 'dark' | 'system';

const App: React.FC = () => {
  const [isLicensed, setIsLicensed] = useState(false);
  const [checkingLicense, setCheckingLicense] = useState(true);

  const [files, setFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [diagnosis, setDiagnosis] = useState<Diagnosis | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const [originalFileForCrop, setOriginalFileForCrop] = useState<File | null>(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>(() => {
    try {
      const savedHistory = localStorage.getItem('diagnosisHistory');
      return savedHistory ? JSON.parse(savedHistory) : [];
    } catch (e) {
      console.error("Could not load history from localStorage", e);
      return [];
    }
  });
  const [analyzedImageInfo, setAnalyzedImageInfo] = useState<AnalyzedImageInfo | null>(null);
  const [theme, setTheme] = useState<Theme>(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light' || savedTheme === 'dark' || savedTheme === 'system') {
      return savedTheme;
    }
    return 'system';
  });
  
  // License check effect
  useEffect(() => {
    const checkExistingLicense = async () => {
      const storedKey = localStorage.getItem('licenseKey');
      if (storedKey) {
        try {
          const installationId = getInstallationId();
          const isValid = verifyLicense(storedKey, installationId);
          if (isValid) {
            setIsLicensed(true);
          } else {
            localStorage.removeItem('licenseKey'); // Remove invalid key
          }
        } catch (err) {
            console.error("Error verifying license:", err);
            localStorage.removeItem('licenseKey');
        }
      }
      setCheckingLicense(false);
    };
    checkExistingLicense();
  }, []);

  const handleActivate = async (licenseKey: string): Promise<{ success: boolean; message: string }> => {
    try {
        const installationId = getInstallationId();
        const isValid = verifyLicense(licenseKey, installationId);
        if (isValid) {
          localStorage.setItem('licenseKey', licenseKey);
          setIsLicensed(true);
          return { success: true, message: 'Activation successful!' };
        } else {
          return { success: false, message: 'Invalid license key for this device.' };
        }
    } catch (err) {
        console.error("Activation error:", err);
        return { success: false, message: 'An unexpected error occurred during activation.' };
    }
  };


  useEffect(() => {
    try {
      localStorage.setItem('diagnosisHistory', JSON.stringify(history));
    } catch (e) {
      console.error("Could not save history to localStorage", e);
    }
  }, [history]);

  useEffect(() => {
    const root = window.document.documentElement;
    const isDark =
      theme === 'dark' ||
      (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    
    root.classList.toggle('dark', isDark);
    localStorage.setItem('theme', theme);

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (theme === 'system') {
        root.classList.toggle('dark', mediaQuery.matches);
      }
    };
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);
  

  const handleToggleTheme = () => {
    setTheme(current => {
        if (current === 'light') return 'dark';
        if (current === 'dark') return 'system';
        return 'light';
    });
  };
  
  const blobToFile = (blob: Blob, fileName: string): File => {
    return new File([blob], fileName, { type: blob.type });
  };

  const handleFileSelected = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
        setCropSrc(reader.result as string);
        setOriginalFileForCrop(file);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleCropComplete = useCallback((croppedBlob: Blob) => {
    if (originalFileForCrop) {
      const croppedFile = blobToFile(croppedBlob, originalFileForCrop.name);
      setFiles(prevFiles => [...prevFiles, croppedFile]);
      setImagePreviews(prevPreviews => [...prevPreviews, URL.createObjectURL(croppedFile)]);
    }
    setCropSrc(null);
    setOriginalFileForCrop(null);
  }, [originalFileForCrop]);

  const handleRemoveImage = (index: number) => {
    URL.revokeObjectURL(imagePreviews[index]);
    setFiles(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (files.length === 0) {
      setError("Please upload at least one image.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setDiagnosis(null);
    setAnalyzedImageInfo(null);
    
    const firstFile = files[0];

    try {
      const [result, dimensions, imageBase64s] = await Promise.all([
        getSkinDiagnosis(files),
        getImageDimensions(firstFile),
        Promise.all(files.map(fileToBase64))
      ]);

      setAnalyzedImageInfo({
        name: firstFile.name,
        resolution: `${dimensions.width} x ${dimensions.height}px`
      });

      setDiagnosis(result);

      const newHistoryItem: HistoryItem = {
        id: new Date().toISOString(),
        thumbnail: imageBase64s[0],
        images: imageBase64s,
        diagnosis: result,
        date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
      };
      setHistory(prev => [newHistoryItem, ...prev]);

    } catch (e: any) {
      setError(e.message || "An unknown error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    imagePreviews.forEach(url => URL.revokeObjectURL(url));
    setFiles([]);
    setImagePreviews([]);
    setDiagnosis(null);
    setError(null);
    setIsLoading(false);
    setAnalyzedImageInfo(null);
  };

  const handleSelectHistoryItem = (item: HistoryItem) => {
    setDiagnosis(item.diagnosis);
    setFiles([]); 
    imagePreviews.forEach(url => URL.revokeObjectURL(url)); 
    setImagePreviews(item.images);
    setError(null);
    setIsLoading(false);
    setIsHistoryOpen(false);
    setAnalyzedImageInfo(null);
    window.scrollTo(0, 0);
  };

  const handleClearHistory = () => {
    if (window.confirm("Are you sure you want to clear all analysis history? This action cannot be undone.")) {
      setHistory([]);
    }
  };

  if (checkingLicense) {
     return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-300">
            <svg className="animate-spin h-8 w-8 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p>Verifying license...</p>
        </div>
     )
  }

  if (!isLicensed) {
    return <License onActivate={handleActivate} theme={theme} onToggleTheme={handleToggleTheme} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-sans transition-colors">
      <Header 
        onToggleHistory={() => setIsHistoryOpen(true)} 
        onToggleAbout={() => setIsAboutOpen(true)}
        theme={theme}
        onToggleTheme={handleToggleTheme} 
      />

      <main className="max-w-4xl mx-auto p-4 md:p-8">
        {!diagnosis && !isLoading && (
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100">Upload Your Image</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                    For the best results, please provide a clear, well-lit, close-up photo of the skin lesion. You can upload multiple angles if needed.
                </p>
                <ImageUploader 
                    onFileSelected={handleFileSelected} 
                    imagePreviews={imagePreviews}
                    onRemoveImage={handleRemoveImage}
                />

                {files.length > 0 && (
                    <div className="mt-6 flex justify-center">
                        <button
                        onClick={handleSubmit}
                        disabled={isLoading}
                        className="w-full sm:w-auto inline-flex justify-center items-center px-8 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-800 focus:ring-blue-500 disabled:bg-gray-400 dark:disabled:bg-gray-500 disabled:cursor-wait"
                        >
                        Analyze Image{files.length > 1 && 's'}
                        </button>
                    </div>
                )}
            </div>
        )}

        {isLoading && <Loader />}
        
        {error && (
            <div className="my-6 bg-red-100 dark:bg-red-900/30 border-l-4 border-red-500 text-red-700 dark:text-red-200 p-4 rounded-md" role="alert">
                <p className="font-bold">Error</p>
                <p>{error}</p>
                 <button onClick={handleReset} className="mt-2 text-sm font-semibold text-red-800 dark:text-red-300">Try Again</button>
            </div>
        )}
        
        {diagnosis && (
          <div>
            <DiagnosisResult diagnosis={diagnosis} analyzedImageInfo={analyzedImageInfo} />
            <div className="mt-8 flex flex-col sm:flex-row justify-center items-center gap-4">
              <button
                onClick={handleReset}
                className="w-full sm:w-auto inline-flex justify-center items-center px-8 py-3 border border-gray-300 dark:border-gray-600 text-base font-medium rounded-md shadow-sm text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-800 focus:ring-blue-500"
              >
                Start New Analysis
              </button>
              <button
                onClick={() => setIsShareModalOpen(true)}
                className="w-full sm:w-auto inline-flex justify-center items-center px-8 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-800 focus:ring-green-500"
              >
                Download Report
              </button>
            </div>
          </div>
        )}
      </main>

      {cropSrc && <ImageCropper src={cropSrc} onCropComplete={handleCropComplete} onCancel={() => setCropSrc(null)} />}
      <HistoryPanel 
        isOpen={isHistoryOpen} 
        onClose={() => setIsHistoryOpen(false)} 
        history={history} 
        onSelectItem={handleSelectHistoryItem} 
        onClearHistory={handleClearHistory} 
      />
      <AboutModal isOpen={isAboutOpen} onClose={() => setIsAboutOpen(false)} />
      {diagnosis && (
        <ShareModal 
            isOpen={isShareModalOpen}
            onClose={() => setIsShareModalOpen(false)}
            shareData={{ diagnosis: diagnosis, images: imagePreviews }}
        />
       )}
    </div>
  );
};

export default App;