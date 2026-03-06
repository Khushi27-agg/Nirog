import React from 'react';
import { motion } from 'motion/react';

interface MascotProps {
  expression?: 'happy' | 'thinking' | 'celebrating' | 'waving' | 'pointing' | 'holding';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  bubbleText?: string;
  className?: string;
}

export const ArogyaMascot: React.FC<MascotProps> = ({ 
  expression = 'happy', 
  size = 'md', 
  bubbleText,
  className = ''
}) => {
  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-32 h-32',
    lg: 'w-48 h-48',
    xl: 'w-64 h-64'
  };

  // Animation variants for different parts
  const earVariants = {
    animate: {
      rotate: [0, 5, 0, -5, 0],
      transition: { repeat: Infinity, duration: 3, ease: "easeInOut" as const }
    }
  };

  const trunkVariants: any = {
    happy: { rotate: [0, 5, 0], y: [0, -2, 0] },
    thinking: { rotate: [0, -10, 0], x: [0, -5, 0] },
    celebrating: { scale: [1, 1.1, 1], rotate: [0, 15, -15, 0] },
    waving: { rotate: [0, 10, 0] },
    pointing: { rotate: 20, x: 5 },
    holding: { rotate: 0 }
  };

  const eyeVariants = {
    animate: {
      scaleY: [1, 1, 0.1, 1, 1],
      transition: { repeat: Infinity, duration: 4, times: [0, 0.45, 0.5, 0.55, 1] }
    }
  };

  return (
    <div className={`relative flex flex-col items-center ${className}`}>
      {bubbleText && (
        <motion.div 
          initial={{ opacity: 0, y: 10, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          className="absolute -top-16 bg-white p-3 rounded-2xl shadow-lg border border-teal-100 max-w-[200px] z-10"
        >
          <p className="text-xs font-medium text-teal-800 leading-tight">{bubbleText}</p>
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-b border-r border-teal-100 rotate-45" />
        </motion.div>
      )}
      
      <motion.div 
        className={`${sizeClasses[size]} relative`}
        animate={expression === 'celebrating' ? { y: [0, -15, 0], scale: [1, 1.05, 1] } : { y: [0, -5, 0] }}
        transition={{ repeat: Infinity, duration: expression === 'celebrating' ? 0.6 : 4, ease: "easeInOut" }}
      >
        {/* Modern Vector Baby Elephant Mascot */}
        <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-xl">
          <defs>
            <radialGradient id="skinGradient" cx="50%" cy="50%" r="50%" fx="30%" fy="30%">
              <stop offset="0%" stopColor="#BAE6FD" />
              <stop offset="70%" stopColor="#7DD3FC" />
              <stop offset="100%" stopColor="#38BDF8" />
            </radialGradient>
            <linearGradient id="coatGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="100%" stopColor="#F8FAFC" />
            </linearGradient>
            <radialGradient id="earGradient" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FDA4AF" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#7DD3FC" />
            </radialGradient>
            <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur in="SourceAlpha" stdDeviation="3" />
              <feOffset dx="2" dy="2" result="offsetblur" />
              <feComponentTransfer>
                <feFuncA type="linear" slope="0.2" />
              </feComponentTransfer>
              <feMerge>
                <feMergeNode />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Ears with Wiggle Animation */}
          <motion.g variants={earVariants} animate="animate" style={{ originX: '60px', originY: '85px' }}>
            <ellipse cx="40" cy="85" rx="42" ry="52" fill="url(#skinGradient)" stroke="#0369A1" strokeWidth="0.5" />
            <ellipse cx="40" cy="85" rx="28" ry="38" fill="url(#earGradient)" />
          </motion.g>
          
          <motion.g variants={earVariants} animate="animate" style={{ originX: '140px', originY: '85px' }}>
            <ellipse cx="160" cy="85" rx="42" ry="52" fill="url(#skinGradient)" stroke="#0369A1" strokeWidth="0.5" />
            <ellipse cx="160" cy="85" rx="28" ry="38" fill="url(#earGradient)" />
          </motion.g>

          {/* Chubby Body */}
          <path d="M55 120 Q100 100 145 120 L165 195 Q100 205 35 195 Z" fill="url(#skinGradient)" />
          
          {/* Oversized Head */}
          <circle cx="100" cy="80" r="65" fill="url(#skinGradient)" stroke="#0369A1" strokeWidth="0.5" />
          
          {/* Trunk with Gesture Animation */}
          <motion.path 
            d="M100 100 Q100 150 135 150 Q155 150 155 135" 
            stroke="url(#skinGradient)" 
            strokeWidth="24" 
            fill="none" 
            strokeLinecap="round"
            animate={trunkVariants[expression]}
            transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
            style={{ originX: '100px', originY: '100px' }}
          />
          
          {/* Trunk wrinkles */}
          <path d="M105 120 Q115 120 115 120" stroke="#0369A1" strokeWidth="1" opacity="0.3" />
          <path d="M110 130 Q120 130 120 130" stroke="#0369A1" strokeWidth="1" opacity="0.3" />

          {/* Doctor's Coat */}
          <path d="M50 125 Q100 110 150 125 L165 195 L35 195 Z" fill="url(#coatGradient)" filter="url(#shadow)" />
          <path d="M100 125 L100 195" stroke="#E2E8F0" strokeWidth="1" />
          
          {/* Coat Lapels */}
          <path d="M100 125 L65 155 L50 125 Z" fill="#F8FAFC" stroke="#CBD5E1" strokeWidth="0.5" />
          <path d="M100 125 L135 155 L150 125 Z" fill="#F8FAFC" stroke="#CBD5E1" strokeWidth="0.5" />

          {/* Medical Badge with Nirog Logo */}
          <rect x="120" y="160" width="12" height="15" rx="1" fill="white" stroke="#E2E8F0" strokeWidth="0.5" />
          <circle cx="126" cy="167" r="4" fill="#14B8A6" />
          <text x="124" y="169" fontSize="5" fontWeight="bold" fill="white" fontFamily="sans-serif">N</text>

          {/* Stethoscope around neck */}
          <path d="M70 90 Q100 140 130 90" fill="none" stroke="#334155" strokeWidth="5" strokeLinecap="round" />
          <circle cx="100" cy="135" r="10" fill="#475569" stroke="#1E293B" strokeWidth="1" />
          <circle cx="100" cy="135" r="7" fill="#94A3B8" />
          
          {/* Glasses */}
          <g stroke="#0F172A" strokeWidth="3" fill="rgba(255,255,255,0.1)">
            <circle cx="75" cy="75" r="18" />
            <circle cx="125" cy="75" r="18" />
            <path d="M93 75 Q100 72 107 75" fill="none" />
            <path d="M57 75 L45 70" fill="none" />
            <path d="M143 75 L155 70" fill="none" />
          </g>
          
          {/* Eyes with Blinking Animation */}
          <motion.g variants={eyeVariants} animate="animate" style={{ originY: '75px' }}>
            <circle cx="75" cy="75" r="6" fill="#0F172A" />
            <circle cx="125" cy="75" r="6" fill="#0F172A" />
            <circle cx="77" cy="73" r="2.5" fill="white" opacity="0.8" />
            <circle cx="127" cy="73" r="2.5" fill="white" opacity="0.8" />
          </motion.g>
          
          {/* Sweet Smile */}
          {expression !== 'thinking' && (
            <g>
              <path d="M80 105 Q100 125 120 105" stroke="#0F172A" strokeWidth="3.5" fill="none" strokeLinecap="round" />
              <path d="M78 105 Q76 103 76 101" stroke="#0F172A" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.6" />
              <path d="M122 105 Q124 103 124 101" stroke="#0F172A" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.6" />
            </g>
          )}
          {expression === 'thinking' && (
            <path d="M90 110 L110 110" stroke="#0F172A" strokeWidth="3" strokeLinecap="round" />
          )}

          {/* Head Mirror */}
          <rect x="90" y="12" width="20" height="8" rx="2" fill="#334155" />
          <circle cx="100" cy="25" r="15" fill="#64748B" stroke="#1E293B" strokeWidth="1.5" />
          <circle cx="100" cy="25" r="11" fill="#CBD5E1" />
          <path d="M94 20 L106 30" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.4" />

          {/* Pose specific elements */}
          {expression === 'holding' && (
            <g transform="translate(140, 140)">
              <rect x="0" y="0" width="40" height="50" rx="4" fill="#F1F5F9" stroke="#CBD5E1" strokeWidth="1" />
              <rect x="5" y="5" width="30" height="4" rx="1" fill="#14B8A6" opacity="0.5" />
              <rect x="5" y="15" width="25" height="2" rx="1" fill="#94A3B8" />
              <rect x="5" y="22" width="20" height="2" rx="1" fill="#94A3B8" />
              <rect x="5" y="29" width="25" height="2" rx="1" fill="#94A3B8" />
            </g>
          )}
          
          {expression === 'pointing' && (
            <motion.path 
              d="M160 160 L185 140" 
              stroke="#7DD3FC" 
              strokeWidth="12" 
              strokeLinecap="round"
              animate={{ x: [0, 5, 0] }}
              transition={{ repeat: Infinity, duration: 1 }}
            />
          )}
        </svg>
      </motion.div>
    </div>
  );
};
