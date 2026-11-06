import React from 'react';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Moon, 
  Sun, 
  Wifi, 
  WifiOff, 
  ShieldCheck, 
  ShieldAlert, 
  Plus, 
  RefreshCw,
  LogOut,
  Volume2,
  VolumeX,
  Repeat
} from 'lucide-react';
import { User } from 'firebase/auth';

interface HeaderProps {
  currentDate: string;
  onDateChange: (date: string) => void;
  isOnline: boolean;
  isSyncing: boolean;
  pendingSyncCount: number;
  onManualSync: () => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
  isE2EEActive: boolean;
  onOpenE2EESettings: () => void;
  onOpenAddModal: () => void;
  onOpenSyncModal: () => void;
  user: User | null;
  onGoogleSignIn: () => void;
  onGoogleSignOut: () => void;
  onOpenRingtoneModal: () => void;
  soundVolume?: number;
  isLooping?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentDate,
  onDateChange,
  isOnline,
  isSyncing,
  pendingSyncCount,
  onManualSync,
  isDarkMode,
  onToggleTheme,
  isE2EEActive,
  onOpenE2EESettings,
  onOpenAddModal,
  onOpenSyncModal,
  user,
  onGoogleSignIn,
  onGoogleSignOut,
  onOpenRingtoneModal,
  soundVolume = 0.8,
  isLooping = false,
}) => {
  const formatDateDisplay = (dateStr: string) => {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('id-ID', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    });
  };

  const shiftDate = (days: number) => {
    const d = new Date(currentDate + 'T00:00:00');
    d.setDate(d.getDate() + days);
    const yr = d.getFullYear();
    const mo = String(d.getMonth() + 1).padStart(2, '0');
    const dy = String(d.getDate()).padStart(2, '0');
    onDateChange(`${yr}-${mo}-${dy}`);
  };

  const isToday = () => {
    const today = new Date();
    const yr = today.getFullYear();
    const mo = String(today.getMonth() + 1).padStart(2, '0');
    const dy = String(today.getDate()).padStart(2, '0');
    return currentDate === `${yr}-${mo}-${dy}`;
  };

  const handleSetToday = () => {
    const today = new Date();
    const yr = today.getFullYear();
    const mo = String(today.getMonth() + 1).padStart(2, '0');
    const dy = String(today.getDate()).padStart(2, '0');
    onDateChange(`${yr}-${mo}-${dy}`);
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 transition-colors w-full max-w-full overflow-hidden">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 w-full">
        {/* Top Navbar Row */}
        <div className="flex items-center justify-between h-14 sm:h-16 gap-1.5 sm:gap-2 w-full">
          
          {/* Logo & App Name */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-blue-400 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 shrink-0">
              <CalendarIcon className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="shrink-0">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-base sm:text-lg tracking-tight text-zinc-900 dark:text-white">
                  Jadwal<span className="text-indigo-600 dark:text-indigo-400">Ku</span>
                </span>
                <span className="hidden md:inline-block text-[10px] font-semibold tracking-wider uppercase px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">
                  Smart Sync
                </span>
              </div>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 hidden lg:block">
                Skedul Harian & Sinkronisasi Aman
              </p>
            </div>
          </div>

          {/* Right Action Icons & Badges */}
          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
            
            {/* Online / Offline Status Badge */}
            <button
              onClick={onManualSync}
              title={isOnline ? 'Terhubung online. Klik untuk sinkronisasi paksa.' : 'Mode offline aktif. Perubahan akan disinkronkan otomatis saat online.'}
              className={`flex items-center gap-1 px-1.5 py-1 sm:px-2.5 rounded-full text-xs font-medium transition-all ${
                isOnline
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/60 hover:bg-emerald-100'
                  : 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/60'
              }`}
            >
              {isOnline ? (
                <>
                  <span className="relative flex h-2 w-2 shrink-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <Wifi className="w-3.5 h-3.5 shrink-0" />
                  <span className="hidden lg:inline text-xs">Online</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-3.5 h-3.5 shrink-0" />
                  <span className="hidden lg:inline text-xs">Offline</span>
                </>
              )}
              {pendingSyncCount > 0 && (
                <span className="px-1 py-0.1 bg-amber-500 text-white rounded-full text-[9px] font-bold">
                  {pendingSyncCount}
                </span>
              )}
              {isSyncing && (
                <RefreshCw className="w-3 h-3 animate-spin text-emerald-600 dark:text-emerald-400 shrink-0" />
              )}
            </button>

            {/* E2EE Shield Badge */}
            <button
              onClick={onOpenE2EESettings}
              title={isE2EEActive ? 'Enkripsi End-to-End Aktif (AES-256-GCM)' : 'Konfigurasi Enkripsi End-to-End'}
              className={`flex items-center gap-1 p-1.5 sm:px-2.5 sm:py-1 rounded-full text-xs font-medium border transition-colors ${
                isE2EEActive
                  ? 'bg-indigo-50 border-indigo-200 text-indigo-700 dark:bg-indigo-950/40 dark:border-indigo-800/60 dark:text-indigo-300 hover:bg-indigo-100'
                  : 'bg-zinc-100 border-zinc-200 text-zinc-600 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-400 hover:bg-zinc-200'
              }`}
            >
              {isE2EEActive ? (
                <>
                  <ShieldCheck className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                  <span className="hidden lg:inline">E2EE</span>
                </>
              ) : (
                <>
                  <ShieldAlert className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                  <span className="hidden lg:inline">E2EE</span>
                </>
              )}
            </button>

            {/* Nada Dering Button */}
            <button
              onClick={onOpenRingtoneModal}
              title={`Pilihan Nada Dering & Pengaturan Alarm (Volume: ${Math.round(soundVolume * 100)}%)`}
              className={`flex items-center gap-1 p-1.5 sm:px-2.5 sm:py-1 rounded-full text-xs font-medium border transition-colors shadow-2xs ${
                isLooping
                  ? 'bg-amber-500 text-white border-amber-600 animate-pulse'
                  : soundVolume === 0
                  ? 'border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 text-zinc-400'
                  : 'border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:border-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-400'
              }`}
            >
              {isLooping ? (
                <Repeat className="w-3.5 h-3.5 animate-spin shrink-0" />
              ) : soundVolume === 0 ? (
                <VolumeX className="w-3.5 h-3.5 shrink-0" />
              ) : (
                <Volume2 className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
              )}
              <span className="hidden lg:inline">
                {isLooping ? 'Berdering' : soundVolume === 0 ? 'Bisu' : `${Math.round(soundVolume * 100)}%`}
              </span>
            </button>

            {/* Google Account / Sign in Button */}
            {user ? (
              <div className="flex items-center gap-1 p-1 sm:px-2 sm:py-1 bg-zinc-100 dark:bg-zinc-800 rounded-full border border-zinc-200 dark:border-zinc-700">
                {user.photoURL ? (
                  <img src={user.photoURL} alt={user.displayName || 'Google User'} className="w-5 h-5 rounded-full shrink-0" />
                ) : (
                  <div className="w-5 h-5 rounded-full bg-blue-500 text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                    {user.email ? user.email[0].toUpperCase() : 'G'}
                  </div>
                )}
                <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300 max-w-[80px] truncate hidden md:inline">
                  {user.displayName || user.email?.split('@')[0]}
                </span>
                <button
                  onClick={onGoogleSignOut}
                  title="Keluar dari Google"
                  className="p-1 text-zinc-400 hover:text-red-500 transition-colors"
                >
                  <LogOut className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <button
                onClick={onGoogleSignIn}
                className="flex items-center gap-1 p-1.5 sm:px-2.5 sm:py-1 rounded-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-700/60 text-xs font-medium text-zinc-700 dark:text-zinc-200 shadow-xs transition-all"
                title="Hubungkan Google Calendar untuk sinkronisasi otomatis"
              >
                <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span className="hidden md:inline">Google</span>
              </button>
            )}

            {/* Dark / Light Toggle */}
            <button
              onClick={onToggleTheme}
              className="p-1.5 sm:p-2 rounded-xl text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              aria-label="Toggle tema gelap/terang"
              title={isDarkMode ? 'Beralih ke Mode Terang' : 'Beralih ke Mode Gelap'}
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-zinc-600" />}
            </button>

            {/* Tombol Tambah Jadwal Utama (Desktop Only) */}
            <button
              onClick={onOpenAddModal}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 active:scale-95 transition-all shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Jadwal</span>
            </button>

          </div>
        </div>

        {/* Date Navigation Bar */}
        <div className="py-2 flex items-center justify-between border-t border-zinc-100 dark:border-zinc-800/80 gap-1 w-full overflow-hidden">
          <div className="flex items-center gap-1 sm:gap-2 min-w-0 flex-1">
            <button
              onClick={() => shiftDate(-1)}
              className="p-1 sm:p-1.5 rounded-lg text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors shrink-0"
              title="Hari Sebelumnya"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            
            <div className="flex items-center gap-1 min-w-0">
              <input
                type="date"
                value={currentDate}
                onChange={(e) => e.target.value && onDateChange(e.target.value)}
                className="text-xs sm:text-sm font-semibold bg-transparent text-zinc-800 dark:text-zinc-100 focus:outline-none cursor-pointer max-w-[125px] sm:max-w-none"
              />
              <span className="text-xs text-zinc-500 dark:text-zinc-400 hidden sm:inline truncate">
                ({formatDateDisplay(currentDate)})
              </span>
            </div>

            <button
              onClick={() => shiftDate(1)}
              className="p-1 sm:p-1.5 rounded-lg text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors shrink-0"
              title="Hari Berikutnya"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            {!isToday() && (
              <button
                onClick={handleSetToday}
                className="text-[11px] sm:text-xs px-2 py-0.5 rounded-md font-medium text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-colors shrink-0"
              >
                Hari Ini
              </button>
            )}
          </div>

          {/* Sync Center & Shortcuts */}
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={onOpenSyncModal}
              className="flex items-center gap-1 text-xs font-medium text-zinc-600 dark:text-zinc-300 hover:text-indigo-600 dark:hover:text-indigo-400 p-1 sm:px-2 sm:py-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              title="Buka Pusat Sinkronisasi & Kalender"
            >
              <RefreshCw className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden md:inline">Sinkronisasi</span>
            </button>
          </div>
        </div>

      </div>
    </header>
  );
};
