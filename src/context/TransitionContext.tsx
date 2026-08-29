'use client';

import React, { createContext, useContext, useRef, useState, useCallback, useEffect } from 'react';
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
  const pathLengthsRef = useRef<number[]>([]);
  const isAnimatingRef = useRef(false);
  const shouldEnterRef = useRef(false);

  const registerPaths = useCallback((paths: SVGPathElement[]) => {
    pathsRef.current = paths;
    pathLengthsRef.current = paths.map((path) => path.getTotalLength() || 10000);
  }, []);

  const leave = useCallback(async () => {
    return new Promise<void>((resolve) => {
      if (pathsRef.current.length === 0) {
        resolve();
        return;
      }

      gsap.killTweensOf(pathsRef.current);

      const tl = gsap.timeline({
        defaults: {
          duration: 0.62,
          ease: 'power4.inOut',
          overwrite: 'auto',
        },
        onComplete: resolve,
      });
      
      pathsRef.current.forEach((path, index) => {
        const totalLength = pathLengthsRef.current[index] || path.getTotalLength() || 10000;
        gsap.set(path, {
          strokeDasharray: totalLength,
          strokeDashoffset: totalLength,
          attr: { 'stroke-width': 680 },
          force3D: true,
        });
      });
      tl.to(pathsRef.current, { strokeDashoffset: 0, stagger: 0.025 });
    });
  }, []);

  const enter = useCallback(async () => {
    return new Promise<void>((resolve) => {
      if (pathsRef.current.length === 0) {
        resolve();
        return;
      }

      gsap.killTweensOf(pathsRef.current);

      const tl = gsap.timeline({
        defaults: {
          duration: 0.66,
          ease: 'power4.inOut',
          overwrite: 'auto',
        },
        onComplete: resolve,
      });

      pathsRef.current.forEach((path, index) => {
        const totalLength = pathLengthsRef.current[index] || path.getTotalLength() || 10000;
        gsap.set(path, { strokeDasharray: totalLength, force3D: true });
      });
      tl.to(pathsRef.current, {
        strokeDashoffset: (_, target: SVGPathElement) => -(target.getTotalLength() || 10000),
        stagger: 0.025,
        onComplete: () => {
          pathsRef.current.forEach((path, index) => {
            gsap.set(path, {
              strokeDashoffset: pathLengthsRef.current[index] || path.getTotalLength() || 10000,
              attr: { 'stroke-width': 680 },
            });
          });
        },
      });
    });
  }, []);

  useEffect(() => {
    if (!shouldEnterRef.current) return;
    shouldEnterRef.current = false;

    let cancelled = false;
    requestAnimationFrame(() => {
      requestAnimationFrame(async () => {
        if (cancelled) return;
        await enter();
        if (cancelled) return;
        isAnimatingRef.current = false;
        setIsTransitioning(false);
      });
    });

    return () => {
      cancelled = true;
    };
  }, [pathname, enter]);

  const navigate = async (href: string) => {
    if (isAnimatingRef.current || href === pathname) return;

    isAnimatingRef.current = true;
    setIsTransitioning(true);

    // Phase 1: Leave animation (screen fills)
    await leave();

    // Next.js Route Change
    shouldEnterRef.current = true;
    router.push(href);
  };

  return (
    <TransitionContext.Provider value={{ navigate, registerPaths, isTransitioning }}>
      {children}
    </TransitionContext.Provider>
  );
};
