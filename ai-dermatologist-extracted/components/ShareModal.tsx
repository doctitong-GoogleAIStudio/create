import React, { useState } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Diagnosis } from '../types';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  shareData: {
    diagnosis: Diagnosis;
    images: string[]; // data URLs
  };
}

const DownloadIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
    </svg>
);

const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose, shareData }) => {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownloadPdf = async () => {
    const contentElement = document.getElementById('diagnosis-content');
    if (!contentElement) {
      console.error('Diagnosis content element not found!');
      return;
    }
    
    setIsDownloading(true);

    try {
        const canvas = await html2canvas(contentElement, { 
            scale: 2,
            useCORS: true,
            backgroundColor: window.getComputedStyle(document.body).getPropertyValue('background-color'),
        });

        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({
            orientation: 'p',
            unit: 'px',
            format: [canvas.width, canvas.height]
        });

        pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
        pdf.save(`AI-Dermatologist-Report-${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
        console.error("Error generating PDF:", error);
    } finally {
        setIsDownloading(false);
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div 
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" 
      role="dialog" 
      aria-modal="true"
      aria-labelledby="share-modal-title"
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col relative"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h2 id="share-modal-title" className="text-xl font-bold text-gray-800 dark:text-gray-100">Download Result</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
            aria-label="Close share modal"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </header>

        <div className="flex-grow p-6 overflow-y-auto space-y-6 text-gray-700 dark:text-gray-300">
          <div>
            <button
                type="button"
                onClick={handleDownloadPdf}
                disabled={isDownloading}
                className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-800 focus:ring-blue-500 disabled:bg-gray-400 dark:disabled:bg-gray-500 disabled:cursor-wait"
            >
                <DownloadIcon />
                {isDownloading ? 'Downloading...' : 'Download as PDF'}
            </button>
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">Generates a PDF file of the analysis report for offline viewing or printing.</p>
          </div>
        </div>
        
        <footer className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 font-semibold text-gray-700 dark:text-gray-200 bg-gray-200 dark:bg-gray-600 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 focus:outline-none"
          >
            Close
          </button>
        </footer>
      </div>
    </div>
  );
};

export default ShareModal;