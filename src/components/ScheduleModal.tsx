import React, { useState, useEffect } from 'react';
import { 
  X, 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  AlignLeft, 
  Bell, 
  AlertCircle,
  Volume2,
  Music,
  Zap,
  BellRing,
  Timer
} from 'lucide-react';
import { ScheduleItem, ActivityCategory, PriorityLevel, SoundTone, AlarmPlaybackMode } from '../types';
import { CATEGORIES } from '../utils/categories';
import { sounds, SOUND_TONE_OPTIONS } from '../utils/sound';
import { Repeat } from 'lucide-react';

interface ScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: Omit<ScheduleItem, 'id' | 'updatedAt' | 'syncStatus'>, id?: string) => void;
  initialData?: ScheduleItem | null;
  defaultDate: string;
  defaultHour?: number;
  isGoogleConnected: boolean;
}

export const ScheduleModal: React.FC<ScheduleModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  defaultDate,
  defaultHour,
  isGoogleConnected,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(defaultDate);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');
  const [category, setCategory] = useState<ActivityCategory>('kerja');
  const [priority, setPriority] = useState<PriorityLevel>('sedang');
  const [location, setLocation] = useState('');

  // Ringtone and Auto-sound alert states
  const [soundTone, setSoundTone] = useState<SoundTone>('melodi_lembut');
  const [alarmMode, setAlarmMode] = useState<AlarmPlaybackMode>('once');
  const [enableStartAlert, setEnableStartAlert] = useState<boolean>(true);
  const [reminderMinutes, setReminderMinutes] = useState<number>(10);
  const [enableEndAlert, setEnableEndAlert] = useState<boolean>(true);
  const [endReminderMinutes, setEndReminderMinutes] = useState<number>(0);
  const [autoSoundAlert, setAutoSoundAlert] = useState<boolean>(true);

  const [syncToGoogle, setSyncToGoogle] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [playingTone, setPlayingTone] = useState<SoundTone | null>(null);

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setDescription(initialData.description || '');
      setDate(initialData.date);
      setStartTime(initialData.startTime);
      setEndTime(initialData.endTime);
      setCategory(initialData.category);
      setPriority(initialData.priority);
      setLocation(initialData.location || '');
      setSoundTone(initialData.soundTone || 'melodi_lembut');
      setAlarmMode(initialData.alarmMode || 'once');
      setEnableStartAlert(initialData.enableStartAlert !== undefined ? initialData.enableStartAlert : true);
      setReminderMinutes(initialData.reminderMinutes !== undefined ? initialData.reminderMinutes : 10);
      setEnableEndAlert(initialData.enableEndAlert !== undefined ? initialData.enableEndAlert : true);
      setEndReminderMinutes(initialData.endReminderMinutes !== undefined ? initialData.endReminderMinutes : 0);
      setAutoSoundAlert(initialData.autoSoundAlert !== undefined ? initialData.autoSoundAlert : true);
      setSyncToGoogle(Boolean(initialData.googleEventId));
    } else {
      setTitle('');
      setDescription('');
      setDate(defaultDate);
      const startH = defaultHour !== undefined ? defaultHour : 9;
      const endH = Math.min(startH + 8, 23); // Default 8 hours for work or 1 hour
      setStartTime(`${String(startH).padStart(2, '0')}:00`);
      setEndTime(`${String(endH).padStart(2, '0')}:00`);
      setCategory('kerja');
      setPriority('sedang');
      setLocation('');
      setSoundTone('melodi_lembut');
      setEnableStartAlert(true);
      setReminderMinutes(10);
      setEnableEndAlert(true);
      setEndReminderMinutes(0);
      setAutoSoundAlert(true);
      setSyncToGoogle(isGoogleConnected);
    }
    setErrorMsg('');
  }, [initialData, defaultDate, defaultHour, isOpen, isGoogleConnected]);

  if (!isOpen) return null;

  const handleTestSound = (tone: SoundTone, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setPlayingTone(tone);
    sounds.playTone(tone);
    setTimeout(() => {
      setPlayingTone(null);
    }, 1200);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMsg('Judul kegiatan wajib diisi.');
      return;
    }
    if (startTime >= endTime) {
      setErrorMsg('Waktu selesai/batas kerja harus lebih besar dari waktu mulai.');
      return;
    }

    onSave({
      title: title.trim(),
      description: description.trim(),
      date,
      startTime,
      endTime,
      category,
      priority,
      location: location.trim(),
      isCompleted: initialData ? initialData.isCompleted : false,
      soundTone,
      alarmMode,
      enableStartAlert,
      reminderMinutes: enableStartAlert ? reminderMinutes : 0,
      enableEndAlert,
      endReminderMinutes: enableEndAlert ? endReminderMinutes : 0,
      autoSoundAlert,
      googleEventId: syncToGoogle ? (initialData?.googleEventId || 'pending_sync') : undefined,
    }, initialData?.id);

    onClose();
  };

  const getToneIcon = (id: SoundTone) => {
    switch (id) {
      case 'melodi_lembut':
        return <Music className="w-4 h-4 text-emerald-500" />;
      case 'alarm_dinamis':
        return <Zap className="w-4 h-4 text-amber-500" />;
      case 'genta_klasik':
        return <BellRing className="w-4 h-4 text-indigo-500" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div 
        className="w-full max-w-xl bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden my-8 transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <CalendarIcon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                {initialData ? 'Edit Jadwal Kegiatan' : 'Tambah Jadwal Kegiatan'}
              </h3>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                Atur waktu mulai, batas selesai, dan nada dering pengingat otomatis
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body / Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[82vh] overflow-y-auto">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Nama Kegiatan <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Contoh: Jadwal Kerja Shift Pagi, Selesaikan Laporan, Rapat Klien..."
              className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              autoFocus
            />
          </div>

          {/* Category Picker */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
              Jenis Kegiatan
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(Object.keys(CATEGORIES) as ActivityCategory[]).map((catKey) => {
                const cat = CATEGORIES[catKey];
                const isSelected = category === catKey;
                return (
                  <button
                    type="button"
                    key={catKey}
                    onClick={() => setCategory(catKey)}
                    className={`px-2.5 py-2 rounded-xl text-xs font-medium border text-center transition-all ${
                      isSelected
                        ? `${cat.bgLight} ${cat.bgDark} font-bold ring-2 ring-indigo-500 shadow-xs`
                        : 'bg-zinc-50 dark:bg-zinc-800/50 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100'
                    }`}
                  >
                    {cat.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Date & Time Row (Mulai & Batas Jam Selesai) */}
          <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-indigo-500" /> Waktu Kerja & Batas Selesai
              </span>
              <span className="text-[11px] text-zinc-400">Durasi: {startTime} s/d {endTime}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                  Tanggal
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs sm:text-sm bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 mb-1 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-emerald-500" /> Jam Mulai
                </label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs sm:text-sm bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 mb-1 flex items-center gap-1">
                  <Timer className="w-3.5 h-3.5 text-red-500" /> Batas Jam Selesai
                </label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs sm:text-sm bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 font-mono"
                />
              </div>
            </div>
          </div>

          {/* RINGTONE SETTINGS (3 SOUND OPTIONS) */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-50/50 via-purple-50/30 to-blue-50/50 dark:from-indigo-950/20 dark:via-purple-950/10 dark:to-blue-950/20 border border-indigo-200/80 dark:border-indigo-800/60 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                <Volume2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" /> Pilihan Nada Dering Pengingat (3 Suara)
              </label>
              <span className="text-[10px] uppercase font-semibold tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-900/40 px-2 py-0.5 rounded-full">
                Audio Synthesizer
              </span>
            </div>

            <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
              Pilih melodi nada dering yang ingin dibunyikan saat pengingat aktif. Klik ikon speaker untuk mendengar contoh suara.
            </p>

            {/* 3 Tone Choice Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {SOUND_TONE_OPTIONS.map((option) => {
                const isSelected = soundTone === option.id;
                const isPlaying = playingTone === option.id;

                return (
                  <div
                    key={option.id}
                    onClick={() => setSoundTone(option.id)}
                    className={`relative p-3 rounded-xl border text-left cursor-pointer transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'bg-white dark:bg-zinc-800 border-indigo-500 ring-2 ring-indigo-500/30 shadow-sm'
                        : 'bg-white/70 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-700 hover:border-indigo-300 dark:hover:border-indigo-700'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5 font-bold text-xs text-zinc-900 dark:text-zinc-100">
                          {getToneIcon(option.id)}
                          <span>{option.label}</span>
                        </div>
                        {isSelected && (
                          <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
                        )}
                      </div>
                      <p className="text-[10px] text-zinc-500 dark:text-zinc-400 leading-tight">
                        {option.description}
                      </p>
                    </div>

                    {/* Preview Button */}
                    <button
                      type="button"
                      onClick={(e) => handleTestSound(option.id, e)}
                      className={`mt-2.5 w-full py-1 px-2 rounded-lg text-[10px] font-semibold flex items-center justify-center gap-1 transition-all ${
                        isPlaying
                          ? 'bg-indigo-600 text-white animate-pulse'
                          : 'bg-zinc-100 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-zinc-600'
                      }`}
                    >
                      <Volume2 className="w-3 h-3" />
                      <span>{isPlaying ? 'Memutar...' : 'Tes Bunyi'}</span>
                    </button>
                  </div>
                );
              })}
            </div>

            {/* OPSI BUNYI ALARM: SEKALI vs BERULANG (LOOPING) */}
            <div className="p-3 rounded-xl bg-white/80 dark:bg-zinc-800/70 border border-indigo-100 dark:border-indigo-900/40 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
                  <Repeat className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                  Mode Bunyi Alarm
                </span>
                <span className="text-[10px] text-zinc-500 dark:text-zinc-400">
                  {alarmMode === 'loop' ? 'Berulang terus sampai dimatikan' : '1 Kali bunyi saja'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setAlarmMode('once')}
                  className={`py-1.5 px-2.5 rounded-lg text-xs font-semibold border flex items-center justify-center gap-1.5 transition-all ${
                    alarmMode === 'once'
                      ? 'bg-indigo-600 text-white border-transparent shadow-xs'
                      : 'bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100'
                  }`}
                >
                  <Bell className="w-3.5 h-3.5" />
                  <span>Bunyi Sekali</span>
                </button>

                <button
                  type="button"
                  onClick={() => setAlarmMode('loop')}
                  className={`py-1.5 px-2.5 rounded-lg text-xs font-semibold border flex items-center justify-center gap-1.5 transition-all ${
                    alarmMode === 'loop'
                      ? 'bg-indigo-600 text-white border-transparent shadow-xs'
                      : 'bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100'
                  }`}
                >
                  <Repeat className="w-3.5 h-3.5" />
                  <span>Berulang (Looping)</span>
                </button>
              </div>
            </div>

            {/* PENGATURAN PENGINGAT OTOMATIS: MULAI & BATAS JAM SELESAI */}
            <div className="pt-2 border-t border-indigo-100 dark:border-indigo-900/50 space-y-2.5">
              
              {/* Pengingat Jam Mulai */}
              <div className="flex items-center justify-between flex-wrap gap-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                  <input
                    type="checkbox"
                    checked={enableStartAlert}
                    onChange={(e) => setEnableStartAlert(e.target.checked)}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>Bunyikan Pengingat Jam Mulai</span>
                </label>

                {enableStartAlert && (
                  <select
                    value={reminderMinutes}
                    onChange={(e) => setReminderMinutes(Number(e.target.value))}
                    className="px-2.5 py-1 rounded-lg text-xs bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 focus:outline-none"
                  >
                    <option value={0}>Tepat saat jadwal mulai (0 menit)</option>
                    <option value={5}>5 Menit sebelum mulai</option>
                    <option value={10}>10 Menit sebelum mulai</option>
                    <option value={15}>15 Menit sebelum mulai</option>
                    <option value={30}>30 Menit sebelum mulai</option>
                  </select>
                )}
              </div>

              {/* Pengingat Batas Jam Selesai */}
              <div className="flex items-center justify-between flex-wrap gap-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                  <input
                    type="checkbox"
                    checked={enableEndAlert}
                    onChange={(e) => setEnableEndAlert(e.target.checked)}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-red-700 dark:text-red-400">Bunyikan Pengingat Batas Jam Selesai</span>
                </label>

                {enableEndAlert && (
                  <select
                    value={endReminderMinutes}
                    onChange={(e) => setEndReminderMinutes(Number(e.target.value))}
                    className="px-2.5 py-1 rounded-lg text-xs bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 focus:outline-none"
                  >
                    <option value={0}>Tepat batas jam selesai ({endTime})</option>
                    <option value={5}>5 Menit sebelum jam selesai</option>
                    <option value={10}>10 Menit sebelum jam selesai</option>
                    <option value={15}>15 Menit sebelum jam selesai</option>
                  </select>
                )}
              </div>

              {/* Auto Sound Alert Toggle */}
              <div className="p-2.5 rounded-xl bg-white/80 dark:bg-zinc-800/70 border border-indigo-100 dark:border-indigo-900/40 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
                    <Bell className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                    Putar Nada Dering Otomatis
                  </p>
                  <p className="text-[10px] text-zinc-500 dark:text-zinc-400">
                    Otomatis berbunyi tanpa perlu sentuhan saat jam pengingat tiba
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={autoSoundAlert}
                  onChange={(e) => setAutoSoundAlert(e.target.checked)}
                  className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                />
              </div>

            </div>
          </div>

          {/* Priority */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Tingkat Prioritas
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as PriorityLevel)}
                className="w-full px-3 py-2 rounded-xl text-xs sm:text-sm bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              >
                <option value="rendah">Rendah (Dapat digeser)</option>
                <option value="sedang">Sedang (Standar)</option>
                <option value="tinggi">Tinggi (Penting & Mendesak)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-zinc-400" /> Lokasi / Tautan Meeting
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Contoh: Kantor Utama, Zoom / Meet, Lapangan..."
                className="w-full px-3 py-2 rounded-xl text-xs sm:text-sm bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1 flex items-center gap-1">
              <AlignLeft className="w-3.5 h-3.5 text-zinc-400" /> Catatan / Rincian Kegiatan
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tambahkan poin bahasan, checklist, atau catatan penting..."
              className="w-full px-3 py-2 rounded-xl text-xs sm:text-sm bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-none"
            />
          </div>

          {/* Google Calendar Sync Checkbox */}
          <div className="p-3 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/60 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CalendarIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <div>
                <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                  Sinkronkan ke Google Kalender
                </p>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                  {isGoogleConnected 
                    ? 'Otomatis membuat event di akun Google Kalender terhubung.'
                    : 'Masuk Google diperlukan untuk sinkronisasi otomatis, atau gunakan ekspor ICS.'}
                </p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={syncToGoogle}
              onChange={(e) => setSyncToGoogle(e.target.checked)}
              className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
            />
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-100 dark:border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20 active:scale-95 transition-all flex items-center gap-1.5"
            >
              <Bell className="w-3.5 h-3.5" />
              <span>{initialData ? 'Simpan Perubahan' : 'Tambahkan ke Jadwal'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
