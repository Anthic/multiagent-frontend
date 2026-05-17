import { Navbar } from '@/src/components/Navbar';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Multi-Agent Research — AI-Powered Research Platform',
  description: 'Harness the power of multiple AI agents working together to accelerate your research.',
};

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white relative overflow-hidden">
      <Navbar />
      {/* 
        The home page is now completely white with only the menu on the top right.
        Main content does not shift when the menu opens.
      */}
    </main>
  );
}
