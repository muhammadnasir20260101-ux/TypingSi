import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, Check, Globe, Keyboard, Sparkles, UserCheck } from 'lucide-react';
import { Language, UserSettings } from '../types';
import { getTranslation } from '../data/translations';

interface OnboardingModalProps {
  isOpen: boolean;
  onComplete: (lang: Language) => void;
  settings: UserSettings;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  onComplete,
  settings,
}) => {
  const [step, setStep] = useState<number>(1);
  const [selectedLang, setSelectedLang] = useState<Language>(settings.language);

  if (!isOpen) return null;

  const t = (key: string) => getTranslation(selectedLang, key);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in">
      <div
        id="onboarding-modal-card"
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl max-w-lg w-full p-6 sm:p-8 text-center relative overflow-hidden"
        dir={selectedLang === 'ar' ? 'rtl' : 'ltr'}
      >
        {/* Step Indicator */}
        <div className="flex justify-center items-center gap-2 mb-6">
          {[1, 2, 3].map((s) => (
            <div
              key={`step-${s}`}
              className={`h-2 rounded-full transition-all duration-300 ${
                s === step
                  ? 'w-8 bg-emerald-500'
                  : s < step
                  ? 'w-4 bg-emerald-300 dark:bg-emerald-800'
                  : 'w-4 bg-slate-200 dark:bg-slate-700'
              }`}
            />
          ))}
        </div>

        {/* Step 1: Welcome & Value Proposition */}
        {step === 1 && (
          <div className="space-y-4 animate-in fade-in zoom-in-95">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white mx-auto flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Keyboard className="w-8 h-8" />
            </div>

            <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100 font-['Noto_Naskh_Arabic','Alexandria',sans-serif]">
              {t('welcomeOnboardingTitle')}
            </h3>

            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed max-w-md mx-auto">
              {t('welcomeOnboardingDesc')}
            </p>

            {/* Language Selection */}
            <div className="pt-3">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 block">
                {t('chooseLang')}
              </span>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedLang('ar')}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                    selectedLang === 'ar'
                      ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 shadow-xs'
                      : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  العربية
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedLang('en')}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                    selectedLang === 'en'
                      ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 shadow-xs'
                      : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  English
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedLang('bn')}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                    selectedLang === 'bn'
                      ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 shadow-xs'
                      : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  বাংলা
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setStep(2)}
              className="w-full mt-6 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>{selectedLang === 'en' ? 'Continue' : selectedLang === 'bn' ? 'এগিয়ে যান' : 'التالي'}</span>
              {selectedLang === 'ar' ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
            </button>
          </div>
        )}

        {/* Step 2: Keyboard Positioning & Anchor Keys */}
        {step === 2 && (
          <div className="space-y-4 animate-in fade-in zoom-in-95">
            <div className="w-16 h-16 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 mx-auto flex items-center justify-center">
              <Sparkles className="w-8 h-8" />
            </div>

            <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">
              {selectedLang === 'en'
                ? 'The Golden Anchor Keys (ب & ت)'
                : selectedLang === 'bn'
                ? 'স্বর্ণালি অ্যাঙ্কর কী (ب এবং ت)'
                : 'مفتاحا الارتكاز الذهبيان (ب، ت)'}
            </h3>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              {selectedLang === 'en'
                ? 'Physical keyboards have tactile bumps on keys F (ب) and J (ت). Place your left index on (ب) and right index on (ت). Keep your other fingers on the same row.'
                : selectedLang === 'bn'
                ? 'কীবোর্ডের F (ب) এবং J (ت) কীতে ছোট দাগ রয়েছে। বাম তর্জনী ب এবং ডান তর্জনী ت তে রেখে অন্য আঙুলগুলো সারিতে রাখুন।'
                : 'تحتوي لوحة المفاتيح على بروزين لمسيين على حرف الباء (F) وحرف التاء (J). ضع سبابتك اليسرى على (ب) واليمنى على (ت) لبناء الذاكرة العضلية الصحيحة.'}
            </p>

            <div className="bg-slate-100 dark:bg-slate-800/80 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 flex justify-center items-center gap-6">
              <div className="flex flex-col items-center">
                <span className="text-[10px] text-slate-500 font-semibold mb-1">
                  {selectedLang === 'en' ? 'Left Index' : selectedLang === 'bn' ? 'বাম তর্জনী' : 'السبابة اليسرى'}
                </span>
                <span className="w-12 h-12 rounded-xl bg-cyan-500 text-white font-bold text-lg flex items-center justify-center shadow-md">
                  ب
                </span>
                <span className="text-[10px] font-mono text-slate-400 mt-1">Key F</span>
              </div>
              <span className="text-xl font-bold text-slate-400">+</span>
              <div className="flex flex-col items-center">
                <span className="text-[10px] text-slate-500 font-semibold mb-1">
                  {selectedLang === 'en' ? 'Right Index' : selectedLang === 'bn' ? 'ডান তর্জনী' : 'السبابة اليمنى'}
                </span>
                <span className="w-12 h-12 rounded-xl bg-teal-500 text-white font-bold text-lg flex items-center justify-center shadow-md">
                  ت
                </span>
                <span className="text-[10px] font-mono text-slate-400 mt-1">Key J</span>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="py-3 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs cursor-pointer hover:bg-slate-200"
              >
                {selectedLang === 'en' ? 'Back' : selectedLang === 'bn' ? 'পিছনে' : 'السابق'}
              </button>
              <button
                type="button"
                onClick={() => setStep(3)}
                className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>{selectedLang === 'en' ? 'Next' : selectedLang === 'bn' ? 'পরবর্তী' : 'التالي'}</span>
                {selectedLang === 'ar' ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Ready to Start (Continue as Guest) */}
        {step === 3 && (
          <div className="space-y-4 animate-in fade-in zoom-in-95">
            <div className="w-16 h-16 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center">
              <UserCheck className="w-8 h-8" />
            </div>

            <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 font-['Noto_Naskh_Arabic','Alexandria',sans-serif]">
              {selectedLang === 'en'
                ? 'You are All Set!'
                : selectedLang === 'bn'
                ? 'আপনি প্রস্তুত!'
                : 'أنت جاهز تماماً للانطلاق!'}
            </h3>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              {selectedLang === 'en'
                ? 'No account required. All your lesson progress, typing speed, and streaks are safely saved locally on your device.'
                : selectedLang === 'bn'
                ? 'কোনো অ্যাকাউন্ট তৈরির প্রয়োজন নেই। আপনার সকল ডেটা ও অগ্রগতি আপনার ডিভাইসে সংরক্ষিত থাকবে।'
                : 'لا حاجة لتسجيل حساب شخصي أو إدخال بيانات سرية. كل تقدمك وسرعتك وإنجازاتك تُحفظ محلياً وبأمان تام على جهازك.'}
            </p>

            <div className="pt-2">
              <button
                type="button"
                id="start-first-lesson-btn"
                onClick={() => onComplete(selectedLang)}
                className="w-full py-3.5 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-bold text-sm shadow-lg shadow-emerald-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>{t('guestStart')}</span>
                <Check className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
