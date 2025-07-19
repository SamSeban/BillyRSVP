import React, { useMemo } from 'react';
import './Bubbles.css';

interface BubblesProps {
  count?: number;
  className?: string;
}

const Bubbles: React.FC<BubblesProps> = ({ count = 25, className = '' }) => {
  const bubbles = useMemo(() => {
    return Array.from({ length: count }, (_, index) => (
      <div
        key={index}
        className={`bubble bubble-${index + 1}`}
        style={{
          '--random-x': `${Math.random() * 100}%`,
          '--random-delay': `${Math.random() * 10}s`,
          '--random-duration': `${8 + Math.random() * 8}s`,
          '--random-size': `${0.5 + Math.random() * 1}`,
        } as React.CSSProperties}
      />
    ));
  }, [count]);

  return (
    <div className={`bubbles-container ${className}`}>
      {bubbles}
    </div>
  );
};

export default Bubbles;
