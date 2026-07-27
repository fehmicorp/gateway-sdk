'use client';

import { useState } from 'react';
import Link from 'next/link';

interface GatewayRoute {
  id: string;
  domain: string;
  incomingPort: number;
  gatewayNode: string;
  sslMode: 'certbot' | 'custom' | 'none';
  sslExpiryDays?: number;
  bundleId: string;
  bundleName: string;
  protocol: 'http' | 'websocket' | 'grpc' | 'tcp' | 'udp';
  targetNodes: Array<{ ip: string; port: number }>;
  loggingMode: 'full' | 'bypass';
  status: 'active' | 'degraded' | 'syncing' | 'offline';
  requestsPerSec: number;
}

// Mock initial data reflecting the architectural decoupling
const MOCK_ROUTES: GatewayRoute[] = [
  {
    id: 'route-01',
    domain: 'api.fehmicorp.com',
    incomingPort: 443,
    gatewayNode: 'Gateway Cluster (VRRP Active)',
    sslMode: 'certbot',
    sslExpiryDays: 82,
    bundleId: 'bundle-auth-prod',
    bundleName: 'auth-backend-pool',
    protocol: 'http',
    targetNodes: [
      { ip: '10.0.0.101', port: 8080 },
      { ip: '10.0.0.102', port: 8080 },
    ],
    loggingMode: 'full',
    status: 'active',
    requestsPerSec: 1420,
  },
  {
    id: 'route-02',
    domain: 'db-proxy.fehmicorp.internal',
    incomingPort: 5432,
    gatewayNode: 'Gateway Node 1 (10.0.0.11)',
    sslMode: 'none',
    bundleId: 'bundle-pg-cluster',
    bundleName: 'pg-master-replica',
    protocol: 'tcp',
    targetNodes: [
      { ip: '10.0.0.200', port: 5432 },
      { ip: '10.0.0.201', port: 5432 },
    ],
    loggingMode: 'bypass',
    status: 'active',
    requestsPerSec: 310,
  },
  {
    id: 'route-03',
    domain: 'ws.fehmicorp.com',
    incomingPort: 443,
    gatewayNode: 'Gateway Cluster (VRRP Active)',
    sslMode: 'custom',
    sslExpiryDays: 14,
    bundleId: 'bundle-realtime-ws',
    bundleName: 'realtime-events-pool',
    protocol: 'websocket',
    targetNodes: [{ ip: '10.0.0.150', port: 3000 }],
    loggingMode: 'full',
    status: 'degraded',
    requestsPerSec: 890,
  },
];

