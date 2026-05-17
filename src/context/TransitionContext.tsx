'use client';

import React, { createContext, useContext, useRef, useState, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import gsap from 'gsap';

interface TransitionContextType {
  navigate: (href: string) => Promise<void>;
  registerPaths: (paths: SVGPathElement[]) => void;
  isTransitioning: boolean;
}

const TransitionContext = createContext<TransitionContextType | null>(null);

export const useTransition = () => {
  const context = useContext(TransitionContext);
  if (!context) {
    throw new Error('useTransition must be used within a TransitionProvider');
  }
  return context;
};

export const TransitionProvider = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const pathname = usePathname();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const pathsRef = useRef<SVGPathElement[]>([]);
  const isAnimatingRef = useRef(false);

  const registerPaths = useCallback((paths: SVGPathElement[]) => {
    pathsRef.current = paths;
  }, []);

  const leave = async () => {
    return new Promise<void>((resolve) => {
      if (pathsRef.current.length === 0) {
        resolve();
        return;
      }

      const tl = gsap.timeline({ onComplete: resolve });
      
      pathsRef.current.forEach((path) => {
        tl.to(path, {
          strokeDashoffset: 0,
          attr: { 'stroke-width': 700 },
          duration: 1,
          ease: 'power1.inOut'
        }, 0);
      });
    });
  };

  const enter = async () => {
    return new Promise<void>((resolve) => {
      if (pathsRef.current.length === 0) {
        resolve();
        return;
      }

      const tl = gsap.timeline({ onComplete: resolve });

      pathsRef.current.forEach((path) => {
        const totalLength = path.getTotalLength();
        tl.to(path, {
          strokeDashoffset: -totalLength,
          attr: { 'stroke-width': 200 },
          duration: 1,
          ease: 'power1.inOut',
          onComplete: () => {
            gsap.set(path, { strokeDashoffset: totalLength });
          }
        }, 0);
      });
    });
  };

  const navigate = async (href: string) => {
    if (isAnimatingRef.current || href === pathname) return;

    isAnimatingRef.current = true;
    setIsTransitioning(true);

    // Phase 1: Leave animation (screen fills)
    await leave();

    // Next.js Route Change
    router.push(href);

    // We need a small delay to ensure the DOM has updated before running the enter animation.
    // In a real app, you might want to wait for a specific 'page loaded' event if you have heavy data fetching.
    setTimeout(async () => {
        // Phase 2: Enter animation (screen clears)
        await enter();
        
        isAnimatingRef.current = false;
        setIsTransitioning(false);
    }, 100);

  };

  return (
    <TransitionContext.Provider value={{ navigate, registerPaths, isTransitioning }}>
      {children}
    </TransitionContext.Provider>
  );
};
