import React, { useState, useRef } from 'react';

interface ImageComparatorProps {
    beforeSrc: string;
    afterSrc: string;
}

export const ImageComparator: React.FC<ImageComparatorProps> = ({ beforeSrc, afterSrc }) => {
    const [sliderPosition, setSliderPosition] = useState(50);
    const containerRef = useRef<HTMLDivElement>(null);

    const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSliderPosition(Number(e.target.value));
    };

    const clipPercent = `${sliderPosition}%`;
    
    // Style for the container and images
    const containerStyle: React.CSSProperties = {
        position: 'relative',
        width: '100%',
        overflow: 'hidden',
        borderRadius: '0.75rem', // rounded-xl
        boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)', // shadow-lg
    };

    const imageStyle: React.CSSProperties = {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        pointerEvents: 'none',
    };
    
    // Style for the clipped "after" image
    const afterImageStyle: React.CSSProperties = {
        ...imageStyle,
        clipPath: `inset(0 calc(100% - ${clipPercent}) 0 0)`,
    };
    
    // Style for the slider handle
    const handleStyle: React.CSSProperties = {
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: clipPercent,
        transform: 'translateX(-50%)',
        width: '4px',
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        cursor: 'ew-resize',
        pointerEvents: 'none',
        boxShadow: '0 0 5px rgba(0,0,0,0.5)',
    };
    
    // Style for the slider input
    const sliderInputStyle: React.CSSProperties = {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        margin: 0,
        cursor: 'ew-resize',
        opacity: 0, // hide the default slider track and thumb
        appearance: 'none',
        WebkitAppearance: 'none',
    };


    return (
        <div ref={containerRef} style={containerStyle} className="aspect-[3/4]">
            {/* Before Image (bottom layer) */}
            <img src={beforeSrc} alt="Before makeup" style={{...imageStyle, position: 'relative'}} />

            {/* After Image (top layer, clipped) */}
            <img src={afterSrc} alt="After makeup" style={afterImageStyle} />

            {/* Slider Handle Visual */}
            <div style={handleStyle}>
                 <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 bg-white rounded-full p-1 shadow-lg w-8 h-8 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-gray-600"><path d="M8 3v18"/><path d="M16 3v18"/><path d="M3 8h2"/><path d="M5 8h2"/><path d="M19 8h-2"/><path d="M17 8h-2"/><path d="M3 16h2"/><path d="M5 16h2"/><path d="M19 16h-2"/><path d="M17 16h-2"/></svg>
                </div>
            </div>

            {/* Slider Input (invisible) */}
            <input
                type="range"
                min="0"
                max="100"
                value={sliderPosition}
                onChange={handleSliderChange}
                aria-label="Before and after slider"
                style={sliderInputStyle}
            />
             <div className="absolute top-2 left-2 bg-black bg-opacity-50 text-white text-xs font-bold px-2 py-1 rounded">BEFORE</div>
            <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white text-xs font-bold px-2 py-1 rounded" style={{ opacity: sliderPosition > 60 ? 1 : 0, transition: 'opacity 0.2s' }}>AFTER</div>
        </div>
    );
};
