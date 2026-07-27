'use client';

import React, { useState } from 'react';
import {
  Gateway,
  Service,
  BundleService,
  PolicyGroup
} from '@/lib/types';

// Local UI Scope Interfaces
export interface PolicyRule {
  id: string;
  ruleName: string;
  description: string;
}

export interface PolicyRuleGroup {
  id: string;
  groupName: string;
  description: string;
  ruleCount: number;
}

export interface ScopeGatewayNode {
  id: string;
  nodeName: string;
  ipAddress: string;
  status: 'online' | 'offline';
}

export interface NodeGroup {
  id: string;
  groupName: string;
  nodeCount: number;
}

export type NodeScopeMode = 'ALL' | 'SPECIFIC_NODES' | 'NODE_GROUPS';
export type RuleMappingType = 'INDIVIDUAL_RULES' | 'RULE_GROUPS';

export default function NewRoutePage() {
  // Mock target data
  const [gateways] = useState<Gateway[]>([
    {
      id: 'gw-1',
      gatewayName: 'Main API Gateway',
      domainName: 'api.example.com',
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
      domainName: 'auth.example.com',
      protocol: 'https',
      upstreamTargetId: 'srv-1',
      upstreamType: 'Standalone',
      forceSslRedirect: true,
      enableHsts: true,
      status: 'active'
    }
  ]);

  const [standaloneServices] = useState<Service[]>([
    {
      id: 'srv-1',
      serviceName: 'Auth Service',
      targetIp: '10.0.0.10',
      targetPort: 8080,
      protocol: 'http',
      healthCheck: { enabled: true, path: '/health' }
    },
    {
      id: 'srv-2',
      serviceName: 'User Profile Service',
      targetIp: '10.0.0.11',
      targetPort: 8081,
      protocol: 'http',
      healthCheck: { enabled: true, path: '/healthz' }
    }
  ]);

  const [serviceBundles] = useState<BundleService[]>([
    {
      id: 'bundle-1',
      bundleName: 'Core Backend Cluster',
      lbAlgorithm: 'round_robin',
      members: [
        { serviceId: 'srv-1', weight: 50 },
        { serviceId: 'srv-2', weight: 50 }
      ],
      stickySession: false
    }
  ]);

  // Mock Individual Policy Rules & Rule Groups
  const [policyRules] = useState<PolicyRule[]>([
    { id: 'rule-1', ruleName: 'Path Prefix Match (/api/v1/*)', description: 'Matches all incoming traffic under /api/v1' },
    { id: 'rule-2', ruleName: 'Strict Header Match (X-App-Client)', description: 'Validates presence of client ID header' },
    { id: 'rule-3', ruleName: 'Method Filter (GET / POST Only)', description: 'Restricts allowed HTTP verbs to GET and POST' }
  ]);

  const [policyRuleGroups] = useState<PolicyRuleGroup[]>([
    { id: 'rg-1', groupName: 'Public Core API Rule Set', description: 'Combines Path Prefix + Method Filtering', ruleCount: 3 },
    { id: 'rg-2', groupName: 'OAuth Guard Rule Set', description: 'Header validation + Token inspection matching', ruleCount: 5 }
  ]);

  // Mock Policy Groups (Fixes ReferenceError)
  const [policyGroups] = useState<PolicyGroup[]>([
    { id: 'pg-1', name: 'Standard Rate Limiting & CORS', description: 'Applies 100 req/min rate limit and default CORS headers' },
    { id: 'pg-2', name: 'Strict Security & WAF', description: 'Enforces strict JWT inspection, IP whitelisting, and SQLi protection' },
    { id: 'pg-3', name: 'High Throughput Pass-Through', description: 'Minimal middleware overhead for streaming endpoints' }
  ]);

  // Mock Gateway Nodes & Groups
  const [availableNodes] = useState<ScopeGatewayNode[]>([
    { id: 'node-1', nodeName: 'gw-edge-us-east-1', ipAddress: '192.168.1.50', status: 'online' },
    { id: 'node-2', nodeName: 'gw-edge-us-east-2', ipAddress: '192.168.1.51', status: 'online' },
    { id: 'node-3', nodeName: 'gw-edge-eu-west-1', ipAddress: '192.168.2.10', status: 'online' }
  ]);

  const [availableNodeGroups] = useState<NodeGroup[]>([
    { id: 'ng-1', groupName: 'US-East Production Cluster', nodeCount: 8 },
    { id: 'ng-2', groupName: 'EU Edge Ingress Pool', nodeCount: 4 }
  ]);

  // Form State
  const [selectedGatewayId, setSelectedGatewayId] = useState<string>('');
  
  // Rule / Group Mapping State
  const [ruleMappingType, setRuleMappingType] = useState<RuleMappingType>('INDIVIDUAL_RULES');
  const [selectedRuleId, setSelectedRuleId] = useState<string>('');
  const [selectedRuleGroupId, setSelectedRuleGroupId] = useState<string>('');

  const [targetType, setTargetType] = useState<'Standalone' | 'Bundle'>('Standalone');
  const [targetServiceId, setTargetServiceId] = useState<string>('');

  // Policy Group State
  const [selectedPolicyGroupId, setSelectedPolicyGroupId] = useState<string>('');
  const [headerAdd, setHeaderAdd] = useState<{ key: string; value: string }[]>([
    { key: 'X-Forwarded-By', value: 'Gateway' }
  ]);

  // Node Scoping State
  const [nodeScopeMode, setNodeScopeMode] = useState<NodeScopeMode>('ALL');
  const [selectedNodeIds, setSelectedNodeIds] = useState<string[]>([]);
  const [selectedNodeGroupIds, setSelectedNodeGroupIds] = useState<string[]>([]);

  const handleAddHeader = () => {
    setHeaderAdd((prev) => [...prev, { key: '', value: '' }]);
  };

  const handleHeaderChange = (index: number, field: 'key' | 'value', value: string) => {
    setHeaderAdd((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  };

  const handleRemoveHeader = (index: number) => {
    setHeaderAdd((prev) => prev.filter((_, i) => i !== index));
  };

  const toggleNodeSelection = (id: string) => {
    setSelectedNodeIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleNodeGroupSelection = (id: string) => {
    setSelectedNodeGroupIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const addTransforms = headerAdd.reduce((acc, curr) => {
      if (curr.key.trim()) acc[curr.key.trim()] = curr.value.trim();
      return acc;
    }, {} as Record<string, string>);

    const newRoutePayload = {
      gatewayId: selectedGatewayId,
      ruleMapping: {
        type: ruleMappingType,
        targetId: ruleMappingType === 'INDIVIDUAL_RULES' ? selectedRuleId : selectedRuleGroupId
      },
      targetType,
      targetServiceId,
      policyGroupId: selectedPolicyGroupId,
      headerTransforms: {
        add: addTransforms
      },
      nodeScope: {
        mode: nodeScopeMode,
        targetNodes: nodeScopeMode === 'SPECIFIC_NODES' ? selectedNodeIds : [],
        targetNodeGroups: nodeScopeMode === 'NODE_GROUPS' ? selectedNodeGroupIds : []
      },
      createdAt: new Date().toISOString()
    };

    console.log('Deploying New Route Payload:', newRoutePayload);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10 max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="border-b border-slate-800 pb-5">
        <h1 className="text-2xl font-bold tracking-tight text-white font-mono">
          Create Gateway Route
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Configure routing rules, target services, policy groups, and node execution scope.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Step 1: Select Parent Gateway */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
          <h2 className="text-sm font-semibold text-slate-200 uppercase tracking-wider font-mono">
            1. Select Parent Gateway
          </h2>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-2">
              Target Gateway *
            </label>
            <select
              value={selectedGatewayId}
              onChange={(e) => setSelectedGatewayId(e.target.value)}
              required
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
            >
              <option value="" disabled>-- Select an API Gateway --</option>
              {gateways.map((gw) => (
                <option key={gw.id} value={gw.id}>
                  {gw.gatewayName} ({gw.domainName})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Step 2: Map Policy Rules or Groups */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
          <h2 className="text-sm font-semibold text-slate-200 uppercase tracking-wider font-mono">
            2. Map Policy Rules or Groups
          </h2>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <button
              type="button"
              onClick={() => {
                setRuleMappingType('INDIVIDUAL_RULES');
                setSelectedRuleGroupId('');
              }}
              className={`p-3 rounded-lg border text-sm font-medium transition-colors ${
                ruleMappingType === 'INDIVIDUAL_RULES'
                  ? 'bg-blue-950/40 border-blue-500 text-blue-400'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              Individual Rule
            </button>
            <button
              type="button"
              onClick={() => {
                setRuleMappingType('RULE_GROUPS');
                setSelectedRuleId('');
              }}
              className={`p-3 rounded-lg border text-sm font-medium transition-colors ${
                ruleMappingType === 'RULE_GROUPS'
                  ? 'bg-indigo-950/40 border-indigo-500 text-indigo-400'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              Rule Group
            </button>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-2">
              Select {ruleMappingType === 'INDIVIDUAL_RULES' ? 'Policy Rule' : 'Rule Group'} *
            </label>
            {ruleMappingType === 'INDIVIDUAL_RULES' ? (
              <select
                value={selectedRuleId}
                onChange={(e) => setSelectedRuleId(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
              >
                <option value="" disabled>-- Select a Policy Rule --</option>
                {policyRules.map((rule) => (
                  <option key={rule.id} value={rule.id}>
                    {rule.ruleName} — {rule.description}
                  </option>
                ))}
              </select>
            ) : (
              <select
                value={selectedRuleGroupId}
                onChange={(e) => setSelectedRuleGroupId(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
              >
                <option value="" disabled>-- Select a Rule Group --</option>
                {policyRuleGroups.map((group) => (
                  <option key={group.id} value={group.id}>
                    {group.groupName} ({group.ruleCount} Rules) — {group.description}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        {/* Step 3: Destination Target */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
          <h2 className="text-sm font-semibold text-slate-200 uppercase tracking-wider font-mono">
            3. Destination Target
          </h2>

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => {
                setTargetType('Standalone');
                setTargetServiceId('');
              }}
              className={`p-3 rounded-lg border text-sm font-medium transition-colors ${
                targetType === 'Standalone'
                  ? 'bg-blue-950/40 border-blue-500 text-blue-400'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              Standalone Service
            </button>
            <button
              type="button"
              onClick={() => {
                setTargetType('Bundle');
                setTargetServiceId('');
              }}
              className={`p-3 rounded-lg border text-sm font-medium transition-colors ${
                targetType === 'Bundle'
                  ? 'bg-indigo-950/40 border-indigo-500 text-indigo-400'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              Service Bundle (Load Balanced)
            </button>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-2">
              Select Upstream Target *
            </label>
            <select
              value={targetServiceId}
              onChange={(e) => setTargetServiceId(e.target.value)}
              required
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
            >
              <option value="" disabled>
                -- Select a {targetType === 'Standalone' ? 'Standalone Service' : 'Service Bundle'} --
              </option>
              {targetType === 'Standalone'
                ? standaloneServices.map((srv) => (
                    <option key={srv.id} value={srv.id}>
                      {srv.serviceName} ({srv.targetIp}:{srv.targetPort})
                    </option>
                  ))
                : serviceBundles.map((bnd) => (
                    <option key={bnd.id} value={bnd.id}>
                      {bnd.bundleName} ({bnd.members.length} Members - {bnd.lbAlgorithm ?? 'Direct'})
                    </option>
                  ))}
            </select>
          </div>
        </div>

        {/* Step 4: Policy Group & Transforms */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
          <h2 className="text-sm font-semibold text-slate-200 uppercase tracking-wider font-mono">
            4. Assign Policy Group & Custom Headers
          </h2>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-2">
              Policy Group *
            </label>
            <select
              value={selectedPolicyGroupId}
              onChange={(e) => setSelectedPolicyGroupId(e.target.value)}
              required
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
            >
              <option value="" disabled>-- Select a Policy Group --</option>
              {policyGroups.map((policy) => (
                <option key={policy.id} value={policy.id}>
                  {policy.name} — {policy.description}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-3 pt-2 border-t border-slate-800/80">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-slate-400">
                Custom Request Headers (Add)
              </label>
              <button
                type="button"
                onClick={handleAddHeader}
                className="text-xs text-blue-400 hover:text-blue-300 font-mono"
              >
                + Add Header
              </button>
            </div>

            {headerAdd.map((header, idx) => (
              <div key={idx} className="flex gap-2 items-center">
                <input
                  type="text"
                  placeholder="Header Key (e.g. X-Forwarded-By)"
                  value={header.key}
                  onChange={(e) => handleHeaderChange(idx, 'key', e.target.value)}
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs font-mono text-slate-100 focus:outline-none focus:border-blue-500"
                />
                <input
                  type="text"
                  placeholder="Value"
                  value={header.value}
                  onChange={(e) => handleHeaderChange(idx, 'value', e.target.value)}
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs font-mono text-slate-100 focus:outline-none focus:border-blue-500"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveHeader(idx)}
                  className="text-xs text-rose-500 hover:text-rose-400 px-2 py-1"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Step 5: Gateway Node Scope */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
          <h2 className="text-sm font-semibold text-slate-200 uppercase tracking-wider font-mono">
            5. Target Gateway Node Scope
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => setNodeScopeMode('ALL')}
              className={`p-3 rounded-lg border text-xs font-medium transition-colors text-left ${
                nodeScopeMode === 'ALL'
                  ? 'bg-blue-950/40 border-blue-500 text-blue-400'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="font-semibold text-sm mb-0.5">Every Node</div>
              Deploy globally across all nodes assigned to this gateway.
            </button>

            <button
              type="button"
              onClick={() => setNodeScopeMode('SPECIFIC_NODES')}
              className={`p-3 rounded-lg border text-xs font-medium transition-colors text-left ${
                nodeScopeMode === 'SPECIFIC_NODES'
                  ? 'bg-blue-950/40 border-blue-500 text-blue-400'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="font-semibold text-sm mb-0.5">Selected Nodes</div>
              Pick specific node instances for targeting.
            </button>

            <button
              type="button"
              onClick={() => setNodeScopeMode('NODE_GROUPS')}
              className={`p-3 rounded-lg border text-xs font-medium transition-colors text-left ${
                nodeScopeMode === 'NODE_GROUPS'
                  ? 'bg-blue-950/40 border-blue-500 text-blue-400'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="font-semibold text-sm mb-0.5">Node Groups</div>
              Target cluster regions or pre-configured groups.
            </button>
          </div>

          {/* Conditional Selection: Specific Nodes */}
          {nodeScopeMode === 'SPECIFIC_NODES' && (
            <div className="pt-2 space-y-2">
              <label className="block text-xs font-medium text-slate-400">
                Select Specific Nodes *
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {availableNodes.map((node) => {
                  const isChecked = selectedNodeIds.includes(node.id);
                  return (
                    <label
                      key={node.id}
                      onClick={() => toggleNodeSelection(node.id)}
                      className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer font-mono text-xs transition-colors ${
                        isChecked
                          ? 'bg-blue-950/30 border-blue-500/60 text-slate-100'
                          : 'bg-slate-950 border-slate-800 text-slate-400'
                      }`}
                    >
                      <div>
                        <div className="font-semibold">{node.nodeName}</div>
                        <div className="text-[11px] text-slate-500">{node.ipAddress}</div>
                      </div>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}}
                        className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-blue-600 focus:ring-blue-500"
                      />
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {/* Conditional Selection: Node Groups */}
          {nodeScopeMode === 'NODE_GROUPS' && (
            <div className="pt-2 space-y-2">
              <label className="block text-xs font-medium text-slate-400">
                Select Target Node Groups *
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {availableNodeGroups.map((group) => {
                  const isChecked = selectedNodeGroupIds.includes(group.id);
                  return (
                    <label
                      key={group.id}
                      onClick={() => toggleNodeGroupSelection(group.id)}
                      className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer font-mono text-xs transition-colors ${
                        isChecked
                          ? 'bg-blue-950/30 border-blue-500/60 text-slate-100'
                          : 'bg-slate-950 border-slate-800 text-slate-400'
                      }`}
                    >
                      <div>
                        <div className="font-semibold">{group.groupName}</div>
                        <div className="text-[11px] text-slate-500">{group.nodeCount} Active Nodes</div>
                      </div>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}}
                        className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-blue-600 focus:ring-blue-500"
                      />
                    </label>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-4">
          <button
            type="button"
            className="px-4 py-2 rounded-lg text-sm text-slate-400 hover:bg-slate-900 border border-slate-800 font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-5 py-2 rounded-lg text-sm bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-colors shadow-lg shadow-blue-600/20"
          >
            Deploy Route
          </button>
        </div>
      </form>
    </div>
  );
}