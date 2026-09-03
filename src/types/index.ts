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

export interface UserSettings {
  language: Language;
  theme: ThemeMode;
  keyboardLayout: 'arabic-101';
  typingMode: TypingMode;
  soundEnabled: boolean;
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
