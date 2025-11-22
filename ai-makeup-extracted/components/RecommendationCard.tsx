import React, { useState, useRef } from 'react';
import type { MakeupRecommendation, Product, ProductRecommendation } from '../types';
import { InfoIcon } from './icons/InfoIcon';
import { StarRating } from './StarRating';
import { DownloadIcon } from './icons/DownloadIcon';
import { ImageComparator } from './ImageComparator';
import { Loader } from './Loader';

declare global {
    interface Window {
        html2canvas: any;
        jspdf: any;
    }
}

interface RecommendationCardProps {
  recommendations: MakeupRecommendation;
  beforeImageUrl: string | null;
  afterImageUrl: string | null;
  isGeneratingAfterImage: boolean;
  ratings: { [key: string]: number };
  onRateProduct: (product: Product, rating: number) => void;
}

const getProductKey = (product: Product): string => {
  return `${product.brand}-${product.name}`.toLowerCase().replace(/\s+/g, '-');
};

const ProductCard: React.FC<{ 
  title: string; 
  products: Product[];
  ratings: { [key: string]: number };
  onRateProduct: (product: Product, rating: number) => void;
}> = ({ title, products, ratings, onRateProduct }) => (
  <div>
    <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-2 border-b pb-1 dark:border-gray-600">{title}</h4>
    {products.length > 0 ? (
      <ul className="space-y-3">
        {products.map((product, index) => {
           const productKey = getProductKey(product);
           const currentRating = ratings[productKey] || 0;
           return (
             <li key={index} className="text-sm">
               <p className="font-bold text-gray-800 dark:text-gray-100">{product.brand}</p>
               <p className="text-gray-600 dark:text-gray-300">{product.name}</p>
               <p className="text-gray-500 dark:text-gray-400 italic">Shade: {product.shade}</p>
               <StarRating rating={currentRating} onRate={(rating) => onRateProduct(product, rating)} />
             </li>
           );
        })}
      </ul>
    ) : (
      <p className="text-sm text-gray-500 dark:text-gray-400">No recommendations available.</p>
    )}
  </div>
);

