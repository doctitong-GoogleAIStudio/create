import React, { useState, useEffect, useCallback } from 'react';
import { AudioRecorder } from './components/AudioRecorder';
import { TranslationResult } from './components/TranslationResult';
import { Loader } from './components/Loader';
import { translateAudio } from './services/translationService';
import { getLicenseInfo, incrementDailyUsage } from './services/licensingService';
import type { TranslationResponse, TranslationMode, UserProfile, SavedTranslation, LicenseInfo } from './types';
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
import { ActivationScreen } from './components/ActivationScreen';
import { ActivationHelpModal } from './components/ActivationHelpModal';
import { HelpCircleIcon } from './components/icons/HelpCircleIcon';

type AppState = 'idle' | 'recording' | 'processing' | 'result' | 'error';
type LicenseStatus = 'checking' | 'valid' | 'unlicensed';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>('idle');
  const [licenseStatus, setLicenseStatus] = useState<LicenseStatus>('checking');
  const [translationMode, setTranslationMode] = useState<TranslationMode>('human-to-dog');
  const [licenseInfo, setLicenseInfo] = useState<LicenseInfo | null>(null);
  const [translationResult, setTranslationResult] = useState<TranslationResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [remainingUsage, setRemainingUsage] = useState<number>(5);

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
      return savedProfile ? JSON.parse(savedProfile) : {
        name: '',
        preferredBreed: undefined,
        audioQuality: 'standard',
        dailyUsageCount: 0,
        lastUsageDate: new Date().toISOString().split('T')[0],
        translationHistory: []
      };
    } catch (e) {
      console.error("Failed to parse user profile from localStorage", e);
      return {
        name: '',
        preferredBreed: undefined,
        audioQuality: 'standard',
        dailyUsageCount: 0,
        lastUsageDate: new Date().toISOString().split('T')[0],
        translationHistory: []
      };
    }
  });

  const [savedTranslations, setSavedTranslations] = useState<SavedTranslation[]>(() => {
    try {
      const saved = localStorage.getItem('savedTranslations');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error("Failed to parse saved translations from localStorage", e);
      return [];
    }
  });

  // Save user profile to localStorage
  useEffect(() => {
    localStorage.setItem('userProfile', JSON.stringify(userProfile));
  }, [userProfile]);

  useEffect(() => {
    localStorage.setItem('savedTranslations', JSON.stringify(savedTranslations));
  }, [savedTranslations]);

  // Theme setup
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

  // License check
  useEffect(() => {
    const checkLicense = async () => {
      try {
        const info = await getLicenseInfo();
        setLicenseInfo(info);
        setRemainingUsage(info.remainingUsage);
        setLicenseStatus(info.isValid ? 'valid' : 'unlicensed');
      } catch (error) {
        console.error('License check failed:', error);
        setLicenseStatus('unlicensed');
      }
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

  const handleRecordingStart = () => {
    setError(null);
    setAppState('recording');
  };

  const handleRecordingStop = async (audioBlob: Blob) => {
    if (!licenseInfo) {
      setError('License information not available');
      return;
    }

    // Check usage limits for free users
    if (!licenseInfo.isPremium && remainingUsage <= 0) {
      setError('Daily limit reached. Upgrade to Premium for unlimited translations.');
      setAppState('error');
      return;
    }

    setAppState('processing');

    try {
      const result = await translateAudio(
        audioBlob,
        translationMode,
        licenseInfo.installationId,
        userProfile.preferredBreed,
        userProfile.audioQuality
      );

      if (result.success) {
        // Increment usage for free users
        if (!licenseInfo.isPremium) {
          const newUsageCount = incrementDailyUsage();
          setRemainingUsage(Math.max(0, 5 - newUsageCount));
        }

        // Update user profile
        const newTranslation: SavedTranslation = {
          id: new Date().toISOString(),
          timestamp: new Date().toISOString(),
          mode: translationMode,
          emotion: result.emotion,
          resultText: result.translation,
          emoji: result.emoji,
          audioUrl: result.audioUrl
        };

        setUserProfile(prev => ({
          ...prev,
          translationHistory: [newTranslation, ...prev.translationHistory].slice(0, 50) // Keep last 50
        }));

        setTranslationResult(result);
        setAppState('result');
      } else {
        throw new Error(result.error || 'Translation failed');
      }
    } catch (err: any) {
      console.error('Translation error:', err);
      setError(err.message || 'Translation failed. Please try again.');
      setAppState('error');
    }
  };

  const handleNewTranslation = () => {
    setTranslationResult(null);
    setError(null);
    setAppState('idle');
  };

  const handleSaveTranslation = () => {
    if (!translationResult) return;

    const newSaved: SavedTranslation = {
      id: new Date().toISOString(),
      timestamp: new Date().toISOString(),
      mode: translationMode,
      emotion: translationResult.emotion,
      resultText: translationResult.translation,
      emoji: translationResult.emoji,
      audioUrl: translationResult.audioUrl
    };

    setSavedTranslations(prev => [newSaved, ...prev]);
    alert('Translation saved!');
  };

  const handleShareTranslation = () => {
    if (!translationResult) return;

    const shareText = `${translationResult.emoji} DoggoTalk Translation (${translationMode}):\n${translationResult.translation}`;

    if (navigator.share) {
      navigator.share({
        title: 'DoggoTalk Translation',
        text: shareText,
      }).catch(err => console.log('Share cancelled'));
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(shareText).then(() => {
        alert('Translation copied to clipboard!');
      }).catch(err => {
        console.error('Failed to copy:', err);
      });
    }
  };

  const handleError = (errorMessage: string) => {
    setError(errorMessage);
    setAppState('error');
  };

  const handleSaveUserProfile = (profile: UserProfile) => {
    setUserProfile(profile);
  };

  const handleDeleteTranslation = useCallback((id: string) => {
    setSavedTranslations(prev => prev.filter(t => t.id !== id));
  }, []);

  const handleDeleteAllTranslations = useCallback(() => {
    setSavedTranslations([]);
  }, []);

  const renderContent = () => {
    if (licenseStatus === 'checking') {
      return <div className="flex justify-center items-center h-64"><Loader size="lg" /></div>;
    }

    if (licenseStatus === 'unlicensed') {
      return <ActivationScreen onActivated={() => setLicenseStatus('valid')} />;
    }

    switch (appState) {
      case 'idle':
        return (
          <div className="flex flex-col items-center space-y-8">
            {/* Mode Toggle */}
            <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
              <button
                onClick={() => setTranslationMode('human-to-dog')}
                className={`px-4 py-2 rounded-md font-medium transition-colors ${
                  translationMode === 'human-to-dog'
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                }`}
              >
                🐕 Human → Dog
              </button>
              <button
                onClick={() => setTranslationMode('dog-to-human')}
                className={`px-4 py-2 rounded-md font-medium transition-colors ${
                  translationMode === 'dog-to-human'
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                }`}
              >
                🔊 Dog → Human
              </button>
            </div>

            {/* Audio Recorder */}
            <AudioRecorder
              mode={translationMode}
              isRecording={false}
              onRecordingStart={handleRecordingStart}
              onRecordingStop={handleRecordingStop}
              onError={handleError}
            />

            {/* Instructions */}
            <div className="text-center max-w-md">
              <h2 className="text-xl font-semibold mb-2">
                {translationMode === 'human-to-dog' ? 'Talk to Your Dog' : 'Understand Your Dog'}
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                {translationMode === 'human-to-dog'
                  ? 'Speak into the microphone and hear how your dog would express those emotions.'
                  : 'Record your dog\'s sounds and learn what they\'re trying to tell you.'}
              </p>
            </div>

            {/* Usage info for free users */}
            {!licenseInfo?.isPremium && (
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {remainingUsage} translations remaining today
              </div>
            )}
          </div>
        );

      case 'recording':
        return (
          <div className="flex flex-col items-center space-y-8">
            <AudioRecorder
              mode={translationMode}
              isRecording={true}
              onRecordingStart={handleRecordingStart}
              onRecordingStop={handleRecordingStop}
              onError={handleError}
              maxDuration={licenseInfo?.isPremium ? 30 : 10}
            />
          </div>
        );

      case 'processing':
        return (
          <div className="text-center py-16">
            <Loader size="lg" />
            <h2 className="mt-6 text-xl font-semibold text-gray-700 dark:text-gray-200">
              {translationMode === 'human-to-dog' ? 'Translating to Dog...' : 'Understanding Your Dog...'}
            </h2>
            <p className="text-gray-500 dark:text-gray-400">Analyzing emotions and generating translation.</p>
          </div>
        );

      case 'result':
        if (translationResult) {
          return (
            <TranslationResult
              result={translationResult}
              mode={translationMode}
              onNewTranslation={handleNewTranslation}
              onSave={licenseInfo?.isPremium ? handleSaveTranslation : undefined}
              onShare={licenseInfo?.isPremium ? handleShareTranslation : undefined}
              isPremium={licenseInfo?.isPremium || false}
              remainingUsage={remainingUsage}
            />
          );
        }
        return null;

      case 'error':
        return (
          <div className="w-full max-w-md mx-auto p-6 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
            <div className="text-center">
              <div className="text-4xl mb-2">😢</div>
              <h3 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-2">
                Something went wrong
              </h3>
              <p className="text-red-600 dark:text-red-300 text-sm mb-4">
                {error}
              </p>
              <div className="space-x-2">
                <button
                  onClick={handleNewTranslation}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Try Again
                </button>
                {!licenseInfo?.isPremium && error?.includes('limit') && (
                  <button
                    onClick={() => window.location.href = '#upgrade'}
                    className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
                  >
                    Upgrade to Premium
                  </button>
                )}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <>
      {showTutorial && <TutorialOverlay onDismiss={() => setShowTutorial(false)} />}
      {showProfileModal && (
        <UserProfileModal
          profile={userProfile}
          onSave={handleSaveUserProfile}
          onClose={() => setShowProfileModal(false)}
        />
      )}
      {showSavedItemsModal && (
        <SavedItemsModal
          savedTranslations={savedTranslations}
          onDeleteTranslation={handleDeleteTranslation}
          onDeleteAllTranslations={handleDeleteAllTranslations}
          onClose={() => setShowSavedItemsModal(false)}
        />
      )}
      {showActivationHelp && <ActivationHelpModal onClose={() => setShowActivationHelp(false)} />}

      <div className="min-h-screen text-gray-800 dark:text-gray-100 transition-colors duration-200">
        <header className="py-4 px-6 sm:px-8 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm sticky top-0 z-40 border-b border-gray-200 dark:border-gray-700">
          <div className="container mx-auto flex justify-between items-center">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🐶</span>
              <h1 className="text-xl sm:text-2xl font-bold text-[#3a3a3a] dark:text-gray-100">
                Doggo<span className="text-[#c5a78f]">Talk</span>
              </h1>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <InstallPWAButton />
              <button
                onClick={() => setShowSavedItemsModal(true)}
                className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
                aria-label="View saved translations"
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
                <InfoIcon className="w-5 h-5" />
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
            {appState !== 'idle' && licenseStatus === 'valid' && (
              <button
                onClick={handleNewTranslation}
                className="flex items-center gap-2 text-sm font-semibold py-2 px-4 rounded-lg transition-colors bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 animate-fade-in"
              >
                <RestartIcon />
                Start Over
              </button>
            )}
          </div>
          <div className="w-full max-w-2xl mx-auto">
            {renderContent()}
          </div>
        </main>
      </div>
    </>
  );
};

export default App;