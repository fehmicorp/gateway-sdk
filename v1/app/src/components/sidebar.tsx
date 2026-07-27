'use client';

import { SIDEBAR_ITEMS } from "@/lib/list";
import { SidebarKey } from "@/lib/types";
import Link from 'next/link';
import { usePathname } from "next/navigation";


interface SidebarProps {
  onSelectKey?: (key: SidebarKey) => void;
}

export default function SidebarNav({ onSelectKey }: SidebarProps) {
  const pathname = usePathname();

  return (
    <nav className="space-y-1 text-sm font-medium">
      {SIDEBAR_ITEMS.map((item) => {
        // Active state check handles exact match for root '/' and prefix match for subroutes
        const isActive =
          item.href === '/'
            ? pathname === '/'
            : pathname === item.href || pathname.startsWith(`${item.href}/`);

        return (
          <Link
            key={item.key}
            href={item.href}
            onClick={() => onSelectKey?.(item.key)}
            className={`flex items-center gap-3 px-3 py-2 rounded-xl transition ${
              isActive
                ? 'bg-blue-600 text-white font-semibold shadow-md shadow-blue-950/40'
                : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-100'
            }`}
          >
            <span className="text-base">{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}