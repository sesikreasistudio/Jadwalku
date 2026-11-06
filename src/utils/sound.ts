/**
 * Web Audio API Synthesizer for Smart Notification Chimes
 * Works 100% offline with zero external audio assets.
 * Provides 3 distinct ringtone sound choices with real-time preview,
 * adjustable master volume (0 - 100%), and looping/single playback modes.
 */

import { SoundTone, SoundToneOption, AlarmPlaybackMode } from '../types';

export const SOUND_TONE_OPTIONS: SoundToneOption[] = [
  {
    id: 'melodi_lembut',
    label: 'Melodi Lembut',
    description: 'Arpeggio nada lembut bernuansa marimba, menenangkan dan nyaman di telinga',
    icon: 'Music',
  },
  {
    id: 'alarm_dinamis',
    label: 'Alarm Dinamis',
    description: 'Ketukan ganda modern yang jelas dan energetik, pas untuk fokus kerja',
    icon: 'Zap',
  },
  {
    id: 'genta_klasik',
    label: 'Genta Klasik',
    description: 'Dentang genta lonceng kristal bergema jernih, elegan dan berwibawa',
    icon: 'BellRing',
  },
];

class SoundEffects {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private volume: number = 0.8; // 0.0 to 1.0 (80% default)
  private loopIntervalId: ReturnType<typeof setInterval> | null = null;
  private isLoopActive: boolean = false;
  private loopingTone: SoundTone | null = null;
  private listeners: Set<(isLooping: boolean, tone: SoundTone | null) => void> = new Set();

  constructor() {
    if (typeof window !== 'undefined') {
      const savedVol = localStorage.getItem('jadwalku_sound_volume');
      if (savedVol !== null) {
        const parsed = parseFloat(savedVol);
        if (!isNaN(parsed) && parsed >= 0 && parsed <= 1) {
          this.volume = parsed;
        }
      }
    }
  }

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
        this.masterGain.connect(this.ctx.destination);
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  private getMasterGain(): GainNode | null {
    this.getContext();
    return this.masterGain;
  }

