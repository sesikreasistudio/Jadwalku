import { ScheduleItem, QuickNote, E2EEConfig } from '../types';

const STORAGE_KEYS = {
  SCHEDULES: 'jadwalku_schedules_v1',
  NOTES: 'jadwalku_notes_v1',
  E2EE: 'jadwalku_e2ee_config_v1',
  DEVICE_ID: 'jadwalku_device_id_v1',
  SYNC_QUEUE: 'jadwalku_sync_queue_v1',
  THEME: 'jadwalku_theme_mode_v1',
};

export function getDeviceId(): string {
  let id = localStorage.getItem(STORAGE_KEYS.DEVICE_ID);
  if (!id) {
    id = 'dev-' + Math.random().toString(36).substring(2, 10);
    localStorage.setItem(STORAGE_KEYS.DEVICE_ID, id);
  }
  return id;
}

export function getTodayDateString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

const DEFAULT_SCHEDULES: ScheduleItem[] = [
  {
    id: 'sc-1',
    title: 'Olahraga Pagi & Jogging Ringan',
    description: 'Pemanasan 10 menit, jogging keliling kompleks, minum air putih 500ml',
    startTime: '06:30',
    endTime: '07:15',
    date: getTodayDateString(),
    category: 'kesehatan',
    priority: 'sedang',
    location: 'Taman Kota / Lapangan',
    isCompleted: true,
    reminderMinutes: 10,
    updatedAt: Date.now() - 3600000 * 2,
    syncStatus: 'synced',
  },
  {
    id: 'sc-2',
    title: 'Daily Standup & Rapat Sinkronisasi Tim',
    description: 'Review progres sprint, hambatan tugas harian, dan pembagian prioritas',
    startTime: '09:00',
    endTime: '09:45',
    date: getTodayDateString(),
    category: 'rapat',
    priority: 'tinggi',
    location: 'Google Meet / Ruang Rapat A',
    isCompleted: false,
    reminderMinutes: 15,
    updatedAt: Date.now() - 3600000,
    syncStatus: 'synced',
  },
  {
    id: 'sc-3',
    title: 'Pengerjaan Fitur Utama & Dokumentasi Teknis',
    description: 'Selesaikan modul sinkronisasi lintas perangkat dan integrasi API kalender',
    startTime: '10:15',
    endTime: '12:00',
    date: getTodayDateString(),
    category: 'kerja',
    priority: 'tinggi',
    location: 'Meja Kerja',
    isCompleted: false,
    reminderMinutes: 10,
    updatedAt: Date.now(),
    syncStatus: 'synced',
  },
  {
    id: 'sc-4',
    title: 'Istirahat, Makan Siang & Ibadah Dzuhur',
    description: 'Rehat sejenak dari layar komputer, santap siang bernutrisi',
    startTime: '12:00',
    endTime: '13:00',
    date: getTodayDateString(),
    category: 'ibadah',
    priority: 'sedang',
    location: 'Kantin & Musholla',
    isCompleted: false,
    reminderMinutes: 5,
    updatedAt: Date.now(),
    syncStatus: 'synced',
  },
  {
    id: 'sc-5',
    title: 'Belajar Mandiri: Arsitektur Cloud & E2EE',
    description: 'Baca modul Web Crypto API dan keamanan data terdesentralisasi',
    startTime: '16:00',
    endTime: '17:00',
    date: getTodayDateString(),
    category: 'belajar',
    priority: 'sedang',
    location: 'Ruang Baca',
    isCompleted: false,
    reminderMinutes: 10,
    updatedAt: Date.now(),
    syncStatus: 'synced',
  },
];

const DEFAULT_NOTES: QuickNote[] = [
  {
    id: 'note-1',
    title: 'Ide Desain Dashboard Baru',
    content: 'Gunakan aksen gradasi indigo untuk status aktif dan tambahkan haptic feedback pada sentuhan mobile.',
    createdAt: Date.now() - 7200000,
    updatedAt: Date.now() - 7200000,
    color: 'yellow',
    isPinned: true,
    isCompleted: false,
    syncStatus: 'synced',
  },
  {
    id: 'note-2',
    title: 'Belanja Keperluan Kantor',
    content: 'Kertas A4, tinta printer, baterai mouse wireless, sticky note warna-warni.',
    createdAt: Date.now() - 3600000,
    updatedAt: Date.now() - 3600000,
    color: 'emerald',
    isPinned: false,
    isCompleted: false,
    syncStatus: 'synced',
  },
];

export function loadSchedules(): ScheduleItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SCHEDULES);
    if (!raw) {
      saveSchedules(DEFAULT_SCHEDULES);
      return DEFAULT_SCHEDULES;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : DEFAULT_SCHEDULES;
  } catch (e) {
    console.error('Failed to load schedules:', e);
    return DEFAULT_SCHEDULES;
  }
}

export function saveSchedules(items: ScheduleItem[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.SCHEDULES, JSON.stringify(items));
  } catch (e) {
    console.error('Failed to save schedules:', e);
  }
}

export function loadNotes(): QuickNote[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.NOTES);
    if (!raw) {
      saveNotes(DEFAULT_NOTES);
      return DEFAULT_NOTES;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : DEFAULT_NOTES;
  } catch (e) {
    console.error('Failed to load notes:', e);
    return DEFAULT_NOTES;
  }
}

export function saveNotes(notes: QuickNote[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(notes));
  } catch (e) {
    console.error('Failed to save notes:', e);
  }
}

export function loadE2EEConfig(): E2EEConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.E2EE);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load E2EE config:', e);
  }
  return { isEnabled: false };
}

export function saveE2EEConfig(config: E2EEConfig) {
  try {
    localStorage.setItem(STORAGE_KEYS.E2EE, JSON.stringify(config));
  } catch (e) {
    console.error('Failed to save E2EE config:', e);
  }
}

export interface SyncQueueItem {
  id: string;
  type: 'schedule_create' | 'schedule_update' | 'schedule_delete' | 'note_save' | 'note_delete';
  payload: unknown;
  timestamp: number;
}

export function getSyncQueue(): SyncQueueItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SYNC_QUEUE);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function addToSyncQueue(item: Omit<SyncQueueItem, 'id' | 'timestamp'>) {
  const queue = getSyncQueue();
  queue.push({
    ...item,
    id: Math.random().toString(36).substring(2, 9),
    timestamp: Date.now(),
  });
  localStorage.setItem(STORAGE_KEYS.SYNC_QUEUE, JSON.stringify(queue));
}

export function clearSyncQueue() {
  localStorage.removeItem(STORAGE_KEYS.SYNC_QUEUE);
}
