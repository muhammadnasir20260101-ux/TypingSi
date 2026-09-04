import React, { useEffect, useRef, useState } from 'react';
import {
  AlertTriangle,
  Award,
  BarChart3,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  Flame,
  Globe,
  Home,
  Keyboard,
  Menu,
  Moon,
  Settings as SettingsIcon,
  Sun,
  Timer,
  User,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react';
import { DailyGoalProgress, Language, StreakData, ThemeMode, UserProfile, UserSettings } from '../types';
import { getTranslation } from '../data/translations';

export type NavTab = 
  | 'dashboard' 
  | 'lessons' 
  | 'workspace' 
  | 'test' 
  | 'mistakes' 
  | 'achievements' 
  | 'stats' 
  | 'profile' 
  | 'settings';

interface NavbarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  settings: UserSettings;
  onUpdateSettings: (newSettings: Partial<UserSettings>) => void;
  profile: UserProfile;
  streak: StreakData;
  dailyGoal: DailyGoalProgress;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  settings,
  onUpdateSettings,
  profile,
  streak,
  dailyGoal,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);
  const [isMoreDropdownOpen, setIsMoreDropdownOpen] = useState(false);

  const t = (key: string) => getTranslation(settings.language, key);

  const getShortLabel = (id: NavTab): string => {
    if (settings.language === 'bn') {
      switch (id) {
        case 'dashboard': return 'হোম';
        case 'lessons': return 'পাঠসমূহ';
        case 'workspace': return 'অনুশীলন';
        case 'test': return 'পরীক্ষা';
        case 'mistakes': return 'ভুলসমূহ';
        case 'achievements': return 'অর্জন';
        case 'stats': return 'পরিসংখ্যান';
        case 'settings': return 'সেটিংস';
        default: return '';
      }
    }
    if (settings.language === 'ar') {
      switch (id) {
        case 'dashboard': return 'الرئيسية';
        case 'lessons': return 'الدروس';
        case 'workspace': return 'التدريب';
        case 'test': return 'الاختبار';
        case 'mistakes': return 'الأخطاء';
        case 'achievements': return 'الإنجازات';
        case 'stats': return 'الإحصائيات';
        case 'settings': return 'الإعدادات';
        default: return '';
      }
    }
    switch (id) {
      case 'dashboard': return 'Home';
      case 'lessons': return 'Lessons';
      case 'workspace': return 'Practice';
      case 'test': return 'Test';
      case 'mistakes': return 'Mistakes';
      case 'achievements': return 'Badges';
      case 'stats': return 'Stats';
      case 'settings': return 'Settings';
      default: return '';
    }
  };

  const navItems: { id: NavTab; label: string; shortLabel: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: t('navHome'), shortLabel: getShortLabel('dashboard'), icon: <Home className="w-4 h-4" /> },
    { id: 'lessons', label: t('navLessons'), shortLabel: getShortLabel('lessons'), icon: <BookOpen className="w-4 h-4" /> },
    { id: 'workspace', label: t('navPractice'), shortLabel: getShortLabel('workspace'), icon: <Keyboard className="w-4 h-4" /> },
    { id: 'test', label: t('navTest'), shortLabel: getShortLabel('test'), icon: <Timer className="w-4 h-4" /> },
    { id: 'mistakes', label: t('navMistakes'), shortLabel: getShortLabel('mistakes'), icon: <AlertTriangle className="w-4 h-4" /> },
    { id: 'achievements', label: t('navAchievements'), shortLabel: getShortLabel('achievements'), icon: <Award className="w-4 h-4" /> },
    { id: 'stats', label: t('navStats'), shortLabel: getShortLabel('stats'), icon: <BarChart3 className="w-4 h-4" /> },
  ];

  const primaryNavItems = navItems.slice(0, 4); // Dashboard, Lessons, Workspace, Test
  const secondaryNavItems = navItems.slice(4); // Mistakes, Achievements, Stats
  const isSecondaryActive = secondaryNavItems.some((item) => item.id === currentTab) || currentTab === 'settings';

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('#lang-dropdown-btn') && !target.closest('#lang-dropdown-menu')) {
        setIsLangDropdownOpen(false);
      }
      if (!target.closest('#more-dropdown-btn') && !target.closest('#more-dropdown-menu')) {
        setIsMoreDropdownOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const toggleSound = () => {
    onUpdateSettings({ soundEnabled: !settings.soundEnabled });
  };

  const toggleTheme = () => {
    const nextTheme: ThemeMode = settings.theme === 'dark' ? 'light' : 'dark';
    onUpdateSettings({ theme: nextTheme });
  };

  const handleLangChange = (lang: Language) => {
    onUpdateSettings({ language: lang });
    setIsLangDropdownOpen(false);
  };

  const moreLabel = settings.language === 'bn' ? 'আরও' : settings.language === 'ar' ? 'المزيد' : 'More';

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors w-full">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-1.5 sm:gap-2 w-full">
          {/* Brand Logo & Title */}
          <div
            onClick={() => onSelectTab('dashboard')}
            className="flex items-center gap-2 cursor-pointer select-none group shrink-0"
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform shrink-0">
              <Keyboard className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="shrink-0">
              <h1 className="text-base sm:text-lg font-black tracking-tight text-slate-900 dark:text-white leading-tight">
                Typing Sikhi
              </h1>
              <span className="text-[10px] block font-semibold text-emerald-600 dark:text-emerald-400 leading-tight">
                {settings.language === 'en' ? 'Arabic Typing Platform' : settings.language === 'bn' ? 'আরবি টাইপিং প্ল্যাটফর্ম' : 'طِبَاعَة — تعلم الطباعة'}
              </span>
            </div>
          </div>

          {/* Desktop Navigation Links with Responsive Overflow Protection */}
          <nav className="hidden md:flex items-center gap-1 min-w-0">
            {/* Core Nav Items */}
            {primaryNavItems.map((item) => {
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-link-${item.id}`}
                  onClick={() => onSelectTab(item.id)}
                  className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                    isActive
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {item.icon}
                  <span>{item.shortLabel}</span>
                </button>
              );
            })}

            {/* Secondary Nav Items (Visible directly on wide screens >= 1280px) */}
            {secondaryNavItems.map((item) => {
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-link-${item.id}`}
                  onClick={() => onSelectTab(item.id)}
                  className={`hidden xl:flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                    isActive
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {item.icon}
                  <span>{item.shortLabel}</span>
                </button>
              );
            })}

            {/* "More" Dropdown Button (Visible on screens 768px-1279px to prevent any navbar overflow) */}
            <div className="relative xl:hidden shrink-0">
              <button
                type="button"
                id="more-dropdown-btn"
                onClick={() => setIsMoreDropdownOpen(!isMoreDropdownOpen)}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  isSecondaryActive
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <span>{moreLabel}</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isMoreDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {isMoreDropdownOpen && (
                <div
                  id="more-dropdown-menu"
                  className="absolute left-0 mt-2 w-44 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl py-1.5 z-50 animate-in fade-in zoom-in-95"
                >
                  {secondaryNavItems.map((item) => (
                    <button
                      key={`more-${item.id}`}
                      type="button"
                      onClick={() => {
                        onSelectTab(item.id);
                        setIsMoreDropdownOpen(false);
                      }}
                      className={`w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold hover:bg-emerald-50 dark:hover:bg-emerald-950/40 cursor-pointer ${
                        currentTab === item.id
                          ? 'text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50/50 dark:bg-emerald-950/30'
                          : 'text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {item.icon}
                      <span>{item.label}</span>
                    </button>
                  ))}
                  <div className="border-t border-slate-100 dark:border-slate-700/60 my-1" />
                  <button
                    type="button"
                    onClick={() => {
                      onSelectTab('settings');
                      setIsMoreDropdownOpen(false);
                    }}
                    className={`w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold hover:bg-emerald-50 dark:hover:bg-emerald-950/40 cursor-pointer ${
                      currentTab === 'settings'
                        ? 'text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50/50 dark:bg-emerald-950/30'
                        : 'text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <SettingsIcon className="w-4 h-4" />
                    <span>{t('navSettings')}</span>
                  </button>
                </div>
              )}
            </div>
          </nav>

          {/* Right Action Widgets */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Streak Counter */}
            <div
              onClick={() => onSelectTab('stats')}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-amber-700 dark:text-amber-400 text-xs font-bold cursor-pointer hover:bg-amber-100 transition-colors shrink-0"
              title={`${streak.currentStreak} ${t('streakDays')}`}
            >
              <Flame className="w-4 h-4 fill-amber-500 text-amber-500 animate-bounce" />
              <span>{streak.currentStreak}</span>
            </div>

            {/* Daily Goal Pill (Only on extra large screens) */}
            <div
              onClick={() => onSelectTab('settings')}
              className="hidden 2xl:flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold cursor-pointer hover:bg-slate-200 transition-colors shrink-0"
              title={`${dailyGoal.minutesPracticed} / ${settings.dailyGoalMinutes} ${t('minutes')}`}
            >
              <div className="w-3.5 h-3.5 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
              <span>{dailyGoal.minutesPracticed}m</span>
            </div>

            {/* Sound Toggle */}
            <button
              type="button"
              id="sound-toggle-btn"
              onClick={toggleSound}
              className={`p-2 rounded-xl transition-colors cursor-pointer shrink-0 ${
                settings.soundEnabled
                  ? 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  : 'text-rose-500 bg-rose-50 dark:bg-rose-950/40'
              }`}
              title={
                settings.soundEnabled
                  ? settings.language === 'en'
                    ? 'Mute Sound'
                    : settings.language === 'bn'
                    ? 'শব্দ বন্ধ করুন'
                    : 'كتم الصوت'
                  : settings.language === 'en'
                  ? 'Enable Sound'
                  : settings.language === 'bn'
                  ? 'শব্দ চালু করুন'
                  : 'تشغيل الصوت'
              }
            >
              {settings.soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* Theme Toggle */}
            <button
              type="button"
              id="theme-toggle-btn"
              onClick={toggleTheme}
              className="p-2 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
              title={
                settings.language === 'en'
                  ? 'Toggle Theme'
                  : settings.language === 'bn'
                  ? 'থিম পরিবর্তন করুন'
                  : 'تبديل المظهر'
              }
            >
              {settings.theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Language Selector Dropdown */}
            <div className="relative shrink-0">
              <button
                type="button"
                id="lang-dropdown-btn"
                onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <Globe className="w-3.5 h-3.5 text-emerald-500" />
                <span className="uppercase">{settings.language}</span>
              </button>

              {isLangDropdownOpen && (
                <div
                  id="lang-dropdown-menu"
                  className="absolute left-0 sm:right-0 mt-2 w-32 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl py-1 z-50 animate-in fade-in zoom-in-95"
                >
                  <button
                    type="button"
                    onClick={() => handleLangChange('ar')}
                    className={`w-full text-right px-3 py-1.5 text-xs font-semibold hover:bg-emerald-50 dark:hover:bg-emerald-950/40 cursor-pointer ${
                      settings.language === 'ar' ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    العربية
                  </button>
                  <button
                    type="button"
                    onClick={() => handleLangChange('en')}
                    className={`w-full text-right px-3 py-1.5 text-xs font-semibold hover:bg-emerald-50 dark:hover:bg-emerald-950/40 cursor-pointer ${
                      settings.language === 'en' ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    English
                  </button>
                  <button
                    type="button"
                    onClick={() => handleLangChange('bn')}
                    className={`w-full text-right px-3 py-1.5 text-xs font-semibold hover:bg-emerald-50 dark:hover:bg-emerald-950/40 cursor-pointer ${
                      settings.language === 'bn' ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    বাংলা
                  </button>
                </div>
              )}
            </div>

            {/* Profile Avatar Button */}
            <button
              type="button"
              id="profile-nav-btn"
              onClick={() => onSelectTab('profile')}
              className="flex items-center gap-1.5 px-2 py-1.5 rounded-full border border-slate-200 dark:border-slate-700 hover:border-emerald-500 transition-colors cursor-pointer shrink-0"
            >
              <span className="text-base leading-none">{profile.avatar}</span>
              <span className="hidden 2xl:inline text-xs font-bold text-slate-700 dark:text-slate-200 max-w-[80px] truncate">
                {profile.name}
              </span>
            </button>

            {/* Mobile Hamburger Button */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer shrink-0"
              aria-label="القائمة"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Slide-out Drawer */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 py-3 shadow-lg animate-in slide-in-from-top-2">
            <div className="grid grid-cols-2 gap-2">
              {navItems.map((item) => (
                <button
                  key={`mobile-${item.id}`}
                  onClick={() => {
                    onSelectTab(item.id);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`flex items-center gap-2 p-2.5 rounded-xl text-xs font-bold cursor-pointer ${
                    currentTab === item.id
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              ))}
              <button
                onClick={() => {
                  onSelectTab('settings');
                  setIsMobileMenuOpen(false);
                }}
                className={`flex items-center gap-2 p-2.5 rounded-xl text-xs font-bold cursor-pointer ${
                  currentTab === 'settings'
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <span>⚙️</span>
                <span>{t('navSettings')}</span>
              </button>
              <button
                onClick={() => {
                  onSelectTab('profile');
                  setIsMobileMenuOpen(false);
                }}
                className={`flex items-center gap-2 p-2.5 rounded-xl text-xs font-bold cursor-pointer ${
                  currentTab === 'profile'
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <User className="w-4 h-4" />
                <span>{t('navProfile')}</span>
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Clean Mobile Bottom Bar for Fast One-Handed Switching (Strictly Mobile Only, Hidden on Desktop/Tablets) */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 md:hidden flex justify-around items-center py-2 px-1 shadow-lg">
        <button
          type="button"
          onClick={() => onSelectTab('dashboard')}
          className={`flex flex-col items-center gap-0.5 text-[10px] font-bold p-1 cursor-pointer ${
            currentTab === 'dashboard' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          <Home className="w-5 h-5" />
          <span>{t('navHome')}</span>
        </button>

        <button
          type="button"
          onClick={() => onSelectTab('lessons')}
          className={`flex flex-col items-center gap-0.5 text-[10px] font-bold p-1 cursor-pointer ${
            currentTab === 'lessons' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          <BookOpen className="w-5 h-5" />
          <span>{t('navLessons')}</span>
        </button>

        <button
          type="button"
          onClick={() => onSelectTab('workspace')}
          className={`flex flex-col items-center gap-0.5 text-[10px] font-bold p-1 cursor-pointer -mt-4 bg-emerald-600 text-white rounded-full p-2.5 shadow-lg shadow-emerald-500/30 ${
            currentTab === 'workspace' ? 'ring-4 ring-emerald-300' : ''
          }`}
        >
          <Keyboard className="w-5 h-5" />
        </button>

        <button
          type="button"
          onClick={() => onSelectTab('test')}
          className={`flex flex-col items-center gap-0.5 text-[10px] font-bold p-1 cursor-pointer ${
            currentTab === 'test' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          <Timer className="w-5 h-5" />
          <span>{t('navTest')}</span>
        </button>

        <button
          type="button"
          onClick={() => onSelectTab('mistakes')}
          className={`flex flex-col items-center gap-0.5 text-[10px] font-bold p-1 cursor-pointer ${
            currentTab === 'mistakes' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          <AlertTriangle className="w-5 h-5" />
          <span>{t('navMistakes')}</span>
        </button>
      </div>
    </>
  );
};
