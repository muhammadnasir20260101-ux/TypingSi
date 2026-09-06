import React, { useRef } from 'react';
import { Award, CheckCircle, Download, Printer, Sparkles, Star, Trophy, X, Zap } from 'lucide-react';
import { Course, Language } from '../types';

interface UnitCertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  course: Course;
  studentName: string;
  avgWpm: number;
  avgAccuracy: number;
  completedLessonsCount: number;
  lang: Language;
}

export const UnitCertificateModal: React.FC<UnitCertificateModalProps> = ({
  isOpen,
  onClose,
  course,
  studentName,
  avgWpm,
  avgAccuracy,
  completedLessonsCount,
  lang,
}) => {
  const certificateRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const courseTitle =
    lang === 'bn' && course.titleBn
      ? course.titleBn
      : lang === 'en'
      ? course.titleEn
      : course.titleAr;

  const today = new Date().toLocaleDateString(
    lang === 'ar' ? 'ar-EG' : lang === 'bn' ? 'bn-BD' : 'en-US',
    {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }
  );

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        id="unit-certificate-modal"
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl max-w-2xl w-full p-6 sm:p-8 relative overflow-hidden flex flex-col max-h-[90vh]"
        dir={lang === 'ar' ? 'rtl' : 'ltr'}
      >
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 end-4 p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Action buttons header */}
        <div className="flex items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800 print:hidden">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-500" />
            <span className="font-bold text-sm text-slate-800 dark:text-slate-200">
              {lang === 'ar'
                ? 'شهادة إتمام الوحدة التعليمية'
                : lang === 'bn'
                ? 'ইউনিট সমাপনী সনদপত্র'
                : 'Unit Completion Certificate'}
            </span>
          </div>

          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>
              {lang === 'ar' ? 'طباعة الشهادة' : lang === 'bn' ? 'সার্টিফিকেট প্রিন্ট' : 'Print Certificate'}
            </span>
          </button>
        </div>

        {/* Printable Certificate Body */}
        <div className="overflow-y-auto p-1 sm:p-4 my-auto">
          <div
            ref={certificateRef}
            id="printable-certificate"
            className="relative bg-gradient-to-b from-amber-50/50 via-white to-amber-50/30 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900 border-8 border-double border-amber-600/60 rounded-2xl p-6 sm:p-10 text-center shadow-lg"
          >
            {/* Ornate Corner Elements */}
            <div className="absolute top-2 start-2 w-6 h-6 border-t-2 border-s-2 border-amber-500" />
            <div className="absolute top-2 end-2 w-6 h-6 border-t-2 border-e-2 border-amber-500" />
            <div className="absolute bottom-2 start-2 w-6 h-6 border-b-2 border-s-2 border-amber-500" />
            <div className="absolute bottom-2 end-2 w-6 h-6 border-b-2 border-e-2 border-amber-500" />

            {/* Top Emblem */}
            <div className="mx-auto w-14 h-14 rounded-full bg-amber-500/15 border-2 border-amber-500/40 flex items-center justify-center mb-3">
              <Award className="w-8 h-8 text-amber-600 dark:text-amber-400" />
            </div>

            {/* Header Titles */}
            <p className="text-xs uppercase tracking-widest text-amber-700 dark:text-amber-400 font-bold mb-1">
              {lang === 'ar' ? 'منصة الطباعة العربية باللمس' : lang === 'bn' ? 'আরবি টাচ টাইপিং প্ল্যাটফর্ম' : 'Arabic Touch Typing Academy'}
            </p>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 font-['Noto_Naskh_Arabic','Alexandria',sans-serif] mb-2">
              {lang === 'ar' ? 'شهادة إنجاز واجتياز' : lang === 'bn' ? 'সাফল্য ও যোগ্যতা সনদ' : 'Certificate of Achievement'}
            </h2>

            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              {lang === 'ar'
                ? 'تشهد المنصة بأن الطالب المتميز قد أتم متطلبات الوحدة التعليمية بنجاح واقتدار'
                : lang === 'bn'
                ? 'এই মর্মে প্রত্যয়ন করা হচ্ছে যে শিক্ষার্থী সফলতার সাথে এই ইউনিট সম্পন্ন করেছেন'
                : 'This is proudly presented to certify the successful completion of the curriculum unit'}
            </p>

            {/* Student Name */}
            <div className="py-2 px-6 inline-block border-b-2 border-amber-500/80 mb-4">
              <h3 className="text-xl sm:text-2xl font-bold text-emerald-700 dark:text-emerald-400 font-['Noto_Naskh_Arabic',sans-serif]">
                {studentName || (lang === 'ar' ? 'المتعلم المتميز' : lang === 'bn' ? 'সফল শিক্ষার্থী' : 'Distinguished Typist')}
              </h3>
            </div>

            {/* Unit Name */}
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-6">
              {lang === 'ar' ? 'لاختتامه متطلبات:' : lang === 'bn' ? 'সম্পন্নকৃত কোর্স:' : 'For mastering:'}{' '}
              <span className="text-amber-600 dark:text-amber-400 font-bold font-['Noto_Naskh_Arabic',sans-serif]">
                {courseTitle}
              </span>
            </p>

            {/* Metrics Ribbon */}
            <div className="grid grid-cols-3 gap-3 bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 mb-6 max-w-md mx-auto">
              <div>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-medium">
                  {lang === 'ar' ? 'معدل السرعة' : lang === 'bn' ? 'গড় গতি' : 'Avg Speed'}
                </span>
                <span className="text-base font-bold text-slate-900 dark:text-slate-100 font-mono">
                  {avgWpm > 0 ? avgWpm : 24} WPM
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-medium">
                  {lang === 'ar' ? 'نسبة الدقة' : lang === 'bn' ? 'নির্ভুলতা' : 'Accuracy'}
                </span>
                <span className="text-base font-bold text-slate-900 dark:text-slate-100 font-mono">
                  {avgAccuracy > 0 ? avgAccuracy : 98}%
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-medium">
                  {lang === 'ar' ? 'الدروس المنجزة' : lang === 'bn' ? 'সম্পন্ন ড্রিল' : 'Lessons'}
                </span>
                <span className="text-base font-bold text-slate-900 dark:text-slate-100 font-mono">
                  {completedLessonsCount} / {course.lessonIds.length}
                </span>
              </div>
            </div>

            {/* Seal & Date Footer */}
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-3 border-t border-amber-500/20 px-4">
              <div className="text-start">
                <span className="block text-[10px] uppercase tracking-wider text-slate-400">
                  {lang === 'ar' ? 'تاريخ التخرج' : lang === 'bn' ? 'তারিখ' : 'Date'}
                </span>
                <span className="font-semibold text-slate-700 dark:text-slate-300 font-mono">
                  {today}
                </span>
              </div>

              {/* Gold Medal Stamp */}
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 rounded-full bg-amber-500 text-slate-950 font-black flex items-center justify-center shadow-md">
                  <Star className="w-5 h-5 fill-slate-950 text-slate-950" />
                </div>
                <span className="text-[9px] font-bold text-amber-600 dark:text-amber-400 mt-1 uppercase tracking-wider">
                  Verified Unit
                </span>
              </div>

              <div className="text-end">
                <span className="block text-[10px] uppercase tracking-wider text-slate-400">
                  {lang === 'ar' ? 'الاعتماد الأكاديمي' : lang === 'bn' ? 'স্বাক্ষর' : 'Certified'}
                </span>
                <span className="font-semibold text-slate-700 dark:text-slate-300 font-serif italic">
                  Arabic Typing AI
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
