import React from 'react';

const SunIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
);

const MoonIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
    </svg>
);

const SystemIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
);


interface ThemeToggleProps {
  theme: 'light' | 'dark' | 'system';
  onToggleTheme: () => void;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ theme, onToggleTheme }) => {
    const getIcon = () => {
        switch (theme) {
            case 'light':
                return <MoonIcon />;
            case 'dark':
                return <SystemIcon />;
            default:
                return <SunIcon />;
        }
    };
    
    const getLabel = () => {
        switch (theme) {
            case 'light':
                return 'Switch to dark theme';
            case 'dark':
                return 'Switch to system theme';
            default:
                return 'Switch to light theme';
        }
    };

  return (
    <button
      onClick={onToggleTheme}
      className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-800 focus:ring-blue-500"
      aria-label={getLabel()}
    >
      {getIcon()}
    </button>
  );
};

export default ThemeToggle;
