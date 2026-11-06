import test from 'node:test';
import assert from 'node:assert/strict';
import {
  STARTER_PRESETS,
  computeMotionFrame,
  createHistoryStack,
  formatShortcode,
  pushHistoryState,
  randomizeEmojiConfig,
  redoHistoryState,
  undoHistoryState,
  validateShortcode,
} from './emojiEngine';
import {
  GIVEN_PHOTO_EMOJIS,
  MULTI_REACTION_SHEETS,
  computeSheetGridSlices,
  computeSvgCropPlacement,
  createDroppedPhotoEmoji,
  getCropImgProps,
  mixEmojiConfigs,
  parseCropUrl,
  randomizePhotoCombo,
} from './photoEmojiCatalog';

test('formatShortcode normalizes custom emoji shortcodes properly', () => {
  assert.equal(formatShortcode('Party Cat!'), ':party_cat:');
  assert.equal(formatShortcode('::rocket-launch::'), ':rocket-launch:');
  assert.equal(formatShortcode('   '), ':custom_moji:');
});

test('validateShortcode rejects invalid or empty codes and accepts valid ones', () => {
  assert.equal(validateShortcode('').valid, false);
  assert.equal(validateShortcode(':a:').valid, false);
  assert.equal(validateShortcode('bad space').valid, false);
  assert.equal(validateShortcode(':neko_hype_2:').valid, true);
});

test('computeMotionFrame computes deterministic kinematics across normalized time', () => {
  const base = STARTER_PRESETS[0]; // bounce-joy
  const frameStart = computeMotionFrame(base, 0);
  const frameQuarter = computeMotionFrame(base, 0.25);

  assert.equal(frameStart.normalizedTime, 0);
  assert.ok(frameQuarter.body.translateY < -5, 'Expected upward bounce at t=0.25');
  assert.equal(frameQuarter.particles.length, 6);

  const frameBlink = computeMotionFrame(base, 0.72);
  assert.ok(frameBlink.eyes.blinkScaleY < 0.25, 'Expected eyes to blink near t=0.72');
});

test('randomizeEmojiConfig produces deterministic config when seeded', () => {
  const c1 = randomizeEmojiConfig(42);
  const c2 = randomizeEmojiConfig(42);
  assert.equal(c1.faceShape, c2.faceShape);
  assert.equal(c1.eyes, c2.eyes);
  assert.equal(c1.mouth, c2.mouth);
  assert.equal(c1.motionPreset, c2.motionPreset);
  assert.equal(c1.shortcode, c2.shortcode);
});

test('GIVEN_PHOTO_EMOJIS contains the full expanded library of 139 reaction & meme emojis with unique IDs', () => {
  assert.equal(GIVEN_PHOTO_EMOJIS.length, 139);
  assert.equal(MULTI_REACTION_SHEETS.length, 5);
  const splitSheetItems = GIVEN_PHOTO_EMOJIS.filter((i) => i.category === 'split-sheet');
  const newSoloItems = GIVEN_PHOTO_EMOJIS.filter((i) => i.category === 'new-solo');
  const originalItems = GIVEN_PHOTO_EMOJIS.filter((i) => i.category === 'original');
  assert.equal(splitSheetItems.length, 69);
  assert.equal(newSoloItems.length, 54);
  assert.equal(originalItems.length, 16);

  const ids = new Set<string>();
  for (const item of GIVEN_PHOTO_EMOJIS) {
    assert.ok(!ids.has(item.id), `Duplicate ID: ${item.id}`);
    ids.add(item.id);
    assert.ok(item.photoUrl.startsWith('/assets/aistudio/'), `Invalid path: ${item.photoUrl}`);
    assert.ok(!item.photoUrl.includes('/crops/'), `Must not depend on untracked /crops/ dir: ${item.photoUrl}`);
    assert.equal(item.matchingConfig.photoUrl, item.photoUrl);
  }
});

