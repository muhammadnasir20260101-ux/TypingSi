import { TypingMode } from '../types';
import { KEYBOARD_ROWS, mapPhysicalKeyToArabic101 } from '../data/keyboard101';

export type CharStatus = 'pending' | 'current' | 'correct' | 'incorrect';

export interface TypingEngineStats {
  targetText: string;
  targetCharacters: string[];
  typedText: string;
  currentIndex: number;
  correctCharsCount: number;
  incorrectCharsCount: number;
  totalKeystrokes: number;
  backspacesCount: number;
  wpm: number;
  cpm: number;
  accuracy: number;
  elapsedSeconds: number;
  remainingSeconds: number | null;
  progressPercent: number;
  isStarted: boolean;
  isFinished: boolean;
  charStatuses: CharStatus[];
  mistakeChars: Record<string, number>;
  strictErrorChar: string | null;
}

export interface ProcessInputResult {
  accepted: boolean;
  isMatch: boolean;
  char: string;
  expectedChar: string;
  currentIndex: number;
  isFinished: boolean;
}

// Arabic diacritics / harakat range
const ARABIC_DIACRITICS = new Set([
  '\u064E', // Fatha َ
  '\u064F', // Damma ُ
  '\u0650', // Kasra ِ
  '\u0651', // Shadda ّ
  '\u0652', // Sukun ْ
  '\u064B', // Fathatan / Tanwin Fath ً
  '\u064C', // Dammatan / Tanwin Damm ٌ
  '\u064D', // Kasratan / Tanwin Kasr ٍ
  '\u0670', // Dagger Alif ٰ
]);

/**
 * Normalizes Arabic input for robust comparison.
 * Uses Unicode NFC to canonicalize decomposed sequences (e.g. Alif + Hamza Above -> أ)
 * Preserves meaningful characters such as individual letters, harakat, and distinct hamzas.
 */
export function normalizeArabicInput(str: string): string {
  if (!str) return '';
  // Canonical Unicode normalization (NFC)
  let normalized = str.normalize('NFC');

  // Convert non-breaking spaces or Unicode spaces to standard space
  if (/^[\s\u00A0\u2000-\u200B\u202F\u205F\u3000]$/.test(normalized)) {
    return ' ';
  }

  // Persian/Urdu Yeh variant to Arabic Yeh if needed
  if (normalized === 'ی') {
    return 'ي';
  }
  // Persian/Urdu Kaf variant to Arabic Kaf if needed
  if (normalized === 'ک') {
    return 'ك';
  }

  return normalized;
}

/**
 * Compare an entered character with the expected character at the current index.
 */
export function compareExpectedCharacter(inputChar: string, expectedChar: string): boolean {
  if (!inputChar || !expectedChar) return false;

  // 1. Direct exact match
  if (inputChar === expectedChar) {
    return true;
  }

  // 2. Normalized NFC match
  const normInput = normalizeArabicInput(inputChar);
  const normExpected = normalizeArabicInput(expectedChar);
  if (normInput === normExpected) {
    return true;
  }

  // 3. Space variations match
  if (normInput === ' ' && normExpected === ' ') {
    return true;
  }

  // 4. Arabic comma / semicolon / question mark fallback
  if ((inputChar === '،' && expectedChar === ',') || (inputChar === ',' && expectedChar === '،')) {
    return true;
  }
  if ((inputChar === '؛' && expectedChar === ';') || (inputChar === ';' && expectedChar === '؛')) {
    return true;
  }
  if ((inputChar === '؟' && expectedChar === '?') || (inputChar === '?' && expectedChar === '؟')) {
    return true;
  }

  return false;
}

/**
 * Segmentation helper that splits target text into logical typing characters.
 * Handles Unicode surrogate pairs, Arabic letters, diacritics, and symbols.
 */
export function segmentArabicText(text: string): string[] {
  if (!text) return [];
  // Normalize to NFC first so composed characters like أ, إ, آ are single code points
  const normalized = text.normalize('NFC');
  // Array.from splits correctly by Unicode code points
  return Array.from(normalized);
}

// Physical key mapping table from Arabic 101 layout
const PHYSICAL_CODE_MAP = new Map<string, { unshifted: string; shifted?: string }>();

for (const row of KEYBOARD_ROWS) {
  for (const key of row) {
    if (key.code && !key.isSpecial) {
      PHYSICAL_CODE_MAP.set(key.code, {
        unshifted: key.labelAr || '',
        shifted: key.shiftAr,
      });
    }
  }
}

