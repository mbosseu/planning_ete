import React from 'react';
import { useStore } from '@nanostores/react';
import { sessionsStore, periodsStore, generateAndSave } from '../lib/store';
import { Button } from './ui/button';
import { COACHES, ROOMS } from '../lib/data';
import type { CoachName } from '../lib/types';

export function Dashboard() {
  const sessions = useStore(sessionsStore);
  const periods = useStore(periodsStore);

  const totalClasses = sessions.filter(s => !s.isPermanence).length;
  const totalPermanences = sessions.filter(s => s.isPermanence).length;

  const coachStats = COACHES.map(coach => {
    const coachSessions = sessions.filter(s => s.coachId === coach);
    const classes = coachSessions.filter(s => !s.isPermanence).length; // 1h per class
    const perms = coachSessions.filter(s => s.isPermanence).length * 4; // Assuming 4h per block for simplicity
    return { name: coach, classes, perms, total: classes + perms };
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Tableau de bord</h1>
        <Button onClick={() => generateAndSave()}>
          Générer automatiquement le planning
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="text-sm text-gray-500">Salles Actives</div>
          <div className="text-3xl font-semibold mt-1">{ROOMS.length}</div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="text-sm text-gray-500">Coachs</div>
          <div className="text-3xl font-semibold mt-1">{COACHES.length}</div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="text-sm text-gray-500">Total Cours</div>
          <div className="text-3xl font-semibold mt-1">{totalClasses}</div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="text-sm text-gray-500">Périodes config.</div>
          <div className="text-3xl font-semibold mt-1">{periods.length}</div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Heures par Coach (Approximation)</h2>
        <div className="space-y-4">
          {coachStats.map(stat => (
            <div key={stat.name} className="flex items-center justify-between">
              <span className="w-32 font-medium">{stat.name}</span>
              <div className="flex-1 mx-4 bg-gray-100 dark:bg-gray-700 rounded-full h-3 overflow-hidden flex">
                <div className="bg-indigo-500 h-full" style={{ width: `${(stat.classes / 35) * 100}%` }} title="Cours" />
                <div className="bg-emerald-500 h-full" style={{ width: `${(stat.perms / 35) * 100}%` }} title="Permanences" />
              </div>
              <span className="w-16 text-right text-sm text-gray-500">{stat.total}h / 35h</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
