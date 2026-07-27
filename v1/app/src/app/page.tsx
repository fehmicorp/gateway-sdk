'use client';

import { useState } from 'react';
import Link from 'next/link';
import { GatewayNode } from '@/lib/types';

export default function Home() {
  const [isSyncing, setIsSyncing] = useState(false);

  // Cluster & Virtual IP State Data
  const clusterState = {
    vip: '192.168.1.100',
    vrrpName: 'fehmi_ha-vrrp',
    nodes: [
      {
        id: 'gw-1',
        name: 'FC-UPE-GW01',
        ip: '192.168.1.10',
        vrrpState: 'MASTER',
        vrrpPriority: 101,
        activeConnections: 1420,
        cpuUsage: 14.2,
        memoryUsage: 32.1,
      },
      {
        id: 'gw-2',
        name: 'FC-UPE-GW02',
        ip: '192.168.1.11',
        vrrpState: 'BACKUP',
        vrrpPriority: 100,
        activeConnections: 0,
        cpuUsage: 3.8,
        memoryUsage: 29.5,
      },
    ] as GatewayNode[],
  };

  const handleForceSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
    }, 1200);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 font-sans">
      {/* Active Virtual IP Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between p-6 bg-slate-900 border border-slate-800 rounded-2xl shadow-lg gap-4">
        <div>
          <span className="text-xs uppercase tracking-wider text-slate-400 font-bold font-mono">
            Active Virtual IP ({clusterState.vrrpName})
          </span>
          <h2 className="text-3xl font-mono font-extrabold text-blue-400 mt-1">
            {clusterState.vip}
          </h2>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleForceSync}
            disabled={isSyncing}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-2"
          >
            <span
              className={`h-2 w-2 rounded-full ${
                isSyncing ? 'bg-amber-400 animate-ping' : 'bg-emerald-400'
              }`}
            />
            {isSyncing ? 'Syncing...' : 'Force Sync'}
          </button>
          <Link
            href="/services/new"
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs transition shadow-md shadow-blue-900/20"
          >
            + New Service
          </Link>
        </div>
      </div>

      {/* Gateway Cluster Nodes */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 font-mono">
          Gateway Cluster Nodes
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {clusterState.nodes.map((node) => (
            <div
              key={node.id}
              className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-4 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-base text-white">{node.name}</h4>
                  <p className="text-xs font-mono text-slate-400">{node.ip}</p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-mono font-bold border ${
                    node.vrrpState === 'MASTER'
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                  }`}
                >
                  ● {node.vrrpState}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800 text-center">
                <div className="bg-slate-950 p-2 rounded-xl border border-slate-800/50">
                  <span className="text-[10px] text-slate-500 uppercase block font-mono">Conns</span>
                  <span className="font-mono font-bold text-sm text-slate-200">
                    {node.activeConnections}
                  </span>
                </div>
                <div className="bg-slate-950 p-2 rounded-xl border border-slate-800/50">
                  <span className="text-[10px] text-slate-500 uppercase block font-mono">CPU</span>
                  <span className="font-mono font-bold text-sm text-slate-200">
                    {node.cpuUsage}%
                  </span>
                </div>
                <div className="bg-slate-950 p-2 rounded-xl border border-slate-800/50">
                  <span className="text-[10px] text-slate-500 uppercase block font-mono">RAM</span>
                  <span className="font-mono font-bold text-sm text-slate-200">
                    {node.memoryUsage}%
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}