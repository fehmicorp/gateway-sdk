import { VRRPState } from '@/lib/types';

export function VRRPStatusBadge({ state }: { state: VRRPState }) {
  const styles = {
    MASTER: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    BACKUP: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    FAULT: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  };

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-mono font-bold border ${styles[state]}`}>
      ● {state}
    </span>
  );
}