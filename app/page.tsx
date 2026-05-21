import { AtlasHeadSceneWrapper } from '@/src/components/3d/AtlasHeadSceneWrapper';
import { Navbar } from '@/src/components/Navbar';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Multi-Agent Research — AI-Powered Research Platform',
  description: 'Harness the power of multiple AI agents working together to accelerate your research.',
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
      <div id="page-content" className="relative z-10 w-full max-w-[1200px] mx-auto px-8">
        
        {/* SECTION 1: HERO */}
        <section className="min-h-screen flex flex-col justify-center bg-transparent pointer-events-none relative">
          <div className="max-w-[600px] pointer-events-auto">
            <span className="inline-block px-4 py-2 rounded-full bg-violet-600/10 border border-violet-600/20 text-[#7c3aed] text-[12px] font-semibold tracking-widest uppercase mb-6 backdrop-blur-md">
              Atlas System / Active
            </span>
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold leading-[1.1] tracking-tight bg-gradient-to-b from-gray-900 to-gray-600 bg-clip-text text-transparent mb-4">
              Architecting<br />Cognitive Frontiers
            </h1>
            <p className="text-base sm:text-lg lg:text-xl text-gray-700 leading-relaxed mb-8">
              Deploying autonomous multi-agent pipelines powered by decentralised hyper-graphs and real-time neural alignment.
            </p>
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
