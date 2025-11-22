import React, { useState, useEffect, useRef } from 'react';
import { getInstallationId } from '../services/licenseService';
import ThemeToggle from './ThemeToggle';

interface LicenseProps {
    onActivate: (licenseKey: string) => Promise<{ success: boolean; message: string }>;
    theme: 'light' | 'dark' | 'system';
    onToggleTheme: () => void;
}

const CaduceusIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-blue-600 dark:text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22V8" />
        <path d="M15 5.5a2.5 2.5 0 1 0-5 0" />
        <path d="M15 8.5a2.5 2.5 0 1 1-5 0" />
        <path d="M7 12a5 5 0 0 0 5 5" />
        <path d="M12 17a5 5 0 0 0 5-5" />
        <path d="M7 12h10" />
    </svg>
);

const License: React.FC<LicenseProps> = ({ onActivate, theme, onToggleTheme }) => {
    const [installationId, setInstallationId] = useState('');
    const [licenseKeyInput, setLicenseKeyInput] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activating, setActivating] = useState(false);
    const [copySuccess, setCopySuccess] = useState('');

    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const init = async () => {
            try {
                const id = getInstallationId();
                setInstallationId(id);
            } catch (err) {
                console.error("Setup failed:", err);
                setError("Could not initialize the application. Please use a modern browser.");
            } finally {
                setLoading(false);
            }
        };
        init();
    }, []);

    const handleCopyToClipboard = () => {
        const details = `Installation ID: ${installationId}`;
        navigator.clipboard.writeText(details).then(() => {
            setCopySuccess('Details copied to clipboard!');
            setTimeout(() => setCopySuccess(''), 2000);
        }, () => {
            setCopySuccess('Failed to copy.');
        });
    };

    const handleActivateClick = async () => {
        if (!licenseKeyInput.trim()) {
            setError('Please enter a license key.');
            return;
        }
        setActivating(true);
        setError(null);
        const result = await onActivate(licenseKeyInput.trim());
        if (!result.success) {
            setError(result.message);
        }
        setActivating(false);
    };

    const handleImportKey = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const text = e.target?.result;
                if (typeof text === 'string') {
                    setLicenseKeyInput(text);
                }
            };
            reader.readAsText(file);
        }
        event.target.value = ''; // Reset input
    };
    
    const emailBody = `Please provide payment details for AI Dermatologist activation.\n\nMy device details are:\n\nInstallation ID: ${installationId}\n\nThank you.`;
    const mailtoLink = `mailto:ai20doc25@gmail.com?subject=AI Dermatologist License Request&body=${encodeURIComponent(emailBody)}`;


    return (
        <div className="min-h-screen bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-sans transition-colors">
            <header className="w-full bg-white dark:bg-gray-800 shadow-md dark:shadow-black/20 p-4 sticky top-0 z-10">
                <div className="max-w-4xl mx-auto flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <CaduceusIcon />
                        <div>
                           <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">AI Dermatologist</h1>
                           <p className="text-sm text-gray-500 dark:text-gray-400">License Activation</p>
                        </div>
                    </div>
                    <ThemeToggle theme={theme} onToggleTheme={onToggleTheme} />
                </div>
            </header>

            <main className="max-w-2xl mx-auto p-4 md:p-8">
                 <div className="bg-white dark:bg-gray-800/50 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
                    <h2 className="text-2xl font-bold mb-4 text-center">How to Activate Your App</h2>
                    <p className="text-center text-gray-600 dark:text-gray-400 mb-8">
                        To unlock all features, please activate your app with a unique license key tied to this device.
                    </p>

                    {loading ? (
                        <div className="text-center p-8">
                           <p>Generating secure device ID...</p>
                        </div>
                    ) : error && !activating ? ( // Only show global error if not in activation process
                         <div className="my-4 bg-red-100 dark:bg-red-900/30 border-l-4 border-red-500 text-red-700 dark:text-red-200 p-4 rounded-md" role="alert">
                            <p className="font-bold">Error</p>
                            <p>{error}</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {/* Step 1 */}
                            <div className="p-6 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                                <h3 className="text-lg font-bold mb-1">1. Request Payment Details</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Send your device's unique "Installation ID" in an email to <strong className="font-semibold text-gray-700 dark:text-gray-300">ai20doc25@gmail.com</strong> to request payment details. Click the button below to do this automatically.</p>
                                
                                <a href={mailtoLink} className="w-full inline-flex justify-center items-center px-4 py-2.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-800 focus:ring-green-500">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                        <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                                        <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                                    </svg>
                                    Request via Email
                                </a>

                                <div className="text-center my-3 text-sm text-gray-400 dark:text-gray-500">
                                    &mdash; Or, manually copy details &mdash;
                                </div>

                                <div className="space-y-2 text-xs font-mono p-3 bg-gray-100 dark:bg-gray-900 rounded break-words">
                                    <p><strong className="text-gray-600 dark:text-gray-400">Installation ID:</strong> {installationId}</p>
                                </div>
                                <div className="text-center mt-2">
                                    <button onClick={handleCopyToClipboard} className="text-sm text-blue-600 dark:text-blue-400 hover:underline">{copySuccess || 'Copy Details'}</button>
                                </div>
                            </div>

                            {/* Step 2 */}
                             <div className="p-6 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                                <h3 className="text-lg font-bold mb-1">2. Complete Payment</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">You will receive a reply with a GCash QR code or number. After paying, reply to the email with a screenshot of your GCash receipt as proof of payment.</p>
                            </div>
                            
                            {/* Step 3 */}
                            <div className="p-6 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                                <h3 className="text-lg font-bold mb-1">3. Activate Your License</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Once your payment is verified, your unique "License Key" will be sent to you. Return to the app, paste the complete License Key into the text box, or Import the `License key.txt` file, then click "Activate".</p>
                                
                                <textarea
                                    value={licenseKeyInput}
                                    onChange={(e) => setLicenseKeyInput(e.target.value)}
                                    placeholder="Paste the license key you received here..."
                                    rows={4}
                                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-100 dark:bg-gray-900 focus:ring-blue-500 focus:border-blue-500"
                                    aria-label="License Key Input"
                                />
                                <div className="mt-4 flex flex-col sm:flex-row gap-3">
                                    <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".txt,text/plain" className="sr-only" />
                                    <button onClick={handleImportKey} className="w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 dark:border-gray-500 text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                        </svg>
                                        Import license Key
                                    </button>
                                    <button
                                        onClick={handleActivateClick}
                                        disabled={activating}
                                        className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-800 focus:ring-blue-500 disabled:bg-gray-400 dark:disabled:bg-gray-600"
                                    >
                                        {activating ? 'Activating...' : 'Activate'}
                                    </button>
                                </div>
                                {error && activating && <p className="text-red-500 text-sm mt-2">{error}</p>}
                            </div>

                            {/* Important Notes */}
                             <div className="p-6 rounded-lg border border-yellow-300 dark:border-yellow-700 bg-yellow-50 dark:bg-yellow-900/20">
                                <h3 className="text-lg font-bold text-yellow-800 dark:text-yellow-200 mb-2">Important Notes</h3>
                                <ul className="list-disc list-inside space-y-1 text-sm text-yellow-700 dark:text-yellow-300">
                                    <li>Each license key is tied to one specific device. It will not work on other devices.</li>
                                    <li>Please use the "Request via Email" button to ensure your ID is sent correctly. Any mistake will result in an invalid license.</li>
                                </ul>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default License;