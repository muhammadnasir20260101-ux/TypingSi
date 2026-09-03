import { FingerName, KeyboardKeyDef } from '../types';

export interface FingerInfo {
  name: FingerName;
  labelAr: string;
  labelEn: string;
  labelBn: string;
  hand: 'left' | 'right';
  color: string;
  twColor: string;
  twBg: string;
  twBorder: string;
}

export const FINGER_DETAILS: Record<FingerName, FingerInfo> = {
  'left-pinky': {
    name: 'left-pinky',
    labelAr: 'خنصر اليد اليسرى',
    labelEn: 'Left Pinky',
    labelBn: 'বাম কনিষ্ঠা',
    hand: 'left',
    color: '#ec4899', // pink-500
    twColor: 'text-pink-500 dark:text-pink-400',
    twBg: 'bg-pink-100 dark:bg-pink-950/60',
    twBorder: 'border-pink-500',
  },
  'left-ring': {
    name: 'left-ring',
    labelAr: 'بنصر اليد اليسرى',
    labelEn: 'Left Ring',
    labelBn: 'বাম অনামিকা',
    hand: 'left',
    color: '#a855f7', // purple-500
    twColor: 'text-purple-500 dark:text-purple-400',
    twBg: 'bg-purple-100 dark:bg-purple-950/60',
    twBorder: 'border-purple-500',
  },
  'left-middle': {
    name: 'left-middle',
    labelAr: 'وسطى اليد اليسرى',
    labelEn: 'Left Middle',
    labelBn: 'বাম মধ্যমা',
    hand: 'left',
    color: '#3b82f6', // blue-500
    twColor: 'text-blue-500 dark:text-blue-400',
    twBg: 'bg-blue-100 dark:bg-blue-950/60',
    twBorder: 'border-blue-500',
  },
  'left-index': {
    name: 'left-index',
    labelAr: 'سبابة اليد اليسرى',
    labelEn: 'Left Index',
    labelBn: 'বাম তর্জনী',
    hand: 'left',
    color: '#06b6d4', // cyan-500
    twColor: 'text-cyan-500 dark:text-cyan-400',
    twBg: 'bg-cyan-100 dark:bg-cyan-950/60',
    twBorder: 'border-cyan-500',
  },
  'thumb': {
    name: 'thumb',
    labelAr: 'الإبهام (المسافة)',
    labelEn: 'Thumb (Space)',
    labelBn: 'বৃদ্ধাঙ্গুলি',
    hand: 'right',
    color: '#10b981', // emerald-500
    twColor: 'text-emerald-500 dark:text-emerald-400',
    twBg: 'bg-emerald-100 dark:bg-emerald-950/60',
    twBorder: 'border-emerald-500',
  },
  'right-index': {
    name: 'right-index',
    labelAr: 'سبابة اليد اليمنى',
    labelEn: 'Right Index',
    labelBn: 'ডান তর্জনী',
    hand: 'right',
    color: '#14b8a6', // teal-500
    twColor: 'text-teal-500 dark:text-teal-400',
    twBg: 'bg-teal-100 dark:bg-teal-950/60',
    twBorder: 'border-teal-500',
  },
  'right-middle': {
    name: 'right-middle',
    labelAr: 'وسطى اليد اليمنى',
    labelEn: 'Right Middle',
    labelBn: 'ডান মধ্যমা',
    hand: 'right',
    color: '#f59e0b', // amber-500
    twColor: 'text-amber-500 dark:text-amber-400',
    twBg: 'bg-amber-100 dark:bg-amber-950/60',
    twBorder: 'border-amber-500',
  },
  'right-ring': {
    name: 'right-ring',
    labelAr: 'بنصر اليد اليمنى',
    labelEn: 'Right Ring',
    labelBn: 'ডান অনামিকা',
    hand: 'right',
    color: '#f97316', // orange-500
    twColor: 'text-orange-500 dark:text-orange-400',
    twBg: 'bg-orange-100 dark:bg-orange-950/60',
    twBorder: 'border-orange-500',
  },
  'right-pinky': {
    name: 'right-pinky',
    labelAr: 'خنصر اليد اليمنى',
    labelEn: 'Right Pinky',
    labelBn: 'ডান কনিষ্ঠা',
    hand: 'right',
    color: '#ef4444', // red-500
    twColor: 'text-red-500 dark:text-red-400',
    twBg: 'bg-red-100 dark:bg-red-950/60',
    twBorder: 'border-red-500',
  },
};

