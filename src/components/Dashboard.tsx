import React from 'react';
import { useStore } from '@nanostores/react';
import { sessionsStore, periodsStore, generateAndSave } from '../lib/store';
import { Button } from './ui/button';
import { COACHES, ROOMS, TIME_SLOTS } from '../lib/data';
import type { CoachName } from '../lib/types';

export function Dashboard() {
  const sessions = useStore(sessionsStore);
  const periods = useStore(periodsStore);

  const totalClasses = sessions.filter(s => !s.isPermanence && s.discipline !== 'Pause').length;
  const totalPermanences = sessions.filter(s => s.isPermanence).length;

  const coachStats = COACHES.map(coach => {
    const coachSessions = sessions.filter(s => s.coachId === coach);
    
    let classesHours = 0;
    let permsHours = 0;

    coachSessions.forEach(session => {
      const slot = TIME_SLOTS.find(t => t.id === session.timeSlotId);
      if (!slot) return;
      
      const startHour = parseInt(slot.startTime.split(':')[0], 10);
      const startMin = parseInt(slot.startTime.split(':')[1], 10);
      const endHour = parseInt(slot.endTime.split(':')[0], 10);
      const endMin = parseInt(slot.endTime.split(':')[1], 10);
      
      const duration = (endHour + endMin / 60) - (startHour + startMin / 60);

      if (session.isPermanence) {
        permsHours += duration;
      } else if (session.discipline !== 'Pause') {
        classesHours += duration;
      }
    });
    const coachPeriods = periods.filter(p => {
      const assignedRoom = p.coachAssignments[coach as keyof typeof p.coachAssignments];
      return assignedRoom !== null && assignedRoom !== undefined;
    });
    let daysAssigned = 0;
    coachPeriods.forEach(p => {
      const start = new Date(p.startDate);
      const end = new Date(p.endDate);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      daysAssigned += diffDays;
    });
    
    const weeksAssigned = daysAssigned > 0 ? daysAssigned / 7 : 1; // avoid div by 0

    return { 
      name: coach, 
      classesWeekly: classesHours / weeksAssigned, 
      permsWeekly: permsHours / weeksAssigned, 
      totalWeekly: (classesHours + permsHours) / weeksAssigned 
    };
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-oswald uppercase text-brand-navy tracking-wide">Tableau de bord</h1>
        <Button onClick={() => generateAndSave()} className="bg-brand-gold hover:bg-brand-gold/90 text-white font-bold rounded-lg px-6 py-2">
          Générer automatiquement le planning
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-brand-navy">
          <div className="text-sm font-semibold uppercase text-brand-navy/60">Salles Actives</div>
          <div className="text-4xl font-oswald text-brand-navy mt-2">{ROOMS.length}</div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-brand-navy">
          <div className="text-sm font-semibold uppercase text-brand-navy/60">Coachs</div>
          <div className="text-4xl font-oswald text-brand-navy mt-2">{COACHES.length}</div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-brand-navy">
          <div className="text-sm font-semibold uppercase text-brand-navy/60">Total Cours</div>
          <div className="text-4xl font-oswald text-brand-navy mt-2">{totalClasses}</div>
        </div>
        <div className="bg-brand-navy p-6 rounded-xl shadow-md border-l-4 border-brand-gold">
          <div className="text-sm font-semibold uppercase text-brand-light/70">Périodes config.</div>
          <div className="text-4xl font-oswald text-brand-gold mt-2">{periods.length}</div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
        <h2 className="text-xl font-oswald uppercase tracking-wide mb-6 text-brand-navy border-b-2 border-brand-gold pb-2 inline-block">Heures Hebdomadaires par Coach</h2>
        <div className="space-y-5 mt-4">
          {coachStats.map(stat => (
            <div key={stat.name} className="flex items-center justify-between">
              <span className="w-32 font-bold uppercase text-brand-navy">{stat.name}</span>
              <div className="flex-1 mx-4 bg-gray-100 rounded-full h-4 overflow-hidden flex border border-gray-200">
                <div className="bg-brand-navy h-full transition-all duration-500" style={{ width: `${(stat.classesWeekly / 35) * 100}%` }} title={`Cours: ${stat.classesWeekly.toFixed(1)}h`} />
                <div className="bg-brand-gold h-full transition-all duration-500" style={{ width: `${(stat.permsWeekly / 35) * 100}%` }} title={`Permanences: ${stat.permsWeekly.toFixed(1)}h`} />
              </div>
              <span className="w-20 text-right text-sm font-bold text-brand-navy bg-brand-light px-2 py-1 rounded">{Math.round(stat.totalWeekly)}h / 35h</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
