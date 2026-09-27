// Single source of truth for Arabic alphabet keys and strict lesson validation

export const ALL_ARABIC_BASE_LETTERS: string[] = [
  'ب', 'ت', 'ي', 'ل', 'ا', 'ن', 'م', 'ك', 'س', 'ش',
  'ط', 'ذ', 'ق', 'ف', 'ع', 'غ', 'ه', 'خ', 'ح', 'ج',
  'ص', 'ض', 'د', 'ث', 'ر', 'ى', 'ة', 'و', 'ز', 'ظ',
  'ئ', 'ء', 'ؤ'
];

export interface LessonKeyRules {
  newKeys: string[];
  previouslyLearnedKeys: string[];
  allowedKeys: string[];
  forbiddenKeys: string[];
}

/**
 * Computes explicit newKeys, previouslyLearnedKeys, allowedKeys, and forbiddenKeys
 * following the progressive unlock curriculum.
 */
export function computeLessonKeyRules(
  newKeys: string[],
  previouslyLearnedKeys: string[]
): LessonKeyRules {
  // Normalize and deduplicate
  const cleanNew = Array.from(new Set(newKeys.filter(Boolean)));
  const cleanPrev = Array.from(new Set(previouslyLearnedKeys.filter((k) => !cleanNew.includes(k))));
  const allowed = Array.from(new Set([...cleanPrev, ...cleanNew]));
  const forbidden = ALL_ARABIC_BASE_LETTERS.filter((k) => !allowed.includes(k));

  return {
    newKeys: cleanNew,
    previouslyLearnedKeys: cleanPrev,
    allowedKeys: allowed,
    forbiddenKeys: forbidden,
  };
}

export interface ValidationResult {
  isValid: boolean;
  sanitizedText: string;
  invalidChars: string[];
}

/**
 * Automatic Content Validator
 * Validates practice text against lesson rules:
 * 1. Checks each character against allowedKeys
 * 2. Permits space ' '
 * 3. Strips unlearned letters, unexpected punctuation, Harakat (in beginner lessons), English letters, numbers, etc.
 * 4. Regenerates valid drill text if sanitized text is empty.
 */
export function validateAndSanitizeLessonText(
  rawText: string,
  allowedKeys: string[],
  options?: {
    allowDiacritics?: boolean;
    allowPunctuation?: boolean;
    fallbackSeed?: string;
  }
): ValidationResult {
  if (!rawText) {
    const seed = options?.fallbackSeed || (allowedKeys.length > 0 ? allowedKeys.join(' ') : 'ب ت');
    return {
      isValid: false,
      sanitizedText: seed,
      invalidChars: [],
    };
  }

  const allowedSet = new Set(allowedKeys);
  const invalidCharsFound: string[] = [];
  const validChars: string[] = [];

  for (let i = 0; i < rawText.length; i++) {
    const ch = rawText[i];

    // Permitted space
    if (ch === ' ' || ch === '\n' || ch === '\t') {
      validChars.push(' ');
      continue;
    }

    // Permitted allowed key
    if (allowedSet.has(ch)) {
      validChars.push(ch);
      continue;
    }

    // Harakat handling: if allowed explicitly, permit
    if (options?.allowDiacritics && /[\u064B-\u065F\u0670]/.test(ch)) {
      validChars.push(ch);
      continue;
    }

    // Punctuation handling: if allowed explicitly, permit
    if (options?.allowPunctuation && /[.,?!:;«»،؛؟]/.test(ch)) {
      validChars.push(ch);
      continue;
    }

    // Otherwise strictly invalid
    if (!invalidCharsFound.includes(ch)) {
      invalidCharsFound.push(ch);
    }
  }

  // Collapse consecutive spaces and trim
  let cleaned = validChars.join('').replace(/\s+/g, ' ').trim();

  // If text became too short after stripping invalid characters, regenerate from allowed keys
  if (cleaned.length < 3 && allowedKeys.length > 0) {
    const k1 = allowedKeys[0];
    const k2 = allowedKeys.length > 1 ? allowedKeys[1] : allowedKeys[0];
    cleaned = `${k1} ${k2} ${k1} ${k2} ${k1}${k2} ${k2}${k1} ${k1} ${k2}`;
  }

  return {
    isValid: invalidCharsFound.length === 0 && cleaned.length > 0,
    sanitizedText: cleaned,
    invalidChars: invalidCharsFound,
  };
}

/**
 * Convenience helper to sanitize and return clean text.
 */
export function sanitizeLessonText(
  rawText: string,
  allowedKeys: string[],
  options?: {
    allowDiacritics?: boolean;
    allowPunctuation?: boolean;
    fallbackSeed?: string;
  }
): string {
  return validateAndSanitizeLessonText(rawText, allowedKeys, options).sanitizedText;
}
