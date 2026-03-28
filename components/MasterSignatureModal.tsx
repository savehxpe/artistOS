"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';

interface MasterSignatureModalProps {
  documentName: string;
  onSign: () => void;
  onCancel: () => void;
}

export const MasterSignatureModal = ({ documentName, onSign, onCancel }: MasterSignatureModalProps) => {
  const [hasGesture, setHasGesture] = useState(false);
  const [isSigning, setIsSigning] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawing = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    const handleStart = (e: MouseEvent | TouchEvent) => {
      isDrawing.current = true;
      const pos = getPos(e);
      ctx.beginPath();
      ctx.moveTo(pos.x, pos.y);
      setHasGesture(true);
    };

    const handleMove = (e: MouseEvent | TouchEvent) => {
      if (!isDrawing.current) return;
      const pos = getPos(e);
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
    };

    const handleEnd = () => {
      isDrawing.current = false;
    };

    const getPos = (e: MouseEvent | TouchEvent) => {
      const rect = canvas.getBoundingClientRect();
      const clientX = 'touches' in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : (e as MouseEvent).clientY;
      return {
        x: clientX - rect.left,
        y: clientY - rect.top
      };
    };

    canvas.addEventListener('mousedown', handleStart);
    canvas.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleEnd);
    canvas.addEventListener('touchstart', handleStart);
    canvas.addEventListener('touchmove', handleMove);
    window.addEventListener('touchend', handleEnd);

    return () => {
      canvas.removeEventListener('mousedown', handleStart);
      canvas.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleEnd);
      canvas.removeEventListener('touchstart', handleStart);
      canvas.removeEventListener('touchmove', handleMove);
      window.removeEventListener('touchend', handleEnd);
    };
  }, []);

  const handleSign = () => {
    setIsSigning(true);
    setTimeout(() => {
        onSign(); 
    }, 1500); // Animation allowance
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasGesture(false);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 flex items-center justify-center bg-black/95 backdrop-blur-2xl z-50 p-6"
    >
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="w-full max-w-lg bg-black border border-white/10 rounded-[12px] p-8 md:p-10 flex flex-col items-center relative shadow-[0_0_100px_rgba(255,255,255,0.05)]"
      >
        
        {/* Document Metadata */}
        <div className="text-center mb-10 w-full">
          <span className="text-[10px] text-[#FFFF00] uppercase tracking-[0.4em] font-bold mb-4 block animate-pulse">
            Master Approval Required
          </span>
          <h2 className="text-2xl md:text-3xl font-manrope font-bold text-white mb-2 uppercase tracking-tighter">
            Legal Sign-Off
          </h2>
          <div className="h-[1px] w-12 bg-white/20 mx-auto my-4" />
          <p className="text-zinc-500 font-inter text-[11px] uppercase tracking-widest font-bold">
            Ingesting: <span className="text-white">{documentName}</span>
          </p>
        </div>

        {/* The Signature Area */}
        <div className="w-full space-y-3 mb-10">
            <div className={`w-full h-48 bg-[#050505] border rounded-[12px] relative flex flex-col items-center justify-center overflow-hidden transition-all duration-300 ${hasGesture ? 'border-white bg-white/[0.02]' : 'border-white/10'}`}>
                <canvas 
                    ref={canvasRef}
                    width={500}
                    height={200}
                    className="absolute inset-0 w-full h-full cursor-crosshair touch-none"
                />
                
                {!hasGesture && (
                    <div className="flex flex-col items-center gap-4 pointer-events-none">
                        <div className="w-10 h-10 border border-white/5 rounded-full flex items-center justify-center">
                            <span className="material-symbols-outlined text-white/10 text-xl">gesture</span>
                        </div>
                        <span className="text-zinc-700 font-inter text-[10px] uppercase tracking-[0.3em] font-bold">
                            Draw Mark to Authenticate
                        </span>
                    </div>
                )}

                <div className="absolute inset-x-8 h-[0.5px] bg-white/10 bottom-12 pointer-events-none" />
                <span className="absolute left-8 bottom-14 text-[10px] text-white/10 font-manrope italic pointer-events-none">X</span>
            </div>
            
            <div className="flex justify-between items-center px-1">
                <p className="text-[9px] text-zinc-700 font-inter uppercase tracking-widest">Digital Audit Log: Active</p>
                {hasGesture && (
                    <button 
                        onClick={clearCanvas}
                        className="text-[9px] text-[#FFFF00] font-inter uppercase tracking-widest hover:text-white transition-colors font-bold"
                    >
                        Clear Mark
                    </button>
                )}
            </div>
        </div>

        {/* The Action Pill */}
        <div className="w-full space-y-4">
            <button 
              disabled={!hasGesture || isSigning}
              onClick={handleSign}
              className={`w-full py-6 rounded-full font-manrope font-bold text-[11px] uppercase tracking-[0.4em] transition-all relative overflow-hidden group
                ${hasGesture && !isSigning 
                    ? 'bg-white text-black shadow-[0_0_40px_rgba(255,255,255,0.1)] hover:bg-neutral-200' 
                    : 'bg-zinc-900 text-zinc-700 cursor-not-allowed border border-white/5'}
              `}
            >
              {isSigning ? "Securing Seal..." : "Authorize Ingestion"}
              
              <AnimatePresence>
                {isSigning && (
                    <motion.div 
                        initial={{ scale: 3, opacity: 0, rotate: -20 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="absolute inset-0 bg-[#FFFF00] text-black flex items-center justify-center font-manrope font-black text-2xl uppercase italic tracking-tighter"
                    >
                        SEALED
                    </motion.div>
                )}
              </AnimatePresence>
            </button>

            <button 
                onClick={onCancel}
                className="w-full py-4 text-zinc-700 text-[10px] uppercase tracking-[0.4em] font-black hover:text-white/40 transition-colors"
            >
                Cancel Protocol
            </button>
        </div>

        <p className="mt-12 text-[8px] text-zinc-800 font-inter text-center uppercase tracking-[0.3em] font-medium">
            System Origin: Outworld Matrix • {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
        </p>

        {/* Close trigger for developer convenience */}
        <div 
          onClick={onCancel}
          className="absolute -top-12 right-0 material-symbols-outlined text-white/10 hover:text-white cursor-pointer transition-colors"
        >
          close
        </div>
      </motion.div>
    </motion.div>
  );
};

