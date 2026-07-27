'use client';

import { useState } from 'react';

// Import sub-components from your local directory
import CreateServiceForm from './service';
import CreateBundleServiceForm from './bundle';
import CreateCertificateForm from './certificate';
import CreateGatewayForm from './gateway';

type TabType = 'service' | 'bundle' | 'certificate' | 'gateway';

export default function NewServicePage() {
  const [activeTab, setActiveTab] = useState<TabType>('service');

  const tabs: { id: TabType; label: string; color: string }[] = [
    { id: 'service', label: 'Standalone Service', color: 'border-blue-500 text-blue-400' },
    { id: 'bundle', label: 'Service Bundle', color: 'border-indigo-500 text-indigo-400' },
    { id: 'certificate', label: 'SSL Certificate', color: 'border-cyan-500 text-cyan-400' },
    { id: 'gateway', label: 'API Gateway', color: 'border-emerald-500 text-emerald-400' },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8 font-sans">
      {/* Header Section */}
      <div className="border-b border-slate-800 pb-5">
        <h1 className="text-2xl font-bold tracking-tight text-white font-mono">
          Services & Gateway Management
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Configure microservices, set up high-availability service bundles, issue SSL certificates, and expose routes via reverse proxy gateways.
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`p-4 rounded-xl border text-left transition-all duration-150 relative overflow-hidden cursor-pointer ${
                isActive
                  ? `bg-slate-900 border-slate-700 shadow-lg ${tab.color}`
                  : 'bg-slate-900/40 border-slate-800/80 text-slate-400 hover:bg-slate-900/80 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center justify-start">
                <span className={`h-2 w-2 rounded-full ${isActive && (`bg-current animate-pulse`)} shrink-0 ml-2`} />
                <span className="text-sm font-semibold ml-2">{tab.label}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Tab Content Display */}
      <main className="transition-all duration-200">
        {activeTab === 'service' && <CreateServiceForm />}
        {activeTab === 'bundle' && <CreateBundleServiceForm />}
        {activeTab === 'certificate' && <CreateCertificateForm />}
        {activeTab === 'gateway' && <CreateGatewayForm />}
      </main>
    </div>
  );
}