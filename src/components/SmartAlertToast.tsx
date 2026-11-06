import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  Clock, 
  MapPin, 
  X, 
  CheckCircle2, 
  AlarmClock,
  Volume2,
  VolumeX,
  Timer,
  Repeat,
  Square
} from 'lucide-react';
import { ScheduleItem, SoundTone, AlarmPlaybackMode } from '../types';
import { CATEGORIES } from '../utils/categories';
import { sounds } from '../utils/sound';

export type AlertType = 'approaching' | 'started' | 'ending_soon' | 'ended';

export interface SmartAlert {
  id: string;
  schedule: ScheduleItem;
  type: AlertType;
  minutesLeft: number;
  soundTone?: SoundTone;
  alarmMode?: AlarmPlaybackMode;
}

interface SmartAlertToastProps {
  alert: SmartAlert | null;
  onDismiss: () => void;
  onSnooze: (alertId: string, minutes: number) => void;
  onComplete: (scheduleId: string) => void;
}

export const SmartAlertToast: React.FC<SmartAlertToastProps> = ({
  alert,
  onDismiss,
  onSnooze,
  onComplete,
}) => {
  const [isLooping, setIsLooping] = useState<boolean>(sounds.isLooping());
  const [volume, setVolume] = useState<number>(sounds.getVolume());

  useEffect(() => {
    const unsub = sounds.subscribeLoopState((loopActive) => {
      setIsLooping(loopActive);
    });
    return () => unsub();
  }, []);

  if (!alert) return null;

  const category = CATEGORIES[alert.schedule.category] || CATEGORIES.kerja;

  const getAlertBadge = () => {
    switch (alert.type) {
      case 'started':
        return {
          title: 'Jadwal Dimulai Sekarang',
          bg: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300',
          iconColor: 'bg-emerald-600',
        };
      case 'ending_soon':
        return {
          title: `Batas Waktu: ${alert.minutesLeft} Menit Lagi Usai!`,
          bg: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-300',
          iconColor: 'bg-amber-600',
        };
      case 'ended':
        return {
          title: 'Batas Jam Kerja/Selesai Telah Tiba!',
          bg: 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300 border-red-300',
          iconColor: 'bg-red-600',
        };
      case 'approaching':
      default:
        return {
          title: `Pengingat: ${alert.minutesLeft} Menit Menuju Mulai`,
          bg: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 border-indigo-300',
          iconColor: 'bg-indigo-600',
        };
    }
  };

  const getSoundLabel = (tone?: SoundTone) => {
    switch (tone) {
      case 'alarm_dinamis':
        return 'Alarm Dinamis';
      case 'genta_klasik':
        return 'Genta Klasik';
      case 'melodi_lembut':
      default:
        return 'Melodi Lembut';
    }
  };

  const handleStopRingtone = () => {
    sounds.stopLoop();
  };

  const handleDismissWithStop = () => {
    sounds.stopLoop();
    onDismiss();
  };

  const handleSnoozeWithStop = () => {
    sounds.stopLoop();
    onSnooze(alert.id, 5);
  };

  const handleCompleteWithStop = () => {
    sounds.stopLoop();
    onComplete(alert.schedule.id);
    onDismiss();
  };

  const handleToggleMute = () => {
    if (volume > 0) {
      sounds.setVolume(0);
      setVolume(0);
      sounds.stopLoop();
    } else {
      sounds.setVolume(0.8);
      setVolume(0.8);
      sounds.playTone(alert.soundTone || alert.schedule.soundTone);
    }
  };

  const badgeInfo = getAlertBadge();
  const isAlarmLoopMode = (alert.alarmMode || alert.schedule.alarmMode) === 'loop';

  return (
    <div className="fixed top-14 sm:top-20 right-2 left-2 sm:left-auto sm:right-6 z-50 max-w-sm sm:w-full animate-bounce-short">
      <div className="p-3.5 sm:p-4 rounded-3xl bg-white dark:bg-zinc-900 border-2 border-indigo-500 shadow-2xl ring-4 ring-indigo-500/20 transition-all">
        
        {/* Header */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className={`w-9 h-9 rounded-2xl ${badgeInfo.iconColor} text-white flex items-center justify-center shadow-sm shrink-0 animate-pulse`}>
              {alert.type === 'ended' || alert.type === 'ending_soon' ? (
                <Timer className="w-5 h-5" />
              ) : (
                <Bell className="w-5 h-5" />
              )}
            </div>
            <div className="min-w-0">
              <span className={`text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full border ${badgeInfo.bg}`}>
                {badgeInfo.title}
              </span>
              <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mt-1 truncate">
                {alert.schedule.title}
              </h4>
            </div>
          </div>
          <button
            onClick={handleDismissWithStop}
            className="p-1 rounded-full text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 shrink-0"
            title="Tutup Pengingat"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ACTIVE LOOPING ALERT BANNER */}
        {isLooping && (
          <div className="my-2 p-2 rounded-xl bg-amber-500 text-white flex items-center justify-between gap-2 animate-pulse">
            <div className="flex items-center gap-1.5 text-xs font-bold">
              <Repeat className="w-3.5 h-3.5 animate-spin" />
              <span>Alarm Berulang (Looping)...</span>
            </div>
            <button
              type="button"
              onClick={handleStopRingtone}
              className="px-2 py-0.5 rounded-lg bg-white text-amber-800 text-[11px] font-bold hover:bg-zinc-100 flex items-center gap-1 shadow-xs transition-colors shrink-0"
            >
              <Square className="w-3 h-3 fill-current" />
              <span>Hentikan Dering</span>
            </button>
          </div>
        )}

        {/* Details & Sound Tone / Mode indicator */}
        <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 mb-2.5 ml-11 flex-wrap gap-1.5">
          <div className="flex items-center gap-1 font-mono text-zinc-700 dark:text-zinc-300">
            <Clock className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
            <span>{alert.schedule.startTime} - {alert.schedule.endTime}</span>
          </div>

          <div className="flex items-center gap-1">
            {/* Sound tone label & replay button */}
            <button
              type="button"
              onClick={() => {
                if (isAlarmLoopMode) {
                  sounds.startLoop(alert.soundTone || alert.schedule.soundTone);
                } else {
                  sounds.playTone(alert.soundTone || alert.schedule.soundTone);
                }
              }}
              className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-[10px] font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
              title="Dengarkan kembali nada dering"
            >
              <Volume2 className="w-3 h-3 text-indigo-500 shrink-0" />
              <span>{getSoundLabel(alert.soundTone || alert.schedule.soundTone)}</span>
              {isAlarmLoopMode && <span className="text-[9px] text-amber-600 font-bold">(Loop)</span>}
            </button>

            {/* Quick Mute Toggle */}
            <button
              type="button"
              onClick={handleToggleMute}
              className={`p-1 rounded-full text-xs transition-colors ${
                volume === 0 
                  ? 'bg-red-100 text-red-600 dark:bg-red-950/60 dark:text-red-400' 
                  : 'text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200'
              }`}
              title={volume === 0 ? 'Batal Bisu (Bunyikan)' : 'Bisukan Suara'}
            >
              {volume === 0 ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {alert.schedule.location && (
          <div className="ml-11 mb-2.5 text-xs text-zinc-500 dark:text-zinc-400 flex items-center gap-1 truncate">
            <MapPin className="w-3 h-3 shrink-0" />
            <span>{alert.schedule.location}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
          <button
            onClick={handleSnoozeWithStop}
            className="flex-1 py-1.5 px-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-xs font-semibold flex items-center justify-center gap-1 transition-colors"
          >
            <AlarmClock className="w-3.5 h-3.5 text-amber-500" />
            <span>Tunda 5m</span>
          </button>

          <button
            onClick={handleCompleteWithStop}
            className="flex-1 py-1.5 px-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center justify-center gap-1 shadow-xs transition-all"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Tandai Selesai</span>
          </button>
        </div>
      </div>
    </div>
  );
};
