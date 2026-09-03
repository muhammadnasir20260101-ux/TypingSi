import React, { useEffect, useState } from 'react';
import {
  Achievement,
  DailyGoalProgress,
  Language,
  LessonProgress,
  StreakData,
  TypingMistake,
  TypingSessionResult,
  UserProfile,
  UserSettings,
} from './types';
import { StorageService } from './services/storageService';
import { Navbar, NavTab } from './components/Navbar';
import { OnboardingModal } from './components/OnboardingModal';
import { DashboardPage } from './pages/DashboardPage';
import { LessonsPage } from './pages/LessonsPage';
import { WorkspacePage } from './pages/WorkspacePage';
import { TestPage } from './pages/TestPage';
import { MistakesPage } from './pages/MistakesPage';
import { AchievementsPage } from './pages/AchievementsPage';
import { StatsPage } from './pages/StatsPage';
import { ProfilePage } from './pages/ProfilePage';
import { SettingsPage } from './pages/SettingsPage';
import { ALL_LESSONS } from './data/courses';
import { getTranslation } from './data/translations';

export default function App() {
  // Application State
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [settings, setSettings] = useState<UserSettings>(() => StorageService.getSettings());
  const [profile, setProfile] = useState<UserProfile>(() => StorageService.getProfile());
  const [currentLessonId, setCurrentLessonId] = useState<string>(() => StorageService.getCurrentLessonId());
  const [lessonProgress, setLessonProgress] = useState<Record<string, LessonProgress>>(() =>
    StorageService.getLessonProgressMap()
  );
  const [sessions, setSessions] = useState<TypingSessionResult[]>(() => StorageService.getSessions());
  const [mistakes, setMistakes] = useState<Record<string, TypingMistake>>(() => StorageService.getMistakesMap());
  const [dailyGoal, setDailyGoal] = useState<DailyGoalProgress>(() => StorageService.getDailyGoalProgress());
  const [streak, setStreak] = useState<StreakData>(() => StorageService.getStreakData());
  const [achievements, setAchievements] = useState<Achievement[]>(() => StorageService.getAchievements());
  const [showOnboarding, setShowOnboarding] = useState<boolean>(() => !StorageService.isOnboardingCompleted());

  const t = (key: string) => getTranslation(settings.language, key);

  // Apply Dark/Light theme class to html root
  useEffect(() => {
    const applyTheme = () => {
      let isDark = false;
      if (settings.theme === 'dark') {
        isDark = true;
      } else if (settings.theme === 'light') {
        isDark = false;
      } else if (settings.theme === 'system') {
        isDark = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      }

      if (isDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    };

    applyTheme();

    if (settings.theme === 'system' && typeof window !== 'undefined' && window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const listener = () => applyTheme();
      mediaQuery.addEventListener('change', listener);
      return () => mediaQuery.removeEventListener('change', listener);
    }
  }, [settings.theme]);

  // Apply RTL/LTR language direction
  useEffect(() => {
    if (settings.language === 'ar') {
      document.documentElement.setAttribute('dir', 'rtl');
      document.documentElement.setAttribute('lang', 'ar');
    } else {
      document.documentElement.setAttribute('dir', 'ltr');
      document.documentElement.setAttribute('lang', settings.language);
    }
  }, [settings.language]);

  // Reload all stored data in memory
  const reloadAllData = () => {
    setSettings(StorageService.getSettings());
    setProfile(StorageService.getProfile());
    setCurrentLessonId(StorageService.getCurrentLessonId());
    setLessonProgress(StorageService.getLessonProgressMap());
    setSessions(StorageService.getSessions());
    setMistakes(StorageService.getMistakesMap());
    setDailyGoal(StorageService.getDailyGoalProgress());
    setStreak(StorageService.getStreakData());
    setAchievements(StorageService.getAchievements());
  };

  const handleUpdateSettings = (newSettings: Partial<UserSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    StorageService.saveSettings(updated);
  };

  const handleStartLesson = (lessonId: string) => {
    setCurrentLessonId(lessonId);
    StorageService.setCurrentLessonId(lessonId);
    setCurrentTab('workspace');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOnboardingComplete = (lang: Language) => {
    StorageService.setOnboardingCompleted(true);
    setShowOnboarding(false);
    handleUpdateSettings({ language: lang });
    // Navigate straight to first lesson for immediate gratification!
    handleStartLesson(ALL_LESSONS[0].id);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-sans transition-colors duration-200 overflow-x-hidden w-full">
      {/* Onboarding Flow for First-time Learners */}
      <OnboardingModal
        isOpen={showOnboarding}
        onComplete={handleOnboardingComplete}
        settings={settings}
      />

      {/* Main Global Navigation */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={(tab) => {
          setCurrentTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
        profile={profile}
        streak={streak}
        dailyGoal={dailyGoal}
      />

      {/* Main Content Workspace Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
        {currentTab === 'dashboard' && (
          <DashboardPage
            settings={settings}
            profile={profile}
            streak={streak}
            dailyGoal={dailyGoal}
            lessonProgress={lessonProgress}
            currentLessonId={currentLessonId}
            mistakes={mistakes}
            onStartLesson={handleStartLesson}
            onGoToTest={() => setCurrentTab('test')}
            onGoToLessons={() => setCurrentTab('lessons')}
            onGoToMistakes={() => setCurrentTab('mistakes')}
            onGoToStats={() => setCurrentTab('stats')}
          />
        )}

        {currentTab === 'lessons' && (
          <LessonsPage
            settings={settings}
            lessonProgress={lessonProgress}
            onStartLesson={handleStartLesson}
          />
        )}

        {currentTab === 'workspace' && (
          <WorkspacePage
            lessonId={currentLessonId}
            settings={settings}
            onUpdateSettings={handleUpdateSettings}
            onSelectLesson={handleStartLesson}
            onGoToDashboard={() => setCurrentTab('dashboard')}
          />
        )}

        {currentTab === 'test' && (
          <TestPage
            settings={settings}
            onGoToDashboard={() => setCurrentTab('dashboard')}
          />
        )}

        {currentTab === 'mistakes' && (
          <MistakesPage
            settings={settings}
            mistakes={mistakes}
            onRefreshMistakes={reloadAllData}
            onGoToDashboard={() => setCurrentTab('dashboard')}
          />
        )}

        {currentTab === 'achievements' && (
          <AchievementsPage
            settings={settings}
            achievements={achievements}
          />
        )}

        {currentTab === 'stats' && (
          <StatsPage
            settings={settings}
            sessions={sessions}
            streak={streak}
            dailyGoal={dailyGoal}
          />
        )}

        {currentTab === 'profile' && (
          <ProfilePage
            profile={profile}
            settings={settings}
            streak={streak}
            dailyGoal={dailyGoal}
            onUpdateProfile={(p) => setProfile(p)}
            onReloadAllData={reloadAllData}
          />
        )}

        {currentTab === 'settings' && (
          <SettingsPage
            settings={settings}
            onUpdateSettings={handleUpdateSettings}
            onResetAllData={reloadAllData}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 dark:border-slate-800/80 bg-white/70 dark:bg-slate-900/60 backdrop-blur-xs py-8 pb-24 md:pb-8 text-xs text-slate-500 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800 dark:text-slate-200 font-['Noto_Naskh_Arabic',sans-serif]">
              {settings.language === 'en'
                ? 'TIBAA — Arabic Touch Typing Learning Platform'
                : settings.language === 'bn'
                ? 'ত্বিবাআ — আরবি টাচ টাইপিং শেখার পূর্ণাঙ্গ প্ল্যাটফর্ম'
                : 'طِبَاعَة — المنصة العربية المتكاملة لتعليم الطباعة السريعة باللمس'}
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 font-bold">
              {settings.language === 'en'
                ? 'Offline Ready ⚡'
                : settings.language === 'bn'
                ? 'অফলাইনে সক্রিয় ⚡'
                : 'يعمل دون إنترنت ⚡'}
            </span>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <span>
              {settings.language === 'en'
                ? 'Arabic 101 Standard Keyboard'
                : settings.language === 'bn'
                ? 'আরবি ১০১ স্ট্যান্ডার্ড কীবোর্ড'
                : 'لوحة المفاتيح العربية 101 القياسية'}
            </span>
            <span>•</span>
            <button
              type="button"
              onClick={() => setCurrentTab('settings')}
              className="hover:text-emerald-600 transition-colors cursor-pointer"
            >
              {t('navSettings')}
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={() => setCurrentTab('test')}
              className="hover:text-emerald-600 transition-colors cursor-pointer"
            >
              {t('navTest')}
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
