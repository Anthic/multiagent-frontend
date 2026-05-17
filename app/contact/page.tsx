import { TransitionLink } from '@/src/components/TransitionLink';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact | Multi-Agent Research',
  description: 'Get in touch with us.',
};

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-[#f0f2ef] text-[#171717] font-sans flex flex-col">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 flex items-center justify-between px-12 py-6 border-b border-black/10 backdrop-blur-md z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
            <span className="text-white text-base font-bold">M</span>
          </div>
          <span className="font-bold text-lg tracking-tight">MultiAgent<span className="text-indigo-600">Research</span></span>
        </div>
        <div className="flex items-center gap-6">
          <TransitionLink href="/" className="text-sm font-medium hover:text-indigo-600 transition-colors">
            Home
          </TransitionLink>
          <TransitionLink href="/about" className="text-sm font-medium hover:text-indigo-600 transition-colors">
            About
          </TransitionLink>
          <TransitionLink href="/login" className="text-sm font-medium px-4 py-2 rounded-md bg-[#171717] text-white hover:bg-black transition-colors">
            Log in
          </TransitionLink>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-6 pt-24">
        <h1 className="text-[clamp(3rem,8vw,8rem)] font-black uppercase leading-[0.9] tracking-tighter max-w-[1200px]">
          Say Hello
        </h1>
        <p className="mt-8 text-xl text-black/60 max-w-2xl leading-relaxed">
          Have questions or want to learn more? We'd love to hear from you. Reach out to our team anytime.
        </p>
      </section>
    </main>
  );
}
