import test from 'node:test';
import assert from 'node:assert/strict';
import {
  TypingInputController,
  compareExpectedCharacter,
  normalizeArabicInput,
  segmentArabicText,
  getArabicCharFromPhysicalKey,
} from '../src/services/typingInputController';

test('1. Normalization & Comparison of Arabic Characters', () => {
  // Exact match
  assert.equal(compareExpectedCharacter('ب', 'ب'), true);
  assert.equal(compareExpectedCharacter('ت', 'ت'), true);

  // Normalization NFC: decomposed Alef + Hamza Above vs precomposed أ
  assert.equal(compareExpectedCharacter('\u0627\u0654', 'أ'), true);
  assert.equal(compareExpectedCharacter('إ', '\u0627\u0655'), true);
  assert.equal(compareExpectedCharacter('آ', '\u0627\u0653'), true);

  // Preserves distinct letters
  assert.equal(compareExpectedCharacter('أ', 'ا'), false);
  assert.equal(compareExpectedCharacter('ب', 'ت'), false);

  // Spaces
  assert.equal(compareExpectedCharacter(' ', ' '), true);
  assert.equal(compareExpectedCharacter('\u00A0', ' '), true);

  // Punctuation
  assert.equal(compareExpectedCharacter('،', '،'), true);
  assert.equal(compareExpectedCharacter('؛', '؛'), true);
  assert.equal(compareExpectedCharacter('؟', '؟'), true);
});

test('2. Arabic Segmentation - Letters, Diacritics, and Spaces', () => {
  const text = 'ب ت بَ';
  const segments = segmentArabicText(text);
  assert.deepEqual(segments, ['ب', ' ', 'ت', ' ', 'ب', 'َ']);
  assert.equal(segments.length, 6);
});

test('3. Exact Scenario from Requirement 13: ب ب ب ب ب ب ب ب ب ب on Virtual Keyboard', () => {
  const target = 'ب ب ب ب ب ب ب ب ب ب';
  const controller = new TypingInputController({
    targetText: target,
    typingMode: 'normal',
  });

  assert.equal(controller.getCurrentIndex(), 0);
  assert.equal(controller.getStats().charStatuses[0], 'current');

  // User taps "ب" on Android Arabic keyboard
  let result = controller.processCharacterInput('ب', 'virtual');
  assert.equal(result.accepted, true);
  assert.equal(result.isMatch, true);
  assert.equal(controller.getCurrentIndex(), 1);
  assert.equal(controller.getStats().charStatuses[0], 'correct');
  assert.equal(controller.getStats().charStatuses[1], 'current');

  // User taps Space
  result = controller.processCharacterInput(' ', 'virtual');
  assert.equal(result.accepted, true);
  assert.equal(controller.getCurrentIndex(), 2);
  assert.equal(controller.getStats().charStatuses[1], 'correct');
  assert.equal(controller.getStats().charStatuses[2], 'current');

  // User taps "ب" again
  result = controller.processCharacterInput('ب', 'virtual');
  assert.equal(result.accepted, true);
  assert.equal(controller.getCurrentIndex(), 3);
  assert.equal(controller.getStats().charStatuses[2], 'correct');
  assert.equal(controller.getStats().charStatuses[3], 'current');
});

test('4. Incorrect Character Handling in Normal Mode vs Strict Mode', () => {
  // Normal Mode
  const normalController = new TypingInputController({
    targetText: 'ب ت',
    typingMode: 'normal',
  });

  // Type incorrect character 'س'
  let res = normalController.processCharacterInput('س', 'virtual');
  assert.equal(res.accepted, true);
  assert.equal(res.isMatch, false);
  // Advances in normal mode with incorrect status
  assert.equal(normalController.getCurrentIndex(), 1);
  assert.equal(normalController.getStats().charStatuses[0], 'incorrect');
  assert.equal(normalController.getStats().incorrectCharsCount, 1);

  // Strict Mode
  const strictController = new TypingInputController({
    targetText: 'ب ت',
    typingMode: 'strict',
  });

  // Type incorrect character 'س'
  res = strictController.processCharacterInput('س', 'virtual');
  assert.equal(res.accepted, false);
  assert.equal(res.isMatch, false);
  // Does NOT advance in strict mode
  assert.equal(strictController.getCurrentIndex(), 0);
  assert.equal(strictController.getStats().charStatuses[0], 'incorrect');
  assert.equal(strictController.getStrictErrorChar(), 'س');

  // Now type the correct character 'ب' in strict mode
  res = strictController.processCharacterInput('ب', 'virtual');
  assert.equal(res.accepted, true);
  assert.equal(res.isMatch, true);
  assert.equal(strictController.getCurrentIndex(), 1);
  assert.equal(strictController.getStats().charStatuses[0], 'correct');
  assert.equal(strictController.getStrictErrorChar(), null);
});

