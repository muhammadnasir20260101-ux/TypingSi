import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
  Keyboard as KeyboardIcon,
  Sparkles,
  CheckCircle2,
  ChevronRight,
  RotateCcw,
  BookOpen,
} from 'lucide-react';
import { ALL_LESSONS, COURSES } from '../data/courses';
import { findKeyForChar } from '../data/keyboard101';
import { useTypingEngine } from '../hooks/useTypingEngine';
import { StorageService } from '../services/storageService';
import { soundService } from '../services/soundService';
import { Achievement, Language, LessonProgress, UserSettings } from '../types';
import { FingerGuide } from '../components/FingerGuide';
import { KeyboardVisualizer } from '../components/KeyboardVisualizer';
import { LessonCompletionModal } from '../components/LessonCompletionModal';
import { LessonTypingArea } from '../components/LessonTypingArea';
import { getTranslation } from '../data/translations';

import { DesktopCourseSidebar, SidebarSection } from '../components/DesktopCourseSidebar';

interface WorkspacePageProps {
  lessonId: string;
  settings: UserSettings;
  onUpdateSettings: (newSettings: Partial<UserSettings>) => void;
  onSelectLesson: (newLessonId: string) => void;
  onGoToDashboard: () => void;
  onBackToLessons?: () => void;
  hideSidebar?: boolean;
}

