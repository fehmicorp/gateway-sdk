'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Rule, RuleGroup } from '@/lib/types';

// Mock Rule Data
const MOCK_RULES: Rule[] = [
  {
    id: 'rule-1',
    ruleName: 'Inject Forwarded Proxy Headers',
    description: 'Appends X-Forwarded-Host and X-Real-IP headers to upstream payloads',
    conditionType: 'HEADER_MATCH',
    conditionExpression: 'headers["X-Forwarded-By"] EXISTS',
    actionType: 'HEADER_MODIFY',
    actionConfig: { add: { 'X-Real-IP': '$client_ip', 'X-Forwarded-Host': '$http_host' } },
    priority: 10,
    status: 'enabled',
    createdAt: '2026-04-01T09:00:00Z'
  },
  {
    id: 'rule-2',
    ruleName: 'Block Malicious User Agents',
    description: 'Rejects requests with known scraping or vulnerability scanning User-Agent strings',
    conditionType: 'HEADER_MATCH',
    conditionExpression: 'headers["User-Agent"] MATCHES "^(sqlmap|nikto|python-requests)"',
    actionType: 'DENY',
    actionConfig: { statusCode: 403, message: 'Forbidden Request' },
    priority: 1,
    status: 'enabled',
    createdAt: '2026-04-05T11:20:00Z'
  },
  {
    id: 'rule-3',
    ruleName: 'Internal IP Whitelist Trigger',
    description: 'Enforces strict IP subnets for internal infrastructure management paths',
    conditionType: 'IP_MATCH',
    conditionExpression: 'client_ip IN ["10.0.0.0/8", "192.168.10.0/24"]',
    actionType: 'ALLOW',
    actionConfig: {},
    priority: 5,
    status: 'disabled',
    createdAt: '2026-04-12T16:45:00Z'
  }
];

// Mock Rule Group Data
const MOCK_GROUPS: RuleGroup[] = [
  {
    id: 'rg-1',
    groupName: 'Global Edge Security Suite',
    description: 'Applies IP whitelist filtering, user-agent sanitization, and request rate-limiting',
    ruleIds: ['rule-2', 'rule-3'],
    executionMode: 'Sequential',
    targetScope: 'Global',
    createdAt: '2026-04-06T10:00:00Z'
  },
  {
    id: 'rg-2',
    groupName: 'Auth Edge Sanitizer',
    description: 'Header injection and CORS pre-flight validation rules for authentication proxies',
    ruleIds: ['rule-1'],
    executionMode: 'FirstMatchStop',
    targetScope: 'Specific Gateway',
    createdAt: '2026-04-10T14:30:00Z'
  }
];

