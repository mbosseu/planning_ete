import React, { useState } from 'react';
import { useStore } from '@nanostores/react';
import { sessionsStore, periodsStore } from '../lib/store';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { ROOMS, TIME_SLOTS } from '../lib/data';
import type { Room } from '../lib/types';
import { exportToPDF } from '../lib/exportPdf';
import type { Room } from '../lib/types';

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

  const getCoachColorClass = (coachName: string) => {
    switch(coachName) {
      case 'Dadi': return 'bg-amber-500 text-black border-amber-600';
      case 'Hicham': return 'bg-sky-400 text-black border-sky-500';
      case 'Tawee': return 'bg-red-500 text-white border-red-600';
      case 'Victor G': return 'bg-emerald-500 text-black border-emerald-600';
      case 'Mehdi': return 'bg-indigo-500 text-white border-indigo-600';
      case 'Walid': return 'bg-pink-500 text-white border-pink-600';
      case 'Faye': return 'bg-purple-500 text-white border-purple-600';
      case 'Renaud': return 'bg-orange-500 text-white border-orange-600';
      case 'Valentin Gutt': return 'bg-slate-500 text-white border-slate-600';
      default: return 'bg-gray-300 text-gray-800 border-gray-400';
    }
  };

  const getCoachDotColor = (coachName: string) => {
    switch(coachName) {
      case 'Dadi': return 'bg-amber-500';
      case 'Hicham': return 'bg-sky-400';
      case 'Tawee': return 'bg-red-500';
      case 'Victor G': return 'bg-emerald-500';
      case 'Mehdi': return 'bg-indigo-500';
      case 'Walid': return 'bg-pink-500';
      case 'Faye': return 'bg-purple-500';
      case 'Renaud': return 'bg-orange-500';
      case 'Valentin Gutt': return 'bg-slate-500';
      default: return 'bg-gray-400';
    }
  };

  const renderTable = (room: string) => {
    const roomSessions = sessions.filter(s => s.periodId === activePeriodId && s.roomId === room && !s.isPermanence);
    
    // Determine coaches present in this room's schedule to show in legend
    const coachesInRoom = Array.from(new Set(roomSessions.filter(s => s.coachId).map(s => s.coachId)));

    const weeks = [];
    for (let i = 0; i < dates.length; i += 5) {
      weeks.push(dates.slice(i, i + 5));
    }

    return (
      <div className="space-y-8 print:space-y-6">
        {weeks.map((weekDates, weekIdx) => (
          <div key={weekIdx} className="overflow-x-auto print:overflow-visible">
            
            <div className="text-center mb-6">
              <h2 className="text-brand-gold font-oswald uppercase tracking-[0.2em] text-sm mb-2">Planning des cours</h2>
              <h1 className="text-5xl font-oswald font-bold uppercase text-white tracking-wider">
                {room}
              </h1>
            </div>

            <table className="w-full text-center border-separate border-spacing-y-2 border-spacing-x-2 text-sm text-gray-900" style={{ minWidth: '800px' }}>
              <thead>
                <tr>
                  <th className="w-24 bg-dark-surface-time text-white/50 text-xs font-bold uppercase tracking-wider p-2 rounded-l-md">
                    Horaire
                  </th>
                  {weekDates.map(date => (
                    <th key={date} className="py-3 px-1 font-oswald font-bold tracking-widest uppercase bg-dark-surface-header text-white text-sm rounded-md shadow-sm">
                      {format(parseISO(date), 'EEEE', { locale: fr })}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {TIME_SLOTS.map(slot => (
                  <tr key={slot.id}>
                    <td className="py-2 px-1 bg-dark-surface-time text-white/70 font-oswald font-bold text-xs rounded-l-md border-r-4 border-dark-bg">
                      {slot.label.replace('h00', 'h').replace(' - ', '-')}
                    </td>
                    {weekDates.map(date => {
                      const session = roomSessions.find(s => s.date === date && s.timeSlotId === slot.id);
                      
                      const isFreeAccess = !session || session.discipline === 'ACCES LIBRE' || session.discipline === 'Pause';
                      
                      const cellClass = isFreeAccess 
                        ? 'bg-dark-surface text-white/30 border-b border-white/5'
                        : `${getCoachColorClass(session.coachId)} border-b-4 shadow-md`;
                      
                      return (
                        <td key={date} className={`rounded-md p-1 font-bold uppercase tracking-wide text-xs sm:text-sm print:text-xs ${cellClass}`}>
                          <div className="w-full h-full p-2 flex flex-col items-center justify-center min-h-[60px] sm:min-h-[80px]">
                            {isFreeAccess ? (
                              <span className="font-sans font-medium text-xs tracking-wider">ACCÈS LIBRE</span>
                            ) : (
                              <>
                                <span className="font-oswald tracking-wide leading-tight">{session.discipline}</span>
                                {session.coachId && (
                                  <span className="text-[10px] sm:text-xs opacity-75 font-sans font-medium mt-1 tracking-widest">{session.coachId}</span>
                                )}
                              </>
                            )}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Légende des coachs */}
            {coachesInRoom.length > 0 && (
              <div className="mt-6 flex flex-wrap items-center justify-center gap-6 print:hidden">
                {coachesInRoom.map(coach => (
                  <div key={coach} className="flex items-center gap-2 bg-dark-surface px-4 py-2 rounded-full border border-white/10 shadow-sm">
                    <span className={`w-3 h-3 rounded-full ${getCoachDotColor(coach)}`}></span>
                    <span className="text-white font-bold text-xs uppercase tracking-wider">{coach}</span>
                  </div>
                ))}
              </div>
            )}

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
                  : 'bg-dark-surface text-white/60 border-white/10 hover:border-white/30 hover:text-white'
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
                  : 'bg-dark-surface text-white/60 border-white/10 hover:border-white/30 hover:text-white'
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
