'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function CreateRuleOrGroupPage() {
  const [creationType, setCreationType] = useState<'rule' | 'group'>('rule');

  // Individual Rule State
  const [ruleForm, setRuleForm] = useState({
    ruleName: '',
    description: '',
    conditionType: 'HEADER_MATCH',
    conditionExpression: '',
    actionType: 'HEADER_MODIFY',
    priority: 10,
    headerKey: '',
    headerValue: '',
    denyStatusCode: 403,
  });

  // Rule Group State
  const [groupForm, setGroupForm] = useState({
    groupName: '',
    description: '',
    executionMode: 'Sequential',
    targetScope: 'Global',
    selectedRules: [] as string[],
  });

  const handleRuleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('New Rule Payload:', ruleForm);
    alert(`Rule "${ruleForm.ruleName}" created successfully!`);
  };

  const handleGroupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('New Rule Group Payload:', groupForm);
    alert(`Rule Group "${groupForm.groupName}" created successfully!`);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10 max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white font-mono flex items-center gap-2">
            <span>📜</span> Create Rule or Group
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Build standalone traffic matching rules or combine existing rules into execution chains.
          </p>
        </div>
        <Link
          href="/rules"
          className="px-3 py-1.5 text-xs font-mono text-slate-400 hover:text-slate-200 border border-slate-800 rounded-lg bg-slate-900 transition-colors"
        >
          ← Back to Rules
        </Link>
      </div>

      {/* Selector: Rule vs Group */}
      <div className="flex bg-slate-900 border border-slate-800 p-1.5 rounded-xl max-w-md">
        <button
          type="button"
          onClick={() => setCreationType('rule')}
          className={`flex-1 py-2 text-xs font-mono font-bold rounded-lg transition-colors ${
            creationType === 'rule'
              ? 'bg-blue-600 text-white shadow'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Create Standalone Rule
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
          Create Rule Group
        </button>
      </div>

      {/* FORM A: Standalone Rule Form */}
      {creationType === 'rule' ? (
        <form onSubmit={handleRuleSubmit} className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
            <h2 className="text-sm font-semibold text-slate-200 uppercase tracking-wider font-mono">
              Rule Metadata & Priority
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-slate-400 mb-1 font-mono">
                  Rule Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Reject Malicious User-Agent"
                  value={ruleForm.ruleName}
                  onChange={(e) => setRuleForm({ ...ruleForm, ruleName: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1 font-mono">
                  Execution Priority *
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  value={ruleForm.priority}
                  onChange={(e) => setRuleForm({ ...ruleForm, priority: parseInt(e.target.value) || 1 })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500 font-mono"
                />
              </div>

              <div className="md:col-span-3">
                <label className="block text-xs font-medium text-slate-400 mb-1 font-mono">
                  Description
                </label>
                <input
                  type="text"
                  placeholder="Brief summary of why this rule exists..."
                  value={ruleForm.description}
                  onChange={(e) => setRuleForm({ ...ruleForm, description: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500 font-mono"
                />
              </div>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
            <h2 className="text-sm font-semibold text-slate-200 uppercase tracking-wider font-mono">
              Condition & Matching Logic
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1 font-mono">
                  Condition Type
                </label>
                <select
                  value={ruleForm.conditionType}
                  onChange={(e) => setRuleForm({ ...ruleForm, conditionType: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500 font-mono"
                >
                  <option value="HEADER_MATCH">HTTP Header Match</option>
                  <option value="PATH_MATCH">URL Path Regex</option>
                  <option value="IP_MATCH">Client IP Subnet</option>
                  <option value="QUERY_PARAM">Query Parameter</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-slate-400 mb-1 font-mono">
                  Expression / Pattern *
                </label>
                <input
                  type="text"
                  required
                  placeholder='e.g. headers["User-Agent"] MATCHES "^(sqlmap)"'
                  value={ruleForm.conditionExpression}
                  onChange={(e) => setRuleForm({ ...ruleForm, conditionExpression: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500 font-mono"
                />
              </div>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
            <h2 className="text-sm font-semibold text-slate-200 uppercase tracking-wider font-mono">
              Action Trigger
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1 font-mono">
                  Action Type
                </label>
                <select
                  value={ruleForm.actionType}
                  onChange={(e) => setRuleForm({ ...ruleForm, actionType: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500 font-mono"
                >
                  <option value="HEADER_MODIFY">Inject / Modify Header</option>
                  <option value="DENY">Deny Request (HTTP Error)</option>
                  <option value="ALLOW">Allow / Bypass Further Rules</option>
                  <option value="RATE_LIMIT">Trigger Rate Limit</option>
                </select>
              </div>

              {ruleForm.actionType === 'DENY' && (
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1 font-mono">
                    HTTP Deny Code
                  </label>
                  <input
                    type="number"
                    value={ruleForm.denyStatusCode}
                    onChange={(e) =>
                      setRuleForm({ ...ruleForm, denyStatusCode: parseInt(e.target.value) || 403 })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="submit"
              className="px-5 py-2 rounded-lg text-sm bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-colors font-mono shadow-lg shadow-blue-600/20"
            >
              Save Rule
            </button>
          </div>
        </form>
      ) : (
        /* FORM B: Rule Group Form */
        <form onSubmit={handleGroupSubmit} className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
            <h2 className="text-sm font-semibold text-slate-200 uppercase tracking-wider font-mono">
              Group Metadata
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1 font-mono">
                  Group Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Global Ingress Security Chain"
                  value={groupForm.groupName}
                  onChange={(e) => setGroupForm({ ...groupForm, groupName: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1 font-mono">
                  Execution Mode
                </label>
                <select
                  value={groupForm.executionMode}
                  onChange={(e) => setGroupForm({ ...groupForm, executionMode: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500 font-mono"
                >
                  <option value="Sequential">Sequential (Evaluate All Rules)</option>
                  <option value="FirstMatchStop">First Match Stop (Short-Circuit)</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-slate-400 mb-1 font-mono">
                  Description
                </label>
                <input
                  type="text"
                  placeholder="Purpose of this combined rule chain..."
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
              Save Rule Group
            </button>
          </div>
        </form>
      )}
    </div>
  );
}