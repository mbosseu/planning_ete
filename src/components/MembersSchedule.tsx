import React, { useState } from 'react';
import { useStore } from '@nanostores/react';
import { sessionsStore, periodsStore } from '../lib/store';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { ROOMS, TIME_SLOTS } from '../lib/data';
import type { Room } from '../lib/types';
import { exportToPDF } from '../lib/exportPdf';
import type { Room } from '../lib/types';

const DISCIPLINE_COLORS: Record<string, string> = {
  'Boxe anglaise': 'bg-red-600 text-white',
  'Boxing Camp': 'bg-purple-700 text-white',
  'Permanence': 'bg-emerald-500 text-white',
};

const COACH_COLORS: Record<string, string> = {
  'Mehdi': 'bg-blue-600 text-white',
  'Dadi': 'bg-red-700 text-white',
  'Walid': 'bg-green-600 text-white',
  'Faye': 'bg-orange-500 text-white',
  'Valentin Gutt': 'bg-gray-500 text-white',
  'Renaud': 'bg-indigo-600 text-white',
};

export function MembersSchedule() {
  const sessions = useStore(sessionsStore);
  const periods = useStore(periodsStore);
  
  const [activePeriodId, setActivePeriodId] = useState(periods[0]?.id);
  const [activeRoom, setActiveRoom] = useState<Room>(ROOMS[0]);
  
  const activePeriod = periods.find(p => p.id === activePeriodId);
  const dates = Array.from(new Set(sessions.filter(s => s.periodId === activePeriodId).map(s => s.date))).sort();
  
  const handlePrintAll = () => {
    exportToPDF('all-schedules', `Plannings_Adherents_Toutes_Salles_${activePeriod?.name || ''}`);
  };

  const renderTable = (room: string) => {
    const roomSessions = sessions.filter(s => s.periodId === activePeriodId && s.roomId === room && !s.isPermanence);
    
    // Determine coach for the room in this period
    const assignedCoachEntry = activePeriod ? Object.entries(activePeriod.coachAssignments).find(([_, r]) => r === room) : null;
    const assignedCoach = assignedCoachEntry ? assignedCoachEntry[0] : null;

    return (
      <div className="overflow-x-auto print:overflow-visible border border-gray-300 bg-white rounded-lg shadow-sm mb-8">
        <table className="w-full text-center border-collapse text-sm text-gray-900">
          <thead>
            <tr>
              <th colSpan={dates.length + 1} className="py-4 text-xl font-bold uppercase tracking-wider border-b border-gray-300 bg-gray-50">
                {room} <span className="text-gray-500 font-medium ml-2 text-lg">({activePeriod?.name})</span>
              </th>
            </tr>
            <tr>
              <th className="border-r border-b border-gray-300 w-24 bg-gray-50 print:p-1"></th>
              {dates.map(date => (
                <th key={date} className="py-2 px-1 border-r border-b border-gray-300 font-bold uppercase bg-gray-50 text-xs print:text-[10px]">
                  {format(parseISO(date), 'EEEE', { locale: fr })}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {TIME_SLOTS.map(slot => (
              <tr key={slot.id}>
                <td className="py-2 px-1 border-r border-b border-gray-300 font-medium bg-gray-50 text-xs print:text-[10px]">
                  {slot.label}
                </td>
                {dates.map(date => {
                  const session = roomSessions.find(s => s.date === date && s.timeSlotId === slot.id);
                  const colorClass = session ? (DISCIPLINE_COLORS[session.discipline] || 'bg-gray-200 text-gray-800') : 'bg-white text-gray-600';
                  
                  return (
                    <td key={date} className={`border-r border-b border-gray-300 font-bold uppercase tracking-wide text-[10px] sm:text-xs ${colorClass}`}>
                      <div className="w-full h-full p-1 sm:p-2 md:p-4 print:p-1 flex items-center justify-center min-h-[40px] sm:min-h-[60px] md:min-h-[80px]">
                        {session ? session.discipline : 'ACCES LIBRE'}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
            {/* Ligne des coachs */}
            <tr>
              <td className="py-2 px-1 border-r border-gray-300 font-medium bg-gray-50 print:p-1"></td>
              {dates.map(date => (
                <td 
                  key={date} 
                  className={`border-r border-gray-300 font-bold uppercase tracking-wide py-2 px-1 text-[10px] sm:text-xs ${assignedCoach ? (COACH_COLORS[assignedCoach] || 'bg-gray-200 text-gray-800') : 'bg-white'}`}
                >
                  {assignedCoach || ''}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="space-y-6 print:space-y-0 print:m-0 print:p-0">
      <div className="print:hidden flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        <div className="flex gap-2 overflow-x-auto max-w-full pb-2">
          {ROOMS.map(r => (
            <button
              key={r}
              onClick={() => setActiveRoom(r)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                activeRoom === r 
                  ? 'bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900' 
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              {r.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <div className="print:hidden flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex gap-2 overflow-x-auto pb-2 w-full sm:w-auto">
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
        <div className="flex flex-wrap gap-2">
          <button 
            onClick={() => exportToPDF('members-schedule-table', `Planning_Adherents_${activeRoom}_${activePeriod?.name}`)}
            className="text-sm px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded shadow-md flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path><polyline points="14 2 14 8 20 8"></polyline><path d="M12 18v-6"></path><path d="m9 15 3 3 3-3"></path></svg>
            IMPRIMER LA SALLE
          </button>
          <button 
            onClick={handlePrintAll}
            className="text-sm px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded shadow-md flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><path d="M14 2v6h6"></path><path d="M16 13H8"></path><path d="M16 17H8"></path><path d="M10 9H8"></path></svg>
            TOUT IMPRIMER
          </button>
        </div>
      </div>

      {!activePeriod?.hasTraining ? (
        <div className="p-8 text-center text-gray-500 bg-gray-50 dark:bg-gray-800 rounded-xl">
          Aucun entraînement prévu pour cette période. Le club est fermé.
        </div>
      ) : (
        <>
          <div id="members-schedule-table">
            {renderTable(activeRoom)}
          </div>
          
          <div id="all-schedules" className="hidden">
            {ROOMS.map((room, idx) => (
              <div key={room} className={idx < ROOMS.length - 1 ? "print-page-break" : ""}>
                {renderTable(room)}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
