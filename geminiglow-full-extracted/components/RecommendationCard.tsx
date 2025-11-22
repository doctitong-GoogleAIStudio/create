
import React, { useState, useRef } from 'react';
import type { MakeupRecommendation, Product, ProductRecommendation, SkinAnalysis } from '../types';
import { InfoIcon } from './icons/InfoIcon';
import { StarRating } from './StarRating';
import { DownloadIcon } from './icons/DownloadIcon';
import { ImageComparator } from './ImageComparator';
import { Loader } from './Loader';
import { BookmarkIcon } from './icons/BookmarkIcon';
import { ExternalLinkIcon } from './icons/ExternalLinkIcon';

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
  onSaveAnalysis: () => void;
  onSaveProduct: (productRec: ProductRecommendation, ratingsToSave: { [key: string]: number }) => void;
}

const getProductKey = (product: Product): string => {
  return product.id;
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
                    className="text-xs text-[#c5a78f] hover:underline inline-flex items-center gap-1 mt-1 export-hide"
                >
                    <span>Search Online</span>
                    <ExternalLinkIcon className="w-3 h-3" />
                </a>
                <div className="export-hide">
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

export const RecommendationCard: React.FC<RecommendationCardProps> = ({ 
    recommendations, 
    beforeImageUrl,
    afterImageUrl,
    isGeneratingAfterImage,
    ratings, 
    onRateProduct,
    onSaveAnalysis,
    onSaveProduct,
}) => {
  const { skinAnalysis, productRecommendations } = recommendations;
  const [showUndertoneInfo, setShowUndertoneInfo] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const recommendationRef = useRef<HTMLDivElement>(null);

  const handleSaveProductClick = (rec: ProductRecommendation) => {
    const productsInRec = [...rec.highEnd, ...rec.commonlyAvailable, ...rec.drugstore, ...(rec.dupesAffordable || [])];
    const ratingsToSave: { [key: string]: number } = {};
    productsInRec.forEach(p => {
        const key = getProductKey(p);
        if (ratings[key] > 0) { // Only save if rated
            ratingsToSave[key] = ratings[key];
        }
    });
    onSaveProduct(rec, ratingsToSave);
  };

  const handleExportPdf = async () => {
    if (!recommendationRef.current || isExporting) return;
    
    setIsExporting(true);
    
    const elementToExport = recommendationRef.current;
    const elementsToHide = elementToExport.querySelectorAll('.export-hide');
    const originalInlineStyle = elementToExport.getAttribute('style');
    const interactiveImageContainer = elementToExport.querySelector('#interactive-image-container');
    const onScreenAnalysisSection = elementToExport.querySelector('#on-screen-analysis-section');
    const pdfImagesContainer = document.createElement('div');
    const pdfAnalysisContainer = document.createElement('div');
    pdfImagesContainer.id = 'pdf-temp-images';
    pdfAnalysisContainer.id = 'pdf-temp-analysis';

    elementToExport.style.position = 'absolute';
    elementToExport.style.left = '-9999px';
    elementToExport.style.top = '0px';
    elementToExport.style.width = '800px';
  
    elementsToHide.forEach(el => ((el as HTMLElement).style.display = 'none'));
    if (interactiveImageContainer) (interactiveImageContainer as HTMLElement).style.display = 'none';
    if (onScreenAnalysisSection) (onScreenAnalysisSection as HTMLElement).style.display = 'none';
  
    try {
      const isDark = document.documentElement.classList.contains('dark');
      const textColor = isDark ? '#f3f4f6' : '#1f2937';
      const secondaryTextColor = isDark ? '#d1d5db' : '#4b5563';
      const borderColor = isDark ? '#374151' : '#e5e7eb';
      const bgColor = isDark ? '#374151' : '#f9fafb';
      const titleColor = isDark ? '#f9fafb' : '#3a3a3a';

      // 1. Prepare Image Comparison Section
      if (beforeImageUrl && afterImageUrl) {
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
                  <h2 style="font-size: 1.5rem; font-weight: bold; color: ${titleColor}; margin-bottom: 16px;">Visual Comparison</h2>
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
      }
      
      // 2. Prepare Skin Analysis Section
       pdfAnalysisContainer.innerHTML = `
          <div style="padding-bottom: 24px; margin-bottom: 24px; border-bottom: 1px solid ${borderColor};">
            <h2 style="font-size: 1.5rem; font-weight: bold; color: ${titleColor}; margin-bottom: 16px;">Skin Analysis</h2>
            <div style="display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 1rem; text-align: center;">
              <div style="background-color: ${bgColor}; padding: 1rem; border-radius: 0.5rem;">
                <p style="font-size: 0.875rem; font-weight: 600; color: ${secondaryTextColor};">Skin Tone</p>
                <p style="font-size: 1.125rem; font-weight: bold; color: ${textColor};">${skinAnalysis.tone}</p>
              </div>
              <div style="background-color: ${bgColor}; padding: 1rem; border-radius: 0.5rem;">
                <p style="font-size: 0.875rem; font-weight: 600; color: ${secondaryTextColor};">Undertone</p>
                <p style="font-size: 1.125rem; font-weight: bold; color: ${textColor};">${skinAnalysis.undertone}</p>
              </div>
              <div style="background-color: ${bgColor}; padding: 1rem; border-radius: 0.5rem;">
                <p style="font-size: 0.875rem; font-weight: 600; color: ${secondaryTextColor};">Skin Type</p>
                <p style="font-size: 1.125rem; font-weight: bold; color: ${textColor};">${skinAnalysis.type}</p>
              </div>
            </div>
            ${skinAnalysis.observations ? `
              <div style="margin-top: 1rem;">
                <h3 style="font-weight: 600; color: ${textColor}; margin-bottom: 0.5rem;">Observations:</h3>
                <p style="color: ${secondaryTextColor}; background-color: ${bgColor}; padding: 0.75rem; border-radius: 0.5rem; white-space: pre-wrap; word-break: break-word;">${skinAnalysis.observations}</p>
              </div>
            ` : ''}
          </div>
      `;

      // Prepend sections to the element to be exported
      elementToExport.prepend(pdfAnalysisContainer);
      elementToExport.prepend(pdfImagesContainer);
      
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
      // Cleanup DOM
      elementsToHide.forEach(el => ((el as HTMLElement).style.display = ''));
      if (interactiveImageContainer) (interactiveImageContainer as HTMLElement).style.display = '';
      if (onScreenAnalysisSection) (onScreenAnalysisSection as HTMLElement).style.display = '';

      elementToExport.querySelector('#pdf-temp-images')?.remove();
      elementToExport.querySelector('#pdf-temp-analysis')?.remove();
      
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
        <div id="on-screen-analysis-section" className="md:w-2/3">
            <div className="flex justify-between items-start mb-4 gap-2">
                <h2 className="text-2xl font-bold text-[#3a3a3a] dark:text-gray-100">Your Skin Analysis</h2>
                <div className="flex items-center gap-2 flex-shrink-0 export-hide">
                    <button
                        onClick={onSaveAnalysis}
                        className="text-sm font-semibold py-2 px-4 rounded-lg transition-colors bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 flex items-center gap-2"
                        title="Save this analysis"
                    >
                       <BookmarkIcon className="w-4 h-4" />
                       <span className="hidden sm:inline">Save Analysis</span>
                    </button>
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
                  <button onClick={() => setShowUndertoneInfo(!showUndertoneInfo)} className="text-gray-400 hover:text-[#c5a78f] export-hide" aria-label="Learn more about undertones">
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
              <div className="mt-6 bg-stone-100 dark:bg-gray-900 p-4 rounded-lg border border-stone-200 dark:border-gray-700 animate-fade-in export-hide">
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
                  <button
                    onClick={() => handleSaveProductClick(rec)}
                    className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 hover:text-[#c5a78f] transition-colors export-hide"
                    title={`Save ${rec.category} recommendations`}
                  >
                    <BookmarkIcon className="w-5 h-5" />
                  </button>
                </div>
                {rec.notes && (
                  <div className="flex items-start gap-2 bg-blue-50 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 p-3 rounded-md mb-4 text-sm border border-blue-200 dark:border-blue-800">
                    <InfoIcon className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <p>{rec.notes}</p>
                  </div>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  <ProductCard title="High-End" products={rec.highEnd} ratings={ratings} onRateProduct={onRateProduct} />
                  <ProductCard title="Commonly Available" products={rec.commonlyAvailable} ratings={ratings} onRateProduct={onRateProduct} />
                  <ProductCard title="Drugstore" products={rec.drugstore} ratings={ratings} onRateProduct={onRateProduct} />
                  <ProductCard title="Dupes/Affordable" products={rec.dupesAffordable || []} ratings={ratings} onRateProduct={onRateProduct} />
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  );
};
