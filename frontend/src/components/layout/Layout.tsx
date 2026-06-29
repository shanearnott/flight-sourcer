import { NavLink, Outlet } from 'react-router-dom';
import { Plane, LayoutDashboard, Search, Bell, Settings, TrendingUp } from 'lucide-react';
import { cn } from '../../utils/cn';

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/searches', label: 'Searches', icon: Search },
  { to: '/history', label: 'Price History', icon: TrendingUp },
  { to: '/alerts', label: 'Alert Log', icon: Bell },
  { to: '/settings', label: 'Settings', icon: Settings },
];

export default function Layout() {
  return (
    <div className="min-h-screen bg-navy-900 flex">
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 bg-navy-950 border-r border-navy-700 flex flex-col">
        {/* Logo */}
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

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
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

        {/* Footer */}
        <div className="p-4 border-t border-navy-700">
          <div className="text-xs text-slate-600 text-center">
            Powered by Amadeus + Seat.aero
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
