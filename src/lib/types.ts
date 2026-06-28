export type Discipline = 'Boxe anglaise' | 'Boxing Camp' | 'Permanence';

export type Room = 'Minimes' | 'Saint-Cyprien' | 'Ramonville' | 'États-Unis';

export type CoachName = 'Mehdi' | 'Dadi' | 'Walid' | 'Faye' | 'Valentin Gutt' | 'Renaud';

export interface Period {
  id: string;
  name: string;
  startDate: string; // YYYY-MM-DD
  endDate: string;
  hasTraining: boolean;
  coachAssignments: Record<CoachName, Room | null>;
}

export interface TimeSlot {
  id: string;
  label: string; // e.g. "10h00 - 11h00"
  startTime: string; // HH:mm
  endTime: string;
  isTraining?: boolean;
}

export interface ClassSession {
  id: string;
  periodId: string;
  date: string; // YYYY-MM-DD
  timeSlotId: string;
  roomId: Room;
  coachId: CoachName;
  discipline: Discipline;
  isPermanence: boolean;
}

export interface CoachStats {
  coachId: CoachName;
  totalHours: number;
  classHours: number;
  permanenceHours: number;
  targetHours: number; // usually 35
}
