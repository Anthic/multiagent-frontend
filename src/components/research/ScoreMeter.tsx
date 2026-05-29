'use client';

import React, { useEffect, useState } from 'react';

interface ScoreMeterProps {
  score: number;
  type: 'critique' | 'fact_check';
}

export const ScoreMeter: React.FC<ScoreMeterProps> = ({ score, type }) => {
  const [animatedValue, setAnimatedValue] = useState(0);

  const isCritique = type === 'critique';
  const max = isCritique ? 10 : 1.0;
  const percentage = Math.min(100, Math.max(0, (score / max) * 100));

  useEffect(() => {
    // Score numeric scroll animation on mount
    const duration = 1200; 
    const steps = 60;
    const stepTime = duration / steps;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;
      const easeProgress = progress * (2 - progress); 
      setAnimatedValue(easeProgress * score);

      if (currentStep >= steps) {
        setAnimatedValue(score);
        clearInterval(timer);
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [score, max]);

  let colorClass = 'stroke-rose-500';
  let glowColor = 'rgba(239, 68, 68, 0.4)';
  let textColorClass = 'text-rose-500';
  let badgeText = 'Improvement Needed';

  if (isCritique) {
    if (score >= 8) {
      colorClass = 'stroke-emerald-400';
      glowColor = 'rgba(16, 185, 129, 0.4)';
      textColorClass = 'text-emerald-500';
      badgeText = 'Excellent Quality';
    } else if (score >= 6) {
      colorClass = 'stroke-amber-400';
      glowColor = 'rgba(245, 158, 11, 0.4)';
      textColorClass = 'text-amber-500';
      badgeText = 'Acceptable Quality';
    }
  } else {
    if (score >= 0.85) {
      colorClass = 'stroke-emerald-400';
      glowColor = 'rgba(16, 185, 129, 0.4)';
      textColorClass = 'text-emerald-500';
      badgeText = 'Highly Verified';
    } else if (score >= 0.7) {
      colorClass = 'stroke-amber-400';
      glowColor = 'rgba(245, 158, 11, 0.4)';
      textColorClass = 'text-amber-500';
      badgeText = 'Moderate Verification';
    }
  }

  return (
    <div className="flex flex-col items-center p-6 bg-white/40 dark:bg-black/20 backdrop-blur-md rounded-2xl border border-black/5 dark:border-white/5 shadow-sm">
      <h4 className="text-xs font-mono uppercase tracking-[0.2em] text-black/50 dark:text-white/45 mb-4 text-center font-bold">
        {isCritique ? 'CRITIQUE RATING' : 'FACT-CHECK INTEGRITY'}
      </h4>

      <div className="relative size-36 flex items-center justify-center">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="38"
            className="stroke-black/5 dark:stroke-white/5 fill-transparent"
            strokeWidth="8"
          />
          <circle
            cx="50"
            cy="50"
            r="38"
            className={`fill-transparent transition-all duration-300 ease-out ${colorClass}`}
            strokeWidth="8"
            strokeDasharray="238.7"
            strokeDashoffset={238.7 - (238.7 * Math.min(percentage, 100)) / 100}
            strokeLinecap="round"
            style={{
              filter: `drop-shadow(0 0 6px ${glowColor})`
            }}
          />
        </svg>

        <div className="absolute flex flex-col items-center justify-center">
          <span className="font-audiowide text-3xl font-extrabold text-[#11100d] dark:text-white">
            {isCritique
              ? `${animatedValue.toFixed(1)}`
              : `${Math.round(animatedValue * 100)}%`}
          </span>
          <span className="text-[10px] font-mono text-black/45 dark:text-white/40 uppercase tracking-widest mt-0.5">
            {isCritique ? 'of 10.0' : 'confidence'}
          </span>
        </div>
      </div>

      <div className={`mt-4 px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 ${textColorClass}`}>
        {badgeText}
      </div>
    </div>
  );
};
