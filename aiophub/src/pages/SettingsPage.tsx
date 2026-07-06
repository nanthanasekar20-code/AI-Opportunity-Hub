import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  Bell,
  Mail,
  Moon,
  Sun,
  Shield,
  LogOut,
  Trash2,
  Check,
  Info,
} from 'lucide-react';

interface SettingsState {
  emailNotifications: boolean;
  deadlineReminders: boolean;
  newOpportunityAlerts: boolean;
  weeklyDigest: boolean;
}

const defaultSettings: SettingsState = {
  emailNotifications: true,
  deadlineReminders: true,
  newOpportunityAlerts: false,
  weeklyDigest: true,
};

const STORAGE_KEY = 'aioh_settings_v1';

function Toggle({
  checked,
  onChange,
  label,
  description,
}: {
  checked: boolean;
  onChange: () => void;
  label: string;
  description: string;
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-4">
      <div>
        <p className="text-sm font-medium text-secondary-900">{label}</p>
        <p className="text-sm text-secondary-500 mt-0.5">{description}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={onChange}
        className={`relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors ${
          checked ? 'bg-primary-600' : 'bg-secondary-200'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
            checked ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );
}

export function SettingsPage() {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [settings, setSettings] = useState<SettingsState>(defaultSettings);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setSettings({ ...defaultSettings, ...JSON.parse(raw) });
    } catch {
      // ignore malformed storage
    }
  }, []);

  function updateSetting(key: keyof SettingsState) {
    setSettings((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        // ignore storage errors
      }
      return next;
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  }

  async function handleSignOut() {
    await signOut();
    navigate('/login');
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">Settings</h1>
          <p className="text-secondary-500">Manage notifications, appearance, and your account</p>
        </div>
        {saved && (
          <span className="flex items-center gap-1.5 text-sm font-medium text-success-600 bg-success-50 px-3 py-1.5 rounded-full">
            <Check className="w-4 h-4" />
            Saved
          </span>
        )}
      </div>

      {/* Notifications */}
      <div className="bg-white rounded-2xl border border-secondary-200 p-6">
        <div className="flex items-center gap-2 mb-1">
          <Bell className="w-5 h-5 text-primary-600" />
          <h2 className="text-lg font-semibold text-secondary-900">Notifications</h2>
        </div>
        <p className="text-sm text-secondary-500 mb-2">
          Choose how you want to hear about new opportunities and deadlines.
        </p>
        <div className="divide-y divide-secondary-100">
          <Toggle
            checked={settings.emailNotifications}
            onChange={() => updateSetting('emailNotifications')}
            label="Email notifications"
            description="Get important updates sent to your inbox"
          />
          <Toggle
            checked={settings.deadlineReminders}
            onChange={() => updateSetting('deadlineReminders')}
            label="Deadline reminders"
            description="Reminders before applications and submissions close"
          />
          <Toggle
            checked={settings.newOpportunityAlerts}
            onChange={() => updateSetting('newOpportunityAlerts')}
            label="New opportunity alerts"
            description="Be notified when opportunities matching your interests are posted"
          />
          <Toggle
            checked={settings.weeklyDigest}
            onChange={() => updateSetting('weeklyDigest')}
            label="Weekly digest"
            description="A weekly summary of new and closing opportunities"
          />
        </div>
      </div>

      {/* Appearance */}
      <div className="bg-white rounded-2xl border border-secondary-200 p-6">
        <div className="flex items-center gap-2 mb-1">
          <Sun className="w-5 h-5 text-primary-600" />
          <h2 className="text-lg font-semibold text-secondary-900">Appearance</h2>
        </div>
        <p className="text-sm text-secondary-500 mb-4">Choose how AI Opportunity Hub looks on your device.</p>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-3 rounded-xl border-2 border-primary-500 bg-primary-50 px-4 py-3">
            <Sun className="w-5 h-5 text-primary-600" />
            <span className="text-sm font-medium text-secondary-900">Light</span>
          </div>
          <div className="flex items-center gap-3 rounded-xl border border-secondary-200 px-4 py-3 opacity-60 cursor-not-allowed">
            <Moon className="w-5 h-5 text-secondary-400" />
            <span className="text-sm font-medium text-secondary-500">Dark (coming soon)</span>
          </div>
        </div>
      </div>

      {/* Account */}
      <div className="bg-white rounded-2xl border border-secondary-200 p-6">
        <div className="flex items-center gap-2 mb-1">
          <Shield className="w-5 h-5 text-primary-600" />
          <h2 className="text-lg font-semibold text-secondary-900">Account</h2>
        </div>
        <p className="text-sm text-secondary-500 mb-4">{profile?.email}</p>

        <div className="space-y-3">
          <button
            disabled
            className="w-full flex items-center justify-between px-4 py-3 rounded-lg border border-secondary-200 text-sm font-medium text-secondary-400 cursor-not-allowed"
          >
            <span className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Change password
            </span>
            <span className="text-xs">Requires backend</span>
          </button>

          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-2 px-4 py-3 rounded-lg border border-secondary-200 text-sm font-medium text-secondary-700 hover:bg-secondary-50 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign out
          </button>
        </div>

        <div className="mt-6 pt-6 border-t border-secondary-200">
          <p className="text-sm font-medium text-error-600 mb-2">Danger zone</p>
          <button
            disabled
            className="w-full flex items-center justify-between px-4 py-3 rounded-lg border border-error-500/30 bg-error-50 text-sm font-medium text-error-400 cursor-not-allowed"
          >
            <span className="flex items-center gap-2">
              <Trash2 className="w-4 h-4" />
              Delete account
            </span>
            <span className="text-xs">Requires backend</span>
          </button>
        </div>
      </div>

      <div className="flex items-start gap-2 text-xs text-secondary-500 px-1">
        <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
        <p>
          These preferences are saved locally on this device for now. Once AI Opportunity Hub connects to a real
          backend, they'll sync to your account.
        </p>
      </div>
    </div>
  );
}
