import { atom } from 'nanostores';
import type { ClassSession, Period } from './types';
import { INITIAL_PERIODS } from './data';
import { generateAllSchedules } from './generator';

// Initial state, check if we have something in localStorage
const isBrowser = typeof window !== 'undefined';
const storedSessions = isBrowser ? localStorage.getItem('boxing-sessions') : null;

export const periodsStore = atom<Period[]>(INITIAL_PERIODS);
export const sessionsStore = atom<ClassSession[]>(storedSessions ? JSON.parse(storedSessions) : []);

// Function to generate and save
export function generateAndSave() {
  const newSessions = generateAllSchedules(periodsStore.get());
  sessionsStore.set(newSessions);
  if (isBrowser) {
    localStorage.setItem('boxing-sessions', JSON.stringify(newSessions));
  }
}

// Function to update a session (for drag and drop)
export function updateSession(sessionId: string, updates: Partial<ClassSession>) {
  const sessions = sessionsStore.get();
  const updated = sessions.map(s => s.id === sessionId ? { ...s, ...updates } : s);
  sessionsStore.set(updated);
  if (isBrowser) {
    localStorage.setItem('boxing-sessions', JSON.stringify(updated));
  }
}
