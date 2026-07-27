'use client';

import React, { useState } from 'react';
import { GatewayNode, EdgeNodeStatus, VRRPState } from '@/lib/types';

// Extended UI Type for Floating Virtual IP Pool
export interface VirtualIpAssignment {
  vrid: number;
  vipAddress: string;
  interfaceName: string;
  assignedMasterId: string;
  assignedMasterName: string;
  status: 'active' | 'failover' | 'degraded';
}

// Mock Gateway / VRRP Nodes
const INITIAL_NODES: GatewayNode[] = [
  {
    id: 'node-us-east-1',
    name: 'fcupepg-edge-01.east',
    ip: '192.168.10.11',
    vrrpState: 'MASTER',
    vrrpPriority: 110,
    dataPlaneApiStatus: 'online',
    activeConnections: 14250,
    cpuUsage: 34,
    memoryUsage: 52
  },
  {
    id: 'node-us-east-2',
    name: 'fcupepg-edge-02.east',
    ip: '192.168.10.12',
    vrrpState: 'BACKUP',
    vrrpPriority: 100,
    dataPlaneApiStatus: 'online',
    activeConnections: 120,
    cpuUsage: 12,
    memoryUsage: 38
  },
  {
    id: 'node-eu-west-1',
    name: 'fcupepg-edge-01.eu',
    ip: '192.168.20.21',
    vrrpState: 'MASTER',
    vrrpPriority: 110,
    dataPlaneApiStatus: 'online',
    activeConnections: 9800,
    cpuUsage: 28,
    memoryUsage: 45
  },
  {
    id: 'node-eu-west-2',
    name: 'fcupepg-edge-02.eu',
    ip: '192.168.20.22',
    vrrpState: 'FAULT',
    vrrpPriority: 90,
    dataPlaneApiStatus: 'offline',
    activeConnections: 0,
    cpuUsage: 0,
    memoryUsage: 0
  }
];

// Mock Virtual IP Allocations
const MOCK_VIPS: VirtualIpAssignment[] = [
  {
    vrid: 51,
    vipAddress: '192.168.10.100/24',
    interfaceName: 'eth0:vrrp51',
    assignedMasterId: 'node-us-east-1',
    assignedMasterName: 'fcupepg-edge-01.east',
    status: 'active'
  },
  {
    vrid: 52,
    vipAddress: '192.168.20.100/24',
    interfaceName: 'eth0:vrrp52',
    assignedMasterId: 'node-eu-west-1',
    assignedMasterName: 'fcupepg-edge-01.eu',
    status: 'active'
  }
];

