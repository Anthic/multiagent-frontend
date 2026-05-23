import { AtlasHeadSceneWrapper } from '@/src/components/3d/AtlasHeadSceneWrapper';
import { AnimatedDescriptionText } from '@/src/components/AnimatedDescriptionText';
import { Navbar } from '@/src/components/Navbar';
import { EngineDiagnosticPanel } from '@/src/components/EngineDiagnosticPanel';
import { RepositoryGalaxyMap } from '@/src/components/RepositoryGalaxyMap';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'atlash.ai - Agentic Intelligence Platform',
  description: 'Build intelligent agent-powered systems for modern digital work.',
};

export default function HomePage() {
  return (
    <main 
      className="min-h-screen relative overflow-hidden" 
      style={{
        backgroundColor: '#f5f0e8',
        backgroundImage: 'linear-gradient(135deg, #f5f0e8 0%, #ede8d8 100%)',
        color: '#1a1a1a'
      }}
    >
      <Navbar />
      
      {/* 3D Fixed Background Canvas Component */}
      <AtlasHeadSceneWrapper />

      {/* CSS Vignette Overlay */}
      <div 
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          pointerEvents: 'none',
          zIndex: 2,
          background: 'radial-gradient(circle, transparent 35%, rgba(245, 240, 232, 0.6) 100%)'
        }}
      />

      {/* Main typographic scrolling content */}
      <div id="page-content" className="relative z-10 w-11/12 mx-auto">
        
        {/* SECTION 1: HERO */}
        <section className="min-h-screen bg-transparent pointer-events-none relative">
          <div className="grid min-h-screen items-center gap-10 pt-24 lg:grid-cols-[minmax(0,1fr)_minmax(360px,430px)]">
            <div className="max-w-[720px] pointer-events-auto">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-black/5 border border-black/10 text-black/70 text-[12px] font-semibold tracking-[0.24em] uppercase mb-7 backdrop-blur-md">
                <span className="h-2 w-2 rounded-full bg-[#AAFFC7] shadow-[0_0_18px_rgba(170,255,199,0.95)]" />
                <span className="font-imperial text-[24px] normal-case tracking-normal leading-none">atlash.ai</span>
              </span>
              <h1 className="font-metamorphous text-[clamp(42px,7.8vw,104px)] leading-[0.98] tracking-normal text-[#11100d] mb-7 max-w-[760px] ">
                Intelligence<br />That Moves<br />With You
              </h1>
              <p className="font-roboto text-base sm:text-lg lg:text-xl text-black/68 leading-[1.75] mb-9 max-w-[560px]">
                atlash.ai builds modern agent-powered web systems that can think through tasks,
                automate complex workflows, and turn ideas into intelligent digital experiences.
              </p>
              <button className="group relative inline-flex items-center gap-3 overflow-hidden rounded-full bg-gradient-to-r from-black via-[#191919] to-[#3a3a3a] px-7 py-4 text-sm font-bold uppercase tracking-[0.18em] text-white shadow-[0_18px_45px_rgba(0,0,0,0.22)] transition-transform duration-300 hover:-translate-y-1">
                <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/18 to-white/0 -translate-x-full transition-transform duration-700 group-hover:translate-x-full" />
                <span className="relative">Explore More</span>
                <span className="relative flex h-7 w-7 items-center justify-center rounded-full bg-[#AAFFC7] text-black transition-transform duration-300 group-hover:translate-x-1">
                  &gt;
                </span>
              </button>
            </div>

            <aside className="pointer-events-auto w-full self-center justify-self-end border-l border-black/10 pl-6 lg:pl-8">
              <span className="font-roboto text-[11px] font-bold uppercase tracking-[0.28em] text-black/45">
                What it can do
              </span>
              <h2 className="mt-4 max-w-[390px] font-audiowide text-2xl leading-[1.18] text-[#11100d] sm:text-3xl">
                Build, automate, and connect intelligent digital work.
              </h2>
              <div className="mt-6">
                <AnimatedDescriptionText text="atlash.ai helps you turn a research question into a guided AI workflow. It can break complex topics into smaller tasks, search and organize useful information, compare ideas, summarize findings, and shape everything into clear next steps. Instead of using AI only for quick answers, this website is designed to support deeper research, smarter automation, and human-controlled decision making from one modern interface." />
              </div>
            </aside>
          </div>
          
          {/* Animated Scroll Mouse Indicator */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-gray-500 text-[12px] tracking-[0.2em] uppercase font-medium opacity-80">
            <span>Scroll</span>
            <div className="w-[20px] h-[35px] border-2 border-gray-400 rounded-[20px] relative">
              <div 
                className="w-[4px] h-[8px] bg-violet-500 rounded-[2px] absolute top-[6px] left-1/2 -translate-x-1/2"
                style={{
                  animation: 'scrollAnim 1.8s infinite ease-in-out'
                }}
              />
            </div>
          </div>
        </section>

        {/* SECTION 2: SYNAPSE */}
        <section className="min-h-screen flex items-center justify-center bg-transparent pointer-events-none py-20">
          <div className="grid lg:grid-cols-[1.1fr_1fr] gap-12 sm:gap-16 items-center w-11/12 mx-auto pointer-events-auto">
            {/* Text Description Left Column */}
            <div className="flex flex-col items-start text-left space-y-6 max-w-[540px]">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-600/10 border border-amber-600/20 text-amber-800 text-[12px] font-semibold tracking-widest uppercase backdrop-blur-md">
                <span className="h-1.5 w-1.5 rounded-full bg-[#d4a017] animate-pulse" />
                Engine Layer
              </span>
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.08] tracking-tight bg-gradient-to-b from-gray-950 to-gray-700 bg-clip-text text-transparent">
                Procedural<br />Optimization
              </h2>
              <p className="text-base sm:text-lg text-black/75 leading-[1.65]">
                atlash.ai operates a dynamically balanced multi-agent orchestration engine. 
                When a complex research question is processed, the system automatically spawns 
                specialized agents to index vector search spaces, parse queries, scrape sources, 
                and synthesize semantic layers in real-time.
              </p>
              <div className="pt-4 border-t border-black/10 w-full">
                <span className="text-[11px] font-mono uppercase tracking-widest text-black/45 block mb-2 font-bold">
                  System Commands Active
                </span>
                <div className="flex flex-wrap gap-2">
                  <span className="px-2.5 py-1 rounded bg-black/5 text-black/60 font-mono text-[10px] select-none hover:bg-black/10 cursor-pointer transition-colors">/search</span>
                  <span className="px-2.5 py-1 rounded bg-black/5 text-black/60 font-mono text-[10px] select-none hover:bg-black/10 cursor-pointer transition-colors">/synthesize</span>
                  <span className="px-2.5 py-1 rounded bg-black/5 text-black/60 font-mono text-[10px] select-none hover:bg-black/10 cursor-pointer transition-colors">/optimize</span>
                </div>
              </div>
            </div>

            {/* Diagnostic Panel Right Column */}
            <div className="w-full">
              <EngineDiagnosticPanel />
            </div>
          </div>
        </section>

        {/* SECTION 3: SYSTEM ARCHITECTURE GALAXY MAP */}
        <section className="min-h-screen flex flex-col items-center justify-center bg-transparent pointer-events-none py-20">
          <div className="w-11/12 mx-auto pointer-events-auto flex flex-col gap-10">
            {/* Centered Introductory Text Details */}
            <div className="flex flex-col items-center text-center space-y-4 max-w-[760px] mx-auto">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-600/10 border border-violet-600/20 text-[#7c3aed] text-[12px] font-semibold tracking-widest uppercase backdrop-blur-md">
                <span className="h-1.5 w-1.5 rounded-full bg-[#7c3aed] animate-pulse" />
                Orchestration Blueprint
              </span>
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.08] tracking-tight bg-gradient-to-b from-gray-950 to-gray-700 bg-clip-text text-transparent">
                Unified Core Architecture Flow
              </h2>
              <p className="text-base sm:text-lg text-black/75 leading-[1.65]">
                atlash.ai operates as a fully integrated ecosystem of core repository modules. 
                Hover over the constellation nodes below to see how our systems communicate, 
                what technologies power each layer, and where they deploy!
              </p>
            </div>

            {/* Immersive Galaxy Constellation Map */}
            <div className="w-full">
              <RepositoryGalaxyMap />
            </div>
          </div>
        </section>

        {/* Sleek Minimalist Footer */}
        <footer className="w-full border-t border-black/5 pt-8 pb-16 mt-20 flex flex-col sm:flex-row items-center justify-between gap-4 pointer-events-auto">
          <div className="flex flex-col items-center sm:items-start gap-1">
            <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-black/45 select-none">
              © 2026 atlash.ai. All rights reserved.
            </span>
            <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-black/35">
              Developed by <span className="text-black/60 font-semibold hover:text-[#7c3aed] transition-colors cursor-pointer">Anthic Kumar Singh</span>
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="h-1.5 w-1.5 rounded-full bg-[#10b981] animate-pulse" />
            <span className="font-mono text-[9px] uppercase tracking-[0.25em] text-black/45 select-none">
              Platform Status: Optimized
            </span>
          </div>
        </footer>

      </div>

      {/* Inject custom inline keyframes style for mouse scroll animation */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes scrollAnim {
          0% { top: 6px; opacity: 1; }
          50% { top: 18px; opacity: 0; }
          100% { top: 6px; opacity: 1; }
        }
      `}} />
    </main>
  );
}
