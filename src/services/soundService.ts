// Web Audio API Synthesizer for typing feedback
// Works 100% offline without external audio files

export type SoundVolume = 'low' | 'medium' | 'high';

class SoundService {
  private ctx: AudioContext | null = null;
  private initialized = false;
  private volume: SoundVolume = 'medium';
  private enabled = true;

  private getVolumeMultiplier(): number {
    if (!this.enabled) return 0;
    switch (this.volume) {
      case 'low':
        return 0.45;
      case 'high':
        return 1.6;
      case 'medium':
      default:
        return 1.0;
    }
  }

  setVolume(vol: SoundVolume) {
    this.volume = vol;
  }

  setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }

  private init() {
    if (!this.initialized && typeof window !== 'undefined') {
      try {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (AudioCtx) {
          this.ctx = new AudioCtx();
          this.initialized = true;
        }
      } catch {
        // AudioContext not supported or blocked
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  // Tactile mechanical keypress click (clearly audible, pleasant)
  playKeyClick() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    try {
      const mult = this.getVolumeMultiplier();
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      // Satisfying wooden/mechanical click
      osc.type = 'sine';
      osc.frequency.setValueAtTime(520, now);
      osc.frequency.exponentialRampToValueAtTime(140, now + 0.035);

      gain.gain.setValueAtTime(0.18 * mult, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.05);
    } catch {
      // Ignore audio failure
    }
  }

  // Alias helper for typing beep feedback
  playKeyBeep(isCorrect: boolean = true) {
    if (isCorrect) {
      this.playKeyClick();
    } else {
      this.playError();
    }
  }

  // Correct key light positive tone
  playCorrectKey() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    try {
      const mult = this.getVolumeMultiplier();
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.exponentialRampToValueAtTime(1174, now + 0.04);

      gain.gain.setValueAtTime(0.12 * mult, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.045);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.05);
    } catch {
      // Ignore
    }
  }

  // Clear, distinct error buzz (noticeable without being annoying)
  playError() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    try {
      const mult = this.getVolumeMultiplier();
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.linearRampToValueAtTime(110, now + 0.12);

      gain.gain.setValueAtTime(0.25 * mult, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.13);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.14);
    } catch {
      // Ignore
    }
  }

  // Page completion upbeat chime (2 notes)
  playPageCompletion() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    try {
      const mult = this.getVolumeMultiplier();
      const notes = [659.25, 880]; // E5, A5
      notes.forEach((freq, idx) => {
        if (!this.ctx) return;
        const startTime = this.ctx.currentTime + idx * 0.09;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0.22 * mult, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.25);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + 0.28);
      });
    } catch {
      // Ignore
    }
  }

  // Lesson completion harmonious melodic chime (4 notes)
  playLessonCompletion() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    try {
      const mult = this.getVolumeMultiplier();
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        if (!this.ctx) return;
        const startTime = this.ctx.currentTime + idx * 0.1;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0.24 * mult, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.45);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + 0.5);
      });
    } catch {
      // Ignore
    }
  }

  // Course / Unit completion fanfare (5 notes)
  playCourseCompletion() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    try {
      const mult = this.getVolumeMultiplier();
      const notes = [440, 554.37, 659.25, 880, 1108.73]; // A4, C#5, E5, A5, C#6
      notes.forEach((freq, idx) => {
        if (!this.ctx) return;
        const startTime = this.ctx.currentTime + idx * 0.09;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0.26 * mult, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.6);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + 0.65);
      });
    } catch {
      // Ignore
    }
  }

  // Certificate celebration grand fanfare
  playCertificateCelebration() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    try {
      const mult = this.getVolumeMultiplier();
      const chords = [
        { freqs: [523.25, 659.25, 783.99], time: 0, dur: 0.3 }, // C Major
        { freqs: [587.33, 739.99, 880], time: 0.28, dur: 0.3 }, // D Major
        { freqs: [659.25, 830.61, 987.77], time: 0.56, dur: 0.35 }, // E Major
        { freqs: [783.99, 987.77, 1046.5, 1318.5], time: 0.88, dur: 0.8 }, // Grand Finale C6
      ];

      chords.forEach((chord) => {
        chord.freqs.forEach((freq) => {
          if (!this.ctx) return;
          const startTime = this.ctx.currentTime + chord.time;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();

          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, startTime);

          gain.gain.setValueAtTime(0.18 * mult, startTime);
          gain.gain.exponentialRampToValueAtTime(0.001, startTime + chord.dur);

          osc.connect(gain);
          gain.connect(this.ctx.destination);

          osc.start(startTime);
          osc.stop(startTime + chord.dur + 0.05);
        });
      });
    } catch {
      // Ignore
    }
  }

  // Backward-compatible alias
  playCompletion() {
    this.playLessonCompletion();
  }

  // Achievement fanfare
  playAchievement() {
    this.playCourseCompletion();
  }
}

export const soundService = new SoundService();
