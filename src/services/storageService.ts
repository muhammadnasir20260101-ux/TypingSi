import { 
  Achievement, 
  DailyGoalProgress, 
  LessonProgress, 
  StreakData, 
  TypingMistake, 
  TypingSessionResult, 
  UserProfile, 
  UserSettings 
} from '../types';
import { INITIAL_ACHIEVEMENTS } from '../data/achievements';

const KEYS = {
  SETTINGS: 'tibaa_user_settings_v1',
  PROFILE: 'tibaa_user_profile_v1',
  LESSONS: 'tibaa_lesson_progress_v1',
  SESSIONS: 'tibaa_typing_sessions_v1',
  MISTAKES: 'tibaa_typing_mistakes_v1',
  DAILY_GOAL: 'tibaa_daily_goal_v1',
  STREAK: 'tibaa_streak_data_v1',
  ACHIEVEMENTS: 'tibaa_achievements_v1',
  ONBOARDING: 'tibaa_onboarding_completed_v1',
  CURRENT_LESSON: 'tibaa_current_lesson_id_v1',
};

export const DEFAULT_SETTINGS: UserSettings = {
  language: 'ar',
  theme: 'light',
  keyboardLayout: 'arabic-101',
  typingMode: 'normal',
  soundEnabled: true,
  keyPressSound: true,
  errorSound: true,
  completionSound: true,
  showKeyboard: true,
  showFingerGuide: true,
  fontSize: 'medium',
  dailyGoalMinutes: 10,
};

export const DEFAULT_PROFILE: UserProfile = {
  id: 'user-' + Math.random().toString(36).substring(2, 9),
  name: 'المتعلم العربي',
  avatar: '🚀',
  joinedDate: new Date().toISOString().split('T')[0],
  level: 1,
};

