import React from 'react';
import {
  Bell,
  Eye,
  Globe,
  Keyboard,
  Moon,
  RotateCcw,
  Sliders,
  Sun,
  Target,
  Trash2,
  Volume2,
} from 'lucide-react';
import { StorageService } from '../services/storageService';
import { FontSize, Language, ThemeMode, TypingMode, UserSettings } from '../types';
import { getTranslation } from '../data/translations';

interface SettingsPageProps {
  settings: UserSettings;
  onUpdateSettings: (newSettings: Partial<UserSettings>) => void;
  onResetAllData: () => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({
  settings,
  onUpdateSettings,
  onResetAllData,
}) => {
  const t = (key: string) => getTranslation(settings.language, key);

  const handleReset = () => {
    if (window.confirm(t('confirmReset'))) {
      StorageService.resetAllProgress();
      onResetAllData();
      alert(t('resetSuccess'));
    }
  };

  const getSubHeader = () => {
    if (settings.language === 'en') {
      return 'Customize your typing experience, sound feedback, visual assistance, and goals.';
    }
    if (settings.language === 'bn') {
      return 'আপনার টাইপিং অভিজ্ঞতা, অডিও প্রতিক্রিয়া, ভিজ্যুয়াল নির্দেশিকা ও লক্ষ্যসমূহ কাস্টমাইজ করুন।';
    }
    return 'تخصيص تجربة التعلم، المؤثرات الصوتية، وسائل المساعدة البصرية، وأهدافك اليومية.';
  };

  return (
    <div id="settings-page-view" className="space-y-6 pb-16 max-w-3xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 font-['Noto_Naskh_Arabic','Alexandria',sans-serif]">
          {t('settingsTitle')}
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          {getSubHeader()}
        </p>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl divide-y divide-slate-100 dark:divide-slate-800 shadow-xs overflow-hidden">
        {/* 1. Language */}
        <div className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">{t('languageSetting')}</h4>
              <span className="text-xs text-slate-400">{t('chooseLang')}</span>
            </div>
          </div>

          <div className="flex gap-2">
            {(['ar', 'en', 'bn'] as Language[]).map((lang) => (
              <button
                key={lang}
                type="button"
                onClick={() => onUpdateSettings({ language: lang })}
                className={`py-1.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  settings.language === lang
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                {lang === 'ar' ? 'العربية' : lang === 'en' ? 'English' : 'বাংলা'}
              </button>
            ))}
          </div>
        </div>

        {/* 2. Theme Mode */}
        <div className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              {settings.theme === 'dark' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </div>
            <div>
              <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">{t('themeSetting')}</h4>
              <span className="text-xs text-slate-400">
                {settings.theme === 'light' ? t('themeLight') : settings.theme === 'dark' ? t('themeDark') : t('themeSystem')}
              </span>
            </div>
          </div>

          <div className="flex gap-2">
            {(['light', 'dark'] as ThemeMode[]).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => onUpdateSettings({ theme: mode })}
                className={`py-1.5 px-3.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  settings.theme === mode
                    ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                {mode === 'light' ? `${t('themeLight')} ☀️` : `${t('themeDark')} 🌙`}
              </button>
            ))}
          </div>
        </div>

        {/* 3. Typing Mode (Strict vs Normal) */}
        <div className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">{t('typingModeSetting')}</h4>
              <span className="text-xs text-slate-400">
                {settings.typingMode === 'strict' ? t('strictDesc') : t('normalDesc')}
              </span>
            </div>
          </div>

          <div className="flex gap-2">
            {(['normal', 'strict'] as TypingMode[]).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => onUpdateSettings({ typingMode: mode })}
                className={`py-1.5 px-3.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  settings.typingMode === mode
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                {mode === 'normal' ? t('normalMode') : t('strictMode')}
              </button>
            ))}
          </div>
        </div>

        {/* 4. Font Size */}
        <div className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold text-base">
              ع
            </div>
            <div>
              <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">{t('fontSizeSetting')}</h4>
              <span className="text-xs text-slate-400">{t('previewText')}</span>
            </div>
          </div>

          <div className="flex gap-2">
            {(['small', 'medium', 'large'] as FontSize[]).map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => onUpdateSettings({ fontSize: size })}
                className={`py-1.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  settings.fontSize === size
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                {size === 'small' ? t('fontSmall') : size === 'medium' ? t('fontMedium') : t('fontLarge')}
              </button>
            ))}
          </div>
        </div>

        {/* 5. Sound Effects */}
        <div className="p-6 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <Volume2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">{t('soundSettings')}</h4>
                <span className="text-xs text-slate-400">{t('soundMaster')}</span>
              </div>
            </div>

            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.soundEnabled}
                onChange={(e) => onUpdateSettings({ soundEnabled: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-hidden rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
            </label>
          </div>

          {settings.soundEnabled && (
            <div className="ltr:ml-12 rtl:mr-12 pt-2 grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
              <label className="flex items-center gap-2 text-slate-600 dark:text-slate-400 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.keyPressSound}
                  onChange={(e) => onUpdateSettings({ keyPressSound: e.target.checked })}
                  className="rounded text-emerald-600 focus:ring-emerald-500"
                />
                <span>{t('soundKeyPress')}</span>
              </label>

              <label className="flex items-center gap-2 text-slate-600 dark:text-slate-400 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.errorSound}
                  onChange={(e) => onUpdateSettings({ errorSound: e.target.checked })}
                  className="rounded text-emerald-600 focus:ring-emerald-500"
                />
                <span>{t('soundError')}</span>
              </label>

              <label className="flex items-center gap-2 text-slate-600 dark:text-slate-400 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.completionSound}
                  onChange={(e) => onUpdateSettings({ completionSound: e.target.checked })}
                  className="rounded text-emerald-600 focus:ring-emerald-500"
                />
                <span>{t('soundCompletion')}</span>
              </label>
            </div>
          )}
        </div>

        {/* 6. Visual Aids (Keyboard & Finger Guide) */}
        <div className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-50 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400 flex items-center justify-center">
              <Eye className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">{t('displaySettings')}</h4>
              <span className="text-xs text-slate-400">{t('keyboardVisualDesc')}</span>
            </div>
          </div>

          <div className="flex gap-4 text-xs font-semibold">
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.showKeyboard}
                onChange={(e) => onUpdateSettings({ showKeyboard: e.target.checked })}
                className="rounded text-emerald-600 focus:ring-emerald-500"
              />
              <span>{t('showKeyboardVisual')}</span>
            </label>

            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.showFingerGuide}
                onChange={(e) => onUpdateSettings({ showFingerGuide: e.target.checked })}
                className="rounded text-emerald-600 focus:ring-emerald-500"
              />
              <span>{t('showFingerVisual')}</span>
            </label>
          </div>
        </div>

        {/* 7. Daily Goal */}
        <div className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">{t('dailyGoalTitle')}</h4>
              <span className="text-xs text-slate-400">{t('dailyGoalDesc')}</span>
            </div>
          </div>

          <div className="flex gap-2">
            {[5, 10, 15, 30].map((mins) => (
              <button
                key={mins}
                type="button"
                onClick={() => onUpdateSettings({ dailyGoalMinutes: mins })}
                className={`py-1.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  settings.dailyGoalMinutes === mins
                    ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                {mins} {t('minutes')}
              </button>
            ))}
          </div>
        </div>

        {/* 8. Danger Zone */}
        <div className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-rose-50/30 dark:bg-rose-950/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-rose-600 dark:text-rose-400">{t('resetDataTitle')}</h4>
              <span className="text-xs text-slate-400">{t('resetDataDesc')}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleReset}
            className="py-2 px-4 rounded-xl border border-rose-300 dark:border-rose-800 text-rose-600 dark:text-rose-400 hover:bg-rose-600 hover:text-white transition-colors text-xs font-bold cursor-pointer"
          >
            {t('resetAllBtn')}
          </button>
        </div>
      </div>
    </div>
  );
};
