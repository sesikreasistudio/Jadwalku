export type ActivityCategory = 
  | 'kerja' 
  | 'belajar' 
  | 'pribadi' 
  | 'kesehatan' 
  | 'ibadah' 
  | 'santai' 
  | 'rapat' 
  | 'perjalanan';

export type PriorityLevel = 'rendah' | 'sedang' | 'tinggi';

export type SoundTone = 'melodi_lembut' | 'alarm_dinamis' | 'genta_klasik';

export type AlarmPlaybackMode = 'once' | 'loop';

export type DayOfWeek = 'senin' | 'selasa' | 'rabu' | 'kamis' | 'jumat' | 'sabtu' | 'minggu';

export interface WeeklyScheduleItem {
  id: string;
  day: DayOfWeek;
  title: string;
  startTime: string; // "08:00"
  endTime: string;   // "09:30"
  category: ActivityCategory;
  priority?: PriorityLevel;
  location?: string;
  notes?: string;
  isActive?: boolean;
}

export interface SoundToneOption {
  id: SoundTone;
  label: string;
  description: string;
  icon: string;
}

export interface ScheduleItem {
  id: string;
  title: string;
  description?: string;
  startTime: string; // format "HH:mm" e.g. "08:30"
  endTime: string;   // format "HH:mm" e.g. "09:30"
  date: string;      // format "YYYY-MM-DD"
  category: ActivityCategory;
  priority: PriorityLevel;
  location?: string;
  isCompleted: boolean;
  reminderMinutes: number; // e.g. 0, 5, 10, 15, 30 minutes before start
  enableStartAlert?: boolean; // whether to ring for start
  enableEndAlert?: boolean; // whether to ring for deadline / end time
  endReminderMinutes?: number; // minutes before endTime (e.g. 0 = exact end, 5, 10, 15)
  soundTone?: SoundTone; // 3 choices of ringtone
  alarmMode?: AlarmPlaybackMode; // 'once' (bunyi sekali) or 'loop' (bunyi berulang)
  autoSoundAlert?: boolean; // whether to ring automatically
  googleEventId?: string;  // if synced with Google Calendar
  updatedAt: number;       // timestamp for cross-device sync resolution
  syncStatus: 'synced' | 'pending' | 'conflict';
}

export interface QuickNote {
  id: string;
  title: string;
  content: string;
  createdAt: number;
  updatedAt: number;
  color: 'yellow' | 'blue' | 'emerald' | 'purple' | 'rose' | 'amber';
  reminderTime?: string; // ISO string if set
  isPinned: boolean;
  isCompleted: boolean;
  syncStatus: 'synced' | 'pending';
}

export interface CategoryMeta {
  id: ActivityCategory;
  label: string;
  color: string;
  bgLight: string;
  bgDark: string;
  textLight: string;
  textDark: string;
  iconName: string;
}

export interface E2EEConfig {
  isEnabled: boolean;
  passphraseHash?: string;
  keyFingerprint?: string;
  lastEncryptedAt?: number;
}

export interface SyncPayload {
  version: number;
  deviceId: string;
  timestamp: number;
  isEncrypted: boolean;
  ciphertext?: string;
  iv?: string;
  salt?: string;
  schedules?: ScheduleItem[];
  notes?: QuickNote[];
}

export interface GoogleCalendarEvent {
  id?: string;
  summary: string;
  description?: string;
  location?: string;
  start: {
    dateTime: string;
    timeZone?: string;
  };
  end: {
    dateTime: string;
    timeZone?: string;
  };
}