export default function ServicesListPage() {
  const [routes, setRoutes] = useState<GatewayRoute[]>(MOCK_ROUTES);
  const [searchQuery, setSearchQuery] = useState('');
  const [protocolFilter, setProtocolFilter] = useState<string>('all');
  const [isSyncing, setIsSyncing] = useState(false);

  // Sync cluster configuration across gateway nodes
  const handleForceSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
    }, 1200);
  };

  // Toggle Traffic Telemetry / Bypass on the fly
  const toggleLoggingMode = (routeId: string) => {
    setRoutes((prev) =>
      prev.map((r) => {
        if (r.id === routeId) {
          const nextMode = r.loggingMode === 'full' ? 'bypass' : 'full';
          return { ...r, loggingMode: nextMode };
        }
        return r;
      })
    );
  };

  // Delete Route & Purge Certbot SSL
  const handleDeleteRoute = (routeId: string, domain: string, sslMode: string) => {
    const confirmMsg =
      sslMode === 'certbot'
        ? `Are you sure? This will delete route "${domain}" and automatically purge its Let's Encrypt SSL cert from Certbot.`
        : `Are you sure you want to remove the gateway route for "${domain}"?`;

    if (confirm(confirmMsg)) {
      setRoutes((prev) => prev.filter((r) => r.id !== routeId));
    }
  };

  const filteredRoutes = routes.filter((r) => {
    const matchesSearch =
      r.domain.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.bundleName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.targetNodes.some((n) => n.ip.includes(searchQuery));

    const matchesProtocol = protocolFilter === 'all' || r.protocol === protocolFilter;

    return matchesSearch && matchesProtocol;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-8 font-sans">
      {/* Top Header & Actions */}
      <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase">
              Gateway Operational
            </span>
            <span className="text-xs text-slate-500 font-mono">
              Total Routes Active: {routes.length}
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Active Gateway Ingress Routes</h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Overview of live domain SNI bindings, attached service pools, Certbot status, and traffic telemetry.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleForceSync}
            disabled={isSyncing}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-2"
          >
            <span className={`h-2 w-2 rounded-full ${isSyncing ? 'bg-amber-400 animate-ping' : 'bg-emerald-400'}`} />
            {isSyncing ? 'Syncing Rules Across Cluster...' : '⚡ Force Sync Cluster'}
          </button>

          <Link
            href="/services/new"
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-blue-900/20 flex items-center gap-1.5"
          >
            <span>+ Create Edge Route</span>
          </Link>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 bg-slate-900/60 border border-slate-800/80 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="w-full sm:w-96">
          <input
            type="text"
            placeholder="Search domain, bundle, target IP..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-slate-400 font-medium">Protocol:</span>
          <select
            value={protocolFilter}
            onChange={(e) => setProtocolFilter(e.target.value)}
            className="p-2 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-blue-500"
          >
            <option value="all">All Protocols</option>
            <option value="http">HTTP / L7</option>
            <option value="websocket">WebSocket</option>
            <option value="tcp">TCP Stream</option>
            <option value="udp">UDP Datagram</option>
            <option value="grpc">gRPC</option>
          </select>
        </div>
      </div>

      {/* Routes Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-mono uppercase text-[10px]">
                <th className="p-4">Status & Domain (SNI)</th>
                <th className="p-4">Upstream Service Bundle</th>
                <th className="p-4">Gateway & Port</th>
                <th className="p-4">SSL Cert Engine</th>
                <th className="p-4">Telemetry Mode</th>
                <th className="p-4 text-right">Traffic</th>
                <th className="p-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredRoutes.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500 font-mono">
                    No gateway ingress routes matched your search criteria.
                  </td>
                </tr>
              ) : (
                filteredRoutes.map((route) => (
                  <tr key={route.id} className="hover:bg-slate-800/40 transition">
                    {/* Domain & Health */}
                    <td className="p-4">
                      <div className="flex items-center gap-2.5">
                        <span
                          className={`h-2.5 w-2.5 rounded-full shrink-0 ${
                            route.status === 'active'
                              ? 'bg-emerald-400 shadow-sm shadow-emerald-400/50'
                              : route.status === 'degraded'
                              ? 'bg-amber-400 shadow-sm shadow-amber-400/50'
                              : 'bg-rose-500'
                          }`}
                        />
                        <div>
                          <div className="font-mono font-bold text-white text-sm">{route.domain}</div>
                          <div className="text-[10px] text-slate-500 font-mono uppercase tracking-wider">
                            ID: {route.id}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Upstream Bundle */}
                    <td className="p-4">
                      <div>
                        <div className="font-semibold text-blue-400 font-mono">{route.bundleName}</div>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                          {route.targetNodes.length} Node(s):{' '}
                          {route.targetNodes.map((n) => `${n.ip}:${n.port}`).join(', ')}
                        </div>
                      </div>
                    </td>

                    {/* Gateway Node & Port */}
                    <td className="p-4 font-mono">
                      <div className="text-slate-200">{route.gatewayNode}</div>
                      <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <span className="px-1.5 py-0.2 bg-slate-800 border border-slate-700 rounded text-slate-300">
                          Port {route.incomingPort}
                        </span>
                        <span className="uppercase text-slate-500">{route.protocol}</span>
                      </div>
                    </td>

                    {/* SSL Status */}
                    <td className="p-4">
                      {route.sslMode === 'certbot' ? (
                        <div className="flex items-center gap-1.5">
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            🔒 Certbot Auto
                          </span>
                          {route.sslExpiryDays && (
                            <span
                              className={`text-[10px] font-mono ${
                                route.sslExpiryDays < 20 ? 'text-rose-400 font-bold' : 'text-slate-400'
                              }`}
                            >
                              ({route.sslExpiryDays}d left)
                            </span>
                          )}
                        </div>
                      ) : route.sslMode === 'custom' ? (
                        <div className="flex items-center gap-1.5">
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20">
                            📜 Custom Cert
                          </span>
                          {route.sslExpiryDays && (
                            <span
                              className={`text-[10px] font-mono ${
                                route.sslExpiryDays < 20 ? 'text-amber-400 font-bold' : 'text-slate-400'
                              }`}
                            >
                              ({route.sslExpiryDays}d left)
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-800 text-slate-400 border border-slate-700">
                          🔓 HTTP (No SSL)
                        </span>
                      )}
                    </td>

                    {/* Telemetry Toggle */}
                    <td className="p-4">
                      <button
                        onClick={() => toggleLoggingMode(route.id)}
                        className={`px-2.5 py-1 rounded-lg border text-[10px] font-mono font-bold transition flex items-center gap-1.5 ${
                          route.loggingMode === 'full'
                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/30 hover:bg-amber-500/20'
                            : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'
                        }`}
                        title="Click to toggle between header inspection/logging and bypass mode"
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            route.loggingMode === 'full' ? 'bg-amber-400' : 'bg-slate-500'
                          }`}
                        />
                        {route.loggingMode === 'full' ? 'Header Logging ON' : 'Header Bypass'}
                      </button>
                    </td>

                    {/* Throughput */}
                    <td className="p-4 text-right font-mono">
                      <div className="text-white font-bold">{route.requestsPerSec.toLocaleString()} req/s</div>
                      <div className="text-[10px] text-slate-500">Active throughput</div>
                    </td>

                    {/* Action Buttons */}
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleDeleteRoute(route.id, route.domain, route.sslMode)}
                          className="p-1.5 bg-slate-800 hover:bg-rose-950 hover:text-rose-400 border border-slate-700 hover:border-rose-800/80 rounded-lg text-slate-400 transition"
                          title="Purge route and certificate"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}