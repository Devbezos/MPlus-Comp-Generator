import { useState, useCallback } from 'react';
import { Spec } from '../data/specs';

const STORAGE_KEY = 'key-vibes-history';
const MAX_ENTRIES = 50;

export interface HistoryEntry {
  id: number;
  date: string;   // ISO string
  slots: Spec[];  // always 5 filled specs
}

function load(): HistoryEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as HistoryEntry[]) : [];
  } catch {
    return [];
  }
}

function save(entries: HistoryEntry[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

export function useHistory() {
  const [entries, setEntries] = useState<HistoryEntry[]>(load);

  const addEntry = useCallback((slots: Spec[]) => {
    setEntries(prev => {
      const next = [
        { id: Date.now(), date: new Date().toISOString(), slots },
        ...prev,
      ].slice(0, MAX_ENTRIES);
      save(next);
      return next;
    });
  }, []);

  const clearHistory = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setEntries([]);
  }, []);

  return { entries, addEntry, clearHistory };
}
