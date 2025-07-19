import { useState, useEffect, useRef } from 'react';

export default function BillyBackground() {
  const [elementsPerRow, setElementsPerRow] = useState(12); // Default fallback
  const containerRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const calculateElementsPerRow = () => {
      if (containerRef.current && measureRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        const elementWidth = measureRef.current.offsetWidth;
        const gap = 8; // 2 * 0.5rem gap from Tailwind gap-2
        
        if (elementWidth > 0) {
          const elementsCount = Math.floor(containerWidth / (elementWidth + gap));
          setElementsPerRow(Math.max(1, elementsCount)); // Ensure at least 1
        }
      }
    };

    // Calculate on mount
    calculateElementsPerRow();

    // Recalculate on window resize
    window.addEventListener('resize', calculateElementsPerRow);
    
    return () => {
      window.removeEventListener('resize', calculateElementsPerRow);
    };
  }, []);
  
  // Create an array of "Billy" text elements to fill the background
  const billyElements = Array.from({ length: 700 }, (_, index) => {
    // Calculate which row this element is approximately in
    const rowNumber = Math.floor(index / elementsPerRow);
    // Offset every other row to create brick pattern
    const isOffsetRow = rowNumber % 2 === 1;
    
    return (
      <span
        key={index}
        className="text-red-100 select-none pointer-events-none opacity-10 text-5xl leading-[0.8]"
        style={{ 
          fontFamily: "'Coca Cola ii', sans-serif",
          marginLeft: isOffsetRow ? '3rem' : '0',
        }}
      >
        Billy
      </span>
    )
  })

  return (
    <div className="fixed inset-0 overflow-hidden -z-10" ref={containerRef}>
      {/* Hidden measurement element */}
      <span
        ref={measureRef}
        className="text-red-100 opacity-0 absolute text-5xl leading-[0.8] pointer-events-none"
        style={{ 
          fontFamily: "'Coca Cola ii', sans-serif",
          visibility: 'hidden'
        }}
      >
        Billy
      </span>
      <div className="absolute inset-0 flex flex-wrap gap-2 p-4">
        {billyElements}
      </div>
    </div>
  )
} 