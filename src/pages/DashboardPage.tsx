import React from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Award,
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  Flame,
  GraduationCap,
  Keyboard,
  Play,
  Sparkles,
  Target,
  Timer,
  TrendingUp,
  Zap,
} from 'lucide-react';
import {
  Course,
  DailyGoalProgress,
  Language,
  Lesson,
  LessonProgress,
  StreakData,
  TypingMistake,
  UserProfile,
  UserSettings,
} from '../types';
import { COURSES, ALL_LESSONS } from '../data/courses';
import { getTranslation } from '../data/translations';
import { LearningTreeCard } from '../components/LearningTreeCard';

interface DashboardPageProps {
  settings: UserSettings;
  profile: UserProfile;
  streak: StreakData;
  dailyGoal: DailyGoalProgress;
  lessonProgress: Record<string, LessonProgress>;
  currentLessonId: string;
  mistakes: Record<string, TypingMistake>;
  onStartLesson: (lessonId: string) => void;
  onGoToTest: () => void;
  onGoToLessons: () => void;
  onGoToMistakes: () => void;
  onGoToStats: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  settings,
  profile,
  streak,
  dailyGoal,
  lessonProgress,
  currentLessonId,
  mistakes,
  onStartLesson,
  onGoToTest,
  onGoToLessons,
  onGoToMistakes,
  onGoToStats,
}) => {
  const t = (key: string) => getTranslation(settings.language, key);
  const isRtl = settings.language === 'ar';

  // Current lesson & course
  const currentLesson = ALL_LESSONS.find((l) => l.id === currentLessonId) || ALL_LESSONS[0];
  const currentCourse = COURSES.find((c) => c.id === currentLesson.courseId) || COURSES[0];

  // Aggregated Stats
  const progressList = Object.values(lessonProgress) as LessonProgress[];
  const completedLessonsCount = progressList.filter((p) => p.completed).length;
  const totalLessonsCount = ALL_LESSONS.length;
  const overallProgress = Math.min(100, Math.round((completedLessonsCount / totalLessonsCount) * 100));

  const allWpms = progressList.map((p) => p.bestWpm).filter((w) => w > 0);
  const bestWpm = allWpms.length > 0 ? Math.max(...allWpms) : 0;

  const allAccuracies = progressList.map((p) => p.bestAccuracy).filter((a) => a > 0);
  const avgAccuracy = allAccuracies.length > 0
    ? Math.round(allAccuracies.reduce((a, b) => a + b, 0) / allAccuracies.length)
    : 100;

  const totalMinutes = Math.round(dailyGoal.minutesPracticed);

  // High mistake letters
  const mistakeEntries = (Object.entries(mistakes) as [string, TypingMistake][]).sort(
    (a, b) => b[1].count - a[1].count
  );
  const topMistakeKeys = mistakeEntries.slice(0, 4);

  return (
    <div id="dashboard-page-view" className="space-y-8 pb-16">
      {/* 1. Hero Section */}
      <section
        id="hero-banner"
        className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-teal-950 text-white rounded-3xl p-6 sm:p-10 shadow-xl overflow-hidden border border-slate-800"
      >
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{settings.language === 'en' ? 'Professional Touch Typing' : settings.language === 'bn' ? 'প্রফেশনাল টাচ টাইপিং' : 'منصة تعليمية معتمدة للطباعة باللمس'}</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight font-['Noto_Naskh_Arabic','Alexandria',sans-serif]">
            {t('heroTitle')}
          </h2>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-2xl">
            {t('heroSubtitle')}
          </p>

          <div className="pt-3 flex flex-wrap items-center gap-3">
            <button
              type="button"
              id="hero-start-learning-btn"
              onClick={() => onStartLesson(currentLesson.id)}
              className="py-3.5 px-6 rounded-2xl bg-emerald-500 hover:bg-emerald-600 active:scale-98 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/25 transition-all flex items-center gap-2.5 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-slate-950" />
              <span>{t('startLearning')}</span>
            </button>

            <button
              type="button"
              id="hero-typing-test-btn"
              onClick={onGoToTest}
              className="py-3.5 px-6 rounded-2xl bg-slate-800 hover:bg-slate-700 active:scale-98 text-white border border-slate-700 font-bold text-sm shadow-sm transition-all flex items-center gap-2 cursor-pointer"
            >
              <Timer className="w-4 h-4 text-amber-400" />
              <span>{t('takeTest')}</span>
            </button>
          </div>
        </div>
      </section>

      {/* 2. Dashboard Cards (6 Core Metrics) */}
      <section id="dashboard-metrics-grid" className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {/* Card 1: Level */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold">{t('currentLevel')}</span>
            <GraduationCap className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 font-mono">
            {profile.level} <span className="text-xs font-normal text-slate-400">/ 12</span>
          </div>
          <span className="text-[11px] text-slate-500">
            {settings.language === 'en'
              ? currentCourse.titleEn
              : settings.language === 'bn' && currentCourse.titleBn
              ? currentCourse.titleBn
              : currentCourse.titleAr}
          </span>
        </div>

        {/* Card 2: Lessons Completed */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold">{t('lessonsCompleted')}</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
            {completedLessonsCount} <span className="text-xs font-normal text-slate-400">/ {totalLessonsCount}</span>
          </div>
          <span className="text-[11px] text-slate-500">{overallProgress}% {t('progress')}</span>
        </div>

        {/* Card 3: Current Streak */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold">{t('currentStreak')}</span>
            <Flame className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-amber-500 font-mono">
            {streak.currentStreak} <span className="text-xs font-normal text-slate-400">{t('days')}</span>
          </div>
          <span className="text-[11px] text-slate-500">
            {streak.longestStreak}{' '}
            {settings.language === 'en'
              ? 'longest'
              : settings.language === 'bn'
              ? 'সর্বোচ্চ স্ট্রিক'
              : 'أطول سلسلة'}
          </span>
        </div>

        {/* Card 4: Best WPM */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold">{t('bestWpm')}</span>
            <Zap className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 font-mono">
            {bestWpm} <span className="text-xs font-normal text-slate-400">WPM</span>
          </div>
          <span className="text-[11px] text-slate-500">
            {bestWpm > 0
              ? settings.language === 'en'
                ? 'Achieved'
                : settings.language === 'bn'
                ? 'অর্জিত'
                : 'مُحقق'
              : settings.language === 'en'
              ? 'Start 1st lesson'
              : settings.language === 'bn'
              ? 'প্রথম পাঠ শুরু করুন'
              : 'ابدأ أول درس'}
          </span>
        </div>

        {/* Card 5: Avg Accuracy */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold">{t('avgAccuracy')}</span>
            <Target className="w-4 h-4 text-teal-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-teal-600 dark:text-teal-400 font-mono">
            {avgAccuracy}%
          </div>
          <span className="text-[11px] text-slate-500">
            {settings.language === 'en'
              ? 'Target: 95%+'
              : settings.language === 'bn'
              ? 'লক্ষ্য: ৯৫%+'
              : 'المستهدف: 95%+'}
          </span>
        </div>

        {/* Card 6: Total Practice Time */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold">{t('totalPracticeTime')}</span>
            <Clock className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-indigo-600 dark:text-indigo-400 font-mono">
            {totalMinutes} <span className="text-xs font-normal text-slate-400">{t('minutes')}</span>
          </div>
          <span className="text-[11px] text-slate-500">
            {dailyGoal.minutesPracticed}{settings.language === 'en' ? 'm' : settings.language === 'bn' ? ' মি.' : 'د'}{' '}
            {settings.language === 'en'
              ? 'today'
              : settings.language === 'bn'
              ? 'আজকে'
              : 'اليوم'}
          </span>
        </div>
      </section>

      {/* Interactive Arabic Learning Tree Card */}
      <section id="dashboard-learning-tree-section">
        <LearningTreeCard
          lang={settings.language}
          onContinueLearning={() => onStartLesson(currentLesson.id)}
        />
      </section>

      {/* 3. Continue Learning Banner & Weak Keys Alert */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Continue Learning Card */}
        <div
          id="continue-learning-card"
          className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between gap-2 mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
                {t('continueLearning')}
              </span>
              <span className="text-xs font-semibold text-slate-500 font-mono">
                {settings.language === 'en'
                  ? currentCourse.titleEn
                  : settings.language === 'bn' && currentCourse.titleBn
                  ? currentCourse.titleBn
                  : currentCourse.titleAr}
              </span>
            </div>

            <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 font-['Noto_Naskh_Arabic','Alexandria',sans-serif]">
              {settings.language === 'en'
                ? currentLesson.titleEn
                : settings.language === 'bn'
                ? currentLesson.titleBn
                : currentLesson.titleAr}
            </h3>

            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 line-clamp-2">
              {settings.language === 'en'
                ? currentLesson.descriptionEn
                : settings.language === 'bn'
                ? currentLesson.descriptionBn
                : currentLesson.descriptionAr}
            </p>

            {/* Target Sample Preview */}
            <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-['Noto_Naskh_Arabic',sans-serif] text-base truncate select-none">
              {currentLesson.targetText}
            </div>
          </div>

          <div className="pt-6 flex items-center justify-between gap-4 border-t border-slate-100 dark:border-slate-800 mt-4">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span className="font-semibold">{t('estimatedTime')}:</span>
              <span className="font-mono font-bold text-slate-700 dark:text-slate-300">
                {currentLesson.estimatedSeconds} {t('seconds')}
              </span>
            </div>

            <button
              type="button"
              id="continue-lesson-btn"
              onClick={() => onStartLesson(currentLesson.id)}
              className="py-2.5 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-bold text-sm shadow-md transition-all flex items-center gap-2 cursor-pointer"
            >
              <span>{t('continueBtn')}</span>
              {isRtl ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Weak Keys or Today's Goal Focus */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <span>{t('problematicLetters')}</span>
              </h4>
              <button
                type="button"
                onClick={onGoToMistakes}
                className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold hover:underline cursor-pointer"
              >
                {settings.language === 'en'
                  ? 'View all'
                  : settings.language === 'bn'
                  ? 'সব দেখুন'
                  : 'عرض الكل'}
              </button>
            </div>

            {topMistakeKeys.length > 0 ? (
              <div className="space-y-2 mt-3">
                {topMistakeKeys.map(([char, mistake]) => (
                  <div
                    key={`mistake-${char}`}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="w-8 h-8 rounded-lg bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 font-bold text-base flex items-center justify-center">
                        {char}
                      </span>
                      <span className="text-xs text-slate-600 dark:text-slate-300">
                        {settings.language === 'en'
                          ? 'Letter'
                          : settings.language === 'bn'
                          ? 'বর্ণ'
                          : 'حرف'}{' '}
                        「{char}」
                      </span>
                    </div>
                    <span className="text-xs font-mono font-bold text-rose-500">
                      {mistake.count} {t('errors')}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-xs text-slate-400">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-60" />
                <p>{t('noMistakesYet')}</p>
              </div>
            )}
          </div>

          <div className="pt-4 mt-2">
            <button
              type="button"
              id="practice-weak-keys-dash-btn"
              onClick={onGoToMistakes}
              className="w-full py-2.5 px-4 rounded-xl bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 dark:hover:bg-amber-900/50 border border-amber-200 dark:border-amber-800/60 text-amber-700 dark:text-amber-300 font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>{t('practiceWeakKeys')}</span>
            </button>
          </div>
        </div>
      </section>

      {/* 4. Course Overview (12 Structured Courses) */}
      <section id="courses-overview-section" className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 font-['Noto_Naskh_Arabic','Alexandria',sans-serif]">
              {t('courseOverview')}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {settings.language === 'en'
                ? '12 structured levels from basic home keys to speed and literary mastery'
                : settings.language === 'bn'
                ? 'হোম রো থেকে শুরু করে স্পিড ও সাহিত্যিক দক্ষতা পর্যন্ত ১২টি সুবিন্যস্ত স্তর'
                : '12 مستوى تدريبياً متسلسلاً من الصفر والارتكاز حتى قمة السرعة والاحتراف'}
            </p>
          </div>

          <button
            type="button"
            onClick={onGoToLessons}
            className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>{t('allCourses')}</span>
            {isRtl ? <ArrowLeft className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {COURSES.map((course) => {
            const courseLessons = ALL_LESSONS.filter((l) => l.courseId === course.id);
            const courseCompleted = courseLessons.filter((l) => lessonProgress[l.id]?.completed).length;
            const coursePercent = Math.round((courseCompleted / courseLessons.length) * 100);
            const isFinished = coursePercent === 100;

            return (
              <div
                key={course.id}
                id={`course-card-${course.id}`}
                onClick={() => onStartLesson(courseLessons[0].id)}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs hover:shadow-md hover:border-emerald-500/50 transition-all cursor-pointer flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center justify-center font-mono">
                      #{course.order}
                    </span>
                    {isFinished ? (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold">
                        {settings.language === 'en'
                          ? 'Completed ✓'
                          : settings.language === 'bn'
                          ? 'সম্পন্ন ✓'
                          : 'مكتمل ✓'}
                      </span>
                    ) : (
                      <span className="text-xs text-slate-400 font-mono font-semibold">
                        {courseCompleted}/{courseLessons.length}
                      </span>
                    )}
                  </div>

                  <h4 className="font-bold text-base text-slate-900 dark:text-slate-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors font-['Noto_Naskh_Arabic',sans-serif]">
                    {settings.language === 'en'
                      ? course.titleEn
                      : settings.language === 'bn'
                      ? course.titleBn
                      : course.titleAr}
                  </h4>

                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                    {settings.language === 'en'
                      ? course.descriptionEn
                      : settings.language === 'bn'
                      ? course.descriptionBn
                      : course.descriptionAr}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1.5 font-semibold">
                    <span>{t('progress')}</span>
                    <span className="font-mono">{coursePercent}%</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                      style={{ width: `${coursePercent}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
