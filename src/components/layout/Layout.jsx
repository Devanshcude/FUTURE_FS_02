import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

export const SIDEBAR_EXPANDED_W = 260;
export const SIDEBAR_COLLAPSED_W = 72;
export const NAVBAR_H = 72;

export default function Layout({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  if (loading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-accent border-t-transparent animate-spin" />
          <p className="text-text-muted text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const sidebarW = collapsed ? SIDEBAR_COLLAPSED_W : SIDEBAR_EXPANDED_W;

  return (
    <div className="min-h-screen bg-bg text-text-primary">
      {/*
        Inject a CSS rule that shifts #layout-content by the current sidebar width
        on desktop. Using a <style> tag keeps SSR-safe and responds to state changes.
      */}
      <style>{`
        @media (min-width: 768px) {
          #layout-content {
            margin-left: ${sidebarW}px;
          }
        }
      `}</style>

      {/* Decorative blobs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden -z-10">
        <div className="absolute -top-32 left-1/4 h-72 w-72 rounded-full bg-accent/10 blur-3xl" />
        <div className="absolute top-40 -right-16 h-96 w-96 rounded-full bg-slate-900/5 blur-3xl" />
      </div>

      {/* ── Sidebar ─────────────────────────────────────────────── */}
      <Sidebar
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        sidebarWidth={sidebarW}
        onToggle={() => setCollapsed((c) => !c)}
        onClose={() => setMobileOpen(false)}
      />

      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-slate-950/30 backdrop-blur-sm md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ── Main content column ─────────────────────────────────── */}
      <div
        id="layout-content"
        className="flex min-h-screen flex-col transition-[margin-left] duration-300"
      >
        {/* Navbar sits fixed at top; its left/width is managed inside Navbar.jsx */}
        <Navbar
          onMobileMenuToggle={() => setMobileOpen(true)}
          sidebarWidth={sidebarW}
        />

        {/* Page content — padded below the fixed navbar */}
        <main
          className="relative flex-1 px-4 pb-8 sm:px-6 lg:px-8 animate-fade-in"
          style={{ paddingTop: NAVBAR_H + 20 }}
        >
          <div className="mx-auto w-full max-w-[1600px]">{children}</div>
        </main>
      </div>
    </div>
  );
}
