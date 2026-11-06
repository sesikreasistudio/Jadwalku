import { useState, useEffect, useRef } from 'react';
import { User } from 'firebase/auth';
import { 
  ScheduleItem, 
  QuickNote, 
  E2EEConfig,
  SoundTone,
  AlarmPlaybackMode
} from './types';
import { 
  loadSchedules, 
  saveSchedules, 
  loadNotes, 
  saveNotes, 
  loadE2EEConfig, 
  saveE2EEConfig, 
  getTodayDateString, 
  getSyncQueue, 
  addToSyncQueue, 
  clearSyncQueue 
} from './utils/storage';
import { 
  initAuth, 
  googleSignIn, 
  googleLogout 
} from './firebase';
import { 
  createGoogleCalendarEvent, 
  deleteGoogleCalendarEvent 
} from './utils/googleCalendar';
import { 
  requestNotificationPermission, 
  sendBrowserNotification 
} from './utils/notifications';
import { sounds } from './utils/sound';

import { Header } from './components/Header';
import { DailyTimeline } from './components/DailyTimeline';
import { ScheduleListView } from './components/ScheduleListView';
import { QuickNotes } from './components/QuickNotes';
import { ScheduleModal } from './components/ScheduleModal';
import { GoogleCalendarSyncModal } from './components/GoogleCalendarSyncModal';
import { CrossDeviceSyncModal } from './components/CrossDeviceSyncModal';
import { E2EESettingsModal } from './components/E2EESettingsModal';
import { RingtoneModal } from './components/RingtoneModal';
import { SmartAlertToast, SmartAlert } from './components/SmartAlertToast';
import { MobileNavigation, ActiveTab } from './components/MobileNavigation';
import { 
  Clock, 
  ListTodo, 
  StickyNote, 
  RefreshCw, 
  Plus, 
  ShieldCheck, 
  BellRing,
  AlertCircle
} from 'lucide-react';

