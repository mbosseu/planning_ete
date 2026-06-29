import { addDays, parseISO, isWeekend, format, eachDayOfInterval } from 'date-fns';
import type { Period, ClassSession, Discipline, TimeSlot, CoachName, Room } from './types';
import { TIME_SLOTS, ROOMS, COACHES } from './data';

const DISCIPLINES: Discipline[] = ['Boxe anglaise', 'Boxing Camp'];
const TARGET_HOURS = 35; // Target weekly hours

export function generateScheduleForPeriod(period: Period, existingSessions: ClassSession[] = []): ClassSession[] {
  if (!period.hasTraining) {
    return [];
  }

  const sessions: ClassSession[] = [];
  const start = parseISO(period.startDate);
  const end = parseISO(period.endDate);
  
  const days = eachDayOfInterval({ start, end }).filter(day => !isWeekend(day));
  
  // Track weekly hours per coach to add permanences
  // Week is determined by week number or simply grouping by 5 days if strictly Mon-Fri
  
  days.forEach((day, dayIndex) => {
    const dateStr = format(day, 'yyyy-MM-dd');
    
    // We want to alternate disciplines. 
    // To avoid all rooms having the same discipline at the same time:
    // We can offset the discipline index by room index and day index.
    
    ROOMS.forEach((room, roomIndex) => {
      // Find which coach is assigned to this room in this period
      const assignedCoachEntry = Object.entries(period.coachAssignments).find(([_, assignedRoom]) => assignedRoom === room);
      const coach = assignedCoachEntry ? (assignedCoachEntry[0] as CoachName) : null;
      
      if (!coach) return; // No coach assigned to this room, skip generating classes here

      TIME_SLOTS.forEach((slot, slotIndex) => {
        if (slot.isTraining) {
          // Simple heuristic to alternate disciplines
          const disciplineIndex = (dayIndex + roomIndex + slotIndex) % DISCIPLINES.length;
          const discipline = DISCIPLINES[disciplineIndex];

          sessions.push({
            id: `session-${period.id}-${room}-${dateStr}-${slot.id}`,
            periodId: period.id,
            date: dateStr,
            timeSlotId: slot.id,
            roomId: room,
            coachId: coach,
            discipline: discipline,
            isPermanence: false
          });
        } else if (slot.id !== 'ts-pause-1') {
          // Permanence pour tous les créneaux non-training sauf la pause
          sessions.push({
            id: `perm-${period.id}-${coach}-${dateStr}-${slot.id}`,
            periodId: period.id,
            date: dateStr,
            timeSlotId: slot.id,
            roomId: room,
            coachId: coach,
            discipline: 'Permanence',
            isPermanence: true
          });
        }
      });
    });
  });

  return sessions;
}

export function generateAllSchedules(periods: Period[]): ClassSession[] {
  let allSessions: ClassSession[] = [];
  for (const period of periods) {
    allSessions = allSessions.concat(generateScheduleForPeriod(period));
  }
  return allSessions;
}
