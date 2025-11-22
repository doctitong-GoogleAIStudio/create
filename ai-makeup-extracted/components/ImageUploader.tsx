
import React, { useRef } from 'react';
import { UploadIcon } from './icons/UploadIcon';

interface ImageUploaderProps {
  onImageChange: (file: File) => void;
  imageUrl: string | null;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageChange, imageUrl }) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onImageChange(file);
    }
  };

  const handleClick = () => {
    inputRef.current?.click();
  };

  return (
    <div>
      <input
        type="file"
        ref={inputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/png, image/jpeg"
      />
      <div
        onClick={handleClick}
        className="w-full h-64 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex flex-col justify-center items-center cursor-pointer hover:border-[#c5a78f] hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
      >
        {imageUrl ? (
          <img src={imageUrl} alt="User upload preview" className="w-full h-full object-cover rounded-lg" />
        ) : (
          <div className="text-center text-gray-500 dark:text-gray-400">
            <UploadIcon />
            <p className="mt-2 font-semibold">Click to upload a photo</p>
            <p className="text-sm">PNG or JPG</p>
          </div>
        )}
      </div>
    </div>
  );
};