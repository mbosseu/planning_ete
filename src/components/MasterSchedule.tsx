import React, { useState } from 'react';
import { useStore } from '@nanostores/react';
import { sessionsStore, periodsStore, updateSession } from '../lib/store';
import { DndContext, closestCenter } from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';

export function MasterSchedule() {
  const sessions = useStore(sessionsStore);
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
                : 'bg-dark-surface text-white/60 border-white/10 hover:border-white/30 hover:text-white'
            }`}
          >
            {p.name}
          </button>
        ))}
      </div>

      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <div className="flex flex-col gap-8">
          {dates.map(date => {
            const dateSessions = periodSessions.filter(s => s.date === date);
            const dateObj = parseISO(date);
            
            return (
              <div key={date} className="bg-dark-surface rounded-xl shadow-md border border-white/10 overflow-hidden">
                <div className="bg-dark-surface-header px-6 py-4 border-b border-white/10">
                  <h2 className="font-oswald text-xl uppercase tracking-wider text-white">
                    {format(dateObj, 'EEEE d MMMM yyyy', { locale: fr })}
                  </h2>
                </div>
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Group by room */}
                  {Array.from(new Set(dateSessions.map(s => s.roomId))).map(room => {
                    const roomSessions = dateSessions.filter(s => s.roomId === room);
                    return (
                      <div key={room} className="space-y-4">
                        <h3 className="font-oswald text-lg uppercase tracking-wide text-brand-gold border-b border-white/10 pb-2">{room}</h3>
                        {roomSessions.map(session => (
                          <div 
                            key={session.id} 
                            className={`p-4 rounded-lg border-l-4 text-sm shadow-sm ${
                              session.isPermanence || session.discipline === 'ACCES LIBRE' || session.discipline === 'Pause'
                                ? 'bg-brand-gold/10 border-brand-gold text-brand-gold'
                                : 'bg-dark-surface-time border-brand-navy text-white'
                            }`}
                          >
                            <div className="font-bold text-lg font-oswald tracking-wide text-white/90">
                              {session.isPermanence ? 'PERMANENCE' : session.timeSlotId}
                            </div>
                            <div className="text-white/60 uppercase font-semibold mt-1">
                              {session.discipline}
                            </div>
                            <div className="mt-3 flex items-center gap-3 border-t border-white/10 pt-3">
                              <div className="w-8 h-8 rounded-full bg-brand-gold flex items-center justify-center text-sm font-bold text-dark-surface shadow-sm">
                                {session.coachId ? session.coachId.charAt(0) : '?'}
                              </div>
                              <span className="font-bold uppercase text-white/90">{session.coachId || 'Aucun'}</span>
                            </div>
                          </div>
                        ))}
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
