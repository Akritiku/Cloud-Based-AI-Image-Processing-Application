import React, { useState, useRef, useEffect } from 'react';

interface ComparisonSliderProps {
  beforeImage: string;
  afterImage: string;
}

export default function ComparisonSlider({ beforeImage, afterImage }: ComparisonSliderProps) {
  const [sliderPosition, setSliderPosition] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = (event: React.MouseEvent | React.TouchEvent) => {
    if (!containerRef.current) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    const x = 'touches' in event 
      ? event.touches[0].clientX - containerRect.left 
      : (event as React.MouseEvent).clientX - containerRect.left;

    const position = Math.max(0, Math.min(100, (x / containerRect.width) * 100));
    setSliderPosition(position);
  };

  return (
    <div 
      ref={containerRef}
      className="slider-container rounded-2xl shadow-2xl aspect-video bg-slate-200"
      onMouseMove={handleMove}
      onTouchMove={handleMove}
    >
      {/* After Image (Background) */}
      <img 
        src={afterImage} 
        alt="After" 
        className="slider-image"
        referrerPolicy="no-referrer"
      />

      {/* Before Image (Clipped) */}
      <div 
        className="absolute top-0 left-0 h-full overflow-hidden z-0"
        style={{ width: `${sliderPosition}%` }}
      >
        <img 
          src={beforeImage} 
          alt="Before" 
          className="slider-image"
          style={{ width: `${100 / (sliderPosition / 100)}%` }}
          referrerPolicy="no-referrer"
        />
      </div>

      {/* Slider Handle */}
      <div 
        className="slider-handle"
        style={{ left: `${sliderPosition}%` }}
      >
        <div className="slider-circle">
          <div className="flex gap-1">
            <div className="w-1 h-4 bg-indigo-600 rounded-full"></div>
            <div className="w-1 h-4 bg-indigo-600 rounded-full"></div>
          </div>
        </div>
      </div>

      {/* Labels */}
      <div className="absolute top-4 left-4 z-20 bg-black/40 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
        Original
      </div>
      <div className="absolute top-4 right-4 z-20 bg-indigo-600/80 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
        AI Redesign
      </div>
    </div>
  );
}