function getTodayString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getYesterdayString(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export class StorageService {
  // Settings
  static getSettings(): UserSettings {
    try {
      const data = localStorage.getItem(KEYS.SETTINGS);
      if (data) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(data) };
      }
    } catch {
      // fallback
    }
    return DEFAULT_SETTINGS;
  }

  static saveSettings(settings: UserSettings): void {
    try {
      localStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
    } catch {
      // ignore
    }
  }

  // Profile
  static getProfile(): UserProfile {
    try {
      const data = localStorage.getItem(KEYS.PROFILE);
      if (data) {
        return { ...DEFAULT_PROFILE, ...JSON.parse(data) };
      }
    } catch {
      // fallback
    }
    return DEFAULT_PROFILE;
  }

  static saveProfile(profile: UserProfile): void {
    try {
      localStorage.setItem(KEYS.PROFILE, JSON.stringify(profile));
    } catch {
      // ignore
    }
  }

  // Current Lesson ID
  static getCurrentLessonId(): string {
    try {
      const val = localStorage.getItem(KEYS.CURRENT_LESSON);
      if (val) return val;
    } catch {
      // ignore
    }
    return 'l-1-1';
  }

  static setCurrentLessonId(lessonId: string): void {
    try {
      localStorage.setItem(KEYS.CURRENT_LESSON, lessonId);
    } catch {
      // ignore
    }
  }

  // Onboarding
  static isOnboardingCompleted(): boolean {
    try {
      return localStorage.getItem(KEYS.ONBOARDING) === 'true';
    } catch {
      return false;
    }
  }

  static setOnboardingCompleted(completed: boolean): void {
    try {
      localStorage.setItem(KEYS.ONBOARDING, completed ? 'true' : 'false');
    } catch {
      // ignore
    }
  }

  // Lesson Progress
  static getLessonProgressMap(): Record<string, LessonProgress> {
    try {
      const data = localStorage.getItem(KEYS.LESSONS);
      if (data) {
        return JSON.parse(data);
      }
    } catch {
      // fallback
    }
    return {};
  }

  static saveLessonResult(
    lessonId: string, 
    wpm: number, 
    accuracy: number, 
    stars: number
  ): Record<string, LessonProgress> {
    const map = this.getLessonProgressMap();
    const existing = map[lessonId];
    const today = getTodayString();

    const progress: LessonProgress = {
      lessonId,
      completed: true,
      bestWpm: existing ? Math.max(existing.bestWpm, wpm) : wpm,
      bestAccuracy: existing ? Math.max(existing.bestAccuracy, accuracy) : accuracy,
      stars: existing ? Math.max(existing.stars, stars) : stars,
      attempts: existing ? existing.attempts + 1 : 1,
      lastAttemptDate: today,
    };

    map[lessonId] = progress;
    try {
      localStorage.setItem(KEYS.LESSONS, JSON.stringify(map));
    } catch {
      // ignore
    }

    // Update level if needed
    const completedCount = Object.values(map).filter(p => p.completed).length;
    const currentProfile = this.getProfile();
    const newLevel = Math.max(1, Math.min(12, Math.floor(completedCount / 3) + 1));
    if (newLevel !== currentProfile.level) {
      this.saveProfile({ ...currentProfile, level: newLevel });
    }

    return map;
  }

  // Sessions History
  static getSessions(): TypingSessionResult[] {
    try {
      const data = localStorage.getItem(KEYS.SESSIONS);
      if (data) {
        return JSON.parse(data);
      }
    } catch {
      // fallback
    }
    return [];
  }

  static addSession(session: TypingSessionResult): TypingSessionResult[] {
    const sessions = this.getSessions();
    sessions.unshift(session); // Add to beginning
    // Cap at last 100 sessions to keep storage fast & lean
    const trimmed = sessions.slice(0, 100);
    try {
      localStorage.setItem(KEYS.SESSIONS, JSON.stringify(trimmed));
    } catch {
      // ignore
    }
    return trimmed;
  }

  // Mistakes Tracking
  static getMistakesMap(): Record<string, TypingMistake> {
    try {
      const data = localStorage.getItem(KEYS.MISTAKES);
      if (data) {
        return JSON.parse(data);
      }
    } catch {
      // fallback
    }
    return {};
  }

  static recordMistakes(mistakes: Record<string, number>): Record<string, TypingMistake> {
    const map = this.getMistakesMap();
    const today = getTodayString();

    for (const [char, count] of Object.entries(mistakes)) {
      if (!char || char === ' ' || count <= 0) continue;
      if (map[char]) {
        map[char].count += count;
        map[char].lastMistakeDate = today;
      } else {
        map[char] = {
          char,
          count,
          lastMistakeDate: today,
        };
      }
    }

    try {
      localStorage.setItem(KEYS.MISTAKES, JSON.stringify(map));
    } catch {
      // ignore
    }
    return map;
  }

  // Daily Goal
  static getDailyGoalProgress(): DailyGoalProgress {
    const today = getTodayString();
    try {
      const data = localStorage.getItem(KEYS.DAILY_GOAL);
      if (data) {
        const parsed: DailyGoalProgress = JSON.parse(data);
        if (parsed.date === today) {
          return parsed;
        }
      }
    } catch {
      // fallback
    }
    return {
      date: today,
      minutesPracticed: 0,
      completed: false,
    };
  }

  static addPracticeTime(seconds: number, targetMinutes: number): DailyGoalProgress {
    const current = this.getDailyGoalProgress();
    const addedMinutes = seconds / 60;
    const newMinutes = +(current.minutesPracticed + addedMinutes).toFixed(1);
    const completed = newMinutes >= targetMinutes;

    const updated: DailyGoalProgress = {
      date: current.date,
      minutesPracticed: newMinutes,
      completed,
    };

    try {
      localStorage.setItem(KEYS.DAILY_GOAL, JSON.stringify(updated));
    } catch {
      // ignore
    }

    // Also update Streak
    this.updateStreak();

    return updated;
  }

  // Streak Tracking (consecutive days without duplicate on same day)
  static getStreakData(): StreakData {
    try {
      const data = localStorage.getItem(KEYS.STREAK);
      if (data) {
        return JSON.parse(data);
      }
    } catch {
      // fallback
    }
    return {
      currentStreak: 0,
      longestStreak: 0,
      lastPracticeDate: '',
      practiceDates: [],
    };
  }

  static updateStreak(): StreakData {
    const streak = this.getStreakData();
    const today = getTodayString();
    const yesterday = getYesterdayString();

    if (streak.lastPracticeDate === today) {
      // Already recorded for today, nothing to change
      return streak;
    }

    let newCurrentStreak = 1;
    if (streak.lastPracticeDate === yesterday) {
      newCurrentStreak = streak.currentStreak + 1;
    } else if (streak.lastPracticeDate === '') {
      newCurrentStreak = 1;
    } else {
      // Missed at least one day, reset to 1
      newCurrentStreak = 1;
    }

    const newLongest = Math.max(streak.longestStreak, newCurrentStreak);
    const updatedDates = Array.from(new Set([...streak.practiceDates, today]));

    const updatedStreak: StreakData = {
      currentStreak: newCurrentStreak,
      longestStreak: newLongest,
      lastPracticeDate: today,
      practiceDates: updatedDates,
    };

    try {
      localStorage.setItem(KEYS.STREAK, JSON.stringify(updatedStreak));
    } catch {
      // ignore
    }

    return updatedStreak;
  }

  // Achievements
  static getAchievements(): Achievement[] {
    try {
      const data = localStorage.getItem(KEYS.ACHIEVEMENTS);
      if (data) {
        const stored: Achievement[] = JSON.parse(data);
        // Merge with initial list in case new achievements were added
        return INITIAL_ACHIEVEMENTS.map(initial => {
          const match = stored.find(s => s.id === initial.id);
          return match || initial;
        });
      }
    } catch {
      // fallback
    }
    return INITIAL_ACHIEVEMENTS;
  }

  static checkAndUnlockAchievements(params: {
    wpm?: number;
    accuracy?: number;
    totalLessons?: number;
    totalTests?: number;
    streak?: number;
    practiceTimeMinutes?: number;
  }): Achievement[] {
    const list = this.getAchievements();
    const today = getTodayString();
    let hasChanged = false;

    const updated = list.map(item => {
      if (item.unlocked) return item;

      let newProgress = item.progress;
      let shouldUnlock = false;

      switch (item.id) {
        case 'first-lesson':
          if (params.totalLessons && params.totalLessons >= 1) {
            newProgress = 1;
            shouldUnlock = true;
          }
          break;
        case 'lessons-10':
          if (params.totalLessons !== undefined) {
            newProgress = Math.min(item.maxProgress, params.totalLessons);
            if (newProgress >= item.maxProgress) shouldUnlock = true;
          }
          break;
        case 'speed-30':
          if (params.wpm !== undefined) {
            newProgress = Math.max(newProgress, Math.min(item.maxProgress, Math.round(params.wpm)));
            if (params.wpm >= 30) shouldUnlock = true;
          }
          break;
        case 'speed-50':
          if (params.wpm !== undefined) {
            newProgress = Math.max(newProgress, Math.min(item.maxProgress, Math.round(params.wpm)));
            if (params.wpm >= 50) shouldUnlock = true;
          }
          break;
        case 'acc-90':
          if (params.accuracy !== undefined) {
            newProgress = Math.max(newProgress, Math.min(item.maxProgress, Math.round(params.accuracy)));
            if (params.accuracy >= 90) shouldUnlock = true;
          }
          break;
        case 'acc-95':
          if (params.accuracy !== undefined) {
            newProgress = Math.max(newProgress, Math.min(item.maxProgress, Math.round(params.accuracy)));
            if (params.accuracy >= 95) shouldUnlock = true;
          }
          break;
        case 'acc-100':
          if (params.accuracy !== undefined) {
            newProgress = Math.max(newProgress, Math.min(item.maxProgress, Math.round(params.accuracy)));
            if (params.accuracy >= 100) shouldUnlock = true;
          }
          break;
        case 'streak-7':
          if (params.streak !== undefined) {
            newProgress = Math.min(item.maxProgress, params.streak);
            if (newProgress >= 7) shouldUnlock = true;
          }
          break;
        case 'streak-30':
          if (params.streak !== undefined) {
            newProgress = Math.min(item.maxProgress, params.streak);
            if (newProgress >= 30) shouldUnlock = true;
          }
          break;
        case 'time-60m':
          if (params.practiceTimeMinutes !== undefined) {
            newProgress = Math.min(item.maxProgress, Math.round(params.practiceTimeMinutes));
            if (newProgress >= 60) shouldUnlock = true;
          }
          break;
        case 'tests-10':
          if (params.totalTests !== undefined) {
            newProgress = Math.min(item.maxProgress, params.totalTests);
            if (newProgress >= 10) shouldUnlock = true;
          }
          break;
      }

      if (shouldUnlock || newProgress !== item.progress) {
        hasChanged = true;
        return {
          ...item,
          progress: newProgress,
          unlocked: shouldUnlock || item.unlocked,
          unlockedDate: shouldUnlock ? today : item.unlockedDate,
        };
      }

      return item;
    });

    if (hasChanged) {
      try {
        localStorage.setItem(KEYS.ACHIEVEMENTS, JSON.stringify(updated));
      } catch {
        // ignore
      }
    }

    return updated;
  }

  // Backup Export/Import
  static exportAllData(): string {
    const data = {
      version: 1,
      exportedAt: new Date().toISOString(),
      settings: this.getSettings(),
      profile: this.getProfile(),
      lessons: this.getLessonProgressMap(),
      sessions: this.getSessions(),
      mistakes: this.getMistakesMap(),
      dailyGoal: this.getDailyGoalProgress(),
      streak: this.getStreakData(),
      achievements: this.getAchievements(),
    };
    return JSON.stringify(data, null, 2);
  }

  static importData(jsonString: string): boolean {
    try {
      const data = JSON.parse(jsonString);
      if (data.settings) localStorage.setItem(KEYS.SETTINGS, JSON.stringify(data.settings));
      if (data.profile) localStorage.setItem(KEYS.PROFILE, JSON.stringify(data.profile));
      if (data.lessons) localStorage.setItem(KEYS.LESSONS, JSON.stringify(data.lessons));
      if (data.sessions) localStorage.setItem(KEYS.SESSIONS, JSON.stringify(data.sessions));
      if (data.mistakes) localStorage.setItem(KEYS.MISTAKES, JSON.stringify(data.mistakes));
      if (data.dailyGoal) localStorage.setItem(KEYS.DAILY_GOAL, JSON.stringify(data.dailyGoal));
      if (data.streak) localStorage.setItem(KEYS.STREAK, JSON.stringify(data.streak));
      if (data.achievements) localStorage.setItem(KEYS.ACHIEVEMENTS, JSON.stringify(data.achievements));
      return true;
    } catch {
      return false;
    }
  }

  static resetAllProgress(): void {
    try {
      Object.values(KEYS).forEach(k => localStorage.removeItem(k));
    } catch {
      // ignore
    }
  }
}
