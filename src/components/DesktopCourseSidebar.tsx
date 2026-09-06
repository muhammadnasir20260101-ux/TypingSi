import React from 'react';
import { 
  Check, 
  CheckCircle2, 
  Lock, 
  Sparkles, 
  Trophy, 
  ChevronRight,
  BookOpen
} from 'lucide-react';
import { UserSettings } from '../types';
import { StorageService } from '../services/storageService';

export type SidebarSection = 'beginner' | 'intermediate' | 'advanced' | 'problem-keys';

interface DesktopCourseSidebarProps {
  currentSection: SidebarSection;
  onSelectSection: (section: SidebarSection) => void;
  onOpenExam?: (examType: 'beginner' | 'intermediate' | 'final') => void;
  settings: UserSettings;
  beginnerCompletedCount: number;
  beginnerTotalCount: number;
  intermediateCompletedCount: number;
  intermediateTotalCount: number;
  advancedCompletedCount: number;
  advancedTotalCount: number;
  problemKeysCount: number;
  className?: string;
}

export const DesktopCourseSidebar: React.FC<DesktopCourseSidebarProps> = ({
  currentSection,
  onSelectSection,
  onOpenExam,
  settings,
  beginnerCompletedCount,
  beginnerTotalCount,
  intermediateCompletedCount,
  intermediateTotalCount,
  advancedCompletedCount,
  advancedTotalCount,
  problemKeysCount,
  className = '',
}) => {
  const isIntermediateUnlocked = StorageService.isLevelUnlocked('intermediate');
  const isAdvancedUnlocked = StorageService.isLevelUnlocked('advanced');
  const examResults = StorageService.getExamResults();

  // Progress Calculations
  const beginnerPercent = Math.round(
    (beginnerCompletedCount / Math.max(beginnerTotalCount, 1)) * 100
  );
  const isBeginnerCompleted = beginnerCompletedCount >= beginnerTotalCount && beginnerTotalCount > 0;

  const intermediatePercent = Math.round(
    (intermediateCompletedCount / Math.max(intermediateTotalCount, 1)) * 100
  );
  const isIntermediateCompleted = intermediateCompletedCount >= intermediateTotalCount && intermediateTotalCount > 0;

  const advancedPercent = Math.round(
    (advancedCompletedCount / Math.max(advancedTotalCount, 1)) * 100
  );
  const isAdvancedCompleted = advancedCompletedCount >= advancedTotalCount && advancedTotalCount > 0;

  const menuItems = [
    {
      id: 'beginner' as SidebarSection,
      emoji: '🌱',
      title: 'বিগিনার',
      titleAr: 'المبتدئ',
      titleEn: 'Beginner',
      subtitle: 'আরবি অক্ষর',
      subtitleAr: 'الحروف العربية',
      subtitleEn: 'Arabic Letters',
      completedCount: beginnerCompletedCount,
      totalCount: beginnerTotalCount,
      percent: beginnerPercent,
      isCompleted: isBeginnerCompleted,
      isLocked: false,
      examType: 'beginner' as const,
      examPassed: examResults['beginner-exam']?.passed,
      examTitle: settings.language === 'ar' ? 'امتحان المبتدئ' : settings.language === 'bn' ? 'বিগিনার ফাইনাল পরীক্ষা' : 'Beginner Exam',
    },
    {
      id: 'intermediate' as SidebarSection,
      emoji: '🌿',
      title: 'ইন্টারমিডিয়েট',
      titleAr: 'المتوسط',
      titleEn: 'Intermediate',
      subtitle: 'আরবি অক্ষর + হরকত',
      subtitleAr: 'الحركات والتشكيل',
      subtitleEn: 'Letters + Harakat',
      completedCount: intermediateCompletedCount,
      totalCount: intermediateTotalCount,
      percent: intermediatePercent,
      isCompleted: isIntermediateCompleted,
      isLocked: false,
      examType: 'intermediate' as const,
      examPassed: examResults['intermediate-exam']?.passed,
      examTitle: settings.language === 'ar' ? 'امتحان المتوسط' : settings.language === 'bn' ? 'ইন্টারমিডিয়েট ফাইনাল' : 'Intermediate Exam',
    },
    {
      id: 'advanced' as SidebarSection,
      emoji: '🌳',
      title: 'অ্যাডভান্সড',
      titleAr: 'المتقدم',
      titleEn: 'Advanced',
      subtitle: 'পূর্ণ আরবি ইবারত',
      subtitleAr: 'النصوص الكاملة',
      subtitleEn: 'Full Arabic Prose',
      completedCount: advancedCompletedCount,
      totalCount: advancedTotalCount,
      percent: advancedPercent,
      isCompleted: isAdvancedCompleted,
      isLocked: false,
      examType: 'final' as const,
      examPassed: examResults['final-exam']?.passed,
      examTitle: settings.language === 'ar' ? 'الامتحان النهائي الكبير' : settings.language === 'bn' ? 'গ্র্যান্ড ফাইনাল পরীক্ষা' : 'Grand Final Exam',
    },
    {
      id: 'problem-keys' as SidebarSection,
      emoji: '⚠️',
      title: 'আমার সমস্যার বাটন',
      titleAr: 'مفاتيحي الصعبة',
      titleEn: 'Your Problem Keys',
      subtitle: 'যেসব বাটনে বেশি ভুল হচ্ছে',
      subtitleAr: 'أكثر المفاتيح خطأً',
      subtitleEn: 'Keys with frequent errors',
      completedCount: 0,
      totalCount: problemKeysCount,
      percent: 0,
      isCompleted: problemKeysCount === 0,
      isLocked: false,
      isProblemKeys: true,
      count: problemKeysCount,
    },
  ];

  return (
    <aside 
      id="desktop-course-sidebar"
      className={`w-full md:w-64 lg:w-72 xl:w-80 shrink-0 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl sm:rounded-3xl p-3.5 sm:p-4 lg:p-5 shadow-xs sticky top-20 self-start max-h-[calc(100vh-5.5rem)] overflow-y-auto ${className}`}
      dir="ltr"
    >
      {/* Sidebar Header */}
      <div className="flex items-center gap-3 pb-3.5 mb-3.5 border-b border-slate-100 dark:border-slate-800">
        <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
          <BookOpen className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block">
            {settings.language === 'ar' ? 'منهج الطباعة المعتمد' : 'CURRICULUM'}
          </span>
          <h2 className="text-sm sm:text-base font-black text-slate-900 dark:text-white truncate">
            {settings.language === 'ar'
              ? '📚 منهج الطباعة العربية'
              : settings.language === 'bn'
              ? '📚 আরবি টাইপিং কোর্স'
              : '📚 Arabic Typing Course'}
          </h2>
        </div>
      </div>

      {/* Navigation Menu List */}
      <nav className="space-y-2.5" aria-label="Arabic Typing Course Curriculum">
        {menuItems.map((item) => {
          const isActive = currentSection === item.id;
          const isLocked = item.isLocked;

          return (
            <div key={item.id} className="space-y-1">
              <button
                type="button"
                id={`sidebar-course-item-${item.id}`}
                onClick={() => {
                  if (!isLocked) {
                    onSelectSection(item.id);
                  }
                }}
                disabled={isLocked}
                className={`w-full group relative flex flex-col p-3 rounded-2xl text-start transition-all cursor-pointer select-none ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950/20 ring-2 ring-emerald-500/40'
                    : isLocked
                    ? 'bg-slate-50 dark:bg-slate-950/40 text-slate-400 dark:text-slate-600 cursor-not-allowed border border-slate-100 dark:border-slate-800/60'
                    : 'bg-white dark:bg-slate-800/60 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700/80 hover:border-emerald-500/40'
                }`}
              >
                {/* Top Row: Emoji, Title, and Status Badge (✓, 🔒, or Count) */}
                <div className="flex items-center justify-between gap-2 w-full">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-base sm:text-lg shrink-0" role="img" aria-label={item.title}>
                      {item.emoji}
                    </span>
                    <div className="min-w-0">
                      <span className={`text-xs sm:text-sm font-black truncate block ${
                        isActive 
                          ? 'text-white' 
                          : isLocked 
                          ? 'text-slate-400 dark:text-slate-500' 
                          : 'text-slate-900 dark:text-white'
                      }`}>
                        {item.title}
                      </span>
                    </div>
                  </div>

                  {/* Status Indicator */}
                  <div className="shrink-0 flex items-center gap-1.5">
                    {item.isProblemKeys ? (
                      (item.count || 0) > 0 ? (
                        <span className={`text-[11px] font-black px-2 py-0.5 rounded-full border shadow-xs ${
                          isActive
                            ? 'bg-white text-slate-900 border-white'
                            : 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30'
                        }`}>
                          {item.count}
                        </span>
                      ) : (
                        <span className={`inline-flex items-center gap-0.5 text-xs font-bold ${
                          isActive ? 'text-white' : 'text-emerald-600 dark:text-emerald-400'
                        }`}>
                          <Check className="w-4 h-4 stroke-[3]" />
                        </span>
                      )
                    ) : isLocked ? (
                      <span className="p-1 rounded-md bg-slate-200/60 dark:bg-slate-800 text-slate-400">
                        <Lock className="w-3.5 h-3.5" />
                      </span>
                    ) : item.isCompleted ? (
                      <span className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-xs font-black shadow-xs ${
                        isActive
                          ? 'bg-white text-emerald-700'
                          : 'bg-emerald-500 text-white dark:bg-emerald-500 dark:text-slate-950'
                      }`}>
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </span>
                    ) : (
                      <span className={`text-[11px] font-mono font-bold ${
                        isActive ? 'text-emerald-100' : 'text-slate-500 dark:text-slate-400'
                      }`}>
                        {item.percent}%
                      </span>
                    )}
                  </div>
                </div>

                {/* Subtitle / Description */}
                <div className="mt-1 flex items-center justify-between gap-1 w-full ps-6">
                  <p className={`text-[11px] font-medium leading-tight truncate ${
                    isActive ? 'text-emerald-100' : 'text-slate-500 dark:text-slate-400'
                  }`}>
                    {item.subtitle}
                  </p>
                  
                  {!item.isProblemKeys && !isLocked && (
                    <span className={`text-[10px] font-mono shrink-0 ${
                      isActive ? 'text-emerald-200' : 'text-slate-400'
                    }`}>
                      {item.completedCount}/{item.totalCount}
                    </span>
                  )}
                </div>

                {/* Progress Bar for Courses */}
                {!item.isProblemKeys && (
                  <div className="mt-2 w-full ps-6">
                    <div className={`w-full h-1.5 rounded-full overflow-hidden ${
                      isActive ? 'bg-emerald-800/60' : 'bg-slate-100 dark:bg-slate-800'
                    }`}>
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isActive 
                            ? 'bg-white' 
                            : item.isCompleted 
                            ? 'bg-emerald-500' 
                            : isLocked 
                            ? 'bg-slate-300 dark:bg-slate-700' 
                            : 'bg-emerald-500'
                        }`}
                        style={{ width: `${isLocked ? 0 : item.percent}%` }}
                      />
                    </div>
                  </div>
                )}
              </button>

              {/* Exam Trigger Option (if defined and user has passed or completed) */}
              {item.examType && onOpenExam && (
                <div className="px-1.5 pt-0.5">
                  <button
                    type="button"
                    onClick={() => onOpenExam(item.examType)}
                    className={`w-full flex items-center justify-between text-[11px] font-bold px-2.5 py-1.5 rounded-xl border transition-all cursor-pointer ${
                      item.examPassed
                        ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'
                        : item.isCompleted
                        ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30 hover:bg-amber-500/20 animate-pulse'
                        : 'bg-slate-50/80 dark:bg-slate-800/30 text-slate-500 dark:text-slate-400 border-slate-200/50 dark:border-slate-800 hover:text-slate-700 dark:hover:text-slate-200'
                    }`}
                  >
                    <span className="flex items-center gap-1.5">
                      <Trophy className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      <span className="truncate">{item.examTitle}</span>
                    </span>
                    {item.examPassed ? (
                      <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded-md">
                        উত্তীর্ণ ✓
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-400 shrink-0 flex items-center">
                        পরীক্ষা <ChevronRight className="w-3 h-3 ms-0.5" />
                      </span>
                    )}
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Sidebar Footer */}
      <div className="mt-4 pt-3.5 border-t border-slate-100 dark:border-slate-800 text-center">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/50 dark:border-emerald-800/40 text-[11px] font-bold text-emerald-700 dark:text-emerald-300">
          <Sparkles className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
          <span>আধুনিক আরবি টাইপিং সিলেবাস</span>
        </div>
      </div>
    </aside>
  );
};
