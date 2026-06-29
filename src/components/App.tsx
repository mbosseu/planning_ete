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
    <div className="space-y-12 print:space-y-0 print:m-0 print:p-0">
      <div className="print:hidden">
        <Dashboard />
      </div>
      
      <div className="space-y-6 print:space-y-0 print:m-0 print:p-0">
        <div className="print:hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h2 className="text-3xl font-oswald uppercase tracking-wider text-brand-navy">Vues du Planning</h2>
          <div className="flex flex-wrap w-full sm:w-auto bg-gray-200 p-1 rounded-lg">
            <button 
              onClick={() => setActiveTab('master')}
              className={`px-4 py-2 rounded-md text-sm font-bold uppercase transition-colors ${activeTab === 'master' ? 'bg-brand-navy text-white shadow-md' : 'text-brand-navy/60 hover:text-brand-navy'}`}
            >
              Maître
            </button>
            <button 
              onClick={() => setActiveTab('members')}
              className={`px-4 py-2 rounded-md text-sm font-bold uppercase transition-colors ${activeTab === 'members' ? 'bg-brand-navy text-white shadow-md' : 'text-brand-navy/60 hover:text-brand-navy'}`}
            >
              Adhérents
            </button>
            <button 
              onClick={() => setActiveTab('coach')}
              className={`px-4 py-2 rounded-md text-sm font-bold uppercase transition-colors ${activeTab === 'coach' ? 'bg-brand-navy text-white shadow-md' : 'text-brand-navy/60 hover:text-brand-navy'}`}
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
