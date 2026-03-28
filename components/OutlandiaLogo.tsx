'use client';

import React from 'react';

/**
 * @component OutlandiaLogo
 * @description The core brand identity component for Outlandia.
 * Features a precisely engineered perfect circle with a crisp 4px white boundary
 * and the refined geometric 'linked people' rune at its core.
 */
export const OutlandiaLogo = ({ 
  className = "", 
  size = "md", 
  showWordmark = false 
}: { 
  className?: string; 
  size?: 'sm' | 'md' | 'lg'; 
  showWordmark?: boolean;
}) => {
  const sizes = {
    sm: { circle: 'w-16 h-16', svg: '32', circleBorder: 'border-[3px]' },
    md: { circle: 'w-24 h-24', svg: '48', circleBorder: 'border-[4px]' },
    lg: { circle: 'w-32 h-32', svg: '64', circleBorder: 'border-[6px]' }
  };
  
  const currentSize = sizes[size];

  return (
    <div className={`flex flex-col items-center justify-center space-y-8 tap-scale ${className}`}>
      {/* 1. Visual Geometry: Precisely engineered circle with crisp boundary */}
      <div 
        className={`${currentSize.circle} rounded-full ${currentSize.circleBorder} border-white flex items-center justify-center relative group overflow-hidden bg-black`}
        aria-label="Outlandia Brand Mark"
      >
        {/* 2. The Glyph: Refined Geometric 'Linked People' Rune */}
        <svg 
          width={currentSize.svg} 
          height={currentSize.svg} 
          viewBox="0 0 60 60" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          className="text-white relative z-10"
        >
          {/* Left Figure */}
          <path d="M18 18L24 12L30 18L24 24L18 18Z" fill="currentColor" /> {/* Head as rhombus */}
          <path d="M24 24V40L14 52M24 40L34 52" stroke="currentColor" strokeWidth="3" strokeLinecap="square" /> {/* Torso & Legs */}
          <path d="M24 30C24 30 28 30 30 30" stroke="currentColor" strokeWidth="3" strokeLinecap="square" /> {/* Reaching hand */}

          {/* Right Figure */}
          <path d="M42 18L36 12L30 18L36 24L42 18Z" fill="currentColor" /> {/* Head as rhombus */}
          <path d="M36 24V40L46 52M36 40L26 52" stroke="currentColor" strokeWidth="3" strokeLinecap="square" /> {/* Torso & Legs */}
          <path d="M36 30C36 30 32 30 30 30" stroke="currentColor" strokeWidth="3" strokeLinecap="square" /> {/* Reaching hand */}
        </svg>

        {/* Subtle Brand Aura */}
        <div className="absolute inset-0 rounded-full bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity blur-xl" />
      </div>
      
      {showWordmark && (
        <div className="text-center space-y-2">
          {/* 3. Typography: Clean, wide sans-serif caps */}
          <h1 className="text-4xl font-manrope font-black tracking-[0.4em] text-white uppercase antialiased">
            OUTLANDIA
          </h1>
        </div>
      )}
    </div>
  );
};

