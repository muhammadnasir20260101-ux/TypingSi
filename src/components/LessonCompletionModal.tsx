import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Award, CheckCircle2, ChevronRight, Home, RotateCcw, Sparkles, Star, Target, Zap } from 'lucide-react';
import { Achievement, Language } from '../types';
import { soundService } from '../services/soundService';

interface LessonCompletionModalProps {
  isOpen: boolean;
  wpm: number;
  cpm: number;
  accuracy: number;
  errors: number;
  durationSeconds: number;
  stars: number;
  unlockedAchievement?: Achievement | null;
  lang?: Language;
  onRepeat: () => void;
  onNext: () => void;
  onDashboard: () => void;
}

export const LessonCompletionModal: React.FC<LessonCompletionModalProps> = ({
  isOpen,
  wpm,
  cpm,
  accuracy,
  errors,
  durationSeconds,
  stars,
  unlockedAchievement,
  lang = 'ar',
  onRepeat,
  onNext,
  onDashboard,
}) => {
  useEffect(() => {
    if (isOpen) {
      // Play completion chime
      soundService.playCompletion();

      // Confetti burst
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#10b981', '#3b82f6', '#f59e0b', '#ec4899'],
        });
      } catch {
        // ignore
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const formatDuration = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    const mUnit = lang === 'en' ? 'm' : lang === 'bn' ? 'মি.' : 'د';
    const sUnit = lang === 'en' ? 's' : lang === 'bn' ? 'সে.' : 'ث';
    if (mins > 0) {
      return `${mins}${mUnit} ${secs}${sUnit}`;
    }
    return `${secs}${sUnit}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        id="lesson-completion-card"
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl max-w-lg w-full p-6 sm:p-8 text-center relative overflow-hidden"
        dir={lang === 'ar' ? 'rtl' : 'ltr'}
      >
        {/* Decorative background accent */}
        <div className="absolute -top-12 -right-12 w-36 h-36 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-36 h-36 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

        {/* Icon & Title */}
        <div className="mx-auto w-16 h-16 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4 shadow-inner">
          <Sparkles className="w-8 h-8 animate-pulse" />
        </div>

        <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2 font-['Noto_Naskh_Arabic','Noto_Sans_Arabic',sans-serif]">
          {lang === 'en'
            ? 'Outstanding! Lesson Completed!'
            : lang === 'bn'
            ? 'অভিনন্দন! পাঠ সমাপ্ত হয়েছে!'
            : 'ممتاز! لقد أكملت الدرس بنجاح!'}
        </h3>

        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
          {lang === 'en'
            ? 'Great work! Daily practice builds durable finger muscle memory.'
            : lang === 'bn'
            ? 'চমৎকার! নিয়মিত অনুশীলন আঙুলের ছন্দ তৈরি করে।'
            : 'أداء رائع ومبهر، واصل التقدم لبناء ذاكرة عضلية راسخة في أصابعك.'}
        </p>

        {/* Star Rating (1-5) */}
        <div className="flex justify-center items-center gap-1.5 mb-6">
          {[1, 2, 3, 4, 5].map((starIdx) => (
            <Star
              key={`star-${starIdx}`}
              className={`w-7 h-7 sm:w-8 sm:h-8 transition-transform ${
                starIdx <= stars
                  ? 'text-amber-400 fill-amber-400 scale-110 drop-shadow-xs'
                  : 'text-slate-200 dark:text-slate-700'
              }`}
            />
          ))}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3 mb-6 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
          {/* WPM */}
          <div className="flex flex-col items-center">
            <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              {lang === 'en' ? 'Speed' : lang === 'bn' ? 'গতি' : 'السرعة'}
            </span>
            <span className="text-2xl font-bold font-mono text-slate-900 dark:text-slate-100 mt-0.5">
              {wpm}
            </span>
            <span className="text-[10px] text-slate-400">WPM</span>
          </div>

          {/* Accuracy */}
          <div className="flex flex-col items-center border-x border-slate-200 dark:border-slate-700/60">
            <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <Target className="w-3.5 h-3.5 text-emerald-500" />
              {lang === 'en' ? 'Accuracy' : lang === 'bn' ? 'নির্ভুলতা' : 'الدقة'}
            </span>
            <span className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-0.5">
              {accuracy}%
            </span>
            <span className="text-[10px] text-slate-400">
              {errors} {lang === 'en' ? 'errors' : lang === 'bn' ? 'ভুল' : 'أخطاء'}
            </span>
          </div>

          {/* Time */}
          <div className="flex flex-col items-center">
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {lang === 'en' ? 'Duration' : lang === 'bn' ? 'সময়' : 'الوقت'}
            </span>
            <span className="text-2xl font-bold font-mono text-slate-900 dark:text-slate-100 mt-0.5">
              {formatDuration(durationSeconds)}
            </span>
            <span className="text-[10px] text-slate-400">{cpm} CPM</span>
          </div>
        </div>

        {/* Unlocked Achievement Banner if newly unlocked */}
        {unlockedAchievement && (
          <div className="mb-6 p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 flex items-center gap-3 text-right">
            <div className="w-10 h-10 rounded-xl bg-amber-400 text-white flex items-center justify-center shrink-0">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold text-amber-800 dark:text-amber-300 block">
                {lang === 'en' ? 'New Badge Unlocked!' : lang === 'bn' ? 'নতুন ব্যাজ অর্জিত!' : 'إنجاز وبطولة جديدة!'}
              </span>
              <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                {lang === 'en' ? unlockedAchievement.titleEn : lang === 'bn' ? unlockedAchievement.titleBn : unlockedAchievement.titleAr}
              </span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <button
            type="button"
            onClick={onNext}
            className="w-full py-3 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>{lang === 'en' ? 'Next Lesson' : lang === 'bn' ? 'পরবর্তী পাঠ' : 'الدرس التالي'}</span>
            <ChevronRight className="w-4 h-4 rotate-180" />
          </button>

          <div className="flex w-full gap-2">
            <button
              type="button"
              onClick={onRepeat}
              className="flex-1 py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 active:scale-98 text-slate-700 dark:text-slate-200 font-semibold text-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>{lang === 'en' ? 'Repeat' : lang === 'bn' ? 'পুনরায়' : 'إعادة'}</span>
            </button>

            <button
              type="button"
              onClick={onDashboard}
              className="flex-1 py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 active:scale-98 text-slate-700 dark:text-slate-200 font-semibold text-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Home className="w-4 h-4" />
              <span>{lang === 'en' ? 'Dashboard' : lang === 'bn' ? 'ড্যাশবোর্ড' : 'لوحة التحكم'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
