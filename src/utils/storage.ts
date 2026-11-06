import { ScheduleItem, QuickNote, E2EEConfig, WeeklyScheduleItem } from '../types';

const STORAGE_KEYS = {
  SCHEDULES: 'jadwalku_schedules_v1',
  NOTES: 'jadwalku_notes_v1',
  E2EE: 'jadwalku_e2ee_config_v1',
  DEVICE_ID: 'jadwalku_device_id_v1',
  SYNC_QUEUE: 'jadwalku_sync_queue_v1',
  THEME: 'jadwalku_theme_mode_v1',
  WEEKLY: 'jadwalku_weekly_schedules_v1',
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

export const DEFAULT_WEEKLY_SCHEDULES: WeeklyScheduleItem[] = [
  // Senin
  {
    id: 'wk-1',
    day: 'senin',
    title: 'Rapat Koordinasi & Briefing Awal Minggu',
    startTime: '08:30',
    endTime: '09:30',
    category: 'rapat',
    priority: 'tinggi',
    location: 'Ruang Meeting / Google Meet',
    notes: 'Bahas KPI, timeline sprint, dan penugasan per divisi.',
    isActive: true,
  },
  {
    id: 'wk-2',
    day: 'senin',
    title: 'Fokus Kerja & Eksekusi Prioritas Utama',
    startTime: '10:00',
    endTime: '12:00',
    category: 'kerja',
    priority: 'tinggi',
    location: 'Meja Kerja',
    notes: 'Selesaikan deliverable utama sebelum istirahat makan siang.',
    isActive: true,
  },
  // Selasa
  {
    id: 'wk-3',
    day: 'selasa',
    title: 'Desain Sistem & Pengembangan Fitur',
    startTime: '09:00',
    endTime: '11:30',
    category: 'kerja',
    priority: 'sedang',
    location: 'Studio / Workstation',
    notes: 'Pembuatan wireframe, styling antarmuka, dan pengujian kode.',
    isActive: true,
  },
  {
    id: 'wk-4',
    day: 'selasa',
    title: 'Olahraga Sore & Workout Kebugaran',
    startTime: '16:30',
    endTime: '17:30',
    category: 'kesehatan',
    priority: 'sedang',
    location: 'Fitness Center / Rumah',
    notes: 'Kardio 20 menit dan angkat beban ringan.',
    isActive: true,
  },
  // Rabu
  {
    id: 'wk-5',
    day: 'rabu',
    title: 'Review Progres Proyek & Diskusi Klien',
    startTime: '09:00',
    endTime: '10:30',
    category: 'rapat',
    priority: 'sedang',
    location: 'Zoom Call',
    notes: 'Presentasi mockup dan demo fungsi ke stakeholder.',
    isActive: true,
  },
  {
    id: 'wk-6',
    day: 'rabu',
    title: 'Belajar & Riset Teknologi Baru',
    startTime: '14:00',
    endTime: '15:30',
    category: 'belajar',
    priority: 'rendah',
    location: 'Perpustakaan / Meja Belajar',
    notes: 'Membaca dokumentasi arsitektur dan tutorial best-practice.',
    isActive: true,
  },
  // Kamis
  {
    id: 'wk-7',
    day: 'kamis',
    title: 'Deep Work: Produksi & Quality Assurance',
    startTime: '09:00',
    endTime: '12:00',
    category: 'kerja',
    priority: 'tinggi',
    location: 'Kantor',
    notes: 'Fokus penuh tanpa gangguan notifikasi sosial media.',
    isActive: true,
  },
  {
    id: 'wk-8',
    day: 'kamis',
    title: 'Waktu Ibadah & Doa Bersama',
    startTime: '18:30',
    endTime: '19:30',
    category: 'ibadah',
    priority: 'tinggi',
    location: 'Tempat Ibadah / Rumah',
    notes: 'Refleksi spiritual dan doa bersama keluarga.',
    isActive: true,
  },
  // Jumat
  {
    id: 'wk-9',
    day: 'jumat',
    title: 'Rekap Laporan Mingguan & Evaluasi Output',
    startTime: '09:00',
    endTime: '11:00',
    category: 'kerja',
    priority: 'sedang',
    location: 'Kantor',
    notes: 'Kompilasi log kerja dan data pencapaian mingguan.',
    isActive: true,
  },
  {
    id: 'wk-10',
    day: 'jumat',
    title: 'Ibadah Sholat Jumat & Silaturahmi',
    startTime: '11:45',
    endTime: '13:00',
    category: 'ibadah',
    priority: 'tinggi',
    location: 'Masjid Utama',
    notes: 'Makan siang bersama rekan kerja setelah sholat.',
    isActive: true,
  },
  {
    id: 'wk-11',
    day: 'jumat',
    title: 'Penyusunan Rencana Kerja Minggu Depan',
    startTime: '16:00',
    endTime: '17:00',
    category: 'kerja',
    priority: 'sedang',
    location: 'Meja Kerja',
    notes: 'Siapkan to-do list hari Senin agar weekend lebih tenang.',
    isActive: true,
  },
  // Sabtu
  {
    id: 'wk-12',
    day: 'sabtu',
    title: 'Olahraga Pagi & Jogging Santai',
    startTime: '06:30',
    endTime: '08:00',
    category: 'kesehatan',
    priority: 'sedang',
    location: 'Taman Kota / CFD',
    notes: 'Lari 5km santai dan sarapan bubur ayam.',
    isActive: true,
  },
  {
    id: 'wk-13',
    day: 'sabtu',
    title: 'Belanja Kebutuhan Mingguan & Quality Time',
    startTime: '10:00',
    endTime: '13:00',
    category: 'pribadi',
    priority: 'sedang',
    location: 'Supermarket / Pasar',
    notes: 'Beli sayuran segar, buah, dan stok camilan.',
    isActive: true,
  },
  {
    id: 'wk-14',
    day: 'sabtu',
    title: 'Santai, Menonton Film & Waktu Hobi',
    startTime: '19:30',
    endTime: '21:30',
    category: 'santai',
    priority: 'rendah',
    location: 'Ruang Keluarga',
    notes: 'Streaming serial favorit dan istirahat pikiran.',
    isActive: true,
  },
  // Minggu
  {
    id: 'wk-15',
    day: 'minggu',
    title: 'Merapikan Rumah & Tata Ruang Bersih',
    startTime: '08:00',
    endTime: '09:30',
    category: 'pribadi',
    priority: 'sedang',
    location: 'Rumah',
    notes: 'Cuci pakaian, ganti sprei, dan siram tanaman.',
    isActive: true,
  },
  {
    id: 'wk-16',
    day: 'minggu',
    title: 'Jalan Sore & Wisata Kuliner Ringan',
    startTime: '16:00',
    endTime: '18:00',
    category: 'santai',
    priority: 'rendah',
    location: 'Kafe / Area Terbuka',
    notes: 'Ngopi santai bersama keluarga atau teman dekat.',
    isActive: true,
  },
  {
    id: 'wk-17',
    day: 'minggu',
    title: 'Persiapan Pakaian & Briefing Pribadi Hari Senin',
    startTime: '20:00',
    endTime: '20:45',
    category: 'pribadi',
    priority: 'sedang',
    location: 'Kamar',
    notes: 'Setrika baju kerja dan periksa alarm bangun pagi.',
    isActive: true,
  },
];

export function loadWeeklySchedules(): WeeklyScheduleItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.WEEKLY);
    if (!raw) {
      saveWeeklySchedules(DEFAULT_WEEKLY_SCHEDULES);
      return DEFAULT_WEEKLY_SCHEDULES;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_WEEKLY_SCHEDULES;
  } catch (e) {
    console.error('Failed to load weekly schedules:', e);
    return DEFAULT_WEEKLY_SCHEDULES;
  }
}

export function saveWeeklySchedules(items: WeeklyScheduleItem[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.WEEKLY, JSON.stringify(items));
  } catch (e) {
    console.error('Failed to save weekly schedules:', e);
  }
}

