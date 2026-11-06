import React from 'react';
import { segmentEmojiText, splitEmojiGraphemes } from '../utils/textToEmojiEngine';

interface FormattedEmojiTextProps {
  text: string;
  className?: string;
  emojiScale?: number;
}

/**
 * Renders mixed text and Unicode emoji clusters with guaranteed non-overlapping inline spacing,
 * proper vertical alignment, and clean multi-line wrapping on both mobile and desktop.
 */
export const FormattedEmojiText: React.FC<FormattedEmojiTextProps> = ({
  text,
  className = '',
  emojiScale = 1.08,
}) => {
  const segments = React.useMemo(() => segmentEmojiText(text), [text]);

  return (
    <span className={`memo-inline-text ${className}`}>
      {segments.map((seg, idx) => {
        if (seg.type === 'text') {
          return <React.Fragment key={idx}>{seg.value}</React.Fragment>;
        }
        const graphemes = splitEmojiGraphemes(seg.value);
        return (
          <span
            key={idx}
            className="inline-flex items-baseline flex-wrap gap-x-[0.12em] mx-[0.08em] align-baseline"
          >
            {graphemes.map((g, gIdx) => (
              <span
                key={gIdx}
                className="memo-emoji-span"
                style={{ fontSize: `${emojiScale}em` }}
              >
                {g}
              </span>
            ))}
          </span>
        );
      })}
    </span>
  );
};
