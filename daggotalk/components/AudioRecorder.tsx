import React, { useState, useRef, useEffect, useCallback } from 'react';
import type { TranslationMode } from '../types';

interface AudioRecorderProps {
  mode: TranslationMode;
  isRecording: boolean;
  onRecordingStart: () => void;
  onRecordingStop: (audioBlob: Blob) => void;
  onError: (error: string) => void;
  disabled?: boolean;
  maxDuration?: number; // in seconds
}

export const AudioRecorder: React.FC<AudioRecorderProps> = ({
  mode,
  isRecording,
  onRecordingStart,
  onRecordingStop,
  onError,
  disabled = false,
  maxDuration = 30
}) => {
  const [permissionGranted, setPermissionGranted] = useState<boolean | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioLevel, setAudioLevel] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const animationRef = useRef<number | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  // Request microphone permissions on mount
  useEffect(() => {
    requestMicrophonePermission();

    return () => {
      // Cleanup
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  const requestMicrophonePermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 16000
        }
      });
      setPermissionGranted(true);

      // Set up audio context for level monitoring
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);

      audioContextRef.current = audioContext;
      analyserRef.current = analyser;

      // Don't keep the stream active - just checking permission
      stream.getTracks().forEach(track => track.stop());
    } catch (error) {
      console.error('Microphone permission denied:', error);
      setPermissionGranted(false);
      onError('Microphone access is required. Please grant permission in your browser settings.');
    }
  };

  const updateAudioLevel = useCallback(() => {
    if (analyserRef.current && isRecording) {
      const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
      analyserRef.current.getByteFrequencyData(dataArray);

      // Calculate average volume level
      const average = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;
      const level = Math.min(100, (average / 128) * 100);
      setAudioLevel(level);

      animationRef.current = requestAnimationFrame(updateAudioLevel);
    }
  }, [isRecording]);

  const startRecording = async () => {
    if (disabled || isRecording) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 16000
        }
      });

      // Create MediaRecorder
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });

      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm;codecs=opus' });

        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());

        onRecordingStop(audioBlob);
        setRecordingTime(0);
        setAudioLevel(0);
      };

      // Start recording
      mediaRecorder.start(100); // Collect data every 100ms
      onRecordingStart();

      // Start timer
      const startTime = Date.now();
      timerRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        setRecordingTime(elapsed);

        // Auto-stop after max duration
        if (elapsed >= maxDuration) {
          stopRecording();
        }
      }, 100);

      // Start audio level monitoring
      animationRef.current = requestAnimationFrame(updateAudioLevel);

    } catch (error: any) {
      console.error('Error starting recording:', error);
      onError('Failed to start recording. Please check microphone permissions.');
    }
  };

  const stopRecording = () => {
    if (!isRecording || !mediaRecorderRef.current) return;

    // Clear timer and animation
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }

    mediaRecorderRef.current.stop();
  };

  const handleClick = () => {
    if (disabled) return;

    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getButtonText = (): string => {
    if (permissionGranted === null) return 'Checking permission...';
    if (permissionGranted === false) return 'Microphone access required';

    if (mode === 'human-to-dog') {
      return isRecording ? 'Stop Recording' : 'Tap to Speak';
    } else {
      return isRecording ? 'Stop Recording' : 'Record Dog Sounds';
    }
  };

  const getEmoji = (): string => {
    if (mode === 'human-to-dog') {
      return isRecording ? '🔴' : '🎙️';
    } else {
      return isRecording ? '🔴' : '🐕';
    }
  };

  // Permission denied state
  if (permissionGranted === false) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <div className="text-6xl mb-4">🎤</div>
        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-2">
          Microphone Access Required
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-4">
          DoggoTalk needs access to your microphone to translate voice to dog sounds.
        </p>
        <button
          onClick={requestMicrophonePermission}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          Grant Permission
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center space-y-4">
      {/* Recording indicator and timer */}
      {isRecording && (
        <div className="flex flex-col items-center space-y-2 animate-pulse">
          <div className="text-sm font-medium text-red-500">
            Recording...
          </div>
          <div className="text-lg font-mono text-gray-700 dark:text-gray-200">
            {formatTime(recordingTime)}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Max duration: {formatTime(maxDuration)}
          </div>
        </div>
      )}

      {/* Audio level indicator */}
      {isRecording && (
        <div className="w-32 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-red-500 transition-all duration-100"
            style={{ width: `${audioLevel}%` }}
          />
        </div>
      )}

      {/* Main recording button */}
      <button
        onClick={handleClick}
        disabled={disabled || permissionGranted !== true}
        className={`
          relative w-24 h-24 rounded-full flex items-center justify-center
          transition-all duration-200 transform active:scale-95
          ${disabled
            ? 'bg-gray-300 dark:bg-gray-600 cursor-not-allowed'
            : isRecording
              ? 'bg-red-500 hover:bg-red-600 active:bg-red-700'
              : 'bg-blue-500 hover:bg-blue-600 active:bg-blue-700'
          }
        `}
        aria-label={getButtonText()}
      >
        <span className="text-4xl select-none">
          {getEmoji()}
        </span>

        {/* Pulse animation for recording state */}
        {isRecording && (
          <div className="absolute inset-0 rounded-full bg-red-400 animate-ping opacity-75" />
        )}
      </button>

      {/* Button text */}
      <div className="text-sm font-medium text-gray-700 dark:text-gray-200 text-center">
        {getButtonText()}
      </div>

      {/* Instructions */}
      {!isRecording && permissionGranted === true && (
        <div className="text-xs text-gray-500 dark:text-gray-400 text-center max-w-xs">
          {mode === 'human-to-dog'
            ? 'Tap the microphone and speak clearly. Tap again to stop recording.'
            : 'Tap the microphone and record your dog\'s sounds. Tap again to stop.'
          }
        </div>
      )}
    </div>
  );
};