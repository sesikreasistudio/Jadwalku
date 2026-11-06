import React, { useState } from 'react';
import { 
  Search, 
  CheckCircle2, 
  Circle, 
  Clock, 
  MapPin, 
  Trash2, 
  Edit3, 
  Calendar as CalendarIcon,
  ExternalLink,
  Plus
} from 'lucide-react';
import { ScheduleItem, ActivityCategory, PriorityLevel } from '../types';
import { CATEGORIES } from '../utils/categories';
import { getGoogleCalendarWebUrl } from '../utils/googleCalendar';

interface ScheduleListViewProps {
  schedules: ScheduleItem[];
  onToggleComplete: (id: string) => void;
  onEditItem: (item: ScheduleItem) => void;
  onDeleteItem: (id: string) => void;
  onOpenAddModal: () => void;
}

export const ScheduleListView: React.FC<ScheduleListViewProps> = ({
  schedules,
  onToggleComplete,
  onEditItem,
  onDeleteItem,
  onOpenAddModal,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ActivityCategory | 'all'>('all');
  const [selectedPriority, setSelectedPriority] = useState<PriorityLevel | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'completed'>('all');

  // Filter schedules
  const filtered = schedules.filter((item) => {
    const matchesSearch = 
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.location && item.location.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesPriority = selectedPriority === 'all' || item.priority === selectedPriority;
    const matchesStatus = 
      statusFilter === 'all' || 
      (statusFilter === 'completed' && item.isCompleted) ||
      (statusFilter === 'pending' && !item.isCompleted);

    return matchesSearch && matchesCategory && matchesPriority && matchesStatus;
  });

  // Sort by start time
  const sorted = [...filtered].sort((a, b) => a.startTime.localeCompare(b.startTime));

  const totalCount = schedules.length;
  const completedCount = schedules.filter((s) => s.isCompleted).length;
  const completionPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm p-3.5 sm:p-6 transition-colors w-full max-w-full overflow-hidden">
      
      {/* Progress & Quick Stats Card */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-blue-500/10 border border-indigo-100 dark:border-indigo-900/40 mb-6">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
              Progres Kegiatan Hari Ini
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              {completedCount} dari {totalCount} kegiatan selesai ({completionPercent}%)
            </p>
          </div>
          <button
            onClick={onOpenAddModal}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tambah</span>
          </button>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-zinc-200 dark:bg-zinc-700 h-2.5 rounded-full overflow-hidden">
          <div 
            className="bg-indigo-600 h-full rounded-full transition-all duration-500"
            style={{ width: `${completionPercent}%` }}
          />
        </div>
      </div>

      {/* Search and Filters */}
      <div className="space-y-3 mb-6">
        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari kegiatan, catatan, atau lokasi..."
            className="w-full pl-9 pr-4 py-2 rounded-xl text-xs sm:text-sm bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
          />
        </div>

        {/* Category Filter Pills (Wrap on mobile, no horizontal scroll) */}
        <div className="flex flex-wrap items-center gap-1.5 pb-1">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
              selectedCategory === 'all'
                ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 hover:bg-zinc-200'
            }`}
          >
            Semua Kategori
          </button>
          {(Object.keys(CATEGORIES) as ActivityCategory[]).map((catKey) => {
            const cat = CATEGORIES[catKey];
            const isActive = selectedCategory === catKey;
            return (
              <button
                key={catKey}
                onClick={() => setSelectedCategory(catKey)}
                className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap border transition-colors ${
                  isActive
                    ? `${cat.bgLight} ${cat.bgDark} font-bold ring-2 ring-indigo-500/30`
                    : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 border-transparent hover:bg-zinc-200'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Status & Priority Filter Row */}
        <div className="flex items-center justify-between flex-wrap gap-2 pt-1 border-t border-zinc-100 dark:border-zinc-800 text-xs">
          {/* Status Filter */}
          <div className="flex items-center gap-1">
            <span className="text-zinc-400 mr-1">Status:</span>
            {(['all', 'pending', 'completed'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-2 py-0.5 rounded-md ${
                  statusFilter === st
                    ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 font-semibold'
                    : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
                }`}
              >
                {st === 'all' ? 'Semua' : st === 'pending' ? 'Belum Selesai' : 'Selesai'}
              </button>
            ))}
          </div>

          {/* Priority Filter */}
          <div className="flex items-center gap-1">
            <span className="text-zinc-400 mr-1">Prioritas:</span>
            {(['all', 'tinggi', 'sedang', 'rendah'] as const).map((pr) => (
              <button
                key={pr}
                onClick={() => setSelectedPriority(pr)}
                className={`px-2 py-0.5 rounded-md capitalize ${
                  selectedPriority === pr
                    ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 font-semibold'
                    : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
                }`}
              >
                {pr === 'all' ? 'Semua' : pr}
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* Schedules List */}
      {sorted.length === 0 ? (
        <div className="text-center py-12 px-4">
          <Clock className="w-10 h-10 text-zinc-300 dark:text-zinc-600 mx-auto mb-3" />
          <h4 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
            Tidak ada jadwal kegiatan ditemukan
          </h4>
          <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1 max-w-sm mx-auto">
            {searchTerm || selectedCategory !== 'all' || statusFilter !== 'all'
              ? 'Coba sesuaikan kata kunci pencarian atau filter yang dipilih.'
              : 'Mulai harimu dengan menambahkan agenda kegiatan harian.'}
          </p>
          <button
            onClick={onOpenAddModal}
            className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all"
          >
            + Tambah Jadwal Baru
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {sorted.map((item) => {
            const category = CATEGORIES[item.category] || CATEGORIES.kerja;
            return (
              <div
                key={item.id}
                className={`flex items-start justify-between gap-3 p-4 rounded-xl border transition-all ${
                  item.isCompleted
                    ? 'bg-zinc-50/60 dark:bg-zinc-900/40 border-zinc-200 dark:border-zinc-800/70 opacity-60'
                    : 'bg-white dark:bg-zinc-800/70 border-zinc-200 dark:border-zinc-700/80 hover:shadow-sm'
                }`}
              >
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <button
                    onClick={() => onToggleComplete(item.id)}
                    className="mt-0.5 text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors shrink-0"
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
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${category.bgLight} ${category.bgDark}`}>
                        {category.label}
                      </span>
                      {item.priority === 'tinggi' && (
                        <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300">
                          Tinggi
                        </span>
                      )}
                    </div>

                    {item.description && (
                      <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1 line-clamp-2">
                        {item.description}
                      </p>
                    )}

                    <div className="flex items-center gap-3 mt-2 text-xs text-zinc-500 dark:text-zinc-400 flex-wrap">
                      <span className="inline-flex items-center gap-1 font-mono font-medium text-zinc-700 dark:text-zinc-300">
                        <Clock className="w-3.5 h-3.5 text-indigo-500" />
                        {item.startTime} - {item.endTime}
                      </span>

                      {item.location && (
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-zinc-400" />
                          {item.location}
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
                          Google Calendar
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 shrink-0">
                  <a
                    href={getGoogleCalendarWebUrl(item)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 text-zinc-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30 rounded-lg transition-colors"
                    title="Buka di Google Calendar Web"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                  <button
                    onClick={() => onEditItem(item)}
                    className="p-1.5 text-zinc-400 hover:text-indigo-600 hover:bg-zinc-100 dark:hover:bg-zinc-700/60 rounded-lg transition-colors"
                    title="Edit Jadwal"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDeleteItem(item.id)}
                    className="p-1.5 text-zinc-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors"
                    title="Hapus Jadwal"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
