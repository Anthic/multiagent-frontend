'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { TransitionLink } from './TransitionLink';
import { useIsAuthenticated, useUser } from '../store/authStore';
import { useLogout } from '../hooks/useAuth';
import { useWalletStore } from '../store/walletStore';
import { TopUpModal } from './wallet/TopUpModal';

const publicLinks = [
  { name: 'Home', href: '/' },
  { name: 'About', href: '/about' },
];

const authLinks = [
  { name: 'Home', href: '/' },
  { name: 'Research', href: '/research' },
  { name: 'Paper Studio', href: '/papers' },
  { name: 'Notes', href: '/notes' },
  { name: 'Dashboard', href: '/dashboard' },
  { name: 'About', href: '/about' },
];

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [clipOrigin, setClipOrigin] = useState({ x: 'calc(100% - 48px)', y: '28px' });
  const btnRef = useRef<HTMLButtonElement>(null);
  const isAuthenticated = useIsAuthenticated();
  const pathname = usePathname();

  const user = useUser();
  const logout = useLogout();
  const { balanceBDT, fetchWalletBalance, openTopUpModal } = useWalletStore();
  const links = isAuthenticated ? authLinks : publicLinks;

  useEffect(() => {
    if (isAuthenticated) {
      fetchWalletBalance();
    }
  }, [isAuthenticated, fetchWalletBalance]);

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

  const isRouteActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <>
      <TopUpModal />

      <div className="fixed top-3 right-3 sm:top-6 sm:right-6 md:top-8 md:right-8 z-1001 flex items-center gap-2 sm:gap-3">
        {isAuthenticated && (
          <button
            type="button"
            onClick={() => openTopUpModal()}
            className="flex items-center gap-1.5 bg-black/80 hover:bg-black text-white px-3 py-2 sm:px-4 sm:py-2.5 rounded-full border border-white/15 backdrop-blur-md transition-all shadow-lg hover:scale-105 cursor-pointer text-xs"
            title="Click to recharge wallet"
          >
            <span className="text-[#AAFFC7] font-bold">৳</span>
            <span className="font-semibold tracking-wide">{balanceBDT.toFixed(2)}</span>
            <span className="text-[10px] bg-[#AAFFC7]/20 text-[#AAFFC7] px-1.5 py-0.5 rounded-full font-medium ml-0.5">
              + Top-up
            </span>
          </button>
        )}

        <button
          ref={btnRef}
          type="button"
          onClick={() => { updateClipOrigin(); setIsOpen(!isOpen); }}
          className="flex items-center gap-2 md:gap-3 bg-[#AAFFC7] text-black px-4 py-2.5 sm:px-5 sm:py-3 md:px-6 md:py-3.5 rounded-full hover:scale-105 transition-transform duration-300 shadow-[0_8px_30px_rgb(0,0,0,0.12)] cursor-pointer border border-[#AAFFC7]/50"
        >
          <span className="text-[11px] sm:text-[12px] md:text-[13px] tracking-[0.15em] uppercase font-bold mt-0.5">
            {isOpen ? 'Close' : 'Menu'}
          </span>
          <div className="relative size-3.5 sm:size-4 flex items-center justify-center">
            <span
              className={`absolute h-0.5 w-full bg-black transition-all duration-300 ${
                isOpen ? 'rotate-45' : '-translate-y-1'
              }`}
            />
            <span
              className={`absolute h-0.5 w-full bg-black transition-all duration-300 ${
                isOpen ? '-rotate-45' : 'translate-y-1'
              }`}
            />
          </div>
        </button>
      </div>

      <nav
        className="fixed inset-0 bg-[#AAFFC7] z-1000 pointer-events-none overflow-hidden"
        style={{
          clipPath: isOpen
            ? `circle(200% at ${clipOrigin.x} ${clipOrigin.y})`
            : `circle(0px at ${clipOrigin.x} ${clipOrigin.y})`,
          transition: 'clip-path 0.8s cubic-bezier(0.76, 0, 0.24, 1)',
          pointerEvents: isOpen ? 'auto' : 'none',
        }}
      >
        <div className="relative h-full w-full overflow-y-auto">
          <div className="min-h-full flex flex-col items-center w-full max-w-5xl mx-auto px-4 sm:px-6 pt-24 sm:pt-28 md:pt-28 pb-6 sm:pb-8">
            <div className="w-full flex-1 flex flex-col justify-center items-center gap-3 sm:gap-5 md:gap-8 py-8">
              {links.map((link, i) => (
                <div key={link.name} className="overflow-hidden py-1 md:py-2">
                  {(() => {
                    const active = isRouteActive(link.href);
                    return (
                  <TransitionLink
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    aria-current={active ? 'page' : undefined}
                    className={`group relative block w-fit overflow-hidden text-[clamp(27px,6.4vw,78px)] font-light leading-[0.92] tracking-tighter transition-all duration-300 after:absolute after:inset-x-0 after:bottom-0 after:h-px after:origin-left after:bg-black after:transition-transform after:duration-500 hover:after:scale-x-100 ${
                      active
                        ? 'text-black [text-shadow:0_6px_28px_#67C090] after:scale-x-100'
                        : 'text-black/80 after:scale-x-0 hover:text-black hover:[text-shadow:0_4px_25px_#67C090]'
                    }`}
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
                    <span className="block transition-transform duration-500 ease-out group-hover:-translate-y-full">{link.name}</span>
                    <span aria-hidden="true" className="absolute inset-x-0 top-0 block translate-y-full text-black transition-transform duration-500 ease-out group-hover:translate-y-0">{link.name}</span>
                  </TransitionLink>
                    );
                  })()}
                </div>
              ))}
            </div>

            <div
              className="mt-auto flex flex-col items-center gap-4 text-black w-full px-4 pb-4"
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
                    aria-current={isRouteActive('/login') ? 'page' : undefined}
                    className={`text-2xl md:text-4xl font-light leading-none transition-all duration-300 ${
                      isRouteActive('/login')
                        ? 'text-black [text-shadow:0_6px_28px_#67C090]'
                        : 'text-black/80 hover:text-black hover:[text-shadow:0_4px_25px_#67C090]'
                    }`}
                  >
                    Login
                  </TransitionLink>
                  <TransitionLink
                    href="/register"
                    onClick={() => setIsOpen(false)}
                    aria-current={isRouteActive('/register') ? 'page' : undefined}
                    className={`text-2xl md:text-4xl font-light leading-none transition-all duration-300 ${
                      isRouteActive('/register')
                        ? 'text-black [text-shadow:0_6px_28px_#67C090]'
                        : 'text-black/80 hover:text-black hover:[text-shadow:0_4px_25px_#67C090]'
                    }`}
                  >
                    Register
                  </TransitionLink>
                </div>
              )}
            </div>

            <div
              className="mt-4 pb-6 text-black/40 text-[10px] md:text-sm font-medium tracking-widest uppercase text-center"
              style={{
                opacity: isOpen ? 1 : 0,
                transition: `opacity 0.6s ease ${isOpen ? 0.8 : 0}s`,
              }}
            >
              MultiAgent Research (c) {new Date().getFullYear()}
            </div>
          </div>
        </div>
      </nav>
    </>
  );
};
