import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Users, TrendingUp, UserCheck, Star, ArrowUpRight, ArrowDownRight,
  Eye, Plus, RefreshCw,
} from 'lucide-react';
import {
  AreaChart, Area, PieChart, Pie, Cell, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { leadsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/leads/StatusBadge';
import { SkeletonKPI } from '../components/ui/Skeleton';
import { formatDate, getStatusColor } from '../utils/helpers';
import toast from 'react-hot-toast';

const STATUS_COLORS = {
  New: '#60A5FA',
  Contacted: '#C084FC',
  Qualified: '#EAB308',
  Converted: '#4ADE80',
  Closed: '#94A3B8',
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="chart-tooltip">
      <p className="font-semibold mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color }}>
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  );
};

function KPICard({ title, value, icon: Icon, color, glow, change, loading }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (loading) return;
    let start = 0;
    const step = Math.ceil(value / 20);
    const timer = setInterval(() => {
      start += step;
      if (start >= value) {
        setDisplayValue(value);
        clearInterval(timer);
      } else {
        setDisplayValue(start);
      }
    }, 30);
    return () => clearInterval(timer);
  }, [value, loading]);

  if (loading) return <SkeletonKPI />;

  return (
    <div className="kpi-card">
      <div
        className="absolute top-0 right-0 w-32 h-32 rounded-full -translate-y-1/2 translate-x-1/2"
        style={{ background: color, opacity: 0.06 }}
      />
      <div className="flex items-start justify-between">
        <div>
          <p className="text-text-faint text-xs font-medium uppercase tracking-wider mb-2">
            {title}
          </p>
          <p className="text-4xl font-bold text-text-primary mb-1">{displayValue}</p>
          {change !== undefined && (
            <div
              className={`flex items-center gap-1 text-xs font-medium ${
                change >= 0 ? 'text-green-400' : 'text-red-400'
              }`}
            >
              {change >= 0 ? (
                <ArrowUpRight size={12} />
              ) : (
                <ArrowDownRight size={12} />
              )}
              {Math.abs(change)}% this month
            </div>
          )}
        </div>
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: color + '20' }}
        >
          <Icon size={22} style={{ color }} />
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await leadsAPI.getStats();
      setStats(res.data.stats);
    } catch {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const pieData = stats
    ? Object.entries(stats.statusCounts)
        .filter(([, v]) => v > 0)
        .map(([name, value]) => ({ name, value }))
    : [];

  const kpis = [
    { title: 'Total Leads', value: stats?.total || 0, icon: Users, color: '#3B82F6', change: 12 },
    { title: 'New Leads', value: stats?.statusCounts?.New || 0, icon: Plus, color: '#A855F7', change: 8 },
    { title: 'Contacted', value: stats?.statusCounts?.Contacted || 0, icon: UserCheck, color: '#F59E0B', change: -3 },
    { title: 'Converted', value: stats?.statusCounts?.Converted || 0, icon: Star, color: '#22C55E', change: 24 },
  ];

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold text-text-primary">
            {greeting()},{' '}
            <span className="text-gradient">
              {user?.name?.split(' ')[0] || 'Admin'}
            </span>
          </h2>
          <p className="text-text-muted text-sm mt-1">
            Here's what's happening with your leads today.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={fetchStats}
            className="btn-ghost"
            title="Refresh"
          >
            <RefreshCw size={16} />
          </button>
          <button
            className="btn-primary"
            onClick={() => navigate('/leads')}
          >
            <Plus size={16} />
            Add Lead
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => (
          <KPICard key={kpi.title} {...kpi} loading={loading} />
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Monthly Area Chart */}
        <div className="lg:col-span-2 glass-card p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-semibold text-text-primary">Monthly Leads</h3>
              <p className="text-xs text-text-faint mt-0.5">Last 12 months overview</p>
            </div>
            <TrendingUp size={18} className="text-accent" />
          </div>
          {loading ? (
            <div className="skeleton h-52 rounded-lg" />
          ) : (
            <ResponsiveContainer width="100%" height={210}>
              <AreaChart data={stats?.monthlyData || []} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
                <defs>
                  <linearGradient id="leadGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EAB308" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#EAB308" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E1E2E" vertical={false} />
                <XAxis
                  dataKey="month"
                  tick={{ fill: '#475569', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: '#475569', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="count"
                  name="Leads"
                  stroke="#EAB308"
                  strokeWidth={2.5}
                  fill="url(#leadGradient)"
                  dot={{ fill: '#EAB308', r: 3, strokeWidth: 0 }}
                  activeDot={{ r: 5, fill: '#EAB308' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Pie Chart */}
        <div className="glass-card p-6">
          <div className="mb-6">
            <h3 className="font-semibold text-text-primary">Status Distribution</h3>
            <p className="text-xs text-text-faint mt-0.5">Lead pipeline breakdown</p>
          </div>
          {loading ? (
            <div className="skeleton h-52 rounded-lg" />
          ) : (
            <>
              <ResponsiveContainer width="100%" height={170}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieData.map((entry) => (
                      <Cell
                        key={entry.name}
                        fill={STATUS_COLORS[entry.name]}
                        stroke="transparent"
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-col gap-1.5 mt-2">
                {pieData.map((entry) => (
                  <div key={entry.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ background: STATUS_COLORS[entry.name] }}
                      />
                      <span className="text-text-muted">{entry.name}</span>
                    </div>
                    <span className="font-semibold text-text-primary">{entry.value}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Source + Recent Leads */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Source Bar Chart */}
        <div className="glass-card p-6">
          <div className="mb-6">
            <h3 className="font-semibold text-text-primary">Lead Sources</h3>
            <p className="text-xs text-text-faint mt-0.5">Where leads come from</p>
          </div>
          {loading ? (
            <div className="skeleton h-48 rounded-lg" />
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart
                data={stats?.sourceCounts || []}
                layout="vertical"
                margin={{ top: 0, right: 10, left: 10, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#1E1E2E" horizontal={false} />
                <XAxis type="number" tick={{ fill: '#475569', fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} />
                <YAxis
                  type="category"
                  dataKey="source"
                  width={80}
                  tick={{ fill: '#94A3B8', fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => v.split(' ')[0]}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" name="Leads" fill="#EAB308" radius={[0, 4, 4, 0]} fillOpacity={0.8} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Recent Leads */}
        <div className="lg:col-span-2 glass-card overflow-hidden">
          <div className="flex items-center justify-between p-6 pb-4">
            <div>
              <h3 className="font-semibold text-text-primary">Recent Leads</h3>
              <p className="text-xs text-text-faint mt-0.5">Latest 5 incoming leads</p>
            </div>
            <Link
              to="/leads"
              className="text-xs text-accent hover:text-accent-hover transition-colors flex items-center gap-1"
            >
              View all <ArrowUpRight size={12} />
            </Link>
          </div>
          {loading ? (
            <div className="px-6 pb-6">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-3 py-3 border-b border-border/50">
                  <div className="skeleton w-9 h-9 rounded-full" />
                  <div className="flex-1 flex flex-col gap-1.5">
                    <div className="skeleton h-3 w-32" />
                    <div className="skeleton h-2.5 w-48" />
                  </div>
                  <div className="skeleton h-5 w-16 rounded-full" />
                </div>
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-y border-border">
                    <th className="text-left px-6 py-3 text-xs font-medium text-text-faint uppercase tracking-wider">Lead</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-text-faint uppercase tracking-wider hidden sm:table-cell">Source</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-text-faint uppercase tracking-wider">Status</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-text-faint uppercase tracking-wider hidden md:table-cell">Date</th>
                    <th className="px-6 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {(stats?.recentLeads || []).map((lead) => (
                    <tr key={lead._id} className="table-row">
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                            style={{ background: getStatusColor(lead.status) + '20', color: getStatusColor(lead.status) }}
                          >
                            {lead.name?.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-text-primary truncate max-w-[120px]">{lead.name}</p>
                            <p className="text-xs text-text-faint truncate max-w-[120px]">{lead.company || lead.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-3 hidden sm:table-cell">
                        <span className="text-xs text-text-muted">{lead.source}</span>
                      </td>
                      <td className="px-6 py-3">
                        <StatusBadge status={lead.status} />
                      </td>
                      <td className="px-6 py-3 hidden md:table-cell">
                        <span className="text-xs text-text-faint">{formatDate(lead.createdAt)}</span>
                      </td>
                      <td className="px-6 py-3">
                        <button
                          onClick={() => navigate(`/leads/${lead._id}`)}
                          className="p-1.5 rounded-lg text-text-faint hover:text-accent hover:bg-accent/10 transition-colors"
                        >
                          <Eye size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
