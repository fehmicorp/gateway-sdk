'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function CreatePolicyOrGroupPage() {
  const [creationType, setCreationType] = useState<'policy' | 'group'>('policy');

  // Policy Form State
  const [policyForm, setPolicyForm] = useState({
    policyName: '',
    description: '',
    policyType: 'RATE_LIMIT',
    scope: 'Global',
    // Rate Limit Config
    requestsPerMinute: 100,
    burstCapacity: 20,
    // CORS Config
    allowedOrigins: '*',
    allowedMethods: 'GET,POST,PUT,DELETE,OPTIONS',
    // JWT Config
    jwksUri: 'https://auth.fehmicorp.com/realms/master/protocol/openid-connect/certs',
    headerName: 'Authorization',
  });

  // Policy Group Form State
  const [groupForm, setGroupForm] = useState({
    groupName: '',
    description: '',
    enforcementLevel: 'Strict',
    selectedPolicies: [] as string[],
  });

  const handlePolicySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('New Policy Payload:', policyForm);
    alert(`Policy "${policyForm.policyName}" created successfully!`);
  };

  const handleGroupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('New Policy Group Payload:', groupForm);
    alert(`Policy Group "${groupForm.groupName}" created successfully!`);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10 max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white font-mono flex items-center gap-2">
            <span>🛡️</span> Create Policy or Policy Group
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Configure traffic control policies or wrap multiple enforcement policies into a reusable group.
          </p>
        </div>
        <Link
          href="/policies"
          className="px-3 py-1.5 text-xs font-mono text-slate-400 hover:text-slate-200 border border-slate-800 rounded-lg bg-slate-900 transition-colors"
        >
          ← Back to Policies
        </Link>
      </div>

      {/* Creation Mode Switcher */}
      <div className="flex bg-slate-900 border border-slate-800 p-1.5 rounded-xl max-w-md">
        <button
          type="button"
          onClick={() => setCreationType('policy')}
          className={`flex-1 py-2 text-xs font-mono font-bold rounded-lg transition-colors ${
            creationType === 'policy'
              ? 'bg-blue-600 text-white shadow'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Create Standalone Policy
        </button>
        <button
          type="button"
          onClick={() => setCreationType('group')}
          className={`flex-1 py-2 text-xs font-mono font-bold rounded-lg transition-colors ${
            creationType === 'group'
              ? 'bg-blue-600 text-white shadow'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Create Policy Group
        </button>
      </div>

      {/* FORM 1: Standalone Policy Form */}
      {creationType === 'policy' ? (
        <form onSubmit={handlePolicySubmit} className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
            <h2 className="text-sm font-semibold text-slate-200 uppercase tracking-wider font-mono">
              Policy Basics & Target Scope
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1 font-mono">
                  Policy Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Strict Edge Rate Limit"
                  value={policyForm.policyName}
                  onChange={(e) => setPolicyForm({ ...policyForm, policyName: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1 font-mono">
                  Enforcement Scope
                </label>
                <select
                  value={policyForm.scope}
                  onChange={(e) => setPolicyForm({ ...policyForm, scope: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500 font-mono"
                >
                  <option value="Global">Global Gateway Level</option>
                  <option value="Route Specific">Route Specific</option>
                  <option value="Cluster Level">Cluster Node Level</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-slate-400 mb-1 font-mono">
                  Description
                </label>
                <input
                  type="text"
                  placeholder="Explain why this policy is enforced..."
                  value={policyForm.description}
                  onChange={(e) => setPolicyForm({ ...policyForm, description: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500 font-mono"
                />
              </div>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
            <h2 className="text-sm font-semibold text-slate-200 uppercase tracking-wider font-mono">
              Policy Type & Specific Parameters
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1 font-mono">
                  Policy Engine Type *
                </label>
                <select
                  value={policyForm.policyType}
                  onChange={(e) => setPolicyForm({ ...policyForm, policyType: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500 font-mono"
                >
                  <option value="RATE_LIMIT">Rate Limiting (Leaky Bucket)</option>
                  <option value="CORS">CORS Headers & Origins</option>
                  <option value="JWT_AUTH">JWT Auth Validation</option>
                  <option value="MTLS">Mutual TLS (mTLS) Client Verification</option>
                </select>
              </div>

              {/* Dynamic Parameter Options */}
              {policyForm.policyType === 'RATE_LIMIT' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-800">
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1 font-mono">
                      Requests Per Minute (RPM)
                    </label>
                    <input
                      type="number"
                      required
                      value={policyForm.requestsPerMinute}
                      onChange={(e) =>
                        setPolicyForm({ ...policyForm, requestsPerMinute: parseInt(e.target.value) || 1 })
                      }
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1 font-mono">
                      Burst Capacity
                    </label>
                    <input
                      type="number"
                      required
                      value={policyForm.burstCapacity}
                      onChange={(e) =>
                        setPolicyForm({ ...policyForm, burstCapacity: parseInt(e.target.value) || 0 })
                      }
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500 font-mono"
                    />
                  </div>
                </div>
              )}

              {policyForm.policyType === 'CORS' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-800">
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1 font-mono">
                      Allowed Origins (CSV or *)
                    </label>
                    <input
                      type="text"
                      required
                      value={policyForm.allowedOrigins}
                      onChange={(e) => setPolicyForm({ ...policyForm, allowedOrigins: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1 font-mono">
                      Allowed HTTP Methods
                    </label>
                    <input
                      type="text"
                      required
                      value={policyForm.allowedMethods}
                      onChange={(e) => setPolicyForm({ ...policyForm, allowedMethods: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500 font-mono"
                    />
                  </div>
                </div>
              )}

              {policyForm.policyType === 'JWT_AUTH' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-800">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-slate-400 mb-1 font-mono">
                      JWKS Certificate URI *
                    </label>
                    <input
                      type="text"
                      required
                      value={policyForm.jwksUri}
                      onChange={(e) => setPolicyForm({ ...policyForm, jwksUri: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500 font-mono"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="submit"
              className="px-5 py-2 rounded-lg text-sm bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-colors font-mono shadow-lg shadow-blue-600/20"
            >
              Save Policy
            </button>
          </div>
        </form>
      ) : (
        /* FORM 2: Policy Group Form */
        <form onSubmit={handleGroupSubmit} className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
            <h2 className="text-sm font-semibold text-slate-200 uppercase tracking-wider font-mono">
              Policy Group Configuration
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1 font-mono">
                  Policy Group Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ingress Perimeter Baseline"
                  value={groupForm.groupName}
                  onChange={(e) => setGroupForm({ ...groupForm, groupName: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1 font-mono">
                  Enforcement Level
                </label>
                <select
                  value={groupForm.enforcementLevel}
                  onChange={(e) => setGroupForm({ ...groupForm, enforcementLevel: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500 font-mono"
                >
                  <option value="Strict">Strict (Block Request on Failure)</option>
                  <option value="Permissive">Permissive (Log Header Warnings)</option>
                  <option value="Audit-Only">Audit-Only (Metrics Only)</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-slate-400 mb-1 font-mono">
                  Description
                </label>
                <input
                  type="text"
                  placeholder="Describe the overall scope of this policy group..."
                  value={groupForm.description}
                  onChange={(e) => setGroupForm({ ...groupForm, description: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500 font-mono"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="submit"
              className="px-5 py-2 rounded-lg text-sm bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-colors font-mono shadow-lg shadow-blue-600/20"
            >
              Save Policy Group
            </button>
          </div>
        </form>
      )}
    </div>
  );
}