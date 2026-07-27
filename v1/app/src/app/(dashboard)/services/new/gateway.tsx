'use client';

import { mockSavedCertificates, mockUpstreamTargets } from '@/lib/data';
import { PROTOCOL_OPTIONS } from '@/lib/list';
import { Protocols, SavedCertificate, UpstreamTarget } from '@/lib/types';
import React, { useState } from 'react';

export default function CreateGatewayForm() {
  const [protocol, setProtocol] = useState<Protocols | null>('https');
  const [selectedCertId, setSelectedCertId] = useState<string>('cert-1');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const isTlsEnabled = protocol === 'https' || protocol === 'wss' || protocol === 'grpc';

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);

    const payload = {
      gatewayName: formData.get('gatewayName') as string,
      domainName: formData.get('domainName') as string,
      protocol,
      certificateId: isTlsEnabled ? selectedCertId : null,
      upstreamTargetId: formData.get('upstreamTargetId') as string,
      enableHsts: formData.get('enableHsts') === 'on',
      forceSslRedirect: formData.get('forceSslRedirect') === 'on',
    };

    console.log('Saving Gateway Configuration:', payload);

    // TODO: Send payload to API / Server Action
    // await createGateway(payload);

    setIsSubmitting(false);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-6 text-slate-100"
    >
      {/* Header */}
      <div className="border-b border-slate-800 pb-3">
        <h2 className="text-xs uppercase font-bold text-emerald-400 tracking-wider font-mono">
          Step 3: Create Gateway & Reverse Proxy
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Expose upstream bundles or services via custom domain names, entrypoint protocols, and saved TLS certificates.
        </p>
      </div>

      {/* Gateway Identifier & Domain Name */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Gateway Identifier Name <span className="text-rose-400">*</span>
          </label>
          <input
            name="gatewayName"
            required
            placeholder="e.g. main-api-gateway"
            className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500 font-mono"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Primary Domain Name <span className="text-rose-400">*</span>
          </label>
          <input
            name="domainName"
            required
            placeholder="api.example.com"
            className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500 font-mono"
          />
        </div>
      </div>

      {/* Entrypoint Protocol & Upstream Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Entrypoint Protocol
          </label>
          <select
            name="protocol"
            value={protocol ?? ''}
            onChange={(e) => {
              const val = e.target.value;
              setProtocol(val === '' ? null : (val as Protocols));
            }}
            className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500 font-medium cursor-pointer"
          >
            {PROTOCOL_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value} disabled={opt.value === ''}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Upstream Target Service / Bundle <span className="text-rose-400">*</span>
          </label>
          <select
            name="upstreamTargetId"
            required
            defaultValue=""
            className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500 font-mono cursor-pointer"
          >
            <option value="" disabled>-- Choose Target Upstream --</option>
            {mockUpstreamTargets.map((t) => (
              <option key={t.id} value={t.id}>
                [{t.type}] {t.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Certificate Dropdown Selection (Visible if TLS Protocol is used) */}
      {isTlsEnabled && (
        <div className="p-4 bg-slate-950 border border-slate-800/90 rounded-xl space-y-2 transition-all">
          <label className="block text-xs font-semibold text-slate-300">
            Select SSL/TLS Certificate <span className="text-rose-400">*</span>
          </label>
          <select
            value={selectedCertId}
            onChange={(e) => setSelectedCertId(e.target.value)}
            required={isTlsEnabled}
            className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white font-mono focus:outline-none focus:border-emerald-500 cursor-pointer"
          >
            <option value="" disabled>-- Select Saved Certificate --</option>
            {mockSavedCertificates.map((cert) => (
              <option key={cert.id} value={cert.id}>
                {cert.name} ({cert.issuer})
              </option>
            ))}
          </select>
          <p className="text-[11px] text-slate-400">
            Don&apos;t see your certificate? Generate or upload a new one in the Certificate Manager.
          </p>
        </div>
      )}

      {/* Security Flags */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 pt-1">
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="forceSslRedirect"
            name="forceSslRedirect"
            defaultChecked
            className="rounded border-slate-800 bg-slate-950 text-emerald-600 focus:ring-emerald-500 h-4 w-4 cursor-pointer"
          />
          <label htmlFor="forceSslRedirect" className="text-xs text-slate-300 font-medium cursor-pointer select-none">
            Force HTTP to HTTPS Redirect
          </label>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="enableHsts"
            name="enableHsts"
            defaultChecked
            className="rounded border-slate-800 bg-slate-950 text-emerald-600 focus:ring-emerald-500 h-4 w-4 cursor-pointer"
          />
          <label htmlFor="enableHsts" className="text-xs text-slate-300 font-medium cursor-pointer select-none">
            Enable HSTS Header Injection
          </label>
        </div>
      </div>

      {/* Save Button */}
      <div className="pt-2 flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-semibold rounded-xl text-xs transition-all duration-150 flex items-center gap-2 shadow-lg shadow-emerald-900/20 active:scale-[0.98]"
        >
          {isSubmitting ? (
            <>
              <span className="h-3.5 w-3.5 rounded-full border-2 border-white/20 border-t-white animate-spin" />
              <span>Provisioning Gateway...</span>
            </>
          ) : (
            <span>Provision API Gateway</span>
          )}
        </button>
      </div>
    </form>
  );
}