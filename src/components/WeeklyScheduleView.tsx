import React, { useState } from 'react';
import { 
  CalendarDays, 
  Plus, 
  Edit3, 
  Trash2, 
  Clock, 
  Check, 
  X, 
  Save, 
  Copy, 
  LayoutGrid, 
  Calendar, 
  Sparkles,
  MapPin,
  Tag,
  AlertCircle
} from 'lucide-react';
import { WeeklyScheduleItem, DayOfWeek, ActivityCategory, PriorityLevel, ScheduleItem } from '../types';
import { CATEGORIES } from '../utils/categories';
import { sounds } from '../utils/sound';

interface WeeklyScheduleViewProps {
  weeklyItems: WeeklyScheduleItem[];
  onSaveWeeklyItems: (items: WeeklyScheduleItem[]) => void;
  onCopyToDailySchedule?: (item: Omit<ScheduleItem, 'id' | 'updatedAt' | 'syncStatus'>) => void;
  selectedDate: string;
}

export const DAYS_OF_WEEK: { id: DayOfWeek; label: string; short: string; desc: string }[] = [
  { id: 'senin', label: 'Senin', short: 'Sen', desc: 'Awal pekan kerja & produktivitas' },
  { id: 'selasa', label: 'Selasa', short: 'Sel', desc: 'Eksekusi target & pengerjaan' },
  { id: 'rabu', label: 'Rabu', short: 'Rab', desc: 'Pertengahan pekan & evaluasi' },
  { id: 'kamis', label: 'Kamis', short: 'Kam', desc: 'Deep focus & koordinasi' },
  { id: 'jumat', label: 'Jumat', short: 'Jum', desc: 'Penyelesaian mingguan & ibadah' },
  { id: 'sabtu', label: 'Sabtu', short: 'Sab', desc: 'Olahraga, keluarga & hobi' },
  { id: 'minggu', label: 'Minggu', short: 'Min', desc: 'Istirahat & persiapan pekan baru' },
];

