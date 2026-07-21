import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Sparkles,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { generateAvatar } from '../../utils/helpers';
import toast from 'react-hot-toast';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard', exact: true },
  { to: '/leads', icon: Users, label: 'Leads' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export default function Sidebar({ collapsed, mobileOpen, sidebarWidth, onToggle, onClose }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 flex flex-col transition-all duration-300 ease-out ${
        mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      }`}
      style={{
        width: sidebarWidth,
        background: 'rgba(255, 255, 255, 0.92)',
        borderRight: '1px solid rgba(216, 224, 234, 0.9)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
      }}
    >
      {/* ── Logo / Branding ─────────────────────────────────────── */}
      <div
        className="flex items-center gap-3 border-b border-border/70 px-4 shrink-0"
        style={{ height: 72 }}
      >
        {/* Icon */}
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl text-white shadow-lg shadow-accent/20"
          style={{ background: 'linear-gradient(135deg, #0A84FF, #0560C9)' }}
        >
          <Sparkles size={18} className="text-white" />
        </div>

        {/* Brand text — hidden when collapsed */}
        {!collapsed && (
          <div className="animate-fade-in overflow-hidden min-w-0">
            <span className="text-base font-semibold tracking-tight text-text-primary block truncate">
              CRM <span className="text-gradient">Studio</span>
            </span>
            <p className="text-xs text-text-faint truncate">Lead management workspace</p>
          </div>
        )}

        {/* Mobile close button */}
        <button
          onClick={onClose}
          className="ml-auto inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border/80 bg-white text-text-muted shadow-sm transition-colors hover:text-text-primary md:hidden"
          aria-label="Close navigation"
        >
          <X size={16} />
        </button>
      </div>

      {/* ── Navigation links ────────────────────────────────────── */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 no-scrollbar">
        {navItems.map(({ to, icon: Icon, label, exact }) => (
          <NavLink
            key={to}
            to={to}
            end={exact}
            className={({ isActive }) =>
              `sidebar-link ${isActive ? 'active' : ''} ${collapsed ? 'justify-center px-2' : ''}`
            }
            title={collapsed ? label : undefined}
            onClick={() => mobileOpen && onClose?.()}
          >
            <Icon size={18} className="shrink-0" />
            {!collapsed && (
              <span className="animate-fade-in truncate">{label}</span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* ── Footer: user card + actions ─────────────────────────── */}
      <div className="shrink-0 border-t border-border/70 p-3 flex flex-col gap-2">
        {/* User info card */}
        <div
          className={`flex items-center gap-3 rounded-2xl border border-transparent p-2.5 transition-colors cursor-default hover:border-border/70 hover:bg-surface2/70 ${
            collapsed ? 'justify-center' : ''
          }`}
        >
          <div
            className="w-9 h-9 rounded-full flex shrink-0 items-center justify-center text-xs font-bold text-white"
            style={{ background: 'linear-gradient(135deg, #0A84FF, #0560C9)' }}
            title={user?.name}
          >
            {generateAvatar(user?.name)}
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0 animate-fade-in">
              <p className="text-sm font-medium text-text-primary truncate">
                {user?.name || 'Admin'}
              </p>
              <p className="text-xs text-text-faint truncate">{user?.email}</p>
            </div>
          )}
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className={`sidebar-link text-red-500 hover:text-red-600 hover:bg-red-50 ${
            collapsed ? 'justify-center px-2' : ''
          }`}
          title={collapsed ? 'Logout' : undefined}
        >
          <LogOut size={16} className="shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>

        {/* Collapse / expand toggle (desktop only) */}
        <button
          onClick={onToggle}
          className={`sidebar-link border border-border/70 bg-white shadow-sm hidden md:flex ${
            collapsed ? 'justify-center px-2' : ''
          }`}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? (
            <ChevronRight size={16} />
          ) : (
            <>
              <ChevronLeft size={16} />
              <span>Collapse</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
