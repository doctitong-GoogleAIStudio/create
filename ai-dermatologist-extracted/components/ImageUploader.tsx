import React, { useRef } from 'react';

interface ImageUploaderProps {
  onFileSelected: (file: File) => void;
  imagePreviews: string[];
  onRemoveImage: (index: number) => void;
}

const CameraIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
        <path d="M2 6a2 2 0 012-2h1.172a2 2 0 011.414.586l.828.828A2 2 0 008.828 6H12a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
        <path d="M15 8a1 1 0 10-2 0v2a1 1 0 102 0V8z" />
        <path fillRule="evenodd" d="M12 10a3 3 0 11-6 0 3 3 0 016 0zm-3-2a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd" />
    </svg>
)

const LightbulbIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
      <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.657a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 14.95a1 1 0 00-1.414 1.414l.707.707a1 1 0 001.414-1.414l-.707-.707zM4 10a1 1 0 01-1-1h-1a1 1 0 110-2h1a1 1 0 011 1zM10 18a1 1 0 011-1v1a1 1 0 11-2 0v-1a1 1 0 011 1zM3.636 3.636a1 1 0 001.414 1.414l.707-.707a1 1 0 00-1.414-1.414l-.707.707zM10 5a1 1 0 011 1v3h-2V6a1 1 0 011-1z" />
      <path d="M10 15a4 4 0 100-8 4 4 0 000 8z" />
    </svg>
);

const FocusIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 10h.01" />
    </svg>
);

const FrameIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5" />
    </svg>
);


const ImageUploader: React.FC<ImageUploaderProps> = ({ onFileSelected, imagePreviews, onRemoveImage }) => {
  const cameraInputRef = useRef<HTMLInputElement>(null);
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      onFileSelected(event.target.files[0]);
      // Reset input value to allow selecting the same file again
      event.target.value = '';
    }
  };

  return (
    <div className="w-full">
        <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" className="sr-only" onChange={handleFileChange} aria-hidden="true" />
        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <h3 className="text-md font-semibold text-blue-800 dark:text-blue-200 mb-3 flex items-center">
                <LightbulbIcon />
                Tips for a Good Photo
            </h3>
            <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                <li className="flex items-start">
                    <LightbulbIcon />
                     <div><span className="font-semibold">Lighting:</span> Use bright, even light (like daylight) and avoid shadows.</div>
                </li>
                <li className="flex items-start">
                    <FocusIcon />
                    <div><span className="font-semibold">Focus:</span> Ensure the lesion is sharp and not blurry.</div>
                </li>
                <li className="flex items-start">
                    <FrameIcon />
                    <div><span className="font-semibold">Framing:</span> Get a close-up shot, filling the frame with the lesion.</div>
                </li>
            </ul>
        </div>
      <div
        className="bg-white dark:bg-gray-700/50 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-blue-500 transition-colors duration-200 flex flex-col justify-center items-center p-8 text-center"
      >
        <label
          htmlFor="file-upload"
          className="relative cursor-pointer flex flex-col justify-center items-center w-full"
        >
          <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
            <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="mt-2 block text-sm font-medium text-gray-900 dark:text-gray-200">
            Upload a photo
          </span>
          <span className="block text-xs text-gray-500 dark:text-gray-400">or drag and drop</span>
          <input id="file-upload" name="file-upload" type="file" accept="image/*" className="sr-only" onChange={handleFileChange} />
        </label>
        
        <div className="my-4 flex items-center w-full max-w-xs">
            <div className="flex-grow border-t border-gray-300 dark:border-gray-600"></div>
            <span className="flex-shrink mx-4 text-gray-500 dark:text-gray-400 text-sm">OR</span>
            <div className="flex-grow border-t border-gray-300 dark:border-gray-600"></div>
        </div>

        <button
          type="button"
          onClick={() => cameraInputRef.current?.click()}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-800 focus:ring-blue-500"
        >
          <CameraIcon />
          Use Camera
        </button>

      </div>

      {imagePreviews.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-medium text-gray-800 dark:text-gray-100 mb-2">Image Preview:</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {imagePreviews.map((preview, index) => (
              <div key={index} className="relative group">
                <img src={preview} alt={`preview ${index}`} className="w-full h-32 object-cover rounded-lg shadow-md" />
                <button
                  onClick={() => onRemoveImage(index)}
                  className="absolute top-1 right-1 bg-red-500/80 backdrop-blur-sm text-white rounded-full h-6 w-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label="Remove image"
                >
                  &times;
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUploader;