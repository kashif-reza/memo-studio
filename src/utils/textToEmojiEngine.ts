export type EmojiIntensityMode = 'subtle' | 'balanced' | 'expressive' | 'funny';

export interface TextEmojiSegment {
  type: 'text' | 'emoji';
  value: string;
}

export interface ReadabilityTestExample {
  id: string;
  label: string;
  text: string;
}

export const READABILITY_TEST_EXAMPLES: ReadabilityTestExample[] = [
  {
    id: 'test-greeting',
    label: 'Warm Greeting',
    text: 'Hello 😊 How are you? ❤️🔥',
  },
  {
    id: 'test-happy',
    label: 'Happy Celebration',
    text: 'I am so happy today 😍✨🎉',
  },
  {
    id: 'test-morning',
    label: 'Morning Wishes',
    text: 'Good morning 🌞☕ Hope you have a wonderful day!',
  },
  {
    id: 'test-hilarious',
    label: 'Hilarious Reaction',
    text: '😂😂😂 That was hilarious!',
  },
  {
    id: 'test-love',
    label: 'Love & Affection',
    text: 'Love you ❤️🥰😘💖',
  },
];

export const CONVERTER_SAMPLE_PROMPTS: Array<{ id: string; label: string; text: string }> = [
  {
    id: 'sample-exam',
    label: 'Passed My Exam',
    text: 'I am happy today because I passed my exam.',
  },
  {
    id: 'sample-coffee',
    label: 'Coffee & Rainy Days',
    text: 'I love coffee and rainy days.',
  },
  {
    id: 'sample-morning',
    label: 'Good Morning Everyone',
    text: 'Good morning everyone. Have a wonderful day.',
  },
  {
    id: 'sample-launch',
    label: 'Project Launch',
    text: 'We just launched our new creative studio and the team is celebrating!',
  },
  {
    id: 'sample-hilarious',
    label: 'Funny Joke',
    text: 'That meme was hilarious and made my whole evening.',
  },
];

// Matches single or consecutive Unicode emojis (Extended_Pictographic + ZWJ + variation selectors + skin tones + flags)
const EMOJI_CLUSTER_REGEX =
  /((?:\p{Regional_Indicator}{2}|\p{Extended_Pictographic}(?:\uFE0F|\uFE0E)?(?:\p{Emoji_Modifier})?(?:\u200D\p{Extended_Pictographic}(?:\uFE0F|\uFE0E)?(?:\p{Emoji_Modifier})?)*)+)/gu;

/**
 * Splits mixed text and Unicode emojis into distinct 'text' and 'emoji' segments
 * so each emoji sequence can be rendered inside a non-overlapping inline span.
 */
export function segmentEmojiText(input: string): TextEmojiSegment[] {
  if (!input) return [];
  const segments: TextEmojiSegment[] = [];
  let lastIndex = 0;

  for (const match of input.matchAll(EMOJI_CLUSTER_REGEX)) {
    const index = match.index ?? 0;
    if (index > lastIndex) {
      segments.push({
        type: 'text',
        value: input.slice(lastIndex, index),
      });
    }
    segments.push({
      type: 'emoji',
      value: match[0],
    });
    lastIndex = index + match[0].length;
  }

  if (lastIndex < input.length) {
    segments.push({
      type: 'text',
      value: input.slice(lastIndex),
    });
  }

  return segments;
}

/**
 * Splits a consecutive emoji string (e.g. "😂😂😂" or "❤️🥰😘💖") into individual grapheme clusters
 * so consecutive emojis can be spaced cleanly without overlapping each other.
 */
export function splitEmojiGraphemes(emojiSequence: string): string[] {
  if (!emojiSequence) return [];
  if (typeof Intl !== 'undefined' && 'Segmenter' in Intl) {
    const segmenter = new Intl.Segmenter('en', { granularity: 'grapheme' });
    return Array.from(segmenter.segment(emojiSequence), (s) => s.segment).filter((g) => g.trim().length > 0);
  }
  return Array.from(emojiSequence).filter((g) => g.trim().length > 0);
}

interface KeywordEmojiRule {
  pattern: RegExp;
  subtle: string[];
  balanced: string[];
  expressive: string[];
  funny: string[];
}