test('parseCropUrl, computeSvgCropPlacement, and getCropImgProps accurately slice sticker sheet coordinates', () => {
  const bananaUrl = '/assets/aistudio/michis_74bb539b.jpg#crop=20,108,176,348,736,1308';
  const parsed = parseCropUrl(bananaUrl);
  assert.equal(parsed.baseUrl, '/assets/aistudio/michis_74bb539b.jpg');
  assert.deepEqual(parsed.crop, { x: 20, y: 108, w: 176, h: 348, sw: 736, sh: 1308 });

  const svgPlace = computeSvgCropPlacement(bananaUrl, 30, 30, 140, 140);
  assert.equal(svgPlace.href, '/assets/aistudio/michis_74bb539b.jpg');
  assert.equal(svgPlace.preserveAspectRatio, 'none');
  assert.ok(svgPlace.width > 500 && svgPlace.height > 900);

  const imgProps = getCropImgProps(bananaUrl);
  assert.equal(imgProps.src, '/assets/aistudio/michis_74bb539b.jpg');
  assert.ok(imgProps.style?.objectViewBox?.startsWith('inset('));
});

test('createDroppedPhotoEmoji and computeSheetGridSlices process user drops and multi-reaction sheets accurately', () => {
  const dropped = createDroppedPhotoEmoji('data:image/jpeg;base64,abc', 'my_mood_cat.jpg', 'foodie', 1);
  assert.equal(dropped.category, 'user-drop');
  assert.equal(dropped.mood, 'foodie');
  assert.equal(dropped.shortcode, ':my_mood_cat:');

  const slices = computeSheetGridSlices(600, 800, 3, 4);
  assert.equal(slices.length, 12);
  assert.ok(slices[0].width > 100 && slices[0].height > 150);
});

test('mixEmojiConfigs combines two photo emojis across duo-collab and vector-overlay modes', () => {
  const pA = GIVEN_PHOTO_EMOJIS[0].matchingConfig;
  const pB = GIVEN_PHOTO_EMOJIS[14].matchingConfig;

  const duo = mixEmojiConfigs(pA, pB, 'duo-collab');
  assert.equal(duo.photoUrl, pA.photoUrl);
  assert.equal(duo.secondaryPhotoUrl, pB.photoUrl);
  assert.equal(duo.photoMixMode, 'duo-collab');
  assert.equal(duo.motionPreset, pB.motionPreset);

  const overlay = mixEmojiConfigs(pA, pB, 'vector-overlay');
  assert.equal(overlay.photoUrl, pA.photoUrl);
  assert.equal(overlay.eyes, pB.eyes);
  assert.equal(overlay.mouth, pB.mouth);
  assert.equal(overlay.photoMixMode, 'vector-overlay');
});

test('randomizePhotoCombo produces deterministic photo mashups and respects mood filter', () => {
  const r1 = randomizePhotoCombo(99, GIVEN_PHOTO_EMOJIS, 'foodie');
  const r2 = randomizePhotoCombo(99, GIVEN_PHOTO_EMOJIS, 'foodie');
  assert.equal(r1.parentA.id, r2.parentA.id);
  assert.equal(r1.parentB.id, r2.parentB.id);
  assert.equal(r1.parentA.mood, 'foodie');
  assert.equal(r1.parentB.mood, 'foodie');
  assert.notEqual(r1.parentA.id, r1.parentB.id);
  assert.equal(r1.config.motionPreset, r2.config.motionPreset);
});

test('undo and redo history stack transitions work accurately', () => {
  let stack = createHistoryStack<number>(1);
  stack = pushHistoryState(stack, 2);
  stack = pushHistoryState(stack, 3);
  assert.equal(stack.present, 3);
  assert.equal(stack.past.length, 2);

  stack = undoHistoryState(stack);
  assert.equal(stack.present, 2);
  assert.equal(stack.future.length, 1);

  stack = redoHistoryState(stack);
  assert.equal(stack.present, 3);
  assert.equal(stack.future.length, 0);
});

import {
  READABILITY_TEST_EXAMPLES,
  convertTextToEmoji,
  segmentEmojiText,
  splitEmojiGraphemes,
} from './textToEmojiEngine';
import { UNICODE_EMOJI_CATEGORIES, UNICODE_EMOJI_LIBRARY } from './unicodeEmojiCatalog';
import { encodeGif89a } from './gifEncoder';

