import React, { useState } from 'react';
import { 
  StickyNote, 
  Plus, 
  Trash2, 
  Pin, 
  CheckCircle2, 
  Circle, 
  Clock, 
  ArrowRightCircle, 
  Bell,
  Search
} from 'lucide-react';
import { QuickNote } from '../types';

interface QuickNotesProps {
  notes: QuickNote[];
  onSaveNote: (note: Omit<QuickNote, 'id' | 'createdAt' | 'updatedAt' | 'syncStatus'>, id?: string) => void;
  onDeleteNote: (id: string) => void;
  onToggleCompleteNote: (id: string) => void;
  onTogglePinNote: (id: string) => void;
  onConvertToSchedule: (note: QuickNote) => void;
}

const NOTE_COLORS = {
  yellow: {
    bg: 'bg-amber-50 dark:bg-amber-950/30',
    border: 'border-amber-200 dark:border-amber-800/60',
    dot: 'bg-amber-400',
    text: 'text-amber-900 dark:text-amber-100',
  },
  emerald: {
    bg: 'bg-emerald-50 dark:bg-emerald-950/30',
    border: 'border-emerald-200 dark:border-emerald-800/60',
    dot: 'bg-emerald-400',
    text: 'text-emerald-900 dark:text-emerald-100',
  },
  blue: {
    bg: 'bg-blue-50 dark:bg-blue-950/30',
    border: 'border-blue-200 dark:border-blue-800/60',
    dot: 'bg-blue-400',
    text: 'text-blue-900 dark:text-blue-100',
  },
  purple: {
    bg: 'bg-purple-50 dark:bg-purple-950/30',
    border: 'border-purple-200 dark:border-purple-800/60',
    dot: 'bg-purple-400',
    text: 'text-purple-900 dark:text-purple-100',
  },
  rose: {
    bg: 'bg-rose-50 dark:bg-rose-950/30',
    border: 'border-rose-200 dark:border-rose-800/60',
    dot: 'bg-rose-400',
    text: 'text-rose-900 dark:text-rose-100',
  },
  amber: {
    bg: 'bg-orange-50 dark:bg-orange-950/30',
    border: 'border-orange-200 dark:border-orange-800/60',
    dot: 'bg-orange-400',
    text: 'text-orange-900 dark:text-orange-100',
  },
};

