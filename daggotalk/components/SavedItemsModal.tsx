import React, { useState } from 'react';
import type { SavedAnalysis, SavedProduct, Product } from '../types';
import { SavedAnalysisCard } from './SavedAnalysisCard';
import { SavedLookCard } from './SavedLookCard';
import { TrashIcon } from './icons/TrashIcon';

interface SavedItemsModalProps {
  savedAnalyses: SavedAnalysis[];
  savedProducts: SavedProduct[];
  ratings: { [key: string]: number };
  onRateProduct: (product: Product, rating: number) => void;
  onDeleteAnalysis: (id: string) => void;
  onDeleteProduct: (id: string) => void;
  onDeleteAllAnalyses: () => void;
  onDeleteAllProducts: () => void;
  onClose: () => void;
}

const ConfirmationModal: React.FC<{ title: string, message: string, onConfirm: () => void, onCancel: () => void }> = ({ title, message, onConfirm, onCancel }) => (
    <div className="fixed inset-0 bg-black bg-opacity-70 z-[60] flex justify-center items-center p-4 animate-fade-in" onClick={onCancel}>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl max-w-sm w-full" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">{title}</h3>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{message}</p>
            <div className="mt-6 flex justify-end gap-3">
                <button
                    onClick={onCancel}
                    className="bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 font-bold py-2 px-4 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
                >
                    Cancel
                </button>
                <button
                    onClick={onConfirm}
                    className="bg-red-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-700 transition-colors"
                >
                    Delete
                </button>
            </div>
        </div>
    </div>
);


export const SavedItemsModal: React.FC<SavedItemsModalProps> = ({
  savedAnalyses,
  savedProducts,
  ratings,
  onRateProduct,
  onDeleteAnalysis,
  onDeleteProduct,
  onDeleteAllAnalyses,
  onDeleteAllProducts,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'analyses' | 'looks'>('analyses');
  const [showConfirmDeleteAll, setShowConfirmDeleteAll] = useState(false);

  const handleDeleteAnalysisWithConfirm = (id: string) => {
    if (window.confirm("Are you sure you want to delete this analysis?")) {
      onDeleteAnalysis(id);
    }
  };

  const handleDeleteProductWithConfirm = (id:string) => {
    if (window.confirm("Are you sure you want to delete this saved look?")) {
      onDeleteProduct(id);
    }
  }

  const handleDeleteAllClick = () => {
    setShowConfirmDeleteAll(true);
  };

  const confirmDeleteAll = () => {
    if (activeTab === 'analyses') {
      onDeleteAllAnalyses();
    } else {
      onDeleteAllProducts();
    }
    setShowConfirmDeleteAll(false);
  };

  const cancelDeleteAll = () => {
    setShowConfirmDeleteAll(false);
  };

  const TabButton: React.FC<{
    label: string;
    count: number;
    tabName: 'analyses' | 'looks';
  }> = ({ label, count, tabName }) => (
    <button
      onClick={() => setActiveTab(tabName)}
      className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${
        activeTab === tabName
          ? 'bg-[#c5a78f] text-white'
          : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'
      }`}
    >
      {label} <span className="text-xs bg-black/10 dark:bg-white/10 px-1.5 py-0.5 rounded-full">{count}</span>
    </button>
  );

  return (
    <>
      {showConfirmDeleteAll && (
          <ConfirmationModal 
              title={`Delete All ${activeTab === 'analyses' ? 'Analyses' : 'Looks'}`}
              message={`Are you sure you want to delete ALL saved ${activeTab === 'analyses' ? 'analyses' : 'looks'}? This action cannot be undone.`}
              onConfirm={confirmDeleteAll}
              onCancel={cancelDeleteAll}
          />
      )}
      <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4 animate-fade-in" onClick={onClose}>
        <div
          className="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-2xl shadow-2xl max-w-4xl w-full relative max-h-[90vh] flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={onClose}
            className="absolute top-2 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-3xl font-bold z-10"
          >
            &times;
          </button>
          <h2 className="text-2xl font-bold text-[#3a3a3a] dark:text-gray-100 mb-4">My Saved Items</h2>
          
          <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 mb-4">
            <div className="flex items-center gap-2">
              <TabButton label="Saved Analyses" count={savedAnalyses.length} tabName="analyses" />
              <TabButton label="Saved Looks" count={savedProducts.length} tabName="looks" />
            </div>
            {((activeTab === 'analyses' && savedAnalyses.length > 0) ||
              (activeTab === 'looks' && savedProducts.length > 0)) && (
              <button
                onClick={handleDeleteAllClick}
                className="flex items-center gap-1.5 text-sm text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-semibold px-2 py-1 rounded-md hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors"
                aria-label={`Delete all ${activeTab === 'analyses' ? 'saved analyses' : 'saved looks'}`}
              >
                <TrashIcon className="w-4 h-4" />
                <span>Delete All</span>
              </button>
            )}
          </div>

          <div className="overflow-y-auto flex-grow pr-2 -mr-2">
            {activeTab === 'analyses' && (
              <div className="space-y-4">
                {savedAnalyses.length > 0 ? (
                  savedAnalyses.map((analysis) => (
                    <SavedAnalysisCard key={analysis.id} analysis={analysis} onDelete={handleDeleteAnalysisWithConfirm} />
                  ))
                ) : (
                  <p className="text-center text-gray-500 dark:text-gray-400 py-8">You haven't saved any skin analyses yet.</p>
                )}
              </div>
            )}

            {activeTab === 'looks' && (
              <div className="space-y-4">
                {savedProducts.length > 0 ? (
                  savedProducts.map((product) => (
                    <SavedLookCard key={product.id} product={product} onDelete={handleDeleteProductWithConfirm} ratings={ratings} onRateProduct={onRateProduct} />
                  ))
                ) : (
                  <p className="text-center text-gray-500 dark:text-gray-400 py-8">You haven't saved any product looks yet.</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};