import React from 'react';
import { Diagnosis, AnalyzedImageInfo } from '../types';
import Disclaimer from './Disclaimer';

interface DiagnosisResultProps {
  diagnosis: Diagnosis;
  analyzedImageInfo: AnalyzedImageInfo | null;
}

const FileIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 mr-3 text-gray-400 dark:text-gray-500 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
    </svg>
);

const DimensionsIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 mr-3 text-gray-400 dark:text-gray-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5" />
    </svg>
);

const QualityExcellentIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);
const QualityGoodIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
    <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a2 2 0 00-.8 1.4z" />
  </svg>
);
const QualityFairIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
  </svg>
);
const QualityPoorIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);


const DiagnosisResult: React.FC<DiagnosisResultProps> = ({ diagnosis, analyzedImageInfo }) => {
  const getUrgencyColor = (urgency: string) => {
    switch (urgency.toLowerCase()) {
      case 'urgent':
        return 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300';
      case 'requires prompt attention':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300';
      default:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300';
    }
  };
  
  const getQualityPresentation = (score: string) => {
    switch (score.toLowerCase()) {
        case 'excellent':
            return {
                icon: <QualityExcellentIcon />,
                color: 'text-green-500 dark:text-green-400',
                bgColor: 'bg-green-50 dark:bg-green-900/30',
                borderColor: 'border-green-400 dark:border-green-600'
            };
        case 'good':
            return {
                icon: <QualityGoodIcon />,
                color: 'text-blue-500 dark:text-blue-400',
                bgColor: 'bg-blue-50 dark:bg-blue-900/30',
                borderColor: 'border-blue-400 dark:border-blue-600'
            };
        case 'fair':
            return {
                icon: <QualityFairIcon />,
                color: 'text-yellow-500 dark:text-yellow-400',
                bgColor: 'bg-yellow-50 dark:bg-yellow-900/30',
                borderColor: 'border-yellow-400 dark:border-yellow-600'
            };
        default: // Poor
            return {
                icon: <QualityPoorIcon />,
                color: 'text-red-500 dark:text-red-400',
                bgColor: 'bg-red-50 dark:bg-red-900/30',
                borderColor: 'border-red-400 dark:border-red-600'
            };
    }
  };
  
  const quality = getQualityPresentation(diagnosis.imageQuality.score);

  return (
    <div className="space-y-8 my-6" id="diagnosis-content">
      <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Analysis Result</h2>
      
      {/* Analyzed Image Details */}
      {analyzedImageInfo && (
        <section>
          <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4">Analyzed Image Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 flex items-center">
                  <FileIcon />
                  <div className="overflow-hidden">
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Filename</p>
                      <p className="text-sm text-gray-800 dark:text-gray-200 font-mono truncate" title={analyzedImageInfo.name}>
                          {analyzedImageInfo.name}
                      </p>
                  </div>
              </div>
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 flex items-center">
                  <DimensionsIcon />
                  <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Resolution</p>
                      <p className="text-sm text-gray-800 dark:text-gray-200 font-mono">
                          {analyzedImageInfo.resolution}
                      </p>
                  </div>
              </div>
          </div>
        </section>
      )}

      {/* Image Quality Assessment */}
      <section>
          <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4">Image Quality Assessment</h3>
          <div className={`p-4 rounded-lg shadow-md border-l-4 flex items-start gap-4 ${quality.bgColor} ${quality.borderColor}`}>
              <div className={`${quality.color} flex-shrink-0 mt-1`}>
                  {quality.icon}
              </div>
              <div>
                  <p className={`text-lg font-bold ${quality.color}`}>{diagnosis.imageQuality.score}</p>
                  <p className="text-gray-700 dark:text-gray-300">{diagnosis.imageQuality.feedback}</p>
              </div>
          </div>
      </section>

      {/* Most Likely Diagnosis */}
      <section className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden border border-blue-500 dark:border-blue-400">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Most Likely Diagnosis</h2>
          <p className="text-xl font-semibold text-blue-600 dark:text-blue-400">{diagnosis.mostLikelyDiagnosis.conditionName}</p>
          <div className="mt-4 space-y-4">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Confidence</p>
              <p className="text-lg text-gray-800 dark:text-gray-200">{diagnosis.mostLikelyDiagnosis.confidence}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Description</p>
              <p className="text-gray-700 dark:text-gray-300">{diagnosis.mostLikelyDiagnosis.description}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Urgency</p>
              <div className={`inline-block px-3 py-1 text-sm font-semibold rounded-full ${getUrgencyColor(diagnosis.mostLikelyDiagnosis.urgency)}`}>
                {diagnosis.mostLikelyDiagnosis.urgency}
              </div>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{diagnosis.mostLikelyDiagnosis.urgencyReason}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Differential Diagnoses */}
      {diagnosis.differentialDiagnoses && diagnosis.differentialDiagnoses.length > 0 && (
        <section>
          <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4">Other Possibilities (Differential Diagnoses)</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {diagnosis.differentialDiagnoses.map((item, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
                <p className="font-semibold text-gray-900 dark:text-gray-100">{item.conditionName}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Confidence: {item.confidence}</p>
                <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">{item.description}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Next Steps */}
      <section>
        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4">Recommended Next Steps</h3>
        <ul className="list-disc list-inside space-y-2 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300">
          {diagnosis.nextSteps.map((step, index) => (
            <li key={index}>{step}</li>
          ))}
        </ul>
      </section>

      {/* Disclaimer */}
      <Disclaimer message={diagnosis.disclaimer} />
    </div>
  );
};

export default DiagnosisResult;