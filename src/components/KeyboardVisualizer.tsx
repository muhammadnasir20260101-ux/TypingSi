import React from 'react';
import { CharKeyMatch, FINGER_DETAILS, KEYBOARD_ROWS } from '../data/keyboard101';
import { KeyboardKeyDef, Language } from '../types';

interface KeyboardVisualizerProps {
  currentMatch: CharKeyMatch | null;
  wrongKeyId?: string | null;
  wrongChar?: string | null;
  expectedChar?: string | null;
  onKeyClick?: (char: string) => void;
  showFingerColors?: boolean;
  lang?: Language;
}

export const KeyboardVisualizer: React.FC<KeyboardVisualizerProps> = ({
  currentMatch,
  wrongKeyId = null,
  wrongChar = null,
  expectedChar = null,
  onKeyClick,
  showFingerColors = true,
  lang = 'ar',
}) => {
  const targetKeyId = currentMatch?.keyDef.id;
  const needsShift = currentMatch?.needsShift || false;

  const handleKeyClick = (key: KeyboardKeyDef) => {
    if (!onKeyClick) return;
    if (key.id === 'Space') {
      onKeyClick(' ');
    } else if (key.id === 'Backspace') {
      // Handled via backspace
    } else if (key.labelAr && !key.isSpecial) {
      onKeyClick(needsShift && key.shiftAr ? key.shiftAr : key.labelAr);
    }
  };

  return (
    <div
      id="keyboard-visualizer-container"
      className="bg-slate-900 dark:bg-slate-950 p-2 sm:p-4 rounded-2xl border border-slate-800 shadow-xl overflow-x-auto select-none transition-colors"
      dir="ltr"
    >
      {/* Visual Error / Guidance Banner */}
      {wrongKeyId && wrongChar && expectedChar && (
        <div className="mb-2.5 px-3 py-1.5 rounded-lg bg-rose-950/80 border border-rose-600/60 text-rose-200 text-xs flex items-center justify-between animate-pulse">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
            <span className="font-semibold text-rose-300">
              {lang === 'ar' ? 'تنبيه الخطأ:' : lang === 'bn' ? 'ভুল টাইপ সতর্কতা:' : 'Wrong Key Pressed:'}
            </span>
            <span>
              {lang === 'ar'
                ? `المطلوب: 「${expectedChar}」 • ضغطت: 「${wrongChar}」`
                : lang === 'bn'
                ? `প্রত্যাশিত: 「${expectedChar}」 • চেপেছেন: 「${wrongChar}」`
                : `Expected: 「${expectedChar}」 • You pressed: 「${wrongChar}」`}
            </span>
          </div>
          <span className="text-[11px] text-rose-300/80">
            {lang === 'ar' ? 'تابع الضغط على المفتاح الأخضر' : lang === 'bn' ? 'সবুজ কী চাপুন' : 'Press the green key'}
          </span>
        </div>
      )}

      <div className="min-w-[660px] sm:min-w-[760px] max-w-4xl mx-auto flex flex-col gap-1.5">
        {KEYBOARD_ROWS.map((row, rowIdx) => (
          <div key={`row-${rowIdx}`} className="flex justify-between gap-1 sm:gap-1.5 w-full">
            {row.map((key) => {
              const isTarget = targetKeyId === key.id;
              const isWrong = wrongKeyId === key.id;
              const isShiftKey = key.id === 'ShiftLeft' || key.id === 'ShiftRight';
              const highlightShift = needsShift && isShiftKey;
              const fingerInfo = FINGER_DETAILS[key.finger];
              const isHomeAnchor = key.id === 'KeyF' || key.id === 'KeyJ';

              // Base width style
              const widthClass = key.width || 'flex-1';

              // Key highlight states
              let keyBg = 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-750';
              let borderAccent = 'border-t border-slate-700';

              if (isWrong) {
                // High-visibility error indicator
                keyBg = 'bg-rose-600 text-white font-bold ring-4 ring-rose-500 shadow-xl scale-[1.05] z-20 animate-shake';
                borderAccent = 'border-t-2 border-rose-300';
              } else if (isTarget) {
                // Target expected key indicator
                keyBg = 'bg-emerald-500 text-white font-bold ring-4 ring-emerald-400/70 shadow-lg scale-[1.02] z-10';
                borderAccent = 'border-t-2 border-emerald-300';
              } else if (highlightShift) {
                keyBg = 'bg-amber-500 text-white font-bold ring-4 ring-amber-400/50 animate-pulse z-10';
                borderAccent = 'border-t-2 border-amber-300';
              } else if (showFingerColors && fingerInfo && !key.isSpecial) {
                borderAccent = `border-t-2`;
              }

              return (
                <button
                  type="button"
                  key={key.id}
                  id={`key-${key.id}`}
                  onClick={() => handleKeyClick(key)}
                  style={{
                    borderTopColor:
                      !isTarget && !isWrong && !highlightShift && showFingerColors
                        ? fingerInfo?.color
                        : undefined,
                  }}
                  className={`relative flex flex-col items-center justify-between p-1 sm:p-1.5 rounded-lg text-xs transition-all duration-150 active:scale-95 shadow-xs cursor-pointer ${widthClass} ${keyBg} ${borderAccent} h-10 sm:h-12`}
                >
                  {/* Status indicator badges */}
                  {isWrong && (
                    <span className="absolute -top-1 -right-1 bg-rose-700 text-white text-[9px] font-bold px-1 rounded-full shadow-md z-30">
                      ✕
                    </span>
                  )}
                  {isTarget && !isWrong && (
                    <span className="absolute -top-1 -right-1 bg-emerald-700 text-white text-[9px] font-bold px-1 rounded-full shadow-md z-30">
                      ✓
                    </span>
                  )}

                  {/* Top row: Shift Arabic character or symbol + English char */}
                  <div className="w-full flex justify-between items-center text-[10px] leading-none opacity-90 px-0.5">
                    <span className="font-mono text-[9px] uppercase text-slate-300">{key.labelEn || ''}</span>
                    <span className="text-amber-300 font-bold">{key.shiftAr || ''}</span>
                  </div>

                  {/* Center/Main: Arabic primary character */}
                  <div className="flex items-center justify-center font-bold text-sm sm:text-base leading-none py-0.5 text-white">
                    {key.labelAr}
                  </div>

                  {/* Home row bump indicator for index fingers (F/ب and J/ت) */}
                  {isHomeAnchor && (
                    <div className="w-2.5 h-0.5 rounded-full bg-slate-400 dark:bg-slate-300 -mt-0.5"></div>
                  )}

                  {/* Finger color dot indicator */}
                  {showFingerColors && fingerInfo && !key.isSpecial && (
                    <span
                      className="absolute bottom-1 right-1 w-1.5 h-1.5 rounded-full opacity-60"
                      style={{ backgroundColor: fingerInfo.color }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};
