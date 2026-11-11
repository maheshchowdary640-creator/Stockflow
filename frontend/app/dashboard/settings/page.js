'use client';

import React, { useState, useEffect } from 'react';
import {
  Building2,
  Sliders,
  User,
  Save,
  Loader2,
  CheckCircle2,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { organizationService } from '@/services/organizationService';

export default function SettingsPage() {
  const { user, profile, organization, refreshProfile } = useAuth();
  const { showToast } = useToast();

  // Organization settings state
  const [orgName, setOrgName] = useState('');
  const [savingOrg, setSavingOrg] = useState(false);

  // Profile state
  const [userName, setUserName] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  // Inventory global settings state
  const [defaultThreshold, setDefaultThreshold] = useState(5);
  const [loadingSettings, setLoadingSettings] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);

  useEffect(() => {
    if (organization?.name) {
      setOrgName(organization.name);
    }
    if (profile?.name) {
      setUserName(profile.name);
    }
  }, [organization, profile]);

  useEffect(() => {
    let mounted = true;
    if (organization?.id) {
      organizationService
        .getSettings(organization.id)
        .then((settings) => {
          if (mounted && settings?.default_low_stock_threshold !== undefined) {
            setDefaultThreshold(settings.default_low_stock_threshold);
          }
        })
        .catch((err) => {
          console.warn('[Settings] Failed to fetch settings:', err);
        })
        .finally(() => {
          if (mounted) setLoadingSettings(false);
        });
    } else {
      setLoadingSettings(false);
    }
    return () => {
      mounted = false;
    };
  }, [organization?.id]);

  // Save Organization
  const handleSaveOrganization = async (e) => {
    e.preventDefault();
    if (!orgName.trim()) {
      showToast('Organization name cannot be empty.', 'error');
      return;
    }
    setSavingOrg(true);
    try {
      await organizationService.updateOrganization(organization.id, {
        name: orgName.trim(),
      });
      await refreshProfile();
      showToast('Organization name updated successfully!', 'success');
    } catch (err) {
      console.error('Error updating organization:', err);
      showToast('Failed to update organization: ' + err.message, 'error');
    } finally {
      setSavingOrg(false);
    }
  };

  // Save Profile
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!userName.trim()) {
      showToast('Name cannot be empty.', 'error');
      return;
    }
    setSavingProfile(true);
    try {
      await organizationService.updateProfile(user.id, {
        name: userName.trim(),
      });
      await refreshProfile();
      showToast('Profile name updated successfully!', 'success');
    } catch (err) {
      console.error('Error updating profile:', err);
      showToast('Failed to update profile: ' + err.message, 'error');
    } finally {
      setSavingProfile(false);
    }
  };

  // Save Inventory Settings
  const handleSaveSettings = async (e) => {
    e.preventDefault();
    const threshold = parseInt(defaultThreshold, 10);
    if (isNaN(threshold) || threshold < 0) {
      showToast('Threshold must be a non-negative integer.', 'error');
      return;
    }
    setSavingSettings(true);
    try {
      await organizationService.updateSettings(organization.id, {
        default_low_stock_threshold: threshold,
      });
      showToast('Default low-stock threshold updated successfully!', 'success');
    } catch (err) {
      console.error('Error updating settings:', err);
      showToast('Failed to save settings: ' + err.message, 'error');
    } finally {
      setSavingSettings(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl animate-in fade-in-50 duration-200">
      <div>
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          System Settings
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Manage your organization profile, inventory alert thresholds, and account preferences.
        </p>
      </div>

      {/* 1. Organization Settings */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100 mb-6">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Organization Details
            </h3>
            <p className="text-xs text-slate-500">
              Your company identity and multi-tenant workspace configuration
            </p>
          </div>
        </div>

        <form onSubmit={handleSaveOrganization} className="space-y-5">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Organization Name
              </label>
              <input
                type="text"
                required
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                placeholder="Acme Supply Co."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 text-sm transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Workspace ID
              </label>
              <input
                type="text"
                disabled
                value={organization?.id || 'Auto-generated UUID'}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-400 text-xs font-mono select-all cursor-not-allowed"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-slate-100">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Multi-tenant Row Level Security enforced</span>
            </div>
            <button
              type="submit"
              disabled={savingOrg || !organization?.id}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition shadow-sm text-xs disabled:opacity-60"
            >
              {savingOrg && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <Save className="w-3.5 h-3.5" />
              Save Organization
            </button>
          </div>
        </form>
      </div>

      {/* 2. Global Inventory Settings */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100 mb-6">
          <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 text-amber-600 flex items-center justify-center">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Inventory Alert Preferences
            </h3>
            <p className="text-xs text-slate-500">
              Configure baseline replenishment thresholds for your entire catalog
            </p>
          </div>
        </div>

        <form onSubmit={handleSaveSettings} className="space-y-5">
          <div className="max-w-md">
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Default Low-Stock Threshold (Units)
            </label>
            <input
              type="number"
              min="0"
              step="1"
              required
              disabled={loadingSettings}
              value={defaultThreshold}
              onChange={(e) => setDefaultThreshold(e.target.value)}
              placeholder="5"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 text-sm transition"
            />
            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
              When a product does not specify its own custom threshold, StockFlow flags it as &quot;Low Stock&quot; when quantity falls below or equal to this value.
            </p>
          </div>

          <div className="flex justify-end pt-3 border-t border-slate-100">
            <button
              type="submit"
              disabled={savingSettings || loadingSettings}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition shadow-sm text-xs disabled:opacity-60"
            >
              {savingSettings && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <Save className="w-3.5 h-3.5" />
              Save Inventory Settings
            </button>
          </div>
        </form>
      </div>

      {/* 3. Profile Settings */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100 mb-6">
          <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">
              User Profile
            </h3>
            <p className="text-xs text-slate-500">
              Your personal credentials managed via Supabase Auth
            </p>
          </div>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-5">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                required
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="Jane Doe"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 text-sm transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 text-sm cursor-not-allowed"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                Managed securely via Supabase Auth
              </p>
            </div>
          </div>

          <div className="flex justify-end pt-3 border-t border-slate-100">
            <button
              type="submit"
              disabled={savingProfile || !user?.id}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition shadow-sm text-xs disabled:opacity-60"
            >
              {savingProfile && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <Save className="w-3.5 h-3.5" />
              Save Profile
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
