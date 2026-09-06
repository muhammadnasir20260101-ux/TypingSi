import React, { useState } from 'react';
import { Sparkles, Trophy, Info, ChevronRight, CheckCircle2 } from 'lucide-react';
import { Language } from '../types';
import { StorageService } from '../services/storageService';

interface LearningTreeCardProps {
  lang: Language;
  onContinueLearning?: () => void;
}

const TREE_STAGES_INFO = [
  {
    stage: 1,
    minPercent: 0,
    maxPercent: 14,
    titleAr: 'برعم صغير (Seedling)',
    titleEn: 'Seedling',
    titleBn: 'চারাগাছ (প্রারম্ভিক পর্যায়)',
    descAr: 'بذرة المعرفة تغرس في الأرض مع أولى خطواتك في مفاتيح الارتكاز.',
    descEn: 'The seed of Arabic touch typing is planted on your foundation keys.',
    descBn: 'ভিত্তি কী-এর সূচনার মাধ্যমে আপনার টাইপিং বৃক্ষের বীজ রোপিত হলো।',
    fruits: 0,
    badgeColor: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
  },
  {
    stage: 2,
    minPercent: 15,
    maxPercent: 29,
    titleAr: 'نبتة خضراء فتية (Young Sprout)',
    titleEn: 'Young Sprout',
    titleBn: 'কচি চারাগাছ (হোম রো বিস্তার)',
    descAr: 'تنمو وريقات خضراء يانعة مع إتقانك لحروف صف الارتكاز.',
    descEn: 'Fresh green leaves flourish as you master the central home row.',
    descBn: 'হোম রো আয়ত্ত করার সাথে সাথে সবুজ পাতার বিস্তার ঘটছে।',
    fruits: 0,
    badgeColor: 'bg-lime-100 text-lime-800 dark:bg-lime-900/30 dark:text-lime-300',
  },
  {
    stage: 3,
    minPercent: 30,
    maxPercent: 44,
    titleAr: 'شجرة نامية قوية (Sturdy Tree)',
    titleEn: 'Sturdy Tree',
    titleBn: 'বর্ধনশীল কাণ্ড (টপ রো সম্প্রসারণ)',
    descAr: 'جذع راسخ وأغصان متفرعة مع صعود أصابعك للصف العلوي بثقة.',
    descEn: 'A firm trunk and branches emerge as you conquer top row reaches.',
    descBn: 'উপরের সারির নিয়ন্ত্রণে বৃক্ষের কাণ্ড দৃঢ় ও শক্তিশালী হচ্ছে।',
    fruits: 1,
    badgeColor: 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300',
  },
  {
    stage: 4,
    minPercent: 45,
    maxPercent: 59,
    titleAr: 'شجرة وارفة الظلال (Lush Canopy)',
    titleEn: 'Lush Canopy',
    titleBn: 'ঘন পাতার বৃক্ষ (নিচের সারি ও শিফট)',
    descAr: 'أوراق كثيفة وظلال وافرة تثبت رسوخ الذاكرة العضلية لأصابعك.',
    descEn: 'Dense canopy of green leaves reflecting solid muscle memory across all rows.',
    descBn: 'সমস্ত সারিতে আঙুলের মসৃণ দক্ষতায় গাছটি সুশোভিত হয়ে উঠেছে।',
    fruits: 2,
    badgeColor: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
  },
  {
    stage: 5,
    minPercent: 60,
    maxPercent: 74,
    titleAr: 'شجرة مزهرة باسقة (Blossoming Tree)',
    titleEn: 'Blossoming Tree',
    titleBn: 'পুষ্পিত মহীরুহ (হরকত ও বিরামচিহ্ন)',
    descAr: 'أزهار براقة تتفتح ترمز لإتقان الحركات وعلامات الترقيم الدقيقة.',
    descEn: 'Fragrant blossoms bloom as you master delicate diacritics and punctuation.',
    descBn: 'হরকত ও যতিচিহ্নের পূর্ণাঙ্গ দক্ষতায় গাছে ফুল ফুটেছে।',
    fruits: 3,
    badgeColor: 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300',
  },
  {
    stage: 6,
    minPercent: 75,
    maxPercent: 89,
    titleAr: 'شجرة مثمرة يانعة (Fruit-Bearing Tree)',
    titleEn: 'Fruit-Bearing Tree',
    titleBn: 'ফলবান মহীরুহ (শব্দ ও বাক্য প্রবাহ)',
    descAr: 'ثمار حمراء ناضجة تجنيها مع تدفق الكلمات والجمل بفصاحة وانسيابية.',
    descEn: 'Delicious ripe fruit appears as your typing flows effortlessly in full sentences.',
    descBn: 'অর্থপূর্ণ পূর্ণাঙ্গ বাক্য টাইপিংয়ের মাধ্যমে সুমিষ্ট ফল দেখা দিয়েছে।',
    fruits: 5,
    badgeColor: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
  },
  {
    stage: 7,
    minPercent: 90,
    maxPercent: 100,
    titleAr: 'الشجرة الذهبية الكبرى (Master Orchard)',
    titleEn: 'Master Golden Orchard',
    titleBn: 'সোনার ফলবান মহাবৃক্ষ (মাস্টার গ্র্যাজুয়েশন)',
    descAr: 'إنجاز أسطوري مكتمل بسبع ثمار ذهبية، يجسد احترافك للطباعة العربية بامتياز.',
    descEn: 'A magnificent harvest of 7 golden fruits honoring your complete Arabic mastery.',
    descBn: '৭টি সোনালী ফল সহ পূর্ণাঙ্গ আরবি টাইপিং দক্ষতার সর্বোচ্চ স্বীকৃতি।',
    fruits: 7,
    badgeColor: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
  },
];