export const WeeklyScheduleView: React.FC<WeeklyScheduleViewProps> = ({
  weeklyItems,
  onSaveWeeklyItems,
  onCopyToDailySchedule,
  selectedDate,
}) => {
  // Currently active day for focused editing
  const [selectedDay, setSelectedDay] = useState<DayOfWeek>('senin');
  const [viewMode, setViewMode] = useState<'focused' | 'all'>('focused');
  
  // Inline edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editStartTime, setEditStartTime] = useState('');
  const [editEndTime, setEditEndTime] = useState('');
  const [editCategory, setEditCategory] = useState<ActivityCategory>('kerja');
  const [editLocation, setEditLocation] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [editDay, setEditDay] = useState<DayOfWeek>('senin');

  // New item modal / drawer state
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newStartTime, setNewStartTime] = useState('09:00');
  const [newEndTime, setNewEndTime] = useState('10:00');
  const [newCategory, setNewCategory] = useState<ActivityCategory>('kerja');
  const [newDay, setNewDay] = useState<DayOfWeek>('senin');
  const [newLocation, setNewLocation] = useState('');
  const [newNotes, setNewNotes] = useState('');
  const [newPriority, setNewPriority] = useState<PriorityLevel>('sedang');
  const [errorMsg, setErrorMsg] = useState('');

  // Start inline editing
  const handleStartEdit = (item: WeeklyScheduleItem) => {
    setEditingId(item.id);
    setEditTitle(item.title);
    setEditStartTime(item.startTime);
    setEditEndTime(item.endTime);
    setEditCategory(item.category);
    setEditLocation(item.location || '');
    setEditNotes(item.notes || '');
    setEditDay(item.day);
  };

  // Save inline edit
  const handleSaveEdit = (id: string) => {
    if (!editTitle.trim()) return;
    if (editStartTime >= editEndTime) {
      alert('Jam selesai harus lebih besar dari jam mulai.');
      return;
    }

    const updated = weeklyItems.map((item) => {
      if (item.id === id) {
        return {
          ...item,
          title: editTitle.trim(),
          startTime: editStartTime,
          endTime: editEndTime,
          category: editCategory,
          day: editDay,
          location: editLocation.trim() || undefined,
          notes: editNotes.trim() || undefined,
        };
      }
      return item;
    });

    onSaveWeeklyItems(updated);
    sounds.playSuccessChime();
    setEditingId(null);
  };

  // Cancel inline edit
  const handleCancelEdit = () => {
    setEditingId(null);
  };

  // Delete item
  const handleDeleteItem = (id: string) => {
    if (confirm('Hapus kegiatan mingguan ini?')) {
      const updated = weeklyItems.filter((item) => item.id !== id);
      onSaveWeeklyItems(updated);
      sounds.playSuccessChime();
    }
  };

  // Toggle active state
  const handleToggleActive = (id: string) => {
    const updated = weeklyItems.map((item) => {
      if (item.id === id) {
        return { ...item, isActive: item.isActive === false ? true : false };
      }
      return item;
    });
    onSaveWeeklyItems(updated);
  };

  // Open add new modal with default day
  const handleOpenAddForDay = (day: DayOfWeek) => {
    setNewDay(day);
    setNewTitle('');
    setNewStartTime('09:00');
    setNewEndTime('10:00');
    setNewCategory('kerja');
    setNewLocation('');
    setNewNotes('');
    setErrorMsg('');
    setIsAddingNew(true);
  };

  // Save new item
  const handleSaveNewItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      setErrorMsg('Nama kegiatan wajib diisi.');
      return;
    }
    if (newStartTime >= newEndTime) {
      setErrorMsg('Jam selesai harus lebih besar dari jam mulai.');
      return;
    }

    const newItem: WeeklyScheduleItem = {
      id: `wk-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      day: newDay,
      title: newTitle.trim(),
      startTime: newStartTime,
      endTime: newEndTime,
      category: newCategory,
      priority: newPriority,
      location: newLocation.trim() || undefined,
      notes: newNotes.trim() || undefined,
      isActive: true,
    };

    const updated = [...weeklyItems, newItem];
    onSaveWeeklyItems(updated);
    sounds.playSuccessChime();
    setIsAddingNew(false);
  };

  // Copy to today's schedule
  const handleCopyItemToDaily = (item: WeeklyScheduleItem) => {
    if (!onCopyToDailySchedule) return;
    onCopyToDailySchedule({
      title: item.title,
      description: item.notes || item.location ? `${item.notes || ''} ${item.location ? `(Lokasi: ${item.location})` : ''}`.trim() : undefined,
      date: selectedDate,
      startTime: item.startTime,
      endTime: item.endTime,
      category: item.category,
      priority: item.priority || 'sedang',
      location: item.location,
      isCompleted: false,
      reminderMinutes: 10,
      autoSoundAlert: true,
    });
    sounds.playSuccessChime();
    alert(`Kegiatan "${item.title}" berhasil disalin ke jadwal harian tanggal ${selectedDate}!`);
  };

  // Filter items by day
  const getItemsForDay = (day: DayOfWeek) => {
    return weeklyItems
      .filter((item) => item.day === day)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  };

  const totalWeeklyCount = weeklyItems.length;

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm p-3.5 sm:p-6 transition-colors w-full max-w-full overflow-hidden space-y-5">
      
      {/* Top Header Bar */}
      <div className="flex items-center justify-between flex-wrap gap-3 pb-4 border-b border-zinc-100 dark:border-zinc-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 shadow-xs">
            <CalendarDays className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-100">
                Jadwal Kegiatan Mingguan (Senin - Minggu)
              </h2>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/60">
                {totalWeeklyCount} Kegiatan
              </span>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              Kelola rutinitas mingguan Anda. Ubah nama kegiatan, jam, dan simpan perubahan kapan saja.
            </p>
          </div>
        </div>

        {/* View Switcher & Add Button */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="p-1 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center text-xs">
            <button
              type="button"
              onClick={() => setViewMode('focused')}
              className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-colors ${
                viewMode === 'focused'
                  ? 'bg-white dark:bg-zinc-700 text-indigo-600 dark:text-indigo-300 shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Per Hari</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('all')}
              className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-colors ${
                viewMode === 'all'
                  ? 'bg-white dark:bg-zinc-700 text-indigo-600 dark:text-indigo-300 shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Semua Hari (7 Hari)</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => handleOpenAddForDay(selectedDay)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all shrink-0 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Kegiatan</span>
          </button>
        </div>
      </div>

      {/* 7 Days Navigation Selector (Senin - Minggu) */}
      <div className="flex items-center gap-1.5 flex-wrap w-full">
        {DAYS_OF_WEEK.map((day) => {
          const isSelected = selectedDay === day.id;
          const count = getItemsForDay(day.id).length;

          return (
            <button
              key={day.id}
              type="button"
              onClick={() => setSelectedDay(day.id)}
              className={`flex-1 min-w-[75px] sm:min-w-[95px] p-2 sm:p-2.5 rounded-2xl border text-center transition-all ${
                isSelected
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/20 ring-2 ring-indigo-500/30'
                  : 'bg-zinc-50 dark:bg-zinc-800/60 border-zinc-200 dark:border-zinc-700/80 text-zinc-700 dark:text-zinc-300 hover:border-indigo-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
              }`}
            >
              <div className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider opacity-80">
                {day.short}
              </div>
              <div className="text-xs sm:text-sm font-bold mt-0.5 truncate">
                {day.label}
              </div>
              <div className={`mt-1 text-[10px] font-mono px-1.5 py-0.2 rounded-full inline-block ${
                isSelected 
                  ? 'bg-white/20 text-white' 
                  : 'bg-zinc-200/80 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-400'
              }`}>
                {count} agenda
              </div>
            </button>
          );
        })}
      </div>

      {/* Focused Day View (Edit in-place, Save, Reorder) */}
      {viewMode === 'focused' && (
        <div className="space-y-4">
          {/* Day Banner & Add action */}
          <div className="flex items-center justify-between p-3.5 sm:p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/80 flex-wrap gap-2">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-zinc-100 capitalize flex items-center gap-2">
                <span>Hari {DAYS_OF_WEEK.find((d) => d.id === selectedDay)?.label}</span>
                <span className="text-xs font-normal text-zinc-500 dark:text-zinc-400">
                  — {DAYS_OF_WEEK.find((d) => d.id === selectedDay)?.desc}
                </span>
              </h3>
            </div>

            <button
              type="button"
              onClick={() => handleOpenAddForDay(selectedDay)}
              className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Tambah di hari {DAYS_OF_WEEK.find((d) => d.id === selectedDay)?.label}</span>
            </button>
          </div>

          {/* List of Activities for this Day */}
          {getItemsForDay(selectedDay).length === 0 ? (
            <div className="text-center py-12 px-4 rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800 text-zinc-400">
              <CalendarDays className="w-10 h-10 mx-auto text-zinc-300 dark:text-zinc-600 mb-2" />
              <p className="text-xs sm:text-sm font-semibold">
                Belum ada jadwal kegiatan untuk hari {DAYS_OF_WEEK.find((d) => d.id === selectedDay)?.label}.
              </p>
              <button
                type="button"
                onClick={() => handleOpenAddForDay(selectedDay)}
                className="mt-3 px-3 py-1.5 bg-indigo-600 text-white rounded-xl text-xs font-semibold shadow-xs"
              >
                + Tambah Kegiatan Sekarang
              </button>
            </div>
          ) : (
            <div className="space-y-2.5">
              {getItemsForDay(selectedDay).map((item) => {
                const isEditing = editingId === item.id;
                const category = CATEGORIES[item.category] || CATEGORIES.kerja;

                if (isEditing) {
                  return (
                    <div
                      key={item.id}
                      className="p-4 rounded-2xl border-2 border-indigo-500 bg-indigo-50/20 dark:bg-indigo-950/20 shadow-md space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                          <Edit3 className="w-3.5 h-3.5" /> Edit Kegiatan Mingguan
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleSaveEdit(item.id)}
                            className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 shadow-xs transition-all"
                          >
                            <Save className="w-3 h-3" />
                            <span>Simpan</span>
                          </button>
                          <button
                            type="button"
                            onClick={handleCancelEdit}
                            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                            title="Batal Edit"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Edit Fields */}
                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
                        <div className="sm:col-span-6">
                          <label className="block text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                            Nama Kegiatan
                          </label>
                          <input
                            type="text"
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            className="w-full px-3 py-1.5 rounded-xl text-xs sm:text-sm bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                            placeholder="Contoh: Rapat Mingguan, Olahraga..."
                            autoFocus
                          />
                        </div>

                        <div className="sm:col-span-3">
                          <label className="block text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                            Jam Mulai
                          </label>
                          <input
                            type="time"
                            value={editStartTime}
                            onChange={(e) => setEditStartTime(e.target.value)}
                            className="w-full px-2.5 py-1.5 rounded-xl text-xs sm:text-sm bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 font-mono text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                          />
                        </div>

                        <div className="sm:col-span-3">
                          <label className="block text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                            Jam Selesai
                          </label>
                          <input
                            type="time"
                            value={editEndTime}
                            onChange={(e) => setEditEndTime(e.target.value)}
                            className="w-full px-2.5 py-1.5 rounded-xl text-xs sm:text-sm bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 font-mono text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                          />
                        </div>

                        <div className="sm:col-span-4">
                          <label className="block text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                            Pindah Hari
                          </label>
                          <select
                            value={editDay}
                            onChange={(e) => setEditDay(e.target.value as DayOfWeek)}
                            className="w-full px-2.5 py-1.5 rounded-xl text-xs bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none"
                          >
                            {DAYS_OF_WEEK.map((d) => (
                              <option key={d.id} value={d.id}>Hari {d.label}</option>
                            ))}
                          </select>
                        </div>

                        <div className="sm:col-span-4">
                          <label className="block text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                            Kategori
                          </label>
                          <select
                            value={editCategory}
                            onChange={(e) => setEditCategory(e.target.value as ActivityCategory)}
                            className="w-full px-2.5 py-1.5 rounded-xl text-xs bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none"
                          >
                            {(Object.keys(CATEGORIES) as ActivityCategory[]).map((cat) => (
                              <option key={cat} value={cat}>{CATEGORIES[cat].label}</option>
                            ))}
                          </select>
                        </div>

                        <div className="sm:col-span-4">
                          <label className="block text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                            Lokasi (Opsional)
                          </label>
                          <input
                            type="text"
                            value={editLocation}
                            onChange={(e) => setEditLocation(e.target.value)}
                            placeholder="Lokasi / Ruangan"
                            className="w-full px-2.5 py-1.5 rounded-xl text-xs bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none"
                          />
                        </div>

                        <div className="sm:col-span-12">
                          <label className="block text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                            Catatan Detail
                          </label>
                          <input
                            type="text"
                            value={editNotes}
                            onChange={(e) => setEditNotes(e.target.value)}
                            placeholder="Catatan tambahan untuk kegiatan ini..."
                            className="w-full px-3 py-1.5 rounded-xl text-xs bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  );
                }

                return (
                  <div
                    key={item.id}
                    className="p-3.5 sm:p-4 rounded-2xl border border-zinc-200 dark:border-zinc-700/80 bg-white dark:bg-zinc-800/80 hover:border-indigo-300 dark:hover:border-indigo-600/60 shadow-2xs transition-all flex items-start justify-between gap-3"
                  >
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      {/* Category Color Bar */}
                      <div className="w-1.5 h-10 rounded-full bg-indigo-500 shrink-0 mt-0.5" />

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                            {item.title}
                          </h4>

                          {/* Category Badge */}
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${category.bgLight} ${category.bgDark}`}>
                            {category.label}
                          </span>

                          {/* Active / Inactive status */}
                          {item.isActive === false && (
                            <span className="text-[10px] text-zinc-400 bg-zinc-100 dark:bg-zinc-700 px-1.5 py-0.5 rounded">
                              Nonaktif
                            </span>
                          )}
                        </div>

                        {/* Meta: Time, Location, Notes */}
                        <div className="flex items-center gap-3 mt-1.5 text-xs text-zinc-500 dark:text-zinc-400 flex-wrap">
                          <span className="font-mono font-medium text-zinc-800 dark:text-zinc-200 flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-indigo-500" />
                            {item.startTime} - {item.endTime}
                          </span>

                          {item.location && (
                            <span className="flex items-center gap-1 truncate max-w-[180px]">
                              <MapPin className="w-3.5 h-3.5 text-zinc-400" />
                              {item.location}
                            </span>
                          )}
                        </div>

                        {item.notes && (
                          <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1 line-clamp-2">
                            {item.notes}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons: Copy to today, Edit, Delete */}
                    <div className="flex items-center gap-1 shrink-0">
                      {onCopyToDailySchedule && (
                        <button
                          type="button"
                          onClick={() => handleCopyItemToDaily(item)}
                          className="p-1.5 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 rounded-lg transition-colors flex items-center gap-1 text-[11px] font-medium"
                          title="Salin kegiatan ini ke jadwal harian tanggal aktif"
                        >
                          <Copy className="w-3.5 h-3.5" />
                          <span className="hidden md:inline">Jadikan Jadwal</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => handleStartEdit(item)}
                        className="p-1.5 text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-lg transition-colors"
                        title="Edit nama kegiatan & jam"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteItem(item.id)}
                        className="p-1.5 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors"
                        title="Hapus kegiatan mingguan"
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
      )}

      {/* Overview 7 Days Grid Mode (Senin - Minggu side-by-side or stacked cards) */}
      {viewMode === 'all' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-3 w-full">
          {DAYS_OF_WEEK.map((day) => {
            const dayItems = getItemsForDay(day.id);
            return (
              <div
                key={day.id}
                className="p-3 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-800/40 flex flex-col justify-between space-y-2.5 min-h-[160px]"
              >
                <div>
                  <div className="flex items-center justify-between pb-1.5 border-b border-zinc-200/60 dark:border-zinc-700/60">
                    <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                      {day.label}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedDay(day.id);
                        handleOpenAddForDay(day.id);
                      }}
                      className="p-0.5 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 rounded"
                      title={`Tambah kegiatan di hari ${day.label}`}
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="space-y-1.5 mt-2">
                    {dayItems.length === 0 ? (
                      <p className="text-[10px] text-zinc-400 italic py-2 text-center">
                        Kosong
                      </p>
                    ) : (
                      dayItems.map((item) => (
                        <div
                          key={item.id}
                          onClick={() => {
                            setSelectedDay(day.id);
                            setViewMode('focused');
                            handleStartEdit(item);
                          }}
                          className="p-2 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-left cursor-pointer hover:border-indigo-400 hover:shadow-2xs transition-all"
                          title="Klik untuk mengedit"
                        >
                          <div className="text-[11px] font-bold text-zinc-900 dark:text-zinc-100 truncate">
                            {item.title}
                          </div>
                          <div className="text-[10px] font-mono text-indigo-600 dark:text-indigo-400 mt-0.5">
                            {item.startTime} - {item.endTime}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedDay(day.id);
                    setViewMode('focused');
                  }}
                  className="w-full py-1 text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline text-center"
                >
                  Kelola Hari {day.short} →
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Tambah Kegiatan Mingguan Baru */}
      {isAddingNew && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div 
            className="w-full max-w-lg bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-2xl p-5 sm:p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 flex items-center justify-center">
                  <CalendarDays className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                  Tambah Jadwal Mingguan
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddingNew(false)}
                className="p-1 rounded-full text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSaveNewItem} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Pilih Hari *
                </label>
                <div className="grid grid-cols-7 gap-1">
                  {DAYS_OF_WEEK.map((d) => (
                    <button
                      type="button"
                      key={d.id}
                      onClick={() => setNewDay(d.id)}
                      className={`py-1.5 px-1 rounded-xl text-xs font-bold transition-all text-center ${
                        newDay === d.id
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200'
                      }`}
                    >
                      {d.short}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Nama Kegiatan Mingguan *
                </label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Misal: Rapat Tim, Olahraga Pagi, Evaluasi Sprint..."
                  className="w-full px-3 py-2 rounded-xl text-xs sm:text-sm bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-emerald-500" /> Jam Mulai *
                  </label>
                  <input
                    type="time"
                    value={newStartTime}
                    onChange={(e) => setNewStartTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-xs sm:text-sm bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 font-mono text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-red-500" /> Jam Selesai *
                  </label>
                  <input
                    type="time"
                    value={newEndTime}
                    onChange={(e) => setNewEndTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-xs sm:text-sm bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 font-mono text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Kategori Kegiatan
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as ActivityCategory)}
                    className="w-full px-3 py-2 rounded-xl text-xs sm:text-sm bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none"
                  >
                    {(Object.keys(CATEGORIES) as ActivityCategory[]).map((cat) => (
                      <option key={cat} value={cat}>{CATEGORIES[cat].label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Lokasi (Opsional)
                  </label>
                  <input
                    type="text"
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value)}
                    placeholder="Ruang / Online / Lokasi"
                    className="w-full px-3 py-2 rounded-xl text-xs sm:text-sm bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Catatan / Keterangan
                </label>
                <textarea
                  rows={2}
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="Instruksi, materi pembahasan, atau perlengkapan..."
                  className="w-full px-3 py-2 rounded-xl text-xs sm:text-sm bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsAddingNew(false)}
                  className="px-4 py-2 text-xs text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all"
                >
                  Simpan Kegiatan Mingguan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
