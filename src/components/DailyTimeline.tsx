import React, { useEffect, useState } from 'react';
import { 
  CheckCircle2, 
  Circle, 
  Clock, 
  MapPin, 
  AlertTriangle, 
  Calendar as CalendarIcon, 
  Trash2, 
  Edit3,
  ExternalLink,
  Bell
} from 'lucide-react';
import { ScheduleItem } from '../types';
import { CATEGORIES } from '../utils/categories';
import { getGoogleCalendarWebUrl } from '../utils/googleCalendar';

interface DailyTimelineProps {
  schedules: ScheduleItem[];
  selectedDate: string;
  onToggleComplete: (id: string) => void;
  onEditItem: (item: ScheduleItem) => void;
  onDeleteItem: (id: string) => void;
  onAddNewAtHour: (hour: number) => void;
}

export const DailyTimeline: React.FC<DailyTimelineProps> = ({
  schedules,
  selectedDate,
  onToggleComplete,
  onEditItem,
  onDeleteItem,
  onAddNewAtHour,
}) => {
  const [currentTimeMinutes, setCurrentTimeMinutes] = useState<number>(0);
  const [isViewingToday, setIsViewingToday] = useState<boolean>(true);

  // Update current time marker
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const yr = now.getFullYear();
      const mo = String(now.getMonth() + 1).padStart(2, '0');
      const dy = String(now.getDate()).padStart(2, '0');
      const todayStr = `${yr}-${mo}-${dy}`;
      setIsViewingToday(todayStr === selectedDate);
      setCurrentTimeMinutes(now.getHours() * 60 + now.getMinutes());
    };

    updateTime();
    const interval = setInterval(updateTime, 30000); // every 30s
    return () => clearInterval(interval);
  }, [selectedDate]);

  // Convert "HH:mm" to minutes from midnight
  const timeToMinutes = (timeStr: string) => {
    const [h, m] = timeStr.split(':').map(Number);
    return (h || 0) * 60 + (m || 0);
  };

  // Check for time overlap conflicts between schedules
  const conflictIds = new Set<string>();
  for (let i = 0; i < schedules.length; i++) {
    const s1 = schedules[i];
    const start1 = timeToMinutes(s1.startTime);
    const end1 = timeToMinutes(s1.endTime);

    for (let j = i + 1; j < schedules.length; j++) {
      const s2 = schedules[j];
      const start2 = timeToMinutes(s2.startTime);
      const end2 = timeToMinutes(s2.endTime);

      if (Math.max(start1, start2) < Math.min(end1, end2)) {
        conflictIds.add(s1.id);
        conflictIds.add(s2.id);
      }
    }
  }

  // Hours to display (5:00 AM to 23:00 PM)
  const hours = Array.from({ length: 19 }, (_, i) => i + 5);

  const getPriorityBadge = (priority: ScheduleItem['priority']) => {
    switch (priority) {
      case 'tinggi':
        return <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300">Tinggi</span>;
      case 'sedang':
        return <span className="text-[10px] font-medium tracking-wider uppercase px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300">Sedang</span>;
      default:
        return <span className="text-[10px] font-medium tracking-wider uppercase px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">Rendah</span>;
    }
  };

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden transition-colors w-full max-w-full">
      {/* Header bar */}
      <div className="px-3.5 py-3 sm:px-5 sm:py-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600 dark:text-indigo-400 shrink-0" />
          <h2 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-zinc-100">
            Timeline Kegiatan Harian
          </h2>
          <span className="text-[11px] sm:text-xs px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 font-medium">
            {schedules.length}
          </span>
        </div>

        {/* Conflict indicator banner if any */}
        {conflictIds.size > 0 && (
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300 text-[11px] sm:text-xs">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
            <span>{conflictIds.size} jadwal bentrok</span>
          </div>
        )}
      </div>

      {/* Timeline Area (Zero horizontal scroll) */}
      <div className="relative p-2.5 sm:p-6 overflow-hidden w-full max-w-full">
        
        {/* Current Time Needle indicator */}
        {isViewingToday && currentTimeMinutes >= 300 && currentTimeMinutes <= 1440 && (
          <div 
            className="absolute left-11 right-2 sm:left-18 sm:right-4 z-20 flex items-center pointer-events-none transition-all duration-500 overflow-visible"
            style={{
              top: `${((currentTimeMinutes - 300) / 60) * 88 + 26}px`
            }}
          >
            <div className="h-0.5 w-full bg-red-500 relative flex items-center">
              <span className="absolute left-0 -top-4 px-1 py-0.2 rounded text-[9px] font-bold bg-red-500 text-white shadow-xs">
                {String(Math.floor(currentTimeMinutes / 60)).padStart(2, '0')}:{String(currentTimeMinutes % 60).padStart(2, '0')}
              </span>
              <div className="w-2 h-2 rounded-full bg-red-500 border border-white dark:border-zinc-900 shadow"></div>
            </div>
          </div>
        )}

        <div className="relative space-y-3.5 sm:space-y-4 w-full">
          {hours.map((hour) => {
            const hourStartMin = hour * 60;
            const hourEndMin = (hour + 1) * 60;
            const hourString = `${String(hour).padStart(2, '0')}:00`;

            // Filter schedules that fall into this hour bucket
            const matchingItems = schedules.filter((item) => {
              const start = timeToMinutes(item.startTime);
              const end = timeToMinutes(item.endTime);
              return (start >= hourStartMin && start < hourEndMin) || (start < hourStartMin && end > hourStartMin);
            });

            return (
              <div key={hour} className="group relative flex items-start gap-2 sm:gap-4 min-h-[64px] sm:min-h-[72px] w-full max-w-full">
                {/* Hour Label */}
                <div className="w-10 sm:w-14 shrink-0 pt-1 text-right">
                  <span className="text-[11px] sm:text-xs font-semibold text-zinc-400 dark:text-zinc-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {hourString}
                  </span>
                </div>

                {/* Timeline Grid Line */}
                <div className="relative flex-1 border-t border-dashed border-zinc-200 dark:border-zinc-800 pt-2 min-h-[58px] sm:min-h-[64px] min-w-0">
                  {/* Empty Slot Click Trigger */}
                  {matchingItems.length === 0 && (
                    <button
                      onClick={() => onAddNewAtHour(hour)}
                      className="w-full h-8 sm:h-10 rounded-xl border border-transparent hover:border-dashed hover:border-indigo-300 dark:hover:border-indigo-700/60 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/20 text-[11px] sm:text-xs text-transparent hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center justify-center gap-1.5 transition-all"
                    >
                      <span>+ Tambah di jam {hourString}</span>
                    </button>
                  )}

                  {/* Matching Schedule Cards */}
                  <div className="space-y-2 w-full">
                    {matchingItems.map((item) => {
                      const category = CATEGORIES[item.category] || CATEGORIES.kerja;
                      const hasConflict = conflictIds.has(item.id);
                      const startMin = timeToMinutes(item.startTime);
                      const endMin = timeToMinutes(item.endTime);
                      const isCurrentlyActive = isViewingToday && currentTimeMinutes >= startMin && currentTimeMinutes <= endMin;

                      return (
                        <div
                          key={item.id}
                          className={`relative rounded-xl p-2.5 sm:p-3.5 border transition-all w-full max-w-full ${
                            item.isCompleted
                              ? 'bg-zinc-50/70 dark:bg-zinc-900/40 border-zinc-200 dark:border-zinc-800/80 opacity-60'
                              : isCurrentlyActive
                              ? 'bg-white dark:bg-zinc-800/90 border-indigo-400 dark:border-indigo-500 shadow-md ring-2 ring-indigo-500/20'
                              : 'bg-white dark:bg-zinc-800/70 border-zinc-200 dark:border-zinc-700/80 hover:shadow-md'
                          }`}
                        >
                          {/* Active Pulsing Indicator */}
                          {isCurrentlyActive && (
                            <div className="absolute top-2 right-2 sm:right-3 flex items-center gap-1">
                              <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-600"></span>
                              </span>
                              <span className="text-[10px] sm:text-[11px] font-bold text-indigo-600 dark:text-indigo-400">
                                Berlangsung
                              </span>
                            </div>
                          )}

                          <div className="flex items-start justify-between gap-1.5 sm:gap-3 w-full">
                            {/* Checkbox & Details */}
                            <div className="flex items-start gap-2 sm:gap-3 flex-1 min-w-0">
                              <button
                                onClick={() => onToggleComplete(item.id)}
                                className="mt-0.5 text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors shrink-0"
                                title={item.isCompleted ? 'Tandai belum selesai' : 'Tandai selesai'}
                              >
                                {item.isCompleted ? (
                                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                                ) : (
                                  <Circle className="w-5 h-5" />
                                )}
                              </button>

                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className={`text-sm font-semibold ${item.isCompleted ? 'line-through text-zinc-400 dark:text-zinc-500' : 'text-zinc-900 dark:text-zinc-100'}`}>
                                    {item.title}
                                  </span>

                                  {/* Category Tag */}
                                  <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${category.bgLight} ${category.bgDark}`}>
                                    {category.label}
                                  </span>

                                  {/* Priority */}
                                  {getPriorityBadge(item.priority)}

                                  {/* Conflict Badge */}
                                  {hasConflict && !item.isCompleted && (
                                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-200 dark:border-amber-800">
                                      <AlertTriangle className="w-3 h-3" /> Waktu Bentrok
                                    </span>
                                  )}
                                </div>

                                {/* Description */}
                                {item.description && (
                                  <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1 line-clamp-2">
                                    {item.description}
                                  </p>
                                )}

                                {/* Metadata: Time, Location, Reminder */}
                                <div className="flex items-center gap-3 mt-2 text-xs text-zinc-500 dark:text-zinc-400 flex-wrap">
                                  <span className="inline-flex items-center gap-1 font-mono font-medium text-zinc-700 dark:text-zinc-300">
                                    <Clock className="w-3.5 h-3.5 text-indigo-500" />
                                    {item.startTime} - {item.endTime}
                                  </span>

                                  {item.location && (
                                    <span className="inline-flex items-center gap-1 truncate max-w-[180px]">
                                      <MapPin className="w-3.5 h-3.5 text-zinc-400" />
                                      {item.location}
                                    </span>
                                  )}

                                  {item.reminderMinutes > 0 && (
                                    <span className="inline-flex items-center gap-1 text-zinc-400">
                                      <Bell className="w-3 h-3 text-amber-500" />
                                      Mulai: {item.reminderMinutes}m sblm
                                    </span>
                                  )}

                                  {item.enableEndAlert && (
                                    <span className="inline-flex items-center gap-1 text-red-500/90 dark:text-red-400">
                                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
                                      Batas: {item.endTime}
                                    </span>
                                  )}

                                  {item.soundTone && (
                                    <span className="inline-flex items-center gap-1 text-[11px] text-indigo-600 dark:text-indigo-400 font-medium bg-indigo-50 dark:bg-indigo-950/40 px-1.5 py-0.5 rounded">
                                      🎵 {item.soundTone === 'alarm_dinamis' ? 'Alarm Dinamis' : item.soundTone === 'genta_klasik' ? 'Genta Klasik' : 'Melodi Lembut'}
                                      {item.alarmMode === 'loop' && (
                                        <span className="text-[9px] text-amber-600 dark:text-amber-400 font-bold ml-0.5">
                                          (Looping)
                                        </span>
                                      )}
                                    </span>
                                  )}

                                  {item.googleEventId && (
                                    <span className="inline-flex items-center gap-1 text-[11px] text-blue-600 dark:text-blue-400">
                                      <CalendarIcon className="w-3 h-3" />
                                      Tersinkron Google
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center gap-1 shrink-0">
                              <a
                                href={getGoogleCalendarWebUrl(item)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1.5 text-zinc-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30 rounded-lg transition-colors"
                                title="Buka di Google Calendar Web"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                              <button
                                onClick={() => onEditItem(item)}
                                className="p-1.5 text-zinc-400 hover:text-indigo-600 hover:bg-zinc-100 dark:hover:bg-zinc-700/60 rounded-lg transition-colors"
                                title="Edit Jadwal"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => onDeleteItem(item.id)}
                                className="p-1.5 text-zinc-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors"
                                title="Hapus Jadwal"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>

                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
