'use client';

import { bundleServer } from '@/lib/data';
import { LB_ALGORITHM_OPTIONS } from '@/lib/list';
import { LoadBalancingAlgorithm } from '@/lib/types';
import { useState } from 'react';

export default function CreateBundleServiceForm() {
  const [selectedServices, setSelectedServices] = useState<
    { serviceId: string; weight: number }[]
  >([{ serviceId: 'srv-1', weight: 100 }]);

  // VIP & Load Balancing States
  const [enableVip, setEnableVip] = useState<boolean>(false);
  const [lbAlgorithm, setLbAlgorithm] = useState<LoadBalancingAlgorithm>(null);
  const [stickySession, setStickySession] = useState<boolean>(false);

  // Policy Mapping States
  const [enablePolicyMapping, setEnablePolicyMapping] = useState<boolean>(false);
  const [selectedPolicyId, setSelectedPolicyId] = useState<string>('');

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const addServiceToBundle = () => {
    setSelectedServices([...selectedServices, { serviceId: '', weight: 100 }]);
  };

  const removeService = (index: number) => {
    setSelectedServices(selectedServices.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const payload = {
      bundleName: formData.get('bundleName'),
      lbAlgorithm,
      stickySession,
      virtualIp: enableVip
        ? {
            ip: formData.get('virtualIp'),
            vrid: formData.get('virtualRouterId'),
          }
        : null,
      members: selectedServices,
      policyId: enablePolicyMapping ? selectedPolicyId : null,
    };

    console.log('Saving Service Bundle:', payload);

    // TODO: Send payload to API / Server Action
    // await saveServiceBundle(payload);

    setIsSubmitting(false);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-6 text-slate-100"
    >
      {/* Header */}
      <div className="border-b border-slate-800 pb-3">
        <h2 className="text-xs uppercase font-bold text-indigo-400 tracking-wider font-mono">
          Step 2: Create Service Bundle
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Group existing services into a load-balanced pool with optional VIP and Policy Mapping.
        </p>
      </div>

      {/* Bundle Identifier Name & Load Balancing Strategy */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Bundle Identifier Name <span className="text-rose-400">*</span>
          </label>
          <input
            name="bundleName"
            required
            placeholder="e.g. auth-cluster-pool"
            className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500 font-mono"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Load Balancing Strategy
          </label>
          <select
            name="lbAlgorithm"
            value={lbAlgorithm ?? ''}
            onChange={(e) => {
              const val = e.target.value;
              setLbAlgorithm(val === '' ? null : (val as LoadBalancingAlgorithm));
            }}
            className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500 font-medium"
          >
            {LB_ALGORITHM_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value} disabled={opt.value === ''}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Virtual IP (VIP) Settings */}
      <div className="p-4 bg-slate-950/60 border border-slate-800/80 rounded-xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-200 block">
              Virtual IP (VIP) Configuration
            </span>
            <span className="text-[11px] text-slate-400">
              Assign a floating virtual IP for failover across this bundle.
            </span>
          </div>

          <label className="inline-flex items-center cursor-pointer gap-2">
            <input
              type="checkbox"
              checked={enableVip}
              onChange={(e) => setEnableVip(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-8 h-4 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-indigo-600 relative"></div>
            <span className="text-[10px] font-mono text-slate-400 uppercase">
              {enableVip ? 'Enabled' : 'Disabled'}
            </span>
          </label>
        </div>

        {enableVip && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-800/60">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Virtual IP Address <span className="text-rose-400">*</span>
              </label>
              <input
                name="virtualIp"
                required={enableVip}
                placeholder="10.10.10.100"
                className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Virtual Router ID (VRID)
              </label>
              <input
                name="virtualRouterId"
                type="number"
                defaultValue={51}
                placeholder="51"
                className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>
          </div>
        )}
      </div>

      {/* Selected Service Members */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs uppercase font-bold text-slate-400 font-mono">
            Bundle Target Members
          </label>
          <button
            type="button"
            onClick={addServiceToBundle}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-indigo-400 border border-slate-700 rounded-lg text-xs font-bold transition"
          >
            + Add Service to Bundle
          </button>
        </div>

        {selectedServices.map((item, idx) => (
          <div
            key={idx}
            className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center gap-3"
          >
            <select
              value={item.serviceId}
              required
              onChange={(e) => {
                const updated = [...selectedServices];
                updated[idx].serviceId = e.target.value;
                setSelectedServices(updated);
              }}
              className="flex-1 p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white font-mono focus:outline-none focus:border-indigo-500"
            >
              <option value="">-- Select Registered Service --</option>
              {bundleServer.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.ip}:{s.port})
                </option>
              ))}
            </select>

            <div className="flex items-center gap-1.5">
              <span className="text-xs text-slate-400 font-mono">Weight:</span>
              <input
                type="number"
                value={item.weight}
                min={1}
                max={100}
                onChange={(e) => {
                  const updated = [...selectedServices];
                  updated[idx].weight = parseInt(e.target.value) || 1;
                  setSelectedServices(updated);
                }}
                className="w-20 p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white font-mono focus:outline-none focus:border-indigo-500"
              />
            </div>

            {selectedServices.length > 1 && (
              <button
                type="button"
                onClick={() => removeService(idx)}
                className="p-2.5 text-slate-500 hover:text-rose-400 transition"
                title="Remove Member"
              >
                ✕
              </button>
            )}
          </div>
        ))}
      </div>
      {/* Session Affinity Option */}
      <div className="flex items-center gap-2 pt-1">
        <input
          type="checkbox"
          id="stickySession"
          checked={stickySession}
          onChange={(e) => setStickySession(e.target.checked)}
          className="rounded border-slate-800 bg-slate-950 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
        />
        <label htmlFor="stickySession" className="text-xs text-slate-300 font-medium cursor-pointer">
          Enable Sticky Sessions (Cookie / Session Persistence)
        </label>
      </div>

      {/* Submit Button */}
      <div className="pt-2 flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-semibold rounded-xl text-xs transition-all duration-150 flex items-center gap-2 shadow-lg shadow-indigo-900/20 active:scale-[0.98]"
        >
          {isSubmitting ? (
            <>
              <span className="h-3.5 w-3.5 rounded-full border-2 border-white/20 border-t-white animate-spin" />
              <span>Saving Service Bundle...</span>
            </>
          ) : (
            <span>Save Service Bundle</span>
          )}
        </button>
      </div>
    </form>
  );
}