'use client';

import { PROTOCOL_OPTIONS } from '@/lib/list';
import { Protocols } from '@/lib/types';
import { useState } from 'react';

export default function CreateServiceForm() {
  const [protocol, setProtocol] = useState<Protocols>(null);
  const [healthCheckEnabled, setHealthCheckEnabled] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const payload = {
      serviceName: formData.get('serviceName'),
      targetIp: formData.get('targetIp'),
      targetPort: Number(formData.get('targetPort')),
      protocol,
      healthCheckEnabled,
      healthCheckPath: healthCheckEnabled ? formData.get('healthCheckPath') : null,
    };

    console.log('Saving Standalone Service:', payload);

    // TODO: Send payload to your API endpoint or Server Action here
    // await createService(payload);

    setIsSubmitting(false);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-5 text-slate-100"
    >
      <div className="border-b border-slate-800 pb-3">
        <h2 className="text-xs uppercase font-bold text-blue-400 tracking-wider font-mono">
          Create Standalone Service
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Define target address, protocol specifications, and health endpoints.
        </p>
      </div>

      {/* Row 1: Service Name, Target IP, Target Port */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Service Name */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Service Name <span className="text-rose-400">*</span>
          </label>
          <input
            name="serviceName"
            required
            placeholder="e.g. auth-api-service"
            className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500 font-mono"
          />
        </div>

        {/* Target IP Address */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Target IP / Hostname <span className="text-rose-400">*</span>
          </label>
          <input
            name="targetIp"
            required
            placeholder="10.10.10.1"
            className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500 font-mono"
          />
        </div>

        {/* Target Port */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Target Port <span className="text-rose-400">*</span>
          </label>
          <input
            name="targetPort"
            type="number"
            required
            defaultValue={8080}
            placeholder="8080"
            className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500 font-mono"
          />
        </div>
      </div>

      {/* Row 2: Protocol Mode & Health Check */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Protocol Mode */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Backend Protocol Mode
          </label>
          <select
            name="protocol"
            value={protocol ?? ''}
            onChange={(e) => {
              const val = e.target.value;
              setProtocol(val === '' ? null : (val as Protocols));
            }}
            className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500 font-medium"
          >
            {PROTOCOL_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value} disabled={opt.value === ''}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Health Check Controls */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-semibold text-slate-300">
              Health Check Endpoint
            </label>
            {/* Toggle Switch */}
            <label className="inline-flex items-center cursor-pointer gap-1.5">
              <input
                type="checkbox"
                name="healthCheckEnabled"
                checked={healthCheckEnabled}
                onChange={(e) => setHealthCheckEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-8 h-4 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-blue-600 relative"></div>
              <span className="text-[10px] font-mono text-slate-400 uppercase">
                {healthCheckEnabled ? 'Enabled' : 'Disabled'}
              </span>
            </label>
          </div>

          <input
            name="healthCheckPath"
            disabled={!healthCheckEnabled}
            defaultValue="/health"
            placeholder="/health"
            className={`w-full p-2.5 bg-slate-950 border rounded-xl text-sm font-mono focus:outline-none transition ${
              healthCheckEnabled
                ? 'border-slate-800 text-white focus:border-blue-500'
                : 'border-slate-800/40 text-slate-600 cursor-not-allowed bg-slate-950/50'
            }`}
          />
        </div>
      </div>

      {/* Action Footer */}
      <div className="pt-2 flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-semibold rounded-xl text-xs transition-all duration-150 flex items-center gap-2 shadow-lg shadow-blue-900/20 active:scale-[0.98]"
        >
          {isSubmitting ? (
            <>
              <span className="h-3.5 w-3.5 rounded-full border-2 border-white/20 border-t-white animate-spin" />
              <span>Saving Service...</span>
            </>
          ) : (
            <span>Save Standalone Service</span>
          )}
        </button>
      </div>
    </form>
  );
}