import React, { useState } from 'react';
import {
  User, Lock, Bell, Monitor, Save, Eye, EyeOff,
  CheckCircle2, Shield, Sliders,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import { generateAvatar, getErrorMessage } from '../utils/helpers';
import toast from 'react-hot-toast';

const TABS = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'preferences', label: 'Preferences', icon: Sliders },
];

function PasswordStrength({ password }) {
  const checks = [
    { label: 'At least 6 characters', pass: password.length >= 6 },
    { label: 'Contains number', pass: /\d/.test(password) },
    { label: 'Contains uppercase', pass: /[A-Z]/.test(password) },
    { label: 'Contains special char', pass: /[!@#$%^&*]/.test(password) },
  ];
  const score = checks.filter((c) => c.pass).length;
  const colors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-500'];
  const labels = ['Weak', 'Fair', 'Good', 'Strong'];

  if (!password) return null;

  return (
    <div className="mt-2">
      <div className="flex gap-1 mb-2">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-colors ${
              i < score ? colors[score - 1] : 'bg-surface3'
            }`}
          />
        ))}
      </div>
      <p className="text-xs text-text-faint">{labels[score - 1] || 'Very weak'}</p>
    </div>
  );
}

export default function Settings() {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');

  // Profile form
  const [profile, setProfile] = useState({ name: user?.name || '', email: user?.email || '' });
  const [savingProfile, setSavingProfile] = useState(false);

  // Password form
  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });
  const [showPasswords, setShowPasswords] = useState({ current: false, new: false, confirm: false });
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState({});

  // Preferences
  const [prefs, setPrefs] = useState({ notifications: true, itemsPerPage: 10, defaultView: 'table' });

  const handleSaveProfile = async () => {
    if (!profile.name.trim()) { toast.error('Name is required'); return; }
    if (!profile.email.trim() || !/\S+@\S+\.\S+/.test(profile.email)) {
      toast.error('Valid email is required');
      return;
    }
    setSavingProfile(true);
    try {
      const res = await authAPI.updateProfile(profile);
      updateUser(res.data.user);
      toast.success('Profile updated successfully');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSavePassword = async () => {
    const errs = {};
    if (!passwords.current) errs.current = 'Current password required';
    if (!passwords.new || passwords.new.length < 6) errs.new = 'New password must be at least 6 characters';
    if (passwords.new !== passwords.confirm) errs.confirm = 'Passwords do not match';
    if (Object.keys(errs).length > 0) { setPasswordErrors(errs); return; }
    setPasswordErrors({});

    setSavingPassword(true);
    try {
      await authAPI.changePassword({ currentPassword: passwords.current, newPassword: passwords.new });
      setPasswords({ current: '', new: '', confirm: '' });
      toast.success('Password changed successfully');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSavingPassword(false);
    }
  };

  const toggleShowPassword = (field) =>
    setShowPasswords((s) => ({ ...s, [field]: !s[field] }));

  const PasswordInput = ({ field, label, placeholder, error }) => (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-text-muted">{label}</label>
      <div className="relative">
        <input
          type={showPasswords[field] ? 'text' : 'password'}
          className={`input-field pr-10 ${error ? 'input-field-error' : ''}`}
          placeholder={placeholder}
          value={passwords[field]}
          onChange={(e) => setPasswords((p) => ({ ...p, [field]: e.target.value }))}
        />
        <button
          type="button"
          onClick={() => toggleShowPassword(field)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-text-faint hover:text-text-muted transition-colors"
        >
          {showPasswords[field] ? <EyeOff size={15} /> : <Eye size={15} />}
        </button>
      </div>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-5 animate-fade-in">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-text-primary">Settings</h2>
        <p className="text-text-faint text-sm mt-1">Manage your account and preferences</p>
      </div>

      <div className="flex gap-5 flex-col sm:flex-row">
        {/* Tab nav */}
        <div className="sm:w-48 flex sm:flex-col gap-1 overflow-x-auto no-scrollbar">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`sidebar-link text-sm flex-shrink-0 ${activeTab === id ? 'active' : ''}`}
            >
              <Icon size={16} />
              {label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="flex-1 min-w-0">
          {activeTab === 'profile' && (
            <div className="glass-card p-6 animate-fade-in">
              <h3 className="font-semibold text-text-primary mb-6">Profile Information</h3>

              {/* Avatar */}
              <div className="flex items-center gap-5 mb-6 p-4 rounded-lg bg-surface2 border border-border">
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg, #EAB308, #CA8A04)', color: '#0A0A0F' }}
                >
                  {generateAvatar(user?.name)}
                </div>
                <div>
                  <p className="font-semibold text-text-primary text-lg">{user?.name}</p>
                  <p className="text-text-faint text-sm">{user?.email}</p>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                    <span className="text-xs text-green-400 capitalize">{user?.role}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-text-muted">Full Name</label>
                  <input
                    className="input-field"
                    value={profile.name}
                    onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))}
                    placeholder="Your full name"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-text-muted">Email Address</label>
                  <input
                    type="email"
                    className="input-field"
                    value={profile.email}
                    onChange={(e) => setProfile((p) => ({ ...p, email: e.target.value }))}
                    placeholder="your@email.com"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-text-muted">Role</label>
                  <input className="input-field opacity-50 cursor-not-allowed" value={user?.role || 'admin'} readOnly />
                </div>
                <div className="flex justify-end pt-2">
                  <button className="btn-primary" onClick={handleSaveProfile} disabled={savingProfile}>
                    <Save size={15} />
                    {savingProfile ? 'Saving...' : 'Save Profile'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="glass-card p-6 animate-fade-in">
              <h3 className="font-semibold text-text-primary mb-2">Change Password</h3>
              <p className="text-text-faint text-sm mb-6">Use a strong password to keep your account secure.</p>

              <div className="flex flex-col gap-4">
                <PasswordInput field="current" label="Current Password" placeholder="Enter current password" error={passwordErrors.current} />
                <div>
                  <PasswordInput field="new" label="New Password" placeholder="Enter new password" error={passwordErrors.new} />
                  <PasswordStrength password={passwords.new} />
                </div>
                <PasswordInput field="confirm" label="Confirm New Password" placeholder="Confirm new password" error={passwordErrors.confirm} />

                <div className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/20 mt-2">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 size={14} className="text-amber-400" />
                    <span className="text-xs font-medium text-amber-400">Password requirements</span>
                  </div>
                  <ul className="text-xs text-text-faint space-y-1 ml-5">
                    <li>Minimum 6 characters</li>
                    <li>Mix of letters, numbers, and symbols recommended</li>
                  </ul>
                </div>

                <div className="flex justify-end pt-2">
                  <button className="btn-primary" onClick={handleSavePassword} disabled={savingPassword}>
                    <Lock size={15} />
                    {savingPassword ? 'Updating...' : 'Update Password'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'preferences' && (
            <div className="glass-card p-6 animate-fade-in">
              <h3 className="font-semibold text-text-primary mb-6">Preferences</h3>
              <div className="flex flex-col gap-5">
                {/* Notifications toggle */}
                <div className="flex items-center justify-between p-4 rounded-lg bg-surface2 border border-border">
                  <div className="flex items-center gap-3">
                    <Bell size={18} className="text-accent" />
                    <div>
                      <p className="text-sm font-medium text-text-primary">Notifications</p>
                      <p className="text-xs text-text-faint">Receive alerts for new leads</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setPrefs((p) => ({ ...p, notifications: !p.notifications }))}
                    className={`relative w-11 h-6 rounded-full transition-colors ${prefs.notifications ? 'bg-accent' : 'bg-surface3'}`}
                  >
                    <span
                      className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${prefs.notifications ? 'translate-x-5' : ''}`}
                    />
                  </button>
                </div>

                {/* Theme */}
                <div className="flex items-center justify-between p-4 rounded-lg bg-surface2 border border-border">
                  <div className="flex items-center gap-3">
                    <Monitor size={18} className="text-blue-400" />
                    <div>
                      <p className="text-sm font-medium text-text-primary">Theme</p>
                      <p className="text-xs text-text-faint">Interface color scheme</p>
                    </div>
                  </div>
                  <span className="text-sm text-text-muted bg-surface3 border border-border rounded-lg px-3 py-1.5">
                    Dark
                  </span>
                </div>

                {/* Default view */}
                <div className="flex flex-col gap-2 p-4 rounded-lg bg-surface2 border border-border">
                  <p className="text-sm font-medium text-text-primary">Default Lead View</p>
                  <div className="flex gap-2">
                    {['table', 'grid'].map((v) => (
                      <button
                        key={v}
                        onClick={() => setPrefs((p) => ({ ...p, defaultView: v }))}
                        className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
                          prefs.defaultView === v
                            ? 'bg-accent text-black'
                            : 'bg-surface3 border border-border text-text-muted hover:border-border-light'
                        }`}
                      >
                        {v}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Items per page */}
                <div className="flex flex-col gap-2 p-4 rounded-lg bg-surface2 border border-border">
                  <p className="text-sm font-medium text-text-primary">Items Per Page</p>
                  <div className="flex gap-2">
                    {[10, 25, 50].map((n) => (
                      <button
                        key={n}
                        onClick={() => setPrefs((p) => ({ ...p, itemsPerPage: n }))}
                        className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                          prefs.itemsPerPage === n
                            ? 'bg-accent text-black'
                            : 'bg-surface3 border border-border text-text-muted hover:border-border-light'
                        }`}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    className="btn-primary"
                    onClick={() => toast.success('Preferences saved')}
                  >
                    <Save size={15} />
                    Save Preferences
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
