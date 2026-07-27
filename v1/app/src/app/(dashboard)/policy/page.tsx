'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export interface Policy {
  id: string;
  policyName: string;
  policyType: 'RATE_LIMIT' | 'CORS' | 'JWT_AUTH' | 'MTLS' | 'IP_RESTRICTION';
  description: string;
  scope: 'Global' | 'Route Specific' | 'Cluster Level';
  status: 'active' | 'inactive';
  createdAt: string;
}

export interface PolicyGroup {
  id: string;
  groupName: string;
  description: string;
  policyIds: string[];
  enforcementLevel: 'Strict' | 'Permissive' | 'Audit-Only';
  targetRoutes: number;
  createdAt: string;
}

// Mock Data
const MOCK_POLICIES: Policy[] = [
  {
    id: 'pol-1',
    policyName: 'Strict API Rate Limiter',
    policyType: 'RATE_LIMIT',
    description: 'Enforces a maximum threshold of 100 requests per minute per client IP using Redis leaky bucket.',
    scope: 'Global',
    status: 'active',
    createdAt: '2026-04-02T10:00:00Z',
  },
  {
    id: 'pol-2',
    policyName: 'Fehmi Auth Keycloak JWT Enforcement',
    policyType: 'JWT_AUTH',
    description: 'Validates RSA-256 signed Bearer tokens against the Keycloak public key endpoint.',
    scope: 'Route Specific',
    status: 'active',
    createdAt: '2026-04-10T14:20:00Z',
  },
  {
    id: 'pol-3',
    policyName: 'Restrictive CORS Engine',
    policyType: 'CORS',
    description: 'Restricts Access-Control-Allow-Origin to trusted *.fehmicorp.com subdomains.',
    scope: 'Global',
    status: 'inactive',
    createdAt: '2026-04-15T08:30:00Z',
  },
];

const MOCK_POLICY_GROUPS: PolicyGroup[] = [
  {
    id: 'pg-1',
    groupName: 'Zero Trust Gateway Baseline',
    description: 'Combines Keycloak JWT validation and strict rate-limiting for external edge proxies.',
    policyIds: ['pol-1', 'pol-2'],
    enforcementLevel: 'Strict',
    targetRoutes: 12,
    createdAt: '2026-04-12T11:00:00Z',
  },
  {
    id: 'pg-2',
    groupName: 'Public Asset Hardening Group',
    description: 'Applies rate limiting and global CORS controls for static media and public CDNs.',
    policyIds: ['pol-1', 'pol-3'],
    enforcementLevel: 'Permissive',
    targetRoutes: 5,
    createdAt: '2026-04-18T16:15:00Z',
  },
];

