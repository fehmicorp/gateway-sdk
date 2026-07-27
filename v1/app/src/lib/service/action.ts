'use server';

import { revalidatePath } from 'next/cache';

const GO_BACKEND_URL = process.env.GO_BACKEND_URL || 'http://localhost:8080';

export interface BackendServerPayload {
  id?: string;
  ip: string;
  port: number;
  weight: number;
}

export async function createEdgeService(formData: FormData) {
  try {
    const serviceName = formData.get('serviceName') as string;
    const domain = formData.get('domain') as string;
    const protocol = (formData.get('protocol') as string) || 'http';
    const incomingPort = parseInt(formData.get('incomingPort') as string) || 80;
    const balanceAlgorithm = (formData.get('balanceAlgorithm') as string) || 'roundrobin';
    const healthCheckPath = formData.get('healthCheckPath') as string;

    // Parse the multi-server array passed via JSON string from the client
    const serversRaw = formData.get('serversJson') as string;
    let parsedServers: BackendServerPayload[] = [];

    if (serversRaw) {
      parsedServers = JSON.parse(serversRaw);
    } else {
      // Fallback for legacy single-target forms
      const legacyIp = formData.get('targetIp') as string;
      const legacyPort = parseInt(formData.get('targetPort') as string) || 8080;
      if (legacyIp) {
        parsedServers = [{ ip: legacyIp, port: legacyPort, weight: 100 }];
      }
    }

    if (parsedServers.length === 0) {
      return { error: 'At least one backend server target is required.' };
    }

    // Construct the structured payload for the Go DataPlane/Keepalived Engine
    const payload = {
      name: serviceName,
      domain: domain || null,
      protocol,
      incomingPort,
      balance: balanceAlgorithm,
      healthCheck: healthCheckPath || null,
      servers: parsedServers.map((server, idx) => ({
        name: `${serviceName}-srv-${idx + 1}`,
        address: server.ip,
        port: server.port,
        weight: server.weight || 100,
        check: 'enabled',
      })),
    };

    const res = await fetch(`${GO_BACKEND_URL}/api/v1/services`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const err = await res.text();
      return { error: `Failed to create service: ${err}` };
    }

    revalidatePath('/services');
    revalidatePath('/');
    return { success: true };
  } catch (err: any) {
    return { error: err?.message || 'Failed to process request payload.' };
  }
}

// Toggle Drain state on a backend node for maintenance
export async function toggleNodeDrain(serviceName: string, serverName: string, drain: boolean) {
  const res = await fetch(`${GO_BACKEND_URL}/api/v1/services/${serviceName}/servers/${serverName}/drain`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ state: drain ? 'drain' : 'ready' }),
  });

  if (!res.ok) throw new Error('Failed to update node state');
  revalidatePath('/services');
  revalidatePath('/');
}