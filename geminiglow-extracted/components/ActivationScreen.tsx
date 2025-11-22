import React, { useState, useEffect } from 'react';
import { getInstallData, activateLicense } from '../services/licensingService';
import { Loader } from './Loader';
import { ErrorMessage } from './ErrorMessage';

interface ActivationScreenProps {
  onActivated: () => void;
}

export const ActivationScreen: React.FC<ActivationScreenProps> = ({ onActivated }) => {
  const [installData, setInstallData] = useState<{ installId: string; publicKeyJwkStr: string } | null>(null);
  const [licenseKey, setLicenseKey] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInstallData = async () => {
      try {
        const data = await getInstallData();
        setInstallData(data);
      } catch (err) {
        setError('Could not generate installation data. Your browser might be in private mode or does not support necessary crypto features.');
      }
    };
    fetchInstallData();
  }, []);

  const handleCopyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  const handleActivate = async () => {
    if (!licenseKey.trim()) {
      setError('Please enter a license key.');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const success = await activateLicense(licenseKey);
      if (success) {
        onActivated();
      } else {
        setError('The provided license key is invalid or expired. Please check the key and try again.');
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred during activation.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!installData) {
    return (
      <div className="text-center p-8">
        {error ? <ErrorMessage message={error} /> : <Loader size="lg" />}
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 sm:p-8 max-w-2xl mx-auto text-center animate-fade-in">
      <h2 className="text-2xl sm:text-3xl font-bold text-[#3a3a3a] dark:text-gray-100">Activation Required</h2>
      <p className="mt-4 text-gray-600 dark:text-gray-300">
        To use this application, you need a valid license key. Please provide the following information to your administrator to receive your key.
      </p>

      <div className="text-left mt-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Installation ID</label>
          <div className="flex items-center gap-2 mt-1">
            <input
              type="text"
              readOnly
              value={installData.installId}
              className="flex-grow px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-gray-700 dark:text-gray-200 sm:text-sm"
            />
            <button
              onClick={() => handleCopyToClipboard(installData.installId)}
              className="px-3 py-2 text-sm font-semibold rounded-md bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500"
            >
              Copy
            </button>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Public Key</label>
          <div className="flex items-center gap-2 mt-1">
            <textarea
              readOnly
              rows={3}
              value={installData.publicKeyJwkStr}
              className="flex-grow px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-gray-700 dark:text-gray-200 sm:text-sm font-mono"
            />
             <button
              onClick={() => handleCopyToClipboard(installData.publicKeyJwkStr)}
              className="px-3 py-2 text-sm font-semibold rounded-md bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500"
            >
              Copy
            </button>
          </div>
        </div>
      </div>

      <div className="mt-8 border-t border-gray-200 dark:border-gray-700 pt-6">
        <label htmlFor="licenseKey" className="block text-lg font-medium text-gray-800 dark:text-gray-200">Enter Your License Key</label>
        <textarea
          id="licenseKey"
          rows={4}
          value={licenseKey}
          onChange={(e) => setLicenseKey(e.target.value)}
          placeholder="Paste the license key you received here..."
          className="mt-2 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-[#c5a78f] focus:border-[#c5a78f] sm:text-sm font-mono"
        />
        {error && <div className="mt-4"><ErrorMessage message={error} /></div>}
        <button
          onClick={handleActivate}
          disabled={isLoading}
          className="mt-4 w-full bg-[#c5a78f] text-white font-bold py-3 px-4 rounded-xl hover:bg-[#b9987e] transition-all duration-300 text-lg shadow-md hover:shadow-lg disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-3"
        >
          {isLoading ? (
            <>
              <Loader size="sm" />
              <span>Activating...</span>
            </>
          ) : (
            'Activate'
          )}
        </button>
      </div>
    </div>
  );
};
