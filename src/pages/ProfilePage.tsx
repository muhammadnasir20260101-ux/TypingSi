import React, { useState } from 'react';
import { Award, Check, Download, Edit3, Flame, GraduationCap, RotateCcw, Sparkles, Upload, User } from 'lucide-react';
import { StorageService } from '../services/storageService';
import { DailyGoalProgress, StreakData, UserProfile, UserSettings } from '../types';
import { getTranslation } from '../data/translations';
import { LearningTreeCard } from '../components/LearningTreeCard';

interface ProfilePageProps {
  profile: UserProfile;
  settings: UserSettings;
  streak: StreakData;
  dailyGoal: DailyGoalProgress;
  onUpdateProfile: (newProfile: UserProfile) => void;
  onReloadAllData: () => void;
}

const AVATARS = ['🚀', '🌟', '🦅', '🎯', '⚡', '💻', '🖋️', '🎓', '👑', '🦁', '🏆', '🔥'];

export const ProfilePage: React.FC<ProfilePageProps> = ({
  profile,
  settings,
  streak,
  dailyGoal,
  onUpdateProfile,
  onReloadAllData,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(profile.name);
  const [selectedAvatar, setSelectedAvatar] = useState(profile.avatar);

  const t = (key: string) => getTranslation(settings.language, key);

  const handleSave = () => {
    const updated: UserProfile = {
      ...profile,
      name: name.trim() || 'المتعلم العربي',
      avatar: selectedAvatar,
    };
    StorageService.saveProfile(updated);
    onUpdateProfile(updated);
    setIsEditing(false);
  };

  const handleExport = () => {
    const jsonStr = StorageService.exportAllData();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tibaa_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const success = StorageService.importData(content);
        if (success) {
          alert(
            settings.language === 'en'
              ? 'Data imported successfully!'
              : settings.language === 'bn'
              ? 'ডাটা সফলভাবে ইম্পোর্ট করা হয়েছে!'
              : 'تم استيراد البيانات بنجاح!'
          );
          onReloadAllData();
        } else {
          alert(
            settings.language === 'en'
              ? 'Failed to import file. Please check format.'
              : settings.language === 'bn'
              ? 'ফাইল ইম্পোর্ট করা যায়নি, ফরম্যাট পরীক্ষা করুন।'
              : 'تعذر استيراد الملف، تأكد من صحة التنسيق.'
          );
        }
      }
    };
    reader.readAsText(file);
  };

  return (
    <div id="profile-page-view" className="space-y-6 pb-16 max-w-4xl mx-auto">
      {/* Header Profile Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-start">
          {/* Avatar */}
          <div className="relative group">
            <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-white flex items-center justify-center text-5xl shadow-xl shadow-emerald-500/20">
              {selectedAvatar}
            </div>
            {isEditing && (
              <span className="text-[10px] text-slate-400 block mt-1 text-center">
                {settings.language === 'en'
                  ? 'Choose below'
                  : settings.language === 'bn'
                  ? 'নিচে নির্বাচন করুন'
                  : 'اختر أدناه'}
              </span>
            )}
          </div>

          <div className="flex-1 space-y-1">
            {isEditing ? (
              <div className="flex items-center gap-2 max-w-sm">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="py-2 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-bold text-base"
                />
                <button
                  type="button"
                  onClick={handleSave}
                  className="py-2 px-4 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow-xs cursor-pointer"
                >
                  {t('save')}
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100 font-['Noto_Naskh_Arabic',sans-serif]">
                  {profile.name}
                </h2>
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                  title={
                    settings.language === 'en'
                      ? 'Edit name and avatar'
                      : settings.language === 'bn'
                      ? 'নাম ও অবতার সম্পাদনা করুন'
                      : 'تعديل الاسم والصورة'
                  }
                >
                  <Edit3 className="w-4 h-4" />
                </button>
              </div>
            )}

            <div className="flex items-center justify-center sm:justify-start gap-3 text-xs text-slate-400 pt-1">
              <span className="flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400">
                <GraduationCap className="w-4 h-4" />
                {settings.language === 'en'
                  ? `Level ${profile.level}`
                  : settings.language === 'bn'
                  ? `স্তর ${profile.level}`
                  : `المستوى ${profile.level}`}
              </span>
              <span>•</span>
              <span>
                {settings.language === 'en'
                  ? `Joined: ${profile.joinedDate}`
                  : settings.language === 'bn'
                  ? `যুক্ত হয়েছেন: ${profile.joinedDate}`
                  : `انضم في ${profile.joinedDate}`}
              </span>
            </div>
          </div>
        </div>

        {/* Avatar Picker if in edit mode */}
        {isEditing && (
          <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
            <span className="text-xs font-bold text-slate-500 mb-2 block">
              {settings.language === 'en'
                ? 'Select your avatar:'
                : settings.language === 'bn'
                ? 'আপনার অবতার বেছে নিন:'
                : 'اختر شخصيتك الرمزية:'}
            </span>
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
              {AVATARS.map((av) => (
                <button
                  key={av}
                  type="button"
                  onClick={() => setSelectedAvatar(av)}
                  className={`w-11 h-11 rounded-2xl text-2xl flex items-center justify-center border transition-all cursor-pointer ${
                    selectedAvatar === av
                      ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/60 ring-2 ring-emerald-500/20'
                      : 'border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {av}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Learning Tree Growth Card */}
      <LearningTreeCard lang={settings.language} />

      {/* Backup, Export & Import Section */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs space-y-4">
        <div>
          <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
            {settings.language === 'en'
              ? 'Backup & Data Portability'
              : settings.language === 'bn'
              ? 'ব্যাকআপ ও ডেটা পোর্টেবিলিটি'
              : 'النسخ الاحتياطي ونقل البيانات (Data Portability)'}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {settings.language === 'en'
              ? 'All your progress, badges, and stats are saved locally on your device. You can download a JSON backup to transfer to another device at any time.'
              : settings.language === 'bn'
              ? 'আপনার সমস্ত অগ্রগতি, ব্যাজ এবং পরিসংখ্যান আপনার ডিভাইসে সুরক্ষিত থাকে। আপনি যেকোনো সময় অন্য ডিভাইসে স্থানান্তরের জন্য ব্যাকআপ ফাইল ডাউনলোড করতে পারেন।'
              : 'جميع تقدمك وأوسمتك وسرعتك تُحفظ على جهازك بأمان. يمكنك تحميل ملف نسخة احتياطية لنقله إلى أي هاتف أو حاسوب آخر في أي وقت.'}
          </p>
        </div>

        <div className="flex flex-wrap gap-3 pt-2">
          <button
            type="button"
            onClick={handleExport}
            className="py-2.5 px-5 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-bold text-xs shadow-xs hover:opacity-90 flex items-center gap-2 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>
              {settings.language === 'en'
                ? 'Export Backup (JSON)'
                : settings.language === 'bn'
                ? 'ব্যাকআপ এক্সপোর্ট (JSON)'
                : 'تصدير نسخة احتياطية (JSON)'}
            </span>
          </button>

          <label className="py-2.5 px-5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs transition-colors flex items-center gap-2 cursor-pointer">
            <Upload className="w-4 h-4" />
            <span>
              {settings.language === 'en'
                ? 'Import Previous Backup'
                : settings.language === 'bn'
                ? 'পূর্ববর্তী ব্যাকআপ ইম্পোর্ট করুন'
                : 'استيراد نسخة سابقة'}
            </span>
            <input
              type="file"
              accept=".json"
              onChange={handleImport}
              className="hidden"
            />
          </label>
        </div>
      </div>
    </div>
  );
};
