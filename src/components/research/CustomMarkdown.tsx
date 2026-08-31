'use client';

import React, { useMemo } from 'react';

interface CustomMarkdownProps {
  content: string;
  sources?: string[];
}

// ── Inline parser: bold, italic, bold+italic, inline-code, links ──────────────
// Order matters: bold+italic must be checked before bold and italic individually.
function parseInline(text: string, sources: string[] = []): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  // Matches: ***bold+italic***, **bold**, *italic*, _italic_, `code`, [text](url)
  const regex =
    /(\*\*\*[\s\S]+?\*\*\*|\*\*[\s\S]+?\*\*|\*[\s\S]+?\*|_[\s\S]+?_|`[^`]+`|\[([^\]]*)\]\(([^)]*)\)|https?:\/\/[^\s<>)\]}]+)/g;
  let cursor = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    // Push plain text before this match
    if (match.index > cursor) {
      parts.push(text.slice(cursor, match.index));
    }

    const raw = match[0];

    if (raw.startsWith('***') && raw.endsWith('***')) {
      // Bold + Italic
      parts.push(
        <strong key={match.index} className="font-bold italic text-white">
          {raw.slice(3, -3)}
        </strong>,
      );
    } else if (raw.startsWith('**') && raw.endsWith('**')) {
      // Bold
      parts.push(
        <strong key={match.index} className="font-bold text-white">
          {raw.slice(2, -2)}
        </strong>,
      );
    } else if (
      (raw.startsWith('*') && raw.endsWith('*')) ||
      (raw.startsWith('_') && raw.endsWith('_'))
    ) {
      // Italic
      parts.push(
        <em key={match.index} className="italic text-slate-200">
          {raw.slice(1, -1)}
        </em>,
      );
    } else if (raw.startsWith('`') && raw.endsWith('`')) {
      // Inline code
      parts.push(
        <code
          key={match.index}
          className="px-1.5 py-0.5 rounded font-mono text-xs bg-white/10 text-emerald-400 font-semibold border border-white/10"
        >
          {raw.slice(1, -1)}
        </code>,
      );
    } else if (raw.startsWith('[') && match[2] !== undefined && match[3] !== undefined) {
      // Link [text](url)
      const linkText = match[2];
      const linkUrl = match[3];
      const sourceIndex = sources.findIndex((source) => source.replace(/\/$/, '') === linkUrl.replace(/\/$/, ''));
      const displayText = /^https?:\/\//i.test(linkText)
        ? (sourceIndex >= 0 ? `Source ${sourceIndex + 1}` : 'Source')
        : linkText;
      parts.push(
        <a
          key={match.index}
          href={linkUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-emerald-400 hover:text-emerald-300 underline underline-offset-4 transition-colors font-medium"
        >
          {displayText}
          <svg
            className="ml-0.5 inline-block size-3 align-baseline"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
            />
          </svg>
        </a>,
      );
    } else if (/^https?:\/\//i.test(raw)) {
      const url = raw.replace(/[.,;:!?]+$/, '');
      const sourceIndex = sources.findIndex((source) => source.replace(/\/$/, '') === url.replace(/\/$/, ''));
      parts.push(
        <a key={match.index} href={url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center rounded-md border border-emerald-400/25 bg-emerald-400/10 px-1.5 py-0.5 text-sm font-semibold text-emerald-300 no-underline transition hover:bg-emerald-400/20 hover:text-emerald-200">
          {sourceIndex >= 0 ? `Source ${sourceIndex + 1}` : 'Source'} <span aria-hidden="true" className="ml-1 text-xs">↗</span>
        </a>,
      );
    }

    cursor = regex.lastIndex;
  }

  // Remaining plain text
  if (cursor < text.length) {
    parts.push(text.slice(cursor));
  }

  return parts.length > 0 ? parts : [text];
}

// ── Table parser ──────────────────────────────────────────────────────────────
function parseTable(rows: string[], keyPrefix: string, sources: string[]): React.ReactNode {
  // rows[0] = header, rows[1] = separator (---|---), rows[2+] = data rows
  const headerCells = rows[0]
    .split('|')
    .map((c) => c.trim())
    .filter(Boolean);
  const dataRows = rows.slice(2);

  return (
    <div key={keyPrefix} className="my-6 overflow-x-auto rounded-xl border border-white/10">
      <table className="w-full text-sm font-roboto text-left">
        <thead className="bg-white/5 border-b border-white/10">
          <tr>
            {headerCells.map((cell, ci) => (
              <th
                key={ci}
                className="px-4 py-3 font-bold text-white/90 text-xs uppercase tracking-wider whitespace-nowrap"
              >
                {parseInline(cell, sources)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {dataRows.map((row, ri) => {
            const cells = row
              .split('|')
              .map((c) => c.trim())
              .filter(Boolean);
            return (
              <tr
                key={ri}
                className="border-b border-white/5 hover:bg-white/[0.02] transition-colors"
              >
                {cells.map((cell, ci) => (
                  <td key={ci} className="px-4 py-3 text-slate-300 break-words">
                    {parseInline(cell, sources)}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export const CustomMarkdown: React.FC<CustomMarkdownProps> = ({ content, sources = [] }) => {
  const elements = useMemo(() => {
    if (!content) return [];

    const lines = content.split('\n');
    const result: React.ReactNode[] = [];

    let i = 0;
    let orderedListItems: React.ReactNode[] = [];
    let unorderedListItems: React.ReactNode[] = [];
    let inCodeBlock = false;
    let codeLines: string[] = [];
    let codeLang = '';

    const flushOrderedList = () => {
      if (orderedListItems.length === 0) return;
      result.push(
        <ol key={`ol-${i}`} className="my-4 pl-4 space-y-2 font-roboto text-slate-300 list-none">
          {orderedListItems}
        </ol>,
      );
      orderedListItems = [];
    };

    const flushUnorderedList = () => {
      if (unorderedListItems.length === 0) return;
      result.push(
        <ul key={`ul-${i}`} className="my-4 pl-2 space-y-2 font-roboto text-slate-300 list-none">
          {unorderedListItems}
        </ul>,
      );
      unorderedListItems = [];
    };

    while (i < lines.length) {
      const line = lines[i];
      const trimmed = line.trim();

      // ── Code block ─────────────────────────────────────────────────────────
      if (trimmed.startsWith('```')) {
        if (inCodeBlock) {
          result.push(
            <div
              key={`code-${i}`}
              className="my-6 rounded-xl overflow-hidden border border-white/10 bg-[#0d0d0d] text-gray-200 shadow-lg font-mono text-sm leading-relaxed"
            >
              <div className="flex items-center justify-between px-4 py-2 border-b border-white/5 bg-white/5 text-xs text-gray-400">
                <span className="uppercase tracking-widest font-semibold">{codeLang || 'code'}</span>
                <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <pre className="p-4 overflow-x-auto select-all whitespace-pre-wrap break-words">
                <code>{codeLines.join('\n')}</code>
              </pre>
            </div>,
          );
          inCodeBlock = false;
          codeLines = [];
          codeLang = '';
        } else {
          flushOrderedList();
          flushUnorderedList();
          inCodeBlock = true;
          codeLang = trimmed.slice(3).trim();
        }
        i++;
        continue;
      }

      if (inCodeBlock) {
        codeLines.push(line);
        i++;
        continue;
      }

      // ── Blank line ─────────────────────────────────────────────────────────
      if (trimmed === '') {
        flushOrderedList();
        flushUnorderedList();
        i++;
        continue;
      }

      // ── Horizontal rule ────────────────────────────────────────────────────
      if (/^(-{3,}|\*{3,}|_{3,})$/.test(trimmed)) {
        flushOrderedList();
        flushUnorderedList();
        result.push(<hr key={`hr-${i}`} className="my-8 border-white/10" />);
        i++;
        continue;
      }

      // ── Table (detect pipe rows) ───────────────────────────────────────────
      if (trimmed.startsWith('|') && i + 1 < lines.length && lines[i + 1].trim().startsWith('|')) {
        flushOrderedList();
        flushUnorderedList();
        const tableRows: string[] = [];
        while (i < lines.length && lines[i].trim().startsWith('|')) {
          tableRows.push(lines[i].trim());
          i++;
        }
        if (tableRows.length >= 2) {
          result.push(parseTable(tableRows, `table-${i}`, sources));
        }
        continue;
      }

      // ── Headings ───────────────────────────────────────────────────────────
      const h6Match = trimmed.match(/^#{6}\s+(.*)/);
      const h5Match = trimmed.match(/^#{5}\s+(.*)/);
      const h4Match = trimmed.match(/^#{4}\s+(.*)/);
      const h3Match = trimmed.match(/^###\s+(.*)/);
      const h2Match = trimmed.match(/^##\s+(.*)/);
      const h1Match = trimmed.match(/^#\s+(.*)/);

      if (h6Match || h5Match) {
        flushOrderedList(); flushUnorderedList();
        const text = (h6Match || h5Match)![1];
        result.push(
          <h6 key={`h56-${i}`} className="text-sm font-bold text-slate-300 mt-4 mb-1 uppercase tracking-widest font-mono">
            {parseInline(text, sources)}
          </h6>,
        );
        i++; continue;
      }
      if (h4Match) {
        flushOrderedList(); flushUnorderedList();
        result.push(
          <h4 key={`h4-${i}`} className="text-base sm:text-lg font-bold text-white mt-5 mb-1.5 font-roboto">
            {parseInline(h4Match[1], sources)}
          </h4>,
        );
        i++; continue;
      }
      if (h3Match) {
        flushOrderedList(); flushUnorderedList();
        result.push(
          <h3 key={`h3-${i}`} className="text-lg sm:text-xl font-bold text-white mt-6 mb-2 border-l-2 border-emerald-500 pl-3">
            {parseInline(h3Match[1], sources)}
          </h3>,
        );
        i++; continue;
      }
      if (h2Match) {
        flushOrderedList(); flushUnorderedList();
        result.push(
          <h2 key={`h2-${i}`} className="text-xl sm:text-2xl font-audiowide text-white mt-8 mb-3 tracking-normal pb-2 border-b border-white/10">
            {parseInline(h2Match[1], sources)}
          </h2>,
        );
        i++; continue;
      }
      if (h1Match) {
        flushOrderedList(); flushUnorderedList();
        result.push(
          <h1 key={`h1-${i}`} className="text-2xl sm:text-3xl font-metamorphous text-white mt-8 mb-4 tracking-tight pb-2 border-b border-white/15">
            {parseInline(h1Match[1], sources)}
          </h1>,
        );
        i++; continue;
      }

      // ── Blockquote ─────────────────────────────────────────────────────────
      if (trimmed.startsWith('>')) {
        flushOrderedList(); flushUnorderedList();
        result.push(
          <blockquote key={`bq-${i}`} className="border-l-4 border-emerald-500 pl-4 py-2 my-4 bg-emerald-500/5 text-slate-300 italic rounded-r-lg font-roboto">
            {parseInline(trimmed.replace(/^>\s*/, ''), sources)}
          </blockquote>,
        );
        i++; continue;
      }

      // ── Unordered list item (-, *, +) ──────────────────────────────────────
      if (/^[-*+]\s+/.test(trimmed)) {
        flushOrderedList();
        const itemText = trimmed.replace(/^[-*+]\s+/, '');
        unorderedListItems.push(
          <li key={`uli-${i}`} className="flex items-start gap-2.5">
            <span className="size-1.5 rounded-full bg-emerald-500 mt-[0.45rem] shrink-0" />
            <span className="min-w-0 leading-relaxed break-words">{parseInline(itemText, sources)}</span>
          </li>,
        );
        i++; continue;
      }

      // ── Ordered list item (1. 2. 3.) ───────────────────────────────────────
      const olMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
      if (olMatch) {
        flushUnorderedList();
        const num = olMatch[1];
        const itemText = olMatch[2];
        orderedListItems.push(
          <li key={`oli-${i}`} className="flex items-start gap-3">
            <span className="min-w-[1.5rem] h-6 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0 border border-emerald-500/20 mt-0.5">
              {num}
            </span>
            <span className="min-w-0 leading-relaxed break-words">{parseInline(itemText, sources)}</span>
          </li>,
        );
        i++; continue;
      }

      // ── Paragraph ──────────────────────────────────────────────────────────
      flushOrderedList();
      flushUnorderedList();
      result.push(
        <p key={`p-${i}`} className="my-3 leading-relaxed font-roboto text-slate-300 text-base break-words">
          {parseInline(line, sources)}
        </p>,
      );
      i++;
    }

    // Flush any trailing lists
    flushOrderedList();
    flushUnorderedList();

    return result;
  }, [content, sources]);

  if (!content) return null;

  return (
    <div className="prose prose-invert max-w-none overflow-visible break-words">
      {elements}
    </div>
  );
};
