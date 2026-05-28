'use client';

import { useState, useEffect } from 'react';
import { Navbar } from '@/src/components/Navbar';
import { ResearchService } from '@/src/services/researchService';
import { useUser, useIsAuthenticated } from '@/src/store/authStore';
import { Job } from '@/src/types/research';
import { TransitionLink } from '@/src/components/TransitionLink';

export default function DashboardPage() {
  const user = useUser();
  const isAuthenticated = useIsAuthenticated();
  
  const [history, setHistory] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeMetric, setActiveMetric] = useState<'quality' | 'factCheck' | 'duration'>('quality');
  const [hoveredPoint, setHoveredPoint] = useState<any>(null);

  useEffect(() => {
    async function fetchHistory() {
      try {
        const res = await ResearchService.getHistory(50);
        if (res.success && res.data) {
          setHistory(res.data.records || []);
        }
      } catch (err) {
        console.error('Failed to load history:', err);
      } finally {
        setLoading(false);
      }
    }
    if (isAuthenticated) {
      fetchHistory();
    }
  }, [isAuthenticated]);

  // Calculate statistics
  const totalReports = history.length;
  const completedReports = history.filter((h) => h.result);
  
  const avgCritique = completedReports.length > 0
    ? (completedReports.reduce((acc, h) => acc + (h.result?.critique_score || 0), 0) / completedReports.length).toFixed(1)
    : '0.0';

  const avgFactCheck = completedReports.length > 0
    ? (completedReports.reduce((acc, h) => acc + (h.result?.fact_check_score || 0) * 100, 0) / completedReports.length).toFixed(0)
    : '0';

  const avgTime = completedReports.length > 0
    ? (completedReports.reduce((acc, h) => acc + (h.result?.time_sec || 0), 0) / completedReports.length).toFixed(0)
    : '0';

  // Filter history based on search query
  const filteredHistory = history.filter((h) => {
    const topic = h.result?.topic || '';
    return topic.toLowerCase().includes(searchQuery.toLowerCase());
  });

  // Mock telemetry for empty-state preview
  const mockTelemetry = [
    { label: 'Run 1', topic: 'Quantum Machine Learning Trends', quality: 5.5, factCheck: 65, duration: 85, date: 'May 20' },
    { label: 'Run 2', topic: 'Carbon Capture Efficiency Analysis', quality: 6.8, factCheck: 78, duration: 110, date: 'May 22' },
    { label: 'Run 3', topic: 'Deep Learning in Breast Cancer Prediction', quality: 7.2, factCheck: 95, duration: 75, date: 'May 25' },
    { label: 'Run 4', topic: 'Mental Health & Climate Stress Factors', quality: 6.0, factCheck: 85, duration: 64, date: 'May 27' },
    { label: 'Run 5', topic: 'AI Agent Architectures in 2026', quality: 8.5, factCheck: 92, duration: 98, date: 'May 28' },
  ];

  const activeData = completedReports.length > 0
    ? [...completedReports].reverse().map((h, idx) => ({
        label: `Run ${idx + 1}`,
        topic: h.result?.topic || 'Untitled Run',
        quality: h.result?.critique_score || 0,
        factCheck: (h.result?.fact_check_score || 0) * 100,
        duration: h.result?.time_sec || 0,
        date: new Date(h.created_at * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      }))
    : mockTelemetry;

  const isMock = completedReports.length === 0;

  // Max value calculation for scaling the graph properly
  let maxVal = 10;
  if (activeMetric === 'factCheck') maxVal = 100;
  else if (activeMetric === 'duration') {
    const maxDur = Math.max(...activeData.map((d) => d.duration));
    maxVal = maxDur > 60 ? maxDur * 1.15 : 120;
  }

  // Calculate coordinates for graph nodes
  const points = activeData.map((d, idx) => {
    const val = activeMetric === 'quality' ? d.quality : activeMetric === 'factCheck' ? d.factCheck : d.duration;
    const x = 55 + (idx * (890 / Math.max(1, activeData.length - 1)));
    const y = 250 - (val * (200 / maxVal));
    return { x, y, data: d, val };
  });

  // Construct SVG paths
  let linePath = '';
  let areaPath = '';
  if (points.length > 0) {
    linePath = `M ${points[0].x} ${points[0].y} ` + points.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ');
    areaPath = `${linePath} L ${points[points.length - 1].x} 250 L ${points[0].x} 250 Z`;
  }

  // Determine theme colors based on active tab
  const getThemeColors = () => {
    switch (activeMetric) {
      case 'factCheck':
        return {
          stroke: '#7C3AED',
          fillUrl: 'url(#gradient-purple)',
          dotBg: '#8B5CF6',
          shadow: 'rgba(124,58,237,0.2)',
          accent: 'purple',
        };
      case 'duration':
        return {
          stroke: '#D97706',
          fillUrl: 'url(#gradient-amber)',
          dotBg: '#F59E0B',
          shadow: 'rgba(217,119,6,0.2)',
          accent: 'amber',
        };
      default:
        return {
          stroke: '#059669',
          fillUrl: 'url(#gradient-emerald)',
          dotBg: '#10B981',
          shadow: 'rgba(5,150,105,0.2)',
          accent: 'emerald',
        };
    }
  };

  const theme = getThemeColors();

  return (
    <main
      className="min-h-screen relative overflow-hidden pb-16"
      style={{
        backgroundColor: '#f5f0e8',
        backgroundImage: 'linear-gradient(135deg, #f5f0e8 0%, #ede8d8 100%)',
        color: '#1a1a1a',
      }}
    >
      <Navbar />

      {/* Decorative background glow elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-emerald-100/30 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-amber-100/30 blur-[120px] pointer-events-none" />

      <div className="relative z-10 w-11/12 max-w-7xl mx-auto pt-32">
        {/* Header section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/5 border border-black/10 text-black/60 text-[10px] font-bold tracking-[0.2em] uppercase mb-4 backdrop-blur-md">
              <span className="h-1.5 w-1.5 rounded-full bg-[#34D399]" />
              Researcher Control Hub
            </span>
            <h1 className="font-metamorphous text-4xl sm:text-5xl lg:text-6xl font-light text-[#11100d] leading-none tracking-tight">
              Welcome back,<br />
              <span className="font-semibold text-emerald-800">{user?.name || user?.email?.split('@')[0] || 'Researcher'}</span>
            </h1>
            <p className="font-roboto text-sm text-black/60 mt-3 max-w-[500px]">
              Access your previous deep multi-agent research logs, quality diagnostics, and run new analysis runs.
            </p>
          </div>

          <TransitionLink
            href="/research"
            className="group relative inline-flex items-center gap-3 overflow-hidden rounded-full bg-gradient-to-r from-black via-[#191919] to-[#3a3a3a] px-6 py-3.5 text-xs font-bold uppercase tracking-[0.18em] text-white shadow-[0_15px_35px_rgba(0,0,0,0.15)] transition-transform duration-300 hover:-translate-y-0.5"
          >
            <span>New Research Run</span>
            <span className="relative flex h-6 w-6 items-center justify-center rounded-full bg-[#AAFFC7] text-black transition-transform duration-300 group-hover:translate-x-1">
              &gt;
            </span>
          </TransitionLink>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          {/* Card 1 */}
          <div className="bg-white/40 backdrop-blur-xl border border-black/10 rounded-3xl p-6 shadow-[0_15px_40px_rgba(0,0,0,0.02)] flex flex-col justify-between">
            <span className="font-mono text-[10px] uppercase tracking-widest text-black/45 font-bold block mb-4">Total Reports</span>
            <div>
              <span className="font-metamorphous text-4xl sm:text-5xl font-extrabold text-black/90">{totalReports}</span>
              <span className="text-xs text-black/45 font-mono ml-2">queries</span>
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-white/40 backdrop-blur-xl border border-black/10 rounded-3xl p-6 shadow-[0_15px_40px_rgba(0,0,0,0.02)] flex flex-col justify-between">
            <span className="font-mono text-[10px] uppercase tracking-widest text-black/45 font-bold block mb-4">Avg Quality Score</span>
            <div>
              <span className="font-metamorphous text-4xl sm:text-5xl font-extrabold text-emerald-800">{avgCritique}</span>
              <span className="text-xs text-[#047857] font-semibold bg-emerald-100/50 px-2 py-0.5 rounded-full ml-2">/10</span>
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-white/40 backdrop-blur-xl border border-black/10 rounded-3xl p-6 shadow-[0_15px_40px_rgba(0,0,0,0.02)] flex flex-col justify-between">
            <span className="font-mono text-[10px] uppercase tracking-widest text-black/45 font-bold block mb-4">Avg Fact Check</span>
            <div>
              <span className="font-metamorphous text-4xl sm:text-5xl font-extrabold text-purple-800">{avgFactCheck}%</span>
              <span className="text-xs text-purple-800/60 font-mono ml-2">trust</span>
            </div>
          </div>

          {/* Card 4 */}
          <div className="bg-white/40 backdrop-blur-xl border border-black/10 rounded-3xl p-6 shadow-[0_15px_40px_rgba(0,0,0,0.02)] flex flex-col justify-between">
            <span className="font-mono text-[10px] uppercase tracking-widest text-black/45 font-bold block mb-4">Avg Pipeline Run</span>
            <div>
              <span className="font-metamorphous text-4xl sm:text-5xl font-extrabold text-amber-800">{avgTime}s</span>
              <span className="text-xs text-black/45 font-mono ml-2">speed</span>
            </div>
          </div>
        </div>

        {/* Visual Analytics telemetry Graph */}
        <div className="bg-white/40 backdrop-blur-xl border border-black/10 rounded-[32px] p-6 sm:p-8 mb-12 shadow-[0_25px_60px_rgba(0,0,0,0.04)] relative overflow-hidden">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
            <div>
              <h3 className="font-metamorphous text-xl font-bold text-[#11100d] flex items-center gap-2">
                <span>Research Quality Telemetry</span>
                {isMock && (
                  <span className="text-[9px] font-mono font-bold tracking-widest uppercase bg-amber-500/20 text-amber-800 border border-amber-500/30 px-2 py-0.5 rounded-full">
                    Demo Mode Preview
                  </span>
                )}
              </h3>
              <p className="font-roboto text-xs text-black/50 mt-1">
                {isMock 
                  ? "Awaiting research runs. Showing demo trend of your future workspace diagnostics."
                  : "Interactive timeline tracking quality scores and agent performance criteria."}
              </p>
            </div>

            {/* Selector tabs */}
            <div className="flex bg-black/5 p-1 rounded-full border border-black/10 backdrop-blur-md">
              <button
                onClick={() => setActiveMetric('quality')}
                className={`px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all ${
                  activeMetric === 'quality'
                    ? 'bg-emerald-800 text-white shadow-sm'
                    : 'text-black/60 hover:text-black'
                }`}
              >
                Quality Score
              </button>
              <button
                onClick={() => setActiveMetric('factCheck')}
                className={`px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all ${
                  activeMetric === 'factCheck'
                    ? 'bg-purple-800 text-white shadow-sm'
                    : 'text-black/60 hover:text-black'
                }`}
              >
                Fact Trust
              </button>
              <button
                onClick={() => setActiveMetric('duration')}
                className={`px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all ${
                  activeMetric === 'duration'
                    ? 'bg-amber-800 text-white shadow-sm'
                    : 'text-black/60 hover:text-black'
                }`}
              >
                Pipeline Speed
              </button>
            </div>
          </div>

          {/* SVG Graph rendering */}
          <div className="relative w-full overflow-hidden mt-6 bg-[#f7f5ef]/40 rounded-2xl border border-black/5 p-4">
            <svg
              viewBox="0 0 1000 300"
              className="w-full h-auto overflow-visible select-none"
            >
              {/* Defs for premium gradients */}
              <defs>
                <linearGradient id="gradient-emerald" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10B981" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#10B981" stopOpacity="0.0" />
                </linearGradient>
                <linearGradient id="gradient-purple" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.0" />
                </linearGradient>
                <linearGradient id="gradient-amber" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#F59E0B" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
                const y = 50 + ratio * 200;
                const value = ((1 - ratio) * maxVal).toFixed(activeMetric === 'quality' ? 1 : 0);
                return (
                  <g key={idx} className="opacity-40">
                    <line
                      x1="55"
                      y1={y}
                      x2="945"
                      y2={y}
                      stroke="#1a1a1a"
                      strokeOpacity="0.08"
                      strokeDasharray="4 4"
                    />
                    <text
                      x="40"
                      y={y + 4}
                      fill="#1a1a1a"
                      fillOpacity="0.45"
                      className="font-mono text-[9px] text-right font-bold"
                      textAnchor="end"
                    >
                      {value}
                      {activeMetric === 'factCheck' ? '%' : activeMetric === 'duration' ? 's' : ''}
                    </text>
                  </g>
                );
              })}

              {/* Graph Lines and Area */}
              {points.length > 1 && (
                <>
                  {/* Filled Area */}
                  <path
                    d={areaPath}
                    fill={theme.fillUrl}
                    className="transition-all duration-500 ease-in-out"
                  />
                  {/* Line stroke */}
                  <path
                    d={linePath}
                    fill="none"
                    stroke={theme.stroke}
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="transition-all duration-500 ease-in-out filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.04)]"
                  />
                </>
              )}

              {/* Data points */}
              {points.map((p, idx) => {
                const isHovered = hoveredPoint?.idx === idx;
                return (
                  <g
                    key={idx}
                    onMouseEnter={() => setHoveredPoint({ ...p.data, x: p.x, y: p.y, val: p.val, idx })}
                    onMouseLeave={() => setHoveredPoint(null)}
                    className="cursor-pointer"
                  >
                    {/* Hover glow ring */}
                    <circle
                      cx={p.x}
                      cy={p.y}
                      r={isHovered ? 12 : 6}
                      fill={theme.stroke}
                      fillOpacity={isHovered ? 0.15 : 0}
                      className="transition-all duration-200"
                    />
                    {/* Core node */}
                    <circle
                      cx={p.x}
                      cy={p.y}
                      r={isHovered ? 5.5 : 4}
                      fill={theme.dotBg}
                      stroke="#f7f5ef"
                      strokeWidth="1.5"
                      className="transition-all duration-200 shadow-sm"
                    />
                    {/* X Axis Labels */}
                    <text
                      x={p.x}
                      y="275"
                      fill="#1a1a1a"
                      fillOpacity="0.4"
                      className="font-mono text-[9px] font-bold"
                      textAnchor="middle"
                    >
                      {p.data.label}
                    </text>
                  </g>
                );
              })}
            </svg>



            {/* Interactive Tooltip Overlay */}
            {hoveredPoint && (
              <div
                className="absolute z-20 bg-black/90 backdrop-blur-md border border-white/10 rounded-2xl p-4 text-white text-xs shadow-xl pointer-events-none w-64 transition-all duration-150"
                style={{
                  left: `${(hoveredPoint.x / 1000) * 100}%`,
                  top: `${(hoveredPoint.y / 300) * 100 - 45}%`,
                  transform: 'translate(-50%, -100%)',
                }}
              >
                <div className="flex justify-between items-center mb-1.5">
                  <span className="font-mono text-[9px] uppercase tracking-widest text-emerald-400 font-bold">
                    {hoveredPoint.label}
                  </span>
                  <span className="font-mono text-[9px] text-white/55">
                    {hoveredPoint.date}
                  </span>
                </div>
                <p className="font-roboto font-bold text-[11px] truncate mb-2 text-white/95">
                  {hoveredPoint.topic}
                </p>
                <div className="border-t border-white/10 pt-2 flex justify-between items-center">
                  <span className="font-roboto text-[10px] text-white/60">
                    {activeMetric === 'quality'
                      ? 'Quality Index:'
                      : activeMetric === 'factCheck'
                      ? 'Fact Check trust:'
                      : 'Execution Speed:'}
                  </span>
                  <span className="font-mono font-bold text-white text-[11px]">
                    {activeMetric === 'quality'
                      ? `${hoveredPoint.val.toFixed(1)}/10`
                      : activeMetric === 'factCheck'
                      ? `${hoveredPoint.val.toFixed(0)}%`
                      : `${hoveredPoint.val.toFixed(1)}s`}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Search & Main List Section */}
        <div className="bg-white/40 backdrop-blur-xl border border-black/10 rounded-[32px] p-6 sm:p-8 shadow-[0_25px_60px_rgba(0,0,0,0.04)]">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
            <h2 className="font-metamorphous text-2xl font-bold text-[#11100d] self-start sm:self-center">
              Research History Registry
            </h2>
            <div className="relative w-full sm:w-80">
              <input
                type="text"
                placeholder="Search past research topics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/50 border border-black/10 rounded-full px-5 py-2.5 text-sm focus:outline-none focus:border-emerald-600/50 focus:ring-1 focus:ring-emerald-600/20 backdrop-blur-md transition-all font-roboto"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-black/30 text-xs pointer-events-none">
                🔍
              </span>
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-black/45">
              <div className="w-10 h-10 border-4 border-emerald-600/30 border-t-emerald-600 rounded-full animate-spin mb-4" />
              <span className="font-mono text-xs tracking-widest uppercase">Decrypted cache register...</span>
            </div>
          ) : filteredHistory.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <span className="text-5xl mb-4">🧭</span>
              <h3 className="font-metamorphous text-xl font-bold text-black/80 mb-2">No Records Found</h3>
              <p className="font-roboto text-sm text-black/50 max-w-sm mb-6">
                {searchQuery
                  ? "We couldn't find any completed analysis sessions matching your query. Try a different term!"
                  : "You haven't initiated any deep agentic research campaigns yet. Launch a workspace to begin!"}
              </p>
              {!searchQuery && (
                <TransitionLink
                  href="/research"
                  className="bg-black text-[#AAFFC7] font-bold uppercase tracking-wider text-xs px-6 py-3 rounded-full hover:scale-105 transition-transform duration-300"
                >
                  Launch First Workspace
                </TransitionLink>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-black/10">
                    <th className="pb-4 font-mono text-[10px] uppercase tracking-widest text-black/45 font-bold">Research Topic</th>
                    <th className="pb-4 font-mono text-[10px] uppercase tracking-widest text-black/45 font-bold text-center">Quality</th>
                    <th className="pb-4 font-mono text-[10px] uppercase tracking-widest text-black/45 font-bold text-center">Fact Check</th>
                    <th className="pb-4 font-mono text-[10px] uppercase tracking-widest text-black/45 font-bold text-center">Duration</th>
                    <th className="pb-4 font-mono text-[10px] uppercase tracking-widest text-black/45 font-bold text-right">Run Time</th>
                    <th className="pb-4 font-mono text-[10px] uppercase tracking-widest text-black/45 font-bold text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredHistory.map((job) => {
                    const topic = job.result?.topic || 'Untitled Research Query';
                    const critiqueScore = job.result?.critique_score || 0;
                    const factCheckScore = job.result?.fact_check_score || 0;
                    const timeSec = job.result?.time_sec || 0;
                    const date = new Date(job.created_at * 1000).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    });

                    return (
                      <tr key={job.job_id} className="border-b border-black/5 hover:bg-black/[0.01] transition-colors group">
                        <td className="py-4 pr-4">
                          <span className="font-roboto font-semibold text-black/85 block max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl truncate group-hover:text-emerald-900 transition-colors">
                            {topic}
                          </span>
                          <span className="text-[10px] font-mono text-black/40 block mt-1">
                            JOB_ID: {job.job_id}
                          </span>
                        </td>
                        <td className="py-4 text-center">
                          <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100/60 text-emerald-800 border border-emerald-200/50">
                            {critiqueScore.toFixed(1)}/10
                          </span>
                        </td>
                        <td className="py-4 text-center">
                          <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-100/60 text-purple-800 border border-purple-200/50">
                            {(factCheckScore * 100).toFixed(0)}%
                          </span>
                        </td>
                        <td className="py-4 text-center font-mono text-xs text-black/70">
                          {timeSec.toFixed(1)}s
                        </td>
                        <td className="py-4 text-right font-mono text-xs text-black/50">
                          {date}
                        </td>
                        <td className="py-4 text-right">
                          <TransitionLink
                            href={`/research?jobId=${job.job_id}`}
                            className="inline-flex items-center justify-center px-4 py-2 rounded-full text-xs font-bold bg-[#AAFFC7] text-black border border-[#AAFFC7]/80 hover:bg-emerald-600 hover:text-white transition-all cursor-pointer shadow-sm hover:scale-[1.03]"
                          >
                            Workspace
                          </TransitionLink>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
