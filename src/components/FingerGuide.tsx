import React from 'react';
import { FingerName, Language } from '../types';
import { FINGER_DETAILS } from '../data/keyboard101';

interface FingerGuideProps {
  activeFinger: FingerName | null;
  needsShift?: boolean;
  targetChar?: string;
  lang?: Language;
}

export const FingerGuide: React.FC<FingerGuideProps> = ({
  activeFinger,
  needsShift = false,
  targetChar = '',
  lang = 'ar',
}) => {
  const currentFingerInfo = activeFinger ? FINGER_DETAILS[activeFinger] : null;

  const getFingerTitle = () => {
    if (!currentFingerInfo) {
      if (lang === 'en') return 'Rest fingers on home row (ب, ت)';
      if (lang === 'bn') return 'হোম রোতে আঙুল রাখুন (ب, ت)';
      return 'ضع أصابعك على صف الارتكاز (ب، ت)';
    }
    if (lang === 'en') return currentFingerInfo.labelEn;
    if (lang === 'bn') return currentFingerInfo.labelBn;
    return currentFingerInfo.labelAr;
  };

  const getSpaceLabel = () => {
    if (lang === 'en') return 'Space';
    if (lang === 'bn') return 'স্পেস';
    return 'مسافة';
  };

  return (
    <div id="finger-guide-container" className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <span className="flex h-3 w-3 rounded-full bg-emerald-500 animate-pulse"></span>
          <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
            {lang === 'en' ? 'Finger Position Guide' : lang === 'bn' ? 'আঙুল নির্দেশিকা' : 'دليل توجيه الأصابع'}
          </h4>
        </div>

        {activeFinger && currentFingerInfo && (
          <div className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <span
              className="w-3.5 h-3.5 rounded-full inline-block"
              style={{ backgroundColor: currentFingerInfo.color }}
            />
            <span className="text-slate-700 dark:text-slate-300">
              {getFingerTitle()}
            </span>
            {targetChar && (
              <span className="font-bold text-base text-emerald-600 dark:text-emerald-400 mx-1">
                「{targetChar === ' ' ? getSpaceLabel() : targetChar}」
              </span>
            )}
            {needsShift && (
              <span className="bg-amber-500 text-white text-[11px] px-2 py-0.5 rounded-md font-bold">
                + Shift
              </span>
            )}
          </div>
        )}
      </div>

      {/* 2-Hand Graphic Representation */}
      <div className="grid grid-cols-2 gap-4 max-w-xl mx-auto py-2">
        {/* Left Hand */}
        <div className="flex flex-col items-center bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 border border-slate-100 dark:border-slate-800">
          <span className="text-xs font-semibold text-slate-500 mb-2">
            {lang === 'en' ? 'Left Hand' : lang === 'bn' ? 'বাম হাত' : 'اليد اليسرى'}
          </span>
          <div className="flex items-end justify-center gap-1.5 h-24">
            {/* Left Pinky */}
            <div
              className={`w-5 rounded-t-md transition-all duration-200 flex flex-col items-center justify-between py-1 ${
                activeFinger === 'left-pinky'
                  ? 'h-16 bg-pink-500 text-white ring-4 ring-pink-300 dark:ring-pink-900 shadow-md transform -translate-y-1'
                  : 'h-12 bg-pink-200 dark:bg-pink-950/60 text-pink-700 dark:text-pink-300'
              }`}
              title="Left Pinky / خنصر أيسر"
            >
              <span className="text-[10px] font-bold">1</span>
            </div>
            {/* Left Ring */}
            <div
              className={`w-5 rounded-t-md transition-all duration-200 flex flex-col items-center justify-between py-1 ${
                activeFinger === 'left-ring'
                  ? 'h-20 bg-purple-500 text-white ring-4 ring-purple-300 dark:ring-purple-900 shadow-md transform -translate-y-1'
                  : 'h-16 bg-purple-200 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300'
              }`}
              title="Left Ring / بنصر أيسر"
            >
              <span className="text-[10px] font-bold">2</span>
            </div>
            {/* Left Middle */}
            <div
              className={`w-5 rounded-t-md transition-all duration-200 flex flex-col items-center justify-between py-1 ${
                activeFinger === 'left-middle'
                  ? 'h-24 bg-blue-500 text-white ring-4 ring-blue-300 dark:ring-blue-900 shadow-md transform -translate-y-1'
                  : 'h-20 bg-blue-200 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300'
              }`}
              title="Left Middle / وسطى يسرى"
            >
              <span className="text-[10px] font-bold">3</span>
            </div>
            {/* Left Index */}
            <div
              className={`w-5 rounded-t-md transition-all duration-200 flex flex-col items-center justify-between py-1 ${
                activeFinger === 'left-index'
                  ? 'h-22 bg-cyan-500 text-white ring-4 ring-cyan-300 dark:ring-cyan-900 shadow-md transform -translate-y-1'
                  : 'h-18 bg-cyan-200 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300'
              }`}
              title="Left Index (ب / F) / سبابة يسرى"
            >
              <span className="text-[10px] font-bold">4</span>
              <span className="text-[9px] font-bold">ب</span>
            </div>
            {/* Left Thumb */}
            <div
              className={`w-6 rounded-t-md transition-all duration-200 flex flex-col items-center justify-between py-1 ${
                activeFinger === 'thumb'
                  ? 'h-12 bg-emerald-500 text-white ring-4 ring-emerald-300 dark:ring-emerald-900 shadow-md'
                  : 'h-10 bg-emerald-200 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
              }`}
              title="Thumb / الإبهام"
            >
              <span className="text-[10px] font-bold">0</span>
            </div>
          </div>
        </div>

        {/* Right Hand */}
        <div className="flex flex-col items-center bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 border border-slate-100 dark:border-slate-800">
          <span className="text-xs font-semibold text-slate-500 mb-2">
            {lang === 'en' ? 'Right Hand' : lang === 'bn' ? 'ডান হাত' : 'اليد اليمنى'}
          </span>
          <div className="flex items-end justify-center gap-1.5 h-24">
            {/* Right Thumb */}
            <div
              className={`w-6 rounded-t-md transition-all duration-200 flex flex-col items-center justify-between py-1 ${
                activeFinger === 'thumb'
                  ? 'h-12 bg-emerald-500 text-white ring-4 ring-emerald-300 dark:ring-emerald-900 shadow-md'
                  : 'h-10 bg-emerald-200 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
              }`}
              title="Thumb / الإبهام"
            >
              <span className="text-[10px] font-bold">0</span>
            </div>
            {/* Right Index */}
            <div
              className={`w-5 rounded-t-md transition-all duration-200 flex flex-col items-center justify-between py-1 ${
                activeFinger === 'right-index'
                  ? 'h-22 bg-teal-500 text-white ring-4 ring-teal-300 dark:ring-teal-900 shadow-md transform -translate-y-1'
                  : 'h-18 bg-teal-200 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300'
              }`}
              title="Right Index (ت / J) / سبابة يمنى"
            >
              <span className="text-[10px] font-bold">5</span>
              <span className="text-[9px] font-bold">ت</span>
            </div>
            {/* Right Middle */}
            <div
              className={`w-5 rounded-t-md transition-all duration-200 flex flex-col items-center justify-between py-1 ${
                activeFinger === 'right-middle'
                  ? 'h-24 bg-amber-500 text-white ring-4 ring-amber-300 dark:ring-amber-900 shadow-md transform -translate-y-1'
                  : 'h-20 bg-amber-200 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300'
              }`}
              title="Right Middle / وسطى يمنى"
            >
              <span className="text-[10px] font-bold">6</span>
            </div>
            {/* Right Ring */}
            <div
              className={`w-5 rounded-t-md transition-all duration-200 flex flex-col items-center justify-between py-1 ${
                activeFinger === 'right-ring'
                  ? 'h-20 bg-orange-500 text-white ring-4 ring-orange-300 dark:ring-orange-900 shadow-md transform -translate-y-1'
                  : 'h-16 bg-orange-200 dark:bg-orange-950/60 text-orange-700 dark:text-orange-300'
              }`}
              title="Right Ring / بنصر أيمن"
            >
              <span className="text-[10px] font-bold">7</span>
            </div>
            {/* Right Pinky */}
            <div
              className={`w-5 rounded-t-md transition-all duration-200 flex flex-col items-center justify-between py-1 ${
                activeFinger === 'right-pinky'
                  ? 'h-16 bg-red-500 text-white ring-4 ring-red-300 dark:ring-red-900 shadow-md transform -translate-y-1'
                  : 'h-12 bg-red-200 dark:bg-red-950/60 text-red-700 dark:text-red-300'
              }`}
              title="Right Pinky / خنصر أيمن"
            >
              <span className="text-[10px] font-bold">8</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
