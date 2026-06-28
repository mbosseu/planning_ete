import React, { useState, useEffect } from 'react';
import { Dashboard } from './Dashboard';
import { MasterSchedule } from './MasterSchedule';
import { MembersSchedule } from './MembersSchedule';
import { CoachSchedule } from './CoachSchedule';
import { generateAndSave, sessionsStore } from '../lib/store';

export function App() {
  const [activeTab, setActiveTab] = useState<'master' | 'members' | 'coach'>('master');
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    // Generate initial schedule if empty
    if (sessionsStore.get().length === 0) {
      generateAndSave();
    }
  }, []);

  if (!isClient) return null;

  return (
    <div className="space-y-12">
      <Dashboard />
      
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h2 className="text-2xl font-bold">Vues du Planning</h2>
          <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
            <button 
              onClick={() => setActiveTab('master')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'master' ? 'bg-white dark:bg-gray-700 shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}
            >
              Maître
            </button>
            <button 
              onClick={() => setActiveTab('members')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'members' ? 'bg-white dark:bg-gray-700 shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}
            >
              Adhérents
            </button>
            <button 
              onClick={() => setActiveTab('coach')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'coach' ? 'bg-white dark:bg-gray-700 shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}
            >
              Coachs
            </button>
          </div>
        </div>

        {activeTab === 'master' && <MasterSchedule />}
        {activeTab === 'members' && <MembersSchedule />}
        {activeTab === 'coach' && <CoachSchedule />}
      </div>
    </div>
  );
}