export default function RulesDashboardPage() {
  const [activeTab, setActiveTab] = useState<'rules' | 'groups'>('rules');
  const [rules, setRules] = useState<Rule[]>(MOCK_RULES);
  const [groups, setGroups] = useState<RuleGroup[]>(MOCK_GROUPS);
  const [searchQuery, setSearchQuery] = useState('');

  const toggleRuleStatus = (id: string) => {
    setRules((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: r.status === 'enabled' ? 'disabled' : 'enabled' } : r))
    );
  };

  const handleDeleteRule = (id: string) => {
    if (confirm('Are you sure you want to delete this rule?')) {
      setRules((prev) => prev.filter((r) => r.id !== id));
    }
  };

  const handleDeleteGroup = (id: string) => {
    if (confirm('Are you sure you want to delete this rule group?')) {
      setGroups((prev) => prev.filter((g) => g.id !== id));
    }
  };

  const filteredRules = rules.filter(
    (r) =>
      r.ruleName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.conditionExpression ?? '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredGroups = groups.filter(
    (g) =>
      g.groupName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (g.description ?? '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white font-mono flex items-center gap-2">
            <span>📜</span> Rules & Rule Groups
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Configure traffic evaluation rules, condition expressions, header rewrites, and execution chains.
          </p>
        </div>
        <Link
          href="/rules/new"
          className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm rounded-lg shadow-lg shadow-blue-600/20 transition-colors font-mono"
        >
          + Create Rule / Group
        </Link>
      </div>

      {/* Tabs & Search Filter */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        {/* Navigation Tabs */}
        <div className="flex bg-slate-900 border border-slate-800 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('rules')}
            className={`px-4 py-1.5 text-xs font-mono font-medium rounded-md transition-colors ${
              activeTab === 'rules'
                ? 'bg-blue-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Individual Rules ({rules.length})
          </button>
          <button
            onClick={() => setActiveTab('groups')}
            className={`px-4 py-1.5 text-xs font-mono font-medium rounded-md transition-colors ${
              activeTab === 'groups'
                ? 'bg-blue-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Rule Groups ({groups.length})
          </button>
        </div>

        {/* Search */}
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

      {/* Content Display */}
      {activeTab === 'rules' ? (
        /* Rules Table */
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/50 text-slate-400 font-mono text-xs uppercase tracking-wider">
                  <th className="py-3.5 px-4 font-semibold">Priority</th>
                  <th className="py-3.5 px-4 font-semibold">Rule Name</th>
                  <th className="py-3.5 px-4 font-semibold">Condition Expression</th>
                  <th className="py-3.5 px-4 font-semibold">Action</th>
                  <th className="py-3.5 px-4 font-semibold">Status</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 font-mono text-xs">
                {filteredRules.length > 0 ? (
                  filteredRules.map((rule) => (
                    <tr key={rule.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-4 px-4 font-bold text-slate-400">#{rule.priority}</td>
                      <td className="py-4 px-4 font-semibold text-white">
                        <div>{rule.ruleName}</div>
                        <div className="text-[10px] text-slate-500 font-sans font-normal mt-0.5">
                          {rule.description}
                        </div>
                      </td>
                      <td className="py-4 px-4 text-blue-400 max-w-xs truncate">
                        <code>{rule.conditionExpression}</code>
                      </td>
                      <td className="py-4 px-4">
                        <span
                          className={`px-2 py-0.5 text-[10px] rounded font-bold border ${
                            rule.actionType === 'ALLOW'
                              ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800/60'
                              : rule.actionType === 'DENY'
                              ? 'bg-rose-950/60 text-rose-400 border-rose-800/60'
                              : 'bg-indigo-950/60 text-indigo-300 border-indigo-800/60'
                          }`}
                        >
                          {rule.actionType}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <button
                          onClick={() => toggleRuleStatus(rule.id)}
                          className={`px-2 py-0.5 text-[10px] rounded font-bold border ${
                            rule.status === 'enabled'
                              ? 'bg-emerald-950/40 text-emerald-400 border-emerald-800/40'
                              : 'bg-slate-800 text-slate-500 border-slate-700'
                          }`}
                        >
                          {rule.status.toUpperCase()}
                        </button>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <button
                          onClick={() => handleDeleteRule(rule.id)}
                          className="text-rose-400 hover:text-rose-300 transition-colors"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-500 text-xs">
                      No matching rules found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Rule Groups Grid */
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
                    <span className="text-slate-500 block text-[10px]">EXECUTION MODE</span>
                    <span className="text-blue-400 font-semibold">{group.executionMode}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">TARGET SCOPE</span>
                    <span className="text-slate-200 font-semibold">{group.targetScope}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                    Attached Rules ({group.ruleIds.length})
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {group.ruleIds.map((rId) => {
                      const matchedRule = rules.find((r) => r.id === rId);
                      return (
                        <span
                          key={rId}
                          className="px-2 py-1 bg-slate-800 border border-slate-700 rounded text-[11px] font-mono text-slate-300"
                        >
                          {matchedRule ? matchedRule.ruleName : rId}
                        </span>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-2 py-12 text-center text-slate-500 font-mono text-xs bg-slate-900 border border-slate-800 rounded-xl">
              No matching rule groups found.
            </div>
          )}
        </div>
      )}
    </div>
  );
}