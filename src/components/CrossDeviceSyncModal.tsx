import React, { useState } from 'react';
import { 
  X, 
  Smartphone, 
  Laptop, 
  Copy, 
  Check, 
  RefreshCw, 
  Download, 
  Upload, 
  Wifi, 
  WifiOff, 
  Clock,
  Shield,
  Layers
} from 'lucide-react';
import { ScheduleItem, QuickNote, SyncPayload } from '../types';
import { getDeviceId, getSyncQueue, clearSyncQueue } from '../utils/storage';
import { encryptData, decryptData, EncryptedBundle } from '../utils/crypto';

interface CrossDeviceSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  isOnline: boolean;
  schedules: ScheduleItem[];
  notes: QuickNote[];
  e2eePassphrase?: string;
  onRestoreData: (newSchedules: ScheduleItem[], newNotes: QuickNote[]) => void;
  onManualSyncTrigger: () => void;
  lastSyncedTimestamp: number;
}

export const CrossDeviceSyncModal: React.FC<CrossDeviceSyncModalProps> = ({
  isOpen,
  onClose,
  isOnline,
  schedules,
  notes,
  e2eePassphrase,
  onRestoreData,
  onManualSyncTrigger,
  lastSyncedTimestamp,
}) => {
  const [copied, setCopied] = useState(false);
  const [importString, setImportString] = useState('');
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const currentDeviceId = getDeviceId();
  const syncQueue = getSyncQueue();

  // Create an encrypted or plain export bundle for cross device transfer
  const handleGenerateSyncCode = async () => {
    const payload: SyncPayload = {
      version: 1,
      deviceId: currentDeviceId,
      timestamp: Date.now(),
      isEncrypted: Boolean(e2eePassphrase),
    };

    if (e2eePassphrase) {
      const bundle = await encryptData({ schedules, notes }, e2eePassphrase);
      payload.ciphertext = bundle.ciphertext;
      payload.iv = bundle.iv;
      payload.salt = bundle.salt;
    } else {
      payload.schedules = schedules;
      payload.notes = notes;
    }

    const jsonStr = JSON.stringify(payload);
    const code = btoa(unescape(encodeURIComponent(jsonStr)));

    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    });
  };

  // Download backup file
  const handleDownloadBackup = async () => {
    let backupContent = '';
    if (e2eePassphrase) {
      const bundle = await encryptData({ schedules, notes }, e2eePassphrase);
      backupContent = JSON.stringify({
        version: 1,
        exportedAt: new Date().toISOString(),
        isEncrypted: true,
        bundle,
      }, null, 2);
    } else {
      backupContent = JSON.stringify({
        version: 1,
        exportedAt: new Date().toISOString(),
        isEncrypted: false,
        schedules,
        notes,
      }, null, 2);
    }

    const blob = new Blob([backupContent], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `jadwalku-backup-${new Date().toISOString().substring(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Import sync token or backup
  const handleImportSyncCode = async () => {
    if (!importString.trim()) return;
    setIsProcessing(true);
    setImportStatus(null);

    try {
      let rawJson = '';
      try {
        rawJson = decodeURIComponent(escape(atob(importString.trim())));
      } catch {
        rawJson = importString.trim();
      }

      const parsed = JSON.parse(rawJson);

      let importedSchedules: ScheduleItem[] = [];
      let importedNotes: QuickNote[] = [];

      if (parsed.isEncrypted || parsed.ciphertext || parsed.bundle) {
        if (!e2eePassphrase) {
          throw new Error('Data ini dienkripsi dengan kata sandi master E2EE. Harap atur Kata Sandi Enkripsi di menu E2EE terlebih dahulu.');
        }

        const bundle: EncryptedBundle = parsed.bundle || {
          ciphertext: parsed.ciphertext,
          iv: parsed.iv,
          salt: parsed.salt,
        };

        const decrypted = await decryptData<{ schedules: ScheduleItem[]; notes: QuickNote[] }>(
          bundle,
          e2eePassphrase
        );

        importedSchedules = decrypted.schedules || [];
        importedNotes = decrypted.notes || [];
      } else {
        importedSchedules = parsed.schedules || [];
        importedNotes = parsed.notes || [];
      }

      if (importedSchedules.length === 0 && importedNotes.length === 0) {
        throw new Error('Format data tidak mengandung jadwal atau catatan yang valid.');
      }

      onRestoreData(importedSchedules, importedNotes);
      clearSyncQueue();
      setImportStatus(`Berhasil menyinkronkan! ${importedSchedules.length} jadwal dan ${importedNotes.length} catatan diperbarui.`);
      setImportString('');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal memproses kode sinkronisasi.';
      setImportStatus(`Error: ${msg}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div 
        className="w-full max-w-xl bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden my-8 transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                Sinkronisasi Lintas Perangkat
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Penyelarasan otomatis saat online & transfer antar HP, Tablet, Laptop
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {/* Current Device & Sync Queue Status */}
          <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/80 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Laptop className="w-4 h-4 text-zinc-500" />
                <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                  ID Perangkat Ini:
                </span>
                <span className="text-xs font-mono font-medium px-2 py-0.5 rounded bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300">
                  {currentDeviceId}
                </span>
              </div>

              <div className="flex items-center gap-1.5 text-xs">
                {isOnline ? (
                  <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                    <Wifi className="w-3.5 h-3.5" /> Online
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-medium">
                    <WifiOff className="w-3.5 h-3.5" /> Offline
                  </span>
                )}
              </div>
            </div>

            {/* Antrean Sinkronisasi Otomatis */}
            <div className="flex items-center justify-between pt-2 border-t border-zinc-200 dark:border-zinc-700 text-xs">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-500" />
                <span className="text-zinc-600 dark:text-zinc-400">
                  Antrean Sinkronisasi Offline:
                </span>
                <span className={`font-bold px-2 py-0.5 rounded-full text-[11px] ${
                  syncQueue.length > 0 
                    ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300' 
                    : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                }`}>
                  {syncQueue.length === 0 ? 'Tersinkron Penuh' : `${syncQueue.length} perubahan tertunda`}
                </span>
              </div>

              <button
                onClick={onManualSyncTrigger}
                className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 hover:underline font-semibold"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Sinkronkan</span>
              </button>
            </div>

            <div className="flex items-center gap-1 text-[11px] text-zinc-400">
              <Clock className="w-3 h-3" />
              <span>Sinkronisasi terakhir: {new Date(lastSyncedTimestamp).toLocaleTimeString('id-ID')}</span>
            </div>
          </div>

          {/* Device Pairing / Transfer Code */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-zinc-900 dark:text-zinc-100">
              Kode Pasangkan & Salin Jadwal ke Perangkat Lain
            </label>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
              Salin kode sinkronisasi di bawah ini dan tempel di HP atau laptop Anda yang lain. {e2eePassphrase ? 'Data dilindungi enkripsi AES-256-GCM.' : ''}
            </p>

            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={handleGenerateSyncCode}
                className="flex-1 py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs flex items-center justify-center gap-2 transition-all"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Kode Tersalin ke Clipboard!' : 'Salin Kode Sinkronisasi Perangkat'}</span>
              </button>

              <button
                onClick={handleDownloadBackup}
                className="py-2 px-3 rounded-xl border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                title="Unduh berkas cadangan JSON"
              >
                <Download className="w-4 h-4" />
                <span>Cadangan JSON</span>
              </button>
            </div>
          </div>

          {/* Import Code on Other Device */}
          <div className="space-y-2 pt-3 border-t border-zinc-100 dark:border-zinc-800">
            <label className="block text-xs font-bold text-zinc-900 dark:text-zinc-100">
              Terima & Terapkan Kode Sinkronisasi dari Perangkat Lain
            </label>
            <textarea
              rows={3}
              value={importString}
              onChange={(e) => setImportString(e.target.value)}
              placeholder="Tempelkan kode token sinkronisasi atau isi berkas JSON cadangan di sini..."
              className="w-full px-3 py-2 rounded-xl text-xs bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-none font-mono"
            />

            {importStatus && (
              <div className={`p-2.5 rounded-xl text-xs ${
                importStatus.startsWith('Error')
                  ? 'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300'
                  : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
              }`}>
                {importStatus}
              </div>
            )}

            <button
              disabled={!importString.trim() || isProcessing}
              onClick={handleImportSyncCode}
              className="w-full py-2 px-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 dark:text-zinc-900 text-white disabled:bg-zinc-300 dark:disabled:bg-zinc-700 text-xs font-semibold shadow-sm transition-all flex items-center justify-center gap-2"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>{isProcessing ? 'Memproses Enkripsi & Sinkronisasi...' : 'Terapkan Sinkronisasi Sekarang'}</span>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
