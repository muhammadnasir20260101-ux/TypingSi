import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AlertCircle, CheckCircle, Clock, RotateCcw, Target, Zap, Keyboard } from 'lucide-react';
import { FontSize, Language, TypingMode } from '../types';
import { mapPhysicalKeyToArabic101 } from '../data/keyboard101';

interface LessonTypingAreaProps {
  targetText: string;
  typedText: string;
  charStatuses: ('pending' | 'current' | 'correct' | 'incorrect')[];
  wpm: number;
  accuracy: number;
  errors: number;
  elapsedSeconds: number;
  remainingSeconds: number | null;
  progressPercent: number;
  isFinished: boolean;
  typingMode: TypingMode;
  fontSize?: FontSize;
  lang?: Language;
  currentIndex?: number;
  onKeyPress: (char: string) => void;
  onPhysicalKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onVirtualInput?: (text: string) => void;
  onBackspace: () => void;
  onRestart: () => void;
}

export const LessonTypingArea: React.FC<LessonTypingAreaProps> = ({
  targetText,
  typedText,
  charStatuses,
  wpm,
  accuracy,
  errors,
  elapsedSeconds,
  remainingSeconds,
  progressPercent,
  isFinished,
  typingMode,
  fontSize = 'medium',
  lang = 'ar',
  currentIndex,
  onKeyPress,
  onPhysicalKeyDown,
  onVirtualInput,
  onBackspace,
  onRestart,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isFocused, setIsFocused] = useState<boolean>(true);
  const [isPhysicalKeyboardConnected, setIsPhysicalKeyboardConnected] = useState<boolean>(() => {
    try {
      return localStorage.getItem('tibaa_physical_keyboard_connected') === 'true';
    } catch {
      return false;
    }
  });
  const currentCharRef = useRef<HTMLSpanElement>(null);

  // Buffer tracking for mobile virtual keyboard input without resetting input.value on every character
  const lastValueRef = useRef<string>('');
  const lastBackspaceTimeRef = useRef<number>(0);
  const lastHandledKeyTimeRef = useRef<number>(0);

  const activeIndex = currentIndex !== undefined ? currentIndex : typedText.length;

  // Tokenize targetText into words and spaces to preserve Arabic cursive ligatures within words,
  // ensure natural word wrapping, and prevent isolated glyph fragmentation.
  const tokens = useMemo(() => {
    interface WordToken {
      type: 'word';
      startIndex: number;
      chars: { char: string; index: number }[];
    }
    interface SpaceToken {
      type: 'space';
      startIndex: number;
      index: number;
    }
    type Token = WordToken | SpaceToken;

    const result: Token[] = [];
    const chars: string[] = Array.from(targetText);
    let currentWordChars: { char: string; index: number }[] = [];
    let wordStartIndex = 0;

    for (let i = 0; i < chars.length; i++) {
      const char = chars[i];
      if (char === ' ') {
        if (currentWordChars.length > 0) {
          result.push({
            type: 'word',
            startIndex: wordStartIndex,
            chars: currentWordChars,
          });
          currentWordChars = [];
        }
        result.push({
          type: 'space',
          startIndex: i,
          index: i,
        });
      } else {
        if (currentWordChars.length === 0) {
          wordStartIndex = i;
        }
        currentWordChars.push({ char, index: i });
      }
    }

    if (currentWordChars.length > 0) {
      result.push({
        type: 'word',
        startIndex: wordStartIndex,
        chars: currentWordChars,
      });
    }

    return result;
  }, [targetText]);

  // Auto focus on mount, restart, and when targetText changes
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.value = '';
      inputRef.current.focus();
    }
    lastValueRef.current = '';
    setIsFocused(true);
  }, [targetText]);

  // Keep current character visible if text wraps or scrolls
  useEffect(() => {
    if (currentCharRef.current) {
      currentCharRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'nearest',
      });
    }
  }, [activeIndex]);

  const handleContainerClick = () => {
    if (inputRef.current) {
      inputRef.current.focus();
      setIsFocused(true);
    }
  };

  /**
   * Handle physical keydown events.
   * Android/iOS virtual keyboards emit 'Unidentified' or keyCode 229, which we bypass
   * so the browser's input/beforeinput events can capture the actual typed character.
   */
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (isFinished) return;

    // Detect virtual keyboard IME composition state on Android/mobile
    const isVirtualIme = e.key === 'Unidentified' || e.keyCode === 229 || e.nativeEvent.isComposing;
    if (isVirtualIme) {
      // Let onInput/onBeforeInput receive mobile virtual keyboard character!
      return;
    }

    // Valid physical key detected on hardware keyboard (OTG/USB/Bluetooth)
    if (!isPhysicalKeyboardConnected) {
      setIsPhysicalKeyboardConnected(true);
      try {
        localStorage.setItem('tibaa_physical_keyboard_connected', 'true');
      } catch {
        // ignore
      }
    }

    // Mark physical key timestamp to prevent any synthetic input/beforeinput event from processing
    lastHandledKeyTimeRef.current = Date.now();

    // Auto-repeat protection (Rule 5):
    // ONE physical press = ONE typing action.
    // If user holds a key down, it must NOT suddenly produce 5–6 characters!
    if (e.repeat) {
      e.preventDefault();
      if (inputRef.current) inputRef.current.value = '';
      lastValueRef.current = '';

      if (e.key === 'Backspace' || e.code === 'Backspace') {
        const now = Date.now();
        if (now - lastBackspaceTimeRef.current >= 120) {
          lastBackspaceTimeRef.current = now;
          onBackspace();
        }
      }
      return;
    }

    if (e.key === 'Tab' || e.code === 'Tab') {
      e.preventDefault();
      return;
    }

    if (e.key === 'Backspace' || e.code === 'Backspace') {
      e.preventDefault();
      if (inputRef.current) inputRef.current.value = '';
      lastValueRef.current = '';
      lastBackspaceTimeRef.current = Date.now();
      onBackspace();
      return;
    }

    // Modifier keys (Shift, Ctrl, Alt, CapsLock) pressed alone: ignore and do not process as character
    if (
      e.key === 'Shift' ||
      e.code === 'ShiftLeft' ||
      e.code === 'ShiftRight' ||
      e.key === 'Control' ||
      e.code === 'ControlLeft' ||
      e.code === 'ControlRight' ||
      e.key === 'Alt' ||
      e.code === 'AltLeft' ||
      e.code === 'AltRight' ||
      e.key === 'CapsLock' ||
      e.code === 'CapsLock'
    ) {
      return;
    }

    // Prevent default immediately for physical character keys so browser doesn't try to insert English text
    e.preventDefault();

    // Clear input field immediately so Android Chrome can NEVER buffer characters
    if (inputRef.current) {
      inputRef.current.value = '';
    }
    lastValueRef.current = '';

    // Pass to custom physical key handler if provided
    if (onPhysicalKeyDown) {
      onPhysicalKeyDown(e);
      return;
    }

    // Default physical key capture: map physical key strictly to Arabic 101 character
    const mappedChar = mapPhysicalKeyToArabic101(e.code, e.key, e.shiftKey);
    if (mappedChar) {
      onKeyPress(mappedChar);
      return;
    }

    // Direct single Arabic character or Space check
    if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
      if (/[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\s]/.test(e.key)) {
        onKeyPress(e.key);
        return;
      }
    }
  };

  /**
   * Primary virtual keyboard input handler (strictly for Android Chrome Gboard, Samsung Keyboard, iOS touchscreen IME)
   * Must NEVER process physical keyboard keystrokes or translate English letters into Arabic.
   */
  const handleInput = (e: React.FormEvent<HTMLInputElement>) => {
    if (isFinished) return;
    const inputElem = inputRef.current;
    if (!inputElem) return;

    // Deduplicate: If this input event was synthesized by Android after a physical keydown, ignore it completely!
    if (Date.now() - lastHandledKeyTimeRef.current < 600) {
      inputElem.value = '';
      lastValueRef.current = '';
      return;
    }

    const nativeEvent = e.nativeEvent as InputEvent;
    const currentVal = inputElem.value;
    const prevVal = lastValueRef.current;

    // 1. Backspace / Deletion detected from touchscreen virtual keyboard
    if (nativeEvent?.inputType === 'deleteContentBackward' || currentVal.length < prevVal.length) {
      inputElem.value = '';
      lastValueRef.current = '';
      if (Date.now() - lastBackspaceTimeRef.current > 100) {
        lastBackspaceTimeRef.current = Date.now();
        onBackspace();
      }
      return;
    }

    // 2. Discard any English/Latin characters - touchscreen Arabic keyboards NEVER produce Latin characters!
    // Any Latin characters in the input field can only be artifacts from a physical keyboard.
    if (/[a-zA-Z]/.test(currentVal) || (nativeEvent?.data && /[a-zA-Z]/.test(nativeEvent.data))) {
      inputElem.value = '';
      lastValueRef.current = '';
      return;
    }

    // 3. Extract genuine Arabic characters from mobile virtual keyboard
    let newlyAdded = '';
    if (nativeEvent?.data) {
      newlyAdded = nativeEvent.data;
    } else if (currentVal.length > prevVal.length) {
      newlyAdded = currentVal.slice(prevVal.length);
    } else if (currentVal !== prevVal) {
      newlyAdded = currentVal;
    } else if (currentVal.length > 0) {
      newlyAdded = currentVal;
    }

    if (newlyAdded) {
      // Only keep Arabic characters and space from touchscreen keyboard
      const arabicChars = Array.from(newlyAdded).filter((c) =>
        /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\s]/.test(c)
      );

      if (arabicChars.length > 0) {
        const textToProcess = arabicChars.join('');
        if (onVirtualInput) {
          onVirtualInput(textToProcess);
        } else {
          for (const char of arabicChars) {
            onKeyPress(char);
          }
        }
      }
    }

    // Always clear input element and buffer tracker
    inputElem.value = '';
    lastValueRef.current = '';
  };

  /**
   * Support beforeinput: intercept and discard any synthetic events caused by physical keys,
   * while allowing mobile virtual keyboard backspaces.
   */
  const handleBeforeInput = (e: React.FormEvent<HTMLInputElement>) => {
    if (isFinished) return;

    // Discard any synthetic event generated by physical keyboard within 600ms
    if (Date.now() - lastHandledKeyTimeRef.current < 600) {
      e.preventDefault();
      if (inputRef.current) inputRef.current.value = '';
      lastValueRef.current = '';
      return;
    }

    const nativeEvent = e.nativeEvent as InputEvent;
    if (!nativeEvent) return;

    // Discard any English/Latin characters synthesized from physical keyboard
    if (nativeEvent.data && /[a-zA-Z]/.test(nativeEvent.data)) {
      e.preventDefault();
      if (inputRef.current) inputRef.current.value = '';
      lastValueRef.current = '';
      return;
    }

    if (nativeEvent.inputType === 'deleteContentBackward') {
      if (Date.now() - lastBackspaceTimeRef.current > 100) {
        lastBackspaceTimeRef.current = Date.now();
        onBackspace();
      }
    }
  };

  // Anti-cheat: prevent paste
  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
  };

  // Format seconds to mm:ss
  const formatTime = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Font size classes
  const fontClasses: Record<FontSize, string> = {
    small: 'text-xl sm:text-2xl leading-relaxed',
    medium: 'text-2xl sm:text-3xl lg:text-4xl leading-loose',
    large: 'text-3xl sm:text-4xl lg:text-5xl leading-loose',
  };

  return (
    <div
      id="lesson-typing-workspace"
      onClick={handleContainerClick}
      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden transition-all duration-200 relative"
      dir="rtl"
    >
      {/* Top HUD: Real-time Stats Header */}
      <div className="bg-slate-50 dark:bg-slate-800/60 px-4 py-3 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 relative z-20">
        {/* Real-time stats */}
        <div className="flex items-center gap-4 sm:gap-6 text-sm">
          {/* WPM */}
          <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-200">
            <Zap className="w-4 h-4 text-amber-500" />
            <span className="text-xs text-slate-500">{lang === 'en' ? 'Speed:' : lang === 'bn' ? 'গতি:' : 'السرعة:'}</span>
            <span className="font-bold text-base font-mono">{wpm}</span>
            <span className="text-xs text-slate-400">WPM</span>
          </div>

          {/* Accuracy */}
          <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-200">
            <Target className="w-4 h-4 text-emerald-500" />
            <span className="text-xs text-slate-500">{lang === 'en' ? 'Accuracy:' : lang === 'bn' ? 'নির্ভুলতা:' : 'الدقة:'}</span>
            <span className={`font-bold text-base font-mono ${accuracy < 90 ? 'text-amber-500' : 'text-emerald-600 dark:text-emerald-400'}`}>
              {accuracy}%
            </span>
          </div>

          {/* Errors */}
          <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-200">
            <AlertCircle className="w-4 h-4 text-rose-500" />
            <span className="text-xs text-slate-500">{lang === 'en' ? 'Errors:' : lang === 'bn' ? 'ভুল:' : 'الأخطاء:'}</span>
            <span className={`font-bold text-base font-mono ${errors > 0 ? 'text-rose-500' : 'text-slate-400'}`}>
              {errors}
            </span>
          </div>

          {/* Timer */}
          <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-200">
            <Clock className="w-4 h-4 text-blue-500" />
            <span className="text-xs text-slate-500">{lang === 'en' ? 'Time:' : lang === 'bn' ? 'সময়:' : 'الوقت:'}</span>
            <span className="font-bold text-base font-mono">
              {remainingSeconds !== null ? formatTime(remainingSeconds) : formatTime(elapsedSeconds)}
            </span>
          </div>
        </div>

        {/* Action / Mode Pill & Physical Keyboard Status */}
        <div className="flex items-center gap-2">
          {isPhysicalKeyboardConnected ? (
            <span
              id="physical-keyboard-status-badge"
              className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-700 shadow-xs animate-in fade-in"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>
                {lang === 'bn'
                  ? '🟢 ফিজিক্যাল কিবোর্ড সংযুক্ত'
                  : lang === 'en'
                  ? '🟢 Physical Keyboard Connected'
                  : '🟢 لوحة مفاتيح حقيقية متصلة'}
              </span>
            </span>
          ) : (
            <span
              id="physical-keyboard-ready-badge"
              className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full"
            >
              <Keyboard className="w-3.5 h-3.5 text-slate-400" />
              <span>
                {lang === 'bn'
                  ? 'ওটিজি কিবোর্ড: প্রেস করুন'
                  : lang === 'en'
                  ? 'OTG Keyboard: Press key'
                  : 'لوحة OTG: اضغط أي مفتاح'}
              </span>
            </span>
          )}

          <span
            className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border ${
              typingMode === 'strict'
                ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-900'
                : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900'
            }`}
          >
            {typingMode === 'strict'
              ? lang === 'en'
                ? 'Strict Mode'
                : lang === 'bn'
                ? 'কঠোর মোড'
                : 'النمط الصارم'
              : lang === 'en'
              ? 'Normal Mode'
              : lang === 'bn'
              ? 'স্বাভাবিক মোড'
              : 'النمط العادي'}
          </span>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onRestart();
              if (inputRef.current) {
                inputRef.current.value = '';
                inputRef.current.focus();
              }
              lastValueRef.current = '';
              setIsFocused(true);
            }}
            className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
            title={lang === 'en' ? 'Restart' : lang === 'bn' ? 'পুনরায় শুরু করুন' : 'إعادة المحاولة'}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{lang === 'en' ? 'Restart' : lang === 'bn' ? 'পুনরায়' : 'إعادة'}</span>
          </button>
        </div>
      </div>

      {/* Progress Bar Line */}
      <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 overflow-hidden">
        <div
          className="bg-emerald-500 h-full transition-all duration-200 ease-out"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Target Arabic Text Area */}
      <div className="relative p-6 sm:p-8 min-h-[180px] sm:min-h-[220px] flex items-center justify-center cursor-text">
        {/*
          Robust Input Capture Layer for Mobile Virtual Keyboards & Desktop:
          - Uses position: absolute covering the text area so mobile taps focus directly on this input.
          - Invisible (opacity: 0) so the custom styled Arabic typography is visible.
          - autoCapitalize="none", autoCorrect="off", spellCheck={false}, inputMode="text" for Arabic IMEs.
          - value is NOT replaced synchronously on every keystroke, allowing Gboard to maintain composition.
        */}
        <input
          ref={inputRef}
          type="text"
          dir="rtl"
          lang="ar"
          autoCapitalize="none"
          autoCorrect="off"
          autoComplete="off"
          spellCheck={false}
          inputMode="text"
          onKeyDown={handleKeyDown}
          onInput={handleInput}
          onBeforeInput={handleBeforeInput}
          onPaste={handlePaste}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className="absolute inset-0 w-full h-full opacity-0 cursor-text z-10 p-0 m-0 border-none outline-hidden"
          autoFocus
          tabIndex={0}
          aria-label="حقل الكتابة باللغة العربية"
        />

        {/* Text Container with Authentic Arabic Typography and Ligature Preservation */}
        <div
          dir="rtl"
          className={`w-full max-w-3xl text-right font-['Noto_Naskh_Arabic','Noto_Sans_Arabic',sans-serif] ${fontClasses[fontSize]} tracking-normal select-none pointer-events-none relative z-0 leading-relaxed sm:leading-loose`}
        >
          {tokens.map((token) => {
            if (token.type === 'word') {
              return (
                <span
                  key={`word-${token.startIndex}`}
                  className="inline-block whitespace-nowrap align-baseline"
                >
                  {token.chars.map(({ char, index }) => {
                    const status = charStatuses[index] || 'pending';
                    const isCurrent = index === activeIndex;

                    let charColor = 'text-slate-400 dark:text-slate-500';
                    if (status === 'correct') {
                      charColor = 'text-emerald-600 dark:text-emerald-400 font-medium';
                    } else if (status === 'incorrect') {
                      charColor = 'text-rose-600 dark:text-rose-400 font-medium';
                    }

                    return (
                      <span
                        key={`char-${index}`}
                        ref={isCurrent ? currentCharRef : undefined}
                        className={`inline transition-colors duration-75 ${charColor} ${
                          isCurrent
                            ? 'text-amber-700 dark:text-amber-300 font-bold bg-amber-200/50 dark:bg-amber-900/50 border-b-2 border-amber-500'
                            : status === 'incorrect'
                            ? 'bg-rose-100 dark:bg-rose-950/60 border-b-2 border-rose-500'
                            : ''
                        }`}
                      >
                        {char}
                      </span>
                    );
                  })}
                </span>
              );
            }

            // Space token: Render a stable, clean space without pop-up characters or layout jumps
            const isCurrentSpace = token.index === activeIndex;
            const spaceStatus = charStatuses[token.index] || 'pending';

            return (
              <span
                key={`space-${token.index}`}
                ref={isCurrentSpace ? currentCharRef : undefined}
                className={`inline-block align-baseline transition-all duration-75 text-center select-none ${
                  isCurrentSpace
                    ? 'w-3 sm:w-4 mx-0.5 border-b-2 border-amber-500 bg-amber-200/60 dark:bg-amber-900/60 rounded-xs'
                    : spaceStatus === 'incorrect'
                    ? 'w-3 sm:w-4 mx-0.5 border-b-2 border-rose-500 bg-rose-100 dark:bg-rose-950/60 rounded-xs'
                    : 'w-2 sm:w-2.5 mx-0.5'
                }`}
                aria-label="مسافة"
              >
                &nbsp;
              </span>
            );
          })}
        </div>

        {/* Unfocused Click overlay notice */}
        {!isFocused && !isFinished && (
          <div
            onClick={handleContainerClick}
            className="absolute inset-0 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xs flex items-center justify-center cursor-pointer z-30"
          >
            <div className="bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 px-4 py-2 rounded-xl text-sm font-semibold shadow-lg animate-bounce flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span>
                {lang === 'en'
                  ? 'Click or tap here to focus and type'
                  : lang === 'bn'
                  ? 'টাইপ করতে ক্লিক বা ট্যাপ করুন'
                  : 'انقر هنا للتركيز والبدء في الكتابة'}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Hint */}
      <div className="bg-slate-50/50 dark:bg-slate-800/30 px-6 py-2.5 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between relative z-20">
        <span>
          {lang === 'en'
            ? 'Use physical keyboard or tap keys on virtual keyboard'
            : lang === 'bn'
            ? 'কীবোর্ড অথবা ভার্চুয়াল কীতে টাইপ করুন'
            : 'استخدم لوحة المفاتيح الحقيقية، أو اضغط على أزرار اللوحة الافتراضية بالأسفل'}
        </span>
        <span className="font-mono">
          {activeIndex} / {targetText.length}
        </span>
      </div>
    </div>
  );
};
