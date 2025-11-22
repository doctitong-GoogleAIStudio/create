import React from 'react';

const Loader: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center space-y-6 my-8" aria-live="polite" aria-busy="true">
      <div className="relative w-24 h-24">
        {/* Lens */}
        <div className="absolute top-0 left-0 w-20 h-20 rounded-full border-4 border-gray-300 dark:border-gray-600 bg-gray-50/50 dark:bg-gray-800/50 overflow-hidden">
           <div className="absolute top-[-4px] left-0 w-full h-1.5 bg-blue-500 scan-line-loader shadow-[0_0_15px_1px_theme(colors.blue.400)]"></div>
        </div>
        {/* Handle */}
        <div 
          className="absolute h-4 w-9 bg-gray-300 dark:bg-gray-600"
          style={{
            transform: 'rotate(45deg)',
            right: '2px',
            bottom: '2px',
          }}
        ></div>
      </div>
      <div className="text-center">
        <p className="text-lg font-semibold text-gray-800 dark:text-gray-100">Analyzing Image...</p>
        <p className="text-sm text-gray-500 dark:text-gray-400">AI is processing, please wait a moment.</p>
      </div>
    </div>
  );
};

export default Loader;