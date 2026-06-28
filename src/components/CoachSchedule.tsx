import React, { useState } from 'react';
import { useStore } from '@nanostores/react';
import { sessionsStore, periodsStore } from '../lib/store';
import { COACHES, TIME_SLOTS } from '../lib/data';
import type { CoachName } from '../lib/types';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { exportToPDF } from '../lib/exportPdf';

const DISCIPLINE_COLORS: Record<string, string> = {
  'Boxe anglaise': 'bg-red-600 text-white',
  'Boxing Camp': 'bg-purple-700 text-white',
  'Permanence': 'bg-emerald-500 text-white',
};

const ROOM_COLORS: Record<string, string> = {
  'Minimes': 'bg-green-600 text-white',
  'Saint-Cyprien': 'bg-blue-500 text-white',
  'Ramonville': 'bg-orange-500 text-white',
  'États-Unis': 'bg-gray-700 text-white',
};

export function CoachSchedule() {
  const sessions = useStore(sessionsStore);
  const periods = useStore(periodsStore);
  
  const [activeCoach, setActiveCoach] = useState<CoachName>(COACHES[0]);
  const [activePeriodId, setActivePeriodId] = useState(periods[0]?.id);
  
  const activePeriod = periods.find(p => p.id === activePeriodId);
  
  const coachSessions = sessions.filter(s => s.periodId === activePeriodId && s.coachId === activeCoach);
  const dates = Array.from(new Set(sessions.filter(s => s.periodId === activePeriodId).map(s => s.date))).sort();

  const assignedRoom = activePeriod?.coachAssignments[activeCoach];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        <div className="flex gap-2 overflow-x-auto max-w-full pb-2">
          {COACHES.map(c => (
            <button
              key={c}
              onClick={() => setActiveCoach(c)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                activeCoach === c 
                  ? 'bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900' 
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              {c.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <div className="flex justify-between items-center">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {periods.map(p => (
            <button
              key={p.id}
              onClick={() => setActivePeriodId(p.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                activePeriodId === p.id 
                  ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300' 
                  : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {p.name}
            </button>
          ))}
        </div>
        
        <div className="flex gap-2">
          <button 
            onClick={() => exportToPDF('coach-schedule-table', `Planning_Coach_${activeCoach}_${activePeriod?.name}`)}
            className="text-sm px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded shadow-md flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path><polyline points="14 2 14 8 20 8"></polyline><path d="M12 18v-6"></path><path d="m9 15 3 3 3-3"></path></svg>
            TÉLÉCHARGER PDF
          </button>
        </div>
      </div>

      {!activePeriod?.hasTraining ? (
        <div className="p-8 text-center text-gray-500 bg-gray-50 dark:bg-gray-800 rounded-xl">
          Aucune activité prévue pour {activeCoach} sur cette période.
        </div>
      ) : (
        <div id="coach-schedule-table" className="overflow-x-auto border border-gray-300 bg-white rounded-lg shadow-sm">
          <table className="w-full text-center border-collapse text-sm text-gray-900">
            <thead>
              <tr>
                <th colSpan={6} className="py-4 text-xl font-bold uppercase tracking-wider border-b border-gray-300 bg-gray-50">
                  {activeCoach}
                </th>
              </tr>
              <tr>
                <th className="border-r border-b border-gray-300 w-32 bg-gray-50"></th>
                {dates.map(date => (
                  <th key={date} className="py-3 px-2 border-r border-b border-gray-300 w-1/5 font-bold uppercase bg-gray-50">
                    {format(parseISO(date), 'EEEE', { locale: fr })}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {TIME_SLOTS.map(slot => (
                <tr key={slot.id}>
                  <td className="py-4 px-2 border-r border-b border-gray-300 font-medium bg-gray-50">
                    {slot.label}
                  </td>
                  {dates.map(date => {
                    const session = coachSessions.find(s => s.date === date && s.timeSlotId === slot.id);
                    const isPerm = session?.isPermanence;
                    
                    // In coach view, we also show permanences as they are part of their hours.
                    const cellContent = session ? (isPerm ? 'PERMANENCE' : session.discipline) : '';
                    const colorClass = session ? (DISCIPLINE_COLORS[session.discipline] || 'bg-gray-200 text-gray-800') : 'bg-white text-gray-600';
                    
                    return (
                      <td key={date} className={`border-r border-b border-gray-300 font-bold uppercase tracking-wide ${colorClass}`}>
                        <div className="w-full h-full p-4 flex items-center justify-center min-h-[80px]">
                          {cellContent}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
              {/* Ligne des Salles */}
              <tr>
                <td className="border-r border-gray-300 bg-gray-50"></td>
                {dates.map(date => (
                  <td 
                    key={date} 
                    className={`border-r border-gray-300 font-bold uppercase tracking-wide py-3 ${assignedRoom ? (ROOM_COLORS[assignedRoom] || 'bg-gray-200 text-gray-800') : 'bg-white'}`}
                  >
                    {assignedRoom || ''}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
