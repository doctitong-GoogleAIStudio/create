import React, { useState, useRef } from 'react';
import ReactCrop, { type Crop, centerCrop, makeAspectCrop } from 'react-image-crop';
import { SparklesIcon } from './icons/SparklesIcon';
import { Loader } from './Loader';

// Utility to create a default crop area
function centerAspectCrop(mediaWidth: number, mediaHeight: number, aspect: number): Crop {
    return centerCrop(
        makeAspectCrop(
            {
                unit: '%',
                width: 90,
            },
            aspect,
            mediaWidth,
            mediaHeight
        ),
        mediaWidth,
        mediaHeight
    );
}

// Utility to crop image using canvas
async function getCroppedImg(
    image: HTMLImageElement,
    file: File,
    crop: Crop
): Promise<{ base64: string, mimeType: string }> {
    const canvas = document.createElement('canvas');
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    
    const cropX = crop.x * scaleX;
    const cropY = crop.y * scaleY;
    const cropWidth = crop.width * scaleX;
    const cropHeight = crop.height * scaleY;

    canvas.width = cropWidth;
    canvas.height = cropHeight;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
        throw new Error('No 2d context');
    }

    ctx.drawImage(
        image,
        cropX,
        cropY,
        cropWidth,
        cropHeight,
        0,
        0,
        cropWidth,
        cropHeight
    );
    
    return new Promise((resolve) => {
        const dataUrl = canvas.toDataURL(file.type);
        const base64 = dataUrl.split(',')[1];
        resolve({ base64, mimeType: file.type });
    });
}


interface ImageCropperProps {
    imageUrl: string;
    imageFile: File;
    onAnalyze: (croppedImageBase64: string, mimeType: string) => void;
    onCancel: () => void;
}

export const ImageCropper: React.FC<ImageCropperProps> = ({ imageUrl, imageFile, onAnalyze, onCancel }) => {
    const [crop, setCrop] = useState<Crop>();
    const [completedCrop, setCompletedCrop] = useState<Crop>();
    const [isProcessing, setIsProcessing] = useState(false);
    const imgRef = useRef<HTMLImageElement>(null);
    const aspect = 3 / 4;

    function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
        const { width, height } = e.currentTarget;
        setCrop(centerAspectCrop(width, height, aspect));
    }
    
    const handleAnalyzeClick = async () => {
        if (!completedCrop || !imgRef.current) {
            console.error("Crop or image ref is not available.");
            return;
        }
        setIsProcessing(true);
        try {
            const { base64, mimeType } = await getCroppedImg(imgRef.current, imageFile, completedCrop);
            onAnalyze(base64, mimeType);
        } catch (e) {
            console.error(e);
            setIsProcessing(false);
        }
    };
    
    return (
        <div className="max-w-2xl mx-auto text-center animate-fade-in">
            <h2 className="text-3xl font-bold text-gray-800 sm:text-4xl dark:text-gray-100">Crop Your Photo</h2>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
                Adjust the selection to focus on your face for the most accurate analysis.
            </p>
            <div className="mt-8 flex justify-center bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
                <ReactCrop
                    crop={crop}
                    onChange={(_, percentCrop) => setCrop(percentCrop)}
                    onComplete={(c) => setCompletedCrop(c)}
                    aspect={aspect}
                    minWidth={100}
                >
                    <img
                        ref={imgRef}
                        alt="Crop me"
                        src={imageUrl}
                        onLoad={onImageLoad}
                        style={{ maxHeight: '70vh' }}
                    />
                </ReactCrop>
            </div>
            <div className="mt-6 flex flex-col sm:flex-row gap-4">
                <button
                    onClick={onCancel}
                    disabled={isProcessing}
                    className="w-full sm:w-1/2 bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-gray-200 font-bold py-3 px-4 rounded-xl hover:bg-gray-400 dark:hover:bg-gray-500 transition-all duration-300 shadow-md disabled:opacity-50"
                >
                    Choose Different Photo
                </button>
                <button
                    onClick={handleAnalyzeClick}
                    disabled={isProcessing || !completedCrop}
                    className="w-full sm:w-1/2 bg-[#c5a78f] text-white font-bold py-3 px-4 rounded-xl hover:bg-[#b9987e] transition-all duration-300 text-lg shadow-md hover:shadow-lg disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                >
                    {isProcessing ? (
                        <>
                            <Loader size="sm" />
                            <span>Processing...</span>
                        </>
                    ) : (
                        <>
                            <SparklesIcon />
                            <span>Analyze Cropped Area</span>
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};