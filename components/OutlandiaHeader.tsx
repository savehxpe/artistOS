'use client';

import React from 'react';
import { OutlandiaLogo } from './OutlandiaLogo';

/**
 * @component OutlandiaHeader
 * @description The standardized brand header module for Outlandia.
 * Enforces strict visual hierarchy, zero-underscore policy, and authoritative spacing.
 */
export const OutlandiaHeader = ({ 
  step = "INITIALIZATION // STEP 01", 
  className = "" 
}: { 
  step?: string; 
  className?: string;
}) => {
  return (
    <div className={`flex flex-col items-center justify-center py-24 ${className}`}>
      {/* 1. Visual Geometry: The Brand Mark (Icon Only) */}
      <div className="mb-32">
        <OutlandiaLogo size="md" showWordmark={false} />
      </div>
      
      {/* 2. Typography & Hierarchy: Primary Header & Metadata */}
      <div className="flex flex-col items-center text-center space-y-6">
        <h1 className="text-5xl md:text-6xl font-manrope font-black tracking-[0.5em] text-white uppercase antialiased">
          OUTLANDIA
        </h1>
        
        <div className="flex flex-col items-center gap-6">
          <span className="text-[11px] font-black uppercase tracking-[0.6em] text-[#666666] antialiased">
            {step.replace(/_/g, ' ')}
          </span>
          
          {/* Decorative Divider */}
          <div className="w-16 h-[1px] bg-[#666666]/30" />
        </div>
      </div>
    </div>
  );
};
