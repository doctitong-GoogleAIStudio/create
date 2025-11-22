import React, { useState, useEffect } from 'react';
import { DownloadCloudIcon } from './icons/DownloadCloudIcon';

// The BeforeInstallPromptEvent is not in standard TS libs yet.
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export const InstallPWAButton: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent the browser's default mini-infobar
      e.preventDefault();
      // Stash the event so it can be triggered later
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsVisible(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Hide the button if the app is installed
    const handleAppInstalled = () => {
        setIsVisible(false);
        setDeferredPrompt(null);
    };

    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      return;
    }
    // Show the install prompt
    deferredPrompt.prompt();
    // Wait for the user to respond
    await deferredPrompt.userChoice;
    // The prompt can only be used once
    setDeferredPrompt(null);
    setIsVisible(false);
  };

  if (!isVisible) {
    return null;
  }

  return (
    <button
      onClick={handleInstallClick}
      className="font-semibold py-2 px-3 rounded-lg transition-colors bg-[#c5a78f] text-white hover:bg-[#b9987e] flex items-center gap-2 animate-fade-in"
      title="Install App on your device"
    >
      <DownloadCloudIcon className="w-4 h-4" />
      <span>Install App</span>
    </button>
  );
};