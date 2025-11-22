import React from 'react';
import type { SavedAnalysis } from '../types';
import { TrashIcon } from './icons/TrashIcon';

interface SavedAnalysisCardProps {
  analysis: SavedAnalysis;
  onDelete: (id: string) => void;
}

export const SavedAnalysisCard: React.FC<SavedAnalysisCardProps> = ({ analysis, onDelete }) => {
  const { skinAnalysis } = analysis;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-none dark:border dark:border-gray-700 p-4 relative transition-shadow hover:shadow-lg flex flex-col sm:flex-row gap-4">
      <button
        onClick={() => onDelete(analysis.id)}
        className="absolute top-2 right-2 p-1.5 bg-red-100 dark:bg-red-900/50 rounded-full text-red-500 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900 hover:text-red-700 transition-colors z-10"
        aria-label="Delete saved analysis"
      >
        <TrashIcon className="w-4 h-4" />
      </button>
      
      <div className="w-full sm:w-1/3 flex-shrink-0">
          <img src={analysis.imageUrl} alt="Saved analysis" className="rounded-lg object-cover w-full h-40 sm:h-full" />
      </div>

      <div className="w-full sm:w-2/3">
        <h3 className="text-lg font-bold text-[#4a4a4a] dark:text-gray-100 mb-3 pr-8">Skin Analysis</h3>
         <div className="space-y-2 text-sm">
            <div className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-700 rounded">
                <span className="font-semibold text-gray-600 dark:text-gray-300">Skin Tone:</span>
                <span className="font-bold text-gray-800 dark:text-gray-100">{skinAnalysis.tone}</span>
            </div>
            <div className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-700 rounded">
                <span className="font-semibold text-gray-600 dark:text-gray-300">Undertone:</span>
                <span className="font-bold text-gray-800 dark:text-gray-100">{skinAnalysis.undertone}</span>
            </div>
            <div className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-700 rounded">
                <span className="font-semibold text-gray-600 dark:text-gray-300">Skin Type:</span>
                <span className="font-bold text-gray-800 dark:text-gray-100">{skinAnalysis.type}</span>
            </div>
         </div>
         {skinAnalysis.observations && (
            <div className="mt-3">
                <p className="font-semibold text-sm text-gray-600 dark:text-gray-300">Observations:</p>
                <p className="text-gray-500 dark:text-gray-300 mt-1 text-xs italic bg-amber-50 dark:bg-amber-900/50 p-2 rounded border border-amber-100 dark:border-amber-800">{skinAnalysis.observations}</p>
            </div>
         )}
      </div>
    </div>
  );
};