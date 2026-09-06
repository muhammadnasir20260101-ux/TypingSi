import React, { useState } from 'react';
import { 
  AlertCircle, 
  ArrowRight, 
  CheckCircle, 
  ChevronLeft, 
  ChevronRight, 
  Flame, 
  Hand, 
  Play, 
  RefreshCw, 
  RotateCcw, 
  Sparkles, 
  Target, 
  TrendingUp, 
  Zap 
} from 'lucide-react';
import { Language, ProblemKeyRecord, UserSettings } from '../types';
import { StorageService } from '../services/storageService';
import { soundService } from '../services/soundService';
import { useTypingEngine } from '../hooks/useTypingEngine';
import { LessonTypingArea } from './LessonTypingArea';
import { KeyboardVisualizer } from './KeyboardVisualizer';
import { FingerGuide } from './FingerGuide';
import { findKeyForChar } from '../data/keyboard101';

interface ProblemKeysDashboardProps {
  settings: UserSettings;
  onBackToLessons?: () => void;
}

export const ProblemKeysDashboard: React.FC<ProblemKeysDashboardProps> = ({
  settings,
  onBackToLessons,
}) => {
  const [problemKeys, setProblemKeys] = useState<ProblemKeyRecord[]>(() => 
    StorageService.getProblemKeys()
  );
  const [activeDrillKey, setActiveDrillKey] = useState<string | null>(null);
  const [drillStep, setDrillStep] = useState<number>(0);
  const [drillCompleted, setDrillCompleted] = useState<boolean>(false);
  const [drillStats, setDrillStats] = useState<{ wpm: number; accuracy: number } | null>(null);

  const isRtl = settings.language === 'ar';

  const refreshProblemKeys = () => {
    setProblemKeys(StorageService.getProblemKeys());
  };

  const getFingerName = (finger: string) => {
    switch (finger) {
      case 'thumb':
        return settings.language === 'ar' ? 'الإبهام' : settings.language === 'bn' ? 'বৃদ্ধাঙ্গুলি' : 'Thumb';
      case 'index':
        return settings.language === 'ar' ? 'السبابة' : settings.language === 'bn' ? 'তর্জনী' : 'Index Finger';
      case 'middle':
        return settings.language === 'ar' ? 'الوسطى' : settings.language === 'bn' ? 'মধ্যমা' : 'Middle Finger';
      case 'ring':
        return settings.language === 'ar' ? 'البنصر' : settings.language === 'bn' ? 'অনামিকা' : 'Ring Finger';
      case 'pinky':
        return settings.language === 'ar' ? 'الخنصر' : settings.language === 'bn' ? 'কনিষ্ঠা' : 'Pinky Finger';
      default:
        return finger;
    }
  };

  // Generate 4-step progressive drill for target key
  const generateDrillStages = (char: string) => {
    const k = char;
    return [
      {
        stage: 1,
        titleAr: `المرحلة 1: تكرار المفتاح المستهدف [ ${k} ]`,
        titleEn: `Stage 1: Single-Key Focus [ ${k} ]`,
        titleBn: `ধাপ ১: একক কী পুনরাবৃত্তি [ ${k} ]`,
        instructionAr: `اضرب المفتاح بأطراف الأصابع الصحيحة مع الحفاظ على استقرار اليد.`,
        text: `${k} ${k} ${k} ${k} ${k}${k} ${k} ${k} ${k}${k} ${k} ${k} ${k} ${k}${k} ${k} ${k} ${k} ${k} ${k}${k}`,
      },
      {
        stage: 2,
        titleAr: `المرحلة 2: تبادل المفتاح مع حروف الارتكاز`,
        titleEn: `Stage 2: Alternation with Anchor Keys`,
        titleBn: `ধাপ ২: হোম রো অক্ষরের সাথে সমন্বয়`,
        instructionAr: `بدل بين المفتاح وحروف الارتكاز بسلاسة لضبط الذاكرة العضلية.`,
        text: `${k} ب ${k} ت ${k} ي ${k} ل ${k} ن ${k} م ${k} ك ${k} ب ${k} ت ${k} ي ${k} ل ${k} ن`,
      },
      {
        stage: 3,
        titleAr: `المرحلة 3: كلمات حقيقية تتضمن الحرف [ ${k} ]`,
        titleEn: `Stage 3: Authentic Words with [ ${k} ]`,
        titleBn: `ধাপ ৩: [ ${k} ] যুক্ত বাস্তব আরবি শব্দ`,
        instructionAr: `اكتب الكلمات بانسيابية واقرأ الحرف ضمن سياقه الطبيعي.`,
        text: `${k}ال ${k}ين م${k}تب ال${k}ريم ال${k}وفيق ال${k}عليم ال${k}صباح ال${k}ور ال${k}عالي`,
      },
      {
        stage: 4,
        titleAr: `المرحلة 4: جملة نموذجية وتحدي الدقة النهائي`,
        titleEn: `Stage 4: Complete Sentence & Final Benchmark`,
        titleBn: `ধাপ ৪: পূর্ণাঙ্গ বাক্য ও চূড়ান্ত নির্ভুলতা যাচাই`,
        instructionAr: `اكتب الجملة بدقة فائقة لا تقل عن 90% للتغلب على صعوبة المفتاح.`,
        text: `التدريب المستمر على حرف (${k}) يمحو الخطأ ويبني الثقة المطلقة في كل كلمة تكتبها باللغة العربية.`,
      },
    ];
  };

  const currentStages = activeDrillKey ? generateDrillStages(activeDrillKey) : [];
  const activeDrillStage = currentStages[drillStep] || currentStages[0];

  const handleStartDrill = (keyChar?: string) => {
    const target = keyChar || (problemKeys[0]?.char ?? 'ب');
    setActiveDrillKey(target);
    setDrillStep(0);
    setDrillCompleted(false);
    setDrillStats(null);
  };

  return (
    <div id="problem-keys-dashboard" className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Top Header Card */}
      <div className="bg-gradient-to-br from-amber-500/10 via-white to-amber-500/5 dark:from-amber-950/20 dark:via-slate-900 dark:to-slate-900 border border-amber-500/20 dark:border-amber-500/30 rounded-3xl p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/20 dark:bg-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
              <Target className="w-7 h-7" />
            </div>
            <div>
              <span className="text-xs font-black tracking-wider text-amber-600 dark:text-amber-400 uppercase block">
                {settings.language === 'ar' ? 'التحليل الذكي للأخطاء' : settings.language === 'bn' ? 'স্মার্ট এরর অ্যানালাইসিস' : 'ADAPTIVE WEAKNESS ANALYSIS'}
              </span>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                {settings.language === 'ar'
                  ? 'مفاتيحي الصعبة وتدريبات التغلب عليها'
                  : settings.language === 'bn'
                  ? 'আমার সমস্যার বাটন ও সমাধান অনুশীলন'
                  : 'Your Problem Keys & Adaptive Practice'}
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
                {settings.language === 'ar'
                  ? 'يتتبع النظام الأزرار التي تخطئ فيها بشكل متكرر ويولد لك تمارين خاصة لتحويلها إلى نقاط قوة.'
                  : settings.language === 'bn'
                  ? 'যে কী-গুলোতে বেশি ভুল হয়, সিস্টেম সেগুলো চিহ্নিত করে বিশেষ অনুশীলনী প্রস্তুত করে।'
                  : 'Tracks keys with higher mistake rates and generates custom targeted drills to turn weaknesses into strengths.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-stretch sm:self-auto">
            {problemKeys.length > 0 && (
              <button
                type="button"
                onClick={() => handleStartDrill(problemKeys[0]?.char)}
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm shadow-md shadow-amber-600/20 transition-all cursor-pointer"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>
                  {settings.language === 'ar'
                    ? 'تمرين المفاتيح الصعبة الآن'
                    : settings.language === 'bn'
                    ? 'এখনই সমস্যা সমাধান করুন'
                    : 'Practice Problem Keys'}
                </span>
              </button>
            )}

            {onBackToLessons && (
              <button
                type="button"
                onClick={onBackToLessons}
                className="inline-flex items-center gap-2 px-4 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-sm font-bold transition-colors cursor-pointer"
              >
                <span>{settings.language === 'ar' ? 'العودة للمنهج' : settings.language === 'bn' ? 'সিলেবাসে ফিরে যান' : 'Back to Lessons'}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ACTIVE DRILL MODAL / SCREEN */}
      {activeDrillKey && (
        <div className="bg-white dark:bg-slate-900 border-2 border-amber-500/40 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <span className="w-12 h-12 rounded-2xl bg-amber-500 text-white font-black text-2xl flex items-center justify-center shadow-md">
                {activeDrillKey}
              </span>
              <div>
                <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
                  {settings.language === 'ar' ? `تمرين مكثف للمفتاح (${activeDrillKey})` : `Focused Drill for [${activeDrillKey}]`}
                </span>
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  {settings.language === 'bn' ? activeDrillStage.titleBn : settings.language === 'ar' ? activeDrillStage.titleAr : activeDrillStage.titleEn}
                </h3>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                {drillStep + 1} / {currentStages.length}
              </span>
              <button
                type="button"
                onClick={() => setActiveDrillKey(null)}
                className="text-xs font-bold px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 cursor-pointer"
              >
                {settings.language === 'ar' ? 'إنهاء التمرين' : 'Close'}
              </button>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            {activeDrillStage.instructionAr}
          </p>

          {/* Drill Engine Integration */}
          <DrillRunner
            key={`${activeDrillKey}-${drillStep}`}
            targetText={activeDrillStage.text}
            settings={settings}
            onStageComplete={(stats) => {
              if (drillStep < currentStages.length - 1) {
                if (settings.soundEnabled) soundService.playPageCompletion();
                setDrillStep((prev) => prev + 1);
              } else {
                // Completed all 4 drill stages!
                if (settings.soundEnabled) soundService.playLessonCompletion();
                StorageService.markProblemKeyPracticed(activeDrillKey, stats.accuracy);
                setDrillStats(stats);
                setDrillCompleted(true);
                refreshProblemKeys();
              }
            }}
          />

          {drillCompleted && (
            <div className="p-6 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/30 text-center space-y-4 animate-in zoom-in-95 duration-200">
              <div className="w-12 h-12 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto shadow-md">
                <CheckCircle className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-lg font-black text-emerald-800 dark:text-emerald-300">
                  {settings.language === 'ar' ? 'أحسنت! تم تحسين إتقانك لهذا المفتاح بنجاح' : 'Great Job! Problem Key Improved!'}
                </h4>
                <p className="text-xs sm:text-sm text-emerald-700 dark:text-emerald-400 mt-1">
                  {settings.language === 'ar'
                    ? `الدقة المحققة: ${drillStats?.accuracy}% • السرعة: ${drillStats?.wpm} ك/د`
                    : `Achieved Accuracy: ${drillStats?.accuracy}% • Speed: ${drillStats?.wpm} WPM`}
                </p>
              </div>
              <div className="flex justify-center gap-3">
                <button
                  type="button"
                  onClick={() => handleStartDrill(activeDrillKey)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold cursor-pointer"
                >
                  {settings.language === 'ar' ? 'إعادة التمرين' : 'Retry Drill'}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveDrillKey(null)}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs cursor-pointer"
                >
                  {settings.language === 'ar' ? 'تم، متابعة' : 'Done'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Problem Keys Grid List */}
      {problemKeys.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-10 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
            <CheckCircle className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white">
              {settings.language === 'ar'
                ? 'رائع! لا توجد مفاتيح صعبة مسجلة لديك حالياً'
                : settings.language === 'bn'
                ? 'চমৎকার! আপনার কোনো সমস্যার বাটন রেকর্ড নেই'
                : 'Excellent! No Problem Keys Recorded Yet'}
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto mt-1">
              {settings.language === 'ar'
                ? 'دقتك ممتازة عبر لوحة المفاتيح. عند استمرارك في الدروس، سنقوم تلقائياً برصد أي أزرار تحتاج لتقوية ووضعها هنا.'
                : 'Your typing accuracy is balanced. As you practice more lessons, any keys requiring reinforcement will automatically appear here.'}
            </p>
          </div>
          <button
            type="button"
            onClick={() => handleStartDrill('ب')}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>{settings.language === 'ar' ? 'بدء تمرين تنشيطي' : 'Start a Refresher Drill'}</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {problemKeys.map((item) => {
            const isNeedsPractice = item.status === 'needs-practice';
            const isImproving = item.status === 'improving';
            const isImproved = item.status === 'improved';

            return (
              <div
                key={item.char}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-amber-500/40 rounded-3xl p-5 shadow-xs transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    {/* Key Badge */}
                    <div className="w-12 h-12 rounded-2xl bg-amber-500/10 dark:bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-slate-900 dark:text-white font-black text-2xl shadow-xs">
                      {item.char}
                    </div>

                    {/* Status Badge */}
                    <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${
                      isImproved
                        ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30'
                        : isImproving
                        ? 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/30'
                        : 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/30'
                    }`}>
                      {isImproved
                        ? (settings.language === 'ar' ? 'متقن 🟢' : 'Improved')
                        : isImproving
                        ? (settings.language === 'ar' ? 'في تحسن 🟡' : 'Improving')
                        : (settings.language === 'ar' ? 'بحاجة لتمرين 🔴' : 'Needs Practice')}
                    </span>
                  </div>

                  {/* Key Metrics */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500 dark:text-slate-400">
                        {settings.language === 'ar' ? 'نسبة الدقة' : 'Accuracy'}:
                      </span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {item.accuracy}%
                      </span>
                    </div>

                    <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          item.accuracy >= 85 ? 'bg-emerald-500' : item.accuracy >= 70 ? 'bg-blue-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${item.accuracy}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-xs pt-1">
                      <span className="text-slate-500 dark:text-slate-400">
                        {settings.language === 'ar' ? 'الإصبع المسؤول' : 'Assigned Finger'}:
                      </span>
                      <span className="font-bold text-slate-700 dark:text-slate-300">
                        {getFingerName(item.finger)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500 dark:text-slate-400">
                        {settings.language === 'ar' ? 'عدد مرات الخطأ' : 'Error Frequency'}:
                      </span>
                      <span className="font-bold text-red-600 dark:text-red-400">
                        {item.incorrectAttempts} {settings.language === 'ar' ? 'أخطاء' : 'errors'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Practice Button */}
                <button
                  type="button"
                  onClick={() => handleStartDrill(item.char)}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 dark:hover:bg-amber-900/40 border border-amber-500/20 text-amber-800 dark:text-amber-300 text-xs font-bold transition-colors cursor-pointer"
                >
                  <Zap className="w-3.5 h-3.5 text-amber-500" />
                  <span>
                    {settings.language === 'ar' ? `تمرين الحرف (${item.char})` : `Practice Key [${item.char}]`}
                  </span>
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

interface DrillRunnerProps {
  targetText: string;
  settings: UserSettings;
  onStageComplete: (stats: { wpm: number; accuracy: number }) => void;
}

const DrillRunner: React.FC<DrillRunnerProps> = ({
  targetText,
  settings,
  onStageComplete,
}) => {
  const engine = useTypingEngine({
    targetText,
    typingMode: 'normal',
    timeLimitSeconds: 0,
    soundEnabled: settings.soundEnabled,
    keyPressSound: settings.keyPressSound,
    errorSound: settings.errorSound,
    onComplete: (completedStats) => {
      onStageComplete({
        wpm: completedStats.wpm,
        accuracy: completedStats.accuracy,
      });
    },
  });

  const currentMatch = engine.nextChar ? findKeyForChar(engine.nextChar) : null;

  return (
    <div className="space-y-4">
      {/* Typing Display */}
      <LessonTypingArea
        targetText={targetText}
        typedText={engine.typedText}
        charStatuses={engine.charStatuses}
        wpm={engine.wpm}
        accuracy={engine.accuracy}
        errors={engine.incorrectCharsCount}
        elapsedSeconds={engine.elapsedSeconds}
        remainingSeconds={null}
        progressPercent={engine.progressPercent}
        isFinished={engine.isFinished}
        typingMode="normal"
        fontSize={settings.fontSize}
        lang={settings.language}
        currentIndex={engine.currentIndex}
        onKeyPress={engine.handleKeyPress}
        onPhysicalKeyDown={engine.handlePhysicalKeyDown}
        onVirtualInput={engine.handleVirtualInput}
        onBackspace={engine.handleBackspace}
        onRestart={engine.resetEngine}
      />

      {/* Mini Visualizer */}
      {settings.showKeyboard && (
        <div className="pt-2">
          <KeyboardVisualizer
            currentMatch={currentMatch}
            wrongKeyId={engine.strictErrorChar ? findKeyForChar(engine.strictErrorChar)?.keyDef.id : null}
            wrongChar={engine.wrongChar}
            expectedChar={engine.nextChar}
            onKeyClick={engine.handleKeyPress}
            showFingerColors={true}
            lang={settings.language}
          />
        </div>
      )}
    </div>
  );
};
