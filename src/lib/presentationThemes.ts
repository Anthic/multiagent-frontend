export type PresentationCategory = 'formal' | 'casual';

export type ThemeId =
  // 🏛️ Formal Themes
  | 'formal_navy'
  | 'formal_burgundy'
  | 'formal_slate'
  // 🎨 Casual Themes
  | 'neon_emerald'
  | 'cyber_cyan'
  | 'sunset_coral'
  | 'pastel_mint';

export interface IPresentationTheme {
  id: ThemeId;
  name: string;
  category: PresentationCategory;
  description: string;
  isDark: boolean;
  // Hex without '#' for pptxgenjs
  pptxBg: string;
  pptxText: string;
  pptxMuted: string;
  pptxAccent: string;
  pptxCardBg: string;
  pptxCardBorder: string;
  // CSS styling for in-browser canvas
  cssBg: string;
  cssText: string;
  cssMuted: string;
  cssAccent: string;
  cssCardBg: string;
  cssCardBorder: string;
  badgeBg: string;
  badgeText: string;
  fontFace: 'Arial' | 'Georgia' | 'Courier New';
  fontClass: string;
}

export const PRESENTATION_THEMES: Record<ThemeId, IPresentationTheme> = {
  // ── 🏛️ Formal Themes ─────────────────────────────────────────
  formal_navy: {
    id: 'formal_navy',
    name: 'Formal Navy',
    category: 'formal',
    description: 'Clean light background with royal academic navy and slate accents.',
    isDark: false,
    pptxBg: 'F8FAFC',
    pptxText: '0F172A',
    pptxMuted: '64748B',
    pptxAccent: '1E40AF',
    pptxCardBg: 'FFFFFF',
    pptxCardBorder: 'E2E8F0',
    cssBg: 'bg-slate-50',
    cssText: 'text-slate-900',
    cssMuted: 'text-slate-500',
    cssAccent: 'text-blue-800',
    cssCardBg: 'bg-white',
    cssCardBorder: 'border-slate-200',
    badgeBg: 'bg-blue-100',
    badgeText: 'text-blue-900',
    fontFace: 'Arial',
    fontClass: 'font-sans',
  },
  formal_burgundy: {
    id: 'formal_burgundy',
    name: 'Academic Prestige',
    category: 'formal',
    description: 'Ivory cream canvas with classical burgundy and warm gold.',
    isDark: false,
    pptxBg: 'FCFBF9',
    pptxText: '1C1917',
    pptxMuted: '78716C',
    pptxAccent: '881337',
    pptxCardBg: 'FFFFFF',
    pptxCardBorder: 'E7E5E4',
    cssBg: 'bg-stone-50',
    cssText: 'text-stone-900',
    cssMuted: 'text-stone-500',
    cssAccent: 'text-rose-900',
    cssCardBg: 'bg-white',
    cssCardBorder: 'border-stone-200',
    badgeBg: 'bg-amber-100',
    badgeText: 'text-amber-900',
    fontFace: 'Georgia',
    fontClass: 'font-serif',
  },
  formal_slate: {
    id: 'formal_slate',
    name: 'Executive Dark Slate',
    category: 'formal',
    description: 'Deep slate background with ice-blue and silver structure.',
    isDark: true,
    pptxBg: '0F172A',
    pptxText: 'F8FAFC',
    pptxMuted: '94A3B8',
    pptxAccent: '38BDF8',
    pptxCardBg: '1E293B',
    pptxCardBorder: '334155',
    cssBg: 'bg-slate-950',
    cssText: 'text-slate-100',
    cssMuted: 'text-slate-400',
    cssAccent: 'text-sky-400',
    cssCardBg: 'bg-slate-900/90',
    cssCardBorder: 'border-slate-800',
    badgeBg: 'bg-sky-950/80',
    badgeText: 'text-sky-300',
    fontFace: 'Arial',
    fontClass: 'font-sans',
  },

  // ── 🎨 Casual Themes ──────────────────────────────────────────
  neon_emerald: {
    id: 'neon_emerald',
    name: 'Neon Emerald',
    category: 'casual',
    description: 'Obsidian dark canvas with glowing emerald accents and modern feel.',
    isDark: true,
    pptxBg: '09090B',
    pptxText: 'FAFAFA',
    pptxMuted: 'A1A1AA',
    pptxAccent: '00E599',
    pptxCardBg: '18181B',
    pptxCardBorder: '27272A',
    cssBg: 'bg-zinc-950',
    cssText: 'text-zinc-100',
    cssMuted: 'text-zinc-400',
    cssAccent: 'text-[#AAFFC7]',
    cssCardBg: 'bg-zinc-900/80',
    cssCardBorder: 'border-zinc-800',
    badgeBg: 'bg-[#AAFFC7]/15',
    badgeText: 'text-[#AAFFC7]',
    fontFace: 'Arial',
    fontClass: 'font-sans',
  },
  cyber_cyan: {
    id: 'cyber_cyan',
    name: 'Cyber Cyan',
    category: 'casual',
    description: 'High-energy electric cyan on deep matrix blue for tech demos.',
    isDark: true,
    pptxBg: '030712',
    pptxText: 'F9FAFB',
    pptxMuted: '9CA3AF',
    pptxAccent: '06B6D4',
    pptxCardBg: '111827',
    pptxCardBorder: '1F2937',
    cssBg: 'bg-gray-950',
    cssText: 'text-gray-100',
    cssMuted: 'text-gray-400',
    cssAccent: 'text-cyan-400',
    cssCardBg: 'bg-gray-900/90',
    cssCardBorder: 'border-gray-800',
    badgeBg: 'bg-cyan-950/80',
    badgeText: 'text-cyan-300',
    fontFace: 'Arial',
    fontClass: 'font-sans',
  },
  sunset_coral: {
    id: 'sunset_coral',
    name: 'Sunset Coral',
    category: 'casual',
    description: 'Warm coral and rose accents on twilight purple for creative pitches.',
    isDark: true,
    pptxBg: '180828',
    pptxText: 'FFF1F2',
    pptxMuted: 'FDA4AF',
    pptxAccent: 'FB7185',
    pptxCardBg: '2D104E',
    pptxCardBorder: '4C1D95',
    cssBg: 'bg-[#180828]',
    cssText: 'text-rose-50',
    cssMuted: 'text-rose-300/80',
    cssAccent: 'text-rose-400',
    cssCardBg: 'bg-purple-950/60',
    cssCardBorder: 'border-purple-800/60',
    badgeBg: 'bg-rose-950/80',
    badgeText: 'text-rose-300',
    fontFace: 'Arial',
    fontClass: 'font-sans',
  },
  pastel_mint: {
    id: 'pastel_mint',
    name: 'Pastel Mint',
    category: 'casual',
    description: 'Soothing mint cream with fresh botanical green for light pitches.',
    isDark: false,
    pptxBg: 'F0FDF4',
    pptxText: '14532D',
    pptxMuted: '166534',
    pptxAccent: '059669',
    pptxCardBg: 'FFFFFF',
    pptxCardBorder: 'DCFCE7',
    cssBg: 'bg-emerald-50/70',
    cssText: 'text-emerald-950',
    cssMuted: 'text-emerald-700/80',
    cssAccent: 'text-emerald-600',
    cssCardBg: 'bg-white',
    cssCardBorder: 'border-emerald-200',
    badgeBg: 'bg-emerald-100',
    badgeText: 'text-emerald-800',
    fontFace: 'Arial',
    fontClass: 'font-sans',
  },
};
