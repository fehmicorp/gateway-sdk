'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { VRRPState } from '@/lib/types';

export interface NewNodeFormData {
  nodeName: string;
  ipAddress: string;
  datacenterRegion: string;
  vrrpPriority: number;
  vrrpState: VRRPState;
  vrid: number;
  interfaceName: string;
  dataPlaneApiPort: number;
  apiSecretToken: string;
  enableHealthCheck: boolean;
  healthCheckInterval: number;
}

export default function RegisterNodePage() {
  const [formData, setFormData] = useState<NewNodeFormData>({
    nodeName: '',
    ipAddress: '',
    datacenterRegion: 'us-east-1',
    vrrpPriority: 100,
    vrrpState: 'BACKUP',
    vrid: 51,
    interfaceName: 'eth0',
    dataPlaneApiPort: 8086,
    apiSecretToken: '',
    enableHealthCheck: true,
    healthCheckInterval: 5,
  });

  const [isGeneratingToken, setIsGeneratingToken] = useState(false);

  const generateSecretToken = () => {
    setIsGeneratingToken(true);
    // Simulate token generation
    const randomToken =
      'fehmi_node_' +
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15);
    setFormData((prev) => ({ ...prev, apiSecretToken: randomToken }));
    setIsGeneratingToken(false);
  };

  const handleChange = (
    field: keyof NewNodeFormData,
    value: string | number | boolean
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      ...formData,
      status: 'adopting',
      createdAt: new Date().toISOString(),
    };

    console.log('Registering Edge Node Payload:', payload);
    alert(`Edge Node ${formData.nodeName} registration initiated successfully!`);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10 max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white font-mono flex items-center gap-2">
            <span>⚡</span> Register Edge Gateway Node
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Add a new physical or virtual proxy node into the keepalived VRRP cluster and sync Data Plane APIs.
          </p>
        </div>
        <Link
          href="/cluster"
          className="px-3 py-1.5 text-xs font-mono text-slate-400 hover:text-slate-200 border border-slate-800 rounded-lg bg-slate-900 transition-colors"
        >
          ← Back to Cluster
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Step 1: Node Identity & Infrastructure Location */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
          <h2 className="text-sm font-semibold text-slate-200 uppercase tracking-wider font-mono">
            1. Node Identity & Location
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-2 font-mono">
                Hostname / Node Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. fcupepg-edge-03.east"
                value={formData.nodeName}
                onChange={(e) => handleChange('nodeName', e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-2 font-mono">
                Management IP Address *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. 192.168.10.13"
                value={formData.ipAddress}
                onChange={(e) => handleChange('ipAddress', e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-2 font-mono">
                Datacenter / Region *
              </label>
              <select
                value={formData.datacenterRegion}
                onChange={(e) => handleChange('datacenterRegion', e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500 font-mono"
              >
                <option value="us-east-1">US East (N. Virginia)</option>
                <option value="us-west-2">US West (Oregon)</option>
                <option value="eu-west-1">EU West (Ireland)</option>
                <option value="ap-south-1">Asia Pacific (Mumbai)</option>
                <option value="on-premise">On-Premise Private Datacenter</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-2 font-mono">
                Network Interface Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. eth0 or enp1s0"
                value={formData.interfaceName}
                onChange={(e) => handleChange('interfaceName', e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>
          </div>
        </div>

        {/* Step 2: VRRP Failover & Priority Configuration */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
          <h2 className="text-sm font-semibold text-slate-200 uppercase tracking-wider font-mono">
            2. VRRP High Availability Config
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-2 font-mono">
                Initial VRRP State *
              </label>
              <select
                value={formData.vrrpState}
                onChange={(e) => handleChange('vrrpState', e.target.value as VRRPState)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500 font-mono"
              >
                <option value="BACKUP">BACKUP (Recommended)</option>
                <option value="MASTER">MASTER</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-2 font-mono">
                Priority (1-254) *
              </label>
              <input
                type="number"
                min={1}
                max={254}
                required
                value={formData.vrrpPriority}
                onChange={(e) => handleChange('vrrpPriority', parseInt(e.target.value) || 100)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500 font-mono"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">
                Higher values election take precedence (e.g. 110 Master, 100 Backup).
              </span>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-2 font-mono">
                Virtual Router ID (VRID) *
              </label>
              <input
                type="number"
                min={1}
                max={255}
                required
                value={formData.vrid}
                onChange={(e) => handleChange('vrid', parseInt(e.target.value) || 51)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500 font-mono"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">
                Must match other nodes sharing the same Virtual IP pool.
              </span>
            </div>
          </div>
        </div>

        {/* Step 3: Data Plane API Authentication & Health Probes */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
          <h2 className="text-sm font-semibold text-slate-200 uppercase tracking-wider font-mono">
            3. Data Plane Sync & Auth
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-2 font-mono">
                Data Plane API Port *
              </label>
              <input
                type="number"
                required
                value={formData.dataPlaneApiPort}
                onChange={(e) => handleChange('dataPlaneApiPort', parseInt(e.target.value) || 8086)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-2 font-mono">
                Secret Bearer Token *
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  required
                  placeholder="Click generate to create token..."
                  value={formData.apiSecretToken}
                  onChange={(e) => handleChange('apiSecretToken', e.target.value)}
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2 text-xs text-slate-100 font-mono focus:outline-none focus:border-blue-500"
                />
                <button
                  type="button"
                  onClick={generateSecretToken}
                  disabled={isGeneratingToken}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 font-mono rounded-lg transition-colors"
                >
                  Generate
                </button>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
            <div>
              <div className="text-xs font-medium text-slate-300 font-mono">Enable Active Cluster Health Probes</div>
              <div className="text-[11px] text-slate-500">
                Control plane will issue heartbeat ping requests to keepalived every {formData.healthCheckInterval}s.
              </div>
            </div>
            <input
              type="checkbox"
              checked={formData.enableHealthCheck}
              onChange={(e) => handleChange('enableHealthCheck', e.target.checked)}
              className="h-4 w-4 rounded border-slate-800 bg-slate-950 text-blue-600 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-2">
          <Link
            href="/cluster"
            className="px-4 py-2 rounded-lg text-sm text-slate-400 hover:bg-slate-900 border border-slate-800 font-medium transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            className="px-5 py-2 rounded-lg text-sm bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-colors shadow-lg shadow-blue-600/20 font-mono"
          >
            Register & Adopt Node
          </button>
        </div>
      </form>
    </div>
  );
}