'use client'
import { useState, useEffect } from 'react';


export function useScrollProgress(): number {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Scroll event handler
    const handleScroll = () => {
      
      const scrollY = window.scrollY;

    
      const maxScrollY = document.body.scrollHeight - window.innerHeight;

      
      if (maxScrollY <= 0) {
        setProgress(0);
        return;
      }

     
      const currentProgress = Math.min(Math.max(scrollY / maxScrollY, 0), 1);
      setProgress(currentProgress);
    };


    window.addEventListener('scroll', handleScroll, { passive: true });

    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return progress;
}
