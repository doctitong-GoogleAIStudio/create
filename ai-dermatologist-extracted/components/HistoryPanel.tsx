import React from 'react';
import type { HistoryItem } from '../types';

interface HistoryPanelProps {
  isOpen: boolean;
  onClose: () => void;
  history: HistoryItem[];
  onSelectItem: (item: HistoryItem) => void;
  onClearHistory: () => void;
}

const HistoryPanel: React.FC<HistoryPanelProps> = ({ isOpen, onClose, history, onSelectItem, onClearHistory }) => {
  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black/60 z-30 transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
        aria-hidden="true"
      ></div>
      
      {/* Panel */}
      <aside
        className={`fixed top-0 right-0 h-full w-full max-w-sm bg-white dark:bg-gray-800 shadow-xl z-40 transform transition-transform ease-in-out duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="history-panel-title"
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <header className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <h2 id="history-panel-title" className="text-xl font-bold text-gray-800 dark:text-gray-100">Analysis History</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
              aria-label="Close history panel"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </header>

          {/* Content */}
          <div className="flex-grow overflow-y-auto p-4">
            {history.length === 0 ? (
              <div className="text-center text-gray-500 dark:text-gray-400 mt-8">
                <p>No analysis history yet.</p>
                <p className="text-sm">Completed analyses will appear here.</p>
              </div>
            ) : (
              <ul className="space-y-3">
                {history.map(item => (
                  <li key={item.id}>
                    <button
                      onClick={() => onSelectItem(item)}
                      className="w-full flex items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-left transition-colors"
                    >
                      <img src={item.thumbnail} alt="Analysis thumbnail" className="w-16 h-16 rounded-md object-cover mr-4 flex-shrink-0" />
                      <div className="flex-grow">
                        <p className="font-semibold text-gray-800 dark:text-gray-200">{item.diagnosis.mostLikelyDiagnosis.conditionName}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{item.date}</p>
                      </div>
                       <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 dark:text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                        </svg>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Footer */}
          {history.length > 0 && (
            <footer className="p-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={onClearHistory}
                className="w-full px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30 rounded-md hover:bg-red-200 dark:hover:bg-red-900/50"
              >
                Clear History
              </button>
            </footer>
          )}
        </div>
      </aside>
    </>
  );
};

export default HistoryPanel;
