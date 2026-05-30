'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { TransitionLink } from './TransitionLink';
import { useIsAuthenticated, useUser } from '../store/authStore';
import { useLogout } from '../hooks/useAuth';

const publicLinks = [
  { name: 'Home', href: '/' },
  { name: 'About', href: '/about' },
];

const authLinks = [
  { name: 'Home', href: '/' },
  { name: 'Research', href: '/research' },
  { name: 'Dashboard', href: '/dashboard' },
  { name: 'About', href: '/about' },
];

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [clipOrigin, setClipOrigin] = useState({ x: 'calc(100% - 48px)', y: '28px' });
  const btnRef = useRef<HTMLButtonElement>(null);
  const isAuthenticated = useIsAuthenticated();

  const user = useUser();
  const logout = useLogout();
  const links = isAuthenticated ? authLinks : publicLinks;

  const updateClipOrigin = useCallback(() => {
    if (!btnRef.current) return;
    const rect = btnRef.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    setClipOrigin({ x: `${cx}px`, y: `${cy}px` });
  }, []);

  useEffect(() => {
    updateClipOrigin();
    window.addEventListener('resize', updateClipOrigin);
    return () => window.removeEventListener('resize', updateClipOrigin);
  }, [updateClipOrigin]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }, [isOpen]);

  const handleLogout = async () => {
    setIsOpen(false);
    await logout();
  };

  return (
    <>
      <div className="fixed top-4 right-4 sm:top-6 sm:right-6 md:top-8 md:right-8 z-[1001]">
        <button
          ref={btnRef}
          type="button"
          onClick={() => { updateClipOrigin(); setIsOpen(!isOpen); }}
          className="flex items-center gap-2 md:gap-3 bg-[#AAFFC7] text-black px-4 py-2.5 sm:px-5 sm:py-3 md:px-6 md:py-3.5 rounded-full hover:scale-105 transition-transform duration-300 shadow-[0_8px_30px_rgb(0,0,0,0.12)] cursor-pointer border border-[#AAFFC7]/50"
        >
          <span className="text-[11px] sm:text-[12px] md:text-[13px] tracking-[0.15em] uppercase font-bold mt-[2px]">
            {isOpen ? 'Close' : 'Menu'}
          </span>
          <div className="relative size-3.5 sm:size-4 flex items-center justify-center">
            <span
              className={`absolute h-[2px] w-full bg-black transition-all duration-300 ${
                isOpen ? 'rotate-45' : '-translate-y-1'
              }`}
            />
            <span
              className={`absolute h-[2px] w-full bg-black transition-all duration-300 ${
                isOpen ? '-rotate-45' : 'translate-y-1'
              }`}
            />
          </div>
        </button>
      </div>

      <nav
        className="fixed inset-0 bg-[#AAFFC7] z-[1000] flex flex-col justify-center items-center pointer-events-none"
        style={{
          clipPath: isOpen
            ? `circle(200% at ${clipOrigin.x} ${clipOrigin.y})`
            : `circle(0px at ${clipOrigin.x} ${clipOrigin.y})`,
          transition: 'clip-path 0.8s cubic-bezier(0.76, 0, 0.24, 1)',
          pointerEvents: isOpen ? 'auto' : 'none',
        }}
      >
        <div className="flex flex-col items-center gap-3 sm:gap-5 md:gap-8 w-full max-w-4xl px-4 sm:px-6 pt-20 sm:pt-0">
          {links.map((link, i) => (
            <div key={link.name} className="overflow-hidden py-1 md:py-2">
              <TransitionLink
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="block text-black text-[clamp(35px,10vw,90px)] font-light leading-none tracking-tighter hover:[text-shadow:0_4px_25px_#67C090] transition-all duration-300"
                style={{
                  transform: isOpen ? 'translateY(0)' : 'translateY(100%)',
                  opacity: isOpen ? 1 : 0,
                  transition: `transform 0.6s cubic-bezier(0.76, 0, 0.24, 1) ${
                    isOpen ? 0.3 + i * 0.08 : 0
                  }s, opacity 0.6s ease ${
                    isOpen ? 0.3 + i * 0.08 : 0
                  }s, text-shadow 0.3s ease`,
                }}
              >
                {link.name}
              </TransitionLink>
            </div>
          ))}
        </div>

        <div
          className="absolute bottom-16 md:bottom-24 flex flex-col items-center gap-4 text-black w-full px-4"
          style={{
            opacity: isOpen ? 1 : 0,
            transform: isOpen ? 'translateY(0)' : 'translateY(20px)',
            transition: `opacity 0.6s ease ${
              isOpen ? 0.7 : 0
            }s, transform 0.6s cubic-bezier(0.76, 0, 0.24, 1) ${
              isOpen ? 0.7 : 0
            }s`,
          }}
        >
          {isAuthenticated ? (
            <>
              <div className="text-center hidden md:block">
                <p className="text-sm uppercase tracking-[0.2em] text-black/45">
                  Signed in as
                </p>
                <p className="text-xl font-medium">
                  {user?.name || user?.email || 'Researcher'}
                </p>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="text-2xl md:text-4xl font-light leading-none hover:[text-shadow:0_4px_25px_#67C090] transition-all duration-300 cursor-pointer"
              >
                Logout
              </button>
            </>
          ) : (
            <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8">
              <TransitionLink
                href="/login"
                onClick={() => setIsOpen(false)}
                className="text-2xl md:text-4xl font-light leading-none hover:[text-shadow:0_4px_25px_#67C090] transition-all duration-300"
              >
                Login
              </TransitionLink>
              <TransitionLink
                href="/register"
                onClick={() => setIsOpen(false)}
                className="text-2xl md:text-4xl font-light leading-none hover:[text-shadow:0_4px_25px_#67C090] transition-all duration-300"
              >
                Register
              </TransitionLink>
            </div>
          )}
        </div>

        <div
          className="absolute bottom-6 md:bottom-12 text-black/40 text-[10px] md:text-sm font-medium tracking-widest uppercase"
          style={{
            opacity: isOpen ? 1 : 0,
            transition: `opacity 0.6s ease ${isOpen ? 0.8 : 0}s`,
          }}
        >
          MultiAgent Research (c) {new Date().getFullYear()}
        </div>
      </nav>
    </>
  );
};
