import React, { useEffect, useRef, useState } from 'react';
import { 
  AlertCircle, 
  Award, 
  CheckCircle, 
  Clock, 
  Crown, 
  Download, 
  Flame, 
  Printer, 
  RotateCcw, 
  ShieldCheck, 
  Sparkles, 
  Timer, 
  Trophy, 
  X, 
  Zap 
} from 'lucide-react';
import { ExamResult, ExamType, Language, TypingClassification, UserSettings } from '../types';
import { StorageService } from '../services/storageService';
import { soundService } from '../services/soundService';
import { useTypingEngine } from '../hooks/useTypingEngine';
import { LessonTypingArea } from './LessonTypingArea';
import { KeyboardVisualizer } from './KeyboardVisualizer';
import { findKeyForChar } from '../data/keyboard101';

interface ExamModalProps {
  isOpen: boolean;
  onClose: () => void;
  examType: ExamType;
  settings: UserSettings;
  onExamPassed?: (examType: ExamType) => void;
}

type BaseExamKey = 'beginner' | 'intermediate' | 'final';

const EXAM_CONFIGS: Record<BaseExamKey, {
  durationSeconds: number;
  minWpm: number;
  minAccuracy: number;
  titleAr: string;
  titleEn: string;
  titleBn: string;
  descAr: string;
  unseenText: string;
}> = {
  beginner: {
    durationSeconds: 60,
    minWpm: 15,
    minAccuracy: 85,
    titleAr: 'امتحان شهادة المبتدئ في الطباعة العربية',
    titleEn: 'Beginner Final Certification Exam',
    titleBn: 'বিগিনার ফাইনাল সার্টিফিকেশন পরীক্ষা',
    descAr: 'مدة الاختبار: دقيقة واحدة. نص عربي غير مسبوق يقيس التمكن التام من حروف لوحة المفاتيح 101.',
    unseenText: 'إن القراءة المستمرة والتدريب اليومي على الكتابة باللمس يمنحان المتعلم ثقة عالية وسرعة فائقة في إنجاز الأعمال. لقد أثبتت الدراسات أن التدريب المنتظم على لوحة المفاتيح يرفع التركيز الذهني وينمي التناسق العضلي العصبي بين اليدين.',
  },
  intermediate: {
    durationSeconds: 90,
    minWpm: 20,
    minAccuracy: 88,
    titleAr: 'امتحان شهادة المتوسط (الحركات والتشكيل)',
    titleEn: 'Intermediate Diacritics Certification Exam',
    titleBn: 'ইন্টারমিডিয়েট হরকত সার্টিফিকেশন পরীক্ষা',
    descAr: 'مدة الاختبار: دقيقة ونصف. نص مشكول بالكامل يقيس إتقان علامات التشكيل والتنوين والشدة.',
    unseenText: 'الْعِلْمُ يَرْفَعُ بَيْتًا لا عِمَادَ لَهُ وَالْجَهْلُ يَهْدِمُ بَيْتَ الْعِزِّ وَالشَّرَفِ. إِنَّ طَلَبَ الْعِلْمِ فَرِيضَةٌ عَلَى كُلِّ مُسْلِمٍ وَمُسْلِمَةٍ، وَالْمُؤْمِنُ الْقَوِيُّ خَيْرٌ وَأَحَبُّ إِلَى اللَّهِ مِنَ الْمُؤْمِنِ الضَّعِيفِ، وَفِي كُلٍّ خَيْرٌ.',
  },
  final: {
    durationSeconds: 120,
    minWpm: 25,
    minAccuracy: 90,
    titleAr: 'امتحان الشهادة الاحترافية الكبرى للطباعة العربية',
    titleEn: 'Grand Arabic Typing Proficiency Exam',
    titleBn: 'গ্র্যান্ড অ্যারাবিক টাইপিং প্রফিশিয়েন্সি পরীক্ষা',
    descAr: 'مدة الاختبار: دقيقتان. نص فصيح شامل يتضمن الحروف والتشكيل والأرقام وعلامات الترقيم.',
    unseenText: 'يَقُولُ أَبُو الطَّيِّبِ الْمُتَنَبِّي: «أَعَزُّ مَكَانٍ فِي الدُّنَى سَرْجُ سَابِحٍ، وَخَيْرُ جَلِيسٍ فِي الزَّمَانِ كِتَابُ». إِنَّ اللُّغَةَ الْعَرَبِيَّةَ بِفَصَاحَتِهَا وَبَيَانِهَا الْبَدِيعِ تُمَثِّلُ صَرْحًا حَضَارِيًّا خَالِدًا. تَمَّ تَأْسِيسُ مَعَايِيرِ الإِتْقَانِ عَامَ ١٤٤٥ هِجْرِيَّةٍ لِتَكُونَ نِبْرَاسًا لِكُلِّ مَنْ يَبْتَغِي الِاحْتِرَافَ وَالرِّفْعَةَ فِي مَيْدَانِ الْكِتَابَةِ السَّرِيعَةِ.',
  },
};

