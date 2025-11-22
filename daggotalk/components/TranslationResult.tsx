import React, { useState } from 'react';
import { playDogSound } from '../services/doggoService';
import type { TranslationResponse, TranslationMode, Emotion } from '../types';

interface TranslationResultProps {
  result: TranslationResponse;
  mode: TranslationMode;
  onNewTranslation: () => void;
  onSave?: () => void;
  onShare?: () => void;
  isPremium?: boolean;
  remainingUsage?: number;
}

export const TranslationResult: React.FC<TranslationResultProps> = ({
  result,
  mode,
  onNewTranslation,
  onSave,
  onShare,
  isPremium = false,
  remainingUsage
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [playError, setPlayError] = useState<string | null>(null);

  const handlePlaySound = async () => {
    if (!result.audioUrl || mode === 'dog-to-human') return;

    setIsPlaying(true);
    setPlayError(null);

    try {
      await playDogSound(result.audioUrl);
    } catch (error: any) {
      console.error('Error playing sound:', error);
      setPlayError('Failed to play sound. Please try again.');
    } finally {
      setIsPlaying(false);
    }
  };

  const getEmotionColor = (emotion: Emotion): string => {
    const colorMap = {
      excited: 'text-green-600',
      playful: 'text-blue-600',
      sad: 'text-blue-800',
      scared: 'text-purple-600',
      curious: 'text-yellow-600',
      alert: 'text-orange-600',
      protective: 'text-red-600',
      relaxed: 'text-gray-600'
    };
    return colorMap[emotion] || 'text-gray-600';
  };

  const getEmotionBackground = (emotion: Emotion): string => {
    const bgMap = {
      excited: 'bg-green-100 dark:bg-green-900/20',
      playful: 'bg-blue-100 dark:bg-blue-900/20',
      sad: 'bg-blue-100 dark:bg-blue-900/20',
      scared: 'bg-purple-100 dark:bg-purple-900/20',
      curious: 'bg-yellow-100 dark:bg-yellow-900/20',
      alert: 'bg-orange-100 dark:bg-orange-900/20',
      protective: 'bg-red-100 dark:bg-red-900/20',
      relaxed: 'bg-gray-100 dark:bg-gray-900/20'
    };
    return bgMap[emotion] || 'bg-gray-100 dark:bg-gray-900/20';
  };

  const getEmotionLabel = (emotion: Emotion): string => {
    const labelMap = {
      excited: 'Excited',
      playful: 'Playful',
      sad: 'Sad',
      scared: 'Scared',
      curious: 'Curious',
      alert: 'Alert',
      protective: 'Protective',
      relaxed: 'Relaxed'
    };
    return labelMap[emotion];
  };

  if (!result.success) {
    return (
      <div className="w-full max-w-md mx-auto p-6 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
        <div className="text-center">
          <div className="text-4xl mb-2">😢</div>
          <h3 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-2">
            Translation Failed
          </h3>
          <p className="text-red-600 dark:text-red-300 text-sm mb-4">
            {result.error}
          </p>
          <button
            onClick={onNewTranslation}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto space-y-4">
      {/* Main result card */}
      <div className={`
        p-6 rounded-lg border
        ${getEmotionBackground(result.emotion)}
        ${getEmotionColor(result.emotion)}
        border-current/20
      `}>
        {/* Header with emoji and emotion */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <span className="text-4xl">{result.emoji}</span>
            <div>
              <h3 className="text-lg font-semibold capitalize">
                {getEmotionLabel(result.emotion)}
              </h3>
              <p className="text-sm opacity-75">
                {mode === 'human-to-dog' ? 'Dog says:' : 'Your dog means:'}
              </p>
            </div>
          </div>
        </div>

        {/* Translation text */}
        <div className="mb-6">
          <p className="text-lg leading-relaxed">
            {result.translation}
          </p>
        </div>

        {/* Play sound button (only for human-to-dog mode) */}
        {mode === 'human-to-dog' && result.audioUrl && (
          <div className="mb-4">
            <button
              onClick={handlePlaySound}
              disabled={isPlaying}
              className={`
                w-full py-3 px-4 rounded-lg font-medium transition-all
                ${isPlaying
                  ? 'bg-gray-300 dark:bg-gray-600 cursor-not-allowed'
                  : 'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700'
                }
                border border-current/20 active:scale-95
              `}
            >
              {isPlaying ? (
                <span className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  <span>Playing...</span>
                </span>
              ) : (
                <span className="flex items-center justify-center space-x-2">
                  <span>🔊</span>
                  <span>Play Bark</span>
                </span>
              )}
            </button>
            {playError && (
              <p className="text-sm text-red-500 mt-2">{playError}</p>
            )}
          </div>
        )}

        {/* Usage info for free tier */}
        (!isPremium && remainingUsage !== undefined && (
          <div className="text-xs text-center opacity-75 mb-4">
            {remainingUsage} translations remaining today
          </div>
        )}

        {/* Action buttons */}
        <div className="flex space-x-2">
          <button
            onClick={onNewTranslation}
            className="flex-1 py-2 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors active:scale-95"
          >
            Try Another
          </button>

          {isPremium && onSave && (
            <button
              onClick={onSave}
              className="py-2 px-4 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors active:scale-95"
              aria-label="Save translation"
            >
              💾
            </button>
          )}

          {isPremium && onShare && (
            <button
              onClick={onShare}
              className="py-2 px-4 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors active:scale-95"
              aria-label="Share translation"
            >
              🔗
            </button>
          )}
        </div>
      </div>

      {/* Premium upgrade prompt for free users */}
      {!isPremium && remainingUsage === 1 && (
        <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg border border-purple-200 dark:border-purple-700">
          <div className="text-center">
            <div className="text-2xl mb-2">🐾</div>
            <h4 className="font-semibold text-purple-800 dark:text-purple-200 mb-1">
              Upgrade to Premium
            </h4>
            <p className="text-sm text-purple-600 dark:text-purple-300 mb-3">
              Get unlimited translations, HD audio, breed-specific sounds, and more!
            </p>
            <button
              onClick={() => window.location.href = '#upgrade'}
              className="px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg hover:from-purple-600 hover:to-blue-600 transition-colors text-sm font-medium"
            >
              Upgrade Now
            </button>
          </div>
        </div>
      )}

      {/* Mode indicator */}
      <div className="text-center text-xs text-gray-500 dark:text-gray-400">
        Mode: {mode === 'human-to-dog' ? 'Human → Dog' : 'Dog → Human'}
      </div>
    </div>
  );
};