export const WorkspacePage: React.FC<WorkspacePageProps> = ({
  lessonId,
  settings,
  onUpdateSettings,
  onSelectLesson,
  onGoToDashboard,
  onBackToLessons,
  hideSidebar = false,
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
  const [showPageCompletedToast, setShowPageCompletedToast] = useState(false);

  const t = (key: string) => getTranslation(settings.language, key);
  const isRtl = settings.language === 'ar';

  // Find lesson
  const currentLessonIndex = ALL_LESSONS.findIndex((l) => l.id === lessonId);
  const currentLesson = ALL_LESSONS[currentLessonIndex >= 0 ? currentLessonIndex : 0];
  const currentCourse = COURSES.find((c) => c.id === currentLesson.courseId) || COURSES[0];

  const prevLesson = currentLessonIndex > 0 ? ALL_LESSONS[currentLessonIndex - 1] : null;
  const nextLesson = currentLessonIndex < ALL_LESSONS.length - 1 ? ALL_LESSONS[currentLessonIndex + 1] : null;

  // Multi-Page Curriculum Structure (10-15 pages per lesson)
  const lessonPages = currentLesson.pages && currentLesson.pages.length > 0
    ? currentLesson.pages
    : [
        {
          pageNumber: 1,
          titleAr: currentLesson.titleAr,
          titleEn: currentLesson.titleEn,
          titleBn: currentLesson.titleBn,
          instructionAr: 'اكتب النص المعروض بهدوء وتركيز.',
          instructionEn: 'Type the displayed text smoothly.',
          instructionBn: 'মনোযোগ দিয়ে পাঠটি টাইপ করুন।',
          targetText: currentLesson.targetText,
          purpose: 'intro' as const,
        },
      ];

  const totalPages = lessonPages.length;

  // Stored progress for this lesson
  const savedProgress = StorageService.getLessonProgressMap()[currentLesson.id];
  const highestCompletedPage = savedProgress?.completedPages || 0;

  // Track active page index (0 to totalPages - 1)
  const [pageIndex, setPageIndex] = useState<number>(() => {
    if (savedProgress?.currentPage && savedProgress.currentPage <= totalPages) {
      return savedProgress.currentPage - 1;
    }
    return 0;
  });

  // Keep pageIndex in sync if lessonId changes
  useEffect(() => {
    const progress = StorageService.getLessonProgressMap()[currentLesson.id];
    if (progress?.currentPage && progress.currentPage <= totalPages) {
      setPageIndex(progress.currentPage - 1);
    } else {
      setPageIndex(0);
    }
    setShowPageCompletedToast(false);
  }, [currentLesson.id, totalPages]);

  const activePage = lessonPages[pageIndex] || lessonPages[0];
  const activeTargetText = activePage.targetText;

  // Typing Engine Hook for active page
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
    wrongChar,
    handleKeyPress,
    handlePhysicalKeyDown,
    handleVirtualInput,
    handleBackspace,
    resetEngine,
  } = useTypingEngine({
    targetText: activeTargetText,
    typingMode: settings.typingMode,
    timeLimitSeconds: 0,
    soundEnabled: settings.soundEnabled,
    keyPressSound: settings.keyPressSound,
    errorSound: settings.errorSound,
    onComplete: (stats) => {
      // 1. Record practice time, mistakes and key statistics
      StorageService.recordMistakes(stats.mistakeChars);
      StorageService.addPracticeTime(stats.elapsedSeconds, settings.dailyGoalMinutes);

      const correctChars: Record<string, number> = {};
      for (const ch of activeTargetText) {
        if (ch && ch !== ' ') {
          correctChars[ch] = (correctChars[ch] || 0) + 1;
        }
      }
      StorageService.recordKeyAttempts(correctChars, stats.mistakeChars);

      const isLastPage = pageIndex >= totalPages - 1;

      // Save page progress
      StorageService.saveLessonPageProgress(
        currentLesson.id,
        pageIndex + 1,
        totalPages,
        stats.wpm,
        stats.accuracy
      );

      if (isLastPage) {
        if (settings.soundEnabled && settings.completionSound) {
          soundService.playLessonCompletion();
        }

        // Full Lesson Completed!
        let stars = 3;
        if (stats.accuracy >= 98 && stats.wpm >= 25) stars = 5;
        else if (stats.accuracy >= 95) stars = 4;
        else if (stats.accuracy >= 85) stars = 3;
        else if (stats.accuracy >= 75) stars = 2;
        else stars = 1;

        StorageService.saveLessonResult(currentLesson.id, stats.wpm, stats.accuracy, stars);

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
      } else {
        // Intermediate Page Completed!
        if (settings.soundEnabled && settings.completionSound) {
          soundService.playPageCompletion();
        }
        setShowPageCompletedToast(true);
      }
    },
  });

  // Target Key Lookup for Keyboard & Finger Guide
  const currentKeyMatch = nextChar ? findKeyForChar(nextChar) : null;
  const activeFinger = currentKeyMatch ? currentKeyMatch.keyDef.finger : null;
  const needsShift = currentKeyMatch ? currentKeyMatch.needsShift : false;

  // Actual Wrong Key Pressed Lookup for visual error feedback
  const wrongKeyMatch = wrongChar ? findKeyForChar(wrongChar) : null;
  const wrongKeyId = wrongKeyMatch ? wrongKeyMatch.keyDef.id : null;

  const handleNextPage = () => {
    setShowPageCompletedToast(false);
    if (pageIndex < totalPages - 1) {
      setPageIndex((prev) => prev + 1);
    }
  };

  const handlePrevPage = () => {
    setShowPageCompletedToast(false);
    if (pageIndex > 0) {
      setPageIndex((prev) => prev - 1);
    }
  };

  const handleSelectPage = (targetIdx: number) => {
    // Student can navigate to any previously completed page or the immediate next unlocked page
    const maxAllowed = Math.min(totalPages - 1, highestCompletedPage);
    if (targetIdx <= maxAllowed) {
      setShowPageCompletedToast(false);
      setPageIndex(targetIdx);
    }
  };

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
    setPageIndex(0);
    resetEngine();
  };

  // Get active page title & instructions
  const getPageTitle = () => {
    if (settings.language === 'en') return activePage.titleEn;
    if (settings.language === 'bn') return activePage.titleBn;
    return activePage.titleAr;
  };

  const getPageInstruction = () => {
    if (settings.language === 'en') return activePage.instructionEn;
    if (settings.language === 'bn') return activePage.instructionBn;
    return activePage.instructionAr;
  };

  const lessonProgress = StorageService.getLessonProgressMap();
  const beginnerLessons = ALL_LESSONS.filter((l) => l.courseId === 'course-beginner');
  const beginnerCompleted = beginnerLessons.filter((l) => lessonProgress[l.id]?.completed).length;

  const intermediateLessons = ALL_LESSONS.filter((l) => l.courseId === 'course-intermediate');
  const intermediateCompleted = intermediateLessons.filter((l) => lessonProgress[l.id]?.completed).length;

  const advancedLessons = ALL_LESSONS.filter((l) => l.courseId === 'course-advanced');
  const advancedCompleted = advancedLessons.filter((l) => lessonProgress[l.id]?.completed).length;

  const problemKeysList = StorageService.getProblemKeys();

  const currentCourseSection: SidebarSection =
    currentLesson.courseId === 'course-beginner'
      ? 'beginner'
      : currentLesson.courseId === 'course-intermediate'
      ? 'intermediate'
      : 'advanced';

  const workspaceContent = (
    <div id="lesson-workspace-view" className="space-y-4 pb-16 flex-1 min-w-0 w-full" style={{ direction: isRtl ? 'rtl' : 'ltr' }}>
      {/* Top Breadcrumb & Controls Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-xs">
        <div className="flex items-center gap-3">
          {onBackToLessons && (
            <button
              type="button"
              onClick={onBackToLessons}
              className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-200 dark:border-slate-700 shadow-2xs shrink-0"
              title={settings.language === 'ar' ? 'الرجوع إلى جميع الدروس' : settings.language === 'bn' ? 'সকল পাঠে ফিরে যান' : 'Back to Lessons'}
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">
                {settings.language === 'ar' ? 'جميع الدروس' : settings.language === 'bn' ? 'সকল পাঠ' : 'Lessons'}
              </span>
            </button>
          )}

          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-black flex items-center justify-center font-mono text-sm border border-emerald-500/20">
            #{currentLesson.order}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold text-slate-400 block">
                {settings.language === 'en'
                  ? currentCourse.titleEn
                  : settings.language === 'bn' && currentCourse.titleBn
                  ? currentCourse.titleBn
                  : currentCourse.titleAr}
              </span>
              {currentLesson.newKeys && (
                <span className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-300/40">
                  {settings.language === 'ar'
                    ? `مفتاحا الدرس: ${currentLesson.newKeys.join(' + ')}`
                    : settings.language === 'bn'
                    ? `নতুন কী: ${currentLesson.newKeys.join(' + ')}`
                    : `New Keys: ${currentLesson.newKeys.join(' + ')}`}
                </span>
              )}
            </div>
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
          <div className="flex items-center gap-1 border-e border-slate-200 dark:border-slate-700 pe-2 me-1">
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
              title={settings.language === 'en' ? 'Previous Lesson' : settings.language === 'bn' ? 'পূর্ববর্তী পাঠ' : 'الدرس السابق'}
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
              title={settings.language === 'en' ? 'Next Lesson' : settings.language === 'bn' ? 'পরবর্তী পাঠ' : 'الدرس التالي'}
            >
              {isRtl ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Multi-Page Navigation Bar & Stepper */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 sm:p-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <BookOpen className="w-4 h-4" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100">
                  {getPageTitle()}
                </span>
                <span className="font-mono text-xs px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold">
                  {pageIndex + 1} / {totalPages}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {getPageInstruction()}
              </p>
            </div>
          </div>

          {/* Quick Page Prev/Next Controls */}
          <div className="flex items-center gap-1.5 self-end sm:self-auto">
            <button
              type="button"
              disabled={pageIndex <= 0}
              onClick={handlePrevPage}
              className="px-2.5 py-1 text-xs rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 disabled:opacity-35 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            >
              {settings.language === 'ar' ? 'السابق' : settings.language === 'bn' ? 'পূর্ববর্তী' : 'Previous'}
            </button>
            <button
              type="button"
              disabled={pageIndex >= totalPages - 1 || pageIndex >= highestCompletedPage}
              onClick={handleNextPage}
              className="px-2.5 py-1 text-xs rounded-lg bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold disabled:opacity-35 disabled:hover:bg-emerald-500 cursor-pointer"
            >
              {settings.language === 'ar' ? 'التالي' : settings.language === 'bn' ? 'পরবর্তী' : 'Next'}
            </button>
          </div>
        </div>

        {/* 10-15 Multi-Page Stepper Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 select-none">
          {lessonPages.map((p, idx) => {
            const isCurrent = idx === pageIndex;
            const isCompleted = idx < highestCompletedPage;
            const isUnlocked = true;

            return (
              <button
                type="button"
                key={`page-pill-${idx}`}
                disabled={!isUnlocked}
                onClick={() => handleSelectPage(idx)}
                className={`relative flex-shrink-0 h-7 min-w-7 px-2 rounded-lg text-xs font-mono font-bold flex items-center justify-center transition-all cursor-pointer ${
                  isCurrent
                    ? 'bg-emerald-500 text-white ring-2 ring-emerald-400 shadow-xs'
                    : isCompleted
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/60'
                    : isUnlocked
                    ? 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 hover:bg-slate-200'
                    : 'bg-slate-100 dark:bg-slate-800/40 text-slate-400 dark:text-slate-600 opacity-40 cursor-not-allowed'
                }`}
                title={`${settings.language === 'ar' ? 'صفحة' : settings.language === 'bn' ? 'পৃষ্ঠা' : 'Page'} ${idx + 1}: ${p.titleAr}`}
              >
                {isCompleted && !isCurrent ? (
                  <span className="flex items-center gap-0.5">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                    <span>{idx + 1}</span>
                  </span>
                ) : (
                  idx + 1
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Intermediate Page Completed Notification / Banner */}
      {showPageCompletedToast && (
        <div className="p-4 rounded-2xl bg-emerald-950/90 border border-emerald-500 text-white flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xl animate-fadeIn">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm sm:text-base">
                {settings.language === 'ar'
                  ? `أحسنت! أتقنت الصفحة ${pageIndex + 1} من ${totalPages}`
                  : settings.language === 'bn'
                  ? `চমৎকার! পৃষ্ঠা ${pageIndex + 1} সম্পন্ন হয়েছে (${totalPages} এর মধ্যে)`
                  : `Well done! Mastered page ${pageIndex + 1} of ${totalPages}`}
              </h4>
              <p className="text-xs text-emerald-200/80">
                {settings.language === 'ar'
                  ? 'تم حفظ تقدمك. شجرة تعلمك تواصل النمو!'
                  : settings.language === 'bn'
                  ? 'আপনার অগ্রগতি সংরক্ষিত হয়েছে। শেখার গাছ বৃদ্ধি পাচ্ছে!'
                  : 'Your progress is saved. Your learning tree is growing!'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleNextPage}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-black text-xs transition-colors shadow-md cursor-pointer"
          >
            <span>
              {settings.language === 'ar'
                ? `الانتقال إلى الصفحة ${pageIndex + 2}`
                : settings.language === 'bn'
                ? `পরবর্তী পৃষ্ঠা ${pageIndex + 2}`
                : `Next Page ${pageIndex + 2}`}
            </span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

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

      {/* Visual Arabic 101 Keyboard with Expected vs Wrong Key Highlights */}
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
            wrongKeyId={wrongKeyId}
            wrongChar={wrongChar}
            expectedChar={nextChar}
            onKeyClick={handleKeyPress}
            showFingerColors={true}
            lang={settings.language}
          />
        </div>
      )}

      {/* Completion Modal for Final Lesson Graduation */}
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

  if (hideSidebar) {
    return workspaceContent;
  }

  return (
    <div
      id="workspace-desktop-container"
      className="flex flex-col md:flex-row items-start gap-5 lg:gap-6 w-full"
      style={{ direction: 'ltr' }}
    >
      {/* Permanent Left Sidebar on Desktop and Tablet */}
      <div className="hidden md:block md:w-64 lg:w-72 xl:w-80 shrink-0" style={{ direction: 'ltr' }}>
        <DesktopCourseSidebar
          currentSection={currentCourseSection}
          onSelectSection={(sec) => {
            if (sec === 'problem-keys') {
              if (onBackToLessons) onBackToLessons();
              else onGoToDashboard();
            } else {
              const targetCourseId =
                sec === 'beginner'
                  ? 'course-beginner'
                  : sec === 'intermediate'
                  ? 'course-intermediate'
                  : 'course-advanced';
              const firstL = ALL_LESSONS.find((l) => l.courseId === targetCourseId);
              if (firstL) onSelectLesson(firstL.id);
            }
          }}
          settings={settings}
          beginnerCompletedCount={beginnerCompleted}
          beginnerTotalCount={beginnerLessons.length}
          intermediateCompletedCount={intermediateCompleted}
          intermediateTotalCount={intermediateLessons.length}
          advancedCompletedCount={advancedCompleted}
          advancedTotalCount={advancedLessons.length}
          problemKeysCount={problemKeysList.length}
        />
      </div>

      {workspaceContent}
    </div>
  );
};
