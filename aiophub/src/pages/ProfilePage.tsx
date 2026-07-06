import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import {
  User,
  Mail,
  Camera,
  Save,
  AlertCircle,
  CheckCircle,
  Shield,
  Calendar,
  Clock,
} from 'lucide-react';

export function ProfilePage() {
  const { user, profile, loading: authLoading } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '');
      setEmail(profile.email);
      setAvatarUrl(profile.avatar_url || '');
    }
  }, [profile]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setLoading(true);

    try {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          full_name: fullName,
          avatar_url: avatarUrl || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user?.id);

      if (updateError) throw updateError;
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  }

  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-secondary-900">Profile Settings</h1>
        <p className="text-secondary-500">Manage your account information and preferences</p>
      </div>

      {/* Profile card */}
      <div className="bg-white rounded-2xl border border-secondary-200 overflow-hidden">
        {/* Avatar section */}
        <div className="p-6 border-b border-secondary-200 bg-gradient-to-br from-primary-50 to-accent-50">
          <div className="flex items-center gap-6">
            <div className="relative">
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary-400 to-accent-500 flex items-center justify-center text-white text-3xl font-bold">
                {fullName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
              </div>
              <button className="absolute -bottom-1 -right-1 w-8 h-8 bg-white rounded-lg shadow-md flex items-center justify-center text-secondary-600 hover:text-secondary-900 transition-colors">
                <Camera className="w-4 h-4" />
              </button>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-secondary-900">
                {fullName || 'Your Name'}
              </h2>
              <p className="text-secondary-500">{email}</p>
              {profile?.role && profile.role !== 'user' && (
                <span className="inline-flex items-center gap-1 mt-2 px-2 py-1 bg-primary-100 text-primary-700 text-xs font-medium rounded-full">
                  <Shield className="w-3 h-3" />
                  {profile.role === 'super_admin' ? 'Super Admin' : 'Admin'}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="bg-error-50 border border-error-500 text-error-600 rounded-lg px-4 py-3 flex items-center gap-2 text-sm">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              {error}
            </div>
          )}

          {success && (
            <div className="bg-success-50 border border-success-500 text-success-600 rounded-lg px-4 py-3 flex items-center gap-2 text-sm">
              <CheckCircle className="w-5 h-5 flex-shrink-0" />
              Profile updated successfully!
            </div>
          )}

          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-secondary-700 mb-1">
              Full Name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-400" />
              <input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-secondary-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                placeholder="John Doe"
              />
            </div>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-secondary-700 mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-400" />
              <input
                id="email"
                type="email"
                value={email}
                disabled
                className="w-full pl-10 pr-4 py-2.5 border border-secondary-200 rounded-lg bg-secondary-50 text-secondary-500 cursor-not-allowed"
              />
            </div>
            <p className="mt-1 text-xs text-secondary-500">
              Email cannot be changed. Contact support if needed.
            </p>
          </div>

          <div>
            <label htmlFor="avatarUrl" className="block text-sm font-medium text-secondary-700 mb-1">
              Avatar URL
            </label>
            <div className="relative">
              <Camera className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-400" />
              <input
                id="avatarUrl"
                type="url"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-secondary-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                placeholder="https://example.com/avatar.jpg"
              />
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Account info */}
      <div className="bg-white rounded-2xl border border-secondary-200 p-6">
        <h3 className="text-lg font-semibold text-secondary-900 mb-4">Account Information</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3 text-secondary-600">
            <Calendar className="w-5 h-5 text-secondary-400" />
            <span className="text-sm">
              Account created:{' '}
              <span className="font-medium text-secondary-900">
                {profile?.created_at
                  ? new Date(profile.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })
                  : 'Unknown'}
              </span>
            </span>
          </div>
          <div className="flex items-center gap-3 text-secondary-600">
            <Clock className="w-5 h-5 text-secondary-400" />
            <span className="text-sm">
              Last updated:{' '}
              <span className="font-medium text-secondary-900">
                {profile?.updated_at
                  ? new Date(profile.updated_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })
                  : 'Unknown'}
              </span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
