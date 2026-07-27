import { VRRPStatusBadge } from '@/components/badge/vip';
import { NodeCard } from '@/components/cards/node';
import Link from 'next/link';
import { GatewayNode } from '@/lib/types';

async function getClusterState(): Promise<{ vip: string; nodes: GatewayNode[] }> {
  // Fetch real-time metrics from your Go control plane
  const res = await fetch(`${process.env.GO_BACKEND_URL}/api/v1/cluster`, {
    next: { revalidate: 3 }, // Polls / revalidates every 3s
  });

  if (!res.ok) {
    // Fallback Mock Data for Development
    return {
      vip: '192.168.1.100',
      nodes: [
        {
          id: 'gw-1',
          name: 'FC-UPE-GW01',
          ip: '192.168.1.10',
          vrrpState: 'MASTER',
          vrrpPriority: 101,
          dataPlaneApiStatus: 'online',
          activeConnections: 1240,
          cpuUsage: 12.4,
          memoryUsage: 34.1,
        },
        {
          id: 'gw-2',
          name: 'FC-UPE-GW02',
          ip: '192.168.1.11',
          vrrpState: 'BACKUP',
          vrrpPriority: 100,
          dataPlaneApiStatus: 'online',
          activeConnections: 0,
          cpuUsage: 4.1,
          memoryUsage: 31.8,
        },
      ],
    };
  }

  return res.json();
}

export default async function DashboardPage() {
  const { vip, nodes } = await getClusterState();

  return (
    <div className="p-6 space-y-6 bg-slate-950 text-slate-100 min-h-screen">
      {/* Top Banner: Virtual IP Status */}
      <div className="flex items-center justify-between p-6 bg-slate-900 border border-slate-800 rounded-xl shadow-md">
        <div>
          <span className="text-xs uppercase tracking-wider text-slate-400 font-bold">
            Virtual IP (fehmi_ha-vrrp)
          </span>
          <h1 className="text-3xl font-mono font-extrabold text-blue-400">{vip}</h1>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="/services/new"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 font-semibold rounded-lg text-sm transition"
          >
            + Add New Service
          </Link>
        </div>
      </div>

      {/* Gateway Cluster Nodes Grid */}
      <div>
        <h2 className="text-lg font-bold text-slate-300 mb-4">Active Gateway Instances</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {nodes.map((node) => (
            <NodeCard key={node.id} node={node} />
          ))}
        </div>
      </div>
    </div>
  );
}