// Ensure Space is mapped
PHYSICAL_CODE_MAP.set('Space', { unshifted: ' ', shifted: ' ' });

/**
 * Maps a physical keyboard event (e.code + shiftKey) to the Arabic 101 character.
 * This allows typing Arabic even if the user's OS is currently using an English layout.
 */
export function getArabicCharFromPhysicalKey(code: string, shift: boolean, key?: string): string | null {
  return mapPhysicalKeyToArabic101(code, key, shift);
}

/**
 * Checks whether a character is an Arabic diacritic (Harakah)
 */
export function isArabicDiacritic(char: string): boolean {
  return ARABIC_DIACRITICS.has(char);
}

export interface TypingInputControllerOptions {
  targetText: string;
  typingMode?: TypingMode;
  timeLimitSeconds?: number;
  onComplete?: (stats: TypingEngineStats) => void;
  onCharacterAccepted?: (result: ProcessInputResult) => void;
  onError?: (expected: string, actual: string) => void;
  onBackspace?: () => void;
}

/**
 * TypingInputController
 * Centralized, deterministic controller for Arabic typing input.
 * Unifies physical keyboard, mobile virtual keyboard, and visual keyboard clicks.
 */
export class TypingInputController {
  private targetText: string = '';
  private targetCharacters: string[] = [];
  private typedCharacters: string[] = [];
  private currentIndex: number = 0;
  private charStatuses: CharStatus[] = [];
  private typingMode: TypingMode = 'normal';
  private timeLimitSeconds: number = 0;

  private isStarted: boolean = false;
  private isFinished: boolean = false;
  private startTime: number | null = null;
  private elapsedSeconds: number = 0;

  private totalKeystrokes: number = 0;
  private correctCharsCount: number = 0;
  private incorrectCharsCount: number = 0;
  private backspacesCount: number = 0;
  private mistakeChars: Record<string, number> = {};
  private strictErrorChar: string | null = null;

  private onComplete?: (stats: TypingEngineStats) => void;
  private onCharacterAccepted?: (result: ProcessInputResult) => void;
  private onError?: (expected: string, actual: string) => void;
  private onBackspaceCb?: () => void;

  constructor(options: TypingInputControllerOptions) {
    this.onComplete = options.onComplete;
    this.onCharacterAccepted = options.onCharacterAccepted;
    this.onError = options.onError;
    this.onBackspaceCb = options.onBackspace;
    this.timeLimitSeconds = options.timeLimitSeconds || 0;
    this.reset(options.targetText, options.typingMode || 'normal');
  }

  public reset(targetText: string, typingMode: TypingMode = 'normal'): void {
    this.targetText = targetText;
    this.typingMode = typingMode;
    this.targetCharacters = segmentArabicText(targetText);
    this.typedCharacters = [];
    this.currentIndex = 0;
    this.charStatuses = this.targetCharacters.map((_, i) => (i === 0 ? 'current' : 'pending'));
    this.isStarted = false;
    this.isFinished = false;
    this.startTime = null;
    this.elapsedSeconds = 0;
    this.totalKeystrokes = 0;
    this.correctCharsCount = 0;
    this.incorrectCharsCount = 0;
    this.backspacesCount = 0;
    this.mistakeChars = {};
    this.strictErrorChar = null;
  }

  public startTimerIfNeeded(): void {
    if (!this.isStarted && !this.isFinished) {
      this.isStarted = true;
      this.startTime = Date.now();
    }
  }

  public tick(secondsDelta: number = 1): void {
    if (!this.isStarted || this.isFinished) return;
    this.elapsedSeconds += secondsDelta;
    if (this.timeLimitSeconds > 0 && this.elapsedSeconds >= this.timeLimitSeconds) {
      this.finish();
    }
  }

  public finish(): void {
    if (this.isFinished) return;
    this.isFinished = true;
    if (this.onComplete) {
      this.onComplete(this.getStats());
    }
  }

