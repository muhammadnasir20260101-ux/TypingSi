import React, { useState } from 'react';
import {
  Award,
  CheckCircle,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Crown,
  Flame,
  GraduationCap,
  HelpCircle,
  History,
  Info,
  Lock,
  Play,
  Printer,
  RotateCcw,
  Search,
  Settings as SettingsIcon,
  Sparkles,
  Sprout,
  Star,
  Target,
  Timer,
  TreePine,
  Trees,
  Trophy,
  Zap,
} from 'lucide-react';
import { COURSES, ALL_LESSONS } from '../data/courses';
import { Course, ExamType, Language, Lesson, LessonProgress, UserSettings } from '../types';
import { getTranslation } from '../data/translations';
import { StorageService } from '../services/storageService';
import { LearningTreeCard } from '../components/LearningTreeCard';
import { UnitCertificateModal } from '../components/UnitCertificateModal';
import { DesktopCourseSidebar, SidebarSection } from '../components/DesktopCourseSidebar';
import { ProblemKeysDashboard } from '../components/ProblemKeysDashboard';
import { ExamModal } from '../components/ExamModal';
import { WorkspacePage } from './WorkspacePage';

interface LessonsPageProps {
  settings: UserSettings;
  lessonProgress: Record<string, LessonProgress>;
  onStartLesson: (lessonId: string) => void;
  onUpdateSettings?: (newSettings: Partial<UserSettings>) => void;
}

