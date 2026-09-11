import { useState } from 'react';
import { AppProvider } from '@/lib/AppContext';
import TabBar from '@/components/TabBar';
import DashboardTab from '@/components/tabs/DashboardTab';
import RecordTab from '@/components/tabs/RecordTab';
import WageTab from '@/components/tabs/WageTab';
import PlanTab from '@/components/tabs/PlanTab';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <AppProvider>
      <div className="min-h-screen bg-[#F5F0E8] pb-[calc(4rem+env(safe-area-inset-bottom))]">
        <div className="max-w-2xl mx-auto px-4 pt-4 sm:pt-6">
          <div key={activeTab} className="animate-fade-in">
            {activeTab === 'dashboard' && <DashboardTab />}
            {activeTab === 'record' && <RecordTab />}
            {activeTab === 'wage' && <WageTab />}
            {activeTab === 'plan' && <PlanTab />}
          </div>
        </div>
        <TabBar activeTab={activeTab} onTabChange={setActiveTab} />
      </div>
    </AppProvider>
  );
}
