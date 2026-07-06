import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase, Opportunity, Category } from '../lib/supabase';
import {
  Shield,
  Plus,
  Edit,
  Trash2,
  X,
  Briefcase,
  Bookmark,
  Bell,
  TrendingUp,
  AlertCircle,
} from 'lucide-react';

interface OpportunityForm {
  id?: string;
  title: string;
  description: string;
  company: string;
  location: string;
  type: 'remote' | 'hybrid' | 'onsite';
  salary_min: string;
  salary_max: string;
  category_id: string;
  requirements: string;
  benefits: string;
  apply_url: string;
  deadline: string;
  is_active: boolean;
}

const emptyForm: OpportunityForm = {
  title: '',
  description: '',
  company: '',
  location: '',
  type: 'remote',
  salary_min: '',
  salary_max: '',
  category_id: '',
  requirements: '',
  benefits: '',
  apply_url: '',
  deadline: '',
  is_active: true,
};

export function AdminDashboardPage() {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<OpportunityForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    totalOpportunities: 0,
    activeOpportunities: 0,
    totalBookmarks: 0,
    totalNotifications: 0,
  });

  useEffect(() => {
    if (!isAdmin) {
      navigate('/dashboard');
      return;
    }
    fetchData();
  }, [isAdmin, navigate]);

  async function fetchData() {
    try {
      const [oppResult, catResult, bookmarkResult, notifResult] = await Promise.all([
        supabase
          .from('opportunities')
          .select('*, category:categories(*)')
          .order('created_at', { ascending: false }),
        supabase.from('categories').select('*'),
        supabase.from('bookmarks').select('id', { count: 'exact' }),
        supabase.from('notifications').select('id', { count: 'exact' }),
      ]);

      if (oppResult.data) setOpportunities(oppResult.data);
      if (catResult.data) setCategories(catResult.data);
      setStats({
        totalOpportunities: oppResult.data?.length || 0,
        activeOpportunities: oppResult.data?.filter((o: Opportunity) => o.is_active).length || 0,
        totalBookmarks: bookmarkResult.count || 0,
        totalNotifications: notifResult.count || 0,
      });
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }

  function openCreateModal() {
    setForm(emptyForm);
    setError(null);
    setShowModal(true);
  }

  function openEditModal(opp: Opportunity) {
    setForm({
      id: opp.id,
      title: opp.title,
      description: opp.description,
      company: opp.company,
      location: opp.location || '',
      type: opp.type,
      salary_min: opp.salary_min ? String(opp.salary_min / 1000) : '',
      salary_max: opp.salary_max ? String(opp.salary_max / 1000) : '',
      category_id: opp.category_id || '',
      requirements: opp.requirements.join('\n'),
      benefits: opp.benefits.join('\n'),
      apply_url: opp.apply_url || '',
      deadline: opp.deadline || '',
      is_active: opp.is_active,
    });
    setError(null);
    setShowModal(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);

    try {
      const data = {
        title: form.title,
        description: form.description,
        company: form.company,
        location: form.location || null,
        type: form.type,
        salary_min: form.salary_min ? parseInt(form.salary_min) * 1000 : null,
        salary_max: form.salary_max ? parseInt(form.salary_max) * 1000 : null,
        category_id: form.category_id || null,
        requirements: form.requirements.split('\n').filter(Boolean),
        benefits: form.benefits.split('\n').filter(Boolean),
        apply_url: form.apply_url || null,
        deadline: form.deadline || null,
        is_active: form.is_active,
      };

      if (form.id) {
        const { error: updateError } = await supabase
          .from('opportunities')
          .update({ ...data, updated_at: new Date().toISOString() })
          .eq('id', form.id);
        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase.from('opportunities').insert(data);
        if (insertError) throw insertError;
      }

      setShowModal(false);
      fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save opportunity');
    } finally {
      setSaving(false);
    }
  }

  async function deleteOpportunity(id: string) {
    if (!confirm('Are you sure you want to delete this opportunity?')) return;

    await supabase.from('opportunities').delete().eq('id', id);
    setOpportunities((prev) => prev.filter((o) => o.id !== id));
    fetchData();
  }

  async function toggleActive(opp: Opportunity) {
    await supabase
      .from('opportunities')
      .update({ is_active: !opp.is_active, updated_at: new Date().toISOString() })
      .eq('id', opp.id);
    fetchData();
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="text-center py-12">
        <Shield className="w-12 h-12 mx-auto text-error-500 mb-4" />
        <h2 className="text-xl font-semibold text-secondary-900">Access Denied</h2>
        <p className="text-secondary-500 mt-2">You do not have admin privileges.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">Admin Dashboard</h1>
          <p className="text-secondary-500">Manage opportunities, categories, and users</p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Opportunity
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-secondary-200 p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-primary-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-secondary-900">{stats.totalOpportunities}</p>
          <p className="text-sm text-secondary-500">Total Opportunities</p>
        </div>
        <div className="bg-white rounded-xl border border-secondary-200 p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-accent-100 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-accent-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-secondary-900">{stats.activeOpportunities}</p>
          <p className="text-sm text-secondary-500">Active Listings</p>
        </div>
        <div className="bg-white rounded-xl border border-secondary-200 p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-warning-50 flex items-center justify-center">
              <Bookmark className="w-5 h-5 text-warning-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-secondary-900">{stats.totalBookmarks}</p>
          <p className="text-sm text-secondary-500">Total Bookmarks</p>
        </div>
        <div className="bg-white rounded-xl border border-secondary-200 p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-secondary-100 flex items-center justify-center">
              <Bell className="w-5 h-5 text-secondary-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-secondary-900">{stats.totalNotifications}</p>
          <p className="text-sm text-secondary-500">Notifications Sent</p>
        </div>
      </div>

      {/* Opportunities table */}
      <div className="bg-white rounded-xl border border-secondary-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-secondary-200">
          <h2 className="font-semibold text-secondary-900">Opportunities</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-secondary-50">
              <tr>
                <th className="px-5 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-5 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                  Company
                </th>
                <th className="px-5 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-5 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-5 py-3 text-right text-xs font-medium text-secondary-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-secondary-200">
              {opportunities.map((opp) => (
                <tr key={opp.id} className="hover:bg-secondary-50">
                  <td className="px-5 py-4">
                    <div className="font-medium text-secondary-900">{opp.title}</div>
                    <div className="text-sm text-secondary-500">{opp.category?.name || 'Uncategorized'}</div>
                  </td>
                  <td className="px-5 py-4 text-secondary-700">{opp.company}</td>
                  <td className="px-5 py-4">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        opp.type === 'remote'
                          ? 'bg-accent-100 text-accent-700'
                          : opp.type === 'hybrid'
                          ? 'bg-primary-100 text-primary-700'
                          : 'bg-secondary-100 text-secondary-700'
                      }`}
                    >
                      {opp.type}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <button
                      onClick={() => toggleActive(opp)}
                      className={`px-2 py-1 text-xs font-medium rounded-full transition-colors ${
                        opp.is_active
                          ? 'bg-success-50 text-success-600 hover:bg-success-100'
                          : 'bg-secondary-100 text-secondary-600 hover:bg-secondary-200'
                      }`}
                    >
                      {opp.is_active ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEditModal(opp)}
                        className="p-2 text-secondary-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteOpportunity(opp.id)}
                        className="p-2 text-secondary-400 hover:text-error-600 hover:bg-error-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <div
              className="fixed inset-0 bg-secondary-900/50 transition-opacity"
              onClick={() => setShowModal(false)}
            />
            <div className="relative transform overflow-hidden rounded-2xl bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-2xl">
              <div className="flex items-center justify-between px-6 py-4 border-b border-secondary-200">
                <h3 className="text-lg font-semibold text-secondary-900">
                  {form.id ? 'Edit Opportunity' : 'Create Opportunity'}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 text-secondary-400 hover:text-secondary-600 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto">
                {error && (
                  <div className="bg-error-50 border border-error-500 text-error-600 rounded-lg px-4 py-3 flex items-center gap-2 text-sm">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    {error}
                  </div>
                )}

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-secondary-700 mb-1">
                      Title *
                    </label>
                    <input
                      type="text"
                      value={form.title}
                      onChange={(e) => setForm({ ...form, title: e.target.value })}
                      required
                      className="w-full px-3 py-2 border border-secondary-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-1">
                      Company *
                    </label>
                    <input
                      type="text"
                      value={form.company}
                      onChange={(e) => setForm({ ...form, company: e.target.value })}
                      required
                      className="w-full px-3 py-2 border border-secondary-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-1">
                      Category
                    </label>
                    <select
                      value={form.category_id}
                      onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                      className="w-full px-3 py-2 border border-secondary-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="">Select category</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-secondary-700 mb-1">
                      Description *
                    </label>
                    <textarea
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                      required
                      rows={3}
                      className="w-full px-3 py-2 border border-secondary-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-1">
                      Location
                    </label>
                    <input
                      type="text"
                      value={form.location}
                      onChange={(e) => setForm({ ...form, location: e.target.value })}
                      className="w-full px-3 py-2 border border-secondary-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-1">
                      Work Type *
                    </label>
                    <select
                      value={form.type}
                      onChange={(e) => setForm({ ...form, type: e.target.value as OpportunityForm['type'] })}
                      required
                      className="w-full px-3 py-2 border border-secondary-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="remote">Remote</option>
                      <option value="hybrid">Hybrid</option>
                      <option value="onsite">On-site</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-1">
                      Min Salary (thousands)
                    </label>
                    <input
                      type="number"
                      value={form.salary_min}
                      onChange={(e) => setForm({ ...form, salary_min: e.target.value })}
                      className="w-full px-3 py-2 border border-secondary-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="150"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-1">
                      Max Salary (thousands)
                    </label>
                    <input
                      type="number"
                      value={form.salary_max}
                      onChange={(e) => setForm({ ...form, salary_max: e.target.value })}
                      className="w-full px-3 py-2 border border-secondary-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="250"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-1">
                      Apply URL
                    </label>
                    <input
                      type="url"
                      value={form.apply_url}
                      onChange={(e) => setForm({ ...form, apply_url: e.target.value })}
                      className="w-full px-3 py-2 border border-secondary-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="https://company.com/apply"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-1">
                      Deadline
                    </label>
                    <input
                      type="date"
                      value={form.deadline}
                      onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                      className="w-full px-3 py-2 border border-secondary-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-secondary-700 mb-1">
                      Requirements (one per line)
                    </label>
                    <textarea
                      value={form.requirements}
                      onChange={(e) => setForm({ ...form, requirements: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-secondary-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="5+ years ML experience&#10;Python, TensorFlow, PyTorch&#10;PhD preferred"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-secondary-700 mb-1">
                      Benefits (one per line)
                    </label>
                    <textarea
                      value={form.benefits}
                      onChange={(e) => setForm({ ...form, benefits: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-secondary-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Equity package&#10;Health benefits&#10;Remote work"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.is_active}
                        onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                        className="w-4 h-4 text-primary-600 border-secondary-300 rounded focus:ring-primary-500"
                      />
                      <span className="text-sm text-secondary-700">Active listing</span>
                    </label>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-secondary-200">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 text-secondary-700 font-medium hover:bg-secondary-50 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-4 py-2 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
                  >
                    {saving ? 'Saving...' : form.id ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