export const LearningTreeCard: React.FC<LearningTreeCardProps> = ({ lang, onContinueLearning }) => {
  const [showModal, setShowModal] = useState(false);
  const treeStats = StorageService.getLearningTreeStats(31, 372);
  const currentStageInfo = TREE_STAGES_INFO[treeStats.stage - 1] || TREE_STAGES_INFO[0];

  const getStageTitle = () => {
    if (lang === 'ar') return currentStageInfo.titleAr;
    if (lang === 'bn') return currentStageInfo.titleBn;
    return currentStageInfo.titleEn;
  };

  const getStageDesc = () => {
    if (lang === 'ar') return currentStageInfo.descAr;
    if (lang === 'bn') return currentStageInfo.descBn;
    return currentStageInfo.descEn;
  };

  // Next fruit milestone
  const fruits = treeStats.fruitsCount;
  const nextTargetPercent = currentStageInfo.maxPercent < 100 ? currentStageInfo.maxPercent + 1 : 100;
  const percentToNext = Math.max(0, nextTargetPercent - treeStats.overallPercent);

  return (
    <div
      id="learning-tree-card"
      className="relative overflow-hidden rounded-2xl bg-linear-to-br from-emerald-950 via-slate-900 to-slate-950 border border-emerald-800/40 text-white p-5 sm:p-6 shadow-xl"
    >
      {/* Decorative ambient backdrop */}
      <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
        {/* Visual SVG Tree Stage Graphic */}
        <div className="relative flex-shrink-0 w-44 h-44 sm:w-48 sm:h-48 flex items-center justify-center bg-slate-900/80 rounded-2xl border border-emerald-700/30 p-2 shadow-inner">
          <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-md" aria-label="Learning Tree Visual">
            {/* Ground / Soil Mound */}
            <ellipse cx="100" cy="175" rx="75" ry="16" fill="#14532d" opacity="0.6" />
            <ellipse cx="100" cy="172" rx="65" ry="12" fill="#166534" opacity="0.8" />
            <ellipse cx="100" cy="168" rx="45" ry="8" fill="#15803d" />

            {/* STAGE 1: Seedling */}
            {treeStats.stage === 1 && (
              <g id="tree-stage-1" className="animate-pulse">
                <path d="M100 168 Q98 145 92 135" stroke="#854d0e" strokeWidth="4" fill="none" strokeLinecap="round" />
                <path d="M92 135 Q78 120 72 132 Q78 142 92 135 Z" fill="#22c55e" />
                <path d="M93 135 Q106 122 114 133 Q106 142 93 135 Z" fill="#4ade80" />
                <circle cx="100" cy="170" r="4" fill="#a16207" />
              </g>
            )}

            {/* STAGE 2: Young Sprout */}
            {treeStats.stage === 2 && (
              <g id="tree-stage-2">
                <path d="M100 168 Q100 135 96 110" stroke="#78350f" strokeWidth="6" fill="none" strokeLinecap="round" />
                {/* Branches & Leaves */}
                <path d="M98 135 Q80 125 70 120 Q65 110 75 105 Q90 115 97 130 Z" fill="#22c55e" />
                <path d="M98 125 Q115 112 125 110 Q130 100 120 95 Q105 105 97 120 Z" fill="#16a34a" />
                <path d="M96 110 Q96 85 96 75 Q106 82 108 95 Q96 100 96 110 Z" fill="#4ade80" />
              </g>
            )}

            {/* STAGE 3: Sturdy Tree */}
            {treeStats.stage === 3 && (
              <g id="tree-stage-3">
                {/* Trunk */}
                <path d="M95 168 Q97 135 94 95 Q104 135 106 168 Z" fill="#78350f" />
                {/* Foliage Clusters */}
                <circle cx="95" cy="85" r="30" fill="#15803d" />
                <circle cx="75" cy="95" r="24" fill="#16a34a" />
                <circle cx="118" cy="95" r="24" fill="#22c55e" />
                <circle cx="96" cy="65" r="22" fill="#4ade80" />
                {/* 1 initial fruit */}
                <circle cx="95" cy="80" r="5" fill="#ef4444" />
              </g>
            )}

            {/* STAGE 4: Lush Broad Canopy */}
            {treeStats.stage === 4 && (
              <g id="tree-stage-4">
                <path d="M92 168 Q95 130 92 88 Q106 130 110 168 Z" fill="#78350f" />
                <circle cx="98" cy="82" r="36" fill="#14532d" />
                <circle cx="70" cy="90" r="28" fill="#15803d" />
                <circle cx="125" cy="90" r="28" fill="#16a34a" />
                <circle cx="98" cy="58" r="26" fill="#22c55e" />
                <circle cx="80" cy="70" r="22" fill="#4ade80" opacity="0.9" />
                {/* 2 fruits */}
                <circle cx="78" cy="85" r="5.5" fill="#ef4444" />
                <circle cx="118" cy="85" r="5.5" fill="#ef4444" />
              </g>
            )}

            {/* STAGE 5: Blooming Tree with Flowers */}
            {treeStats.stage === 5 && (
              <g id="tree-stage-5">
                <path d="M91 168 Q95 125 91 80 Q107 125 111 168 Z" fill="#78350f" />
                <circle cx="98" cy="80" r="42" fill="#15803d" />
                <circle cx="65" cy="88" r="32" fill="#16a34a" />
                <circle cx="132" cy="88" r="32" fill="#22c55e" />
                <circle cx="98" cy="52" r="30" fill="#4ade80" />
                {/* Floral Blossoms */}
                <circle cx="82" cy="65" r="4" fill="#f472b6" />
                <circle cx="114" cy="65" r="4" fill="#f472b6" />
                <circle cx="70" cy="90" r="4" fill="#fb7185" />
                <circle cx="125" cy="90" r="4" fill="#fb7185" />
                {/* 3 fruits */}
                <circle cx="96" cy="82" r="6" fill="#ef4444" />
                <circle cx="80" cy="85" r="5.5" fill="#ef4444" />
                <circle cx="115" cy="85" r="5.5" fill="#ef4444" />
              </g>
            )}

            {/* STAGE 6: Rich Fruit-Bearing Tree */}
            {treeStats.stage === 6 && (
              <g id="tree-stage-6">
                <path d="M90 168 Q95 120 90 75 Q108 120 113 168 Z" fill="#78350f" />
                <circle cx="98" cy="78" r="46" fill="#14532d" />
                <circle cx="62" cy="85" r="36" fill="#15803d" />
                <circle cx="136" cy="85" r="36" fill="#16a34a" />
                <circle cx="98" cy="48" r="34" fill="#22c55e" />
                <circle cx="75" cy="62" r="28" fill="#4ade80" />
                <circle cx="122" cy="62" r="28" fill="#4ade80" />
                {/* 5 Ripe Fruits */}
                <circle cx="98" cy="65" r="6.5" fill="#ef4444" />
                <circle cx="72" cy="78" r="6" fill="#ef4444" />
                <circle cx="125" cy="78" r="6" fill="#ef4444" />
                <circle cx="85" cy="98" r="6" fill="#dc2626" />
                <circle cx="112" cy="98" r="6" fill="#dc2626" />
              </g>
            )}

            {/* STAGE 7: Master Golden Orchard Tree */}
            {treeStats.stage === 7 && (
              <g id="tree-stage-7">
                {/* Golden aura shimmer */}
                <circle cx="98" cy="75" r="55" fill="#facc15" opacity="0.15" className="animate-ping" />
                <path d="M88 168 Q95 115 88 70 Q110 115 115 168 Z" fill="#78350f" />
                <circle cx="98" cy="74" r="48" fill="#14532d" />
                <circle cx="58" cy="80" r="38" fill="#15803d" />
                <circle cx="140" cy="80" r="38" fill="#16a34a" />
                <circle cx="98" cy="42" r="36" fill="#22c55e" />
                <circle cx="70" cy="56" r="30" fill="#4ade80" />
                <circle cx="128" cy="56" r="30" fill="#4ade80" />
                {/* 7 Golden/Ruby Master Fruits */}
                <circle cx="98" cy="55" r="7" fill="#fbbf24" stroke="#f59e0b" strokeWidth="1" />
                <circle cx="70" cy="72" r="6.5" fill="#fbbf24" stroke="#f59e0b" strokeWidth="1" />
                <circle cx="126" cy="72" r="6.5" fill="#fbbf24" stroke="#f59e0b" strokeWidth="1" />
                <circle cx="82" cy="92" r="6.5" fill="#ef4444" />
                <circle cx="114" cy="92" r="6.5" fill="#ef4444" />
                <circle cx="56" cy="92" r="6" fill="#fbbf24" stroke="#f59e0b" strokeWidth="1" />
                <circle cx="140" cy="92" r="6" fill="#fbbf24" stroke="#f59e0b" strokeWidth="1" />
              </g>
            )}
          </svg>

          {/* Fruit Count Pill Badge */}
          <div className="absolute bottom-2 left-2 bg-slate-950/80 backdrop-blur-xs border border-emerald-500/40 text-amber-300 px-2 py-0.5 rounded-full text-xs font-bold flex items-center gap-1 shadow">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>
              {fruits} / 7
            </span>
          </div>

          {/* Growth Stage Number */}
          <div className="absolute top-2 right-2 bg-emerald-600/90 text-white font-mono text-[11px] px-2 py-0.5 rounded-full shadow">
            {lang === 'ar' ? `المرحلة ${treeStats.stage}` : lang === 'bn' ? `পর্যায় ${treeStats.stage}` : `Stage ${treeStats.stage}`}
          </div>
        </div>

        {/* Tree Info & Progress Bars */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <Sparkles className="w-4 h-4" />
              </span>
              <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                {lang === 'ar' ? 'شجرة التعلم الخاصة بي' : lang === 'bn' ? 'আমার শেখার গাছ' : 'My Learning Tree'}
              </h3>
            </div>

            <button
              type="button"
              onClick={() => setShowModal(true)}
              className="inline-flex items-center gap-1 text-xs text-emerald-300 hover:text-white bg-emerald-950/60 hover:bg-emerald-900/60 border border-emerald-700/50 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
            >
              <Info className="w-3.5 h-3.5" />
              <span>{lang === 'ar' ? 'كيف تنمو الشجرة؟' : lang === 'bn' ? 'গাছটি কীভাবে বাড়ে?' : 'How tree grows'}</span>
            </button>
          </div>

          {/* Current Stage Title & Description */}
          <div className="mb-4">
            <div className="text-emerald-400 font-semibold text-sm sm:text-base flex items-center gap-2">
              <span>{getStageTitle()}</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 line-clamp-2">{getStageDesc()}</p>
          </div>

          {/* Growth Progress Bar */}
          <div className="space-y-1.5 mb-4">
            <div className="flex justify-between text-xs text-slate-300">
              <span className="font-medium">
                {lang === 'ar' ? 'نسبة نمو الشجرة:' : lang === 'bn' ? 'গাছের বৃদ্ধির মাত্রা:' : 'Tree Growth Progress:'}
              </span>
              <span className="font-mono font-bold text-emerald-400">{treeStats.overallPercent}%</span>
            </div>
            <div className="w-full bg-slate-800/90 rounded-full h-3 overflow-hidden border border-slate-700/60 p-0.5">
              <div
                className="bg-linear-to-r from-emerald-500 via-teal-400 to-lime-400 h-full rounded-full transition-all duration-700 shadow-sm"
                style={{ width: `${Math.max(3, treeStats.overallPercent)}%` }}
              />
            </div>
          </div>

          {/* Key Metrics: Completed Pages & Lessons */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
            <div className="bg-slate-900/80 rounded-xl p-2 border border-slate-800">
              <span className="text-slate-400 block text-[11px]">
                {lang === 'ar' ? 'الصفحات المكتملة' : lang === 'bn' ? 'সম্পূর্ণ পৃষ্ঠা' : 'Completed Pages'}
              </span>
              <span className="font-mono font-bold text-white text-sm">
                {treeStats.completedPages}{' '}
                <span className="text-slate-500 font-normal">/ {treeStats.totalPages}</span>
              </span>
            </div>

            <div className="bg-slate-900/80 rounded-xl p-2 border border-slate-800">
              <span className="text-slate-400 block text-[11px]">
                {lang === 'ar' ? 'الدروس المتقنة' : lang === 'bn' ? 'সম্পূর্ণ পাঠ' : 'Mastered Lessons'}
              </span>
              <span className="font-mono font-bold text-white text-sm">
                {treeStats.completedLessons}{' '}
                <span className="text-slate-500 font-normal">/ {treeStats.totalLessons}</span>
              </span>
            </div>

            <div className="bg-slate-900/80 rounded-xl p-2 border border-slate-800 col-span-2 sm:col-span-1 flex items-center justify-between sm:flex-col sm:items-start">
              <span className="text-slate-400 block text-[11px]">
                {lang === 'ar' ? 'الثمار المكتسبة' : lang === 'bn' ? 'অর্জিত ফল' : 'Harvested Fruits'}
              </span>
              <span className="font-mono font-bold text-amber-300 text-sm inline-flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>{treeStats.fruitsCount} / 7</span>
              </span>
            </div>
          </div>

          {/* Action to continue learning */}
          {onContinueLearning && (
            <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
              <span className="text-xs text-slate-400">
                {percentToNext > 0
                  ? lang === 'ar'
                    ? `أكمل ${percentToNext}% إضافية للوصول إلى المرحلة التالية`
                    : lang === 'bn'
                    ? `পরবর্তী ধাপে পৌঁছাতে আরও ${percentToNext}% সম্পূর্ণ করুন`
                    : `Complete ${percentToNext}% more to reach the next stage`
                  : lang === 'ar'
                  ? 'وصلت إلى قمة شجرة التعلم المكتملة!'
                  : lang === 'bn'
                  ? 'আপনি শেখার গাছের সর্বোচ্চ শিখরে পৌঁছেছেন!'
                  : 'You have reached the maximum growth stage!'}
              </span>

              <button
                type="button"
                onClick={onContinueLearning}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs transition-colors shadow-sm cursor-pointer"
              >
                <span>{lang === 'ar' ? 'واصل التعلم' : lang === 'bn' ? 'শেখা চালিয়ে যান' : 'Continue Learning'}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Interactive Modal Explaining Tree Stages */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 text-white shadow-2xl overflow-y-auto max-h-[85vh]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-400" />
                <h4 className="font-bold text-base">
                  {lang === 'ar' ? 'مراحل نمو شجرة التعلم' : lang === 'bn' ? 'শেখার গাছের বৃদ্ধির স্তরসমূহ' : 'Learning Tree Growth Stages'}
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-300 mb-4">
              {lang === 'ar'
                ? 'تنمو شجرتك تدريجياً بناءً على إنجازك الفعلي في الدروس والصفحات. كل صفحة تكملها بنجاح تسقي الشجرة، وكل مستوى تتقنه يثمر ثماراً جديدة!'
                : lang === 'bn'
                ? 'প্রতিটি পাঠ ও পৃষ্ঠা সফলভাবে শেষ করার সাথে সাথে আপনার গাছটি বড় হয় এবং নতুন ফল উৎপাদন করে!'
                : 'Your learning tree grows based on actual completed lessons and pages. Every completed page nourishes the tree, unlocking new fruits and branches!'}
            </p>

            <div className="space-y-3">
              {TREE_STAGES_INFO.map((item) => {
                const isCurrent = item.stage === treeStats.stage;
                const isPassed = item.stage < treeStats.stage;

                return (
                  <div
                    key={item.stage}
                    className={`p-3 rounded-xl border transition-all ${
                      isCurrent
                        ? 'bg-emerald-950/60 border-emerald-500 shadow-sm'
                        : isPassed
                        ? 'bg-slate-800/40 border-slate-700/60 opacity-85'
                        : 'bg-slate-900/40 border-slate-800 opacity-60'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        {isPassed ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        ) : isCurrent ? (
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                        ) : (
                          <span className="w-2.5 h-2.5 rounded-full bg-slate-600" />
                        )}
                        <span className="font-bold text-sm text-white">
                          {lang === 'ar'
                            ? `المرحلة ${item.stage}: ${item.titleAr}`
                            : lang === 'bn'
                            ? `স্তর ${item.stage}: ${item.titleBn}`
                            : `Stage ${item.stage}: ${item.titleEn}`}
                        </span>
                      </div>
                      <span className="text-xs font-mono text-emerald-400">{item.minPercent}% - {item.maxPercent}%</span>
                    </div>

                    <p className="text-xs text-slate-300 pr-5">
                      {lang === 'ar' ? item.descAr : lang === 'bn' ? item.descBn : item.descEn}
                    </p>

                    {item.fruits > 0 && (
                      <div className="mt-1.5 text-xs text-amber-300 flex items-center gap-1 font-semibold">
                        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                        <span>{item.fruits} {lang === 'ar' ? 'ثمار' : lang === 'bn' ? 'টি ফল' : 'fruits'}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="mt-5 pt-3 border-t border-slate-800 flex justify-end">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors cursor-pointer"
              >
                {lang === 'ar' ? 'فهمت، شكراً' : lang === 'bn' ? 'বুঝেছি, ধন্যবাদ' : 'Got it, thanks'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
