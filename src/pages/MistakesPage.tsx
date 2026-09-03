import React, { useState } from 'react';
import { AlertTriangle, CheckCircle2, Play, RotateCcw, Target, Trash2, Zap } from 'lucide-react';
import { findKeyForChar } from '../data/keyboard101';
import { useTypingEngine } from '../hooks/useTypingEngine';
import { StorageService } from '../services/storageService';
import { TypingMistake, UserSettings } from '../types';
import { KeyboardVisualizer } from '../components/KeyboardVisualizer';
import { LessonTypingArea } from '../components/LessonTypingArea';
import { getTranslation } from '../data/translations';

interface MistakesPageProps {
  settings: UserSettings;
  mistakes: Record<string, TypingMistake>;
  onRefreshMistakes: () => void;
  onGoToDashboard: () => void;
}

export const MistakesPage: React.FC<MistakesPageProps> = ({
  settings,
  mistakes,
  onRefreshMistakes,
  onGoToDashboard,
}) => {
  const [activeDrillText, setActiveDrillText] = useState<string | null>(null);

  const t = (key: string) => getTranslation(settings.language, key);

  const mistakeList = (Object.values(mistakes) as TypingMistake[]).sort((a, b) => b.count - a.count);

  // Generate customized drill text based on weak keys
  const startWeakKeyDrill = (chars: string[]) => {
    if (chars.length === 0) return;
    // Generate repeated patterns combining the weak keys with home keys
    const tokens: string[] = [];
    chars.forEach((char) => {
      tokens.push(
        `${char}${char} ${char}ت ${char}ب ${char}ن ${char}ي`,
        `${char} ${char} ${char} ${char}${char}${char}`,
        `ك${char} م${char} ${char}س ${char}ل`
      );
    });
    const drill = tokens.join(' ');
    setActiveDrillText(drill);
  };

  // Typing Engine for mistake drill
  const {
    targetText,
    typedText,
    currentIndex,
    nextChar,
    charStatuses,
    wpm,
    accuracy,
    incorrectCharsCount,
    elapsedSeconds,
    remainingSeconds,
    progressPercent,
    isFinished,
    handleKeyPress,
    handlePhysicalKeyDown,
    handleVirtualInput,
    handleBackspace,
    resetEngine,
  } = useTypingEngine({
    targetText: activeDrillText || '',
    typingMode: 'normal',
    soundEnabled: settings.soundEnabled,
    keyPressSound: settings.keyPressSound,
    errorSound: settings.errorSound,
    onComplete: (stats) => {
      StorageService.addPracticeTime(stats.elapsedSeconds, settings.dailyGoalMinutes);
      StorageService.recordMistakes(stats.mistakeChars);
      onRefreshMistakes();
    },
  });

  const currentKeyMatch = nextChar ? findKeyForChar(nextChar) : null;

  const handleClearMistakes = () => {
    const confirmMsg =
      settings.language === 'en'
        ? 'Do you want to clear mistake history and start fresh?'
        : settings.language === 'bn'
        ? 'আপনি কি ভুলের ইতিহাস মুছে নতুন করে শুরু করতে চান?'
        : 'هل تريد مسح سجل الأخطاء والبدء من جديد؟';
    if (window.confirm(confirmMsg)) {
      localStorage.removeItem('tibaa_typing_mistakes_v1');
      onRefreshMistakes();
      setActiveDrillText(null);
    }
  };

  return (
    <div id="mistakes-page-view" className="space-y-6 pb-16">
      {/* Header */}
      <div className="bg-gradient-to-br from-slate-900 to-rose-950 text-white rounded-3xl p-6 sm:p-8 shadow-lg border border-slate-800">
        <div className="max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-bold">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>
              {settings.language === 'en'
                ? 'Targeted Error Remediation'
                : settings.language === 'bn'
                ? 'ভুল সংশোধন ও দুর্বল কী অনুশীলন'
                : 'معالجة المفاتيح الضعيفة'}
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black font-['Noto_Naskh_Arabic','Alexandria',sans-serif]">
            {t('problematicLetters')}
          </h2>

          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
            {settings.language === 'en'
              ? 'Automatically diagnoses your frequently missed keys and generates specialized muscle-memory drills.'
              : settings.language === 'bn'
              ? 'সিস্টেমটি অনুশীলনে আপনার প্রায়শই ভুল হওয়া কীগুলো চিহ্নিত করে বিশেষ রিমিডিয়াল ড্রিল তৈরি করে।'
              : 'يرصد النظام بدقة الأحرف التي تعثرت بها أثناء التدريب، ويولّد لك تمارين علاجية مركزة لتثبيت الذاكرة العضلية.'}
          </p>
        </div>
      </div>

      {/* Active Drill Area */}
      {activeDrillText && (
        <div className="space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between px-2 text-xs">
            <span className="font-bold text-slate-800 dark:text-slate-200">
              {settings.language === 'en'
                ? 'Targeted Remedial Drill for Weak Keys'
                : settings.language === 'bn'
                ? 'দুর্বল কীসমূহের নিবিড় অনুশীলন'
                : 'تمرين علاجي مركز للأحرف الضعيفة'}
            </span>
            <button
              type="button"
              onClick={() => setActiveDrillText(null)}
              className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 underline cursor-pointer"
            >
              {settings.language === 'en'
                ? 'Exit drill and return'
                : settings.language === 'bn'
                ? 'অনুশীলন সমাপ্ত করে ফিরে যান'
                : 'إنهاء التمرين والعودة'}
            </button>
          </div>

          <LessonTypingArea
            targetText={targetText}
            typedText={typedText}
            charStatuses={charStatuses}
            wpm={wpm}
            accuracy={accuracy}
            errors={incorrectCharsCount}
            elapsedSeconds={elapsedSeconds}
            remainingSeconds={remainingSeconds}
            progressPercent={progressPercent}
            isFinished={isFinished}
            typingMode="normal"
            fontSize={settings.fontSize}
            lang={settings.language}
            currentIndex={currentIndex}
            onKeyPress={handleKeyPress}
            onPhysicalKeyDown={handlePhysicalKeyDown}
            onVirtualInput={handleVirtualInput}
            onBackspace={handleBackspace}
            onRestart={resetEngine}
          />

          <KeyboardVisualizer
            currentMatch={currentKeyMatch}
            onKeyClick={handleKeyPress}
            showFingerColors={true}
          />
        </div>
      )}

      {/* Weak Keys List & Cards */}
      {!activeDrillText && (
        <div className="space-y-6">
          {mistakeList.length > 0 ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                <div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                    {settings.language === 'en'
                      ? `Most Frequent Mistakes (${mistakeList.length})`
                      : settings.language === 'bn'
                      ? `সর্বাধিক ভুল হওয়া কীসমূহ (${mistakeList.length})`
                      : `قائمة المفاتيح الأكثر خطأً (${mistakeList.length})`}
                  </h3>
                  <span className="text-xs text-slate-400">
                    {settings.language === 'en'
                      ? 'Sorted by mistake frequency'
                      : settings.language === 'bn'
                      ? 'ভুলের সংখ্যা অনুসারে সাজানো'
                      : 'مرتبة من الأكثر ارتكاباً للخطأ'}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => startWeakKeyDrill(mistakeList.slice(0, 5).map((m) => m.char))}
                    className="py-2 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 fill-white" />
                    <span>
                      {settings.language === 'en'
                        ? 'Practice Top 5 Weak Keys'
                        : settings.language === 'bn'
                        ? 'শীর্ষ ৫টি কী অনুশীলন করুন'
                        : 'تدريب على أهم 5 مفاتيح'}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={handleClearMistakes}
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                    title={
                      settings.language === 'en'
                        ? 'Clear Mistake History'
                        : settings.language === 'bn'
                        ? 'ভুলের ইতিহাস মুছুন'
                        : 'مسح سجل الأخطاء'
                    }
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Grid of mistake letters */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {mistakeList.map((m) => {
                  const keyMatch = findKeyForChar(m.char);
                  return (
                    <div
                      key={`mistake-card-${m.char}`}
                      className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 flex flex-col justify-between items-center text-center group hover:border-rose-300 transition-colors"
                    >
                      <span className="text-3xl font-bold font-['Noto_Naskh_Arabic',sans-serif] text-slate-900 dark:text-slate-100 my-1">
                        {m.char}
                      </span>

                      <div className="text-[11px] font-mono text-rose-500 font-bold">
                        {m.count} {t('errors')}
                      </div>

                      <span className="text-[10px] text-slate-400 mt-1">
                        {keyMatch?.keyDef.labelEn ? `Key ${keyMatch.keyDef.labelEn}` : ''}
                      </span>

                      <button
                        type="button"
                        onClick={() => startWeakKeyDrill([m.char])}
                        className="mt-3 w-full py-1 px-2 rounded-lg bg-white dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 text-[11px] font-bold text-slate-700 dark:text-slate-200 shadow-xs cursor-pointer"
                      >
                        {settings.language === 'en'
                          ? 'Solo Drill'
                          : settings.language === 'bn'
                          ? 'একক ড্রিল'
                          : 'تدريب فردي'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center shadow-xs space-y-3">
              <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto" />
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                {settings.language === 'en'
                  ? 'Zero Weak Keys Detected!'
                  : settings.language === 'bn'
                  ? 'কোনো দুর্বল কী পাওয়া যায়নি!'
                  : 'لا توجد مفاتيح متعثرة حالياً!'}
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                {settings.language === 'en'
                  ? 'Your accuracy is stellar. Keep practicing regular lessons and typing tests; any recurring mistake will be cataloged here automatically.'
                  : settings.language === 'bn'
                  ? 'আপনার নির্ভুলতা চমৎকার। নিয়মিত পাঠ ও টাইপিং টেস্ট চালিয়ে যান; পুনরাবৃত্তিমূলক ভুল হলে তা স্বয়ংক্রিয়ভাবে এখানে তালিকাভুক্ত হবে।'
                  : 'دقتك ممتازة حتى الآن. واصل إكمال الدروس واختبارات السرعة، وإذا تكرر أي خطأ في أي مفتاح فسيظهر هنا مع خطة تدريب فورية.'}
              </p>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={onGoToDashboard}
                  className="py-2.5 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md cursor-pointer"
                >
                  {t('navHome')}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
