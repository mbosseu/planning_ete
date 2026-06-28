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

      TIME_SLOTS.filter(s => s.isTraining).forEach((slot, slotIndex) => {
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
      });
    });
  });

  // Now, calculate remaining hours to reach TARGET_HOURS and generate permanences
  // We'll group sessions by coach and by week.
  // For simplicity in this mock generator, let's just generate a block of permanence 
  // on a specific time slot (or fake time slots) if they don't have classes.
  // Actually, we can generate a daily permanence block of 4 hours to reach the 35h goal
  // (Since they have 3 hours of classes, 35/5 = 7h per day, so 7 - 3 = 4h permanence).
  
  days.forEach(day => {
    const dateStr = format(day, 'yyyy-MM-dd');
    
    COACHES.forEach(coach => {
      const isAssigned = Object.values(period.coachAssignments).includes(coach as any); // Check if coach has a room this period
      if (!isAssigned) return;

      // Add a permanence block during the long afternoon gap (13h30 - 20h00)
      sessions.push({
        id: `perm-${period.id}-${coach}-${dateStr}`,
        periodId: period.id,
        date: dateStr,
        timeSlotId: 'ts-free-3', // L'après-midi en Accès Libre
        roomId: period.coachAssignments[coach] as Room, // Usually at their assigned room
        coachId: coach,
        discipline: 'Permanence',
        isPermanence: true
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
