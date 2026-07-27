'use client';

import { ACME_CHALLENGE_OPTIONS, ACME_PROVIDER_OPTIONS } from '@/lib/list';
import { AcmeChallengeType, AcmeProvider, CertProvisionType } from '@/lib/types';
import React, { useState } from 'react';


export default function CreateCertificateForm() {
  const [certType, setCertType] = useState<CertProvisionType>('certbot');
  const [acmeProvider, setAcmeProvider] = useState<AcmeProvider>('letsencrypt-prod');
  const [challengeType, setChallengeType] = useState<AcmeChallengeType>('http-01');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsGenerating(true);

    const formData = new FormData(e.currentTarget);

    const payload = {
      certName: formData.get('certName'),
      domains: (formData.get('domains') as string)?.split(',').map((d) => d.trim()),
      type: certType,
      certbotConfig:
        certType === 'certbot'
          ? {
              email: formData.get('email'),
              provider: acmeProvider,
              autoRenew: formData.get('autoRenew') === 'on',
              challengeType: challengeType,
            }
          : null,
      customFiles:
        certType === 'custom'
          ? {
              certFile: formData.get('certFile'),
              keyFile: formData.get('keyFile'),
            }
          : null,
    };

    console.log('Issuing/Saving Certificate:', payload);

    // TODO: Call backend API to trigger Certbot / save certificate
    // await generateCertificate(payload);

    setIsGenerating(false);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-6 text-slate-100"
    >
      {/* Header */}
      <div className="border-b border-slate-800 pb-3">
        <h2 className="text-xs uppercase font-bold text-cyan-400 tracking-wider font-mono">
          Certificate Manager
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Generate automated Let&apos;s Encrypt certificates using Certbot ACME or upload custom SSL keypairs for use across Gateways.
        </p>
      </div>

      {/* Friendly Certificate Label & Target Domain(s) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Certificate Friendly Name <span className="text-rose-400">*</span>
          </label>
          <input
            name="certName"
            required
            placeholder="e.g. api.example.com-cert"
            className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-500 font-mono"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Domains (Comma Separated) <span className="text-rose-400">*</span>
          </label>
          <input
            name="domains"
            required
            placeholder="api.example.com, *.example.com"
            className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-500 font-mono"
          />
        </div>
      </div>

      {/* Method Selection (Certbot vs Custom Upload) */}
      <div className="space-y-2">
        <label className="block text-xs font-semibold text-slate-300">
          Provisioning Method
        </label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setCertType('certbot')}
            className={`p-3 rounded-xl border text-xs font-medium text-left transition ${
              certType === 'certbot'
                ? 'bg-cyan-950/50 border-cyan-500 text-cyan-300'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
            }`}
          >
            <div className="font-bold">Automated Certbot (ACME)</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Auto-issue & renew via Let&apos;s Encrypt</div>
          </button>

          <button
            type="button"
            onClick={() => setCertType('custom')}
            className={`p-3 rounded-xl border text-xs font-medium text-left transition ${
              certType === 'custom'
                ? 'bg-cyan-950/50 border-cyan-500 text-cyan-300'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
            }`}
          >
            <div className="font-bold">Upload Custom Certificate</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Upload existing .crt and .key files</div>
          </button>
        </div>
      </div>

      {/* Certbot / ACME Settings */}
      {certType === 'certbot' && (
        <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-4">
          <span className="text-xs font-bold text-cyan-300 font-mono uppercase block">
            Certbot ACME Settings
          </span>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                ACME Email <span className="text-rose-400">*</span>
              </label>
              <input
                name="email"
                type="email"
                required={certType === 'certbot'}
                placeholder="sysadmin@example.com"
                className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                ACME Provider
              </label>
              <select
                name="acmeProvider"
                value={acmeProvider ?? ''}
                onChange={(e) => {
                  const val = e.target.value;
                  setAcmeProvider(val === '' ? null : (val as AcmeProvider));
                }}
                className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-500 font-mono"
              >
                {ACME_PROVIDER_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value} disabled={opt.value === ''}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Challenge Validation
              </label>
              <select
                name="challengeType"
                value={challengeType ?? ''}
                onChange={(e) => {
                  const val = e.target.value;
                  setChallengeType(val === '' ? null : (val as AcmeChallengeType));
                }}
                className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-500 font-mono"
              >
                {ACME_CHALLENGE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value} disabled={opt.value === ''}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="autoRenew"
              name="autoRenew"
              defaultChecked
              className="rounded border-slate-800 bg-slate-950 text-cyan-600 focus:ring-cyan-500 h-4 w-4"
            />
            <label htmlFor="autoRenew" className="text-xs text-slate-300 font-medium cursor-pointer">
              Enable Auto-Renewal via Cron background job (Every 60 days)
            </label>
          </div>
        </div>
      )}

      {/* Custom Keypair Upload */}
      {certType === 'custom' && (
        <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Certificate File (`.crt` / `.pem`) <span className="text-rose-400">*</span>
            </label>
            <input
              name="certFile"
              type="file"
              accept=".crt,.pem"
              required={certType === 'custom'}
              className="w-full text-xs text-slate-400 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-slate-800 file:text-slate-200 hover:file:bg-slate-700 cursor-pointer"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Private Key File (`.key`) <span className="text-rose-400">*</span>
            </label>
            <input
              name="keyFile"
              type="file"
              accept=".key"
              required={certType === 'custom'}
              className="w-full text-xs text-slate-400 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-slate-800 file:text-slate-200 hover:file:bg-slate-700 cursor-pointer"
            />
          </div>
        </div>
      )}

      {/* Submit Button */}
      <div className="pt-2 flex justify-end">
        <button
          type="submit"
          disabled={isGenerating}
          className="px-6 py-2.5 bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-semibold rounded-xl text-xs transition-all duration-150 flex items-center gap-2 shadow-lg shadow-cyan-900/20 active:scale-[0.98]"
        >
          {isGenerating ? (
            <>
              <span className="h-3.5 w-3.5 rounded-full border-2 border-white/20 border-t-white animate-spin" />
              <span>Issuing Certificate...</span>
            </>
          ) : (
            <span>Save & Generate Certificate</span>
          )}
        </button>
      </div>
    </form>
  );
}