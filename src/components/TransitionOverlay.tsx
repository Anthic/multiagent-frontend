'use client';

import React, { useLayoutEffect, useRef, useEffect } from 'react';
import gsap from 'gsap';
import { useTransition } from '../context/TransitionContext';

export const TransitionOverlay = () => {
  const { registerPaths } = useTransition();
  const path1Ref = useRef<SVGPathElement>(null);
  const path2Ref = useRef<SVGPathElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // We use both useEffect and useLayoutEffect. useLayoutEffect for GSAP setup,
  // and useEffect to register the paths with the context to avoid setting state during render.
  
  useLayoutEffect(() => {
    if (typeof window === 'undefined') return;

    const ctx = gsap.context(() => {
      const paths = [path1Ref.current, path2Ref.current].filter(Boolean) as SVGPathElement[];
      
      // 1. Initial State: Screen is COVERED by the strokes
      paths.forEach((path) => {
        const length = path.getTotalLength();
        gsap.set(path, {
          strokeDasharray: length,
          strokeDashoffset: 0, // 0 means fully drawn (covering screen)
          attr: { 'stroke-width': 700 }, // thick strokes to cover
        });
      });

      // 2. Initial Load Animation: Reveal the page
      const tl = gsap.timeline({ delay: 0.1 }); // small delay to ensure DOM is ready
      paths.forEach((path) => {
        const length = path.getTotalLength();
        tl.to(path, {
          strokeDashoffset: -length, // wipe out
          attr: { 'stroke-width': 200 }, // shrink back to normal width
          duration: 1.2,
          ease: 'power2.inOut',
          onComplete: () => {
            // Reset to hidden state for future transitions
            gsap.set(path, { strokeDashoffset: length });
          }
        }, 0);
      });

    }, containerRef);

    return () => ctx.revert();
  }, []);

  useEffect(() => {
    const paths = [path1Ref.current, path2Ref.current].filter(Boolean) as SVGPathElement[];
    if (paths.length > 0) {
        registerPaths(paths);
    }
  }, [registerPaths]);

  return (
    <div 
        ref={containerRef}
        className="fixed inset-0 w-full h-full pointer-events-none z-[100] scale-150 -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2"
    >
      <svg
        preserveAspectRatio="none"
        viewBox="0 0 2453 2535"
        className="w-full h-full"
      >
        <path
          ref={path1Ref}
          d="M227.549 1818.76C227.549 1818.76 406.016 2207.75 569.049 2130.26C843.431 1999.85 -264.104 1002.3 227.549 876.262C552.918 792.849 773.647 2456.11 1342.05 2130.26C1885.43 1818.76 14.9644 455.772 760.548 137.262C1342.05 -111.152 1663.5 2266.35 2209.55 1972.76C2755.6 1679.18 1536.63 384.467 1826.55 137.262C2013.5 -22.1463 2209.55 381.262 2209.55 381.262"
          stroke="var(--stroke-1, #ffffff)"
          strokeWidth="200"
          strokeLinecap="round"
          fill="none"
        />
        <path
          ref={path2Ref}
          d="M1661.28 2255.51C1661.28 2255.51 2311.09 1960.37 2111.78 1817.01C1944.47 1696.67 718.456 2870.17 499.781 2255.51C308.969 1719.17 2457.51 1613.83 2111.78 963.512C1766.05 313.198 427.949 2195.17 132.281 1455.51C-155.219 736.292 2014.78 891.514 1708.78 252.012C1437.81 -314.29 369.471 909.169 132.281 566.512C18.1772 401.672 244.781 193.012 244.781 193.012"
          stroke="var(--stroke-2, #AAFFC7)"
          strokeWidth="200"
          strokeLinecap="round"
          fill="none"
        />
      </svg>
    </div>
  );
};