export default function ClusterPage() {
  const [nodes, setNodes] = useState<GatewayNode[]>(INITIAL_NODES);
  const [virtualIps] = useState<VirtualIpAssignment[]>(MOCK_VIPS);
  const [searchQuery, setSearchQuery] = useState('');
  const [vrrpFilter, setVrrpFilter] = useState<string>('ALL');

  // Trigger manual failover simulation
  const handleSimulateFailover = (nodeId: string) => {
    setNodes((prev) =>
      prev.map((node) => {
        if (node.id === nodeId) {
          const newState: VRRPState = node.vrrpState === 'MASTER' ? 'BACKUP' : 'MASTER';
          return { ...node, vrrpState: newState };
        }
        return node;
      })
    );
  };

  const filteredNodes = nodes.filter((node) => {
    const matchesSearch =
      node.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      node.ip.includes(searchQuery);
    const matchesVrrp = vrrpFilter === 'ALL' || node.vrrpState === vrrpFilter;
    return matchesSearch && matchesVrrp;
  });

  // Calculate cluster summary metrics
  const totalConnections = nodes.reduce((acc, curr) => acc + curr.activeConnections, 0);
  const onlineNodesCount = nodes.filter((n) => n.dataPlaneApiStatus === 'online').length;
  const masterCount = nodes.filter((n) => n.vrrpState === 'MASTER').length;

  const renderVrrpBadge = (state: VRRPState) => {
    const styles: Record<VRRPState, string> = {
      MASTER: 'bg-emerald-950/70 text-emerald-400 border-emerald-800/80',
      BACKUP: 'bg-blue-950/70 text-blue-400 border-blue-800/80',
      FAULT: 'bg-rose-950/70 text-rose-400 border-rose-800/80'
    };

    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono font-bold rounded-md border ${
          styles[state]
        }`}
      >
        <span
          className={`h-1.5 w-1.5 rounded-full ${
            state === 'MASTER'
              ? 'bg-emerald-400 animate-pulse'
              : state === 'BACKUP'
              ? 'bg-blue-400'
              : 'bg-rose-400'
          }`}
        />
        {state}
      </span>
    );
  };

  const renderStatusBadge = (status: EdgeNodeStatus) => {
    return (
      <span
        className={`px-2 py-0.5 text-[10px] font-mono font-semibold uppercase rounded border ${
          status === 'online' || status === 'up'
            ? 'bg-emerald-950/50 text-emerald-400 border-emerald-800/50'
            : status === 'adopting'
            ? 'bg-amber-950/50 text-amber-400 border-amber-800/50'
            : 'bg-rose-950/50 text-rose-400 border-rose-800/50'
        }`}
      >
        {status}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white font-mono flex items-center gap-2">
            <span>⚡</span> VRRP & Edge Cluster Control
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Monitor registered gateway proxy nodes, floating VRRP Virtual IPs, failover priorities, and traffic throughput.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 text-xs font-mono rounded-lg transition-colors"
          >
            + Register Edge Node
          </button>
        </div>
      </div>

      {/* Cluster Summary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-1">
          <div className="text-xs text-slate-400 font-mono">Active Cluster Nodes</div>
          <div className="text-2xl font-bold font-mono text-white">
            {onlineNodesCount} <span className="text-xs text-slate-500 font-normal">/ {nodes.length} Online</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-1">
          <div className="text-xs text-slate-400 font-mono">Master VRRP Instances</div>
          <div className="text-2xl font-bold font-mono text-emerald-400">{masterCount} Active</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-1">
          <div className="text-xs text-slate-400 font-mono">Global Active Connections</div>
          <div className="text-2xl font-bold font-mono text-blue-400">
            {totalConnections.toLocaleString()}
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-1">
          <div className="text-xs text-slate-400 font-mono">Virtual IPs (VIPs)</div>
          <div className="text-2xl font-bold font-mono text-indigo-400">
            {virtualIps.length} Managed
          </div>
        </div>
      </div>

      {/* Floating VRRP Virtual IP Pool Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
        <h2 className="text-sm font-semibold text-slate-200 uppercase tracking-wider font-mono flex items-center justify-between">
          <span>Active VRRP Virtual IP (VIP) Pools</span>
          <span className="text-xs text-slate-500 lowercase font-normal">keepalived / VRRP daemon state</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {virtualIps.map((vip) => (
            <div
              key={vip.vrid}
              className="bg-slate-950 border border-slate-800/80 rounded-lg p-4 flex items-center justify-between font-mono text-xs"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-blue-400 font-bold">{vip.vipAddress}</span>
                  <span className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-300">
                    VRID: {vip.vrid}
                  </span>
                </div>
                <div className="text-slate-400 text-[11px]">Interface: {vip.interfaceName}</div>
                <div className="text-slate-500 text-[11px]">
                  Assigned Master: <span className="text-slate-200">{vip.assignedMasterName}</span>
                </div>
              </div>
              <div className="text-right">
                <span className="px-2 py-1 bg-emerald-950/60 text-emerald-400 border border-emerald-800/60 rounded text-[10px] font-bold">
                  {vip.status.toUpperCase()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Node Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search edge nodes by hostname or IP address..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3.5 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono"
          />
        </div>
        <div className="w-full sm:w-48">
          <select
            value={vrrpFilter}
            onChange={(e) => setVrrpFilter(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500 font-mono"
          >
            <option value="ALL">All VRRP States</option>
            <option value="MASTER">MASTER</option>
            <option value="BACKUP">BACKUP</option>
            <option value="FAULT">FAULT</option>
          </select>
        </div>
      </div>

      {/* Nodes Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/50 text-slate-400 font-mono text-xs uppercase tracking-wider">
                <th className="py-3.5 px-4 font-semibold">Node Hostname</th>
                <th className="py-3.5 px-4 font-semibold">IP Address</th>
                <th className="py-3.5 px-4 font-semibold">VRRP State</th>
                <th className="py-3.5 px-4 font-semibold">Priority</th>
                <th className="py-3.5 px-4 font-semibold">Data Plane API</th>
                <th className="py-3.5 px-4 font-semibold">Active Conn</th>
                <th className="py-3.5 px-4 font-semibold">CPU / Mem</th>
                <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 font-mono text-xs">
              {filteredNodes.length > 0 ? (
                filteredNodes.map((node) => (
                  <tr key={node.id} className="hover:bg-slate-800/40 transition-colors">
                    {/* Hostname */}
                    <td className="py-4 px-4 font-semibold text-slate-100">
                      {node.name}
                    </td>

                    {/* IP */}
                    <td className="py-4 px-4 text-slate-400">
                      {node.ip}
                    </td>

                    {/* VRRP State */}
                    <td className="py-4 px-4">
                      {renderVrrpBadge(node.vrrpState)}
                    </td>

                    {/* Priority */}
                    <td className="py-4 px-4 text-slate-300 font-bold">
                      {node.vrrpPriority}
                    </td>

                    {/* Data Plane Status */}
                    <td className="py-4 px-4">
                      {renderStatusBadge(node.dataPlaneApiStatus)}
                    </td>

                    {/* Active Connections */}
                    <td className="py-4 px-4 text-slate-300">
                      {node.activeConnections.toLocaleString()}
                    </td>

                    {/* CPU / Mem Bars */}
                    <td className="py-4 px-4 space-y-1 w-32">
                      <div className="flex justify-between text-[10px] text-slate-400">
                        <span>CPU {node.cpuUsage}%</span>
                        <span>RAM {node.memoryUsage}%</span>
                      </div>
                      <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden flex">
                        <div
                          style={{ width: `${node.cpuUsage}%` }}
                          className={`h-full ${
                            node.cpuUsage > 80 ? 'bg-rose-500' : 'bg-blue-500'
                          }`}
                        />
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-4 text-right">
                      <button
                        onClick={() => handleSimulateFailover(node.id)}
                        disabled={node.vrrpState === 'FAULT'}
                        className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        {node.vrrpState === 'MASTER' ? 'Demote to Backup' : 'Promote to Master'}
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500 text-xs">
                    No edge nodes found matching current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}