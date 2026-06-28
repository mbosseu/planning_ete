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
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              activePeriodId === p.id 
                ? 'bg-indigo-600 text-white' 
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
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
              <div key={date} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                <div className="bg-gray-50 dark:bg-gray-900 px-6 py-3 border-b border-gray-100 dark:border-gray-700 font-semibold text-gray-800 dark:text-gray-100 capitalize">
                  {format(dateObj, 'EEEE d MMMM yyyy', { locale: fr })}
                </div>
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Group by room */}
                  {Array.from(new Set(dateSessions.map(s => s.roomId))).map(room => {
                    const roomSessions = dateSessions.filter(s => s.roomId === room);
                    return (
                      <div key={room} className="space-y-3">
                        <h3 className="font-medium text-indigo-600 dark:text-indigo-400">{room}</h3>
                        {roomSessions.map(session => (
                          <div 
                            key={session.id} 
                            className={`p-3 rounded-lg border text-sm ${
                              session.isPermanence 
                                ? 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-900/20 dark:border-emerald-800 dark:text-emerald-300'
                                : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-sm'
                            }`}
                          >
                            <div className="font-semibold">{session.isPermanence ? 'Permanence' : session.timeSlotId}</div>
                            <div className="text-gray-600 dark:text-gray-400 mt-1">{session.discipline}</div>
                            <div className="mt-2 flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-xs font-bold text-indigo-700 dark:text-indigo-300">
                                {session.coachId.charAt(0)}
                              </div>
                              <span className="font-medium">{session.coachId}</span>
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
