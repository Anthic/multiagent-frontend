'use client';

import React from 'react';

interface CustomMarkdownProps {
  content: string;
}

export const CustomMarkdown: React.FC<CustomMarkdownProps> = ({ content }) => {
  if (!content) return null;

  const lines = content.split('\n');
  let inList = false;
  let inCodeBlock = false;
  let codeBlockContent: string[] = [];
  let codeBlockLang = '';

  const elements: React.ReactNode[] = [];

  const parseInlineStyles = (text: string): React.ReactNode[] => {
    const parts: React.ReactNode[] = [];
    let currentIndex = 0;

    // Bold (**text**), Code (`code`), and Links ([text](url)) pattern matching
    const inlineRegex = /(\*\*.*?\*\*|`.*?`|\[.*?\]\(.*?\))/g;
    let match;

    while ((match = inlineRegex.exec(text)) !== null) {
      const matchIndex = match.index;
      
      if (matchIndex > currentIndex) {
        parts.push(text.substring(currentIndex, matchIndex));
      }

      const matchText = match[0];
      if (matchText.startsWith('**') && matchText.endsWith('**')) {
        parts.push(
          <strong key={matchIndex} className="font-bold text-[#11100d] dark:text-white">
            {matchText.slice(2, -2)}
          </strong>
        );
      } else if (matchText.startsWith('`') && matchText.endsWith('`')) {
        parts.push(
          <code key={matchIndex} className="px-1.5 py-0.5 rounded font-mono text-xs bg-black/5 dark:bg-white/10 text-emerald-600 dark:text-emerald-400 font-semibold border border-black/5 dark:border-white/5">
            {matchText.slice(1, -1)}
          </code>
        );
      } else if (matchText.startsWith('[')) {
        const urlMatch = matchText.match(/\[(.*?)\]\((.*?)\)/);
        if (urlMatch) {
          const [, linkText, linkUrl] = urlMatch;
          parts.push(
            <a
              key={matchIndex}
              href={linkUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 underline underline-offset-4 transition-colors font-medium inline-flex items-center gap-0.5"
            >
              {linkText}
              <svg className="w-3 h-3 inline-block" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          );
        } else {
          parts.push(matchText);
        }
      }

      currentIndex = inlineRegex.lastIndex;
    }

    if (currentIndex < text.length) {
      parts.push(text.substring(currentIndex));
    }

    return parts.length > 0 ? parts : [text];
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Handle terminal blocks 
    if (line.trim().startsWith('```')) {
      if (inCodeBlock) {
        elements.push(
          <div key={`code-${i}`} className="my-6 rounded-xl overflow-hidden border border-black/10 dark:border-white/10 bg-black/90 dark:bg-black/95 text-gray-200 shadow-[0_12px_30px_rgba(0,0,0,0.15)] font-mono text-sm leading-relaxed">
            <div className="flex items-center justify-between px-4 py-2 border-b border-white/5 bg-white/5 text-xs text-gray-400">
              <span className="uppercase tracking-widest font-semibold">{codeBlockLang || 'code'}</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <pre className="p-4 overflow-x-auto select-all">
              <code>{codeBlockContent.join('\n')}</code>
            </pre>
          </div>
        );
        inCodeBlock = false;
        codeBlockContent = [];
      } else {
        inCodeBlock = true;
        codeBlockLang = line.trim().slice(3);
      }
      continue;
    }

    if (inCodeBlock) {
      codeBlockContent.push(line);
      continue;
    }

    const trimmed = line.trim();

    if (trimmed === '') {
      if (inList) inList = false;
      continue;
    }

    // Parse Headers with custom typography
    if (trimmed.startsWith('# ')) {
      elements.push(
        <h1 key={`h1-${i}`} className="text-3xl sm:text-4xl font-metamorphous text-[#11100d] dark:text-white mt-8 mb-4 tracking-tight border-b border-black/10 dark:border-white/10 pb-2">
          {parseInlineStyles(trimmed.slice(2))}
        </h1>
      );
      continue;
    }
    if (trimmed.startsWith('## ')) {
      elements.push(
        <h2 key={`h2-${i}`} className="text-2xl sm:text-3xl font-audiowide text-[#11100d] dark:text-white mt-8 mb-3 tracking-normal">
          {parseInlineStyles(trimmed.slice(3))}
        </h2>
      );
      continue;
    }
    if (trimmed.startsWith('### ')) {
      elements.push(
        <h3 key={`h3-${i}`} className="text-xl sm:text-2xl font-bold text-[#11100d] dark:text-white mt-6 mb-2">
          {parseInlineStyles(trimmed.slice(4))}
        </h3>
      );
      continue;
    }

    // Parse Blockquotes with neat designs
    if (trimmed.startsWith('>')) {
      elements.push(
        <blockquote key={`bq-${i}`} className="border-l-4 border-emerald-500 pl-4 py-2 my-4 bg-emerald-500/5 text-[#222222] dark:text-gray-300 italic rounded-r-lg font-roboto">
          {parseInlineStyles(trimmed.replace(/^>\s*/, ''))}
        </blockquote>
      );
      continue;
    }

    // Parse bulleted lists with customized green glowing dots
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      inList = true;
      elements.push(
        <div key={`li-${i}`} className="flex items-start gap-2.5 my-2.5 pl-4 font-roboto text-[#333333] dark:text-gray-300">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 shrink-0 animate-pulse" />
          <span className="leading-relaxed">{parseInlineStyles(trimmed.slice(2))}</span>
        </div>
      );
      continue;
    }

    // Paragraphs
    elements.push(
      <p key={`p-${i}`} className="my-4 leading-relaxed font-roboto text-[#333333] dark:text-gray-300 text-base sm:text-[17px]">
        {parseInlineStyles(line)}
      </p>
    );
  }

  return <div className="prose max-w-none dark:prose-invert">{elements}</div>;
};