export const QuickNotes: React.FC<QuickNotesProps> = ({
  notes,
  onSaveNote,
  onDeleteNote,
  onToggleCompleteNote,
  onTogglePinNote,
  onConvertToSchedule,
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [color, setColor] = useState<QuickNote['color']>('yellow');
  const [reminderTime, setReminderTime] = useState('');
  const [search, setSearch] = useState('');

  const handleCreateNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() && !content.trim()) return;

    onSaveNote({
      title: title.trim() || 'Catatan Cepat',
      content: content.trim(),
      color,
      reminderTime: reminderTime || undefined,
      isPinned: false,
      isCompleted: false,
    });

    setTitle('');
    setContent('');
    setReminderTime('');
    setIsCreating(false);
  };

  const filteredNotes = notes.filter((n) => 
    n.title.toLowerCase().includes(search.toLowerCase()) || 
    n.content.toLowerCase().includes(search.toLowerCase())
  );

  // Pinned first, then newest
  const sortedNotes = [...filteredNotes].sort((a, b) => {
    if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
    return b.createdAt - a.createdAt;
  });

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm p-3.5 sm:p-6 transition-colors w-full max-w-full overflow-hidden">
      
      {/* Header bar */}
      <div className="flex items-center justify-between flex-wrap gap-2.5 mb-4 sm:mb-5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/60 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
            <StickyNote className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-zinc-100">
              Catatan Cepat
            </h3>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 line-clamp-1">
              Keperluan mendadak & pengingat
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsCreating(!isCreating)}
          className="flex items-center gap-1 px-2.5 py-1 sm:px-3 sm:py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-semibold shadow-xs transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>{isCreating ? 'Tutup' : 'Catatan Baru'}</span>
        </button>
      </div>

      {/* Creation Drawer */}
      {isCreating && (
        <form onSubmit={handleCreateNote} className="p-4 rounded-xl border border-amber-200 dark:border-amber-800/80 bg-amber-50/50 dark:bg-amber-950/20 mb-6 space-y-3">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Judul catatan singkat (contoh: Pesan dari Klien, Beli perlengkapan)..."
            className="w-full px-3 py-2 rounded-lg text-sm bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
            autoFocus
          />

          <textarea
            rows={3}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Tulis detail catatan, nomor kontak darurat, poin belanja, atau instruksi..."
            className="w-full px-3 py-2 rounded-lg text-xs sm:text-sm bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500/50 resize-none"
          />

          <div className="flex items-center justify-between flex-wrap gap-2 pt-1">
            {/* Color selection */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-zinc-500 dark:text-zinc-400 mr-1">Warna:</span>
              {(Object.keys(NOTE_COLORS) as Array<QuickNote['color']>).map((c) => (
                <button
                  type="button"
                  key={c}
                  onClick={() => setColor(c)}
                  className={`w-6 h-6 rounded-full border-2 transition-transform ${NOTE_COLORS[c].dot} ${
                    color === c ? 'scale-125 border-zinc-900 dark:border-white shadow-xs' : 'border-transparent'
                  }`}
                />
              ))}
            </div>

            {/* Optional Reminder */}
            <div className="flex items-center gap-2 text-xs">
              <Bell className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <input
                type="datetime-local"
                value={reminderTime}
                onChange={(e) => setReminderTime(e.target.value)}
                className="px-2 py-1 rounded-md bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs focus:outline-none"
              />
            </div>

            {/* Submit */}
            <div className="flex items-center gap-2 ml-auto">
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="px-3 py-1.5 text-xs text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 text-xs font-semibold bg-amber-500 hover:bg-amber-600 text-white rounded-lg shadow-sm transition-all"
              >
                Simpan Catatan
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Search Bar for Notes */}
      <div className="relative mb-4">
        <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari catatan cepat..."
          className="w-full pl-9 pr-4 py-1.5 rounded-xl text-xs bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
        />
      </div>

      {/* Grid of Sticky Notes */}
      {sortedNotes.length === 0 ? (
        <div className="text-center py-8 text-zinc-400 dark:text-zinc-500 text-xs">
          Belum ada catatan cepat. Klik tombol di atas untuk membuat memo atau keperluan mendadak.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full">
          {sortedNotes.map((note) => {
            const colorTheme = NOTE_COLORS[note.color] || NOTE_COLORS.yellow;
            return (
              <div
                key={note.id}
                className={`relative rounded-2xl p-3 sm:p-4 border transition-all w-full max-w-full overflow-hidden ${colorTheme.bg} ${colorTheme.border} ${
                  note.isCompleted ? 'opacity-60' : 'hover:shadow-md'
                }`}
              >
                {/* Pin badge */}
                {note.isPinned && (
                  <span className="absolute top-2 right-2 px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-amber-500 text-white shadow-xs flex items-center gap-0.5">
                    <Pin className="w-2.5 h-2.5" /> Pin
                  </span>
                )}

                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <button
                      onClick={() => onToggleCompleteNote(note.id)}
                      className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors shrink-0"
                    >
                      {note.isCompleted ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      ) : (
                        <Circle className="w-4 h-4" />
                      )}
                    </button>
                    <h4 className={`text-sm font-bold truncate ${note.isCompleted ? 'line-through text-zinc-400' : colorTheme.text}`}>
                      {note.title}
                    </h4>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => onTogglePinNote(note.id)}
                      className={`p-1 rounded-md transition-colors ${
                        note.isPinned ? 'text-amber-600 dark:text-amber-400' : 'text-zinc-400 hover:text-zinc-700'
                      }`}
                      title={note.isPinned ? 'Lepas Sematan' : 'Sematkan di Atas'}
                    >
                      <Pin className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDeleteNote(note.id)}
                      className="p-1 text-zinc-400 hover:text-red-500 rounded-md transition-colors"
                      title="Hapus Catatan"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Content */}
                <p className="text-xs text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap mb-3 line-clamp-4">
                  {note.content}
                </p>

                {/* Footer Bar: Reminder date + Convert to Schedule button */}
                <div className="flex items-center justify-between pt-2 border-t border-zinc-200/50 dark:border-zinc-800/50 text-[11px] text-zinc-500 dark:text-zinc-400 flex-wrap gap-2">
                  <div className="flex items-center gap-1.5">
                    {note.reminderTime ? (
                      <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-medium">
                        <Clock className="w-3 h-3" />
                        {new Date(note.reminderTime).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    ) : (
                      <span>{new Date(note.createdAt).toLocaleDateString('id-ID', { month: 'short', day: 'numeric' })}</span>
                    )}
                  </div>

                  <button
                    onClick={() => onConvertToSchedule(note)}
                    className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 hover:underline font-semibold"
                    title="Pindahkan catatan ini menjadi jadwal di timeline hari ini"
                  >
                    <span>Jadikan Jadwal</span>
                    <ArrowRightCircle className="w-3.5 h-3.5" />
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