export const KEYBOARD_ROWS: KeyboardKeyDef[][] = [
  // Row 1: Numbers & Diacritics/Symbols
  [
    { id: 'Backquote', code: 'Backquote', labelAr: 'ذ', shiftAr: 'ّ', labelEn: '`', shiftEn: '~', finger: 'left-pinky' },
    { id: 'Digit1', code: 'Digit1', labelAr: '١', shiftAr: '!', labelEn: '1', shiftEn: '!', finger: 'left-pinky' },
    { id: 'Digit2', code: 'Digit2', labelAr: '٢', shiftAr: '@', labelEn: '2', shiftEn: '@', finger: 'left-ring' },
    { id: 'Digit3', code: 'Digit3', labelAr: '٣', shiftAr: '#', labelEn: '3', shiftEn: '#', finger: 'left-middle' },
    { id: 'Digit4', code: 'Digit4', labelAr: '٤', shiftAr: '$', labelEn: '4', shiftEn: '$', finger: 'left-index' },
    { id: 'Digit5', code: 'Digit5', labelAr: '٥', shiftAr: '%', labelEn: '5', shiftEn: '%', finger: 'left-index' },
    { id: 'Digit6', code: 'Digit6', labelAr: '٦', shiftAr: '^', labelEn: '6', shiftEn: '^', finger: 'right-index' },
    { id: 'Digit7', code: 'Digit7', labelAr: '٧', shiftAr: '&', labelEn: '7', shiftEn: '&', finger: 'right-index' },
    { id: 'Digit8', code: 'Digit8', labelAr: '٨', shiftAr: '*', labelEn: '8', shiftEn: '*', finger: 'right-middle' },
    { id: 'Digit9', code: 'Digit9', labelAr: '٩', shiftAr: ')', labelEn: '9', shiftEn: '(', finger: 'right-ring' },
    { id: 'Digit0', code: 'Digit0', labelAr: '٠', shiftAr: '(', labelEn: '0', shiftEn: ')', finger: 'right-pinky' },
    { id: 'Minus', code: 'Minus', labelAr: '-', shiftAr: '_', labelEn: '-', shiftEn: '_', finger: 'right-pinky' },
    { id: 'Equal', code: 'Equal', labelAr: '=', shiftAr: '+', labelEn: '=', shiftEn: '+', finger: 'right-pinky' },
    { id: 'Backspace', code: 'Backspace', labelAr: 'حذف', labelEn: 'Backspace', finger: 'right-pinky', width: 'w-[14%]', isSpecial: true },
  ],

  // Row 2: Upper Row
  [
    { id: 'Tab', code: 'Tab', labelAr: 'Tab', labelEn: 'Tab', finger: 'left-pinky', width: 'w-[10%]', isSpecial: true },
    { id: 'KeyQ', code: 'KeyQ', labelAr: 'ض', shiftAr: 'َ', labelEn: 'q', shiftEn: 'Q', finger: 'left-pinky' },
    { id: 'KeyW', code: 'KeyW', labelAr: 'ص', shiftAr: 'ً', labelEn: 'w', shiftEn: 'W', finger: 'left-ring' },
    { id: 'KeyE', code: 'KeyE', labelAr: 'ث', shiftAr: 'ُ', labelEn: 'e', shiftEn: 'E', finger: 'left-middle' },
    { id: 'KeyR', code: 'KeyR', labelAr: 'ق', shiftAr: 'ٌ', labelEn: 'r', shiftEn: 'R', finger: 'left-index' },
    { id: 'KeyT', code: 'KeyT', labelAr: 'ف', shiftAr: 'لإ', labelEn: 't', shiftEn: 'T', finger: 'left-index' },
    { id: 'KeyY', code: 'KeyY', labelAr: 'غ', shiftAr: 'إ', labelEn: 'y', shiftEn: 'Y', finger: 'right-index' },
    { id: 'KeyU', code: 'KeyU', labelAr: 'ع', shiftAr: '‘', labelEn: 'u', shiftEn: 'U', finger: 'right-index' },
    { id: 'KeyI', code: 'KeyI', labelAr: 'ه', shiftAr: '÷', labelEn: 'i', shiftEn: 'I', finger: 'right-middle' },
    { id: 'KeyO', code: 'KeyO', labelAr: 'خ', shiftAr: '×', labelEn: 'o', shiftEn: 'O', finger: 'right-ring' },
    { id: 'KeyP', code: 'KeyP', labelAr: 'ح', shiftAr: '؛', labelEn: 'p', shiftEn: 'P', finger: 'right-pinky' },
    { id: 'BracketLeft', code: 'BracketLeft', labelAr: 'ج', shiftAr: '<', labelEn: '[', shiftEn: '{', finger: 'right-pinky' },
    { id: 'BracketRight', code: 'BracketRight', labelAr: 'د', shiftAr: '>', labelEn: ']', shiftEn: '}', finger: 'right-pinky' },
    { id: 'Backslash', code: 'Backslash', labelAr: '\\', shiftAr: '|', labelEn: '\\', shiftEn: '|', finger: 'right-pinky', width: 'w-[9%]' },
  ],

  // Row 3: Home Row
  [
    { id: 'CapsLock', code: 'CapsLock', labelAr: 'Caps', labelEn: 'Caps', finger: 'left-pinky', width: 'w-[12%]', isSpecial: true },
    { id: 'KeyA', code: 'KeyA', labelAr: 'ش', shiftAr: 'ِ', labelEn: 'a', shiftEn: 'A', finger: 'left-pinky' },
    { id: 'KeyS', code: 'KeyS', labelAr: 'س', shiftAr: 'ٍ', labelEn: 's', shiftEn: 'S', finger: 'left-ring' },
    { id: 'KeyD', code: 'KeyD', labelAr: 'ي', shiftAr: ']', labelEn: 'd', shiftEn: 'D', finger: 'left-middle' },
    { id: 'KeyF', code: 'KeyF', labelAr: 'ب', shiftAr: '[', labelEn: 'f', shiftEn: 'F', finger: 'left-index' }, // Home row anchor (F)
    { id: 'KeyG', code: 'KeyG', labelAr: 'ل', shiftAr: 'لأ', labelEn: 'g', shiftEn: 'G', finger: 'left-index' },
    { id: 'KeyH', code: 'KeyH', labelAr: 'ا', shiftAr: 'أ', labelEn: 'h', shiftEn: 'H', finger: 'right-index' },
    { id: 'KeyJ', code: 'KeyJ', labelAr: 'ت', shiftAr: 'ـ', labelEn: 'j', shiftEn: 'J', finger: 'right-index' }, // Home row anchor (J)
    { id: 'KeyK', code: 'KeyK', labelAr: 'ن', shiftAr: '،', labelEn: 'k', shiftEn: 'K', finger: 'right-middle' },
    { id: 'KeyL', code: 'KeyL', labelAr: 'م', shiftAr: '/', labelEn: 'l', shiftEn: 'L', finger: 'right-ring' },
    { id: 'Semicolon', code: 'Semicolon', labelAr: 'ك', shiftAr: ':', labelEn: ';', shiftEn: ':', finger: 'right-pinky' },
    { id: 'Quote', code: 'Quote', labelAr: 'ط', shiftAr: '"', labelEn: '\'', shiftEn: '"', finger: 'right-pinky' },
    { id: 'Enter', code: 'Enter', labelAr: 'إدخال', labelEn: 'Enter', finger: 'right-pinky', width: 'w-[15%]', isSpecial: true },
  ],

  // Row 4: Lower Row
  [
    { id: 'ShiftLeft', code: 'ShiftLeft', labelAr: 'Shift', labelEn: 'Shift', finger: 'left-pinky', width: 'w-[14%]', isSpecial: true },
    { id: 'KeyZ', code: 'KeyZ', labelAr: 'ئ', shiftAr: '~', labelEn: 'z', shiftEn: 'Z', finger: 'left-pinky' },
    { id: 'KeyX', code: 'KeyX', labelAr: 'ء', shiftAr: 'ْ', labelEn: 'x', shiftEn: 'X', finger: 'left-ring' },
    { id: 'KeyC', code: 'KeyC', labelAr: 'ؤ', shiftAr: '}', labelEn: 'c', shiftEn: 'C', finger: 'left-middle' },
    { id: 'KeyV', code: 'KeyV', labelAr: 'ر', shiftAr: '{', labelEn: 'v', shiftEn: 'V', finger: 'left-index' },
    { id: 'KeyB', code: 'KeyB', labelAr: 'لا', shiftAr: 'لآ', labelEn: 'b', shiftEn: 'B', finger: 'left-index' },
    { id: 'KeyN', code: 'KeyN', labelAr: 'ى', shiftAr: 'آ', labelEn: 'n', shiftEn: 'N', finger: 'right-index' },
    { id: 'KeyM', code: 'KeyM', labelAr: 'ة', shiftAr: '\'', labelEn: 'm', shiftEn: 'M', finger: 'right-index' },
    { id: 'Comma', code: 'Comma', labelAr: 'و', shiftAr: ',', labelEn: ',', shiftEn: '<', finger: 'right-middle' },
    { id: 'Period', code: 'Period', labelAr: 'ز', shiftAr: '.', labelEn: '.', shiftEn: '>', finger: 'right-ring' },
    { id: 'Slash', code: 'Slash', labelAr: 'ظ', shiftAr: '؟', labelEn: '/', shiftEn: '?', finger: 'right-pinky' },
    { id: 'ShiftRight', code: 'ShiftRight', labelAr: 'Shift', labelEn: 'Shift', finger: 'right-pinky', width: 'w-[17%]', isSpecial: true },
  ],

  // Row 5: Space row
  [
    { id: 'ControlLeft', code: 'ControlLeft', labelAr: 'Ctrl', labelEn: 'Ctrl', finger: 'left-pinky', width: 'w-[8%]', isSpecial: true },
    { id: 'AltLeft', code: 'AltLeft', labelAr: 'Alt', labelEn: 'Alt', finger: 'thumb', width: 'w-[8%]', isSpecial: true },
    { id: 'Space', code: 'Space', labelAr: 'مسافة', labelEn: 'Space', finger: 'thumb', width: 'w-[52%]', isSpecial: true },
    { id: 'AltRight', code: 'AltRight', labelAr: 'Alt', labelEn: 'Alt', finger: 'thumb', width: 'w-[8%]', isSpecial: true },
    { id: 'ControlRight', code: 'ControlRight', labelAr: 'Ctrl', labelEn: 'Ctrl', finger: 'right-pinky', width: 'w-[8%]', isSpecial: true },
  ],
];

