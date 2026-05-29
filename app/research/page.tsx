import { Suspense } from 'react';
import type { Metadata } from 'next';
import ResearchPage from '../../src/app/(research)/ResearchPageClient';

export const metadata: Metadata = {
  title: 'Research | atlash.ai',
  description: 'Run and review multi-agent research sessions.',
};

export default function Page() {
  return (
    <Suspense fallback={null}>
      <ResearchPage />
    </Suspense>
  );
}