  /**
   * Process a single character entry (from physical keyboard, mobile IME, or visual keyboard)
   */
  public processCharacterInput(
    rawChar: string,
    _source: 'virtual' | 'physical' | 'click' = 'virtual'
  ): ProcessInputResult {
    if (this.isFinished) {
      return {
        accepted: false,
        isMatch: false,
        char: rawChar,
        expectedChar: '',
        currentIndex: this.currentIndex,
        isFinished: true,
      };
    }

    if (!rawChar || rawChar.length === 0) {
      return {
        accepted: false,
        isMatch: false,
        char: '',
        expectedChar: this.targetCharacters[this.currentIndex] || '',
        currentIndex: this.currentIndex,
        isFinished: false,
      };
    }

    this.startTimerIfNeeded();

    // If target completed already
    if (this.currentIndex >= this.targetCharacters.length) {
      this.finish();
      return {
        accepted: false,
        isMatch: false,
        char: rawChar,
        expectedChar: '',
        currentIndex: this.currentIndex,
        isFinished: true,
      };
    }

    const expectedChar = this.targetCharacters[this.currentIndex];
    const isMatch = compareExpectedCharacter(rawChar, expectedChar);
    this.totalKeystrokes++;

    if (isMatch) {
      // Successful match
      this.correctCharsCount++;
      this.strictErrorChar = null;
      this.charStatuses[this.currentIndex] = 'correct';
      this.typedCharacters.push(rawChar);
      this.currentIndex++;

      // Advance visual cursor
      if (this.currentIndex < this.targetCharacters.length) {
        this.charStatuses[this.currentIndex] = 'current';
      }

      const isCompleted = this.currentIndex >= this.targetCharacters.length;

      const result: ProcessInputResult = {
        accepted: true,
        isMatch: true,
        char: rawChar,
        expectedChar,
        currentIndex: this.currentIndex,
        isFinished: isCompleted,
      };

      if (this.onCharacterAccepted) {
        this.onCharacterAccepted(result);
      }

      if (isCompleted) {
        this.finish();
      }

      return result;
    } else {
      // Mismatch
      this.incorrectCharsCount++;
      this.mistakeChars[expectedChar] = (this.mistakeChars[expectedChar] || 0) + 1;

      if (this.onError) {
        this.onError(expectedChar, rawChar);
      }

      if (this.typingMode === 'strict') {
        // Strict mode: freeze on current character until learner types the correct one
        this.strictErrorChar = rawChar;
        this.charStatuses[this.currentIndex] = 'incorrect';

        return {
          accepted: false,
          isMatch: false,
          char: rawChar,
          expectedChar,
          currentIndex: this.currentIndex,
          isFinished: false,
        };
      } else {
        // Normal mode: record incorrect, append character and advance cursor
        this.charStatuses[this.currentIndex] = 'incorrect';
        this.typedCharacters.push(rawChar);
        this.currentIndex++;

        if (this.currentIndex < this.targetCharacters.length) {
          this.charStatuses[this.currentIndex] = 'current';
        }

        const isCompleted = this.currentIndex >= this.targetCharacters.length;

        const result: ProcessInputResult = {
          accepted: true,
          isMatch: false,
          char: rawChar,
          expectedChar,
          currentIndex: this.currentIndex,
          isFinished: isCompleted,
        };

        if (this.onCharacterAccepted) {
          this.onCharacterAccepted(result);
        }

        if (isCompleted) {
          this.finish();
        }

        return result;
      }
    }
  }

  /**
   * Process a sequence of characters (e.g. from mobile virtual keyboard input delta or ligature)
   */
  public processStringInput(
    str: string,
    source: 'virtual' | 'physical' = 'virtual'
  ): ProcessInputResult[] {
    // If incoming string has English characters (e.g. Android OTG input event synthesizing keycap letter like 'f'),
    // translate each letter to its Arabic 101 character so 'f' strictly becomes 'ب'
    let sanitized = '';
    for (let i = 0; i < str.length; i++) {
      const ch = str[i];
      if (/[a-zA-Z]/.test(ch)) {
        const mapped = mapPhysicalKeyToArabic101(undefined, ch, ch >= 'A' && ch <= 'Z');
        sanitized += mapped || ch;
      } else {
        sanitized += ch;
      }
    }

    const chars = segmentArabicText(sanitized);
    const results: ProcessInputResult[] = [];
    for (const char of chars) {
      if (this.isFinished) break;
      results.push(this.processCharacterInput(char, source));
    }
    return results;
  }

  /**
   * Handle Backspace event from physical or virtual keyboard
   */
  public handleBackspace(_source: 'virtual' | 'physical' = 'virtual'): boolean {
    if (this.isFinished) return false;

    // If there is an active strict error on current character, clear error state first
    if (this.strictErrorChar !== null) {
      this.strictErrorChar = null;
      this.charStatuses[this.currentIndex] = 'current';
      if (this.onBackspaceCb) {
        this.onBackspaceCb();
      }
      return true;
    }

    if (this.currentIndex === 0) {
      return false;
    }

    this.backspacesCount++;
    const oldCurrent = this.currentIndex;
    this.currentIndex--;
    this.typedCharacters.pop();

    this.charStatuses[this.currentIndex] = 'current';
    if (oldCurrent < this.targetCharacters.length) {
      this.charStatuses[oldCurrent] = 'pending';
    }

    if (this.onBackspaceCb) {
      this.onBackspaceCb();
    }
    return true;
  }

