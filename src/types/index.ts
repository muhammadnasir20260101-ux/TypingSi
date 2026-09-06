export type Language = 'ar' | 'en' | 'bn';
export type ThemeMode = 'light' | 'dark' | 'system';
export type TypingMode = 'normal' | 'strict';
export type FontSize = 'small' | 'medium' | 'large';

export type FingerName = 
  | 'left-pinky' 
  | 'left-ring' 
  | 'left-middle' 
  | 'left-index' 
  | 'thumb' 
  | 'right-index' 
  | 'right-middle' 
  | 'right-ring' 
  | 'right-pinky';

export interface KeyboardKeyDef {
  id: string;
  code: string; // e.g. "KeyF", "KeyJ"
  labelAr: string; // Arabic character (normal)
  shiftAr?: string; // Arabic character with Shift (e.g. diacritic, alternate)
  labelEn?: string; // English character
  shiftEn?: string;
  finger: FingerName;
  width?: string; // e.g. 'col-span-2' or custom width
  isSpecial?: boolean;
}

export type SoundVolume = 'low' | 'medium' | 'high';

export interface UserSettings {
  language: Language;
  theme: ThemeMode;
  keyboardLayout: 'arabic-101';
  typingMode: TypingMode;
  soundEnabled: boolean;
  soundVolume: SoundVolume;
  keyPressSound: boolean;
  errorSound: boolean;
  completionSound: boolean;
  showKeyboard: boolean;
  showFingerGuide: boolean;
  fontSize: FontSize;
  dailyGoalMinutes: number;
}

export interface UserProfile {
  id: string;
  name: string;
  avatar: string;
  joinedDate: string;
  level: number;
}

export interface DailyGoalProgress {
  date: string; // YYYY-MM-DD
  minutesPracticed: number;
  completed: boolean;
}

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastPracticeDate: string; // YYYY-MM-DD
  practiceDates: string[]; // List of unique YYYY-MM-DD
}

export interface LessonProgress {
  lessonId: string;
  completed: boolean;
  completedPages?: number; // count of completed pages (e.g. 8 out of 12)
  currentPage?: number; // 1-based index of current page (e.g. page 9)
  bestWpm: number;
  bestAccuracy: number;
  stars: number; // 1 - 5
  attempts: number;
  lastAttemptDate: string;
}

export interface TypingMistake {
  char: string;
  count: number;
  lastMistakeDate: string;
}

export interface ProblemKeyRecord {
  char: string;
  totalAttempts: number;
  correctAttempts: number;
  incorrectAttempts: number;
  errorRate: number; // 0 to 1
  accuracy: number; // 0 to 100
  lastMistakeDate: string;
  finger: FingerName;
  status: 'needs-practice' | 'improving' | 'improved';
  initialErrorRate?: number;
  improvementPercent?: number;
}

export type ExamType =
  | 'beginner'
  | 'intermediate'
  | 'final'
  | 'beginner-exam'
  | 'intermediate-exam'
  | 'final-exam';

export type TypingClassification =
  | 'Novice'
  | 'Intermediate'
  | 'Advanced'
  | 'Professional'
  | 'Arabic Typing Expert';

export interface ExamResult {
  examId: ExamType;
  examType?: ExamType;
  titleAr: string;
  titleEn: string;
  titleBn: string;
  passed: boolean;
  wpm: number;
  cpm: number;
  accuracy: number;
  totalChars?: number;
  correctChars?: number;
  incorrectChars?: number;
  totalKeystrokes?: number;
  correctCharacters?: number;
  incorrectCharacters?: number;
  errorCount: number;
  date: string;
  certificateId: string;
  classification: TypingClassification;
  durationSeconds: number;
  timeSpentSeconds?: number;
  consistency?: number;
  studentName?: string;
}

export interface TypingSessionResult {
  id: string;
  type: 'lesson' | 'test' | 'weak-keys' | 'custom';
  title: string;
  date: string;
  wpm: number;
  cpm: number;
  accuracy: number;
  errors: number;
  totalKeystrokes: number;
  durationSeconds: number;
  stars?: number;
  mistakeChars: { [char: string]: number };
  mistakeCount?: number;
  mode?: string;
}

export interface Achievement {
  id: string;
  titleAr: string;
  titleEn: string;
  titleBn: string;
  descAr: string;
  descEn: string;
  descBn: string;
  icon: string;
  unlocked: boolean;
  unlockedDate?: string;
  progress: number;
  maxProgress: number;
  category: 'speed' | 'accuracy' | 'lessons' | 'streak' | 'time' | 'tests';
}

export type LessonDifficulty = 'beginner' | 'easy' | 'medium' | 'hard' | 'advanced';

export type LessonPagePurpose =
  | 'intro'
  | 'position'
  | 'single'
  | 'second'
  | 'alternating'
  | 'repeated'
  | 'combinations'
  | 'mixed'
  | 'words'
  | 'accuracy'
  | 'speed'
  | 'test';

export interface LessonPage {
  pageNumber: number; // 1-based (e.g. 1 to 12)
  titleAr: string;
  titleEn: string;
  titleBn: string;
  instructionAr: string;
  instructionEn: string;
  instructionBn: string;
  targetText: string;
  purpose: LessonPagePurpose;
}

export interface Lesson {
  id: string;
  courseId: string;
  level: number;
  order: number;
  titleAr: string;
  titleEn: string;
  titleBn: string;
  descriptionAr: string;
  descriptionEn: string;
  descriptionBn: string;
  difficulty: LessonDifficulty;
  targetText: string;
  focusKeys: string[];
  newKeys?: [string, string] | string[]; // 2 newly introduced keys
  previouslyLearnedKeys?: string[];
  pages: LessonPage[];
  totalPages: number;
  targetCharacters?: string[];
  estimatedSeconds: number;
}

export interface Course {
  id: string;
  order: number;
  titleAr: string;
  titleEn: string;
  titleBn: string;
  descriptionAr: string;
  descriptionEn: string;
  descriptionBn: string;
  category: string;
  iconName: string;
  lessonIds: string[];
}

export type TestDuration = 30 | 60 | 120 | 300 | 0; // 0 = custom / untimed
export type TypingTestDuration = TestDuration;
export type TestCategory = 
  | 'general' 
  | 'education' 
  | 'literature' 
  | 'news' 
  | 'heritage' 
  | 'words' 
  | 'sentences';

export interface TypingTestItem {
  id: string;
  titleAr: string;
  titleEn: string;
  titleBn?: string;
  category: TestCategory;
  difficulty: LessonDifficulty;
  text: string;
}