const KEYWORD_EMOJI_RULES: KeywordEmojiRule[] = [
  {
    pattern: /\b(good morning|morning)\b/i,
    subtle: ['🌞'],
    balanced: ['🌞', '☀️'],
    expressive: ['🌞✨', '☀️🌅'],
    funny: ['🌞🐓', '☀️☕'],
  },
  {
    pattern: /\b(good night|tonight|sleep|sleeping)\b/i,
    subtle: ['🌙'],
    balanced: ['🌙✨', '😴'],
    expressive: ['🌙💤✨'],
    funny: ['🛌😴💤'],
  },
  {
    pattern: /\b(hello|hi|hey|welcome)\b/i,
    subtle: ['👋'],
    balanced: ['😊', '👋'],
    expressive: ['😊👋', '🤗✨'],
    funny: ['🫡👋', '😎✌️'],
  },
  {
    pattern: /\b(how are you)\b/i,
    subtle: ['😊'],
    balanced: ['❤️🔥', '😊✨'],
    expressive: ['❤️🔥✨', '🥰💫'],
    funny: ['👀🔥', '😎🤙'],
  },
  {
    pattern: /\b(happy|glad|joyful|delighted|thrilled)\b/i,
    subtle: ['😊'],
    balanced: ['😊', '😄'],
    expressive: ['😊✨', '😍🎉'],
    funny: ['🥳💃', '🤩🔥'],
  },
  {
    pattern: /\b(passed my exam|passed the exam|passed|exam|graduated|test)\b/i,
    subtle: ['🎉'],
    balanced: ['🎉💯', '🎓🎉'],
    expressive: ['🎉💯✨', '🥳🎓🏆'],
    funny: ['🧠🔥💯', '🥳🎓🚀'],
  },
  {
    pattern: /\b(love you|love|adore|cherish)\b/i,
    subtle: ['❤️'],
    balanced: ['❤️', '🥰'],
    expressive: ['❤️🥰', '❤️💖✨'],
    funny: ['😍💘🔥', '🫶❤️🥰'],
  },
  {
    pattern: /\b(coffee|espresso|latte|tea|caffeine)\b/i,
    subtle: ['☕'],
    balanced: ['☕', '☕✨'],
    expressive: ['☕🤎', '☕✨'],
    funny: ['☕⚡', '🧋🔥'],
  },
  {
    pattern: /\b(rainy days|rainy|raining|rain|storm)\b/i,
    subtle: ['🌧️'],
    balanced: ['🌧️', '☔'],
    expressive: ['🌧️✨', '☔🌈'],
    funny: ['🌧️🐸', '☔🛋️'],
  },
  {
    pattern: /\b(wonderful day|great day|best day|awesome day|beautiful day)\b/i,
    subtle: ['✨'],
    balanced: ['✨🌈', '🌟😊'],
    expressive: ['✨🌈💖', '🌞✨🎉'],
    funny: ['🚀🌈🔥', '😎🌞🎉'],
  },
  {
    pattern: /\b(hilarious|funny|laughing|joke|meme|comedy|lol|lmao)\b/i,
    subtle: ['😂'],
    balanced: ['😂', '🤣'],
    expressive: ['😂😂😂', '🤣💀'],
    funny: ['😂😂😂💀', '🤡🤣🔥'],
  },
  {
    pattern: /\b(launch|launched|shipping|rocket|milestone)\b/i,
    subtle: ['🚀'],
    balanced: ['🚀✨', '🚀🔥'],
    expressive: ['🚀🔥💯', '🚀✨🎉'],
    funny: ['🚀🌕🔥', '🦾🚀💥'],
  },
  {
    pattern: /\b(celebrating|celebrate|party|birthday|congrats|congratulations)\b/i,
    subtle: ['🎉'],
    balanced: ['🥳🎉', '🎉🎊'],
    expressive: ['🥳🎉✨', '🎊🥂🔥'],
    funny: ['🥳💃🕺', '🎂🍾🎉'],
  },
  {
    pattern: /\b(pizza|burger|food|dinner|lunch|hungry|snack)\b/i,
    subtle: ['🍕'],
    balanced: ['🍕😋', '🍔🍟'],
    expressive: ['🍕🍔🤤', '🌮🍕✨'],
    funny: ['🍕🤤🔥', '🍔👑😋'],
  },
  {
    pattern: /\b(work|working|coding|study|studying|focus)\b/i,
    subtle: ['💻'],
    balanced: ['💻✨', '📚💡'],
    expressive: ['💻🔥⚡', '📚🧠💯'],
    funny: ['💻☕🫠', '🤓💻🔥'],
  },
  {
    pattern: /\b(thank you|thanks|grateful|appreciate)\b/i,
    subtle: ['🙏'],
    balanced: ['🙏❤️', '🥹💖'],
    expressive: ['🙏❤️✨', '🥰🫶💖'],
    funny: ['🫡🙏👑', '🫶🔥💯'],
  },
];

