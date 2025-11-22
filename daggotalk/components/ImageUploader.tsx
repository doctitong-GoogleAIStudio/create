
import React, { useRef } from 'react';
import { UploadIcon } from './icons/UploadIcon';
import { CameraIcon } from './icons/CameraIcon';

interface ImageUploaderProps {
  onImageChange: (file: File) => void;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageChange }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onImageChange(file);
    }
    // Reset the input value to allow selecting the same file again
    event.target.value = '';
  };

  const handleFileUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleCameraClick = () => {
    cameraInputRef.current?.click();
  };

  return (
    <div>
      {/* Hidden input for file selection */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/png, image/jpeg"
      />
      {/* Hidden input for camera capture */}
      <input
        type="file"
        ref={cameraInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/*"
        capture="user" // 'user' for front-facing, 'environment' for back
      />
      
      <div className="w-full p-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex flex-col justify-center items-center">
        <div className="text-center text-gray-500 dark:text-gray-400 mb-6">
            <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-200">Choose a photo</h3>
            <p className="text-sm mt-1">Select a clear, well-lit photo of your face.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-sm">
            <button
              onClick={handleFileUploadClick}
              className="flex-1 flex items-center justify-center gap-3 py-3 px-4 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-bold rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-300 shadow-sm"
            >
              <UploadIcon className="w-6 h-6" />
              <span>Upload from Library</span>
            </button>
            <button
              onClick={handleCameraClick}
              className="flex-1 flex items-center justify-center gap-3 py-3 px-4 bg-[#c5a78f] text-white font-bold rounded-xl hover:bg-[#b9987e] transition-all duration-300 shadow-sm"
            >
                <CameraIcon className="w-6 h-6" />
                <span>Take a Photo</span>
            </button>
        </div>
      </div>
    </div>
  );
};