  /**
   * Set master volume (0.0 to 1.0)
   */
  setVolume(vol: number) {
    const clamped = Math.max(0, Math.min(1, vol));
    this.volume = clamped;
    if (typeof window !== 'undefined') {
      localStorage.setItem('jadwalku_sound_volume', clamped.toFixed(2));
    }
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(clamped, this.ctx.currentTime);
    }
  }

  /**
   * Get current volume (0.0 to 1.0)
   */
  getVolume(): number {
    return this.volume;
  }

  /**
   * Get current volume percentage (0 to 100)
   */
  getVolumePercent(): number {
    return Math.round(this.volume * 100);
  }

  // 1. Melodi Lembut (Soft Gentle Marimba/Chime)
  playMelodiLembut(gainMultiplier: number = 1.0) {
    const ctx = this.getContext();
    const master = this.getMasterGain();
    if (!ctx || !master || this.volume <= 0.001) return;

    const now = ctx.currentTime;
    const notes = [
      { freq: 659.25, time: 0.0, dur: 0.4 },  // E5
      { freq: 830.61, time: 0.12, dur: 0.4 }, // G#5
      { freq: 987.77, time: 0.24, dur: 0.45 },// B5
      { freq: 1318.51, time: 0.36, dur: 0.7 },// E6
    ];

    notes.forEach(({ freq, time, dur }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + time);

      const targetGain = 0.28 * gainMultiplier;
      gain.gain.setValueAtTime(0.001, now + time);
      gain.gain.exponentialRampToValueAtTime(targetGain, now + time + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + time + dur);

      osc.connect(gain);
      gain.connect(master);

      osc.start(now + time);
      osc.stop(now + time + dur);
    });
  }

  // 2. Alarm Dinamis (Dynamic Modern Electronic Beep / Pulse)
  playAlarmDinamis(gainMultiplier: number = 1.0) {
    const ctx = this.getContext();
    const master = this.getMasterGain();
    if (!ctx || !master || this.volume <= 0.001) return;

    const now = ctx.currentTime;
    const pulses = [
      { f1: 880, f2: 1108.73, time: 0.0 },
      { f1: 987.77, f2: 1318.51, time: 0.1 },
      { f1: 880, f2: 1108.73, time: 0.28 },
      { f1: 1174.66, f2: 1479.98, time: 0.38 },
    ];

    pulses.forEach(({ f1, f2, time }) => {
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'triangle';
      osc2.type = 'sine';

      osc1.frequency.setValueAtTime(f1, now + time);
      osc2.frequency.setValueAtTime(f2, now + time);

      const targetGain = 0.25 * gainMultiplier;
      gain.gain.setValueAtTime(0.001, now + time);
      gain.gain.linearRampToValueAtTime(targetGain, now + time + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + time + 0.14);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(master);

      osc1.start(now + time);
      osc2.start(now + time);
      osc1.stop(now + time + 0.15);
      osc2.stop(now + time + 0.15);
    });
  }

  // 3. Genta Klasik (Classic Resonant Crystal Bell)
  playGentaKlasik(gainMultiplier: number = 1.0) {
    const ctx = this.getContext();
    const master = this.getMasterGain();
    if (!ctx || !master || this.volume <= 0.001) return;

    const now = ctx.currentTime;
    const baseFreq = 523.25; // C5
    const harmonics = [
      { ratio: 1.0, gainVal: 0.3 * gainMultiplier, dur: 1.2 },
      { ratio: 2.0, gainVal: 0.18 * gainMultiplier, dur: 0.9 },
      { ratio: 3.01, gainVal: 0.12 * gainMultiplier, dur: 0.7 },
      { ratio: 4.2, gainVal: 0.08 * gainMultiplier, dur: 0.5 },
    ];

    harmonics.forEach(({ ratio, gainVal, dur }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(baseFreq * ratio, now);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(gainVal, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + dur);

      osc.connect(gain);
      gain.connect(master);

      osc.start(now);
      osc.stop(now + dur);
    });
  }

  // Play based on selected tone once
  playTone(tone: SoundTone = 'melodi_lembut') {
    switch (tone) {
      case 'alarm_dinamis':
        this.playAlarmDinamis();
        break;
      case 'genta_klasik':
        this.playGentaKlasik();
        break;
      case 'melodi_lembut':
      default:
        this.playMelodiLembut();
        break;
    }
  }

  /**
   * Play based on mode: 'once' (play once) or 'loop' (repeat until stopped)
   */
  playAlert(tone: SoundTone = 'melodi_lembut', mode: AlarmPlaybackMode = 'once') {
    if (mode === 'loop') {
      this.startLoop(tone);
    } else {
      this.stopLoop();
      this.playTone(tone);
    }
  }

  /**
   * Start looping the ringtone repeatedly until stopLoop() is invoked
   */
  startLoop(tone: SoundTone = 'melodi_lembut') {
    this.stopLoop(); // clear any existing loop
    this.isLoopActive = true;
    this.loopingTone = tone;
    this.notifyListeners();

    // Play immediately
    this.playTone(tone);

    // Timing interval based on tone duration
    let intervalMs = 1600;
    if (tone === 'genta_klasik') intervalMs = 2000;
    if (tone === 'alarm_dinamis') intervalMs = 1350;

    this.loopIntervalId = setInterval(() => {
      if (!this.isLoopActive) {
        if (this.loopIntervalId) clearInterval(this.loopIntervalId);
        return;
      }
      this.playTone(tone);
    }, intervalMs);
  }

  /**
   * Stop any active audio looping
   */
  stopLoop() {
    if (this.loopIntervalId) {
      clearInterval(this.loopIntervalId);
      this.loopIntervalId = null;
    }
    const hadLoop = this.isLoopActive;
    this.isLoopActive = false;
    this.loopingTone = null;
    if (hadLoop) {
      this.notifyListeners();
    }
  }

  /**
   * Is alarm currently looping
   */
  isLooping(): boolean {
    return this.isLoopActive;
  }

  /**
   * Currently active looping tone
   */
  getLoopingTone(): SoundTone | null {
    return this.loopingTone;
  }

  /**
   * Subscribe to loop state changes
   */
  subscribeLoopState(callback: (isLooping: boolean, tone: SoundTone | null) => void): () => void {
    this.listeners.add(callback);
    callback(this.isLoopActive, this.loopingTone);
    return () => {
      this.listeners.delete(callback);
    };
  }

  private notifyListeners() {
    this.listeners.forEach((cb) => cb(this.isLoopActive, this.loopingTone));
  }

  // Soft completion chime
  playSuccessChime() {
    const ctx = this.getContext();
    const master = this.getMasterGain();
    if (!ctx || !master || this.volume <= 0.001) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(523.25, now); // C5
    osc.frequency.setValueAtTime(659.25, now + 0.08); // E5
    osc.frequency.setValueAtTime(783.99, now + 0.16); // G5
    osc.frequency.setValueAtTime(1046.50, now + 0.24); // C6

    gainNode.gain.setValueAtTime(0.001, now);
    gainNode.gain.exponentialRampToValueAtTime(0.25, now + 0.04);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.7);

    osc.connect(gainNode);
    gainNode.connect(master);

    osc.start(now);
    osc.stop(now + 0.7);
  }

  playUrgentAlert() {
    this.playAlarmDinamis();
  }
}

export const sounds = new SoundEffects();
