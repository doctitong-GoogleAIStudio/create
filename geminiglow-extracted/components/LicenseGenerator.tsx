import React, { useState } from 'react';
import { generateLicense } from '../services/licensingService';
import { Loader } from './Loader';

interface LicenseGeneratorProps {
  onClose: () => void;
}

export const LicenseGenerator: React.FC<LicenseGeneratorProps> = ({ onClose }) => {
  const [installId, setInstallId] = useState('');
  const [publicKey, setPublicKey] = useState('');
  const [generatedLicense, setGeneratedLicense] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    if (!installId.trim() || !publicKey.trim()) {
      setError('Both Installation ID and Public Key are required.');
      return;
    }
    setIsLoading(true);
    setError('');
    setGeneratedLicense('');
    try {
      const license = await generateLicense(installId, publicKey);
      setGeneratedLicense(license);
    } catch (e: any) {
      setError(e.message || 'Failed to generate license.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleCopyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4 animate-fade-in" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 max-w-2xl w-full relative" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-2 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-3xl font-bold">&times;</button>
        <h1 className="text-3xl font-bold text-[#3a3a3a] dark:text-gray-100 mb-2">Admin License Generator</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-6">Enter the user's data to generate a new license key.</p>

        <div className="space-y-4">
          <div>
            <label htmlFor="installId" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              User's Installation ID
            </label>
            <input
              type="text"
              id="installId"
              value={installId}
              onChange={(e) => setInstallId(e.target.value)}
              placeholder="Paste Installation ID here"
              className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-[#c5a78f] focus:border-[#c5a78f] sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="publicKey" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              User's Public Key
            </label>
            <textarea
              id="publicKey"
              rows={4}
              value={publicKey}
              onChange={(e) => setPublicKey(e.target.value)}
              placeholder="Paste Public Key (JWK format) here"
              className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-[#c5a78f] focus:border-[#c5a78f] sm:text-sm font-mono"
            />
          </div>
        </div>

        {error && <p className="text-red-500 text-sm mt-4">{error}</p>}

        <button
          onClick={handleGenerate}
          disabled={isLoading}
          className="mt-6 w-full bg-[#c5a78f] text-white font-bold py-3 px-4 rounded-xl hover:bg-[#b9987e] transition-all duration-300 text-lg shadow-md hover:shadow-lg disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-3"
        >
          {isLoading ? (
            <>
              <Loader size="sm" />
              <span>Generating...</span>
            </>
          ) : (
            'Generate License'
          )}
        </button>

        {generatedLicense && (
          <div className="mt-8 border-t border-gray-200 dark:border-gray-700 pt-6">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Generated License Key</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Send this entire block of text to the user.</p>
            <div className="relative">
              <textarea
                readOnly
                rows={5}
                value={generatedLicense}
                className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-200 sm:text-sm font-mono"
              />
              <button
                onClick={() => handleCopyToClipboard(generatedLicense)}
                className="absolute top-2 right-2 px-3 py-1 text-xs font-semibold rounded-md bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500"
              >
                Copy
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};