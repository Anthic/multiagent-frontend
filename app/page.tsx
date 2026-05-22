import { AtlasHeadSceneWrapper } from '@/src/components/3d/AtlasHeadSceneWrapper';
import { AnimatedDescriptionText } from '@/src/components/AnimatedDescriptionText';
import { Navbar } from '@/src/components/Navbar';
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
        <section className="min-h-screen flex flex-col justify-center items-end text-right bg-transparent pointer-events-none">
          <div className="max-w-[600px] pointer-events-auto">
            <span className="inline-block px-4 py-2 rounded-full bg-amber-600/10 border border-amber-600/20 text-amber-700 text-[12px] font-semibold tracking-widest uppercase mb-6 backdrop-blur-md">
              Engine Layer
            </span>
            <h2 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold leading-[1.1] tracking-tight bg-gradient-to-b from-gray-900 to-gray-600 bg-clip-text text-transparent mb-4">
              Procedural<br />Optimization
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-gray-700 leading-relaxed mb-8">
              Dynamically balanced computational systems featuring state-of-the-art Web3 data vectors and real-time rendering pipelines.
            </p>
          </div>
        </section>

        {/* SECTION 3: QUANTUM */}
        <section className="min-h-screen flex flex-col justify-center items-start text-left bg-transparent pointer-events-none">
          <div className="max-w-[600px] pointer-events-auto">
            <span className="inline-block px-4 py-2 rounded-full bg-violet-600/10 border border-violet-600/20 text-[#7c3aed] text-[12px] font-semibold tracking-widest uppercase mb-6 backdrop-blur-md">
              Hyper-dimensional
            </span>
            <h2 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold leading-[1.1] tracking-tight bg-gradient-to-b from-gray-900 to-gray-600 bg-clip-text text-transparent mb-4">
              Decentralized<br />Consensus
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-gray-700 leading-relaxed mb-8">
              Securing trustless multi-agent operations across distributed peer layers with zero knowledge computation wrappers.
            </p>
          </div>
        </section>

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