export const ExamModal: React.FC<ExamModalProps> = ({
  isOpen,
  onClose,
  examType,
  settings,
  onExamPassed,
}) => {
  const normalizedType: BaseExamKey = examType.startsWith('beginner')
    ? 'beginner'
    : examType.startsWith('intermediate')
    ? 'intermediate'
    : 'final';

  const config = EXAM_CONFIGS[normalizedType];
  const [examState, setExamState] = useState<'intro' | 'active' | 'result' | 'certificate'>('intro');
  const [timeLeft, setTimeLeft] = useState<number>(config.durationSeconds);
  const [examResult, setExamResult] = useState<ExamResult | null>(null);

  const isRtl = settings.language === 'ar';
  const certificateRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<number | null>(null);

  // Reset when opening
  useEffect(() => {
    if (isOpen) {
      setExamState('intro');
      setTimeLeft(config.durationSeconds);
      setExamResult(null);
    }
  }, [isOpen, examType, config.durationSeconds]);

  const handleStartExam = () => {
    setExamState('active');
    setTimeLeft(config.durationSeconds);
  };

  const calculateClassification = (wpm: number, accuracy: number): TypingClassification => {
    if (wpm >= 65 && accuracy >= 97) return 'Arabic Typing Expert';
    if (wpm >= 50 && accuracy >= 95) return 'Professional';
    if (wpm >= 35 && accuracy >= 92) return 'Advanced';
    if (wpm >= 20 && accuracy >= 90) return 'Intermediate';
    return 'Novice';
  };

  const handleFinishExam = (stats: {
    wpm: number;
    cpm: number;
    accuracy: number;
    totalKeystrokes: number;
    correctCharsCount: number;
    incorrectCharsCount: number;
  }) => {
    if (timerRef.current) clearInterval(timerRef.current);

    const isPassed = stats.wpm >= config.minWpm && stats.accuracy >= config.minAccuracy;
    const classification = calculateClassification(stats.wpm, stats.accuracy);
    const profile = StorageService.getProfile();
    const certificateId = `CERT-AR-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;

    const result: ExamResult = {
      examId: `${normalizedType}-exam` as ExamType,
      examType,
      titleAr: config.titleAr,
      titleEn: config.titleEn,
      titleBn: config.titleBn,
      date: new Date().toISOString(),
      wpm: stats.wpm,
      cpm: stats.cpm,
      accuracy: stats.accuracy,
      totalChars: stats.totalKeystrokes,
      correctChars: stats.correctCharsCount,
      incorrectChars: stats.incorrectCharsCount,
      totalKeystrokes: stats.totalKeystrokes,
      correctCharacters: stats.correctCharsCount,
      incorrectCharacters: stats.incorrectCharsCount,
      errorCount: stats.incorrectCharsCount,
      passed: isPassed,
      durationSeconds: config.durationSeconds,
      timeSpentSeconds: config.durationSeconds - timeLeft,
      consistency: Math.min(100, Math.round(92 + (stats.accuracy / 12))),
      classification,
      certificateId,
      studentName: profile.name || (settings.language === 'ar' ? 'طالب الطباعة المتميز' : 'Valued Student'),
    };

    setExamResult(result);
    setExamState('result');

    if (isPassed) {
      StorageService.saveExamResult(result);
      if (settings.soundEnabled) soundService.playCertificateCelebration();
      if (onExamPassed) onExamPassed(examType);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        id="exam-modal-container"
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl max-w-3xl w-full p-6 sm:p-8 relative overflow-hidden flex flex-col max-h-[92vh]"
        dir={isRtl ? 'rtl' : 'ltr'}
      >
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 end-4 p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer z-10 print:hidden"
        >
          <X className="w-5 h-5" />
        </button>

        {/* INTRO SCREEN */}
        {examState === 'intro' && (
          <div className="space-y-6 text-center my-auto py-4">
            <div className="w-20 h-20 rounded-3xl bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center justify-center mx-auto shadow-lg">
              <Trophy className="w-10 h-10" />
            </div>

            <div>
              <span className="text-xs font-black tracking-widest text-amber-600 dark:text-amber-400 uppercase">
                {settings.language === 'ar' ? 'امتحان التقييم المعتمد' : 'CERTIFICATION BENCHMARK'}
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
                {settings.language === 'bn' ? config.titleBn : settings.language === 'ar' ? config.titleAr : config.titleEn}
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 max-w-lg mx-auto mt-2">
                {config.descAr}
              </p>
            </div>

            {/* Benchmark Criteria Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-w-md mx-auto text-start">
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800">
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block">{settings.language === 'ar' ? 'المدة المحددة' : 'Duration'}</span>
                <span className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-1 mt-0.5">
                  <Clock className="w-3.5 h-3.5 text-amber-500" />
                  {config.durationSeconds} {settings.language === 'ar' ? 'ثانية' : 'sec'}
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800">
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block">{settings.language === 'ar' ? 'السرعة المطلوبة' : 'Min Speed'}</span>
                <span className="text-sm font-black text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mt-0.5">
                  <Zap className="w-3.5 h-3.5" />
                  {config.minWpm}+ {settings.language === 'ar' ? 'ك/د' : 'WPM'}
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800 col-span-2 sm:col-span-1">
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block">{settings.language === 'ar' ? 'الدقة المطلوبة' : 'Min Accuracy'}</span>
                <span className="text-sm font-black text-blue-600 dark:text-blue-400 flex items-center gap-1 mt-0.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  {config.minAccuracy}%+
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleStartExam}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-black text-base shadow-xl shadow-amber-600/30 transition-all cursor-pointer hover:scale-105"
            >
              <Zap className="w-5 h-5 fill-current" />
              <span>{settings.language === 'ar' ? 'بدء الامتحان الآن' : 'Start Exam Now'}</span>
            </button>
          </div>
        )}

        {/* ACTIVE EXAM RUNNER */}
        {examState === 'active' && (
          <ActiveExamRunner
            targetText={config.unseenText}
            durationSeconds={config.durationSeconds}
            settings={settings}
            onTimeUp={(stats) => handleFinishExam(stats)}
            onComplete={(stats) => handleFinishExam(stats)}
          />
        )}

        {/* RESULT EVALUATION SCREEN */}
        {examState === 'result' && examResult && (
          <div className="space-y-6 text-center my-auto py-2">
            <div className={`w-16 h-16 rounded-3xl flex items-center justify-center mx-auto shadow-lg ${
              examResult.passed 
                ? 'bg-emerald-500 text-white shadow-emerald-500/30' 
                : 'bg-amber-500 text-white shadow-amber-500/30'
            }`}>
              {examResult.passed ? <Crown className="w-8 h-8" /> : <AlertCircle className="w-8 h-8" />}
            </div>

            <div>
              <span className={`text-xs font-black tracking-widest uppercase ${
                examResult.passed ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'
              }`}>
                {examResult.passed 
                  ? (settings.language === 'ar' ? 'تم اجتياز الامتحان بنجاح باهر' : 'EXAM PASSED SUCCESSFULLY') 
                  : (settings.language === 'ar' ? 'فرصة تدريب إضافية مطلوبة' : 'ADDITIONAL PRACTICE NEEDED')}
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1">
                {examResult.passed 
                  ? (settings.language === 'ar' ? 'مبارك! أنت مؤهل للحصول على الشهادة' : 'Congratulations! Certificate Earned!') 
                  : (settings.language === 'ar' ? 'لم تحقق المعيار المطلوب هذه المرة' : 'Benchmark Not Met Yet')}
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto mt-1">
                {examResult.passed
                  ? (settings.language === 'ar' ? `تصنيفك النهائي: ${examResult.classification}` : `Classification: ${examResult.classification}`)
                  : (settings.language === 'ar' ? 'راجع مفاتيحك الصعبة وتدرب قليلاً ثم أعد المحاولة، النجاح قريب جداً.' : 'Review your problem keys and retry when ready.')}
              </p>
            </div>

            {/* Detailed Evaluation Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-xl mx-auto text-start">
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800">
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block">{settings.language === 'ar' ? 'السرعة (WPM)' : 'Speed'}</span>
                <span className="text-lg font-black text-slate-900 dark:text-white">{examResult.wpm}</span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800">
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block">{settings.language === 'ar' ? 'الدقة' : 'Accuracy'}</span>
                <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">{examResult.accuracy}%</span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800">
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block">{settings.language === 'ar' ? 'ضربات الحروف' : 'CPM'}</span>
                <span className="text-lg font-black text-blue-600 dark:text-blue-400">{examResult.cpm}</span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800">
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block">{settings.language === 'ar' ? 'الأخطاء' : 'Errors'}</span>
                <span className="text-lg font-black text-red-600 dark:text-red-400">{examResult.errorCount}</span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              {examResult.passed ? (
                <button
                  type="button"
                  onClick={() => setExamState('certificate')}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm shadow-lg shadow-emerald-600/30 transition-all cursor-pointer"
                >
                  <Award className="w-5 h-5" />
                  <span>{settings.language === 'ar' ? 'عرض وتحميل الشهادة الرسمية' : 'View & Download Certificate'}</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleStartExam}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm shadow-md transition-all cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>{settings.language === 'ar' ? 'إعادة خوض الامتحان' : 'Retake Exam'}</span>
                </button>
              )}

              <button
                type="button"
                onClick={onClose}
                className="px-5 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-sm transition-colors cursor-pointer"
              >
                {settings.language === 'ar' ? 'إغلاق' : 'Close'}
              </button>
            </div>
          </div>
        )}

        {/* FULL PRINTABLE CERTIFICATE VIEW */}
        {examState === 'certificate' && examResult && (
          <div className="space-y-4 my-auto overflow-y-auto max-h-[80vh] p-1">
            {/* Action Bar */}
            <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800 print:hidden">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Award className="w-4 h-4 text-amber-500" />
                {settings.language === 'ar' ? 'الشهادة المعتمدة لإتقان الطباعة العربية' : 'Official Certificate of Proficiency'}
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePrint}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>{settings.language === 'ar' ? 'طباعة وحفظ PDF' : 'Print / Save PDF'}</span>
                </button>
              </div>
            </div>

            {/* CERTIFICATE DOCUMENT */}
            <div
              ref={certificateRef}
              id="official-exam-certificate"
              className="relative bg-gradient-to-b from-amber-50/60 via-white to-amber-50/40 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900 border-8 border-double border-amber-600/60 rounded-3xl p-6 sm:p-10 text-center shadow-xl space-y-6"
            >
              {/* Corner Embellishments */}
              <div className="absolute top-3 start-3 w-8 h-8 border-t-2 border-s-2 border-amber-500" />
              <div className="absolute top-3 end-3 w-8 h-8 border-t-2 border-e-2 border-amber-500" />
              <div className="absolute bottom-3 start-3 w-8 h-8 border-b-2 border-s-2 border-amber-500" />
              <div className="absolute bottom-3 end-3 w-8 h-8 border-b-2 border-e-2 border-amber-500" />

              {/* Header */}
              <div>
                <div className="w-12 h-12 rounded-full bg-amber-500/10 text-amber-600 border border-amber-500/30 flex items-center justify-center mx-auto mb-2">
                  <Crown className="w-6 h-6" />
                </div>
                <h4 className="text-xs font-black tracking-widest text-amber-700 dark:text-amber-400 uppercase">
                  {settings.language === 'ar' ? 'منصة طباعة — نظام تعلّم الطباعة العربية باللمس 101' : 'TIBAA ARABIC TOUCH-TYPING PLATFORM'}
                </h4>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1">
                  {settings.language === 'ar' ? 'شهادة إتقان الطباعة العربية باللمس' : 'Certificate of Arabic Touch-Typing Proficiency'}
                </h3>
              </div>

              {/* Recipient */}
              <div className="py-2">
                <span className="text-xs text-slate-500 dark:text-slate-400 block">
                  {settings.language === 'ar' ? 'تشهد المنصة بأن الطالب / الطالبة المتميز:' : 'This is proudly presented to certify that:'}
                </span>
                <span className="text-2xl sm:text-3xl font-black text-emerald-700 dark:text-emerald-400 tracking-wide block mt-1 underline decoration-amber-500 decoration-2 underline-offset-8">
                  {examResult.studentName}
                </span>
                <p className="text-xs text-slate-600 dark:text-slate-400 max-w-lg mx-auto mt-3">
                  {settings.language === 'ar'
                    ? `قد اجتاز بنجاح واقتدار ${config.titleAr} وفق المعايير المعتمدة لسرعة ودقة الطباعة على لوحة المفاتيح 101 القياسية.`
                    : `Has successfully demonstrated distinguished proficiency in Arabic touch-typing in the ${config.titleEn}.`}
                </p>
              </div>

              {/* Stats badges */}
              <div className="grid grid-cols-3 gap-3 max-w-md mx-auto pt-1">
                <div className="p-3 rounded-2xl bg-white dark:bg-slate-800 border border-amber-500/20 shadow-xs">
                  <span className="text-[10px] text-slate-400 block">{settings.language === 'ar' ? 'السرعة المحققة' : 'Speed'}</span>
                  <span className="text-base font-black text-slate-900 dark:text-white">{examResult.wpm} ك/د</span>
                </div>
                <div className="p-3 rounded-2xl bg-white dark:bg-slate-800 border border-amber-500/20 shadow-xs">
                  <span className="text-[10px] text-slate-400 block">{settings.language === 'ar' ? 'معدل الدقة' : 'Accuracy'}</span>
                  <span className="text-base font-black text-emerald-600 dark:text-emerald-400">{examResult.accuracy}%</span>
                </div>
                <div className="p-3 rounded-2xl bg-white dark:bg-slate-800 border border-amber-500/20 shadow-xs">
                  <span className="text-[10px] text-slate-400 block">{settings.language === 'ar' ? 'التصنيف' : 'Rank'}</span>
                  <span className="text-xs font-black text-amber-600 dark:text-amber-400 truncate block mt-0.5">{examResult.classification}</span>
                </div>
              </div>

              {/* Footer Credentials */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-amber-600/20 text-xs text-slate-500 dark:text-slate-400">
                <div className="text-start">
                  <span className="block font-bold">{settings.language === 'ar' ? 'تاريخ الامتحان:' : 'Issue Date:'} {new Date(examResult.date).toLocaleDateString(isRtl ? 'ar-EG' : 'en-US')}</span>
                  <span className="block text-[10px] font-mono text-slate-400">ID: {examResult.certificateId}</span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-full border-2 border-dashed border-amber-600/60 flex items-center justify-center text-[9px] font-bold text-amber-700 dark:text-amber-300 uppercase rotate-12">
                    SEAL
                  </div>
                  <div className="text-end">
                    <span className="block font-serif font-black italic text-slate-800 dark:text-slate-200">Tibaa Certification Board</span>
                    <span className="block text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">VERIFIED & ACCREDITED ✓</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

interface ActiveExamRunnerProps {
  targetText: string;
  durationSeconds: number;
  settings: UserSettings;
  onTimeUp: (stats: any) => void;
  onComplete: (stats: any) => void;
}

const ActiveExamRunner: React.FC<ActiveExamRunnerProps> = ({
  targetText,
  durationSeconds,
  settings,
  onTimeUp,
  onComplete,
}) => {
  const [secondsRemaining, setSecondsRemaining] = useState<number>(durationSeconds);

  const engine = useTypingEngine({
    targetText,
    typingMode: 'strict',
    timeLimitSeconds: durationSeconds,
    soundEnabled: settings.soundEnabled,
    keyPressSound: settings.keyPressSound,
    errorSound: settings.errorSound,
    onComplete: (completedStats) => {
      onComplete(completedStats);
    },
  });

  const engineRef = useRef(engine);
  engineRef.current = engine;

  // Countdown timer
  useEffect(() => {
    const interval = window.setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          onTimeUp({
            wpm: engineRef.current.wpm,
            cpm: engineRef.current.cpm,
            accuracy: engineRef.current.accuracy,
            totalKeystrokes: engineRef.current.totalKeystrokes,
            correctCharsCount: engineRef.current.correctCharsCount,
            incorrectCharsCount: engineRef.current.incorrectCharsCount,
          });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [durationSeconds, onTimeUp]);

  const currentMatch = engine.nextChar ? findKeyForChar(engine.nextChar) : null;

  return (
    <div className="space-y-4">
      {/* Live Timer & Stats Header */}
      <div className="flex items-center justify-between p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20">
        <div className="flex items-center gap-2">
          <Timer className="w-5 h-5 text-amber-600 dark:text-amber-400 animate-pulse" />
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
            {settings.language === 'ar' ? 'الوقت المتبقي:' : 'Time Left:'}
          </span>
          <span className="text-base font-black font-mono text-amber-700 dark:text-amber-400">
            {secondsRemaining}s
          </span>
        </div>

        <div className="flex items-center gap-4 text-xs font-bold">
          <span className="text-slate-600 dark:text-slate-300">
            WPM: <strong className="text-slate-900 dark:text-white">{engine.wpm}</strong>
          </span>
          <span className="text-slate-600 dark:text-slate-300">
            Accuracy: <strong className="text-emerald-600 dark:text-emerald-400">{engine.accuracy}%</strong>
          </span>
        </div>
      </div>

      {/* Typing Display */}
      <LessonTypingArea
        targetText={targetText}
        typedText={engine.typedText}
        charStatuses={engine.charStatuses}
        wpm={engine.wpm}
        accuracy={engine.accuracy}
        errors={engine.incorrectCharsCount}
        elapsedSeconds={engine.elapsedSeconds}
        remainingSeconds={secondsRemaining}
        progressPercent={engine.progressPercent}
        isFinished={engine.isFinished || secondsRemaining === 0}
        typingMode="strict"
        fontSize={settings.fontSize}
        lang={settings.language}
        currentIndex={engine.currentIndex}
        onKeyPress={engine.handleKeyPress}
        onPhysicalKeyDown={engine.handlePhysicalKeyDown}
        onVirtualInput={engine.handleVirtualInput}
        onBackspace={engine.handleBackspace}
        onRestart={engine.resetEngine}
      />

      {/* Keyboard Guide */}
      {settings.showKeyboard && (
        <div className="pt-2">
          <KeyboardVisualizer
            currentMatch={currentMatch}
            wrongKeyId={engine.strictErrorChar ? findKeyForChar(engine.strictErrorChar)?.keyDef.id : null}
            wrongChar={engine.wrongChar}
            expectedChar={engine.nextChar}
            onKeyClick={engine.handleKeyPress}
            showFingerColors={true}
            lang={settings.language}
          />
        </div>
      )}
    </div>
  );
};