test('segmentEmojiText and splitEmojiGraphemes cleanly separate text and consecutive emojis for non-overlapping display', () => {
  for (const example of READABILITY_TEST_EXAMPLES) {
    const segments = segmentEmojiText(example.text);
    assert.ok(segments.length >= 2, `Expected mixed text and emoji segments for: ${example.text}`);
    const emojiSegments = segments.filter((s) => s.type === 'emoji');
    assert.ok(emojiSegments.length >= 1, `Expected at least one emoji segment in: ${example.text}`);
    const reconstructed = segments.map((s) => s.value).join('');
    assert.equal(reconstructed, example.text);
  }

  const graphemes = splitEmojiGraphemes('❤️🥰😘💖');
  assert.equal(graphemes.length, 4);
  assert.equal(graphemes[0], '❤️');
  assert.equal(graphemes[3], '💖');
});

test('convertTextToEmoji preserves original words and inserts contextual emojis across all 4 intensity modes', () => {
  const input1 = 'I am happy today because I passed my exam.';
  const outSubtle = convertTextToEmoji(input1, 'subtle', 0);
  const outBalanced = convertTextToEmoji(input1, 'balanced', 0);
  const outExpressive = convertTextToEmoji(input1, 'expressive', 0);
  const outFunny = convertTextToEmoji(input1, 'funny', 1);

  for (const out of [outSubtle, outBalanced, outExpressive, outFunny]) {
    assert.ok(out.includes('I am happy'), `Preserved 'I am happy' in: ${out}`);
    assert.ok(out.includes('passed my exam'), `Preserved 'passed my exam' in: ${out}`);
    assert.ok(segmentEmojiText(out).some((s) => s.type === 'emoji'), `Contains emoji in: ${out}`);
  }

  const input2 = 'I love coffee and rainy days.';
  const coffeeOut = convertTextToEmoji(input2, 'balanced', 0);
  assert.ok(coffeeOut.includes('☕'), `Expected coffee emoji in: ${coffeeOut}`);
  assert.ok(coffeeOut.includes('🌧️') || coffeeOut.includes('☔'), `Expected rain emoji in: ${coffeeOut}`);
});

test('UNICODE_EMOJI_LIBRARY covers all 9 required categories with unique IDs', () => {
  assert.equal(UNICODE_EMOJI_CATEGORIES.length, 9);
  for (const cat of UNICODE_EMOJI_CATEGORIES) {
    const items = UNICODE_EMOJI_LIBRARY.filter((e) => e.category === cat);
    assert.ok(items.length >= 5, `Expected at least 5 emojis in category ${cat}`);
  }
});

test('encodeGif89a produces valid binary GIF89a header, Netscape loop block, and 0x3b trailer', () => {
  const frame1 = new Uint8ClampedArray(16 * 16 * 4).fill(255);
  const frame2 = new Uint8ClampedArray(16 * 16 * 4).fill(128);
  const gifBytes = encodeGif89a(
    [
      { width: 16, height: 16, data: frame1, delayMs: 100 },
      { width: 16, height: 16, data: frame2, delayMs: 100 },
    ],
    100,
    true
  );

  const header = String.fromCharCode(...gifBytes.slice(0, 6));
  assert.equal(header, 'GIF89a');
  assert.equal(gifBytes[gifBytes.length - 1], 0x3b);
  assert.ok(gifBytes.length > 800);
});

test('AURA_EMOTIONS and DEFAULT_EMOJISAN_CHARACTERS match reference specifications', async () => {
  const { AURA_EMOTIONS, DEFAULT_EMOJISAN_CHARACTERS } = await import(
    '../components/AuraEmotionAvatars'
  );
  assert.equal(AURA_EMOTIONS.length, 9);
  assert.deepEqual(
    AURA_EMOTIONS.map((a) => a.label),
    [
      'Disgust',
      'Ennui',
      'Anger',
      'Anxiety',
      'Joy',
      'Sadness',
      'Fear',
      'Envy',
      'Embarrassing',
    ]
  );

  assert.equal(DEFAULT_EMOJISAN_CHARACTERS.length, 4);
  assert.deepEqual(
    DEFAULT_EMOJISAN_CHARACTERS.map((c) => c.name),
    ['Starsan', 'Ellipsan', 'Cloudsan', 'Conesan']
  );
});


