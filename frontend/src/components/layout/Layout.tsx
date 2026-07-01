import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { Plane, LayoutDashboard, Search, Bell, Settings, TrendingUp, List, Menu, X } from 'lucide-react';
import { cn } from '../../utils/cn';

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/searches', label: 'Searches', icon: Search },
  { to: '/flights', label: 'All Flights', icon: List },
  { to: '/history', label: 'Price History', icon: TrendingUp },
  { to: '/alerts', label: 'Alert Log', icon: Bell },
  { to: '/settings', label: 'Settings', icon: Settings },
];

function NavItems({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav className="flex-1 p-4 space-y-1">
      {navItems.map(({ to, label, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          onClick={onNavigate}
          className={({ isActive }) =>
            cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
              isActive
                ? 'bg-brand-500/15 text-brand-400 border border-brand-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-navy-700'
            )
          }
        >
          <Icon className="w-4 h-4 flex-shrink-0" />
          {label}
        </NavLink>
      ))}
    </nav>
  );
}

export default function Layout() {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className="min-h-screen bg-navy-900 flex">
      {/* ── Desktop sidebar ── */}
      <aside className="hidden md:flex w-64 flex-shrink-0 bg-navy-950 border-r border-navy-700 flex-col">
        <div className="p-6 border-b border-navy-700">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-brand-500/20 rounded-xl flex items-center justify-center border border-brand-500/30">
              <Plane className="w-5 h-5 text-brand-400" />
            </div>
            <div>
              <div className="font-bold text-white text-base leading-none">FlightSourcer</div>
              <div className="text-xs text-slate-500 mt-0.5">Price Intelligence</div>
            </div>
          </div>
        </div>
        <NavItems />
        <div className="p-4 border-t border-navy-700">
          <div className="text-xs text-slate-600 text-center">Powered by SerpApi + Seat.aero</div>
        </div>
      </aside>

      {/* ── Mobile overlay ── */}
      {drawerOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 md:hidden"
          onClick={() => setDrawerOpen(false)}
        />
      )}

      {/* ── Mobile drawer ── */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-72 bg-navy-950 border-r border-navy-700 flex flex-col transition-transform duration-300 md:hidden',
          drawerOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="p-5 border-b border-navy-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-brand-500/20 rounded-xl flex items-center justify-center border border-brand-500/30">
              <Plane className="w-5 h-5 text-brand-400" />
            </div>
            <div>
              <div className="font-bold text-white text-base leading-none">FlightSourcer</div>
              <div className="text-xs text-slate-500 mt-0.5">Price Intelligence</div>
            </div>
          </div>
          <button
            onClick={() => setDrawerOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-navy-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <NavItems onNavigate={() => setDrawerOpen(false)} />
        <div className="p-4 border-t border-navy-700">
          <div className="text-xs text-slate-600 text-center">Powered by SerpApi + Seat.aero</div>
        </div>
      </aside>

      {/* ── Main column ── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile top bar */}
        <header className="md:hidden sticky top-0 z-30 flex items-center gap-3 px-4 h-14 bg-navy-950 border-b border-navy-700 flex-shrink-0">
          <button
            onClick={() => setDrawerOpen(true)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-navy-700 transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <Plane className="w-4 h-4 text-brand-400" />
            <span className="font-bold text-white text-sm">FlightSourcer</span>
          </div>
        </header>

        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