export default function PoliciesDashboardPage() {
  const [activeTab, setActiveTab] = useState<'policies' | 'groups'>('policies');
  const [policies, setPolicies] = useState<Policy[]>(MOCK_POLICIES);
  const [groups, setGroups] = useState<PolicyGroup[]>(MOCK_POLICY_GROUPS);
  const [searchQuery, setSearchQuery] = useState('');

  const togglePolicyStatus = (id: string) => {
    setPolicies((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, status: p.status === 'active' ? 'inactive' : 'active' } : p
      )
    );
  };

  const handleDeletePolicy = (id: string) => {
    if (confirm('Are you sure you want to delete this policy?')) {
      setPolicies((prev) => prev.filter((p) => p.id !== id));
    }
  };

  const handleDeleteGroup = (id: string) => {
    if (confirm('Are you sure you want to delete this policy group?')) {
      setGroups((prev) => prev.filter((g) => g.id !== id));
    }
  };

  const filteredPolicies = policies.filter(
    (p) =>
      p.policyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredGroups = groups.filter(
    (g) =>
      g.groupName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white font-mono flex items-center gap-2">
            <span>🛡️</span> Security & Traffic Policies
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Enforce rate limits, authentication requirements, CORS policies, and group-based access control.
          </p>
        </div>
        <Link
          href="/policy/new"
          className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm rounded-lg shadow-lg shadow-blue-600/20 transition-colors font-mono"
        >
          + Create Policy / Group
        </Link>
      </div>

      {/* Tabs & Search */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex bg-slate-900 border border-slate-800 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('policies')}
            className={`px-4 py-1.5 text-xs font-mono font-medium rounded-md transition-colors ${
              activeTab === 'policies'
                ? 'bg-blue-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Standalone Policies ({policies.length})
          </button>
          <button
            onClick={() => setActiveTab('groups')}
            className={`px-4 py-1.5 text-xs font-mono font-medium rounded-md transition-colors ${
              activeTab === 'groups'
                ? 'bg-blue-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Policy Groups ({groups.length})
          </button>
        </div>

        <div className="w-full sm:w-72">
          <input
            type="text"
            placeholder={`Search ${activeTab}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3.5 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono"
          />
        </div>
      </div>

      {/* Content Area */}
      {activeTab === 'policies' ? (
        /* Policies Table */
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/50 text-slate-400 font-mono text-xs uppercase tracking-wider">
                  <th className="py-3.5 px-4 font-semibold">Policy Name</th>
                  <th className="py-3.5 px-4 font-semibold">Type</th>
                  <th className="py-3.5 px-4 font-semibold">Scope</th>
                  <th className="py-3.5 px-4 font-semibold">Status</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 font-mono text-xs">
                {filteredPolicies.length > 0 ? (
                  filteredPolicies.map((policy) => (
                    <tr key={policy.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-4 px-4 font-semibold text-white">
                        <div>{policy.policyName}</div>
                        <div className="text-[10px] text-slate-500 font-sans font-normal mt-0.5">
                          {policy.description}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="px-2 py-0.5 text-[10px] rounded font-bold bg-slate-800 border border-slate-700 text-blue-400">
                          {policy.policyType}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-slate-300">{policy.scope}</td>
                      <td className="py-4 px-4">
                        <button
                          onClick={() => togglePolicyStatus(policy.id)}
                          className={`px-2 py-0.5 text-[10px] rounded font-bold border ${
                            policy.status === 'active'
                              ? 'bg-emerald-950/40 text-emerald-400 border-emerald-800/40'
                              : 'bg-slate-800 text-slate-500 border-slate-700'
                          }`}
                        >
                          {policy.status.toUpperCase()}
                        </button>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <button
                          onClick={() => handleDeletePolicy(policy.id)}
                          className="text-rose-400 hover:text-rose-300 transition-colors"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-500 text-xs">
                      No policies found matching your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Policy Groups Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredGroups.length > 0 ? (
            filteredGroups.map((group) => (
              <div
                key={group.id}
                className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 hover:border-slate-700 transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-mono text-base font-bold text-white">{group.groupName}</h3>
                    <p className="text-xs text-slate-400 mt-1">{group.description}</p>
                  </div>
                  <button
                    onClick={() => handleDeleteGroup(group.id)}
                    className="text-xs font-mono text-rose-400 hover:text-rose-300 transition-colors"
                  >
                    Delete
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs font-mono bg-slate-950 p-3 rounded-lg border border-slate-800/60">
                  <div>
                    <span className="text-slate-500 block text-[10px]">ENFORCEMENT</span>
                    <span
                      className={`font-semibold ${
                        group.enforcementLevel === 'Strict'
                          ? 'text-rose-400'
                          : group.enforcementLevel === 'Permissive'
                          ? 'text-amber-400'
                          : 'text-slate-400'
                      }`}
                    >
                      {group.enforcementLevel}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">BOUND ROUTES</span>
                    <span className="text-slate-200 font-semibold">{group.targetRoutes} Active Routes</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                    Included Policies ({group.policyIds.length})
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {group.policyIds.map((pId) => {
                      const matchedPolicy = policies.find((p) => p.id === pId);
                      return (
                        <span
                          key={pId}
                          className="px-2 py-1 bg-slate-800 border border-slate-700 rounded text-[11px] font-mono text-slate-300"
                        >
                          {matchedPolicy ? matchedPolicy.policyName : pId}
                        </span>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-2 py-12 text-center text-slate-500 font-mono text-xs bg-slate-900 border border-slate-800 rounded-xl">
              No matching policy groups found.
            </div>
          )}
        </div>
      )}
    </div>
  );
}