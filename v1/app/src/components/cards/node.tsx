import { GatewayNode } from '@/lib/types';
import { VRRPStatusBadge } from '@/components/badge/vip';

export function NodeCard({ node }: { node: GatewayNode }) {
  return (
    <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl space-y-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-lg text-white">{node.name}</h3>
          <p className="text-sm font-mono text-slate-400">{node.ip}</p>
        </div>
        <VRRPStatusBadge state={node.vrrpState} />
      </div>

      <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800 text-center">
        <div className="bg-slate-950 p-2 rounded-lg">
          <span className="text-xs text-slate-500 block">Connections</span>
          <span className="font-mono font-bold text-slate-200">{node.activeConnections}</span>
        </div>
        <div className="bg-slate-950 p-2 rounded-lg">
          <span className="text-xs text-slate-500 block">CPU Load</span>
          <span className="font-mono font-bold text-slate-200">{node.cpuUsage}%</span>
        </div>
        <div className="bg-slate-950 p-2 rounded-lg">
          <span className="text-xs text-slate-500 block">RAM Usage</span>
          <span className="font-mono font-bold text-slate-200">{node.memoryUsage}%</span>
        </div>
      </div>
    </div>
  );
}