  /**
   * Process physical keyboard keydown event.
   * Returns whether the event was handled and should prevent default.
   */
  public handlePhysicalKeyboardInput(e: {
    key: string;
    code: string;
    shiftKey: boolean;
    ctrlKey?: boolean;
    metaKey?: boolean;
    altKey?: boolean;
    preventDefault?: () => void;
  }): { handled: boolean; result?: ProcessInputResult } {
    if (this.isFinished) return { handled: false };
    if (e.ctrlKey || e.metaKey || e.altKey) return { handled: false };

    // Ignore mobile composition/unidentified keys in keydown
    if (e.key === 'Unidentified' || e.key === 'Dead') {
      return { handled: false };
    }

    if (e.key === 'Backspace' || e.code === 'Backspace') {
      if (e.preventDefault) e.preventDefault();
      this.handleBackspace('physical');
      return { handled: true };
    }

    if (e.key === 'Tab' || e.code === 'Tab') {
      if (e.preventDefault) e.preventDefault();
      return { handled: true };
    }

    // Determine Arabic character strictly from existing Arabic 101 keyboard layout
    let charToProcess = mapPhysicalKeyToArabic101(e.code, e.key, e.shiftKey);

    if (!charToProcess) {
      // Fallback: Check if e.key is already an Arabic character or Space
      const isArabicChar = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\s]/.test(e.key);
      if (isArabicChar && e.key.length === 1) {
        charToProcess = e.key;
      }
    }

    if (charToProcess) {
      if (e.preventDefault) e.preventDefault();
      const result = this.processCharacterInput(charToProcess, 'physical');
      return { handled: true, result };
    }

    return { handled: false };
  }

  /**
   * Process virtual keyboard input string (e.g. from Android Chrome InputEvent or content delta)
   */
  public handleVirtualKeyboardInput(newInputText: string): ProcessInputResult[] {
    return this.processStringInput(newInputText, 'virtual');
  }

  /**
   * Calculate real-time typing statistics
   */
  public getStats(): TypingEngineStats {
    const minutes = this.elapsedSeconds > 0 ? this.elapsedSeconds / 60 : 0;
    const words = this.correctCharsCount / 5;
    const wpm = minutes > 0 && this.correctCharsCount > 0 ? Math.max(0, Math.round(words / minutes)) : 0;
    const cpm = minutes > 0 && this.correctCharsCount > 0 ? Math.max(0, Math.round(this.correctCharsCount / minutes)) : 0;

    let accuracy = 100;
    if (this.totalKeystrokes > 0) {
      const acc = Math.round(((this.totalKeystrokes - this.incorrectCharsCount) / this.totalKeystrokes) * 100);
      accuracy = Math.max(0, Math.min(100, acc));
    }

    const totalTarget = this.targetCharacters.length;
    const progressPercent = totalTarget > 0 ? Math.min(100, Math.round((this.currentIndex / totalTarget) * 100)) : 0;
    const remainingSeconds = this.timeLimitSeconds > 0 ? Math.max(0, this.timeLimitSeconds - this.elapsedSeconds) : null;

    return {
      targetText: this.targetText,
      targetCharacters: [...this.targetCharacters],
      typedText: this.typedCharacters.join(''),
      currentIndex: this.currentIndex,
      correctCharsCount: this.correctCharsCount,
      incorrectCharsCount: this.incorrectCharsCount,
      totalKeystrokes: this.totalKeystrokes,
      backspacesCount: this.backspacesCount,
      wpm,
      cpm,
      accuracy,
      elapsedSeconds: this.elapsedSeconds,
      remainingSeconds,
      progressPercent,
      isStarted: this.isStarted,
      isFinished: this.isFinished,
      charStatuses: [...this.charStatuses],
      mistakeChars: { ...this.mistakeChars },
      strictErrorChar: this.strictErrorChar,
    };
  }

  public getCurrentIndex(): number {
    return this.currentIndex;
  }

  public getTargetCharacters(): string[] {
    return [...this.targetCharacters];
  }

  public getCharStatuses(): CharStatus[] {
    return [...this.charStatuses];
  }

  public getTypedText(): string {
    return this.typedCharacters.join('');
  }

  public getStrictErrorChar(): string | null {
    return this.strictErrorChar;
  }

  public isLessonFinished(): boolean {
    return this.isFinished;
  }
}
