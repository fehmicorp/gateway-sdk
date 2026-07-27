'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Route, Gateway, Service, BundleService } from '@/lib/types';

// Mock Gateway Data
const MOCK_GATEWAYS: Gateway[] = [
  {
    id: 'gw-1',
    gatewayName: 'Main API Gateway',
    domainName: 'api.fehmicorp.internal',
    protocol: 'https',
    upstreamTargetId: 'bundle-1',
    upstreamType: 'Bundle',
    forceSslRedirect: true,
    enableHsts: true,
    status: 'active'
  },
  {
    id: 'gw-2',
    gatewayName: 'Auth Edge Gateway',
    domainName: 'auth.fehmicorp.internal',
    protocol: 'https',
    upstreamTargetId: 'srv-1',
    upstreamType: 'Standalone',
    forceSslRedirect: true,
    enableHsts: true,
    status: 'active'
  }
];

// Mock Upstream Targets for Lookup
const MOCK_SERVICES: Record<string, string> = {
  'srv-1': 'Auth Service (10.0.0.10:8080)',
  'srv-2': 'User Profile Service (10.0.0.11:8081)',
  'srv-3': 'Billing Microservice (10.0.0.12:8082)'
};

const MOCK_BUNDLES: Record<string, string> = {
  'bundle-1': 'Core Backend Cluster (Round Robin - 2 Nodes)',
  'bundle-2': 'Analytics Ingress Pool (Least Connections - 3 Nodes)'
};

// Mock Existing Routes
const INITIAL_ROUTES: Route[] = [
  {
    id: 'route-1',
    gatewayId: 'gw-1',
    pathPattern: '/api/v1/users/*',
    methods: ['GET', 'POST', 'PUT'],
    targetServiceId: 'srv-2',
    stripPrefix: true,
    rateLimitPolicyId: 'pg-1',
    corsEnabled: true,
    headerTransforms: {
      add: { 'X-Forwarded-By': 'Gateway-Primary' }
    },
    createdAt: '2026-04-10T08:30:00Z'
  },
  {
    id: 'route-2',
    gatewayId: 'gw-1',
    pathPattern: '/api/v1/auth/*',
    methods: ['POST', 'OPTIONS'],
    targetServiceId: 'srv-1',
    stripPrefix: false,
    rateLimitPolicyId: 'pg-2',
    corsEnabled: true,
    createdAt: '2026-04-12T10:15:00Z'
  },
  {
    id: 'route-3',
    gatewayId: 'gw-2',
    pathPattern: '/oauth/v2/*',
    methods: ['ALL'],
    targetServiceId: 'bundle-1',
    stripPrefix: true,
    rateLimitPolicyId: 'pg-2',
    corsEnabled: false,
    createdAt: '2026-04-15T14:20:00Z'
  }
];

