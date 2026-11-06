export type UnicodeEmojiCategory =
  | 'Smileys & Emotions'
  | 'People'
  | 'Animals'
  | 'Food'
  | 'Travel'
  | 'Activities'
  | 'Objects'
  | 'Symbols'
  | 'Flags';

export interface UnicodeEmojiItem {
  id: string;
  char: string;
  name: string;
  category: UnicodeEmojiCategory;
  keywords: string[];
  emotion: string;
  popular?: boolean;
}

export interface EmojiCombinationPreset {
  id: string;
  title: string;
  combo: string;
  meaning: string;
  tag: string;
}

export const UNICODE_EMOJI_CATEGORIES: UnicodeEmojiCategory[] = [
  'Smileys & Emotions',
  'People',
  'Animals',
  'Food',
  'Travel',
  'Activities',
  'Objects',
  'Symbols',
  'Flags',
];

export const UNICODE_EMOJI_LIBRARY: UnicodeEmojiItem[] = [
  // Smileys & Emotions
  { id: 'u-joy', char: '😂', name: 'Face with Tears of Joy', category: 'Smileys & Emotions', keywords: ['laugh', 'funny', 'hilarious', 'lol', 'tears', 'joy'], emotion: 'hilarious', popular: true },
  { id: 'u-rofl', char: '🤣', name: 'Rolling on the Floor Laughing', category: 'Smileys & Emotions', keywords: ['rofl', 'laugh', 'funny', 'lmao', 'comedy'], emotion: 'hilarious', popular: true },
  { id: 'u-smile', char: '😊', name: 'Smiling Face with Smiling Eyes', category: 'Smileys & Emotions', keywords: ['happy', 'smile', 'warm', 'friendly', 'blush'], emotion: 'happy', popular: true },
  { id: 'u-heart-eyes', char: '😍', name: 'Smiling Face with Heart-Eyes', category: 'Smileys & Emotions', keywords: ['love', 'crush', 'adore', 'beautiful', 'amazing'], emotion: 'love', popular: true },
  { id: 'u-hearts-face', char: '🥰', name: 'Smiling Face with Hearts', category: 'Smileys & Emotions', keywords: ['love', 'affection', 'sweet', 'grateful', 'cute'], emotion: 'love', popular: true },
  { id: 'u-kiss', char: '😘', name: 'Face Blowing a Kiss', category: 'Smileys & Emotions', keywords: ['kiss', 'love', 'muah', 'darling', 'romance'], emotion: 'love', popular: true },
  { id: 'u-star-struck', char: '🤩', name: 'Star-Struck', category: 'Smileys & Emotions', keywords: ['excited', 'star', 'wow', 'awesome', 'fame'], emotion: 'excited', popular: true },
  { id: 'u-party', char: '🥳', name: 'Partying Face', category: 'Smileys & Emotions', keywords: ['party', 'celebrate', 'birthday', 'congrats', 'win'], emotion: 'celebration', popular: true },
  { id: 'u-cool', char: '😎', name: 'Smiling Face with Sunglasses', category: 'Smileys & Emotions', keywords: ['cool', 'boss', 'chill', 'swagger', 'confident'], emotion: 'cool', popular: true },
  { id: 'u-sob', char: '😭', name: 'Loudly Crying Face', category: 'Smileys & Emotions', keywords: ['cry', 'sad', 'emotional', 'tears', 'overwhelmed'], emotion: 'emotional', popular: true },
  { id: 'u-mind-blown', char: '🤯', name: 'Exploding Head', category: 'Smileys & Emotions', keywords: ['shock', 'mind blown', 'unbelievable', 'whoa', 'crazy'], emotion: 'shocked', popular: true },
  { id: 'u-pleading', char: '🥺', name: 'Pleading Face', category: 'Smileys & Emotions', keywords: ['please', 'puppy eyes', 'cute', 'beg', 'soft'], emotion: 'cute', popular: true },
  { id: 'u-thinking', char: '🤔', name: 'Thinking Face', category: 'Smileys & Emotions', keywords: ['think', 'hmm', 'wonder', 'question', 'idea'], emotion: 'curious' },
  { id: 'u-wink', char: '😉', name: 'Winking Face', category: 'Smileys & Emotions', keywords: ['wink', 'flirt', 'joke', 'secret', 'playful'], emotion: 'playful' },
  { id: 'u-smirk', char: '😏', name: 'Smirking Face', category: 'Smileys & Emotions', keywords: ['smirk', 'sly', 'flirt', 'clever', 'meme'], emotion: 'sly' },
  { id: 'u-upside', char: '🙃', name: 'Upside-Down Face', category: 'Smileys & Emotions', keywords: ['sarcasm', 'irony', 'silly', 'awkward', 'oops'], emotion: 'sarcastic' },
  { id: 'u-melt', char: '🫠', name: 'Melting Face', category: 'Smileys & Emotions', keywords: ['melt', 'hot', 'embarrassed', 'done', 'mood'], emotion: 'mood' },
  { id: 'u-halo', char: '😇', name: 'Smiling Face with Halo', category: 'Smileys & Emotions', keywords: ['angel', 'innocent', 'blessed', 'good', 'pure'], emotion: 'blessed' },
  { id: 'u-sleep', char: '😴', name: 'Sleeping Face', category: 'Smileys & Emotions', keywords: ['sleep', 'tired', 'zzz', 'nap', 'night'], emotion: 'tired' },
  { id: 'u-rage', char: '😡', name: 'Enraged Face', category: 'Smileys & Emotions', keywords: ['angry', 'mad', 'rage', 'furious', 'upset'], emotion: 'angry' },
  { id: 'u-skull', char: '💀', name: 'Skull (I am Dead Laughing)', category: 'Smileys & Emotions', keywords: ['dead', 'skull', 'funny', 'bruh', 'meme'], emotion: 'hilarious', popular: true },
  { id: 'u-clown', char: '🤡', name: 'Clown Face', category: 'Smileys & Emotions', keywords: ['clown', 'fool', 'joker', 'circus', 'meme'], emotion: 'silly' },
  { id: 'u-ghost', char: '👻', name: 'Ghost', category: 'Smileys & Emotions', keywords: ['ghost', 'spooky', 'boo', 'fun', 'halloween'], emotion: 'playful' },

  // People
  { id: 'u-wave', char: '👋', name: 'Waving Hand', category: 'People', keywords: ['hello', 'hi', 'hey', 'bye', 'welcome'], emotion: 'greeting', popular: true },
  { id: 'u-thumbs-up', char: '👍', name: 'Thumbs Up', category: 'People', keywords: ['yes', 'ok', 'good', 'approve', 'great'], emotion: 'approval', popular: true },
  { id: 'u-clap', char: '👏', name: 'Clapping Hands', category: 'People', keywords: ['clap', 'bravo', 'applause', 'congrats', 'praise'], emotion: 'celebration', popular: true },
  { id: 'u-raised-hands', char: '🙌', name: 'Raising Hands', category: 'People', keywords: ['hooray', 'celebrate', 'yay', 'praise', 'success'], emotion: 'celebration', popular: true },
  { id: 'u-pray', char: '🙏', name: 'Folded Hands', category: 'People', keywords: ['thank you', 'please', 'pray', 'grateful', 'namaste'], emotion: 'grateful', popular: true },
  { id: 'u-muscle', char: '💪', name: 'Flexed Biceps', category: 'People', keywords: ['strong', 'power', 'gym', 'workout', 'hustle'], emotion: 'strong', popular: true },
  { id: 'u-handshake', char: '🤝', name: 'Handshake', category: 'People', keywords: ['deal', 'agree', 'partner', 'team', 'friend'], emotion: 'friendly' },
  { id: 'u-heart-hands', char: '🫶', name: 'Heart Hands', category: 'People', keywords: ['love', 'support', 'care', 'heart', 'sweet'], emotion: 'love', popular: true },
  { id: 'u-eyes', char: '👀', name: 'Eyes', category: 'People', keywords: ['look', 'see', 'watch', 'drama', 'tea'], emotion: 'curious', popular: true },
  { id: 'u-salute', char: '🫡', name: 'Saluting Face', category: 'People', keywords: ['salute', 'respect', 'sir', 'duty', 'honor'], emotion: 'respect' },
  { id: 'u-dancer', char: '💃', name: 'Woman Dancing', category: 'People', keywords: ['dance', 'party', 'salsa', 'fun', 'weekend'], emotion: 'celebration' },
  { id: 'u-facepalm', char: '🤦', name: 'Person Facepalming', category: 'People', keywords: ['facepalm', 'mistake', 'ugh', 'bruh', 'disbelief'], emotion: 'sarcastic' },

  // Animals
  { id: 'u-cat-heart', char: '😻', name: 'Smiling Cat with Heart-Eyes', category: 'Animals', keywords: ['cat', 'kitty', 'love', 'cute', 'meow'], emotion: 'love', popular: true },
  { id: 'u-cat-joy', char: '😹', name: 'Cat with Tears of Joy', category: 'Animals', keywords: ['cat', 'laugh', 'funny', 'meow', 'meme'], emotion: 'hilarious' },
  { id: 'u-dog', char: '🐶', name: 'Dog Face', category: 'Animals', keywords: ['dog', 'puppy', 'pet', 'loyal', 'cute'], emotion: 'cute', popular: true },
  { id: 'u-fox', char: '🦊', name: 'Fox', category: 'Animals', keywords: ['fox', 'clever', 'orange', 'wild', 'cute'], emotion: 'clever' },
  { id: 'u-lion', char: '🦁', name: 'Lion', category: 'Animals', keywords: ['lion', 'king', 'brave', 'roar', 'fierce'], emotion: 'strong' },
  { id: 'u-panda', char: '🐼', name: 'Panda', category: 'Animals', keywords: ['panda', 'bear', 'cute', 'chill', 'bamboo'], emotion: 'cute' },
  { id: 'u-butterfly', char: '🦋', name: 'Butterfly', category: 'Animals', keywords: ['butterfly', 'nature', 'pretty', 'aesthetic', 'spring'], emotion: 'peaceful' },
  { id: 'u-unicorn', char: '🦄', name: 'Unicorn', category: 'Animals', keywords: ['unicorn', 'magic', 'fantasy', 'rare', 'special'], emotion: 'magical', popular: true },
  { id: 'u-goat', char: '🐐', name: 'Goat (GOAT)', category: 'Animals', keywords: ['goat', 'greatest', 'champion', 'legend', 'best'], emotion: 'cool', popular: true },

  // Food
  { id: 'u-coffee', char: '☕', name: 'Hot Beverage / Coffee', category: 'Food', keywords: ['coffee', 'tea', 'morning', 'cafe', 'espresso'], emotion: 'cozy', popular: true },
  { id: 'u-pizza', char: '🍕', name: 'Pizza', category: 'Food', keywords: ['pizza', 'food', 'slice', 'cheese', 'party'], emotion: 'hungry', popular: true },
  { id: 'u-burger', char: '🍔', name: 'Hamburger', category: 'Food', keywords: ['burger', 'fast food', 'lunch', 'dinner', 'yum'], emotion: 'hungry' },
  { id: 'u-fries', char: '🍟', name: 'French Fries', category: 'Food', keywords: ['fries', 'snack', 'crispy', 'food', 'salty'], emotion: 'hungry' },
  { id: 'u-taco', char: '🌮', name: 'Taco', category: 'Food', keywords: ['taco', 'mexican', 'food', 'tuesday', 'spicy'], emotion: 'hungry' },
  { id: 'u-cake', char: '🎂', name: 'Birthday Cake', category: 'Food', keywords: ['cake', 'birthday', 'sweet', 'dessert', 'celebrate'], emotion: 'celebration', popular: true },
  { id: 'u-strawberry', char: '🍓', name: 'Strawberry', category: 'Food', keywords: ['strawberry', 'berry', 'fruit', 'sweet', 'fresh'], emotion: 'sweet' },
  { id: 'u-popcorn', char: '🍿', name: 'Popcorn', category: 'Food', keywords: ['popcorn', 'movie', 'cinema', 'drama', 'watch'], emotion: 'entertained', popular: true },
  { id: 'u-clink', char: '🥂', name: 'Clinking Glasses', category: 'Food', keywords: ['cheers', 'toast', 'celebrate', 'champagne', 'party'], emotion: 'celebration' },

  // Travel
  { id: 'u-rocket', char: '🚀', name: 'Rocket', category: 'Travel', keywords: ['rocket', 'launch', 'space', 'fast', 'moon', 'growth'], emotion: 'excited', popular: true },
  { id: 'u-sun', char: '🌞', name: 'Sun with Face', category: 'Travel', keywords: ['sun', 'morning', 'sunny', 'bright', 'day', 'warm'], emotion: 'happy', popular: true },
  { id: 'u-rain', char: '🌧️', name: 'Cloud with Rain', category: 'Travel', keywords: ['rain', 'rainy', 'weather', 'cozy', 'storm'], emotion: 'cozy' },
  { id: 'u-rainbow', char: '🌈', name: 'Rainbow', category: 'Travel', keywords: ['rainbow', 'colorful', 'hope', 'sky', 'magic'], emotion: 'happy', popular: true },
  { id: 'u-beach', char: '🏖️', name: 'Beach with Umbrella', category: 'Travel', keywords: ['beach', 'vacation', 'summer', 'holiday', 'sea'], emotion: 'relaxed' },
  { id: 'u-airplane', char: '✈️', name: 'Airplane', category: 'Travel', keywords: ['flight', 'travel', 'trip', 'airport', 'vacation'], emotion: 'excited' },
  { id: 'u-earth', char: '🌍', name: 'Globe Showing Europe-Africa', category: 'Travel', keywords: ['world', 'earth', 'global', 'planet', 'nature'], emotion: 'global' },
  { id: 'u-night-stars', char: '🌃', name: 'Night with Stars', category: 'Travel', keywords: ['night', 'city', 'stars', 'evening', 'skyline'], emotion: 'cozy' },

  // Activities
  { id: 'u-tada', char: '🎉', name: 'Party Popper', category: 'Activities', keywords: ['party', 'celebrate', 'congrats', 'tada', 'win', 'success'], emotion: 'celebration', popular: true },
  { id: 'u-confetti', char: '🎊', name: 'Confetti Ball', category: 'Activities', keywords: ['confetti', 'festival', 'celebration', 'happy'], emotion: 'celebration' },
  { id: 'u-trophy', char: '🏆', name: 'Trophy', category: 'Activities', keywords: ['trophy', 'winner', 'champion', 'award', 'first', 'passed'], emotion: 'proud', popular: true },
  { id: 'u-medal', char: '🥇', name: '1st Place Medal', category: 'Activities', keywords: ['gold', 'medal', 'first', 'winner', 'exam', 'top'], emotion: 'proud' },
  { id: 'u-gamepad', char: '🎮', name: 'Video Game', category: 'Activities', keywords: ['game', 'gaming', 'controller', 'play', 'esports'], emotion: 'playful', popular: true },
  { id: 'u-palette', char: '🎨', name: 'Artist Palette', category: 'Activities', keywords: ['art', 'design', 'paint', 'creative', 'color'], emotion: 'creative' },
  { id: 'u-music', char: '🎵', name: 'Musical Note', category: 'Activities', keywords: ['music', 'song', 'melody', 'vibe', 'beat'], emotion: 'vibe', popular: true },
  { id: 'u-soccer', char: '⚽', name: 'Soccer Ball', category: 'Activities', keywords: ['soccer', 'football', 'sport', 'goal', 'match'], emotion: 'energetic' },

  // Objects
  { id: 'u-laptop', char: '💻', name: 'Laptop', category: 'Objects', keywords: ['code', 'work', 'laptop', 'computer', 'tech', 'study'], emotion: 'focused', popular: true },
  { id: 'u-books', char: '📚', name: 'Books', category: 'Objects', keywords: ['study', 'exam', 'school', 'read', 'learn', 'class'], emotion: 'focused' },
  { id: 'u-grad-cap', char: '🎓', name: 'Graduation Cap', category: 'Objects', keywords: ['graduate', 'exam', 'passed', 'degree', 'college'], emotion: 'proud', popular: true },
  { id: 'u-bulb', char: '💡', name: 'Light Bulb', category: 'Objects', keywords: ['idea', 'smart', 'bright', 'tip', 'solution'], emotion: 'clever', popular: true },
  { id: 'u-camera', char: '📸', name: 'Camera with Flash', category: 'Objects', keywords: ['photo', 'picture', 'selfie', 'snapshot', 'caught'], emotion: 'playful' },
  { id: 'u-crown', char: '👑', name: 'Crown', category: 'Objects', keywords: ['king', 'queen', 'royal', 'boss', 'legend'], emotion: 'cool', popular: true },
  { id: 'u-gem', char: '💎', name: 'Gem Stone', category: 'Objects', keywords: ['diamond', 'gem', 'luxury', 'precious', 'shine'], emotion: 'cool' },
  { id: 'u-gift', char: '🎁', name: 'Wrapped Gift', category: 'Objects', keywords: ['gift', 'present', 'surprise', 'birthday', 'treat'], emotion: 'happy' },

  // Symbols
  { id: 'u-red-heart', char: '❤️', name: 'Red Heart', category: 'Symbols', keywords: ['love', 'heart', 'romance', 'like', 'care'], emotion: 'love', popular: true },
  { id: 'u-sparkle-heart', char: '💖', name: 'Sparkling Heart', category: 'Symbols', keywords: ['love', 'sparkle', 'pink', 'sweet', 'adore'], emotion: 'love', popular: true },
  { id: 'u-fire', char: '🔥', name: 'Fire / Lit', category: 'Symbols', keywords: ['fire', 'hot', 'lit', 'awesome', 'trending', 'hype'], emotion: 'excited', popular: true },
  { id: 'u-sparkles', char: '✨', name: 'Sparkles', category: 'Symbols', keywords: ['sparkle', 'magic', 'shine', 'new', 'clean', 'vibe'], emotion: 'magical', popular: true },
  { id: 'u-100', char: '💯', name: 'Hundred Points', category: 'Symbols', keywords: ['100', 'perfect', 'real', 'facts', 'score', 'passed'], emotion: 'proud', popular: true },
  { id: 'u-zap', char: '⚡', name: 'High Voltage', category: 'Symbols', keywords: ['energy', 'fast', 'power', 'electric', 'flash'], emotion: 'energetic', popular: true },
  { id: 'u-star', char: '⭐', name: 'Star', category: 'Symbols', keywords: ['star', 'favorite', 'rating', 'top', 'gold'], emotion: 'proud' },
  { id: 'u-check', char: '✅', name: 'Check Mark Button', category: 'Symbols', keywords: ['done', 'check', 'verified', 'complete', 'success'], emotion: 'approval' },

  // Flags
  { id: 'u-flag-finish', char: '🏁', name: 'Chequered Flag', category: 'Flags', keywords: ['finish', 'race', 'win', 'goal', 'complete'], emotion: 'proud', popular: true },
  { id: 'u-flag-rainbow', char: '🏳️‍🌈', name: 'Rainbow Flag', category: 'Flags', keywords: ['pride', 'rainbow', 'flag', 'love', 'colorful'], emotion: 'happy' },
  { id: 'u-flag-pirate', char: '🏴‍☠️', name: 'Pirate Flag', category: 'Flags', keywords: ['pirate', 'adventure', 'rebel', 'treasure'], emotion: 'playful' },
  { id: 'u-flag-us', char: '🇺🇸', name: 'Flag: United States', category: 'Flags', keywords: ['usa', 'america', 'flag', 'country'], emotion: 'global' },
  { id: 'u-flag-gb', char: '🇬🇧', name: 'Flag: United Kingdom', category: 'Flags', keywords: ['uk', 'britain', 'flag', 'country'], emotion: 'global' },
  { id: 'u-flag-pk', char: '🇵🇰', name: 'Flag: Pakistan', category: 'Flags', keywords: ['pakistan', 'flag', 'country', 'desi'], emotion: 'global' },
  { id: 'u-flag-in', char: '🇮🇳', name: 'Flag: India', category: 'Flags', keywords: ['india', 'flag', 'country', 'desi'], emotion: 'global' },
  { id: 'u-flag-jp', char: '🇯🇵', name: 'Flag: Japan', category: 'Flags', keywords: ['japan', 'tokyo', 'anime', 'flag'], emotion: 'global' },
];

export const POPULAR_EMOJI_COMBINATIONS: EmojiCombinationPreset[] = [
  { id: 'combo-hype', title: 'Pure Hype', combo: '🔥🚀💯✨', meaning: 'Unstoppable momentum & launch energy', tag: 'Trending' },
  { id: 'combo-love', title: 'Shower of Love', combo: '❤️🥰😘💖', meaning: 'Warm affection & heartfelt appreciation', tag: 'Romance' },
  { id: 'combo-morning', title: 'Morning Brew', combo: '🌞☕✨🌈', meaning: 'Fresh morning energy & positive vibes', tag: 'Daily' },
  { id: 'combo-victory', title: 'Exam Crushed', combo: '🥳🎓💯🎉', meaning: 'Passed with flying colors!', tag: 'Milestone' },
  { id: 'combo-comedy', title: 'Comedy Gold', combo: '😂😂😂💀', meaning: 'Too funny to breathe', tag: 'Meme' },
  { id: 'combo-cozy', title: 'Cozy Rain Vibe', combo: '☕🌧️📚✨', meaning: 'Peaceful rainy day indoors', tag: 'Chill' },
];
