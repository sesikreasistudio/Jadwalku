import React, { useState } from 'react';
import { 
  X, 
  Calendar as CalendarIcon, 
  Download, 
  Upload, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle,
  ExternalLink,
  ShieldCheck,
  CalendarCheck
} from 'lucide-react';
import { User } from 'firebase/auth';
import { ScheduleItem } from '../types';
import { exportToICS, createGoogleCalendarEvent, fetchGoogleCalendarEvents } from '../utils/googleCalendar';

interface GoogleCalendarSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onGoogleSignIn: () => void;
  schedules: ScheduleItem[];
  selectedDate: string;
  onImportEvents: (newEvents: ScheduleItem[]) => void;
  onUpdateScheduleSyncStatus: (id: string, googleEventId: string) => void;
}

export const GoogleCalendarSyncModal: React.FC<GoogleCalendarSyncModalProps> = ({
  isOpen,
  onClose,
  user,
  onGoogleSignIn,
  schedules,
  selectedDate,
  onImportEvents,
  onUpdateScheduleSyncStatus,
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [syncStatusMsg, setSyncStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  // Mandatory confirmation state for mutating Google Calendar events
  const [confirmDialog, setConfirmDialog] = useState<{
    show: boolean;
    title: string;
    description: string;
    onConfirm: () => void;
  } | null>(null);

  if (!isOpen) return null;

  // Bulk sync all schedules of selected date to Google Calendar
  const handleBulkPushToGoogle = () => {
    const unsynced = schedules.filter((s) => !s.googleEventId || s.googleEventId === 'pending_sync');
    if (unsynced.length === 0) {
      setSyncStatusMsg({ type: 'success', text: 'Semua jadwal untuk tanggal ini sudah tersinkronkan dengan Google Kalender.' });
      return;
    }

    setConfirmDialog({
      show: true,
      title: `Sinkronkan ${unsynced.length} Jadwal ke Google Kalender?`,
      description: `Aplikasi akan menambahkan ${unsynced.length} agenda kegiatan ke Google Kalender utama Anda (${user?.email || 'akun terhubung'}). Jadwal Anda dapat dilihat di semua perangkat Google.`,
      onConfirm: async () => {
        setConfirmDialog(null);
        setIsExporting(true);
        setSyncStatusMsg(null);
        let successCount = 0;
        let failCount = 0;

        for (const item of unsynced) {
          const res = await createGoogleCalendarEvent(item);
          if (res.success && res.googleEventId) {
            onUpdateScheduleSyncStatus(item.id, res.googleEventId);
            successCount++;
          } else {
            failCount++;
          }
        }

        setIsExporting(false);
        if (failCount === 0) {
          setSyncStatusMsg({
            type: 'success',
            text: `Berhasil menambahkan ${successCount} jadwal ke Google Kalender Anda!`
          });
        } else {
          setSyncStatusMsg({
            type: 'error',
            text: `Berhasil menyinkronkan ${successCount} jadwal, tetapi ${failCount} jadwal gagal. Periksa izin akun Anda.`
          });
        }
      }
    });
  };

  // Fetch events from Google Calendar for the selected date
  const handleFetchFromGoogle = async () => {
    setIsImporting(true);
    setSyncStatusMsg(null);
    try {
      const gEvents = await fetchGoogleCalendarEvents(selectedDate);
      if (gEvents.length === 0) {
        setSyncStatusMsg({
          type: 'success',
          text: `Tidak ditemukan event Google Kalender pada tanggal ${selectedDate}.`
        });
      } else {
        onImportEvents(gEvents);
        setSyncStatusMsg({
          type: 'success',
          text: `Berhasil mengimpor ${gEvents.length} kegiatan dari Google Kalender!`
        });
      }
    } catch (e) {
      setSyncStatusMsg({
        type: 'error',
        text: 'Gagal mengimpor dari Google Kalender. Silakan periksa koneksi atau masuk kembali.'
      });
    } finally {
      setIsImporting(false);
    }
  };

  // Handle ICS file download
  const handleExportICS = () => {
    exportToICS(schedules, `jadwal-${selectedDate}.ics`);
    setSyncStatusMsg({
      type: 'success',
      text: 'Berkas iCalendar (.ICS) berhasil diunduh. Anda dapat membukanya di Google Calendar, Apple Calendar, atau Outlook.',
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div 
        className="w-full max-w-xl bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden my-8 transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <CalendarIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                Pusat Integrasi Google Kalender
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Sinkronisasi jadwal harian ke cloud dan kalender perangkat
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {/* Status Message Toast */}
          {syncStatusMsg && (
            <div className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
              syncStatusMsg.type === 'success'
                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200'
                : 'bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200'
            }`}>
              {syncStatusMsg.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
              )}
              <span>{syncStatusMsg.text}</span>
            </div>
          )}

          {/* Account Status Card */}
          <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/80">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-3">
                {user ? (
                  <>
                    {user.photoURL ? (
                      <img src={user.photoURL} alt="User Avatar" className="w-10 h-10 rounded-full" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-sm">
                        {user.email ? user.email[0].toUpperCase() : 'G'}
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                        {user.displayName || 'Akun Google Terhubung'}
                      </p>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">
                        {user.email}
                      </p>
                    </div>
                  </>
                ) : (
                  <div>
                    <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                      Belum terhubung ke Akun Google
                    </p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      Hubungkan akun untuk sinkronisasi otomatis langsung dengan Google Kalender.
                    </p>
                  </div>
                )}
              </div>

              {!user && (
                <button
                  onClick={onGoogleSignIn}
                  className="px-4 py-2 bg-white dark:bg-zinc-700 text-zinc-800 dark:text-zinc-100 border border-zinc-300 dark:border-zinc-600 rounded-xl text-xs font-semibold hover:bg-zinc-100 shadow-sm transition-all flex items-center gap-2"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                  <span>Masuk dengan Google</span>
                </button>
              )}
            </div>

            {user && (
              <div className="mt-3 pt-3 border-t border-zinc-200 dark:border-zinc-700/60 flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Izin Google Calendar Events telah diotorisasi dengan aman</span>
              </div>
            )}
          </div>

          {/* Sync Actions Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Action 1: Push schedules to Google Calendar */}
            <div className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-800/40 flex flex-col justify-between">
              <div>
                <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-2.5">
                  <Upload className="w-4 h-4" />
                </div>
                <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                  Kirim ke Google Kalender
                </h4>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                  Tambahkan jadwal tanggal <strong>{selectedDate}</strong> ke Google Kalender Anda secara serentak.
                </p>
              </div>

              <button
                disabled={!user || isExporting}
                onClick={handleBulkPushToGoogle}
                className="mt-4 w-full py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:bg-zinc-300 dark:disabled:bg-zinc-700 text-white text-xs font-semibold shadow-sm transition-all flex items-center justify-center gap-1.5"
              >
                {isExporting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Mengunggah ke Google...</span>
                  </>
                ) : (
                  <>
                    <CalendarCheck className="w-3.5 h-3.5" />
                    <span>Sinkronkan Sekarang</span>
                  </>
                )}
              </button>
            </div>

            {/* Action 2: Import from Google Calendar */}
            <div className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-800/40 flex flex-col justify-between">
              <div>
                <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-2.5">
                  <Download className="w-4 h-4" />
                </div>
                <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                  Tarik dari Google Kalender
                </h4>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                  Ambil agenda dan rapat yang sudah tercatat di Google Kalender ke timeline JadwalKu.
                </p>
              </div>

              <button
                disabled={!user || isImporting}
                onClick={handleFetchFromGoogle}
                className="mt-4 w-full py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-300 dark:disabled:bg-zinc-700 text-white text-xs font-semibold shadow-sm transition-all flex items-center justify-center gap-1.5"
              >
                {isImporting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Mengambil data...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-3.5 h-3.5" />
                    <span>Impor Agenda Google</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Universal iCalendar .ICS Export Section */}
          <div className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-800/40 flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <Download className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-zinc-100">
                  Ekspor Berkas Kalender Universal (.ICS)
                </h4>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                  Kompatibel 100% offline dengan Apple Calendar, Google Calendar, & Microsoft Outlook
                </p>
              </div>
            </div>

            <button
              onClick={handleExportICS}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-all flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Unduh .ICS</span>
            </button>
          </div>

          {/* Direct link to Google Calendar Web */}
          <div className="text-center pt-2">
            <a
              href="https://calendar.google.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium"
            >
              <span>Buka Google Kalender di Tab Baru</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

        </div>
      </div>

      {/* Mandatory User Confirmation Dialog before mutating operations */}
      {confirmDialog && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-2xl space-y-4">
            <div className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 flex items-center justify-center">
              <CalendarIcon className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                {confirmDialog.title}
              </h4>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-2 leading-relaxed">
                {confirmDialog.description}
              </p>
            </div>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setConfirmDialog(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                Batal
              </button>
              <button
                onClick={confirmDialog.onConfirm}
                className="px-5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"
              >
                Ya, Konfirmasi Sinkronisasi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
