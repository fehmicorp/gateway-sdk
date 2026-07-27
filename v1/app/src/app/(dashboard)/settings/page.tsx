'use client';

import React, { useState } from 'react';
import { 
  Key, 
  Code2, 
  Activity, 
  Radio, 
  Boxes, 
  CheckCircle2, 
  Copy, 
  Check, 
  Eye, 
  EyeOff, 
  RefreshCw, 
  Database, 
  HardDrive, 
  BellRing,
  Cpu,
  Layers
} from 'lucide-react';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'api' | 'telemetry' | 'integrations'>('api');

  // API Key State
  const [showKey, setShowKey] = useState(false);
  const [copiedSnippet, setCopiedSnippet] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState('gw_live_9f8a3b1c2d3e4f5a6b7c8d9e0f1a2b3c');

  // Telemetry Form State
  const [telemetryConfig, setTelemetryConfig] = useState({
    prometheusEnabled: true,
    prometheusPort: 9090,
    metricsPath: '/metrics',
    otelEndpoint: 'http://otel-collector.internal:4317',
    otelProtocol: 'grpc',
    logLevel: 'info',
    tracingSampleRate: 0.1, // 10%
  });

  // Integrations State
  const [integrations, setIntegrations] = useState({
    datadog: { enabled: true, apiKey: '••••••••••••••••3a1b' },
    redis: { enabled: true, host: 'redis.internal:6379' },
    s3: { enabled: false, bucket: 'gateway-audit-logs' },
    slack: { enabled: false, webhookUrl: '' },
  });

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSnippet(label);
    setTimeout(() => setCopiedSnippet(null), 2000);
  };

  const regenerateKey = () => {
    if (confirm('Regenerating your API key will revoke the existing key. Continue?')) {
      const newKey = 'gw_live_' + Array.from(crypto.getRandomValues(new Uint8Array(16)))
        .map(b => b.toString(16).padStart(2, '0')).join('');
      setApiKey(newKey);
    }
  };

  // Code Snippets for API Consumption
  const curlSnippet = `curl -X GET "https://api.gateway.internal/v1/routes" \\
  -H "Authorization: Bearer ${apiKey}" \\
  -H "Content-Type: application/json"`;

  const nodeSnippet = `import { GatewayClient } from '@fehmicorp/gateway-sdk';

const gateway = new GatewayClient({
  apiKey: '${apiKey}',
  endpoint: 'https://api.gateway.internal'
});

const routes = await gateway.routes.list();
console.log(routes);`;

  const pythonSnippet = `import requests

headers = {
    "Authorization": "Bearer ${apiKey}",
    "Content-Type": "application/json"
}

response = requests.get("https://api.gateway.internal/v1/routes", headers=headers)
print(response.json())`;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 lg:p-10">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Gateway Settings</h1>
          <p className="text-slate-400 mt-1">
            Manage administrative API access, telemetry instrumentation, and external platform integrations.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 space-x-8">
          <button
            onClick={() => setActiveTab('api')}
            className={`pb-4 flex items-center space-x-2 text-sm font-medium transition-colors border-b-2 ${
              activeTab === 'api'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Key className="w-4 h-4" />
            <span>API Access & Consumption</span>
          </button>

          <button
            onClick={() => setActiveTab('telemetry')}
            className={`pb-4 flex items-center space-x-2 text-sm font-medium transition-colors border-b-2 ${
              activeTab === 'telemetry'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>Telemetry & Observability</span>
          </button>

          <button
            onClick={() => setActiveTab('integrations')}
            className={`pb-4 flex items-center space-x-2 text-sm font-medium transition-colors border-b-2 ${
              activeTab === 'integrations'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Boxes className="w-4 h-4" />
            <span>Integrations</span>
          </button>
        </div>

        {/* TAB 1: API ACCESS & CONSUMPTION */}
        {activeTab === 'api' && (
          <div className="space-y-6">
            {/* API Key Credentials */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-white">Management API Key</h2>
                  <p className="text-sm text-slate-400">
                    Use this key to authenticate administrative requests to the Gateway Control Plane API.
                  </p>
                </div>
                <button
                  onClick={regenerateKey}
                  className="px-3 py-1.5 text-xs font-medium text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 rounded-lg transition-colors flex items-center space-x-1 border border-amber-500/20"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Regenerate Key</span>
                </button>
              </div>

              <div className="flex items-center space-x-2 bg-slate-950 border border-slate-800 rounded-lg p-3">
                <input
                  type={showKey ? 'text' : 'password'}
                  readOnly
                  value={apiKey}
                  className="bg-transparent text-slate-200 font-mono text-sm w-full outline-none"
                />
                <button
                  onClick={() => setShowKey(!showKey)}
                  className="text-slate-400 hover:text-slate-200 p-1 rounded"
                >
                  {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => handleCopy(apiKey, 'apiKey')}
                  className="text-slate-400 hover:text-slate-200 p-1 rounded"
                >
                  {copiedSnippet === 'apiKey' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* API Consumption Code Examples */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
              <div>
                <h2 className="text-lg font-semibold text-white flex items-center space-x-2">
                  <Code2 className="w-5 h-5 text-indigo-400" />
                  <span>API Usage Examples</span>
                </h2>
                <p className="text-sm text-slate-400">
                  Quickstart code snippets to consume and automate your gateway resources.
                </p>
              </div>

              <div className="space-y-4">
                {/* cURL */}
                <div>
                  <div className="flex justify-between items-center text-xs text-slate-400 mb-2">
                    <span className="font-semibold text-slate-300">cURL</span>
                    <button
                      onClick={() => handleCopy(curlSnippet, 'curl')}
                      className="flex items-center space-x-1 hover:text-white"
                    >
                      {copiedSnippet === 'curl' ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy Snippet</span>
                        </>
                      )}
                    </button>
                  </div>
                  <pre className="bg-slate-950 border border-slate-800 p-4 rounded-lg font-mono text-xs text-slate-300 overflow-x-auto">
                    {curlSnippet}
                  </pre>
                </div>

                {/* Node.js */}
                <div>
                  <div className="flex justify-between items-center text-xs text-slate-400 mb-2">
                    <span className="font-semibold text-slate-300">Node.js / TypeScript</span>
                    <button
                      onClick={() => handleCopy(nodeSnippet, 'node')}
                      className="flex items-center space-x-1 hover:text-white"
                    >
                      {copiedSnippet === 'node' ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy Snippet</span>
                        </>
                      )}
                    </button>
                  </div>
                  <pre className="bg-slate-950 border border-slate-800 p-4 rounded-lg font-mono text-xs text-slate-300 overflow-x-auto">
                    {nodeSnippet}
                  </pre>
                </div>

                {/* Python */}
                <div>
                  <div className="flex justify-between items-center text-xs text-slate-400 mb-2">
                    <span className="font-semibold text-slate-300">Python</span>
                    <button
                      onClick={() => handleCopy(pythonSnippet, 'python')}
                      className="flex items-center space-x-1 hover:text-white"
                    >
                      {copiedSnippet === 'python' ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy Snippet</span>
                        </>
                      )}
                    </button>
                  </div>
                  <pre className="bg-slate-950 border border-slate-800 p-4 rounded-lg font-mono text-xs text-slate-300 overflow-x-auto">
                    {pythonSnippet}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: TELEMETRY & OBSERVABILITY */}
        {activeTab === 'telemetry' && (
          <div className="space-y-6">
            {/* Prometheus Metrics */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-orange-500/10 text-orange-400 rounded-lg">
                    <Radio className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-white">Prometheus Metrics</h2>
                    <p className="text-sm text-slate-400">
                      Expose real-time gateway performance metrics for Prometheus scraping.
                    </p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={telemetryConfig.prometheusEnabled}
                    onChange={(e) =>
                      setTelemetryConfig({ ...telemetryConfig, prometheusEnabled: e.target.checked })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
              </div>

              {telemetryConfig.prometheusEnabled && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-800">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Scrape Port</label>
                    <input
                      type="number"
                      value={telemetryConfig.prometheusPort}
                      onChange={(e) =>
                        setTelemetryConfig({ ...telemetryConfig, prometheusPort: parseInt(e.target.value) || 0 })
                      }
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Metrics Endpoint Path</label>
                    <input
                      type="text"
                      value={telemetryConfig.metricsPath}
                      onChange={(e) =>
                        setTelemetryConfig({ ...telemetryConfig, metricsPath: e.target.value })
                      }
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* OpenTelemetry (OTel) Tracing */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">OpenTelemetry Tracing</h2>
                  <p className="text-sm text-slate-400">
                    Export distributed request traces to Jaeger, Zipkin, or OTel Collectors.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                <div className="md:col-span-2">
                  <label className="block text-xs text-slate-400 mb-1">OTel Collector Endpoint</label>
                  <input
                    type="text"
                    value={telemetryConfig.otelEndpoint}
                    onChange={(e) =>
                      setTelemetryConfig({ ...telemetryConfig, otelEndpoint: e.target.value })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Protocol</label>
                  <select
                    value={telemetryConfig.otelProtocol}
                    onChange={(e) =>
                      setTelemetryConfig({ ...telemetryConfig, otelProtocol: e.target.value })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 outline-none focus:border-indigo-500"
                  >
                    <option value="grpc">gRPC</option>
                    <option value="http/protobuf">HTTP (Protobuf)</option>
                    <option value="http/json">HTTP (JSON)</option>
                  </select>
                </div>
              </div>

              <div className="pt-2">
                <label className="block text-xs text-slate-400 mb-1">
                  Trace Sampling Ratio ({telemetryConfig.tracingSampleRate * 100}%)
                </label>
                <input
                  type="range"
                  min="0.01"
                  max="1.0"
                  step="0.01"
                  value={telemetryConfig.tracingSampleRate}
                  onChange={(e) =>
                    setTelemetryConfig({ ...telemetryConfig, tracingSampleRate: parseFloat(e.target.value) })
                  }
                  className="w-full accent-indigo-500 bg-slate-950 rounded-lg"
                />
              </div>
            </div>

            {/* Gateway Logging Level */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">Logging Level</h2>
                  <p className="text-sm text-slate-400">Configure stdout/stderr logging verbosity for the edge proxy engine.</p>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-3 pt-2">
                {['debug', 'info', 'warn', 'error'].map((level) => (
                  <button
                    key={level}
                    onClick={() => setTelemetryConfig({ ...telemetryConfig, logLevel: level })}
                    className={`py-2 px-4 rounded-lg border text-sm font-medium capitalize transition-colors ${
                      telemetryConfig.logLevel === level
                        ? 'border-indigo-500 bg-indigo-500/10 text-indigo-400'
                        : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end">
              <button className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm rounded-lg transition-colors shadow-lg shadow-indigo-600/20">
                Save Telemetry Settings
              </button>
            </div>
          </div>
        )}

        {/* TAB 3: INTEGRATIONS */}
        {activeTab === 'integrations' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Datadog */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2.5 bg-purple-500/10 text-purple-400 rounded-xl">
                      <Cpu className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">Datadog APM</h3>
                      <p className="text-xs text-slate-400">Forward metrics and trace events directly to Datadog.</p>
                    </div>
                  </div>
                  <span className={`px-2.5 py-1 text-xs rounded-full font-medium ${
                    integrations.datadog.enabled ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {integrations.datadog.enabled ? 'Connected' : 'Disabled'}
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  API Key: <code className="text-slate-300 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">{integrations.datadog.apiKey}</code>
                </p>
              </div>

              <button 
                onClick={() => setIntegrations({
                  ...integrations,
                  datadog: { ...integrations.datadog, enabled: !integrations.datadog.enabled }
                })}
                className="w-full py-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-xs font-medium text-slate-300 rounded-lg transition-colors"
              >
                {integrations.datadog.enabled ? 'Disable Integration' : 'Configure Integration'}
              </button>
            </div>

            {/* Redis Distributed Cache / Rate Limiter */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2.5 bg-red-500/10 text-red-400 rounded-xl">
                      <Database className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">Redis Central Store</h3>
                      <p className="text-xs text-slate-400">Distributed token bucket rate-limiting state sync.</p>
                    </div>
                  </div>
                  <span className={`px-2.5 py-1 text-xs rounded-full font-medium ${
                    integrations.redis.enabled ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {integrations.redis.enabled ? 'Active' : 'Disabled'}
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Host: <code className="text-slate-300 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">{integrations.redis.host}</code>
                </p>
              </div>

              <button 
                onClick={() => setIntegrations({
                  ...integrations,
                  redis: { ...integrations.redis, enabled: !integrations.redis.enabled }
                })}
                className="w-full py-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-xs font-medium text-slate-300 rounded-lg transition-colors"
              >
                {integrations.redis.enabled ? 'Reconfigure Connection' : 'Enable Redis'}
              </button>
            </div>

            {/* AWS S3 / MinIO Log Export */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2.5 bg-amber-500/10 text-amber-400 rounded-xl">
                      <HardDrive className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">S3 / MinIO Audit Sink</h3>
                      <p className="text-xs text-slate-400">Stream compressed access logs directly to object storage.</p>
                    </div>
                  </div>
                  <span className={`px-2.5 py-1 text-xs rounded-full font-medium ${
                    integrations.s3.enabled ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {integrations.s3.enabled ? 'Active' : 'Not Configured'}
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Target Bucket: <code className="text-slate-300 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">{integrations.s3.bucket}</code>
                </p>
              </div>

              <button 
                onClick={() => setIntegrations({
                  ...integrations,
                  s3: { ...integrations.s3, enabled: !integrations.s3.enabled }
                })}
                className="w-full py-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-xs font-medium text-slate-300 rounded-lg transition-colors"
              >
                {integrations.s3.enabled ? 'Disable S3 Sink' : 'Setup S3 Export'}
              </button>
            </div>

            {/* Webhook Notifications */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2.5 bg-blue-500/10 text-blue-400 rounded-xl">
                      <BellRing className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">Alert Webhooks</h3>
                      <p className="text-xs text-slate-400">Receive real-time alerts for backend downtime or SSL expirations.</p>
                    </div>
                  </div>
                  <span className={`px-2.5 py-1 text-xs rounded-full font-medium ${
                    integrations.slack.enabled ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {integrations.slack.enabled ? 'Active' : 'Disabled'}
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Target: <span className="text-slate-300 font-mono">Slack / Discord / Custom Endpoint</span>
                </p>
              </div>

              <button 
                onClick={() => setIntegrations({
                  ...integrations,
                  slack: { ...integrations.slack, enabled: !integrations.slack.enabled }
                })}
                className="w-full py-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-xs font-medium text-slate-300 rounded-lg transition-colors"
              >
                {integrations.slack.enabled ? 'Manage Webhooks' : 'Add Webhook Target'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}