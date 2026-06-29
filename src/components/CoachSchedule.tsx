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
  const dates = Array.from(new Set(sessions.filter(s => s.periodId === activePeriodId).map(s => s.date))).sort();
  
  const handlePrintAll = () => {
    exportToPDF('all-schedules', `Plannings_Coachs_Tous_${activePeriod?.name || ''}`);
  };

  const renderTable = (coach: CoachName) => {
    const coachSessions = sessions.filter(s => s.periodId === activePeriodId && s.coachId === coach);
    const assignedRoom = activePeriod?.coachAssignments[coach];

    const weeks = [];
    for (let i = 0; i < dates.length; i += 5) {
      weeks.push(dates.slice(i, i + 5));
    }

    return (
      <div className="space-y-8 print:space-y-6">
        {weeks.map((weekDates, weekIdx) => (
          <div key={weekIdx} className="overflow-x-auto print:overflow-visible border border-gray-300 bg-white rounded-lg shadow-sm">
            <table className="w-full text-center border-collapse text-sm text-gray-900">
              <thead>
                <tr>
                  <th colSpan={weekDates.length + 1} className="py-4 text-2xl font-oswald uppercase tracking-widest border-b border-brand-navy bg-brand-navy text-brand-gold">
                    Coach : {coach} <span className="text-white/80 font-sans tracking-normal ml-2 text-lg">({activePeriod?.name} - Semaine {weekIdx + 1})</span>
                  </th>
                </tr>
                <tr>
                  <th className="border-r border-b border-gray-300 w-24 bg-gray-100 print:p-2"></th>
                  {weekDates.map(date => (
                    <th key={date} className="py-3 px-1 border-r border-b border-gray-300 font-bold uppercase bg-gray-100 text-brand-navy text-xs sm:text-sm print:text-xs">
                      {format(parseISO(date), 'EEEE', { locale: fr })}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {TIME_SLOTS.map(slot => (
                  <tr key={slot.id}>
                    <td className="py-2 px-1 border-r border-b border-gray-300 font-medium bg-gray-50 text-xs sm:text-sm print:text-xs">
                      {slot.label}
                    </td>
                    {weekDates.map(date => {
                      const session = coachSessions.find(s => s.date === date && s.timeSlotId === slot.id);
                      const colorClass = session ? (DISCIPLINE_COLORS[session.discipline] || 'bg-gray-200 text-gray-800') : 'bg-white text-gray-600';
                      
                      return (
                        <td key={date} className={`border-r border-b border-gray-300 font-bold uppercase tracking-wide text-xs sm:text-sm print:text-xs ${colorClass}`}>
                          <div className="w-full h-full p-2 sm:p-4 print:p-2 flex flex-col items-center justify-center min-h-[40px] sm:min-h-[80px] print:min-h-[60px]">
                            {session ? (
                              <>
                                <span>{session.discipline}</span>
                                <span className="text-[10px] sm:text-[11px] opacity-90 mt-1">{session.roomId}</span>
                              </>
                            ) : '-'}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
                {/* Ligne des Salles */}
                <tr>
                  <td className="py-2 px-1 border-r border-gray-300 font-medium bg-gray-50 print:p-2"></td>
                  {weekDates.map(date => (
                    <td 
                      key={date} 
                      className={`border-r border-gray-300 font-bold uppercase tracking-wide py-2 px-1 text-xs sm:text-sm print:text-xs ${assignedRoom ? (ROOM_COLORS[assignedRoom] || 'bg-gray-200 text-gray-800') : 'bg-white'}`}
                    >
                      {assignedRoom || ''}
                    </td>
                  ))}
                </tr>
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
          {COACHES.map(c => (
            <button
              key={c}
              onClick={() => setActiveCoach(c)}
              className={`px-5 py-2 rounded-lg text-sm font-bold uppercase tracking-wider whitespace-nowrap transition-colors border-2 ${
                activeCoach === c 
                  ? 'bg-brand-navy border-brand-navy text-brand-gold shadow-md' 
                  : 'bg-white text-brand-navy/60 border-gray-200 hover:border-brand-navy/50 hover:text-brand-navy'
              }`}
            >
              {c.toUpperCase()}
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
            onClick={() => exportToPDF('coach-schedule-table', `Planning_Coach_${activeCoach}_${activePeriod?.name}`)}
            className="text-sm px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded shadow-md flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path><polyline points="14 2 14 8 20 8"></polyline><path d="M12 18v-6"></path><path d="m9 15 3 3 3-3"></path></svg>
            IMPRIMER LE COACH
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
                await exportAllToZip('all-schedules', '', activePeriod?.name || 'Periode');
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
          Aucune activité prévue pour {activeCoach} sur cette période.
        </div>
      ) : (
        <>
          <div id="coach-schedule-table">
            {renderTable(activeCoach)}
          </div>
          
          <div id="all-schedules" className="hidden">
            {COACHES.map((coach, idx) => (
              <div key={coach} className={idx < COACHES.length - 1 ? "print-page-break" : ""}>
                {renderTable(coach)}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
