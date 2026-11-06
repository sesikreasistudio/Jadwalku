import { ActivityCategory, CategoryMeta } from '../types';

export const CATEGORIES: Record<ActivityCategory, CategoryMeta> = {
  kerja: {
    id: 'kerja',
    label: 'Kerja & Kantor',
    color: '#3B82F6', // Blue
    bgLight: 'bg-blue-50 text-blue-700 border-blue-200',
    bgDark: 'dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800',
    textLight: 'text-blue-700',
    textDark: 'dark:text-blue-400',
    iconName: 'Briefcase',
  },
  belajar: {
    id: 'belajar',
    label: 'Belajar & Studi',
    color: '#8B5CF6', // Purple
    bgLight: 'bg-purple-50 text-purple-700 border-purple-200',
    bgDark: 'dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800',
    textLight: 'text-purple-700',
    textDark: 'dark:text-purple-400',
    iconName: 'GraduationCap',
  },
  pribadi: {
    id: 'pribadi',
    label: 'Urusan Pribadi',
    color: '#EC4899', // Pink
    bgLight: 'bg-pink-50 text-pink-700 border-pink-200',
    bgDark: 'dark:bg-pink-950/40 dark:text-pink-300 dark:border-pink-800',
    textLight: 'text-pink-700',
    textDark: 'dark:text-pink-400',
    iconName: 'User',
  },
  kesehatan: {
    id: 'kesehatan',
    label: 'Kesehatan & Olahraga',
    color: '#10B981', // Emerald
    bgLight: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    bgDark: 'dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800',
    textLight: 'text-emerald-700',
    textDark: 'dark:text-emerald-400',
    iconName: 'Activity',
  },
  ibadah: {
    id: 'ibadah',
    label: 'Ibadah & Spiritual',
    color: '#F59E0B', // Amber
    bgLight: 'bg-amber-50 text-amber-700 border-amber-200',
    bgDark: 'dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800',
    textLight: 'text-amber-700',
    textDark: 'dark:text-amber-400',
    iconName: 'HeartHandshake',
  },
  santai: {
    id: 'santai',
    label: 'Santai & Hiburan',
    color: '#06B6D4', // Cyan
    bgLight: 'bg-cyan-50 text-cyan-700 border-cyan-200',
    bgDark: 'dark:bg-cyan-950/40 dark:text-cyan-300 dark:border-cyan-800',
    textLight: 'text-cyan-700',
    textDark: 'dark:text-cyan-400',
    iconName: 'Coffee',
  },
  rapat: {
    id: 'rapat',
    label: 'Rapat & Diskusi',
    color: '#6366F1', // Indigo
    bgLight: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    bgDark: 'dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800',
    textLight: 'text-indigo-700',
    textDark: 'dark:text-indigo-400',
    iconName: 'Users',
  },
  perjalanan: {
    id: 'perjalanan',
    label: 'Perjalanan & Mobilitas',
    color: '#64748B', // Slate
    bgLight: 'bg-slate-100 text-slate-700 border-slate-300',
    bgDark: 'dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
    textLight: 'text-slate-700',
    textDark: 'dark:text-slate-400',
    iconName: 'Navigation',
  },
};
