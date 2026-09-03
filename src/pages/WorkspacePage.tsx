import React, { useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
  HelpCircle,
  Keyboard as KeyboardIcon,
  RotateCcw,
  Sliders,
  Sparkles,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { ALL_LESSONS, COURSES } from '../data/courses';
import { findKeyForChar } from '../data/keyboard101';
import { useTypingEngine } from '../hooks/useTypingEngine';
import { StorageService } from '../services/storageService';
import { Achievement, Language, LessonProgress, UserSettings } from '../types';
import { FingerGuide } from '../components/FingerGuide';
import { KeyboardVisualizer } from '../components/KeyboardVisualizer';
import { LessonCompletionModal } from '../components/LessonCompletionModal';
import { LessonTypingArea } from '../components/LessonTypingArea';
import { getTranslation } from '../data/translations';

interface WorkspacePageProps {
  lessonId: string;
  settings: UserSettings;
  onUpdateSettings: (newSettings: Partial<UserSettings>) => void;
  onSelectLesson: (newLessonId: string) => void;
  onGoToDashboard: () => void;
}

export const WorkspacePage: React.FC<WorkspacePageProps> = ({
  lessonId,
  settings,
  onUpdateSettings,
  onSelectLesson,
  onGoToDashboard,
}) => {
  const [isCompletionModalOpen, setIsCompletionModalOpen] = useState(false);
  const [completedStats, setCompletedStats] = useState<{
    wpm: number;
    cpm: number;
    accuracy: number;
    errors: number;
    duration: number;
    stars: number;
  }>({
    wpm: 0,
    cpm: 0,
    accuracy: 0,
    errors: 0,
    duration: 0,
    stars: 5,
  });
  const [unlockedAchievement, setUnlockedAchievement] = useState<Achievement | null>(null);

  const t = (key: string) => getTranslation(settings.language, key);
  const isRtl = settings.language === 'ar';

  // Find lesson
  const currentLessonIndex = ALL_LESSONS.findIndex((l) => l.id === lessonId);
  const currentLesson = ALL_LESSONS[currentLessonIndex >= 0 ? currentLessonIndex : 0];
  const currentCourse = COURSES.find((c) => c.id === currentLesson.courseId) || COURSES[0];

  const prevLesson = currentLessonIndex > 0 ? ALL_LESSONS[currentLessonIndex - 1] : null;
  const nextLesson = currentLessonIndex < ALL_LESSONS.length - 1 ? ALL_LESSONS[currentLessonIndex + 1] : null;

  // Typing Engine Hook
  const {
    targetText,
    typedText,
    currentIndex,
    nextChar,
    charStatuses,
    wpm,
    cpm,
    accuracy,
    incorrectCharsCount,
    elapsedSeconds,
    remainingSeconds,
    progressPercent,
    isFinished,
    mistakeChars,
    handleKeyPress,
    handlePhysicalKeyDown,
    handleVirtualInput,
    handleBackspace,
    resetEngine,
  } = useTypingEngine({
    targetText: currentLesson.targetText,
    typingMode: settings.typingMode,
    timeLimitSeconds: 0, // untimed lesson
    soundEnabled: settings.soundEnabled,
    keyPressSound: settings.keyPressSound,
    errorSound: settings.errorSound,
    onComplete: (stats) => {
      // Calculate stars based on accuracy & speed
      let stars = 3;
      if (stats.accuracy >= 98 && stats.wpm >= 25) stars = 5;
      else if (stats.accuracy >= 95) stars = 4;
      else if (stats.accuracy >= 85) stars = 3;
      else if (stats.accuracy >= 75) stars = 2;
      else stars = 1;

      // Save to storage
      StorageService.saveLessonResult(currentLesson.id, stats.wpm, stats.accuracy, stars);
      StorageService.recordMistakes(stats.mistakeChars);
      StorageService.addPracticeTime(stats.elapsedSeconds, settings.dailyGoalMinutes);

      // Record session history
      StorageService.addSession({
        id: 'sess-' + Date.now(),
        type: 'lesson',
        title: currentLesson.titleAr,
        date: new Date().toISOString(),
        wpm: stats.wpm,
        cpm: stats.cpm,
        accuracy: stats.accuracy,
        errors: stats.incorrectCharsCount,
        totalKeystrokes: stats.totalKeystrokes,
        durationSeconds: stats.elapsedSeconds,
        stars,
        mistakeChars: stats.mistakeChars,
        mistakeCount: stats.incorrectCharsCount,
        mode: 'lesson',
      });

      // Check achievements
      const allProgress = StorageService.getLessonProgressMap();
      const completedCount = (Object.values(allProgress) as LessonProgress[]).filter((p) => p.completed).length;
      const streakData = StorageService.getStreakData();
      const daily = StorageService.getDailyGoalProgress();

      const updatedAchievements = StorageService.checkAndUnlockAchievements({
        wpm: stats.wpm,
        accuracy: stats.accuracy,
        totalLessons: completedCount,
        streak: streakData.currentStreak,
        practiceTimeMinutes: daily.minutesPracticed,
      });

      // Find any newly unlocked achievement
      const newlyUnlocked = updatedAchievements.find((a) => a.unlocked && a.unlockedDate === daily.date);
      setUnlockedAchievement(newlyUnlocked || null);

      setCompletedStats({
        wpm: stats.wpm,
        cpm: stats.cpm,
        accuracy: stats.accuracy,
        errors: stats.incorrectCharsCount,
        duration: stats.elapsedSeconds,
        stars,
      });

      setIsCompletionModalOpen(true);
    },
  });

  // Target Key Lookup for Keyboard & Finger Guide
  const currentKeyMatch = nextChar ? findKeyForChar(nextChar) : null;
  const activeFinger = currentKeyMatch ? currentKeyMatch.keyDef.finger : null;
  const needsShift = currentKeyMatch ? currentKeyMatch.needsShift : false;

  const handleNextLesson = () => {
    setIsCompletionModalOpen(false);
    if (nextLesson) {
      StorageService.setCurrentLessonId(nextLesson.id);
      onSelectLesson(nextLesson.id);
    } else {
      onGoToDashboard();
    }
  };

  const handleRepeatLesson = () => {
    setIsCompletionModalOpen(false);
    resetEngine();
  };

  return (
    <div id="lesson-workspace-view" className="space-y-5 pb-16">
      {/* Top Breadcrumb & Controls Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-black flex items-center justify-center font-mono text-xs">
            #{currentLesson.order}
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-400 block">
              {settings.language === 'en'
                ? currentCourse.titleEn
                : settings.language === 'bn' && currentCourse.titleBn
                ? currentCourse.titleBn
                : currentCourse.titleAr}
            </span>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 font-['Noto_Naskh_Arabic',sans-serif]">
              {settings.language === 'en'
                ? currentLesson.titleEn
                : settings.language === 'bn'
                ? currentLesson.titleBn
                : currentLesson.titleAr}
            </h2>
          </div>
        </div>

        {/* Action Toggles: Keyboard Visibility, Finger Guide, Mode */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Strict Mode Toggle */}
          <button
            type="button"
            onClick={() =>
              onUpdateSettings({
                typingMode: settings.typingMode === 'strict' ? 'normal' : 'strict',
              })
            }
            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
              settings.typingMode === 'strict'
                ? 'bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-950/50 dark:text-rose-400 dark:border-rose-900'
                : 'bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
            }`}
            title={
              settings.language === 'en'
                ? 'In strict mode, you must correct errors before advancing'
                : settings.language === 'bn'
                ? 'কঠোর মোডে ভুল সংশোধন না করে সামনে যাওয়া যাবে না'
                : 'في النمط الصارم لا يمكنك المتابعة إلا بعد تصحيح الحرف'
            }
          >
            {settings.typingMode === 'strict'
              ? settings.language === 'en'
                ? 'Strict'
                : settings.language === 'bn'
                ? 'কঠোর মোড'
                : 'النمط الصارم'
              : settings.language === 'en'
              ? 'Normal'
              : settings.language === 'bn'
              ? 'স্বাভাবিক মোড'
              : 'النمط العادي'}
          </button>

          {/* Virtual Keyboard Toggle */}
          <button
            type="button"
            onClick={() => onUpdateSettings({ showKeyboard: !settings.showKeyboard })}
            className={`p-2 rounded-xl border text-xs font-semibold transition-colors cursor-pointer ${
              settings.showKeyboard
                ? 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800'
                : 'bg-slate-50 text-slate-400 border-slate-200 dark:bg-slate-800 dark:border-slate-700'
            }`}
            title={
              settings.language === 'en'
                ? 'Show / Hide Keyboard'
                : settings.language === 'bn'
                ? 'কীবোর্ড প্রদর্শন / লুকান'
                : 'إظهار / إخفاء لوحة المفاتيح'
            }
          >
            <KeyboardIcon className="w-4 h-4" />
          </button>

          {/* Finger Guide Toggle */}
          <button
            type="button"
            onClick={() => onUpdateSettings({ showFingerGuide: !settings.showFingerGuide })}
            className={`p-2 rounded-xl border text-xs font-semibold transition-colors cursor-pointer ${
              settings.showFingerGuide
                ? 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800'
                : 'bg-slate-50 text-slate-400 border-slate-200 dark:bg-slate-800 dark:border-slate-700'
            }`}
            title={
              settings.language === 'en'
                ? 'Show / Hide Finger Guide'
                : settings.language === 'bn'
                ? 'আঙুল নির্দেশিকা প্রদর্শন / লুকান'
                : 'إظهار / إخفاء دليل الأصابع'
            }
          >
            {settings.showFingerGuide ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          </button>

          {/* Previous / Next Lesson Switcher */}
          <div className="flex items-center gap-1 border-r border-slate-200 dark:border-slate-700 pr-2 mr-1">
            <button
              type="button"
              disabled={!prevLesson}
              onClick={() => {
                if (prevLesson) {
                  StorageService.setCurrentLessonId(prevLesson.id);
                  onSelectLesson(prevLesson.id);
                }
              }}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              title={
                settings.language === 'en'
                  ? 'Previous Lesson'
                  : settings.language === 'bn'
                  ? 'পূর্ববর্তী পাঠ'
                  : 'الدرس السابق'
              }
            >
              {isRtl ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
            </button>
            <button
              type="button"
              disabled={!nextLesson}
              onClick={() => {
                if (nextLesson) {
                  StorageService.setCurrentLessonId(nextLesson.id);
                  onSelectLesson(nextLesson.id);
                }
              }}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              title={
                settings.language === 'en'
                  ? 'Next Lesson'
                  : settings.language === 'bn'
                  ? 'পরবর্তী পাঠ'
                  : 'الدرس التالي'
              }
            >
              {isRtl ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Main Typing Workspace Area */}
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
        typingMode={settings.typingMode}
        fontSize={settings.fontSize}
        lang={settings.language}
        currentIndex={currentIndex}
        onKeyPress={handleKeyPress}
        onPhysicalKeyDown={handlePhysicalKeyDown}
        onVirtualInput={handleVirtualInput}
        onBackspace={handleBackspace}
        onRestart={resetEngine}
      />

      {/* Finger Positioning Guide */}
      {settings.showFingerGuide && (
        <FingerGuide
          activeFinger={activeFinger}
          needsShift={needsShift}
          targetChar={nextChar}
          lang={settings.language}
        />
      )}

      {/* Visual Arabic 101 Keyboard */}
      {settings.showKeyboard && (
        <div className="space-y-2">
          <div className="flex items-center justify-between px-1 text-xs text-slate-500 dark:text-slate-400">
            <span className="font-semibold">
              {settings.language === 'en'
                ? 'Arabic 101 Keyboard Layout'
                : settings.language === 'bn'
                ? 'আরবি ১০১ কীবোর্ড লেআউট'
                : 'لوحة المفاتيح العربية 101'}
            </span>
            <span className="text-[11px]">
              {needsShift
                ? settings.language === 'en'
                  ? 'Press key with Shift'
                  : settings.language === 'bn'
                  ? 'Shift চেপে কী প্রেস করুন'
                  : 'اضغط المفتاح مع Shift'
                : settings.language === 'en'
                ? 'Press the green highlighted key'
                : settings.language === 'bn'
                ? 'সবুজ চিহ্নিত কীতে প্রেস করুন'
                : 'اضغط المفتاح المظلل بالأخضر'}
            </span>
          </div>
          <KeyboardVisualizer
            currentMatch={currentKeyMatch}
            onKeyClick={handleKeyPress}
            showFingerColors={true}
          />
        </div>
      )}

      {/* Completion Modal */}
      <LessonCompletionModal
        isOpen={isCompletionModalOpen}
        wpm={completedStats.wpm}
        cpm={completedStats.cpm}
        accuracy={completedStats.accuracy}
        errors={completedStats.errors}
        durationSeconds={completedStats.duration}
        stars={completedStats.stars}
        unlockedAchievement={unlockedAchievement}
        lang={settings.language}
        onNext={handleNextLesson}
        onRepeat={handleRepeatLesson}
        onDashboard={onGoToDashboard}
      />
    </div>
  );
};
