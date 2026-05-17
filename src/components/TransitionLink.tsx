'use client';

import React from 'react';
import Link, { LinkProps } from 'next/link';
import { useTransition } from '../context/TransitionContext';
import { usePathname } from 'next/navigation';

interface TransitionLinkProps extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, keyof LinkProps>, LinkProps {
  children: React.ReactNode;
  href: string;
}

export const TransitionLink = ({ href, children, onClick, ...props }: TransitionLinkProps) => {
  const { navigate, isTransitioning } = useTransition();
  const pathname = usePathname();

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    e.preventDefault();
    
    if (onClick) {
        onClick(e);
    }

    if (!isTransitioning && href !== pathname) {
      navigate(href);
    }
  };

  return (
    <Link href={href} onClick={handleClick} {...props}>
      {children}
    </Link>
  );
};
