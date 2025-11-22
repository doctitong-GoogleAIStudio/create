import React from 'react';
import ThemeToggle from './ThemeToggle';

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

const HistoryIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const AboutIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);


interface HeaderProps {
    onToggleHistory: () => void;
    onToggleAbout: () => void;
    theme: 'light' | 'dark' | 'system';
    onToggleTheme: () => void;
}


const Header: React.FC<HeaderProps> = ({ onToggleHistory, onToggleAbout, theme, onToggleTheme }) => {
    return (
        <header className="w-full bg-white dark:bg-gray-800 shadow-md dark:shadow-black/20 p-4 sticky top-0 z-10 transition-colors">
            <div className="max-w-4xl mx-auto flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <CaduceusIcon />
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">AI Dermatologist</h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400">AI-Powered Skin Lesion Analysis</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <ThemeToggle theme={theme} onToggleTheme={onToggleTheme} />
                    <button
                      onClick={onToggleAbout}
                      className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-800 focus:ring-blue-500"
                      aria-label="About this application"
                    >
                      <AboutIcon />
                    </button>
                    <button
                      onClick={onToggleHistory}
                      className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-800 focus:ring-blue-500"
                      aria-label="View history"
                    >
                      <HistoryIcon />
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Header;