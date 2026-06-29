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
  'Boxe anglaise': 'bg-[#1e40af] text-white',
  'Boxing Camp': 'bg-[#b91c1c] text-white',
  'Permanence': 'bg-[#065f46] text-white',
  'ACCÈS LIBRE': 'bg-[#111827] text-gray-400',
  'Pause': 'bg-[#1f2937] text-gray-500',
};

export function MembersSchedule() {
  const sessions = useStore(sessionsStore);
  
  // Custom period types for Members
  const memberPeriods = [
    { id: 'training', name: 'Entraînements (20 juil - 02 août & 10 août - 23 août)' },
    { id: 'free', name: 'Fermeture / Accès Libre Total (03 août - 09 août)' }
  ];
  
  const [activePeriodId, setActivePeriodId] = useState(memberPeriods[0].id);
  const [activeRoom, setActiveRoom] = useState<Room>(ROOMS[0]);
  
  // We use p1a to generate the training schedule (since they are all identical for members)
  // and p2 for the free access schedule
  const sourcePeriodId = activePeriodId === 'training' ? 'p1a' : 'p2';
  
  // Generate a generic "Week 1" since schedules repeat identically each week for members
  const dates = Array.from(new Set(sessions.filter(s => s.periodId === sourcePeriodId).map(s => s.date))).sort().slice(0, 5); // Just 5 days (Monday-Friday)
  
  const handlePrintAll = () => {
    exportToPDF('all-schedules', `Plannings_Adherents_Toutes_Salles_${activePeriodId}`);
  };

  const renderTable = (room: string) => {
    const roomSessions = sessions.filter(s => s.periodId === sourcePeriodId && s.roomId === room && !s.isPermanence);

    return (
      <div className="print:mt-4 bg-[#111827] overflow-hidden rounded shadow-2xl border-4 border-[#1c2646]">
        <table className="w-full text-center border-collapse">
          <thead>
            <tr>
              <th colSpan={dates.length + 1} className="relative py-8 px-8 bg-[#1c2646] border-b-2 border-gray-800">
                {/* Background Boxers Image Placeholder / Effect */}
                <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?q=80&w=2000')] bg-cover bg-center mix-blend-overlay"></div>
                <div className="relative z-10 flex justify-between items-center">
                  <div className="text-left">
                    <div className="text-white text-3xl md:text-5xl font-sans font-black uppercase tracking-widest">
                      SALLE <span className="text-[#c59e5e]">{room}</span>
                    </div>
                  </div>
                  <img src="/logo.png" alt="Boxing Center" className="h-16 md:h-20 object-contain drop-shadow-2xl" />
                </div>
              </th>
            </tr>
            <tr>
              <th className="border border-gray-800 w-28 bg-[#2a4365] print:p-2"></th>
              {dates.map(date => (
                <th key={date} className="py-4 px-2 border border-gray-800 font-bold uppercase bg-[#2a4365] text-white text-sm tracking-widest">
                  {format(parseISO(date), 'EEEE', { locale: fr })}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {TIME_SLOTS.map(slot => (
              <tr key={slot.id}>
                <td className="py-3 px-2 border border-gray-800 font-bold text-white bg-[#3182ce] text-sm whitespace-nowrap">
                  {slot.startTime}-{slot.endTime}
                </td>
                {dates.map(date => {
                  const session = roomSessions.find(s => s.date === date && s.timeSlotId === slot.id);
                  let content = "ACCÈS LIBRE";
                  let bgClass = DISCIPLINE_COLORS['ACCÈS LIBRE'];
                  
                  if (session) {
                    if (session.discipline === 'Pause') {
                      bgClass = DISCIPLINE_COLORS['Pause'];
                      content = "FERMETURE";
                    } else if (session.discipline === 'Accès libre') {
                      bgClass = DISCIPLINE_COLORS['ACCÈS LIBRE'];
                      content = "ACCÈS LIBRE";
                    } else {
                      bgClass = DISCIPLINE_COLORS[session.discipline] || 'bg-gray-700 text-white';
                      content = session.discipline;
                    }
                  }
                  
                  return (
                    <td key={date} className={`border border-gray-800 font-black uppercase tracking-widest text-xs sm:text-sm p-0 m-0 ${bgClass}`}>
                      <div className="w-full h-full flex items-center justify-center min-h-[70px] px-2 py-4">
                        {content}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
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
              className={`px-5 py-2 rounded-lg text-sm font-bold uppercase tracking-wider whitespace-nowrap transition-colors border-2 ${
                activeRoom === r 
                  ? 'bg-[#c59e5e] border-[#c59e5e] text-[#1c2646] shadow-md' 
                  : 'bg-white text-gray-400 border-gray-200 hover:border-[#c59e5e] hover:text-[#c59e5e]'
              }`}
            >
              {r.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <div className="print:hidden flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex gap-2 overflow-x-auto pb-2 w-full sm:w-auto">
          {memberPeriods.map(p => (
            <button
              key={p.id}
              onClick={() => setActivePeriodId(p.id)}
              className={`px-4 py-2 rounded-md text-sm font-bold uppercase tracking-wide whitespace-nowrap transition-colors border-2 ${
                activePeriodId === p.id 
                  ? 'bg-[#1c2646] border-[#1c2646] text-white shadow-md' 
                  : 'bg-white text-gray-500 border-gray-200 hover:border-[#1c2646] hover:text-[#1c2646]'
              }`}
            >
              {p.name}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          <button 
            onClick={() => exportToPDF('members-schedule-table', `Planning_Adherents_${activeRoom}_${activePeriodId}`)}
            className="text-sm px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded shadow-md flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path><polyline points="14 2 14 8 20 8"></polyline><path d="M12 18v-6"></path><path d="m9 15 3 3 3-3"></path></svg>
            IMPRIMER
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
    </div>
  );
}
