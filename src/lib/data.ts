import type { Period, Room, CoachName, TimeSlot } from './types';

export const ROOMS: Room[] = ['Minimes', 'Saint-Cyprien', 'Ramonville', 'États-Unis'];
export const COACHES: CoachName[] = ['Mehdi', 'Dadi', 'Walid', 'Faye', 'Valentin Gutt', 'Renaud'];

export const TIME_SLOTS: TimeSlot[] = [
  { id: 'ts-perm-1', label: '09h00 - 10h00', startTime: '09:00', endTime: '10:00', isTraining: false },
  { id: 'ts-1', label: '10h00 - 11h00', startTime: '10:00', endTime: '11:00', isTraining: true },
  { id: 'ts-perm-2', label: '11h00 - 12h30', startTime: '11:00', endTime: '12:30', isTraining: false },
  { id: 'ts-2', label: '12h30 - 13h30', startTime: '12:30', endTime: '13:30', isTraining: true },
  { id: 'ts-pause-1', label: '13h30 - 17h00', startTime: '13:30', endTime: '17:00', isTraining: false }, // C'est la pause
  { id: 'ts-perm-4', label: '17h00 - 20h00', startTime: '17:00', endTime: '20:00', isTraining: false },
  { id: 'ts-3', label: '20h00 - 21h00', startTime: '20:00', endTime: '21:00', isTraining: true },
];

export const INITIAL_PERIODS: Period[] = [
  {
    id: 'p1a',
    name: 'Période 1A (20 juil - 26 juil)',
    startDate: '2026-07-20',
    endDate: '2026-07-26',
    hasTraining: true,
    coachAssignments: {
      'Mehdi': 'Minimes',
      'Dadi': 'Saint-Cyprien',
      'Walid': 'États-Unis',
      'Faye': null,
      'Valentin Gutt': null,
      'Renaud': 'Ramonville',
    }
  },
  {
    id: 'p1b',
    name: 'Période 1B (27 juil - 2 août)',
    startDate: '2026-07-27',
    endDate: '2026-08-02',
    hasTraining: true,
    coachAssignments: {
      'Mehdi': 'Minimes',
      'Dadi': 'Saint-Cyprien',
      'Walid': 'États-Unis',
      'Faye': 'Ramonville',
      'Valentin Gutt': null,
      'Renaud': null,
    }
  },
  {
    id: 'p2',
    name: 'Période 2 (3 août - 9 août)',
    startDate: '2026-08-03',
    endDate: '2026-08-09',
    hasTraining: true, // Ouvert en accès libre total
    coachAssignments: {
      'Mehdi': null,
      'Dadi': null,
      'Walid': null,
      'Faye': null,
      'Valentin Gutt': null,
      'Renaud': null,
    }
  },
  {
    id: 'p3',
    name: 'Période 3 (10 août - 23 août)',
    startDate: '2026-08-10',
    endDate: '2026-08-23',
    hasTraining: true,
    coachAssignments: {
      'Mehdi': null,
      'Dadi': 'Saint-Cyprien',
      'Walid': 'Minimes',
      'Faye': 'Ramonville', // Faye remplace Renaud
      'Valentin Gutt': 'États-Unis',
      'Renaud': null,
    }
  }
];
