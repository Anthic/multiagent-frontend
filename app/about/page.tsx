'use client';

import { useState } from 'react';
import { Navbar } from '@/src/components/Navbar';
import { TransitionLink } from '@/src/components/TransitionLink';
import { motion } from 'framer-motion';

export default function AboutPage() {
  const [activeAgentTab, setActiveAgentTab] = useState<number>(0);

  // Stats cards metadata
  const stats = [
    { value: 'Statistics', label: 'Academic Foundation', desc: 'MBSTU Statistics Graduate' },
    { value: 'Full Stack', label: 'AI Driven System', desc: 'NextJS, NodeJS, FastAPI & Python' },
    { value: '6+', label: 'Autonomous Agents', desc: 'Working in absolute sync' },
    { value: '100%', label: 'Fact-Check Engine', desc: 'Claim-to-source integrity validation' },
  ];

  // Agent workflow nodes
  const agents = [
    {
      title: 'Query Rewriter Agent',
      icon: 'ðŸ§ ',
      role: 'Statistical expansion & target alignment',
      desc: 'Takes the raw research prompt and expands it into multiple optimized, statistically rich search queries. It filters out ambiguity and structures queries to harvest the highest density of relevant results.',
    },
    {
      title: 'Searcher Agent',
      icon: 'ðŸŒ',
      role: 'Cross-origin telemetry harvesting',
      desc: 'Executes parallel searches across the web, fetching raw results from trusted scientific journals, verified databases, and official publications. Powered by statistical relevancy indexing.',
    },
    {
      title: 'Reader & Scraper Agent',
      icon: 'ðŸ“–',
      role: 'Semantic text parsing & noise filtration',
      desc: 'Scrapes live web content, cleans HTML fluff, and extracts deep semantic context. It isolates target knowledge and structures raw text into cohesive information vectors.',
    },
    {
      title: 'Fact-Checking Agent',
      icon: 'ðŸ›¡ï¸',
      role: 'Claim validation & source cross-referencing',
      desc: 'Acts as the ultimate truth gatekeeper. It cross-checks parsed data against verified medical and scientific publications to assign a precise Fact-Check Trust Percentage.',
    },
    {
      title: 'Critique & Grading Agent',
      icon: 'ðŸ“Š',
      role: 'Strict quality assurance grading',
      desc: 'Grades the accumulated research according to rigorous statistical criteria. Evaluates the depth, source variety, and factual alignment, outputting a precise 0-10 Quality score.',
    },
    {
      title: 'Writer & Synthesis Agent',
      icon: 'âœï¸',
      role: 'Academic markdown generation',
      desc: 'Synthesizes the finalized, grade-verified data into a comprehensive, beautifully structured research workspace report. Complete with proper source citations and formatting.',
    },
  ];

  return (
    <main
      className="min-h-screen relative overflow-hidden pb-24"
      style={{
        backgroundColor: '#f5f0e8',
        backgroundImage: 'linear-gradient(135deg, #f5f0e8 0%, #ede8d8 100%)',
        color: '#1a1a1a',
      }}
    >
      <Navbar />

      {/* Decorative background glows */}
      <div className="absolute top-[-10%] left-[-15%] size-[60vw] rounded-full bg-emerald-100/30 blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-15%] size-[60vw] rounded-full bg-amber-100/30 blur-[130px] pointer-events-none" />

      <div className="relative z-10 w-11/12 max-w-7xl mx-auto pt-32">
        
        {/* Title / Hero section */}
        <div className="max-w-3xl mb-16">
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-800/10 border border-emerald-800/20 text-emerald-800 text-[10px] font-bold tracking-[0.2em] uppercase mb-4 backdrop-blur-md">
            <span className="size-1.5 rounded-full bg-[#059669]" />
            Deep Tech Intelligence Platform
          </span>
          <h1 className="font-metamorphous text-4xl sm:text-5xl lg:text-6xl font-light text-[#11100d] leading-none tracking-tight">
            Introducing <span className="font-semibold text-emerald-800">atlash.ai</span><br />
            Next-Gen <span className="font-semibold text-purple-800">AI-Driven</span> Research
          </h1>
          <p className="font-roboto text-base text-black/60 mt-6 max-w-2xl leading-relaxed">
            Welcome to the ultimate state-of-the-art AI-driven workspace. <strong>atlash.ai</strong> combines mathematical modeling, statistical sampling principles, and LangGraph-based multi-agent networks to deliver extremely reliable, deeply synthesized academic and clinical research reports.
          </p>
        </div>

        {/* Profile Section: Anthic */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 mb-24 items-center">
          
          {/* Picture Box */}
          <div className="lg:col-span-5 flex justify-center">
            <motion.div 
              whileHover={{ scale: 1.02, rotate: 1 }}
              className="relative w-full max-w-[380px] aspect-[4/5] rounded-[36px] overflow-hidden border-2 border-white shadow-[0_30px_70px_rgba(0,0,0,0.12)] bg-[#ede8d8] p-3"
            >
              <div className="w-full h-full rounded-[28px] overflow-hidden relative group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src="/about us.jpeg" 
                  alt="Anthic - Founder & Full Stack AI Developer"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                  <span className="font-mono text-[9px] uppercase tracking-widest text-[#AAFFC7] font-bold">Founder Profile</span>
                  <h4 className="font-metamorphous text-white text-lg font-bold">Anthic</h4>
                  <p className="font-roboto text-white/70 text-xs mt-1">Full Stack AI Developer</p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Description Box */}
          <div className="lg:col-span-7">
            <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-[#047857]/80 font-bold block mb-3">Meet the Architect</span>
            <h2 className="font-metamorphous text-3xl sm:text-4xl font-bold text-[#11100d] mb-6">
              Anthic
            </h2>
            <div className="font-roboto text-sm text-black/70 space-y-4 leading-relaxed">
              <p>
                Hello, I am <strong>Anthic</strong>, the <strong>Full Stack AI Developer</strong> behind <strong>atlash.ai</strong>. I graduated with a degree in <strong>Statistics</strong> from the esteemed <strong>Mawlana Bhashani Science and Technology University (MBSTU)</strong>. 
              </p>
              <p>
                My background in statistics shaped my perspective on AI validation. In a world saturated with AI hallucinations, raw generation is not enough. Leveraging confidence intervals, data parsing distributions, and truth-integrity metrics, I designed <strong>atlash.ai</strong> as a completely AI-driven autonomous pipeline that prioritizes rigorous factual assessment.
              </p>
              <p>
                By combining statistics with premium full stack development, I engineered <strong>atlash.ai</strong> to act as an advanced digital research laboratory. By assigning multiple specialized agent personas, evaluating cross-reference claim trust percentages, and running detailed critiques, it maps out a transparent, bias-free information registry. 
              </p>
            </div>

            {/* Contact details row */}
            <div className="mt-6 pt-6 border-t border-black/5 flex flex-col sm:flex-row gap-4 sm:gap-8 font-mono text-[11px] text-black/60">
              <a 
                href="mailto:anthickumarsingh2@gmail.com" 
                className="flex items-center gap-2 hover:text-emerald-800 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="size-4 text-emerald-800/80">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                </svg>
                anthickumarsingh2@gmail.com
              </a>
              <a 
                href="tel:+8801717182035" 
                className="flex items-center gap-2 hover:text-emerald-800 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="size-4 text-emerald-800/80">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.622c0-1.03.945-1.74 1.983-1.428l2.235.67a1.5 1.5 0 0 1 1.012 1.344v.952c0 .548-.444.992-.992.992H5.161c-.55 0-1 .45-1 1v.082c0 .248.016.495.048.74c.241 1.834 1.036 3.518 2.203 4.908l.004.005a9.018 9.018 0 0 0 3.256 2.502l.005.003c.516.24 1.074.364 1.644.364h.016c.55 0 1-.45 1-1v-1.124A1.5 1.5 0 0 1 14.887 13.9l.67-.223a1.5 1.5 0 0 1 1.344 1.012v.952c0 .548-.444.992-.992.992h-.082a9.006 9.006 0 0 1-5.18-2.203 9.003 9.003 0 0 1-2.203-5.18v-.082c0-.548.444-.992.992-.992h.952c.548 0 .992-.444.992-.992V8.21a1.5 1.5 0 0 1 1.012-1.344l2.235-.67a1.5 1.5 0 0 1 1.983 1.428V7.5a9 9 0 0 1-9 9h-.5a9 9 0 0 1-9-9v-.878Z" />
                </svg>
                +8801717182035
              </a>
            </div>
            
            <div className="mt-8 flex gap-4">
              <TransitionLink
                href="/research"
                className="bg-black text-[#AAFFC7] font-bold uppercase tracking-wider text-xs px-6 py-3.5 rounded-full hover:scale-105 transition-transform duration-300"
              >
                Start Researching
              </TransitionLink>
              <TransitionLink
                href="/dashboard"
                className="bg-white/60 text-black border border-black/10 font-bold uppercase tracking-wider text-xs px-6 py-3.5 rounded-full hover:bg-white/80 transition-all"
              >
                Control Center
              </TransitionLink>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-24">
          {stats.map((s, idx) => (
            <div 
              key={idx} 
              className="bg-white/40 backdrop-blur-xl border border-black/10 rounded-3xl p-6 shadow-[0_15px_40px_rgba(0,0,0,0.02)] flex flex-col justify-between hover:border-emerald-800/20 transition-colors"
            >
              <span className="font-mono text-[9px] uppercase tracking-widest text-black/45 font-bold block mb-4">{s.label}</span>
              <div>
                <span className="font-metamorphous text-2xl sm:text-3xl font-extrabold text-emerald-950 block">{s.value}</span>
                <span className="text-xs text-black/55 mt-1 block">{s.desc}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Full Stack Deep Tech Details */}
        <div className="bg-white/40 backdrop-blur-xl border border-black/10 rounded-[32px] p-6 sm:p-8 mb-16 shadow-[0_25px_60px_rgba(0,0,0,0.04)] relative">
          <div className="max-w-2xl mb-8">
            <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-[#047857]/80 font-bold block mb-2">Technical Architecture</span>
            <h2 className="font-metamorphous text-2xl sm:text-3xl font-bold text-[#11100d]">
              High-Performance Full Stack Stack
            </h2>
            <p className="font-roboto text-xs text-black/55 mt-2 leading-relaxed">
              <strong>atlash.ai</strong> is engineered from the ground up to support massive, concurrent stateful research runs using modern web architectures:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 font-roboto">
            <div className="p-6 bg-[#f7f5ef]/60 border border-black/5 rounded-2xl flex flex-col justify-between shadow-sm">
              <div>
                <span className="font-mono text-[10px] text-emerald-800 font-bold tracking-wider">FRONTEND</span>
                <h4 className="font-metamorphous text-sm font-bold uppercase tracking-wider text-black/85 mt-2">NextJS & React 19</h4>
                <p className="text-xs text-black/60 mt-2 leading-relaxed">
                  A premium, high-fidelity responsive user interface featuring glassmorphic components, real-time SVG telemetry visualizers, and stateful layouts.
                </p>
              </div>
              <span className="text-emerald-800 text-xs font-mono font-bold mt-4">Client Interface</span>
            </div>

            <div className="p-6 bg-[#f7f5ef]/60 border border-black/5 rounded-2xl flex flex-col justify-between shadow-sm">
              <div>
                <span className="font-mono text-[10px] text-purple-800 font-bold tracking-wider">GATEWAY API</span>
                <h4 className="font-metamorphous text-sm font-bold uppercase tracking-wider text-black/85 mt-2">NodeJS & Express</h4>
                <p className="text-xs text-black/60 mt-2 leading-relaxed">
                  Serves as the high-availability security layer, managing JWT session security, CSRF protection, and strictly fenced multi-tenant data structures.
                </p>
              </div>
              <span className="text-purple-800 text-xs font-mono font-bold mt-4">Secure Middleware</span>
            </div>

            <div className="p-6 bg-[#f7f5ef]/60 border border-black/5 rounded-2xl flex flex-col justify-between shadow-sm">
              <div>
                <span className="font-mono text-[10px] text-amber-800 font-bold tracking-wider">ORCHESTRATION</span>
                <h4 className="font-metamorphous text-sm font-bold uppercase tracking-wider text-black/85 mt-2">Python FastAPI & LangGraph</h4>
                <p className="text-xs text-black/60 mt-2 leading-relaxed">
                  The brain of the system, managing a stateful multi-agent consensus pool. Conducts web search, text scraping, fact-checking, and critiques in parallel.
                </p>
              </div>
              <span className="text-amber-800 text-xs font-mono font-bold mt-4">Autonomous Brain</span>
            </div>

            <div className="p-6 bg-[#f7f5ef]/60 border border-black/5 rounded-2xl flex flex-col justify-between shadow-sm">
              <div>
                <span className="font-mono text-[10px] text-blue-800 font-bold tracking-wider">PERSISTENCE</span>
                <h4 className="font-metamorphous text-sm font-bold uppercase tracking-wider text-black/85 mt-2">MongoDB & Prisma</h4>
                <p className="text-xs text-black/60 mt-2 leading-relaxed">
                  Deep research history, user dashboards, and structured diagnostics are securely persisted using optimized document schemas and strict relations.
                </p>
              </div>
              <span className="text-blue-800 text-xs font-mono font-bold mt-4">Type-safe ORM</span>
            </div>

            <div className="p-6 bg-[#f7f5ef]/60 border border-black/5 rounded-2xl flex flex-col justify-between shadow-sm">
              <div>
                <span className="font-mono text-[10px] text-rose-800 font-bold tracking-wider">CACHING</span>
                <h4 className="font-metamorphous text-sm font-bold uppercase tracking-wider text-black/85 mt-2">Redis & Upstash</h4>
                <p className="text-xs text-black/60 mt-2 leading-relaxed">
                  Guarantees lightning-fast page loading and immediate analytics retrievals through highly optimized key-value caches and query hit-rate indexes.
                </p>
              </div>
              <span className="text-rose-800 text-xs font-mono font-bold mt-4">Key-Value Store</span>
            </div>

            <div className="p-6 bg-[#f7f5ef]/60 border border-black/5 rounded-2xl flex flex-col justify-between shadow-sm">
              <div>
                <span className="font-mono text-[10px] text-[#059669] font-bold tracking-wider">VALIDATION</span>
                <h4 className="font-metamorphous text-sm font-bold uppercase tracking-wider text-black/85 mt-2">Statistical Integrity</h4>
                <p className="text-xs text-black/60 mt-2 leading-relaxed">
                  Statistical confidence scores are mapped onto all research pipelines, computing reliability margins and filtering out hallucinated links.
                </p>
              </div>
              <span className="text-[#059669] text-xs font-mono font-bold mt-4">95%+ Trust</span>
            </div>
          </div>
        </div>

        {/* Workflow visualizer Section */}
        <div className="bg-white/40 backdrop-blur-xl border border-black/10 rounded-[32px] p-6 sm:p-8 mb-16 shadow-[0_25px_60px_rgba(0,0,0,0.04)] relative">
          <div className="max-w-2xl mb-10">
            <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-purple-800 font-bold block mb-2">Workflow Process</span>
            <h2 className="font-metamorphous text-2xl sm:text-3xl font-bold text-[#11100d]">
              Agent Network Orchestration
            </h2>
            <p className="font-roboto text-xs text-black/55 mt-2 leading-relaxed">
              Our LangGraph pipeline manages 6 distinct agents running asynchronously. Select an agent node below to inspect its detailed algorithmic function:
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            {/* Sidebar list of agents */}
            <div className="lg:col-span-5 flex flex-col gap-2">
              {agents.map((a, idx) => (
                <button
                  type="button"
                  key={a.title}
                  onClick={() => setActiveAgentTab(idx)}
                  className={`w-full text-left p-4 rounded-2xl border transition-all flex items-center gap-4 group cursor-pointer ${
                    activeAgentTab === idx
                      ? 'bg-emerald-800 border-emerald-900 text-white shadow-md'
                      : 'bg-white/40 border-black/5 text-black/75 hover:bg-white/70'
                  }`}
                >
                  <span className="text-2xl">{a.icon}</span>
                  <div>
                    <h4 className="font-metamorphous text-xs font-bold uppercase tracking-wider group-hover:translate-x-1 transition-transform">
                      {a.title}
                    </h4>
                    <span className={`text-[10px] ${activeAgentTab === idx ? 'text-white/70' : 'text-black/45'} font-mono block mt-0.5`}>
                      Node {idx + 1}
                    </span>
                  </div>
                </button>
              ))}
            </div>

            {/* Focused detailed agent panel */}
            <div className="lg:col-span-7 bg-[#f7f5ef]/60 rounded-3xl border border-black/5 p-6 sm:p-8 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-4 mb-6">
                  <span className="text-5xl p-4 bg-emerald-800/10 rounded-2xl text-emerald-800">
                    {agents[activeAgentTab].icon}
                  </span>
                  <div>
                    <span className="font-mono text-[9px] uppercase tracking-widest text-emerald-800 font-bold">
                      Autonomous Node {activeAgentTab + 1}
                    </span>
                    <h3 className="font-metamorphous text-xl sm:text-2xl font-bold text-[#11100d] mt-1">
                      {agents[activeAgentTab].title}
                    </h3>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-black/45 block">Primary Role:</span>
                    <span className="font-roboto text-sm font-semibold text-emerald-900 block mt-1">
                      {agents[activeAgentTab].role}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-black/45 block">Technical Description:</span>
                    <p className="font-roboto text-xs text-black/60 mt-1.5 leading-relaxed">
                      {agents[activeAgentTab].desc}
                    </p>
                  </div>
                </div>
              </div>

              {/* Progress visual bar */}
              <div className="mt-8 pt-6 border-t border-black/5 flex items-center justify-between gap-4">
                <span className="font-mono text-[9px] uppercase tracking-wider text-black/45">
                  Pipeline Stage
                </span>
                <div className="flex gap-1">
                  {agents.map((_, idx) => (
                    <div 
                      key={idx} 
                      className={`h-1.5 w-6 rounded-full transition-all duration-300 ${
                        idx <= activeAgentTab ? 'bg-emerald-800' : 'bg-black/10'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer encouragement */}
        <div className="text-center py-6">
          <div className="h-px bg-black/10 w-40 mx-auto" />
        </div>

      </div>
    </main>
  );
}