export default function RoutesPage() {
  const [routes, setRoutes] = useState<Route[]>(INITIAL_ROUTES);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGatewayFilter, setSelectedGatewayFilter] = useState<string>('ALL');

  // Filter routes based on search input and selected gateway
  const filteredRoutes = routes.filter((route) => {
    const matchesSearch =
      route.pathPattern.toLowerCase().includes(searchQuery.toLowerCase()) ||
      route.methods.some((m) => m.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesGateway =
      selectedGatewayFilter === 'ALL' || route.gatewayId === selectedGatewayFilter;

    return matchesSearch && matchesGateway;
  });

  const handleDeleteRoute = (id: string) => {
    if (confirm('Are you sure you want to remove this gateway route?')) {
      setRoutes((prev) => prev.filter((r) => r.id !== id));
    }
  };

  const getGatewayName = (gatewayId: string) => {
    const gw = MOCK_GATEWAYS.find((g) => g.id === gatewayId);
    return gw ? gw.gatewayName : gatewayId;
  };

  const getTargetName = (targetId: string) => {
    return MOCK_SERVICES[targetId] || MOCK_BUNDLES[targetId] || targetId;
  };

  const renderMethodBadge = (method: string) => {
    const colors: Record<string, string> = {
      GET: 'bg-emerald-950/60 text-emerald-400 border-emerald-800/60',
      POST: 'bg-blue-950/60 text-blue-400 border-blue-800/60',
      PUT: 'bg-amber-950/60 text-amber-400 border-amber-800/60',
      DELETE: 'bg-rose-950/60 text-rose-400 border-rose-800/60',
      PATCH: 'bg-purple-950/60 text-purple-400 border-purple-800/60',
      ALL: 'bg-indigo-950/60 text-indigo-300 border-indigo-800/60'
    };

    return (
      <span
        key={method}
        className={`inline-block px-1.5 py-0.5 text-[10px] font-mono font-semibold rounded border ${
          colors[method] || 'bg-slate-800 text-slate-300 border-slate-700'
        }`}
      >
        {method}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10 max-w-7xl mx-auto space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white font-mono">
            Gateway Routes
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Manage path matching rules, upstream target routing, header transformations, and policy attachments.
          </p>
        </div>
        <Link
          href="/routes/new"
          className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm rounded-lg shadow-lg shadow-blue-600/20 transition-colors"
        >
          + Create New Route
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Filter by path pattern or HTTP method (e.g. /api/v1/*, GET)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3.5 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono"
          />
        </div>
        <div className="w-full sm:w-64">
          <select
            value={selectedGatewayFilter}
            onChange={(e) => setSelectedGatewayFilter(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500 font-mono"
          >
            <option value="ALL">All Gateways</option>
            {MOCK_GATEWAYS.map((gw) => (
              <option key={gw.id} value={gw.id}>
                {gw.gatewayName}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Routes Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/50 text-slate-400 font-mono text-xs uppercase tracking-wider">
                <th className="py-3.5 px-4 font-semibold">Path Pattern</th>
                <th className="py-3.5 px-4 font-semibold">Methods</th>
                <th className="py-3.5 px-4 font-semibold">Parent Gateway</th>
                <th className="py-3.5 px-4 font-semibold">Upstream Target</th>
                <th className="py-3.5 px-4 font-semibold">Flags</th>
                <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredRoutes.length > 0 ? (
                filteredRoutes.map((route) => (
                  <tr key={route.id} className="hover:bg-slate-800/40 transition-colors">
                    {/* Path Pattern */}
                    <td className="py-4 px-4 font-mono font-medium text-blue-400">
                      {route.pathPattern}
                    </td>

                    {/* Methods */}
                    <td className="py-4 px-4">
                      <div className="flex flex-wrap gap-1">
                        {route.methods.map((method) => renderMethodBadge(method))}
                      </div>
                    </td>

                    {/* Parent Gateway */}
                    <td className="py-4 px-4 text-slate-300 font-medium">
                      {getGatewayName(route.gatewayId)}
                    </td>

                    {/* Target Service */}
                    <td className="py-4 px-4 font-mono text-xs text-slate-400">
                      {getTargetName(route.targetServiceId)}
                    </td>

                    {/* Flags / Policies */}
                    <td className="py-4 px-4">
                      <div className="flex flex-wrap gap-1.5">
                        {route.stripPrefix && (
                          <span className="px-2 py-0.5 text-[10px] font-mono bg-slate-800 text-slate-300 rounded border border-slate-700">
                            Strip Prefix
                          </span>
                        )}
                        {route.corsEnabled && (
                          <span className="px-2 py-0.5 text-[10px] font-mono bg-emerald-950/50 text-emerald-400 rounded border border-emerald-800/50">
                            CORS
                          </span>
                        )}
                        {route.rateLimitPolicyId && (
                          <span className="px-2 py-0.5 text-[10px] font-mono bg-indigo-950/50 text-indigo-300 rounded border border-indigo-800/50">
                            Policy Group
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-3 text-xs font-mono">
                        <button
                          onClick={() => handleDeleteRoute(route.id)}
                          className="text-rose-400 hover:text-rose-300 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500 font-mono text-xs">
                    No gateway routes found matching the current filters.
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