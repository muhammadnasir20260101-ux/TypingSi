import React, { useState } from 'react';
import { BookOpen, CheckCircle, ChevronLeft, ChevronRight, Play, Search, Star, Zap } from 'lucide-react';
import { COURSES, ALL_LESSONS } from '../data/courses';
import { Course, Language, Lesson, LessonProgress, UserSettings } from '../types';
import { getTranslation } from '../data/translations';

interface LessonsPageProps {
  settings: UserSettings;
  lessonProgress: Record<string, LessonProgress>;
  onStartLesson: (lessonId: string) => void;
}

export const LessonsPage: React.FC<LessonsPageProps> = ({
  settings,
  lessonProgress,
  onStartLesson,
}) => {
  const [selectedCourseId, setSelectedCourseId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const t = (key: string) => getTranslation(settings.language, key);

  // Filter lessons
  const filteredLessons = ALL_LESSONS.filter((lesson) => {
    const matchesCourse = selectedCourseId === 'all' || lesson.courseId === selectedCourseId;
    const focusKeysStr = (lesson.focusKeys || []).join(' ');
    const matchesSearch =
      searchQuery.trim() === '' ||
      lesson.titleAr.includes(searchQuery) ||
      lesson.titleEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lesson.descriptionAr.includes(searchQuery) ||
      focusKeysStr.includes(searchQuery);
    return matchesCourse && matchesSearch;
  });

  return (
    <div id="lessons-page-view" className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 font-['Noto_Naskh_Arabic','Alexandria',sans-serif]">
            {t('navLessons')}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            {settings.language === 'en'
              ? 'Structured educational curriculum covering every key, diacritic, and word structure'
              : settings.language === 'bn'
              ? 'কীবোর্ডের প্রতিটি কী, হরকত ও আরবি বাক্য গঠনের সুবিন্যস্ত শিক্ষামূলক পাঠক্রম'
              : 'منهج تعليمي كامل مقسم بعناية لتغطية كافة مفاتيح وحركات لوحة المفاتيح العربية'}
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute end-3 top-3 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              settings.language === 'en'
                ? 'Search lessons...'
                : settings.language === 'bn'
                ? 'পাঠ বা বর্ণ খুঁজুন...'
                : 'ابحث عن درس أو حرف...'
            }
            className="w-full ps-3 pe-9 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Course Filter Horizontal Scroll Pill Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          type="button"
          onClick={() => setSelectedCourseId('all')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
            selectedCourseId === 'all'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
          }`}
        >
          {settings.language === 'en'
            ? 'All Lessons'
            : settings.language === 'bn'
            ? 'সকল পাঠ'
            : 'جميع الدروس'}{' '}
          ({ALL_LESSONS.length})
        </button>

        {COURSES.map((course) => {
          const isSelected = selectedCourseId === course.id;
          const courseTitle =
            settings.language === 'bn' && course.titleBn
              ? course.titleBn
              : settings.language === 'en'
              ? course.titleEn
              : course.titleAr;
          return (
            <button
              key={course.id}
              type="button"
              onClick={() => setSelectedCourseId(course.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                isSelected
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              #{course.order} {courseTitle}
            </button>
          );
        })}
      </div>

      {/* Lessons Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredLessons.map((lesson) => {
          const progress = lessonProgress[lesson.id];
          const isCompleted = progress?.completed || false;
          const stars = progress?.stars || 0;
          const bestWpm = progress?.bestWpm || 0;
          const bestAcc = progress?.bestAccuracy || 0;

          return (
            <div
              key={lesson.id}
              id={`lesson-item-${lesson.id}`}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs hover:border-emerald-500/50 hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                {/* Top badges */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-[11px] font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 rounded-md font-mono">
                    #{lesson.order}
                  </span>

                  {/* Star Rating */}
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={`star-${s}`}
                        className={`w-3.5 h-3.5 ${
                          s <= stars
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-slate-200 dark:text-slate-700'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 font-['Noto_Naskh_Arabic',sans-serif]">
                  {settings.language === 'en'
                    ? lesson.titleEn
                    : settings.language === 'bn'
                    ? lesson.titleBn
                    : lesson.titleAr}
                </h3>

                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                  {settings.language === 'en'
                    ? lesson.descriptionEn
                    : settings.language === 'bn'
                    ? lesson.descriptionBn
                    : lesson.descriptionAr}
                </p>

                {/* Target Characters pill */}
                <div className="mt-3 flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] text-slate-400">
                    {settings.language === 'en'
                      ? 'Keys:'
                      : settings.language === 'bn'
                      ? 'কীসমূহ:'
                      : 'المفاتيح:'}
                  </span>
                  {(lesson.focusKeys || []).slice(0, 6).map((c, i) => (
                    <span
                      key={`char-tag-${i}`}
                      className="inline-block px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-md text-xs font-bold font-mono"
                    >
                      {c === ' '
                        ? settings.language === 'en'
                          ? 'Space'
                          : settings.language === 'bn'
                          ? 'স্পেস'
                          : 'مسافة'
                        : c}
                    </span>
                  ))}
                  {(lesson.focusKeys || []).length > 6 && (
                    <span className="text-[10px] text-slate-400">+{(lesson.focusKeys || []).length - 6}</span>
                  )}
                </div>
              </div>

              {/* Bottom stats and action */}
              <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div>
                  {isCompleted ? (
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold font-mono flex items-center gap-1">
                        <Zap className="w-3 h-3 text-amber-500" />
                        {bestWpm} WPM
                      </span>
                      <span className="text-slate-400 font-mono">| {bestAcc}%</span>
                    </div>
                  ) : (
                    <span className="text-xs text-slate-400">
                      ~{lesson.estimatedSeconds} {t('seconds')}
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  id={`start-lesson-btn-${lesson.id}`}
                  onClick={() => onStartLesson(lesson.id)}
                  className={`py-1.5 px-3.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    isCompleted
                      ? 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs active:scale-95'
                  }`}
                >
                  <Play className="w-3 h-3 fill-current" />
                  <span>
                    {isCompleted
                      ? settings.language === 'en'
                        ? 'Repeat'
                        : settings.language === 'bn'
                        ? 'পুনরায়'
                        : 'إعادة'
                      : t('start')}
                  </span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
