import React from 'react';
import type { SavedProduct, Product } from '../types';
import { TrashIcon } from './icons/TrashIcon';
import { InfoIcon } from './icons/InfoIcon';
import { StarRating } from './StarRating';
import { ExternalLinkIcon } from './icons/ExternalLinkIcon';

const getProductKey = (product: Product): string => {
  return product.id;
};

const ProductList: React.FC<{ 
    title: string; 
    products: Product[];
    ratings: { [key: string]: number };
    onRateProduct: (product: Product, rating: number) => void;
    savedRatings?: { [key: string]: number };
}> = ({ title, products, ratings, onRateProduct, savedRatings = {} }) => (
  <div>
    <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-2 border-b pb-1 dark:border-gray-600">{title}</h4>
    {products.length > 0 ? (
      <ul className="space-y-3">
        {products.map((product, index) => {
          const productKey = getProductKey(product);
          const currentRating = ratings[productKey] || savedRatings[productKey] || 0;
          return (
            <li key={index} className="text-sm">
              <div className="flex items-center gap-2 mb-0.5">
                {product.hexColor && product.hexColor.startsWith('#') && (
                  <div
                    className="w-4 h-4 rounded-full border border-gray-300 dark:border-gray-600 flex-shrink-0"
                    style={{ backgroundColor: product.hexColor }}
                    title={`Color swatch for ${product.shade}`}
                  ></div>
                )}
                <p className="font-bold text-gray-800 dark:text-gray-100">{product.brand}</p>
              </div>
              <div className="pl-6">
                <p className="text-gray-600 dark:text-gray-300">{product.name}</p>
                <p className="text-gray-500 dark:text-gray-400 italic">Shade: {product.shade}</p>
                {product.store && (
                  <p className="text-gray-500 dark:text-gray-400 text-xs mt-1">
                      Available at: <span className="font-semibold">{product.store}</span>
                  </p>
                )}
                {product.notes && (
                  <div className="mt-1.5 flex items-start gap-1.5 text-xs text-sky-800 dark:text-sky-200 bg-sky-50 dark:bg-sky-900/50 p-2 rounded-md border border-sky-100 dark:border-sky-800">
                    <InfoIcon className="w-3 h-3 flex-shrink-0 mt-0.5" />
                    <p>{product.notes}</p>
                  </div>
                )}
                <a
                    href={`https://www.google.com/search?q=${encodeURIComponent(`${product.brand} ${product.name} ${product.store || ''} philippines`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-[#c5a78f] hover:underline inline-flex items-center gap-1 mt-1"
                >
                    <span>Search Online</span>
                    <ExternalLinkIcon className="w-3 h-3" />
                </a>
                <StarRating rating={currentRating} onRate={(rating) => onRateProduct(product, rating)} />
              </div>
            </li>
          );
        })}
      </ul>
    ) : (
      <p className="text-sm text-gray-500 dark:text-gray-400">No recommendations available.</p>
    )}
  </div>
);


interface SavedLookCardProps {
  product: SavedProduct;
  onDelete: (id: string) => void;
  ratings: { [key: string]: number };
  onRateProduct: (product: Product, rating: number) => void;
}

export const SavedLookCard: React.FC<SavedLookCardProps> = ({ product, onDelete, ratings, onRateProduct }) => {

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-none dark:border dark:border-gray-700 p-4 relative transition-shadow hover:shadow-lg">
      <button
        onClick={() => onDelete(product.id)}
        className="absolute top-2 right-2 p-1.5 bg-red-100 dark:bg-red-900/50 rounded-full text-red-500 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900 hover:text-red-700 transition-colors"
        aria-label="Delete saved product"
      >
        <TrashIcon className="w-4 h-4" />
      </button>
      
      <h3 className="text-xl font-bold text-[#4a4a4a] dark:text-gray-100 mb-3 pr-8">{product.category}</h3>
      
      {product.notes && (
        <div className="flex items-start gap-2 bg-blue-50 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 p-3 rounded-md mb-4 text-sm border border-blue-200 dark:border-blue-800">
          <InfoIcon className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <p>{product.notes}</p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <ProductList title="High-End" products={product.highEnd} ratings={ratings} onRateProduct={onRateProduct} savedRatings={product.savedRatings} />
        <ProductList title="Commonly Available" products={product.commonlyAvailable} ratings={ratings} onRateProduct={onRateProduct} savedRatings={product.savedRatings} />
        <ProductList title="Drugstore" products={product.drugstore} ratings={ratings} onRateProduct={onRateProduct} savedRatings={product.savedRatings} />
        <ProductList title="Dupes/Affordable" products={product.dupesAffordable || []} ratings={ratings} onRateProduct={onRateProduct} savedRatings={product.savedRatings} />
      </div>
    </div>
  );
};