import React, { useState } from 'react';
import { useStore } from '@nanostores/react';
import { sessionsStore, periodsStore, updateSession } from '../lib/store';
import { DndContext, closestCenter } from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { TIME_SLOTS } from '../lib/data';

export function MasterSchedule() {
  const allSessions = useStore(sessionsStore);
  const sessions = allSessions.filter(session => TIME_SLOTS.some(slot => slot.id === session.timeSlotId));
  const periods = useStore(periodsStore);
  
  const [activePeriodId, setActivePeriodId] = useState(periods[0]?.id);
  
  const activePeriod = periods.find(p => p.id === activePeriodId);
  
  // Group sessions for the active period by date, then by room, then by slot
  const periodSessions = sessions.filter(s => s.periodId === activePeriodId);
  const dates = Array.from(new Set(periodSessions.map(s => s.date))).sort();

  const handleDragEnd = (event: DragEndEvent) => {
    // Basic DnD logic to swap coaches or disciplines could go here.
    // For now, let's keep it simple.
  };

  if (!activePeriod?.hasTraining) {
    return (
      <div className="p-8 text-center text-gray-500 bg-gray-50 dark:bg-gray-800 rounded-xl">
        Aucun entraînement prévu pour cette période. (Fermeture)
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex gap-2 overflow-x-auto pb-2">
        {periods.map(p => (
          <button
            key={p.id}
            onClick={() => setActivePeriodId(p.id)}
            className={`px-6 py-2 rounded-lg text-sm font-bold uppercase tracking-wider whitespace-nowrap transition-colors border-2 ${
              activePeriodId === p.id 
                ? 'bg-brand-navy border-brand-navy text-brand-gold shadow-md' 
                : 'bg-white text-brand-navy/60 border-gray-200 hover:border-brand-navy/50 hover:text-brand-navy'
            }`}
          >
            {p.name}
          </button>
        ))}
      </div>

      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <div className="flex flex-col gap-10">
          {dates.map(date => {
            const dateSessions = periodSessions.filter(s => s.date === date);
            const dateObj = parseISO(date);
            
            return (
              <div key={date} className="bg-white rounded-[1.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.12)] overflow-hidden border border-gray-100">
                <div className="bg-[#1c2646] px-8 py-6 border-b-[6px] border-[#c59e5e] flex items-center justify-between">
                  <h2 className="font-sans font-black text-3xl uppercase tracking-widest text-white drop-shadow-md">
                    {format(dateObj, 'EEEE d MMMM yyyy', { locale: fr })}
                  </h2>
                  <img src="/logo.png" alt="Boxing Center" className="h-12 object-contain" />
                </div>
                <div className="p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 bg-gray-50/30">
                  {/* Group by room */}
                  {Array.from(new Set(dateSessions.map(s => s.roomId))).map(room => {
                    const roomSessions = dateSessions.filter(s => s.roomId === room);
                    return (
                      <div key={room} className="space-y-4">
                        <h3 className="font-sans font-bold text-lg uppercase tracking-wider text-[#1c2646] border-b-2 border-gray-100 pb-2">
                          <span className="text-[#c59e5e] mr-2">/</span> {room}
                        </h3>
                        {roomSessions.map(session => {
                          const isPerm = session.isPermanence || session.discipline === 'ACCES LIBRE';
                          let bgClass = 'bg-white';
                          let borderClass = 'border-[#1c2646]';
                          let badgeClass = 'bg-[#1c2646]';
                          let textClass = 'text-[#1c2646]';
                          
                          if (session.discipline === 'Pause') {
                            bgClass = 'bg-gray-100';
                            borderClass = 'border-gray-300';
                            badgeClass = 'bg-gray-400';
                            textClass = 'text-gray-500';
                          } else if (isPerm || session.discipline === 'Permanence') {
                            bgClass = 'bg-[#c59e5e]/15';
                            borderClass = 'border-[#c59e5e]';
                            badgeClass = 'bg-[#c59e5e]';
                            textClass = 'text-[#1c2646]';
                          } else if (session.discipline === 'Boxe anglaise') {
                            bgClass = 'bg-[#1c2646]/10';
                            borderClass = 'border-[#1c2646]';
                            badgeClass = 'bg-[#1c2646]';
                            textClass = 'text-[#1c2646]';
                          } else if (session.discipline === 'Boxing Camp') {
                            bgClass = 'bg-[#8B1E28]/10'; // Ruby Red
                            borderClass = 'border-[#8B1E28]';
                            badgeClass = 'bg-[#8B1E28]';
                            textClass = 'text-[#1c2646]';
                          }

                          return (
                            <div 
                              key={session.id} 
                              className={`p-4 rounded-xl border-l-[6px] shadow-sm transition-transform hover:-translate-y-1 ${bgClass} ${borderClass} ${textClass}`}
                            >
                              <div className="font-black text-lg tracking-wide">
                                {isPerm ? 'PERMANENCE' : session.timeSlotId}
                              </div>
                              <div className={`uppercase font-bold mt-1 text-sm ${session.discipline === 'Boxing Camp' ? 'text-[#8B1E28]' : 'opacity-80'}`}>
                                {session.discipline}
                              </div>
                              <div className={`mt-4 flex items-center gap-3 pt-3 border-t ${session.discipline === 'Boxing Camp' ? 'border-[#8B1E28]/20' : 'border-gray-200'}`}>
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold text-white shadow-md ${badgeClass}`}>
                                  {session.coachId ? session.coachId.charAt(0) : '?'}
                                </div>
                                <span className="font-bold text-sm uppercase">{session.coachId || 'Aucun'}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </DndContext>
    </div>
  );
}