test('5. Backspace on Android Virtual Keyboard and Physical Keyboard', () => {
  const controller = new TypingInputController({
    targetText: 'ب ت ث',
    typingMode: 'normal',
  });

  controller.processCharacterInput('ب', 'virtual');
  controller.processCharacterInput(' ', 'virtual');
  assert.equal(controller.getCurrentIndex(), 2);

  // Backspace once
  const handled1 = controller.handleBackspace('virtual');
  assert.equal(handled1, true);
  assert.equal(controller.getCurrentIndex(), 1);
  assert.equal(controller.getStats().charStatuses[1], 'current');
  assert.equal(controller.getStats().charStatuses[2], 'pending');

  // Backspace again
  const handled2 = controller.handleBackspace('physical');
  assert.equal(handled2, true);
  assert.equal(controller.getCurrentIndex(), 0);
  assert.equal(controller.getStats().charStatuses[0], 'current');

  // Backspace at 0 should return false
  const handled3 = controller.handleBackspace('virtual');
  assert.equal(handled3, false);
  assert.equal(controller.getCurrentIndex(), 0);
});

test('6. Arabic Diacritics and Combining Marks Support', () => {
  // Target: 'كَتَبَ' (Kaf, Fatha, Ta, Fatha, Ba, Fatha)
  const targetWithDiacritics = 'كَتَبَ';
  const controller = new TypingInputController({
    targetText: targetWithDiacritics,
    typingMode: 'strict',
  });

  const chars = segmentArabicText(targetWithDiacritics);
  assert.equal(chars.length, 6);
  assert.deepEqual(chars, ['ك', 'َ', 'ت', 'َ', 'ب', 'َ']);

  // Type each letter and diacritic in order
  for (let i = 0; i < chars.length; i++) {
    const res = controller.processCharacterInput(chars[i], 'virtual');
    assert.equal(res.accepted, true);
    assert.equal(res.isMatch, true);
    assert.equal(controller.getCurrentIndex(), i + 1);
  }

  assert.equal(controller.isLessonFinished(), true);
  assert.equal(controller.getStats().progressPercent, 100);
});

test('7. Physical Arabic 101 Keyboard Key Mapping', () => {
  // KeyF -> ب
  assert.equal(getArabicCharFromPhysicalKey('KeyF', false), 'ب');
  // KeyJ -> ت
  assert.equal(getArabicCharFromPhysicalKey('KeyJ', false), 'ت');
  // KeyQ with Shift -> َ (Fatha)
  assert.equal(getArabicCharFromPhysicalKey('KeyQ', true), 'َ');
  // KeyE with Shift -> ُ (Damma)
  assert.equal(getArabicCharFromPhysicalKey('KeyE', true), 'ُ');
  // Space -> ' '
  assert.equal(getArabicCharFromPhysicalKey('Space', false), ' ');

  const controller = new TypingInputController({
    targetText: 'ب ت',
    typingMode: 'normal',
  });

  // Simulate physical keydown for KeyF (ب) on English physical keyboard
  let prevented = false;
  const simEventF = {
    key: 'f',
    code: 'KeyF',
    shiftKey: false,
    preventDefault: () => {
      prevented = true;
    },
  };

  const outcomeF = controller.handlePhysicalKeyboardInput(simEventF);
  assert.equal(outcomeF.handled, true);
  assert.equal(prevented, true);
  assert.equal(controller.getCurrentIndex(), 1);
  assert.equal(controller.getStats().charStatuses[0], 'correct');
});

test('8. Real-time HUD Stats Calculation', () => {
  const controller = new TypingInputController({
    targetText: 'ب ت ث ج',
    typingMode: 'normal',
  });

  // Type correctly
  controller.processCharacterInput('ب');
  controller.processCharacterInput(' ');
  // Type error
  controller.processCharacterInput('س'); // Expected 'ت'
  // Elapsed time 10 seconds
  controller.tick(10);

  const stats = controller.getStats();
  assert.equal(stats.correctCharsCount, 2);
  assert.equal(stats.incorrectCharsCount, 1);
  assert.equal(stats.totalKeystrokes, 3);
  assert.equal(stats.accuracy, 67); // (3 - 1) / 3 * 100 = 67%
  assert.equal(stats.elapsedSeconds, 10);
  assert.equal(stats.progressPercent, 43); // 3 / 7 chars
  assert.equal(stats.wpm > 0, true);
});

test('9. Virtual Keyboard Batch/Delta Input Handling (Android Gboard style)', () => {
  const controller = new TypingInputController({
    targetText: 'لا إله إلا الله',
    typingMode: 'normal',
  });

  // Gboard sends string delta
  const results = controller.handleVirtualKeyboardInput('لا ');
  assert.equal(results.length, 3); // 'ل', 'ا', ' '
  assert.equal(controller.getCurrentIndex(), 3);
  assert.equal(controller.getStats().charStatuses[0], 'correct');
  assert.equal(controller.getStats().charStatuses[1], 'correct');
  assert.equal(controller.getStats().charStatuses[2], 'correct');
});
