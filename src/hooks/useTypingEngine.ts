import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { TypingMode } from '../types';
import { soundService } from '../services/soundService';
import {
  TypingInputController,
  TypingEngineStats,
  CharStatus,
  segmentArabicText,
} from '../services/typingInputController';

export interface UseTypingEngineProps {
  targetText: string;
  typingMode?: TypingMode;
  timeLimitSeconds?: number; // 0 for untimed
  soundEnabled?: boolean;
  keyPressSound?: boolean;
  errorSound?: boolean;
  onComplete?: (stats: TypingEngineStats) => void;
  onTick?: (stats: TypingEngineStats) => void;
}

export type { TypingEngineStats, CharStatus };

export function useTypingEngine({
  targetText,
  typingMode = 'normal',
  timeLimitSeconds = 0,
  soundEnabled = true,
  keyPressSound = true,
  errorSound = true,
  onComplete,
  onTick,
}: UseTypingEngineProps) {
  // Reference to sound settings to avoid stale closures in callbacks
  const soundSettingsRef = useRef({ soundEnabled, keyPressSound, errorSound });
  useEffect(() => {
    soundSettingsRef.current = { soundEnabled, keyPressSound, errorSound };
  }, [soundEnabled, keyPressSound, errorSound]);

  const onCompleteRef = useRef(onComplete);
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  const onTickRef = useRef(onTick);
  useEffect(() => {
    onTickRef.current = onTick;
  }, [onTick]);

  // Create Controller instance
  const controllerRef = useRef<TypingInputController | null>(null);
  const [wrongChar, setWrongChar] = useState<string | null>(null);

  // Synchronized React state representing the controller state
  const [stats, setStats] = useState<TypingEngineStats>(() => {
    const initialController = new TypingInputController({
      targetText,
      typingMode,
      timeLimitSeconds,
      onComplete: (completedStats) => {
        if (onCompleteRef.current) {
          onCompleteRef.current(completedStats);
        }
      },
      onCharacterAccepted: (res) => {
        if (res.isMatch) {
          setWrongChar(null);
        }
        if (res.isMatch && soundSettingsRef.current.soundEnabled && soundSettingsRef.current.keyPressSound) {
          soundService.playKeyClick();
        }
      },
      onError: (_expected, actual) => {
        setWrongChar(actual || null);
        if (soundSettingsRef.current.soundEnabled && soundSettingsRef.current.errorSound) {
          soundService.playError();
        }
      },
    });
    controllerRef.current = initialController;
    return initialController.getStats();
  });

  const timerIntervalRef = useRef<number | null>(null);

  // Re-sync stats from controller
  const syncStats = useCallback(() => {
    if (controllerRef.current) {
      const currentStats = controllerRef.current.getStats();
      setStats(currentStats);
      if (onTickRef.current) {
        onTickRef.current(currentStats);
      }
    }
  }, []);

  // Timer interval handler
  const startTimer = useCallback(() => {
    if (timerIntervalRef.current) return;

    timerIntervalRef.current = window.setInterval(() => {
      if (!controllerRef.current) return;
      if (controllerRef.current.isLessonFinished()) {
        if (timerIntervalRef.current) {
          clearInterval(timerIntervalRef.current);
          timerIntervalRef.current = null;
        }
        return;
      }

      controllerRef.current.tick(1);
      syncStats();
    }, 1000);
  }, [syncStats]);

  // Initialize or reset when targetText or typingMode changes
  useEffect(() => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }

    const controller = new TypingInputController({
      targetText,
      typingMode,
      timeLimitSeconds,
      onComplete: (completedStats) => {
        if (timerIntervalRef.current) {
          clearInterval(timerIntervalRef.current);
          timerIntervalRef.current = null;
        }
        setStats(completedStats);
        if (onCompleteRef.current) {
          onCompleteRef.current(completedStats);
        }
      },
      onCharacterAccepted: (res) => {
        if (res.isMatch) {
          setWrongChar(null);
        }
        if (res.isMatch && soundSettingsRef.current.soundEnabled && soundSettingsRef.current.keyPressSound) {
          soundService.playKeyClick();
        }
      },
      onError: (_expected, actual) => {
        setWrongChar(actual || null);
        if (soundSettingsRef.current.soundEnabled && soundSettingsRef.current.errorSound) {
          soundService.playError();
        }
      },
    });

    controllerRef.current = controller;
    setStats(controller.getStats());
    setWrongChar(null);

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    };
  }, [targetText, typingMode, timeLimitSeconds]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, []);

  // Reset engine manually
  const resetEngine = useCallback(() => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    setWrongChar(null);
    if (controllerRef.current) {
      controllerRef.current.reset(targetText, typingMode);
      setStats(controllerRef.current.getStats());
    }
  }, [targetText, typingMode]);

  // Finish session manually
  const finishSession = useCallback(() => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    if (controllerRef.current) {
      controllerRef.current.finish();
      setStats(controllerRef.current.getStats());
    }
  }, []);

  // Handle single character press (from visual keyboard click or direct call)
  const handleKeyPress = useCallback(
    (char: string) => {
      if (!controllerRef.current || controllerRef.current.isLessonFinished()) return;
      const wasStarted = controllerRef.current.getStats().isStarted;

      controllerRef.current.processCharacterInput(char, 'click');

      if (!wasStarted) {
        startTimer();
      }
      syncStats();
    },
    [startTimer, syncStats]
  );

  // Handle physical keydown
  const handlePhysicalKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (!controllerRef.current || controllerRef.current.isLessonFinished()) return;
      const wasStarted = controllerRef.current.getStats().isStarted;

      const res = controllerRef.current.handlePhysicalKeyboardInput({
        key: e.key,
        code: e.code,
        shiftKey: e.shiftKey,
        ctrlKey: e.ctrlKey,
        metaKey: e.metaKey,
        altKey: e.altKey,
        repeat: e.repeat,
        preventDefault: () => e.preventDefault(),
      });

      if (res.handled) {
        if (!wasStarted) {
          startTimer();
        }
        syncStats();
      }
    },
    [startTimer, syncStats]
  );

  // Handle virtual keyboard input (Android Chrome / iOS text input)
  const handleVirtualInput = useCallback(
    (text: string) => {
      if (!controllerRef.current || controllerRef.current.isLessonFinished()) return;
      if (!text) return;
      const wasStarted = controllerRef.current.getStats().isStarted;

      controllerRef.current.handleVirtualKeyboardInput(text);

      if (!wasStarted) {
        startTimer();
      }
      syncStats();
    },
    [startTimer, syncStats]
  );

  // Handle backspace
  const handleBackspace = useCallback(() => {
    if (!controllerRef.current || controllerRef.current.isLessonFinished()) return;
    const handled = controllerRef.current.handleBackspace('virtual');
    if (handled) {
      syncStats();
    }
  }, [syncStats]);

  const targetCharacters = useMemo(() => {
    return segmentArabicText(targetText);
  }, [targetText]);

  const nextChar = targetCharacters[stats.currentIndex] || '';

  return {
    targetText,
    targetCharacters,
    typedText: stats.typedText,
    currentIndex: stats.currentIndex,
    nextChar,
    charStatuses: stats.charStatuses,
    strictErrorChar: stats.strictErrorChar,
    isStarted: stats.isStarted,
    isFinished: stats.isFinished,
    elapsedSeconds: stats.elapsedSeconds,
    remainingSeconds: stats.remainingSeconds,
    totalKeystrokes: stats.totalKeystrokes,
    backspacesCount: stats.backspacesCount,
    correctCharsCount: stats.correctCharsCount,
    incorrectCharsCount: stats.incorrectCharsCount,
    wpm: stats.wpm,
    cpm: stats.cpm,
    accuracy: stats.accuracy,
    progressPercent: stats.progressPercent,
    mistakeChars: stats.mistakeChars,
    wrongChar,
    handleKeyPress,
    handlePhysicalKeyDown,
    handleVirtualInput,
    handleBackspace,
    resetEngine,
    finishSession,
  };
}
