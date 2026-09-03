import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  AlertCircle,
  Award,
  CheckCircle2,
  Clock,
  Play,
  RotateCcw,
  Sparkles,
  Target,
  Timer,
  Trophy,
  Zap,
} from 'lucide-react';
import { TYPING_TESTS } from '../data/tests';
import { useTypingEngine } from '../hooks/useTypingEngine';
import { soundService } from '../services/soundService';
import { StorageService } from '../services/storageService';
import { Language, TypingTestDuration, TypingTestItem, UserSettings } from '../types';
import { LessonTypingArea } from '../components/LessonTypingArea';
import { getTranslation } from '../data/translations';

interface TestPageProps {
  settings: UserSettings;
  onGoToDashboard: () => void;
}

export const TestPage: React.FC<TestPageProps> = ({ settings, onGoToDashboard }) => {
  const [selectedDuration, setSelectedDuration] = useState<TypingTestDuration>(60);
  const [selectedDifficulty, setSelectedDifficulty] = useState<'all' | 'easy' | 'medium' | 'hard'>('all');
  const [selectedTestId, setSelectedTestId] = useState<string>(TYPING_TESTS[0].id);
  const [isTestActive, setIsTestActive] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<{
    wpm: number;
    cpm: number;
    accuracy: number;
    errors: number;
    totalKeystrokes: number;
    timeSeconds: number;
  } | null>(null);

  const t = (key: string) => getTranslation(settings.language, key);

  // Available tests
  const availableTests = TYPING_TESTS.filter(
    (item) => selectedDifficulty === 'all' || item.difficulty === selectedDifficulty
  );

  const activeTest = TYPING_TESTS.find((item) => item.id === selectedTestId) || TYPING_TESTS[0];

  // Typing Engine
  const {
    targetText,
    typedText,
    charStatuses,
    wpm,
    cpm,
    accuracy,
    incorrectCharsCount,
    totalKeystrokes,
    elapsedSeconds,
    remainingSeconds,
    progressPercent,
    isFinished,
    currentIndex,
    handleKeyPress,
    handlePhysicalKeyDown,
    handleVirtualInput,
    handleBackspace,
    resetEngine,
  } = useTypingEngine({
    targetText: activeTest.text,
    typingMode: 'normal',
    timeLimitSeconds: selectedDuration,
    soundEnabled: settings.soundEnabled,
    keyPressSound: settings.keyPressSound,
    errorSound: settings.errorSound,
    onComplete: (stats) => {
      // Finish test
      soundService.playCompletion();

      try {
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.6 },
        });
      } catch {
        // ignore
      }

      // Record to storage
      StorageService.addSession({
        id: 'test-' + Date.now(),
        type: 'test',
        title: `اختبار ${selectedDuration} ثانية`,
        date: new Date().toISOString(),
        wpm: stats.wpm,
        cpm: stats.cpm,
        accuracy: stats.accuracy,
        errors: stats.incorrectCharsCount,
        totalKeystrokes: stats.totalKeystrokes,
        durationSeconds: stats.elapsedSeconds,
        mistakeChars: stats.mistakeChars,
        mistakeCount: stats.incorrectCharsCount,
        mode: 'test',
      });
      StorageService.recordMistakes(stats.mistakeChars);
      StorageService.addPracticeTime(stats.elapsedSeconds, settings.dailyGoalMinutes);

      // Check achievements
      const allSessions = StorageService.getSessions();
      const testCount = allSessions.filter((s) => s.type === 'test' || s.mode === 'test').length;
      StorageService.checkAndUnlockAchievements({
        wpm: stats.wpm,
        accuracy: stats.accuracy,
        totalTests: testCount,
      });

      setTestResult({
        wpm: stats.wpm,
        cpm: stats.cpm,
        accuracy: stats.accuracy,
        errors: stats.incorrectCharsCount,
        totalKeystrokes: stats.totalKeystrokes,
        timeSeconds: stats.elapsedSeconds,
      });
    },
  });

  const handleStartTest = () => {
    resetEngine();
    setTestResult(null);
    setIsTestActive(true);
  };

  const handleRestart = () => {
    resetEngine();
    setTestResult(null);
  };

  // Speed rank evaluation
  const getSpeedRank = (speedWpm: number) => {
    if (speedWpm >= 70) return { title: t('rankMaster'), color: 'text-amber-500', desc: t('rankMasterDesc') };
    if (speedWpm >= 50) return { title: t('rankPro'), color: 'text-emerald-500', desc: t('rankProDesc') };
    if (speedWpm >= 35) return { title: t('rankFluent'), color: 'text-blue-500', desc: t('rankFluentDesc') };
    if (speedWpm >= 20) return { title: t('rankIntermediate'), color: 'text-teal-500', desc: t('rankIntermediateDesc') };
    return { title: t('rankNovice'), color: 'text-slate-500', desc: t('rankNoviceDesc') };
  };

  const getDurationLabel = (sec: number) => {
    if (settings.language === 'en') {
      if (sec === 30) return '30 Seconds (Quick)';
      if (sec === 60) return '1 Minute (Standard)';
      if (sec === 120) return '2 Minutes (Medium)';
      return '5 Minutes (Marathon)';
    }
    if (settings.language === 'bn') {
      if (sec === 30) return '৩০ সেকেন্ড (দ্রুত)';
      if (sec === 60) return '১ মিনিট (স্ট্যান্ডার্ড)';
      if (sec === 120) return '২ মিনিট (মাঝারি)';
      return '৫ মিনিট (ম্যারাথন)';
    }
    if (sec === 30) return '30 ثانية (سريع)';
    if (sec === 60) return 'دقيقة واحدة (قياسي)';
    if (sec === 120) return 'دقيقتان (متوسط)';
    return '5 دقائق (ماراثون)';
  };

  const getDifficultyLabel = (diff: string) => {
    if (diff === 'all') return t('diffAll');
    if (diff === 'easy') return t('diffEasy');
    if (diff === 'medium') return t('diffMedium');
    return t('diffHard');
  };

  const getAssessmentBadge = () => {
    if (settings.language === 'en') return 'Official Speed Assessment';
    if (settings.language === 'bn') return 'অফিসিয়াল গতি মূল্যায়ন';
    return 'اختبار قياس السرعة الدقيق';
  };

  const getTestSubHeader = () => {
    if (settings.language === 'en') {
      return 'Measure your true typing velocity (WPM), character accuracy, and keystroke rhythm under a timed test.';
    }
    if (settings.language === 'bn') {
      return 'সময় নির্ধারিত পরীক্ষার মাধ্যমে আপনার বাস্তব আরবি টাইপিং গতি (WPM), নির্ভুলতা ও ছন্দ পরিমাপ করুন।';
    }
    return 'قم بقياس سرعتك الحقيقية بالكلمة في الدقيقة (WPM) والدقة المئوية بالأحرف تحت ضغط الوقت لاختبار مهاراتك الفعلية.';
  };

  const getTestTitle = (item: TypingTestItem) => {
    if (settings.language === 'bn' && item.titleBn) return item.titleBn;
    if (settings.language === 'en') return item.titleEn;
    return item.titleAr;
  };

  return (
    <div id="typing-test-view" className="space-y-6 pb-16">
      {/* Header */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-3xl p-6 sm:p-8 shadow-lg border border-slate-800">
        <div className="max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold">
            <Timer className="w-3.5 h-3.5" />
            <span>{getAssessmentBadge()}</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black font-['Noto_Naskh_Arabic','Alexandria',sans-serif]">
            {t('navTest')}
          </h2>

          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
            {getTestSubHeader()}
          </p>
        </div>
      </div>

      {/* Test Setup Form (When not actively typing or when viewing results) */}
      {!isTestActive && !testResult && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
          {/* Duration Selector */}
          <div>
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-2.5 block">
              {t('selectDuration')}
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { sec: 30 as TypingTestDuration },
                { sec: 60 as TypingTestDuration },
                { sec: 120 as TypingTestDuration },
                { sec: 300 as TypingTestDuration },
              ].map((item) => (
                <button
                  key={`dur-${item.sec}`}
                  type="button"
                  onClick={() => setSelectedDuration(item.sec)}
                  className={`py-3 px-4 rounded-2xl border text-xs font-bold transition-all cursor-pointer ${
                    selectedDuration === item.sec
                      ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 ring-2 ring-emerald-500/20 shadow-xs'
                      : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <Clock className="w-4 h-4 mx-auto mb-1 opacity-70" />
                  <span>{getDurationLabel(item.sec)}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Difficulty & Text Selector */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400">
                {t('selectDifficulty')}
              </label>
              <div className="flex gap-1.5">
                {(['all', 'easy', 'medium', 'hard'] as const).map((diff) => (
                  <button
                    key={`diff-${diff}`}
                    type="button"
                    onClick={() => setSelectedDifficulty(diff)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold cursor-pointer ${
                      selectedDifficulty === diff
                        ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                        : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    {getDifficultyLabel(diff)}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {availableTests.map((item) => {
                const isSelected = selectedTestId === item.id;
                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedTestId(item.id)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/40 ring-2 ring-emerald-500/20'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                          {getTestTitle(item)}
                        </h4>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 font-semibold text-slate-500">
                          {getDifficultyLabel(item.difficulty)}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-['Noto_Naskh_Arabic',sans-serif] line-clamp-2">
                        {item.text}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Start Test Action */}
          <div className="pt-4 flex justify-center">
            <button
              type="button"
              id="begin-timed-test-btn"
              onClick={handleStartTest}
              className="py-4 px-8 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-bold text-base shadow-xl shadow-emerald-500/25 transition-all flex items-center gap-3 cursor-pointer"
            >
              <Play className="w-5 h-5 fill-white" />
              <span>{t('startTestNow')}</span>
            </button>
          </div>
        </div>
      )}

      {/* Active Test Screen */}
      {isTestActive && !testResult && (
        <div className="space-y-4">
          <div className="flex items-center justify-between px-2 text-xs text-slate-500">
            <span>
              {t('timedTest')}{' '}
              <strong className="text-slate-800 dark:text-slate-200">{getTestTitle(activeTest)}</strong>
            </span>
            <button
              type="button"
              onClick={() => {
                setIsTestActive(false);
                resetEngine();
              }}
              className="text-rose-500 hover:underline font-semibold cursor-pointer"
            >
              {t('cancelTest')}
            </button>
          </div>

          <LessonTypingArea
            targetText={targetText}
            typedText={typedText}
            charStatuses={charStatuses}
            wpm={wpm}
            accuracy={accuracy}
            errors={incorrectCharsCount}
            elapsedSeconds={elapsedSeconds}
            remainingSeconds={remainingSeconds}
            progressPercent={progressPercent}
            isFinished={isFinished}
            typingMode="normal"
            fontSize={settings.fontSize}
            lang={settings.language}
            currentIndex={currentIndex}
            onKeyPress={handleKeyPress}
            onPhysicalKeyDown={handlePhysicalKeyDown}
            onVirtualInput={handleVirtualInput}
            onBackspace={handleBackspace}
            onRestart={handleRestart}
          />
        </div>
      )}

      {/* Test Results Report Card */}
      {testResult && (
        <div
          id="test-results-report"
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-10 shadow-xl text-center space-y-6 animate-in zoom-in-95"
        >
          <div className="w-16 h-16 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-500 mx-auto flex items-center justify-center shadow-inner">
            <Trophy className="w-8 h-8" />
          </div>

          <div>
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 font-['Noto_Naskh_Arabic','Alexandria',sans-serif]">
              {t('testResultsTitle')}
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              {getTestTitle(activeTest)} ({testResult.timeSeconds} {t('seconds')})
            </p>
          </div>

          {/* Speed Rank Banner */}
          {(() => {
            const rank = getSpeedRank(testResult.wpm);
            return (
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 max-w-md mx-auto">
                <span className="text-xs font-semibold text-slate-400">{t('speedRank')}</span>
                <h4 className={`text-lg font-bold ${rank.color} mt-0.5`}>{rank.title}</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{rank.desc}</p>
              </div>
            );
          })()}

          {/* Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 max-w-2xl mx-auto">
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900 flex flex-col items-center">
              <span className="text-xs text-emerald-700 dark:text-emerald-300 font-semibold flex items-center gap-1">
                <Zap className="w-3.5 h-3.5" />
                {t('wpm')}
              </span>
              <span className="text-3xl font-black font-mono text-emerald-600 dark:text-emerald-400 mt-1">
                {testResult.wpm}
              </span>
              <span className="text-[10px] text-emerald-600/70">{t('wordsPerMinuteUnit')}</span>
            </div>

            <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900 flex flex-col items-center">
              <span className="text-xs text-blue-700 dark:text-blue-300 font-semibold flex items-center gap-1">
                <Target className="w-3.5 h-3.5" />
                {t('accuracy')}
              </span>
              <span className="text-3xl font-black font-mono text-blue-600 dark:text-blue-400 mt-1">
                {testResult.accuracy}%
              </span>
              <span className="text-[10px] text-blue-600/70">{testResult.errors} {t('errors')}</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex flex-col items-center">
              <span className="text-xs text-slate-500 font-semibold">{t('cpm')}</span>
              <span className="text-3xl font-black font-mono text-slate-800 dark:text-slate-200 mt-1">
                {testResult.cpm}
              </span>
              <span className="text-[10px] text-slate-400">{t('charsPerMinuteUnit')}</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex flex-col items-center">
              <span className="text-xs text-slate-500 font-semibold">{t('totalKeystrokes')}</span>
              <span className="text-3xl font-black font-mono text-slate-800 dark:text-slate-200 mt-1">
                {testResult.totalKeystrokes}
              </span>
              <span className="text-[10px] text-slate-400">{t('keystrokesUnit')}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap justify-center gap-3 pt-4">
            <button
              type="button"
              onClick={handleStartTest}
              className="py-3 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-bold text-sm shadow-md transition-all flex items-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>{t('retakeTest')}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setTestResult(null);
                setIsTestActive(false);
              }}
              className="py-3 px-6 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-sm transition-all cursor-pointer"
            >
              <span>{t('chooseOtherText')}</span>
            </button>

            <button
              type="button"
              onClick={onGoToDashboard}
              className="py-3 px-6 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-sm transition-all cursor-pointer"
            >
              <span>{t('navHome')}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
