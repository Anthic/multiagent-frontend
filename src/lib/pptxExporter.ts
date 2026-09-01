import pptxgen from 'pptxgenjs';
import { ThemeId, PRESENTATION_THEMES } from './presentationThemes';

export interface ISlideContent {
  id: number;
  title: string;
  subtitle?: string;
  bullets: string[];
  notes?: string;
}

export async function exportToPowerPoint(
  slides: ISlideContent[],
  presentationTitle: string = 'Research Presentation',
  themeId: ThemeId = 'neon_emerald',
): Promise<void> {
  const pptx = new pptxgen();

  const theme = PRESENTATION_THEMES[themeId] || PRESENTATION_THEMES.neon_emerald;

  // Set 16:9 widescreen layout
  pptx.layout = 'LAYOUT_16x9';
  pptx.title = presentationTitle;
  pptx.author = 'AtlasAI Academic Studio';

  const BG_COLOR = theme.pptxBg;
  const ACCENT_COLOR = theme.pptxAccent;
  const TEXT_PRIMARY = theme.pptxText;
  const TEXT_MUTED = theme.pptxMuted;
  const CARD_BG = theme.pptxCardBg;
  const CARD_BORDER = theme.pptxCardBorder;
  const FONT_FACE = theme.fontFace || 'Arial';

  slides.forEach((slideData, index) => {
    const slide = pptx.addSlide();

    // Background
    slide.background = { color: BG_COLOR };

    if (index === 0) {
      // ── Title Slide ──────────────────────────────────────────
      // Category pill / header badge
      slide.addText('ACADEMIC KEYNOTE • RESEARCH OVERVIEW', {
        x: 0.8,
        y: 1.2,
        w: 8.5,
        h: 0.3,
        fontSize: 10,
        fontFace: FONT_FACE,
        color: ACCENT_COLOR,
        bold: true,
        charSpacing: 2,
      });

      // Main Title
      slide.addText(slideData.title, {
        x: 0.8,
        y: 1.6,
        w: 11.5,
        h: 2.2,
        fontSize: 28,
        fontFace: FONT_FACE,
        color: TEXT_PRIMARY,
        bold: true,
        valign: 'top',
        lineSpacingMultiple: 1.15,
      });

      // Subtitle
      if (slideData.subtitle) {
        slide.addText(slideData.subtitle, {
          x: 0.8,
          y: 4.0,
          w: 11.5,
          h: 1.0,
          fontSize: 14,
          fontFace: FONT_FACE,
          color: TEXT_MUTED,
          valign: 'top',
        });
      }

      // Title Card Bullets if any
      if (slideData.bullets && slideData.bullets.length > 0) {
        const bulletObjects = slideData.bullets.map((b) => ({
          text: b,
          options: {
            bullet: { type: 'bullet' as const, color: ACCENT_COLOR },
            fontSize: 13,
            color: TEXT_PRIMARY,
            lineSpacingMultiple: 1.2,
          },
        }));

        slide.addText(bulletObjects, {
          x: 0.8,
          y: 4.8,
          w: 11.5,
          h: 1.8,
          valign: 'top',
        });
      }
    } else {
      // ── Content Slide ────────────────────────────────────────
      // Category header
      slide.addText(`SECTION ${index} • EMPIRICAL FINDINGS`, {
        x: 0.8,
        y: 0.6,
        w: 8.5,
        h: 0.25,
        fontSize: 9,
        fontFace: FONT_FACE,
        color: ACCENT_COLOR,
        bold: true,
        charSpacing: 1.5,
      });

      // Slide Title
      slide.addText(slideData.title, {
        x: 0.8,
        y: 0.9,
        w: 11.5,
        h: 1.0,
        fontSize: 22,
        fontFace: FONT_FACE,
        color: TEXT_PRIMARY,
        bold: true,
        valign: 'top',
      });

      // Subtitle if available
      let startY = 1.9;
      if (slideData.subtitle) {
        slide.addText(slideData.subtitle, {
          x: 0.8,
          y: 1.8,
          w: 11.5,
          h: 0.5,
          fontSize: 12,
          fontFace: FONT_FACE,
          color: TEXT_MUTED,
          italic: true,
        });
        startY = 2.4;
      }

      // Main content bullets in a stylized container block
      if (slideData.bullets && slideData.bullets.length > 0) {
        // Decorative background card
        slide.addShape(pptx.ShapeType.rect, {
          x: 0.8,
          y: startY,
          w: 11.7,
          h: 4.4,
          fill: { color: CARD_BG },
          line: { color: CARD_BORDER, width: 1 },
          rectRadius: 0.1,
        });

        const bulletObjects = slideData.bullets.map((b) => ({
          text: `${b}\n`,
          options: {
            bullet: { type: 'bullet' as const, color: ACCENT_COLOR },
            fontSize: 14,
            color: TEXT_PRIMARY,
            lineSpacingMultiple: 1.3,
          },
        }));

        slide.addText(bulletObjects, {
          x: 1.1,
          y: startY + 0.3,
          w: 11.1,
          h: 3.8,
          valign: 'top',
        });
      }
    }

    // ── Footer ───────────────────────────────────────────────
    slide.addText(`${presentationTitle} • AtlasAI Academic Studio`, {
      x: 0.8,
      y: 7.0,
      w: 8.0,
      h: 0.3,
      fontSize: 9,
      fontFace: FONT_FACE,
      color: TEXT_MUTED,
    });

    slide.addText(`${index + 1} / ${slides.length}`, {
      x: 10.8,
      y: 7.0,
      w: 1.7,
      h: 0.3,
      fontSize: 9,
      fontFace: FONT_FACE,
      color: TEXT_MUTED,
      align: 'right',
    });

    // ── Speaker Notes ─────────────────────────────────────────
    if (slideData.notes) {
      slide.addNotes(slideData.notes);
    }
  });

  // Generate and download PPTX in browser
  const sanitizedFilename = (presentationTitle || 'presentation')
    .replace(/[^a-zA-Z0-9_-]/g, '_')
    .toLowerCase();

  await pptx.writeFile({ fileName: `${sanitizedFilename}_${themeId}_presentation.pptx` });
}
