import React, { useState, useEffect } from 'react';
import { 
  X, 
  Volume2, 
  Volume1, 
  VolumeX, 
  Music, 
  Zap, 
  BellRing, 
  Play, 
  Square, 
  Check, 
  Repeat, 
  Bell, 
  Info,
  Sliders
} from 'lucide-react';
import { SoundTone, AlarmPlaybackMode } from '../types';
import { sounds, SOUND_TONE_OPTIONS } from '../utils/sound';

interface RingtoneModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedTone: SoundTone;
  onSelectTone: (tone: SoundTone) => void;
  defaultAlarmMode: AlarmPlaybackMode;
  onSelectAlarmMode: (mode: AlarmPlaybackMode) => void;
  volume: number; // 0 to 1
  onVolumeChange: (volume: number) => void;
}

export const RingtoneModal: React.FC<RingtoneModalProps> = ({
  isOpen,
  onClose,
  selectedTone,
  onSelectTone,
  defaultAlarmMode,
  onSelectAlarmMode,
  volume,
  onVolumeChange,
}) => {
  const [playingTone, setPlayingTone] = useState<SoundTone | null>(null);
  const [isLooping, setIsLooping] = useState<boolean>(sounds.isLooping());
  const [activeLoopTone, setActiveLoopTone] = useState<SoundTone | null>(sounds.getLoopingTone());

  useEffect(() => {
    const unsubscribe = sounds.subscribeLoopState((loopActive, loopTone) => {
      setIsLooping(loopActive);
      setActiveLoopTone(loopTone);
    });
    return () => unsubscribe();
  }, []);

  if (!isOpen) return null;

  const handlePlayOnce = (tone: SoundTone) => {
    sounds.stopLoop();
    setPlayingTone(tone);
    sounds.playTone(tone);
    setTimeout(() => {
      setPlayingTone(null);
    }, 1300);
  };

  const handleToggleLoop = (tone: SoundTone) => {
    if (isLooping && activeLoopTone === tone) {
      sounds.stopLoop();
    } else {
      setPlayingTone(null);
      sounds.startLoop(tone);
    }
  };

  const handleStopAllSound = () => {
    sounds.stopLoop();
    setPlayingTone(null);
  };

  const handleCloseModal = () => {
    sounds.stopLoop();
    setPlayingTone(null);
    onClose();
  };

  const handleVolumeSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVol = parseFloat(e.target.value) / 100;
    onVolumeChange(newVol);
    sounds.setVolume(newVol);
  };

  const handleSetVolumePreset = (pct: number) => {
    const newVol = pct / 100;
    onVolumeChange(newVol);
    sounds.setVolume(newVol);
    // Play a brief preview chime so user hears the new volume level
    if (newVol > 0 && !isLooping) {
      sounds.playTone(selectedTone);
    }
  };

  const getToneIcon = (id: SoundTone) => {
    switch (id) {
      case 'melodi_lembut':
        return <Music className="w-5 h-5 text-emerald-500" />;
      case 'alarm_dinamis':
        return <Zap className="w-5 h-5 text-amber-500" />;
      case 'genta_klasik':
        return <BellRing className="w-5 h-5 text-indigo-500" />;
    }
  };

  const volumePct = Math.round(volume * 100);

  const getVolumeIcon = () => {
    if (volumePct === 0) return <VolumeX className="w-5 h-5 text-zinc-400" />;
    if (volumePct < 50) return <Volume1 className="w-5 h-5 text-indigo-500" />;
    return <Volume2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div 
        className="w-full max-w-xl bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden my-4 sm:my-8 transition-colors max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-zinc-100 dark:border-zinc-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                Pengaturan Nada Dering & Alarm
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Atur volume, mode bunyi sekali / looping, dan 3 pilihan melodi
              </p>
            </div>
          </div>
          <button
            onClick={handleCloseModal}
            className="p-1.5 rounded-full text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-4 sm:p-6 space-y-5 overflow-y-auto flex-1">

          {/* ACTIVE LOOPING NOTIFICATION BANNER */}
          {isLooping && (
            <div className="p-3.5 rounded-2xl bg-amber-500 text-white flex items-center justify-between gap-3 shadow-md animate-pulse">
              <div className="flex items-center gap-2.5">
                <Repeat className="w-5 h-5 animate-spin" />
                <div>
                  <h4 className="text-xs font-bold">Alarm Sedang Berbunyi Berulang (Looping)!</h4>
                  <p className="text-[11px] opacity-90">
                    Meniru alarm jadwal yang terus berdering sampai dihentikan.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleStopAllSound}
                className="px-3 py-1.5 rounded-xl bg-white text-amber-700 text-xs font-bold hover:bg-zinc-100 shadow-xs transition-colors shrink-0 flex items-center gap-1"
              >
                <Square className="w-3.5 h-3.5 fill-current" />
                <span>Hentikan Dering</span>
              </button>
            </div>
          )}

          {/* 1. VOLUME CONTROL SLIDER */}
          <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/80 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                  {getVolumeIcon()}
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-zinc-100">
                    Volume Dering Alarm
                  </h4>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                    Keras atau lembutnya suara synthesizer pengingat
                  </p>
                </div>
              </div>

              <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded-full ${
                volumePct === 0 
                  ? 'bg-zinc-200 text-zinc-600 dark:bg-zinc-700 dark:text-zinc-300' 
                  : 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/80 dark:text-indigo-300'
              }`}>
                {volumePct === 0 ? 'Bisu (0%)' : `${volumePct}%`}
              </span>
            </div>

            {/* Slider */}
            <div className="space-y-2 pt-1">
              <input
                type="range"
                min="0"
                max="100"
                step="1"
                value={volumePct}
                onChange={handleVolumeSliderChange}
                className="w-full h-2 bg-zinc-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-indigo-600 dark:accent-indigo-500"
              />

              {/* Volume Presets */}
              <div className="flex items-center justify-between text-[11px] pt-1">
                <button
                  type="button"
                  onClick={() => handleSetVolumePreset(0)}
                  className={`px-2 py-1 rounded-lg border transition-colors ${
                    volumePct === 0 
                      ? 'bg-zinc-800 text-white dark:bg-zinc-100 dark:text-zinc-900 font-bold border-transparent' 
                      : 'border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-700'
                  }`}
                >
                  Bisu (0%)
                </button>
                <button
                  type="button"
                  onClick={() => handleSetVolumePreset(40)}
                  className={`px-2 py-1 rounded-lg border transition-colors ${
                    volumePct === 40 
                      ? 'bg-indigo-600 text-white font-bold border-transparent' 
                      : 'border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-700'
                  }`}
                >
                  Lembut (40%)
                </button>
                <button
                  type="button"
                  onClick={() => handleSetVolumePreset(80)}
                  className={`px-2 py-1 rounded-lg border transition-colors ${
                    volumePct === 80 
                      ? 'bg-indigo-600 text-white font-bold border-transparent' 
                      : 'border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-700'
                  }`}
                >
                  Keras (80%)
                </button>
                <button
                  type="button"
                  onClick={() => handleSetVolumePreset(100)}
                  className={`px-2 py-1 rounded-lg border transition-colors ${
                    volumePct === 100 
                      ? 'bg-indigo-600 text-white font-bold border-transparent' 
                      : 'border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-700'
                  }`}
                >
                  Maksimal (100%)
                </button>
              </div>
            </div>
          </div>

          {/* 2. PLAYBACK MODE (SEKALI vs LOOPING) */}
          <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200/80 dark:border-indigo-800/60 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-indigo-600 text-white">
                  <Repeat className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-zinc-100">
                    Mode Pemutaran Alarm
                  </h4>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                    Pilih apakah alarm hanya berdering sekali atau berulang
                  </p>
                </div>
              </div>

              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300">
                {defaultAlarmMode === 'loop' ? 'Berulang Aktif' : 'Sekali Aktif'}
              </span>
            </div>

            {/* 2 Choice Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
              {/* Option Once */}
              <div
                onClick={() => onSelectAlarmMode('once')}
                className={`p-3 rounded-xl border text-left cursor-pointer transition-all flex items-start gap-2.5 ${
                  defaultAlarmMode === 'once'
                    ? 'bg-white dark:bg-zinc-800 border-indigo-500 ring-2 ring-indigo-500/30 shadow-xs'
                    : 'bg-white/60 dark:bg-zinc-800/40 border-zinc-200 dark:border-zinc-700 hover:border-indigo-300'
                }`}
              >
                <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Bell className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">Bunyi Sekali</span>
                    {defaultAlarmMode === 'once' && <Check className="w-3.5 h-3.5 text-indigo-600" />}
                  </div>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5 leading-relaxed">
                    Alarm berbunyi 1 kali saja saat jadwal tiba. Tenang dan tidak mengganggu.
                  </p>
                </div>
              </div>

              {/* Option Loop */}
              <div
                onClick={() => onSelectAlarmMode('loop')}
                className={`p-3 rounded-xl border text-left cursor-pointer transition-all flex items-start gap-2.5 ${
                  defaultAlarmMode === 'loop'
                    ? 'bg-white dark:bg-zinc-800 border-indigo-500 ring-2 ring-indigo-500/30 shadow-xs'
                    : 'bg-white/60 dark:bg-zinc-800/40 border-zinc-200 dark:border-zinc-700 hover:border-indigo-300'
                }`}
              >
                <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Repeat className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">Berulang (Looping)</span>
                    {defaultAlarmMode === 'loop' && <Check className="w-3.5 h-3.5 text-indigo-600" />}
                  </div>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5 leading-relaxed">
                    Alarm terus berbunyi berulang sampai Anda menekan tombol "Hentikan Dering".
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 3. 3 TONE CHOICES (MELODI LEMBUT, ALARM DINAMIS, GENTA KLASIK) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                <Music className="w-4 h-4 text-indigo-500" /> Variasi Nada Dering (3 Pilihan)
              </h4>
              <span className="text-[11px] text-zinc-400">Pilih suara favorit Anda</span>
            </div>

            <div className="space-y-2.5">
              {SOUND_TONE_OPTIONS.map((option) => {
                const isSelected = selectedTone === option.id;
                const isPlayingOnce = playingTone === option.id;
                const isThisLooping = isLooping && activeLoopTone === option.id;

                return (
                  <div
                    key={option.id}
                    className={`p-3.5 sm:p-4 rounded-2xl border transition-all ${
                      isSelected
                        ? 'bg-indigo-50/60 dark:bg-indigo-950/30 border-indigo-500 ring-2 ring-indigo-500/20 shadow-xs'
                        : 'bg-white dark:bg-zinc-800/60 border-zinc-200 dark:border-zinc-700 hover:border-indigo-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shrink-0">
                          {getToneIcon(option.id)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <h5 className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-zinc-100">
                              {option.label}
                            </h5>
                            {isSelected && (
                              <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-600 text-white flex items-center gap-1">
                                <Check className="w-2.5 h-2.5" /> Terpilih
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] sm:text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 line-clamp-2">
                            {option.description}
                          </p>
                        </div>
                      </div>

                      {/* Select button */}
                      {!isSelected && (
                        <button
                          type="button"
                          onClick={() => onSelectTone(option.id)}
                          className="px-3 py-1.5 rounded-xl text-xs font-semibold border border-indigo-600 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-colors shrink-0"
                        >
                          Pilih
                        </button>
                      )}
                    </div>

                    {/* Test Audio Actions: Sekali & Looping */}
                    <div className="flex items-center gap-2 mt-3 pt-2.5 border-t border-zinc-100 dark:border-zinc-700/60 flex-wrap">
                      <span className="text-[11px] text-zinc-400 mr-1">Tes Audio:</span>

                      {/* Play once */}
                      <button
                        type="button"
                        onClick={() => handlePlayOnce(option.id)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold flex items-center gap-1 transition-all ${
                          isPlayingOnce
                            ? 'bg-indigo-600 text-white animate-pulse'
                            : 'bg-zinc-100 dark:bg-zinc-700 hover:bg-zinc-200 dark:hover:bg-zinc-600 text-zinc-700 dark:text-zinc-200'
                        }`}
                        title="Tes putar 1 kali"
                      >
                        <Play className={`w-3 h-3 ${isPlayingOnce ? 'fill-white' : ''}`} />
                        <span>{isPlayingOnce ? 'Memutar...' : 'Bunyi Sekali'}</span>
                      </button>

                      {/* Toggle loop */}
                      <button
                        type="button"
                        onClick={() => handleToggleLoop(option.id)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold flex items-center gap-1 transition-all ${
                          isThisLooping
                            ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse shadow-xs'
                            : 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/60 hover:bg-amber-100'
                        }`}
                        title={isThisLooping ? 'Hentikan pengulangan' : 'Tes berulang terus-menerus'}
                      >
                        {isThisLooping ? (
                          <>
                            <Square className="w-3 h-3 fill-current" />
                            <span>Stop Looping</span>
                          </>
                        ) : (
                          <>
                            <Repeat className="w-3 h-3" />
                            <span>Tes Looping</span>
                          </>
                        )}
                      </button>
                    </div>

                  </div>
                );
              })}
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700/60 text-xs text-zinc-600 dark:text-zinc-400 flex items-start gap-2">
            <Info className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              Nada dering dan pengaturan volume disintesis secara instan via <strong>Web Audio API</strong>. Bekerja 100% offline di background tanpa membebani kuota data internet.
            </p>
          </div>

        </div>

        {/* Footer */}
        <div className="px-5 sm:px-6 py-3.5 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-800/30 shrink-0">
          <div className="text-xs text-zinc-500 dark:text-zinc-400">
            Volume: <strong>{volumePct}%</strong> • Mode: <strong>{defaultAlarmMode === 'loop' ? 'Looping' : 'Sekali'}</strong>
          </div>
          <button
            type="button"
            onClick={handleCloseModal}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-all"
          >
            Selesai
          </button>
        </div>

      </div>
    </div>
  );
};
