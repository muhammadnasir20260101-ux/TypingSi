import React from 'react';
import { Award, CheckCircle2, Lock, Sparkles, Star, Trophy } from 'lucide-react';
import { Achievement, Language, UserSettings } from '../types';
import { getTranslation } from '../data/translations';

interface AchievementsPageProps {
  settings: UserSettings;
  achievements: Achievement[];
}

export const AchievementsPage: React.FC<AchievementsPageProps> = ({
  settings,
  achievements,
}) => {
  const t = (key: string) => getTranslation(settings.language, key);

  const unlockedCount = achievements.filter((a) => a.unlocked).length;
  const totalCount = achievements.length;
  const progressPercent = Math.round((unlockedCount / totalCount) * 100);

  return (
    <div id="achievements-page-view" className="space-y-6 pb-16">
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-slate-900 to-amber-950 text-white rounded-3xl p-6 sm:p-8 shadow-lg border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-3 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold">
            <Trophy className="w-3.5 h-3.5" />
            <span>
              {settings.language === 'en'
                ? 'Trophies & Milestones'
                : settings.language === 'bn'
                ? 'অর্জন ও ট্রফি'
                : 'الأوسمة والبطولات'}
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black font-['Noto_Naskh_Arabic','Alexandria',sans-serif]">
            {t('navAchievements')}
          </h2>

          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
            {settings.language === 'en'
              ? 'Earn badges as you accelerate your typing speed, master difficult rows, and preserve your daily habit.'
              : settings.language === 'bn'
              ? 'টাইপিং গতি বৃদ্ধি, কঠিন সারি আয়ত্তকরণ এবং প্রতিদিনের ধারাবাহিকতায় অর্জন করুন নতুন নতুন ব্যাজ।'
              : 'احصل على الأوسمة التقديرية كلما قفزت سرعتك، وحققت دقة متناهية، وحافظت على شعلة حماسك اليومي.'}
          </p>
        </div>

        {/* Total Progress Radial / Pill Badge */}
        <div className="bg-slate-800/80 border border-slate-700/60 rounded-2xl p-4 sm:p-5 text-center shrink-0 min-w-[160px]">
          <span className="text-xs text-slate-400 font-semibold block mb-1">
            {settings.language === 'en'
              ? 'Completed Badges'
              : settings.language === 'bn'
              ? 'অর্জিত ব্যাজ'
              : 'الأوسمة المكتسبة'}
          </span>
          <div className="text-3xl font-black font-mono text-amber-400">
            {unlockedCount} <span className="text-sm font-normal text-slate-400">/ {totalCount}</span>
          </div>
          <div className="w-full bg-slate-700 h-2 rounded-full overflow-hidden mt-3">
            <div
              className="bg-amber-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">{progressPercent}%</span>
        </div>
      </div>

      {/* Badges Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {achievements.map((item) => {
          const isUnlocked = item.unlocked;
          const currentProg = Math.min(item.maxProgress, item.progress);
          const percent = Math.min(100, Math.round((currentProg / item.maxProgress) * 100));

          return (
            <div
              key={item.id}
              id={`badge-card-${item.id}`}
              className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                isUnlocked
                  ? 'bg-white dark:bg-slate-900 border-amber-300/80 dark:border-amber-700/60 shadow-md shadow-amber-500/5 ring-1 ring-amber-400/20'
                  : 'bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 opacity-80'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-sm ${
                      isUnlocked
                        ? 'bg-gradient-to-tr from-amber-400 to-yellow-300 text-amber-950 ring-2 ring-amber-300'
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-400'
                    }`}
                  >
                    {isUnlocked ? item.icon : <Lock className="w-5 h-5 text-slate-400" />}
                  </div>

                  {isUnlocked ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>
                        {settings.language === 'en'
                          ? 'Unlocked'
                          : settings.language === 'bn'
                          ? 'অর্জিত'
                          : 'مكتسب'}
                      </span>
                    </span>
                  ) : (
                    <span className="text-[10px] font-mono text-slate-400 font-bold">
                      {currentProg}/{item.maxProgress}
                    </span>
                  )}
                </div>

                <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 font-['Noto_Naskh_Arabic',sans-serif]">
                  {settings.language === 'en'
                    ? item.titleEn
                    : settings.language === 'bn'
                    ? item.titleBn
                    : item.titleAr}
                </h3>

                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                  {settings.language === 'en'
                    ? item.descriptionEn
                    : settings.language === 'bn'
                    ? item.descriptionBn
                    : item.descriptionAr}
                </p>
              </div>

              {/* Progress bar */}
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      isUnlocked ? 'bg-amber-400' : 'bg-slate-400'
                    }`}
                    style={{ width: `${percent}%` }}
                  />
                </div>
                {item.unlockedDate && (
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    {settings.language === 'en'
                      ? `Unlocked on: ${item.unlockedDate}`
                      : settings.language === 'bn'
                      ? `অর্জনের তারিখ: ${item.unlockedDate}`
                      : `تاريخ الفوز: ${item.unlockedDate}`}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
