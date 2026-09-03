import React from 'react';
import {
  AlertTriangle,
  BarChart3,
  Calendar,
  CheckCircle2,
  Clock,
  Flame,
  LineChart,
  RotateCcw,
  Target,
  TrendingUp,
  Zap,
} from 'lucide-react';
import { AccuracyBarChart, WpmHistoryChart } from '../components/VisualCharts';
import { DailyGoalProgress, Language, StreakData, TypingSessionResult, UserSettings } from '../types';
import { getTranslation } from '../data/translations';

interface StatsPageProps {
  settings: UserSettings;
  sessions: TypingSessionResult[];
  streak: StreakData;
  dailyGoal: DailyGoalProgress;
}

export const StatsPage: React.FC<StatsPageProps> = ({
  settings,
  sessions,
  streak,
  dailyGoal,
}) => {
  const t = (key: string) => getTranslation(settings.language, key);

  // Compute metrics
  const totalSessions = sessions.length;
  const wpms = sessions.map((s) => s.wpm);
  const bestWpm = wpms.length > 0 ? Math.max(...wpms) : 0;
  const avgWpm = wpms.length > 0 ? Math.round(wpms.reduce((a, b) => a + b, 0) / wpms.length) : 0;

  const accuracies = sessions.map((s) => s.accuracy);
  const avgAccuracy =
    accuracies.length > 0 ? Math.round(accuracies.reduce((a, b) => a + b, 0) / accuracies.length) : 100;

  const totalTimeSec = sessions.reduce((a, b) => a + b.durationSeconds, 0);
  const totalMinutes = Math.round(totalTimeSec / 60);

  const totalErrors = sessions.reduce((a, b) => a + b.mistakeCount, 0);

  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      const locale = settings.language === 'bn' ? 'bn-BD' : settings.language === 'en' ? 'en-US' : 'ar-EG';
      return d.toLocaleDateString(locale, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch {
      return isoString;
    }
  };

  const getSubHeader = () => {
    if (settings.language === 'en') {
      return 'Detailed breakdown of your speed growth, keystroke accuracy consistency, and daily habits.';
    }
    if (settings.language === 'bn') {
      return 'আপনার গতি বৃদ্ধি, নির্ভুলতার ধারাবাহিকতা এবং দৈনিক অনুশীলনের সামগ্রিক বিশ্লেষণ।';
    }
    return 'رصد بياني دقيق لمنحنى نمو سرعتك وثبات دقتك ومسار جلساتك التدريبية اليومية.';
  };

  const getAnalyticsBadge = () => {
    if (settings.language === 'en') return 'Performance Analytics';
    if (settings.language === 'bn') return 'পারফরম্যান্স অ্যানালিটিক্স';
    return 'تحليلات الأداء الشاملة';
  };

  return (
    <div id="statistics-page-view" className="space-y-6 pb-16">
      {/* Header */}
      <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 shadow-lg border border-slate-800">
        <div className="max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-bold">
            <BarChart3 className="w-3.5 h-3.5" />
            <span>{getAnalyticsBadge()}</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black font-['Noto_Naskh_Arabic','Alexandria',sans-serif]">
            {t('navStats')}
          </h2>

          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
            {getSubHeader()}
          </p>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        {/* Best WPM */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
          <span className="text-xs text-slate-500 flex items-center gap-1">
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            {t('bestWpm')}
          </span>
          <div className="text-3xl font-black text-slate-900 dark:text-slate-100 font-mono mt-1">
            {bestWpm} <span className="text-xs font-normal text-slate-400">WPM</span>
          </div>
          <span className="text-[11px] text-slate-400">
            {settings.language === 'en' ? 'Highest recorded speed' : settings.language === 'bn' ? 'সর্বোচ্চ রেকর্ডকৃত গতি' : 'أعلى سرعة مسجلة'}
          </span>
        </div>

        {/* Average WPM */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
          <span className="text-xs text-slate-500 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
            {t('avgWpm')}
          </span>
          <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400 font-mono mt-1">
            {avgWpm} <span className="text-xs font-normal text-slate-400">WPM</span>
          </div>
          <span className="text-[11px] text-slate-400">
            {settings.language === 'en' ? 'Across all sessions' : settings.language === 'bn' ? 'সকল সেশন মিলিয়ে' : 'عبر جميع الجلسات'}
          </span>
        </div>

        {/* Avg Accuracy */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
          <span className="text-xs text-slate-500 flex items-center gap-1">
            <Target className="w-3.5 h-3.5 text-blue-500" />
            {t('avgAccuracy')}
          </span>
          <div className="text-3xl font-black text-blue-600 dark:text-blue-400 font-mono mt-1">
            {avgAccuracy}%
          </div>
          <span className="text-[11px] text-slate-400">
            {settings.language === 'en' ? 'Overall accuracy rate' : settings.language === 'bn' ? 'সামগ্রিক নির্ভুলতার হার' : 'معدل الإتقان الإجمالي'}
          </span>
        </div>

        {/* Streak */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
          <span className="text-xs text-slate-500 flex items-center gap-1">
            <Flame className="w-3.5 h-3.5 text-rose-500" />
            {t('currentStreak')}
          </span>
          <div className="text-3xl font-black text-rose-500 font-mono mt-1">
            {streak.currentStreak} <span className="text-xs font-normal text-slate-400">{t('days')}</span>
          </div>
          <span className="text-[11px] text-slate-400">
            {t('streakRecord')}: {streak.longestStreak} {t('days')}
          </span>
        </div>
      </div>

      {/* Visual Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Speed Progression Line Chart */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Zap className="w-4 h-4 text-emerald-500" />
              <span>{t('wpmOverTime')}</span>
            </h3>
            <span className="text-xs text-slate-400 font-mono">
              {settings.language === 'en' ? 'Last 15 sessions' : settings.language === 'bn' ? 'বিগত ১৫টি সেশন' : 'آخر 15 جلسة'}
            </span>
          </div>
          <WpmHistoryChart sessions={sessions} lang={settings.language} />
        </div>

        {/* Accuracy Bar Chart */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Target className="w-4 h-4 text-blue-500" />
              <span>{t('accuracyOverTime')}</span>
            </h3>
            <span className="text-xs text-slate-400 font-mono">
              {settings.language === 'en' ? 'Last 10 sessions' : settings.language === 'bn' ? 'বিগত ১০টি সেশন' : 'آخر 10 جلسات'}
            </span>
          </div>
          <AccuracyBarChart sessions={sessions} lang={settings.language} />
        </div>
      </div>

      {/* Recent Sessions Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
            {t('recentActivity')} ({sessions.length})
          </h3>
        </div>

        {sessions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-start text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-semibold">
                  <th className="py-2.5 px-3">{t('date')}</th>
                  <th className="py-2.5 px-3">{t('lessonOrTest')}</th>
                  <th className="py-2.5 px-3">{t('wpm')}</th>
                  <th className="py-2.5 px-3">{t('accuracy')}</th>
                  <th className="py-2.5 px-3">{t('duration')}</th>
                  <th className="py-2.5 px-3">{t('errors')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {sessions.slice(0, 15).map((sess) => (
                  <tr key={sess.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-3 text-slate-500">{formatDate(sess.date)}</td>
                    <td className="py-3 px-3 font-semibold text-slate-800 dark:text-slate-200">{sess.title}</td>
                    <td className="py-3 px-3 font-bold font-mono text-emerald-600 dark:text-emerald-400">{sess.wpm}</td>
                    <td className="py-3 px-3 font-bold font-mono text-blue-600 dark:text-blue-400">{sess.accuracy}%</td>
                    <td className="py-3 px-3 text-slate-500 font-mono">
                      {sess.durationSeconds}{settings.language === 'en' ? 's' : settings.language === 'bn' ? 'সে.' : 'ث'}
                    </td>
                    <td className="py-3 px-3 text-rose-500 font-mono font-bold">{sess.mistakeCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-10 text-center text-xs text-slate-400">
            {t('noActivityYet')}
          </div>
        )}
      </div>
    </div>
  );
};