export const RecommendationCard: React.FC<RecommendationCardProps> = ({ 
    recommendations, 
    beforeImageUrl,
    afterImageUrl,
    isGeneratingAfterImage,
    ratings, 
    onRateProduct 
}) => {
  const { skinAnalysis, productRecommendations } = recommendations;
  const [showUndertoneInfo, setShowUndertoneInfo] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const recommendationRef = useRef<HTMLDivElement>(null);

  const handleExportPdf = async () => {
    if (!recommendationRef.current || isExporting) return;
    
    setIsExporting(true);
    
    const elementToExport = recommendationRef.current;
    const elementsToHide = elementToExport.querySelectorAll('.export-hide');
    const originalInlineStyle = elementToExport.getAttribute('style');
    const interactiveImageContainer = elementToExport.querySelector('#interactive-image-container');
    const pdfImagesContainer = document.createElement('div');
    pdfImagesContainer.id = 'pdf-temp-images';

    // Temporarily apply styles for consistent PDF rendering.
    elementToExport.style.position = 'absolute';
    elementToExport.style.left = '-9999px';
    elementToExport.style.top = '0px';
    elementToExport.style.width = '1024px';
  
    elementsToHide.forEach(el => ((el as HTMLElement).style.display = 'none'));
    if (interactiveImageContainer) (interactiveImageContainer as HTMLElement).style.display = 'none';
  
    try {
      if (beforeImageUrl && afterImageUrl) {
          const isDark = document.documentElement.classList.contains('dark');
          const textColor = isDark ? '#f3f4f6' : '#1f2937';
          const borderColor = isDark ? '#374151' : '#e5e7eb';
  
          const loadImage = (src: string) => new Promise((resolve, reject) => {
              const img = new Image();
              img.crossOrigin = 'anonymous';
              img.onload = () => resolve(img);
              img.onerror = (err) => reject(err);
              img.src = src;
          });
          await Promise.all([loadImage(beforeImageUrl), loadImage(afterImageUrl)]);
          
          pdfImagesContainer.innerHTML = `
              <div style="padding-bottom: 24px; margin-bottom: 24px; border-bottom: 1px solid ${borderColor};">
                  <h2 style="font-size: 1.5rem; font-weight: bold; color: ${textColor}; margin-bottom: 16px;">Visual Comparison</h2>
                  <div style="display: flex; gap: 16px;">
                      <div style="flex: 1; text-align: center;">
                          <h3 style="font-size: 1.125rem; font-weight: 600; margin-bottom: 8px; color: ${textColor};">Before</h3>
                          <img src="${beforeImageUrl}" style="width: 100%; border-radius: 0.5rem; box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);" />
                      </div>
                      <div style="flex: 1; text-align: center;">
                          <h3 style="font-size: 1.125rem; font-weight: 600; margin-bottom: 8px; color: ${textColor};">After</h3>
                          <img src="${afterImageUrl}" style="width: 100%; border-radius: 0.5rem; box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);" />
                      </div>
                  </div>
              </div>
          `;
          elementToExport.prepend(pdfImagesContainer);
      }

      const canvas = await window.html2canvas(elementToExport, {
        scale: 2,
        useCORS: true,
        backgroundColor: document.documentElement.classList.contains('dark') ? '#111827' : '#ffffff'
      });
      
      const imgData = canvas.toDataURL('image/png');
      const { jsPDF } = window.jspdf;
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const canvasAspectRatio = canvas.width / canvas.height;
      const imgHeight = pdfWidth / canvasAspectRatio;
  
      let heightLeft = imgHeight;
      let position = 0;
  
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, imgHeight);
      heightLeft -= pdfHeight;
  
      while (heightLeft > 0) {
        position -= pdfHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
        heightLeft -= pdfHeight;
      }
  
      pdf.save('makeup-recommendations.pdf');
  
    } catch (error) {
      console.error("Error exporting to PDF:", error);
    } finally {
      elementsToHide.forEach(el => ((el as HTMLElement).style.display = ''));
      if (interactiveImageContainer) (interactiveImageContainer as HTMLElement).style.display = '';

      const tempImages = elementToExport.querySelector('#pdf-temp-images');
      if (tempImages) tempImages.remove();
      
      if (originalInlineStyle) {
          elementToExport.setAttribute('style', originalInlineStyle);
      } else {
          elementToExport.removeAttribute('style');
      }
      setIsExporting(false);
    }
  };

  return (
    <div ref={recommendationRef} className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 sm:p-8 animate-fade-in">
      <div className="flex flex-col md:flex-row gap-8 mb-8 pb-6 border-b border-gray-200 dark:border-gray-700">
        {beforeImageUrl && (
            <div id="interactive-image-container" className="md:w-1/3 flex-shrink-0">
                {isGeneratingAfterImage ? (
                    <div className="rounded-xl aspect-[3/4] bg-gray-200 dark:bg-gray-700 flex flex-col justify-center items-center shadow-lg">
                        <Loader size="lg" />
                        <p className="mt-4 text-sm font-semibold text-gray-600 dark:text-gray-300">Applying Makeup...</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">This can take a moment.</p>
                    </div>
                ) : afterImageUrl ? (
                    <ImageComparator beforeSrc={beforeImageUrl} afterSrc={afterImageUrl} />
                ) : (
                    <img src={beforeImageUrl} alt="Analyzed" className="rounded-xl object-cover w-full h-auto shadow-lg" />
                )}
            </div>
        )}
        <div className="md:w-2/3">
            <div className="flex justify-between items-center mb-4 gap-2">
                <h2 className="text-2xl font-bold text-[#3a3a3a] dark:text-gray-100">Your Skin Analysis</h2>
                <div className="flex items-center gap-2 flex-shrink-0 export-hide">
                    <button
                        onClick={handleExportPdf}
                        disabled={isExporting}
                        className="text-sm font-semibold py-2 px-4 rounded-lg transition-colors bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <DownloadIcon className="w-4 h-4" />
                        {isExporting ? 'Exporting...' : 'Export PDF'}
                    </button>
                </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
              <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
                <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">Skin Tone</p>
                <p className="text-lg font-bold text-[#4a4a4a] dark:text-gray-100">{skinAnalysis.tone}</p>
              </div>
              <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
                <div className="flex items-center justify-center gap-2">
                  <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">Undertone</p>
                  <button onClick={() => setShowUndertoneInfo(!showUndertoneInfo)} className="text-gray-400 hover:text-[#c5a78f]" aria-label="Learn more about undertones">
                    <InfoIcon className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-lg font-bold text-[#4a4a4a] dark:text-gray-100">{skinAnalysis.undertone}</p>
              </div>
              <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
                <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">Skin Type</p>
                <p className="text-lg font-bold text-[#4a4a4a] dark:text-gray-100">{skinAnalysis.type}</p>
              </div>
            </div>

            {showUndertoneInfo && (
              <div className="mt-6 bg-stone-100 dark:bg-gray-900 p-4 rounded-lg border border-stone-200 dark:border-gray-700 animate-fade-in">
                <h3 className="font-bold text-lg text-gray-800 dark:text-gray-100 mb-2">Understanding Your Undertone</h3>
                <div className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
                  <div>
                    <h4 className="font-semibold text-[#c5a78f]">Cool Undertones</h4>
                    <p>Skin has hints of pink, red, or blue. Common indicators include veins on your wrist appearing blue, silver jewelry looking best, and your skin tending to burn before it tans in the sun.</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-[#c5a78f]">Warm Undertones</h4>
                    <p>Skin has hints of yellow, golden, or peachy hues. Common indicators include veins on your wrist appearing green, gold jewelry looking best, and your skin tending to tan easily in the sun.</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-[#c5a78f]">Olive Undertones</h4>
                    <p>Skin has a combination of neutral, yellow, and subtle green hues. It's common in people who tan easily but can still burn. Both gold and silver jewelry may look good. Vein color is often less clear and can appear greenish.</p>
                  </div>
                </div>
              </div>
            )}

            {skinAnalysis.observations && (
              <div className="mt-4">
                <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">Observations:</h3>
                <p className="text-gray-600 dark:text-gray-300 bg-amber-50 dark:bg-amber-900/50 p-3 rounded-lg border border-amber-200 dark:border-amber-800">{skinAnalysis.observations}</p>
              </div>
            )}
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold text-[#3a3a3a] dark:text-gray-100 mb-6">Product Recommendations</h2>
        <div className="space-y-6">
          {productRecommendations.map((rec) => {
            return (
              <div key={rec.category} className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-xl font-bold text-[#4a4a4a] dark:text-gray-100">{rec.category}</h3>
                </div>
                {rec.notes && (
                  <div className="flex items-start gap-2 bg-blue-50 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 p-3 rounded-md mb-4 text-sm border border-blue-200 dark:border-blue-800">
                    <InfoIcon className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <p>{rec.notes}</p>
                  </div>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <ProductCard title="High-End" products={rec.highEnd} ratings={ratings} onRateProduct={onRateProduct} />
                  <ProductCard title="Commonly Available" products={rec.commonlyAvailable} ratings={ratings} onRateProduct={onRateProduct} />
                  <ProductCard title="Drugstore" products={rec.drugstore} ratings={ratings} onRateProduct={onRateProduct} />
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  );
};