export default function App() {
  // Theme state
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('jadwalku_theme');
      if (saved) return saved === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  // Selected date
  const [selectedDate, setSelectedDate] = useState<string>(getTodayDateString());
  const [activeTab, setActiveTab] = useState<ActiveTab>('timeline');

  // Core Data
  const [schedules, setSchedules] = useState<ScheduleItem[]>(() => loadSchedules());
  const [notes, setNotes] = useState<QuickNote[]>(() => loadNotes());
  const [e2eeConfig, setE2EEConfig] = useState<E2EEConfig>(() => loadE2EEConfig());
  const [e2eePassphrase, setE2EEPassphrase] = useState<string>('');

  // Online / Offline & Sync State
  const [isOnline, setIsOnline] = useState<boolean>(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [pendingSyncCount, setPendingSyncCount] = useState<number>(0);
  const [lastSyncedTimestamp, setLastSyncedTimestamp] = useState<number>(Date.now());
  const [onlineBanner, setOnlineBanner] = useState<string | null>(null);

  // Auth State
  const [user, setUser] = useState<User | null>(null);

  // Modals
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<ScheduleItem | null>(null);
  const [defaultHourForAdd, setDefaultHourForAdd] = useState<number | undefined>(undefined);
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  const [isCrossDeviceModalOpen, setIsCrossDeviceModalOpen] = useState(false);
  const [isE2EEModalOpen, setIsE2EEModalOpen] = useState(false);
  const [isRingtoneModalOpen, setIsRingtoneModalOpen] = useState(false);

  // Default sound tone (3 choices)
  const [defaultSoundTone, setDefaultSoundTone] = useState<SoundTone>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('jadwalku_default_sound') as SoundTone;
      if (saved) return saved;
    }
    return 'melodi_lembut';
  });

  // Default alarm mode: 'once' (bunyi sekali) or 'loop' (bunyi berulang)
  const [defaultAlarmMode, setDefaultAlarmMode] = useState<AlarmPlaybackMode>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('jadwalku_default_alarm_mode') as AlarmPlaybackMode;
      if (saved) return saved;
    }
    return 'once';
  });

  // Master Sound Volume (0.0 to 1.0)
  const [soundVolume, setSoundVolume] = useState<number>(() => {
    return sounds.getVolume();
  });
  const [isAudioLooping, setIsAudioLooping] = useState<boolean>(() => sounds.isLooping());

  useEffect(() => {
    const unsub = sounds.subscribeLoopState((loopActive) => {
      setIsAudioLooping(loopActive);
    });
    return () => unsub();
  }, []);

  // Smart Alert State
  const [smartAlert, setSmartAlert] = useState<SmartAlert | null>(null);
  const notifiedScheduleIds = useRef<Set<string>>(new Set());

  // Apply dark class to document
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('jadwalku_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('jadwalku_theme', 'light');
    }
  }, [isDarkMode]);

  // Sync queue count updater
  useEffect(() => {
    setPendingSyncCount(getSyncQueue().length);
  }, [schedules, notes]);

  // Initialize Firebase Auth listener
  useEffect(() => {
    const unsubscribe = initAuth(
      (currentUser) => setUser(currentUser),
      () => setUser(null)
    );
    return () => unsubscribe();
  }, []);

  // Request notification permission on first interaction
  useEffect(() => {
    requestNotificationPermission();
  }, []);

  // Online / Offline Listeners with Automatic Background Re-sync
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setOnlineBanner('Perangkat kembali online! Menyinkronkan perubahan otomatis...');
      sounds.playSuccessChime();

      // Trigger automatic background synchronization
      triggerAutoSync();
      setTimeout(() => setOnlineBanner(null), 4000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setOnlineBanner('Koneksi terputus. Mode offline aktif — data disimpan lokal & dienkripsi.');
      setTimeout(() => setOnlineBanner(null), 4000);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [schedules, user]);

  // Automatic Re-sync logic
  const triggerAutoSync = async () => {
    setIsSyncing(true);
    const queue = getSyncQueue();

    // If user is connected to Google, push any unsynced schedules created while offline
    if (user && isOnline) {
      const unsynced = schedules.filter((s) => s.googleEventId === 'pending_sync');
      for (const item of unsynced) {
        const res = await createGoogleCalendarEvent(item);
        if (res.success && res.googleEventId) {
          item.googleEventId = res.googleEventId;
          item.syncStatus = 'synced';
        }
      }
      setSchedules([...schedules]);
      saveSchedules(schedules);
    }

    clearSyncQueue();
    setPendingSyncCount(0);
    setLastSyncedTimestamp(Date.now());
    setIsSyncing(false);
  };

  // Smart Notification & Deadline Detector Engine
  useEffect(() => {
    const checkUpcomingDeadlines = () => {
      const now = new Date();
      const yr = now.getFullYear();
      const mo = String(now.getMonth() + 1).padStart(2, '0');
      const dy = String(now.getDate()).padStart(2, '0');
      const todayStr = `${yr}-${mo}-${dy}`;

      // Only check schedules for today
      const todaySchedules = schedules.filter((s) => s.date === todayStr && !s.isCompleted);
      const currentMinutes = now.getHours() * 60 + now.getMinutes();

      for (const item of todaySchedules) {
        const tone: SoundTone = item.soundTone || defaultSoundTone;
        const mode: AlarmPlaybackMode = item.alarmMode || defaultAlarmMode;
        const autoRing = item.autoSoundAlert !== false;

        // Parse Start Time
        const [sh, sm] = item.startTime.split(':').map(Number);
        const itemStartMinutes = sh * 60 + sm;
        const minutesUntilStart = itemStartMinutes - currentMinutes;

        // Parse End Time (Batas Jam Selesai / Deadline)
        const [eh, em] = item.endTime.split(':').map(Number);
        const itemEndMinutes = eh * 60 + em;
        const minutesUntilEnd = itemEndMinutes - currentMinutes;

        // 1. BATAS JAM SELESAI (DEADLINE) - EXACT TIME REACHED
        if (
          item.enableEndAlert !== false &&
          minutesUntilEnd === 0 &&
          !notifiedScheduleIds.current.has(`${item.id}-ended`)
        ) {
          notifiedScheduleIds.current.add(`${item.id}-ended`);
          setSmartAlert({
            id: `alert-end-${Date.now()}`,
            schedule: item,
            type: 'ended',
            minutesLeft: 0,
            soundTone: tone,
            alarmMode: mode,
          });
          if (autoRing) {
            sounds.playAlert(tone, mode);
          }
          sendBrowserNotification(`Batas Jam Kerja Selesai: ${item.title}`, {
            body: `Pukul ${item.endTime} telah tiba. Silakan evaluasi atau tandai kegiatan selesai!`,
          });
          break;
        }

        // 2. BATAS JAM SELESAI (DEADLINE) - MENDEKATI JAM SELESAI
        const endReminderOffset = item.endReminderMinutes !== undefined ? item.endReminderMinutes : 0;
        if (
          item.enableEndAlert !== false &&
          endReminderOffset > 0 &&
          minutesUntilEnd > 0 &&
          minutesUntilEnd <= endReminderOffset &&
          !notifiedScheduleIds.current.has(`${item.id}-ending-soon`)
        ) {
          notifiedScheduleIds.current.add(`${item.id}-ending-soon`);
          setSmartAlert({
            id: `alert-ending-${Date.now()}`,
            schedule: item,
            type: 'ending_soon',
            minutesLeft: minutesUntilEnd,
            soundTone: tone,
            alarmMode: mode,
          });
          if (autoRing) {
            sounds.playAlert(tone, mode);
          }
          sendBrowserNotification(`Batas Waktu Mendekat: ${item.title}`, {
            body: `Waktu kerja selesai dalam ${minutesUntilEnd} menit lagi (Pukul ${item.endTime}).`,
          });
          break;
        }

        // 3. JAM MULAI - EXACT START TIME REACHED
        if (
          item.enableStartAlert !== false &&
          minutesUntilStart === 0 &&
          !notifiedScheduleIds.current.has(`${item.id}-started`)
        ) {
          notifiedScheduleIds.current.add(`${item.id}-started`);
          setSmartAlert({
            id: `alert-start-${Date.now()}`,
            schedule: item,
            type: 'started',
            minutesLeft: 0,
            soundTone: tone,
            alarmMode: mode,
          });
          if (autoRing) {
            sounds.playAlert(tone, mode);
          }
          sendBrowserNotification(`Jadwal Dimulai: ${item.title}`, {
            body: `Pukul ${item.startTime} - ${item.endTime}${item.location ? ' di ' + item.location : ''}`,
          });
          break;
        }

        // 4. JAM MULAI - PENJELANG MULAI
        const reminderOffset = item.reminderMinutes !== undefined ? item.reminderMinutes : 10;
        if (
          item.enableStartAlert !== false &&
          reminderOffset > 0 &&
          minutesUntilStart > 0 &&
          minutesUntilStart <= reminderOffset &&
          !notifiedScheduleIds.current.has(`${item.id}-approaching`)
        ) {
          notifiedScheduleIds.current.add(`${item.id}-approaching`);
          setSmartAlert({
            id: `alert-approach-${Date.now()}`,
            schedule: item,
            type: 'approaching',
            minutesLeft: minutesUntilStart,
            soundTone: tone,
            alarmMode: mode,
          });
          if (autoRing) {
            sounds.playAlert(tone, mode);
          }
          sendBrowserNotification(`Pengingat Jadwal: ${item.title}`, {
            body: `Akan dimulai dalam ${minutesUntilStart} menit (${item.startTime})${item.location ? ' di ' + item.location : ''}`,
          });
          break;
        }
      }
    };

    checkUpcomingDeadlines();
    const interval = setInterval(checkUpcomingDeadlines, 15000); // Check every 15 seconds
    return () => clearInterval(interval);
  }, [schedules, defaultSoundTone, defaultAlarmMode]);

  // Google Login Handlers
  const handleGoogleSignIn = async () => {
    try {
      const res = await googleSignIn();
      if (res) {
        setUser(res.user);
        sounds.playSuccessChime();
        setIsSyncModalOpen(true);
      }
    } catch (e) {
      console.error('Google Sign In error:', e);
    }
  };

  const handleGoogleSignOut = async () => {
    await googleLogout();
    setUser(null);
  };

  // Schedule CRUD
  const handleSaveSchedule = async (
    itemData: Omit<ScheduleItem, 'id' | 'updatedAt' | 'syncStatus'>,
    id?: string
  ) => {
    let updatedList: ScheduleItem[];

    if (id) {
      // Edit existing
      updatedList = schedules.map((s) => {
        if (s.id === id) {
          return {
            ...s,
            ...itemData,
            updatedAt: Date.now(),
            syncStatus: isOnline ? 'synced' : 'pending',
          };
        }
        return s;
      });
      addToSyncQueue({ type: 'schedule_update', payload: { id, ...itemData } });
    } else {
      // Create new
      const newItem: ScheduleItem = {
        ...itemData,
        id: `sc-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        updatedAt: Date.now(),
        syncStatus: isOnline ? 'synced' : 'pending',
      };

      // If Google sync requested and online, automatically create event on Google Calendar
      if (newItem.googleEventId === 'pending_sync' && user && isOnline) {
        try {
          const gcalRes = await createGoogleCalendarEvent(newItem);
          if (gcalRes.success && gcalRes.googleEventId) {
            newItem.googleEventId = gcalRes.googleEventId;
            newItem.syncStatus = 'synced';
          }
        } catch (e) {
          console.warn('Could not immediately sync to Google Calendar:', e);
        }
      }

      updatedList = [...schedules, newItem];
      addToSyncQueue({ type: 'schedule_create', payload: newItem });
    }

    setSchedules(updatedList);
    saveSchedules(updatedList);
    sounds.playSuccessChime();
    setEditingSchedule(null);
  };

  const handleToggleCompleteSchedule = (id: string) => {
    const updated = schedules.map((s) => {
      if (s.id === id) {
        const nextState = !s.isCompleted;
        if (nextState) sounds.playSuccessChime();
        return { ...s, isCompleted: nextState, updatedAt: Date.now() };
      }
      return s;
    });
    setSchedules(updated);
    saveSchedules(updated);
    addToSyncQueue({ type: 'schedule_update', payload: { id, isCompleted: true } });
  };

  const handleDeleteSchedule = async (id: string) => {
    const itemToDelete = schedules.find((s) => s.id === id);
    if (!itemToDelete) return;

    // Delete Google Calendar event if synced
    if (itemToDelete.googleEventId && user && isOnline) {
      await deleteGoogleCalendarEvent(itemToDelete.googleEventId);
    }

    const updated = schedules.filter((s) => s.id !== id);
    setSchedules(updated);
    saveSchedules(updated);
    addToSyncQueue({ type: 'schedule_delete', payload: { id } });
  };

  // Quick Notes CRUD
  const handleSaveNote = (
    noteData: Omit<QuickNote, 'id' | 'createdAt' | 'updatedAt' | 'syncStatus'>,
    id?: string
  ) => {
    let updatedNotes: QuickNote[];
    if (id) {
      updatedNotes = notes.map((n) => {
        if (n.id === id) {
          return { ...n, ...noteData, updatedAt: Date.now() };
        }
        return n;
      });
    } else {
      const newNote: QuickNote = {
        ...noteData,
        id: `note-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        syncStatus: 'synced',
      };
      updatedNotes = [newNote, ...notes];
    }
    setNotes(updatedNotes);
    saveNotes(updatedNotes);
    sounds.playSuccessChime();
    addToSyncQueue({ type: 'note_save', payload: noteData });
  };

  const handleDeleteNote = (id: string) => {
    const updated = notes.filter((n) => n.id !== id);
    setNotes(updated);
    saveNotes(updated);
    addToSyncQueue({ type: 'note_delete', payload: { id } });
  };

  const handleToggleCompleteNote = (id: string) => {
    const updated = notes.map((n) => {
      if (n.id === id) {
        return { ...n, isCompleted: !n.isCompleted, updatedAt: Date.now() };
      }
      return n;
    });
    setNotes(updated);
    saveNotes(updated);
  };

  const handleTogglePinNote = (id: string) => {
    const updated = notes.map((n) => {
      if (n.id === id) {
        return { ...n, isPinned: !n.isPinned, updatedAt: Date.now() };
      }
      return n;
    });
    setNotes(updated);
    saveNotes(updated);
  };

  // Convert quick note to daily schedule item
  const handleConvertNoteToSchedule = (note: QuickNote) => {
    const now = new Date();
    const curH = Math.min(now.getHours() + 1, 22);
    setEditingSchedule({
      id: '',
      title: note.title,
      description: note.content,
      date: selectedDate,
      startTime: `${String(curH).padStart(2, '0')}:00`,
      endTime: `${String(curH + 1).padStart(2, '0')}:00`,
      category: 'kerja',
      priority: 'sedang',
      isCompleted: false,
      reminderMinutes: 10,
      updatedAt: Date.now(),
      syncStatus: 'synced',
    });
    setIsScheduleModalOpen(true);
  };

  // Snooze alert
  const handleSnoozeAlert = (_alertId: string, minutes: number) => {
    if (!smartAlert) return;
    const scheduleId = smartAlert.schedule.id;
    const tone = smartAlert.soundTone || defaultSoundTone;
    const mode = smartAlert.alarmMode || defaultAlarmMode;
    sounds.stopLoop();
    setSmartAlert(null);
    // Temporary allow reminding again after minutes
    setTimeout(() => {
      notifiedScheduleIds.current.delete(`${scheduleId}-approaching`);
      notifiedScheduleIds.current.delete(`${scheduleId}-ending-soon`);
      notifiedScheduleIds.current.delete(`${scheduleId}-ended`);
      sounds.playAlert(tone, mode);
    }, minutes * 60 * 1000);
  };

  // Restore data from cross-device sync
  const handleRestoreCrossDeviceData = (newSchedules: ScheduleItem[], newNotes: QuickNote[]) => {
    setSchedules(newSchedules);
    saveSchedules(newSchedules);
    setNotes(newNotes);
    saveNotes(newNotes);
    sounds.playSuccessChime();
    setLastSyncedTimestamp(Date.now());
  };

  // Filter schedules for the selected date
  const filteredSchedulesForDate = schedules.filter((s) => s.date === selectedDate);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col font-sans transition-colors duration-200 w-full max-w-full overflow-x-hidden">
      
      {/* Online / Offline status notification banner */}
      {onlineBanner && (
        <div className={`py-2 px-3 sm:px-4 text-center text-xs font-semibold flex items-center justify-center gap-2 transition-all w-full ${
          isOnline
            ? 'bg-emerald-600 text-white'
            : 'bg-amber-600 text-white'
        }`}>
          {isOnline ? <RefreshCw className="w-3.5 h-3.5 animate-spin shrink-0" /> : <AlertCircle className="w-3.5 h-3.5 shrink-0" />}
          <span className="truncate">{onlineBanner}</span>
        </div>
      )}

      {/* Floating Smart Alert Toast */}
      <SmartAlertToast
        alert={smartAlert}
        onDismiss={() => setSmartAlert(null)}
        onSnooze={handleSnoozeAlert}
        onComplete={handleToggleCompleteSchedule}
      />

      {/* Top Header Navbar */}
      <Header
        currentDate={selectedDate}
        onDateChange={setSelectedDate}
        isOnline={isOnline}
        isSyncing={isSyncing}
        pendingSyncCount={pendingSyncCount}
        onManualSync={triggerAutoSync}
        isDarkMode={isDarkMode}
        onToggleTheme={() => setIsDarkMode(!isDarkMode)}
        isE2EEActive={e2eeConfig.isEnabled}
        onOpenE2EESettings={() => setIsE2EEModalOpen(true)}
        onOpenAddModal={() => {
          setEditingSchedule(null);
          setDefaultHourForAdd(undefined);
          setIsScheduleModalOpen(true);
        }}
        onOpenSyncModal={() => setIsSyncModalOpen(true)}
        user={user}
        onGoogleSignIn={handleGoogleSignIn}
        onGoogleSignOut={handleGoogleSignOut}
        onOpenRingtoneModal={() => setIsRingtoneModalOpen(true)}
        soundVolume={soundVolume}
        isLooping={isAudioLooping}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-2.5 sm:px-6 lg:px-8 py-3 sm:py-6 pb-24 sm:pb-8 overflow-x-hidden">
        
        {/* Desktop View Selector Tabs */}
        <div className="hidden sm:flex items-center justify-between mb-6">
          <div className="flex items-center p-1 rounded-2xl bg-zinc-200/70 dark:bg-zinc-800/70 border border-zinc-200 dark:border-zinc-700/60">
            <button
              onClick={() => setActiveTab('timeline')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'timeline'
                  ? 'bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>Timeline Jam</span>
            </button>

            <button
              onClick={() => setActiveTab('list')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'list'
                  ? 'bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              <ListTodo className="w-4 h-4" />
              <span>Daftar Kegiatan ({filteredSchedulesForDate.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('notes')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'notes'
                  ? 'bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              <StickyNote className="w-4 h-4" />
              <span>Catatan Cepat ({notes.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('sync')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'sync'
                  ? 'bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              <RefreshCw className="w-4 h-4" />
              <span>Sinkronisasi Multi-Device</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsCrossDeviceModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 shadow-xs transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Pasangkan Perangkat</span>
            </button>
            <button
              onClick={() => setIsE2EEModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 shadow-xs transition-colors"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-500" />
              <span>Privasi E2EE</span>
            </button>
          </div>
        </div>

        {/* View Switcher Output */}
        {activeTab === 'timeline' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-start w-full max-w-full">
            {/* Left 8 Cols: Interactive 24h Daily Timeline */}
            <div className="lg:col-span-8 w-full max-w-full">
              <DailyTimeline
                schedules={filteredSchedulesForDate}
                selectedDate={selectedDate}
                onToggleComplete={handleToggleCompleteSchedule}
                onEditItem={(item) => {
                  setEditingSchedule(item);
                  setIsScheduleModalOpen(true);
                }}
                onDeleteItem={handleDeleteSchedule}
                onAddNewAtHour={(hour) => {
                  setEditingSchedule(null);
                  setDefaultHourForAdd(hour);
                  setIsScheduleModalOpen(true);
                }}
              />
            </div>

            {/* Right 4 Cols: Quick Notes & Side Summary (Visible on large screens, mobile uses dedicated Catatan tab) */}
            <div className="hidden lg:block lg:col-span-4 space-y-6">
              <QuickNotes
                notes={notes}
                onSaveNote={handleSaveNote}
                onDeleteNote={handleDeleteNote}
                onToggleCompleteNote={handleToggleCompleteNote}
                onTogglePinNote={handleTogglePinNote}
                onConvertToSchedule={handleConvertNoteToSchedule}
              />

              {/* Notification helper card */}
              <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/60">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0">
                    <BellRing className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                      Notifikasi Pintar & Audio Aktif
                    </h4>
                    <p className="text-[11px] text-zinc-600 dark:text-zinc-400 mt-1 leading-relaxed">
                      JadwalKu membunyikan chime audio dan mengirim push notification browser saat agenda mendekati batas waktu atau dimulai.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'list' && (
          <ScheduleListView
            schedules={filteredSchedulesForDate}
            onToggleComplete={handleToggleCompleteSchedule}
            onEditItem={(item) => {
              setEditingSchedule(item);
              setIsScheduleModalOpen(true);
            }}
            onDeleteItem={handleDeleteSchedule}
            onOpenAddModal={() => {
              setEditingSchedule(null);
              setDefaultHourForAdd(undefined);
              setIsScheduleModalOpen(true);
            }}
          />
        )}

        {activeTab === 'notes' && (
          <div className="max-w-4xl mx-auto">
            <QuickNotes
              notes={notes}
              onSaveNote={handleSaveNote}
              onDeleteNote={handleDeleteNote}
              onToggleCompleteNote={handleToggleCompleteNote}
              onTogglePinNote={handleTogglePinNote}
              onConvertToSchedule={handleConvertNoteToSchedule}
            />
          </div>
        )}

        {activeTab === 'sync' && (
          <div className="max-w-2xl mx-auto space-y-4">
            <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm text-center">
              <RefreshCw className="w-12 h-12 text-indigo-600 dark:text-indigo-400 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                Pusat Sinkronisasi & Kalender
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-md mx-auto mt-1 mb-6">
                Sinkronkan jadwal kegiatan Anda dengan Google Calendar, transfer antar perangkat, dan kelola enkripsi end-to-end.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
                <button
                  onClick={() => setIsSyncModalOpen(true)}
                  className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 hover:border-indigo-500 dark:hover:border-indigo-500 bg-zinc-50/50 dark:bg-zinc-800/40 transition-all group"
                >
                  <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                    Google Kalender
                  </h4>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                    Sinkronkan jadwal harian ke Google Kalender dan unduh file .ICS.
                  </p>
                </button>

                <button
                  onClick={() => setIsCrossDeviceModalOpen(true)}
                  className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 hover:border-indigo-500 dark:hover:border-indigo-500 bg-zinc-50/50 dark:bg-zinc-800/40 transition-all group"
                >
                  <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                    Pasangkan Perangkat Lain
                  </h4>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                    Salin kode sinkronisasi atau pulihkan cadangan terenkripsi.
                  </p>
                </button>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* Mobile Bottom Navigation */}
      <MobileNavigation
        activeTab={activeTab}
        onChangeTab={setActiveTab}
        onOpenAddModal={() => {
          setEditingSchedule(null);
          setDefaultHourForAdd(undefined);
          setIsScheduleModalOpen(true);
        }}
        pendingSyncCount={pendingSyncCount}
      />

      {/* Modals */}
      <ScheduleModal
        isOpen={isScheduleModalOpen}
        onClose={() => {
          setIsScheduleModalOpen(false);
          setEditingSchedule(null);
        }}
        onSave={handleSaveSchedule}
        initialData={editingSchedule}
        defaultDate={selectedDate}
        defaultHour={defaultHourForAdd}
        isGoogleConnected={Boolean(user)}
      />

      <GoogleCalendarSyncModal
        isOpen={isSyncModalOpen}
        onClose={() => setIsSyncModalOpen(false)}
        user={user}
        onGoogleSignIn={handleGoogleSignIn}
        schedules={filteredSchedulesForDate}
        selectedDate={selectedDate}
        onImportEvents={(newItems) => {
          const merged = [...schedules, ...newItems];
          setSchedules(merged);
          saveSchedules(merged);
        }}
        onUpdateScheduleSyncStatus={(id, gId) => {
          const updated = schedules.map((s) => s.id === id ? { ...s, googleEventId: gId, syncStatus: 'synced' as const } : s);
          setSchedules(updated);
          saveSchedules(updated);
        }}
      />

      <CrossDeviceSyncModal
        isOpen={isCrossDeviceModalOpen}
        onClose={() => setIsCrossDeviceModalOpen(false)}
        isOnline={isOnline}
        schedules={schedules}
        notes={notes}
        e2eePassphrase={e2eePassphrase}
        onRestoreData={handleRestoreCrossDeviceData}
        onManualSyncTrigger={triggerAutoSync}
        lastSyncedTimestamp={lastSyncedTimestamp}
      />

      <E2EESettingsModal
        isOpen={isE2EEModalOpen}
        onClose={() => setIsE2EEModalOpen(false)}
        config={e2eeConfig}
        onSaveConfig={(newConfig, passphrase) => {
          setE2EEConfig(newConfig);
          saveE2EEConfig(newConfig);
          setE2EEPassphrase(passphrase || '');
          sounds.playSuccessChime();
        }}
        currentPassphrase={e2eePassphrase}
        schedules={schedules}
        notes={notes}
      />

      <RingtoneModal
        isOpen={isRingtoneModalOpen}
        onClose={() => {
          sounds.stopLoop();
          setIsRingtoneModalOpen(false);
        }}
        selectedTone={defaultSoundTone}
        onSelectTone={(tone) => {
          setDefaultSoundTone(tone);
          localStorage.setItem('jadwalku_default_sound', tone);
          sounds.playTone(tone);
        }}
        defaultAlarmMode={defaultAlarmMode}
        onSelectAlarmMode={(mode) => {
          setDefaultAlarmMode(mode);
          localStorage.setItem('jadwalku_default_alarm_mode', mode);
        }}
        volume={soundVolume}
        onVolumeChange={(vol) => {
          setSoundVolume(vol);
          sounds.setVolume(vol);
        }}
      />

    </div>
  );
}
