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

    const weeks = [];
    for (let i = 0; i < dates.length; i += 5) {
      weeks.push(dates.slice(i, i + 5));
    }

    return (
      <div className="space-y-8 print:space-y-6">
        {weeks.map((weekDates, weekIdx) => (
          <div key={weekIdx} className="overflow-x-auto print:overflow-visible bg-white rounded-2xl shadow-xl border border-gray-100">
            <table className="w-full text-center border-collapse text-sm">
              <thead>
                <tr>
                  <th colSpan={weekDates.length + 1} className="py-5 text-2xl font-sans font-black uppercase tracking-widest bg-gradient-to-r from-[#1c2646] to-[#2a3861] text-white border-b-4 border-[#c59e5e]">
                    <span className="text-[#c59e5e]">/</span> {room} <span className="text-white/60 font-medium ml-3 text-lg tracking-normal">({activePeriod?.name} - Semaine {weekIdx + 1})</span>
                  </th>
                </tr>
                <tr>
                  <th className="border-r border-b-2 border-gray-100 w-24 bg-gray-50 print:p-2"></th>
                  {weekDates.map(date => (
                    <th key={date} className="py-4 px-2 border-r border-b-2 border-gray-100 font-bold uppercase bg-gray-50 text-[#1c2646] text-xs sm:text-sm print:text-xs">
                      {format(parseISO(date), 'EEEE', { locale: fr })}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {TIME_SLOTS.map(slot => (
                  <tr key={slot.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-3 px-2 border-r border-b border-gray-100 font-bold text-[#1c2646] bg-gray-50/50 text-xs sm:text-sm print:text-xs">
                      {slot.label}
                    </td>
                    {weekDates.map(date => {
                      const session = roomSessions.find(s => s.date === date && s.timeSlotId === slot.id);
                      let content = <span className="text-gray-300">-</span>;
                      let cellClass = "bg-white";
                      
                      if (session) {
                        const isPerm = session.isPermanence || session.discipline === 'ACCES LIBRE' || session.discipline === 'Pause';
                        cellClass = isPerm ? 'bg-[#c59e5e]/10 text-[#1c2646]' : 'bg-white text-[#1c2646]';
                        content = <span className="font-bold text-sm">{session.discipline}</span>;
                      } else {
                        cellClass = 'bg-[#1c2646]/5 text-[#1c2646]/60';
                        content = <span className="font-semibold text-xs tracking-wide">ACCÈS LIBRE</span>;
                      }
                      
                      return (
                        <td key={date} className={`border-r border-b border-gray-100 font-bold uppercase tracking-wide text-xs sm:text-sm print:text-xs ${cellClass}`}>
                          <div className="w-full h-full p-2 flex items-center justify-center min-h-[50px] sm:min-h-[80px] print:min-h-[60px]">
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
        ))}
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
                  ? 'bg-brand-navy border-brand-navy text-brand-gold shadow-md' 
                  : 'bg-white text-brand-navy/60 border-gray-200 hover:border-brand-navy/50 hover:text-brand-navy'
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
              className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide whitespace-nowrap transition-colors border-2 ${
                activePeriodId === p.id 
                  ? 'bg-brand-navy border-brand-navy text-brand-gold shadow-md' 
                  : 'bg-white text-brand-navy/60 border-gray-200 hover:border-brand-navy/50 hover:text-brand-navy'
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
            IMPRIMER LE TABLEAU
          </button>
          <button 
            onClick={handlePrintAll}
            className="text-sm px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded shadow-md flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><path d="M14 2v6h6"></path><path d="M16 13H8"></path><path d="M16 17H8"></path><path d="M10 9H8"></path></svg>
            TOUT IMPRIMER
          </button>
          <button 
            onClick={async (e) => {
              const btn = e.currentTarget;
              const originalText = btn.innerHTML;
              btn.innerHTML = '⏳ Création du ZIP...';
              btn.disabled = true;
              
              try {
                const { exportAllToZip } = await import('../lib/exportZip');
                await exportAllToZip('', 'all-members-schedules', activePeriod?.name || 'Periode');
              } catch (err) {
                console.error(err);
                alert("Erreur lors de la création du ZIP.");
              } finally {
                btn.innerHTML = originalText;
                btn.disabled = false;
              }
            }}
            className="text-sm px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-bold rounded shadow-md flex items-center gap-2 disabled:opacity-50"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
            TOUT TÉLÉCHARGER (ZIP)
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
