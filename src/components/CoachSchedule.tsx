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
      <div className="space-y-12 print:space-y-8">
        {weeks.map((weekDates, weekIdx) => (
          <div key={weekIdx} className="overflow-x-auto print:overflow-visible bg-white rounded-[1.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-100">
            <table className="w-full text-center border-collapse text-sm">
              <thead>
                <tr>
                  <th colSpan={weekDates.length + 1} className="py-6 px-8 bg-[#1c2646] border-b-[6px] border-[#c59e5e]">
                    <div className="flex justify-between items-center">
                      <div className="text-left">
                        <div className="text-[#c59e5e] font-black tracking-widest text-sm mb-1 uppercase">Boxing Center Planning</div>
                        <div className="text-3xl font-sans font-black uppercase tracking-widest text-white">
                          Coach : <span className="text-[#c59e5e]">{coach}</span> 
                          <span className="text-white/60 font-medium ml-3 text-xl tracking-normal">({activePeriod?.name} - Sem. {weekIdx + 1})</span>
                        </div>
                      </div>
                      <img src="/logo.png" alt="Boxing Center" className="h-14 object-contain" />
                    </div>
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
                      const session = coachSessions.find(s => s.date === date && s.timeSlotId === slot.id);
                      let content = <span className="text-gray-300">-</span>;
                      let cellClass = "bg-white";
                      
                      if (session) {
                        const isPerm = session.isPermanence || session.discipline === 'ACCES LIBRE';
                        
                        let bgClass = 'bg-[#1c2646]/10 text-[#1c2646]';
                        let roomClass = 'text-[#1c2646]/60';
                        let textTitleClass = '';
                        
                        if (session.discipline === 'Pause') {
                          bgClass = 'bg-gray-100 text-gray-500';
                          roomClass = 'text-gray-400';
                        } else if (isPerm || session.discipline === 'Permanence') {
                          bgClass = 'bg-[#c59e5e]/15 text-[#1c2646] border-l-4 border-l-[#c59e5e]';
                          roomClass = 'text-[#c59e5e]';
                        } else if (session.discipline === 'Boxe anglaise') {
                          bgClass = 'bg-[#1c2646]/10 text-[#1c2646] border-l-4 border-l-[#1c2646]';
                          roomClass = 'text-[#1c2646]/70';
                        } else if (session.discipline === 'Boxing Camp') {
                          bgClass = 'bg-[#8B1E28]/10 text-[#1c2646] border-l-4 border-l-[#8B1E28]';
                          roomClass = 'text-[#8B1E28]';
                          textTitleClass = 'text-[#8B1E28]';
                        }
                        
                        cellClass = bgClass;
                        
                        content = (
                          <>
                            <span className={`font-bold text-sm ${textTitleClass}`}>{session.discipline}</span>
                            <span className={`text-[10px] sm:text-[11px] font-semibold mt-1 ${roomClass}`}>{session.roomId}</span>
                          </>
                        );
                      }
                      
                      return (
                        <td key={date} className={`border-r border-b border-gray-100 font-bold uppercase tracking-wide text-xs sm:text-sm print:text-xs ${cellClass}`}>
                          <div className="w-full h-full p-2 flex flex-col items-center justify-center min-h-[50px] sm:min-h-[80px] print:min-h-[60px]">
                            {content}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
                {/* Ligne des Salles */}
                <tr>
                  <td className="py-4 px-2 border-r border-gray-100 font-bold text-[#1c2646] bg-gray-50/50 print:p-2">
                    SALLE
                  </td>
                  {weekDates.map(date => (
                    <td 
                      key={date} 
                      className={`border-r border-gray-100 font-black uppercase tracking-widest py-3 px-2 text-xs sm:text-sm print:text-xs ${assignedRoom ? 'bg-[#1c2646] text-white' : 'bg-gray-100 text-gray-400'}`}
                    >
                      {assignedRoom || '-'}
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
