import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Bell, LogOut, User, ChevronDown, Menu, Search, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { leadsAPI } from '../../services/api';
import { formatRelativeTime } from '../../utils/helpers';
import { generateAvatar } from '../../utils/helpers';
import toast from 'react-hot-toast';

const pageTitles = {
  '/': 'Dashboard',
  '/leads': 'Leads',
  '/settings': 'Settings',
};

export default function Navbar({ onMobileMenuToggle, sidebarWidth = 0 }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchValue, setSearchValue] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [recentLeads, setRecentLeads] = useState([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [notificationsFetched, setNotificationsFetched] = useState(false);

  const pageTitle = (() => {
    if (location.pathname.startsWith('/leads/')) return 'Lead Details';
    return pageTitles[location.pathname] || 'CRM Pro';
  })();

  const searchPlaceholder = useMemo(
    () =>
      location.pathname.startsWith('/leads')
        ? 'Search leads...'
        : 'Search leads...',
    [location.pathname]
  );

  useEffect(() => {
    if (location.pathname !== '/leads') {
      setSearchValue('');
      return;
    }
    const params = new URLSearchParams(location.search);
    setSearchValue(params.get('search') || '');
  }, [location.pathname, location.search]);

  // Fetch recent leads whenever the notifications panel opens (and hasn't been fetched yet)
  useEffect(() => {
    if (!notificationsOpen || notificationsFetched) return;

    let cancelled = false;
    const loadNotifications = async () => {
      setNotificationsLoading(true);
      try {
        const response = await leadsAPI.getAll({
          page: 1,
          limit: 5,
          sortBy: 'createdAt',
          sortOrder: 'desc',
        });
        if (cancelled) return;
        setRecentLeads(response.data.leads || []);
        setNotificationsFetched(true);
      } catch {
        if (!cancelled) toast.error('Failed to load recent activity');
      } finally {
        if (!cancelled) setNotificationsLoading(false);
      }
    };

    loadNotifications();
    return () => { cancelled = true; };
  }, [notificationsOpen, notificationsFetched]);

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    const query = searchValue.trim();
    const target = query ? `/leads?search=${encodeURIComponent(query)}` : '/leads';
    setNotificationsOpen(false);
    navigate(target);
  };

  const handleBellClick = () => {
    setDropdownOpen(false);
    const opening = !notificationsOpen;
    setNotificationsOpen(opening);
    // Reset so we re-fetch fresh data each time the panel is opened
    if (opening) {
      setRecentLeads([]);
      setNotificationsFetched(false);
    }
  };

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
    setDropdownOpen(false);
  };

  return (
    <>
      {/*
        Inject CSS so the fixed navbar always sits to the RIGHT of the sidebar.
        Using a <style> tag makes it react correctly to sidebarWidth state changes.
      */}
      <style>{`
        @media (min-width: 768px) {
          #app-navbar {
            left: ${sidebarWidth}px !important;
            width: calc(100% - ${sidebarWidth}px) !important;
          }
        }
      `}</style>

      <header
        id="app-navbar"
        className="fixed top-0 left-0 right-0 z-20 flex items-center justify-between gap-4 border-b border-border/80 px-4 py-0 transition-[left,width] duration-300 sm:px-6"
        style={{
          height: 72,
          background: 'rgba(243, 245, 247, 0.92)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
        }}
      >
        {/* ── Left: mobile hamburger + page title ─────────────── */}
        <div className="flex min-w-0 items-center gap-3 sm:gap-4">
          <button
            onClick={onMobileMenuToggle}
            className="md:hidden inline-flex h-10 w-10 items-center justify-center rounded-full border border-border/80 bg-white text-text-muted shadow-sm transition-colors hover:text-text-primary"
            aria-label="Open navigation"
          >
            <Menu size={20} />
          </button>

          <div className="min-w-0">
            <p className="hidden text-[11px] font-semibold uppercase tracking-[0.22em] text-text-faint sm:block">
              Premium CRM
            </p>
            <h1 className="truncate text-lg font-semibold tracking-tight text-text-primary sm:text-xl">
              {pageTitle}
            </h1>
            <p className="hidden text-xs text-text-faint sm:block">
              {new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>
        </div>

        {/* ── Right: search + notifications + user ────────────── */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Search bar — visible on lg+ */}
          <form onSubmit={handleSearchSubmit} className="hidden lg:block">
            <label className="flex items-center gap-2 rounded-full border border-border/80 bg-white px-4 py-2 shadow-sm transition-all duration-200 focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/15">
              <Search size={15} className="shrink-0 text-text-faint" />
              <input
                type="search"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-[200px] bg-transparent text-sm text-text-primary outline-none placeholder:text-text-faint"
              />
              {searchValue && (
                <button
                  type="button"
                  onClick={() => setSearchValue('')}
                  className="text-text-faint transition-colors hover:text-text-primary"
                  aria-label="Clear search"
                >
                  <X size={14} />
                </button>
              )}
            </label>
          </form>

          {/* Notification bell */}
          <div className="relative">
            <button
              onClick={handleBellClick}
              className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-border/80 bg-white text-text-faint shadow-sm transition-colors hover:text-text-primary"
              aria-label="Open notifications"
            >
              <Bell size={18} />
              <span
                className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full border-2 border-white"
                style={{ background: '#0A84FF' }}
              />
            </button>

            {/* Notifications dropdown */}
            {notificationsOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setNotificationsOpen(false)}
                />
                <div className="absolute right-0 top-[calc(100%+8px)] z-50 w-[340px] overflow-hidden rounded-3xl border border-border/80 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.14)] animate-slide-up">
                  <div className="border-b border-border/70 px-4 py-4">
                    <p className="text-sm font-semibold text-text-primary">Recent activity</p>
                    <p className="text-xs text-text-faint">Newest leads from your pipeline</p>
                  </div>
                  <div className="max-h-[320px] overflow-y-auto p-2">
                    {notificationsLoading ? (
                      <div className="space-y-2 p-2">
                        <div className="h-12 rounded-2xl bg-surface2 animate-pulse" />
                        <div className="h-12 rounded-2xl bg-surface2 animate-pulse" />
                        <div className="h-12 rounded-2xl bg-surface2 animate-pulse" />
                      </div>
                    ) : recentLeads.length === 0 ? (
                      <div className="px-3 py-8 text-center text-sm text-text-faint">
                        No recent leads available.
                      </div>
                    ) : (
                      recentLeads.map((lead) => (
                        <button
                          key={lead._id}
                          onClick={() => {
                            setNotificationsOpen(false);
                            navigate(`/leads/${lead._id}`);
                          }}
                          className="flex w-full items-start gap-3 rounded-2xl px-3 py-3 text-left transition-colors hover:bg-surface2"
                        >
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent/10 text-xs font-semibold text-accent">
                            {generateAvatar(lead.name)}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-text-primary">{lead.name}</p>
                            <p className="truncate text-xs text-text-faint">
                              {lead.company || lead.email}
                            </p>
                            <p className="mt-1 text-xs text-text-faint">
                              Added {formatRelativeTime(lead.createdAt)}
                            </p>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                  <div className="border-t border-border/70 p-2">
                    <button
                      onClick={() => {
                        setNotificationsOpen(false);
                        navigate('/leads');
                      }}
                      className="w-full rounded-2xl px-3 py-2 text-sm font-medium text-accent transition-colors hover:bg-accent/10"
                    >
                      View all leads
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* User dropdown */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 rounded-full border border-border/80 bg-white px-2 py-1.5 pr-3 shadow-sm transition-all duration-200 hover:border-border-light hover:shadow-md"
            >
              <div
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                style={{ background: 'linear-gradient(135deg, #0A84FF, #0560C9)' }}
              >
                {generateAvatar(user?.name)}
              </div>
              <span className="hidden text-sm font-medium text-text-primary sm:block">
                {user?.name?.split(' ')[0] || 'Admin'}
              </span>
              <ChevronDown
                size={14}
                className={`text-text-faint transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`}
              />
            </button>

            {dropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setDropdownOpen(false)}
                />
                <div className="absolute right-0 top-[calc(100%+8px)] z-50 w-64 overflow-hidden rounded-3xl border border-border/80 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.14)] animate-slide-up">
                  <div className="border-b border-border/70 bg-surface2/70 px-4 py-4">
                    <p className="text-sm font-semibold text-text-primary">{user?.name}</p>
                    <p className="truncate text-xs text-text-faint">{user?.email}</p>
                  </div>
                  <div className="p-2">
                    <button
                      onClick={() => { navigate('/settings'); setDropdownOpen(false); }}
                      className="flex w-full items-center gap-2 rounded-2xl px-3 py-2.5 text-sm text-text-muted transition-colors hover:bg-surface2 hover:text-text-primary"
                    >
                      <User size={15} />
                      Profile Settings
                    </button>
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2 rounded-2xl px-3 py-2.5 text-sm text-red-500 transition-colors hover:bg-red-50"
                    >
                      <LogOut size={15} />
                      Logout
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </header>
    </>
  );
}
