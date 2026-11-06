import React, { useState, useEffect } from 'react';
import { 
  X, 
  ShieldCheck, 
  Key, 
  Eye, 
  EyeOff, 
  Lock, 
  Code2, 
  CheckCircle2, 
  Info,
  Unlock
} from 'lucide-react';
import { E2EEConfig, ScheduleItem, QuickNote } from '../types';
import { computePassphraseFingerprint, encryptData } from '../utils/crypto';

interface E2EESettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: E2EEConfig;
  onSaveConfig: (newConfig: E2EEConfig, passphrase?: string) => void;
  currentPassphrase?: string;
  schedules: ScheduleItem[];
  notes: QuickNote[];
}

export const E2EESettingsModal: React.FC<E2EESettingsModalProps> = ({
  isOpen,
  onClose,
  config,
  onSaveConfig,
  currentPassphrase,
  schedules,
  notes,
}) => {
  const [passphrase, setPassphrase] = useState(currentPassphrase || '');
  const [showPassphrase, setShowPassphrase] = useState(false);
  const [fingerprint, setFingerprint] = useState<string>('');
  const [sampleCiphertext, setSampleCiphertext] = useState<string>('');
  const [showCipherInspection, setShowCipherInspection] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (passphrase.trim()) {
      computePassphraseFingerprint(passphrase.trim()).then(setFingerprint);
    } else {
      setFingerprint('');
    }
  }, [passphrase]);

  // Inspect sample encrypted payload
  const handleInspectCipher = async () => {
    if (!passphrase.trim()) return;
    try {
      const sample = await encryptData({ schedules: schedules.slice(0, 2), notes: notes.slice(0, 1) }, passphrase.trim());
      setSampleCiphertext(JSON.stringify(sample, null, 2));
      setShowCipherInspection(true);
    } catch (e) {
      console.error('Failed to generate sample ciphertext:', e);
    }
  };

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passphrase.trim()) {
      // Disable E2EE
      onSaveConfig({
        isEnabled: false,
      }, undefined);
    } else {
      // Enable E2EE
      onSaveConfig({
        isEnabled: true,
        keyFingerprint: fingerprint,
        lastEncryptedAt: Date.now(),
      }, passphrase.trim());
    }
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div 
        className="w-full max-w-lg bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden my-8 transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                Enkripsi End-to-End (E2EE)
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Privasi maksimal dengan standar AES-256-GCM Web Crypto
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

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-6 space-y-4">
          
          {/* Explanation Banner */}
          <div className="p-3.5 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/60 text-xs text-indigo-950 dark:text-indigo-200 leading-relaxed flex items-start gap-2.5">
            <Info className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
            <div>
              <strong>Prinsip Nol-Pengetahuan (Zero-Knowledge):</strong> Data kegiatan dan catatan harian Anda dienkripsi secara lokal di peramban Anda menggunakan algoritma AES-256-GCM. Hanya perangkat dengan kata sandi yang sama yang dapat mendekripsinya.
            </div>
          </div>

          {/* Master Passphrase Input */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-zinc-400" /> Kata Sandi Master Enkripsi
              </span>
              {fingerprint && (
                <span className="text-[10px] font-mono text-zinc-400">
                  Sidik Kunci: {fingerprint}
                </span>
              )}
            </label>

            <div className="relative">
              <input
                type={showPassphrase ? 'text' : 'password'}
                value={passphrase}
                onChange={(e) => setPassphrase(e.target.value)}
                placeholder="Masukkan kata sandi pribadi Anda..."
                className="w-full pl-3.5 pr-10 py-2.5 rounded-xl text-sm bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              />
              <button
                type="button"
                onClick={() => setShowPassphrase(!showPassphrase)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
              >
                {showPassphrase ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-[11px] text-zinc-400 dark:text-zinc-500 mt-1">
              Kosongkan jika Anda ingin menonaktifkan enkripsi E2EE dan menggunakan penyimpanan standar.
            </p>
          </div>

          {/* Live Cryptography Transparency Viewer */}
          {passphrase.trim() && (
            <div className="pt-2">
              <button
                type="button"
                onClick={handleInspectCipher}
                className="text-xs font-medium text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5 hover:underline"
              >
                <Code2 className="w-3.5 h-3.5" />
                <span>Inspeksi Transparansi Ciphertext Terenkripsi</span>
              </button>

              {showCipherInspection && sampleCiphertext && (
                <div className="mt-2 p-3 rounded-xl bg-zinc-900 text-zinc-300 font-mono text-[11px] overflow-x-auto max-h-36 border border-zinc-800">
                  <p className="text-[10px] text-zinc-500 mb-1">// Data mentah terenkripsi (AES-256-GCM + IV + Salt):</p>
                  <pre>{sampleCiphertext}</pre>
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-zinc-100 dark:border-zinc-800">
            <div className="flex items-center gap-1 text-xs">
              {config.isEnabled ? (
                <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                  <Lock className="w-3.5 h-3.5" /> E2EE Aktif
                </span>
              ) : (
                <span className="flex items-center gap-1 text-zinc-400 font-medium">
                  <Unlock className="w-3.5 h-3.5" /> E2EE Nonaktif
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
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
                {isSaved ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                    <span>Tersimpan!</span>
                  </>
                ) : (
                  <span>Terapkan Pengaturan</span>
                )}
              </button>
            </div>
          </div>

        </form>
      </div>
    </div>
  );
};