const FALLBACK_CLOSERS: Record<EmojiIntensityMode, string[][]> = {
  subtle: [['😊'], ['✨'], ['👍'], ['🌟']],
  balanced: [['😊✨'], ['🔥💯'], ['❤️✨'], ['🌟🎉']],
  expressive: [['😍✨🎉'], ['🔥🚀💯'], ['❤️🥰💖'], ['🥳✨🌈']],
  funny: [['😎🔥💀'], ['🥳🚀🤡'], ['👀🍿🔥'], ['😂💀💯']],
};

/**
 * Intelligent Text-to-Emoji converter.
 * - Preserves original text completely.
 * - Inserts contextual emojis after matching phrases/clauses without repeating the same emoji.
 * - Supports 4 intensity modes ('subtle', 'balanced', 'expressive', 'funny') and deterministic variation seed.
 */
export function convertTextToEmoji(
  inputText: string,
  mode: EmojiIntensityMode = 'balanced',
  variationSeed = 0
): string {
  const trimmed = inputText.trim();
  if (!trimmed) return '';

  const usedEmojis = new Set<string>();
  let working = trimmed;
  let insertionCount = 0;
  const maxInsertions =
    mode === 'subtle' ? 1 : mode === 'balanced' ? 3 : mode === 'expressive' ? 5 : 6;

  // Apply phrase/keyword rules in order, inserting contextual emojis right after the matched word/phrase
  for (let i = 0; i < KEYWORD_EMOJI_RULES.length; i++) {
    if (insertionCount >= maxInsertions) break;
    const rule = KEYWORD_EMOJI_RULES[i];
    const match = rule.pattern.exec(working);
    if (!match || match.index === undefined) continue;

    const pool = rule[mode];
    const choice = pool[(variationSeed + i) % pool.length];
    if (usedEmojis.has(choice)) continue;

    const matchEnd = match.index + match[0].length;
    // Check if an emoji already immediately follows this match
    const afterSlice = working.slice(matchEnd, matchEnd + 6);
    if (EMOJI_CLUSTER_REGEX.test(afterSlice)) {
      EMOJI_CLUSTER_REGEX.lastIndex = 0;
      continue;
    }
    EMOJI_CLUSTER_REGEX.lastIndex = 0;

    // If the character right after the match is punctuation (like "." or "!" or ","), place the emoji neatly
    const nextChar = working[matchEnd] ?? '';
    if (nextChar === '.' || nextChar === '!' || nextChar === '?') {
      working = `${working.slice(0, matchEnd)} ${choice}${working.slice(matchEnd)}`;
    } else {
      working = `${working.slice(0, matchEnd)} ${choice}${working.slice(matchEnd)}`;
    }

    usedEmojis.add(choice);
    insertionCount++;
  }

  // If no specific keyword matched (or if expressive/funny mode wants a vibrant closer), append a contextual closer
  if (insertionCount === 0 || ((mode === 'expressive' || mode === 'funny') && insertionCount === 1)) {
    const closerPool = FALLBACK_CLOSERS[mode];
    const chosenCloser = closerPool[Math.abs(variationSeed) % closerPool.length][0];
    if (!usedEmojis.has(chosenCloser)) {
      working = `${working} ${chosenCloser}`;
    }
  }

  // Normalize any double spaces around punctuation while keeping original words intact
  return working.replace(/\s{2,}/g, ' ').trim();
}