// Helper to look up any character and determine its key and Shift requirement
export interface CharKeyMatch {
  keyDef: KeyboardKeyDef;
  needsShift: boolean;
  finger: FingerName;
  char: string;
}

const CHAR_TO_KEY_CACHE = new Map<string, CharKeyMatch>();

// Precompute mapping
for (const row of KEYBOARD_ROWS) {
  for (const key of row) {
    if (key.labelAr && !key.isSpecial) {
      CHAR_TO_KEY_CACHE.set(key.labelAr, {
        keyDef: key,
        needsShift: false,
        finger: key.finger,
        char: key.labelAr,
      });
    }
    if (key.shiftAr) {
      CHAR_TO_KEY_CACHE.set(key.shiftAr, {
        keyDef: key,
        needsShift: true,
        finger: key.finger,
        char: key.shiftAr,
      });
    }
  }
}

// Explicit special mappings
CHAR_TO_KEY_CACHE.set(' ', {
  keyDef: KEYBOARD_ROWS[4][2], // Space
  needsShift: false,
  finger: 'thumb',
  char: ' ',
});

// Western numerals fallback to digit keys
const DIGIT_KEYS = ['Digit0', 'Digit1', 'Digit2', 'Digit3', 'Digit4', 'Digit5', 'Digit6', 'Digit7', 'Digit8', 'Digit9'];
for (let i = 0; i <= 9; i++) {
  const digitKey = KEYBOARD_ROWS[0].find(k => k.code === DIGIT_KEYS[i]);
  if (digitKey) {
    // English digit
    CHAR_TO_KEY_CACHE.set(String(i), {
      keyDef: digitKey,
      needsShift: false,
      finger: digitKey.finger,
      char: String(i),
    });
  }
}

export function findKeyForChar(char: string): CharKeyMatch | null {
  if (!char) return null;
  if (CHAR_TO_KEY_CACHE.has(char)) {
    return CHAR_TO_KEY_CACHE.get(char)!;
  }
  // Normalization checks (e.g. Alif variants)
  if (char === 'آ') {
    return CHAR_TO_KEY_CACHE.get('آ') || CHAR_TO_KEY_CACHE.get('ا') || null;
  }
  if (char === 'أ') {
    return CHAR_TO_KEY_CACHE.get('أ') || CHAR_TO_KEY_CACHE.get('ا') || null;
  }
  if (char === 'إ') {
    return CHAR_TO_KEY_CACHE.get('إ') || CHAR_TO_KEY_CACHE.get('ا') || null;
  }
  if (char === 'ة') {
    return CHAR_TO_KEY_CACHE.get('ة') || null;
  }
  if (char === 'ى') {
    return CHAR_TO_KEY_CACHE.get('ى') || null;
  }
  return null;
}