export const LessonsPage: React.FC<LessonsPageProps> = ({
  settings,
  lessonProgress,
  onStartLesson,
  onUpdateSettings,
}) => {
  const currentLessonId = StorageService.getCurrentLessonId();
  const currentLesson = ALL_LESSONS.find((l) => l.id === currentLessonId) || ALL_LESSONS[0];

  // Navigation section state (Beginner, Intermediate, Advanced, Problem Keys)
  const [selectedSection, setSelectedSection] = useState<SidebarSection>('beginner');
  const [activeLessonId, setActiveLessonId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showTreeCard, setShowTreeCard] = useState<boolean>(false);
  const [certificateCourse, setCertificateCourse] = useState<Course | null>(null);
  const [activeExamType, setActiveExamType] = useState<ExamType | null>(null);

  const t = (key: string) => getTranslation(settings.language, key);
  const isRtl = settings.language === 'ar';

  // Overall statistics
  const progressValues: LessonProgress[] = Object.values(lessonProgress);
  const completedLessonsTotal = progressValues.filter((p) => p.completed).length;

  const validWpms = progressValues.map((p) => p.bestWpm).filter((w) => w > 0);
  const avgSpeed = validWpms.length > 0
    ? Math.round(validWpms.reduce((a, b) => a + b, 0) / validWpms.length)
    : 0;

  const validAccuracies = progressValues.map((p) => p.bestAccuracy).filter((a) => a > 0);
  const avgAccuracy = validAccuracies.length > 0
    ? Math.round(validAccuracies.reduce((a, b) => a + b, 0) / validAccuracies.length)
    : 100;

  const dailyGoal = StorageService.getDailyGoalProgress();
  const totalPagesInCurriculum = ALL_LESSONS.reduce((acc, l) => acc + (l.pages?.length || 12), 0);
  const treeStats = StorageService.getLearningTreeStats(ALL_LESSONS.length, totalPagesInCurriculum);
  const profile = StorageService.getProfile();

  // Problem Keys list
  const problemKeysList = StorageService.getProblemKeys();

  // Level counts & Unlock status
  const beginnerLessons = ALL_LESSONS.filter((l) => l.courseId === 'course-beginner');
  const beginnerCompleted = beginnerLessons.filter((l) => lessonProgress[l.id]?.completed).length;

  const intermediateLessons = ALL_LESSONS.filter((l) => l.courseId === 'course-intermediate');
  const intermediateCompleted = intermediateLessons.filter((l) => lessonProgress[l.id]?.completed).length;
  const isIntermediateUnlocked = StorageService.isLevelUnlocked('intermediate');

  const advancedLessons = ALL_LESSONS.filter((l) => l.courseId === 'course-advanced');
  const advancedCompleted = advancedLessons.filter((l) => lessonProgress[l.id]?.completed).length;
  const isAdvancedUnlocked = StorageService.isLevelUnlocked('advanced');

  const examResults = StorageService.getExamResults();

  const formatPracticeTime = (minutes: number) => {
    const hrs = Math.floor(minutes / 60);
    const mins = Math.floor(minutes % 60);
    const secs = Math.floor((minutes * 60) % 60);
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${pad(hrs)}:${pad(mins)}:${pad(secs)}`;
  };

  const getCourseTitle = (course: Course) => {
    if (settings.language === 'bn' && course.titleBn) return course.titleBn;
    if (settings.language === 'en') return course.titleEn;
    return course.titleAr;
  };

  const getCourseDesc = (course: Course) => {
    if (settings.language === 'bn' && course.descriptionBn) return course.descriptionBn;
    if (settings.language === 'en') return course.descriptionEn;
    return course.descriptionAr;
  };

  // Filtered courses based on selectedSection
  const coursesToDisplay = COURSES.filter((c) => {
    if (selectedSection === 'beginner') return c.id === 'course-beginner';
    if (selectedSection === 'intermediate') return c.id === 'course-intermediate';
    if (selectedSection === 'advanced') return c.id === 'course-advanced';
    return true;
  });

  // Global search matching lessons
  const isSearching = searchQuery.trim().length > 0;
  const matchingLessons = isSearching
    ? ALL_LESSONS.filter((lesson) => {
        const q = searchQuery.toLowerCase();
        const focusKeysStr = (lesson.focusKeys || []).join(' ');
        const newKeysStr = (lesson.newKeys || []).join(' ');
        return (
          lesson.titleAr.toLowerCase().includes(q) ||
          lesson.titleEn.toLowerCase().includes(q) ||
          (lesson.titleBn && lesson.titleBn.toLowerCase().includes(q)) ||
          lesson.descriptionAr.toLowerCase().includes(q) ||
          focusKeysStr.includes(searchQuery) ||
          newKeysStr.includes(searchQuery)
        );
      })
    : [];

  return (
    <div id="lessons-page-view" className="pb-20">
      {/* MAIN TWO-COLUMN LAYOUT: Permanent Left Sidebar + Right Lesson Content */}
      <div 
        id="course-page-layout" 
        className="flex flex-col md:flex-row items-start gap-5 lg:gap-6 w-full" 
        style={{ direction: 'ltr' }}
      >
        {/* PERMANENT SIDEBAR ON THE PHYSICAL LEFT - LOCKED AT TOP, NEVER DRIFTS UP/DOWN */}
        <div className="w-full md:w-64 lg:w-72 xl:w-80 shrink-0" style={{ direction: 'ltr' }}>
          <DesktopCourseSidebar
            currentSection={selectedSection}
            onSelectSection={(sec) => {
              setSelectedSection(sec);
              setActiveLessonId(null);
              setSearchQuery('');
            }}
            onOpenExam={(type) => setActiveExamType(type)}
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

        {/* MAIN FEED CONTENT AREA ON THE PHYSICAL RIGHT */}
        <div className="flex-1 min-w-0 w-full space-y-6" style={{ direction: isRtl ? 'rtl' : 'ltr' }}>
          {/* 1. TOP HEADER & STATS BAR (Typing.com Top Bar Structure) */}
          <div
            id="typing-student-header"
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl sm:rounded-3xl p-3 sm:p-4 shadow-xs flex flex-col lg:flex-row items-center justify-between gap-4"
            dir={isRtl ? 'rtl' : 'ltr'}
          >
            {/* Left Side: Typing Tree Avatar & Mini Progress Pill */}
            <div className="flex items-center gap-3 w-full lg:w-auto">
              {/* Circular Tree Avatar */}
              <button
                type="button"
                onClick={() => setShowTreeCard((prev) => !prev)}
                title={settings.language === 'ar' ? 'عرض شجرة التعلم' : settings.language === 'bn' ? 'শেখার গাছ দেখুন' : 'View Typing Tree'}
                className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border-2 border-emerald-500/40 p-1 flex items-center justify-center shrink-0 cursor-pointer shadow-xs hover:scale-105 transition-transform"
              >
                {treeStats.stage >= 6 ? (
                  <Trees className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                ) : treeStats.stage >= 3 ? (
                  <TreePine className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                ) : (
                  <Sprout className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                )}
                {treeStats.fruitsCount > 0 && (
                  <span className="absolute -top-1 -end-1 bg-amber-500 text-slate-950 text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-xs border border-white dark:border-slate-900">
                    {treeStats.fruitsCount}
                  </span>
                )}
              </button>

              {/* Typing Tree Level & Progress Pill */}
              <div className="flex-1 sm:flex-initial">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm sm:text-base text-slate-900 dark:text-slate-100">
                    {settings.language === 'ar'
                      ? `شجرة التعلم (المرحلة ${treeStats.stage})`
                      : settings.language === 'bn'
                      ? `শেখার গাছ (পর্যায় ${treeStats.stage})`
                      : `Typing Tree (Stage ${treeStats.stage})`}
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowTreeCard((prev) => !prev)}
                    className="inline-flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 hover:underline font-semibold cursor-pointer"
                  >
                    <span>
                      {showTreeCard
                        ? (settings.language === 'ar' ? 'إخفاء' : settings.language === 'bn' ? 'লুকান' : 'Hide')
                        : (settings.language === 'ar' ? 'تفاصيل' : settings.language === 'bn' ? 'বিস্তারিত' : 'Details')}
                    </span>
                    {showTreeCard ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>
                </div>

                <div className="flex items-center gap-2 mt-1.5">
                  <div className="w-28 sm:w-36 bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-emerald-500 dark:bg-emerald-400 h-full rounded-full transition-all duration-500"
                      style={{ width: `${treeStats.overallPercent}%` }}
                    />
                  </div>
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                    {treeStats.overallPercent}%
                  </span>
                </div>
              </div>
            </div>

            {/* Right Side: Key Stats Counters */}
            <div className="flex flex-wrap items-center justify-between sm:justify-end gap-3 sm:gap-6 w-full lg:w-auto border-t lg:border-t-0 pt-2 lg:pt-0 border-slate-100 dark:border-slate-800">
              {/* Completed Lessons */}
              <div className="flex items-center gap-1.5">
                <div className="w-8 h-8 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <Trophy className="w-4 h-4" />
                </div>
                <div>
                  <span className="block text-[10px] uppercase font-bold text-slate-400">
                    {settings.language === 'ar' ? 'الدروس المنجزة' : settings.language === 'bn' ? 'সম্পন্ন পাঠ' : 'Completed'}
                  </span>
                  <span className="text-xs sm:text-sm font-black font-mono text-slate-800 dark:text-slate-200">
                    {completedLessonsTotal} / {ALL_LESSONS.length}
                  </span>
                </div>
              </div>

              {/* Avg Speed */}
              <div className="flex items-center gap-1.5">
                <div className="w-8 h-8 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <span className="block text-[10px] uppercase font-bold text-slate-400">
                    {settings.language === 'ar' ? 'متوسط السرعة' : settings.language === 'bn' ? 'গড় গতি' : 'Avg. Speed'}
                  </span>
                  <span className="text-xs sm:text-sm font-black font-mono text-slate-800 dark:text-slate-200">
                    {avgSpeed} WPM
                  </span>
                </div>
              </div>

              {/* Avg Accuracy */}
              <div className="flex items-center gap-1.5">
                <div className="w-8 h-8 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                  <Target className="w-4 h-4" />
                </div>
                <div>
                  <span className="block text-[10px] uppercase font-bold text-slate-400">
                    {settings.language === 'ar' ? 'معدل الدقة' : settings.language === 'bn' ? 'নির্ভুলতা' : 'Avg. Acc.'}
                  </span>
                  <span className="text-xs sm:text-sm font-black font-mono text-slate-800 dark:text-slate-200">
                    {avgAccuracy}%
                  </span>
                </div>
              </div>

              {/* Typing Practice Time */}
              <div className="flex items-center gap-1.5">
                <div className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <Timer className="w-4 h-4" />
                </div>
                <div>
                  <span className="block text-[10px] uppercase font-bold text-slate-400">
                    {settings.language === 'ar' ? 'وقت التدريب' : settings.language === 'bn' ? 'টাইপিং সময়' : 'Typing Time'}
                  </span>
                  <span className="text-xs sm:text-sm font-black font-mono text-slate-800 dark:text-slate-200">
                    {formatPracticeTime(dailyGoal.minutesPracticed)}
                  </span>
                </div>
              </div>

              {/* Daily Goal Dial Badge */}
              <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
                <Flame className="w-4 h-4 text-amber-500 animate-pulse" />
                <div>
                  <span className="block text-[9px] uppercase font-bold text-slate-400">
                    {settings.language === 'ar' ? 'الهدف اليومي' : settings.language === 'bn' ? 'দৈনিক লক্ষ্য' : 'DAILY GOAL'}
                  </span>
                  <span className="text-xs font-black font-mono text-slate-800 dark:text-slate-200">
                    {Math.round(dailyGoal.minutesPracticed)}:00 / {settings.dailyGoalMinutes}:00
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 2. COLLAPSIBLE LEARNING TREE CARD */}
          <div id="learning-tree-card" className={showTreeCard ? 'block' : 'hidden'}>
            <LearningTreeCard
              lang={settings.language}
              onContinueLearning={() => onStartLesson(currentLesson.id)}
            />
          </div>
          {/* Active Lesson Interactive Typing Workspace */}
          {activeLessonId ? (
            <div className="space-y-4">
              <WorkspacePage
                lessonId={activeLessonId}
                settings={settings}
                onUpdateSettings={onUpdateSettings || (() => {})}
                onSelectLesson={(newId) => setActiveLessonId(newId)}
                onGoToDashboard={() => setActiveLessonId(null)}
                onBackToLessons={() => setActiveLessonId(null)}
                hideSidebar={true}
              />
            </div>
          ) : selectedSection === 'problem-keys' ? (
            /* Problem Keys Adaptive Practice View */
            <ProblemKeysDashboard
              settings={settings}
              onBackToLessons={() => setSelectedSection('beginner')}
            />
          ) : (
            /* Course Lesson Feed View */
            <div className="space-y-6">
              {/* Header & Quick Search Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
                <div>
                  <h2 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                    {selectedSection === 'beginner' && (settings.language === 'ar' ? 'المستوى 1: المبتدئ — الحروف العربية الأساسية' : settings.language === 'bn' ? 'লেভেল ১: বিগিনার — আরবি মূল অক্ষর' : 'Level 1: Beginner — Arabic Letters')}
                    {selectedSection === 'intermediate' && (settings.language === 'ar' ? 'المستوى 2: المتوسط — التشكيل والحركات العربية' : settings.language === 'bn' ? 'লেভেল ২: ইন্টারমিডিয়েট — হরকত ও তাশকিল' : 'Level 2: Intermediate — Harakat & Diacritics')}
                    {selectedSection === 'advanced' && (settings.language === 'ar' ? 'المستوى 3: المتقدم — النصوص الكاملة والاحترافية' : settings.language === 'bn' ? 'লেভেল ৩: অ্যাডভান্সড — পূর্ণ ইবারত ও দক্ষতা' : 'Level 3: Advanced — Full Prose & Mastery')}
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {settings.language === 'ar'
                      ? 'كل درس يحتوي على 12 صفحة تدريبية متكاملة تضمن رسوخ المهارة والذاكرة العضلية.'
                      : settings.language === 'bn'
                      ? 'প্রতিটি পাঠে রয়েছে ১২টি সমন্বিত অনুশীলন পৃষ্ঠা যা দ্রুত ও নির্ভুল টাইপিং নিশ্চিত করে।'
                      : 'Every lesson features 12 comprehensive practice pages building rock-solid muscle memory.'}
                  </p>
                </div>

                <div className="relative w-full sm:w-64 lg:w-72">
                  <Search className="w-4 h-4 text-slate-400 absolute end-3 top-3 pointer-events-none" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={
                      settings.language === 'en'
                        ? 'Search lessons or keys...'
                        : settings.language === 'bn'
                        ? 'কী বা পাঠ খুঁজুন (যেমন: ب + ت)...'
                        : 'ابحث عن درس أو حرف...'
                    }
                    className="w-full ps-3 pe-9 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* VIEW ROUTING: SEARCH RESULTS vs LESSON FEED */}
              {isSearching ? (
                /* Search Results */
                <div className="space-y-4">
              <div className="flex items-center justify-between px-1">
                <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  {settings.language === 'ar'
                    ? `نتائج البحث عن "${searchQuery}" (${matchingLessons.length} درس)`
                    : settings.language === 'bn'
                    ? `"${searchQuery}" অনুসন্ধানের ফলাফল (${matchingLessons.length}টি পাঠ)`
                    : `Search Results for "${searchQuery}" (${matchingLessons.length} lessons)`}
                </h3>
              </div>

              {matchingLessons.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3.5">
                  {matchingLessons.map((lesson) => renderTypingComLessonCard(lesson))}
                </div>
              ) : (
                <div className="text-center py-10 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 text-slate-500">
                  <Search className="w-8 h-8 mx-auto mb-2 text-slate-400" />
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                    {settings.language === 'ar'
                      ? 'لم يتم العثور على أي درس مطابق لبحثك'
                      : settings.language === 'bn'
                      ? 'কোনো পাঠ পাওয়া যায়নি'
                      : 'No lessons matched your search query'}
                  </p>
                </div>
              )}
            </div>
          ) : (
            /* Standard Course View */
            <div className="space-y-6">
              {coursesToDisplay.map((course) => {
                const cLessons = ALL_LESSONS.filter((l) => l.courseId === course.id);
                const cCompleted = cLessons.filter((l) => lessonProgress[l.id]?.completed).length;
                const isDone = cLessons.length > 0 && cCompleted === cLessons.length;
                const progressPercent = cLessons.length > 0 ? Math.round((cCompleted / cLessons.length) * 100) : 0;

                const isCourseLocked =
                  (course.id === 'course-intermediate' && !isIntermediateUnlocked) ||
                  (course.id === 'course-advanced' && !isAdvancedUnlocked);

                const courseExamType: ExamType = 
                  course.id === 'course-beginner' 
                    ? 'beginner' 
                    : course.id === 'course-intermediate' 
                    ? 'intermediate' 
                    : 'final';

                const examPassed = examResults[`${courseExamType}-exam`]?.passed;

                return (
                  <section
                    key={course.id}
                    id={`course-section-${course.id}`}
                    className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xs space-y-5"
                    dir={isRtl ? 'rtl' : 'ltr'}
                  >
                    {/* Course Header Banner */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-sm shrink-0 shadow-xs ${
                            isDone
                              ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800'
                              : isCourseLocked
                              ? 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                              : 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20'
                          }`}
                        >
                          {isCourseLocked ? <Lock className="w-5 h-5 text-slate-400" /> : isDone ? <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" /> : `#${course.order}`}
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="font-black text-base sm:text-lg text-slate-900 dark:text-white truncate">
                              {getCourseTitle(course)}
                            </h3>
                            {isDone && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 shrink-0">
                                <Trophy className="w-3 h-3 text-amber-500" />
                                {settings.language === 'ar' ? 'مكتمل' : 'Completed'}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-xl">
                            {getCourseDesc(course)}
                          </p>
                        </div>
                      </div>

                      {/* Right side: Progress Bar & Exam Trigger */}
                      <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto">
                        <div className="w-28 sm:w-36">
                          <div className="flex items-center justify-between text-[11px] mb-1 font-mono">
                            <span className="text-slate-500 dark:text-slate-400 font-medium">
                              {cCompleted}/{cLessons.length} {settings.language === 'ar' ? 'دروس' : 'lessons'}
                            </span>
                            <span className="font-bold text-emerald-600 dark:text-emerald-400">
                              {progressPercent}%
                            </span>
                          </div>
                          <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-500 bg-emerald-500"
                              style={{ width: `${progressPercent}%` }}
                            />
                          </div>
                        </div>

                        {/* Exam Benchmark Button */}
                        <button
                          type="button"
                          onClick={() => setActiveExamType(courseExamType)}
                          className={`px-3.5 py-2 rounded-xl font-bold text-xs shadow-xs transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                            examPassed
                              ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20'
                              : isDone
                              ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-md shadow-amber-500/20 animate-pulse'
                              : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          <Trophy className="w-3.5 h-3.5 text-amber-500" />
                          <span>
                            {examPassed
                              ? (settings.language === 'ar' ? 'الشهادة المعتمدة ✓' : 'Certificate Earned ✓')
                              : (settings.language === 'ar' ? 'امتحان المستوى' : 'Level Exam')}
                          </span>
                        </button>
                      </div>
                    </div>

                    {/* LOCK OVERLAY IF LEVEL IS LOCKED */}
                    {isCourseLocked ? (
                      <div className="p-8 rounded-3xl bg-slate-50 dark:bg-slate-950/50 border-2 border-dashed border-slate-200 dark:border-slate-800 text-center space-y-3">
                        <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-500 flex items-center justify-center mx-auto">
                          <Lock className="w-6 h-6" />
                        </div>
                        <div>
                          <h4 className="text-base font-black text-slate-900 dark:text-white">
                            {settings.language === 'ar' ? 'هذا المستوى مغلق حالياً' : 'This Level is Currently Locked'}
                          </h4>
                          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto mt-1">
                            {course.id === 'course-intermediate'
                              ? (settings.language === 'ar'
                                  ? 'لفتح مستوى الحركات والتشكيل، أكمل جميع دروس المستوى الأول (المبتدئ) أو اجتز بنجاح امتحان شهادة المبتدئ.'
                                  : 'Complete all Beginner lessons or pass the Beginner Certification Exam to unlock this course.')
                              : (settings.language === 'ar'
                                  ? 'لفتح المستوى المتقدم، أكمل جميع دروس المستوى المتوسط أو اجتز امتحان شهادة المتوسط.'
                                  : 'Complete all Intermediate lessons or pass the Intermediate Exam to unlock this course.')}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            if (course.id === 'course-intermediate') {
                              setSelectedSection('beginner');
                            } else {
                              setSelectedSection('intermediate');
                            }
                          }}
                          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors cursor-pointer"
                        >
                          <span>{settings.language === 'ar' ? 'الذهاب للمستوى السابق' : 'Go to Previous Level'}</span>
                        </button>
                      </div>
                    ) : (
                      /* Lessons Grid: 3-4 Columns on Desktop */
                      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3.5">
                        {cLessons.map((lesson) => renderTypingComLessonCard(lesson))}
                      </div>
                    )}
                  </section>
                );
              })}
            </div>
          )}
            </div>
          )}
        </div>
      </div>

      {/* 5. EXAM & CERTIFICATION MODAL */}
      {activeExamType && (
        <ExamModal
          isOpen={!!activeExamType}
          onClose={() => setActiveExamType(null)}
          examType={activeExamType}
          settings={settings}
          onExamPassed={(passedType) => {
            // Unlocking will automatically recalculate on re-render!
          }}
        />
      )}

      {/* 6. UNIT CERTIFICATE MODAL */}
      <UnitCertificateModal
        isOpen={!!certificateCourse}
        onClose={() => setCertificateCourse(null)}
        course={certificateCourse || COURSES[0]}
        studentName={profile.name || ''}
        avgWpm={avgSpeed}
        avgAccuracy={avgAccuracy}
        completedLessonsCount={
          certificateCourse
            ? ALL_LESSONS.filter((l) => l.courseId === certificateCourse.id && lessonProgress[l.id]?.completed).length
            : 0
        }
        lang={settings.language}
      />
    </div>
  );

  /**
   * Helper function to render a Sleek, Well-Proportioned Lesson Card
   */
  function renderTypingComLessonCard(lesson: Lesson) {
    const progress = lessonProgress[lesson.id];
    const isCompleted = progress?.completed || false;
    const isUnlocked = StorageService.isLessonUnlocked(lesson.id, ALL_LESSONS.map((l) => l.id));
    const totalPages = lesson.pages?.length || 12;
    const completedPages = progress?.completedPages || (isCompleted ? totalPages : 0);
    const bestWpm = progress?.bestWpm || 0;
    const bestAcc = progress?.bestAccuracy || (isCompleted ? 100 : 0);
    const isCurrent = lesson.id === currentLesson.id;

    const lessonTitle =
      settings.language === 'bn' && lesson.titleBn
        ? lesson.titleBn
        : settings.language === 'en'
        ? lesson.titleEn
        : lesson.titleAr;

    const timeEstimate = lesson.estimatedSeconds
      ? `${Math.floor(lesson.estimatedSeconds / 60)}:${String(lesson.estimatedSeconds % 60).padStart(2, '0')}`
      : '2:30';

    return (
      <div
        key={lesson.id}
        id={`lesson-card-${lesson.id}`}
        onClick={() => {
          if (isUnlocked) {
            onStartLesson(lesson.id);
          }
        }}
        className={`relative rounded-2xl p-4 border transition-all duration-150 flex flex-col justify-between select-none ${
          !isUnlocked
            ? 'bg-slate-50/60 dark:bg-slate-900/40 border-slate-200/70 dark:border-slate-800 text-slate-400 opacity-60 cursor-not-allowed'
            : isCurrent
            ? 'bg-white dark:bg-slate-900 border-emerald-500 dark:border-emerald-500 shadow-xs ring-2 ring-emerald-500/20 cursor-pointer hover:shadow-md hover:-translate-y-0.5'
            : isCompleted
            ? 'bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800 shadow-2xs hover:shadow-md hover:border-emerald-400 dark:hover:border-emerald-600 cursor-pointer hover:-translate-y-0.5'
            : 'bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800 shadow-2xs hover:shadow-md hover:border-emerald-500 dark:hover:border-emerald-500 cursor-pointer hover:-translate-y-0.5'
        }`}
        dir={isRtl ? 'rtl' : 'ltr'}
      >
        {/* Top Section: Number, Title, Action Button */}
        <div>
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex items-center gap-2.5 min-w-0">
              {/* Number Badge */}
              <div
                className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 font-mono shadow-2xs ${
                  !isUnlocked
                    ? 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                    : isCompleted
                    ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800'
                    : isCurrent
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                }`}
              >
                {isCompleted ? <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> : lesson.order}
              </div>

              {/* Title */}
              <div className="min-w-0">
                <h5
                  className={`font-bold text-xs sm:text-sm truncate font-['Noto_Naskh_Arabic',sans-serif] ${
                    !isUnlocked
                      ? 'text-slate-500 dark:text-slate-400'
                      : 'text-slate-900 dark:text-slate-100'
                  }`}
                  title={lessonTitle}
                >
                  {lessonTitle}
                </h5>
              </div>
            </div>

            {/* Compact Action Button */}
            <button
              type="button"
              id={`action-lesson-btn-${lesson.id}`}
              disabled={!isUnlocked}
              onClick={(e) => {
                e.stopPropagation();
                onStartLesson(lesson.id);
              }}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all shrink-0 cursor-pointer shadow-xs ${
                !isUnlocked
                  ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                  : isCompleted
                  ? 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
                  : completedPages > 0
                  ? 'bg-amber-500 hover:bg-amber-600 text-white active:scale-95'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white active:scale-95'
              }`}
            >
              {!isUnlocked ? (
                <>
                  <Lock className="w-3 h-3" />
                  <span>{settings.language === 'ar' ? 'مغلق' : settings.language === 'bn' ? 'লক' : 'Locked'}</span>
                </>
              ) : isCompleted ? (
                <>
                  <RotateCcw className="w-3 h-3 text-slate-500 dark:text-slate-400" />
                  <span>{settings.language === 'ar' ? 'إعادة' : settings.language === 'bn' ? 'পুনরায়' : 'Restart'}</span>
                </>
              ) : completedPages > 0 ? (
                <>
                  <Play className="w-3 h-3 fill-current text-white" />
                  <span>{settings.language === 'ar' ? 'متابعة' : settings.language === 'bn' ? 'চলুন' : 'Resume'}</span>
                </>
              ) : (
                <>
                  <Play className="w-3 h-3 fill-current text-white" />
                  <span>{settings.language === 'ar' ? 'ابدأ' : settings.language === 'bn' ? 'শুরু' : 'Start'}</span>
                </>
              )}
            </button>
          </div>

          {/* New Keys Badge Row */}
          {lesson.newKeys && lesson.newKeys.length > 0 && (
            <div className="flex items-center gap-1.5 mb-2">
              <span className="text-[10px] text-slate-400">
                {settings.language === 'ar' ? 'مفاتيح جديدة:' : settings.language === 'bn' ? 'নতুন কী:' : 'Keys:'}
              </span>
              <div className="flex items-center gap-1">
                {lesson.newKeys.map((k) => (
                  <span
                    key={k}
                    className="px-2 py-0.5 rounded-md font-mono text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700 shadow-2xs"
                  >
                    {k}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Bottom Section: Compact Stats & Segmented Progress */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80">
          {/* Stats Line */}
          <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 font-mono mb-1.5">
            <span title="Speed">
              {bestWpm > 0 ? `${bestWpm} WPM` : '-- WPM'}
            </span>
            <span title="Accuracy">
              {bestAcc > 0 ? `${bestAcc}%` : '--%'}
            </span>
            <span title="Estimated Time">
              {timeEstimate}
            </span>
          </div>

          {/* Slim Segmented Progress Bar (12 segments for the 12 pages) */}
          <div className="flex items-center gap-0.5 w-full">
            {Array.from({ length: totalPages }).map((_, idx) => {
              const pageNum = idx + 1;
              const isPageDone = isCompleted || pageNum <= completedPages;

              return (
                <div
                  key={`seg-${lesson.id}-${pageNum}`}
                  title={
                    settings.language === 'ar'
                      ? `الصفحة ${pageNum} من ${totalPages}`
                      : settings.language === 'bn'
                      ? `পৃষ্ঠা ${pageNum}/${totalPages}`
                      : `Page ${pageNum} of ${totalPages}`
                  }
                  className={`flex-1 h-1.5 rounded-xs transition-colors ${
                    !isUnlocked
                      ? 'bg-slate-200 dark:bg-slate-800'
                      : isPageDone
                      ? 'bg-emerald-500 dark:bg-emerald-400'
                      : 'bg-slate-100 dark:bg-slate-800'
                  }`}
                />
              );
            })}
          </div>

          {/* Progress Subtext */}
          <div className="flex items-center justify-between text-[9px] text-slate-400 font-mono mt-1 px-0.5">
            <span>
              {completedPages}/{totalPages} {settings.language === 'ar' ? 'صفحات' : settings.language === 'bn' ? 'পৃষ্ঠা' : 'pgs'}
            </span>
            <span>
              {Math.min(100, Math.round((completedPages / totalPages) * 100))}%
            </span>
          </div>
        </div>
      </div>
    );
  }
};
