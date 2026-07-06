import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase, Opportunity, Category } from '../lib/supabase';
import {
  Briefcase,
  Bookmark as BookmarkIcon,
  Bell,
  TrendingUp,
  ExternalLink,
  MapPin,
  Clock,
  Building2,
  DollarSign,
} from 'lucide-react';

export function DashboardPage() {
  const { user, profile } = useAuth();
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [totalActive, setTotalActive] = useState(0);
  const [bookmarksCount, setBookmarksCount] = useState(0);
  const [notificationsCount, setNotificationsCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [oppResult, totalResult, catResult, bookmarkResult, notifResult] = await Promise.all([
          supabase
            .from('opportunities')
            .select('*, category:categories(*)')
            .eq('is_active', true)
            .order('created_at', { ascending: false })
            .limit(6),
          supabase.from('opportunities').select('id', { count: 'exact' }).eq('is_active', true),
          supabase.from('categories').select('*'),
          supabase.from('bookmarks').select('id', { count: 'exact' }),
          supabase.from('notifications').select('id', { count: 'exact' }).eq('read', false),
        ]);

        if (oppResult.data) setOpportunities(oppResult.data);
        if (catResult.data) setCategories(catResult.data);
        setTotalActive(totalResult.count || 0);
        setBookmarksCount(bookmarkResult.count || 0);
        setNotificationsCount(notifResult.count || 0);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    }

    if (user) {
      fetchData();
    }
  }, [user]);

  function formatSalary(min: number | null, max: number | null) {
    if (!min && !max) return 'Salary not disclosed';
    const format = (n: number) => `$${(n / 1000).toFixed(0)}k`;
    if (min && max) return `${format(min)} - ${format(max)}`;
    if (min) return `From ${format(min)}`;
    return `Up to ${format(max!)}`;
  }

  function daysUntil(date: string) {
    const diff = new Date(date).getTime() - Date.now();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days > 0 ? `${days} days left` : 'Expired';
  }

  const stats = [
    { name: 'Total Opportunities', value: totalActive, icon: Briefcase, color: 'primary' },
    { name: 'Your Bookmarks', value: bookmarksCount, icon: BookmarkIcon, color: 'accent' },
    { name: 'Unread Notifications', value: notificationsCount, icon: Bell, color: 'warning' },
    { name: 'Categories', value: categories.length, icon: TrendingUp, color: 'success' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome section */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl p-6 lg:p-8 text-white">
        <h1 className="text-2xl lg:text-3xl font-bold mb-2">
          Welcome back, {profile?.full_name?.split(' ')[0] || 'User'}!
        </h1>
        <p className="text-primary-100 text-lg">
          Discover your next AI opportunity. We've found {totalActive} open positions for you.
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.name}
            className="bg-white rounded-xl p-5 border border-secondary-200 shadow-sm"
          >
            <div className="flex items-center justify-between mb-3">
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  stat.color === 'primary'
                    ? 'bg-primary-100 text-primary-600'
                    : stat.color === 'accent'
                    ? 'bg-accent-100 text-accent-600'
                    : stat.color === 'warning'
                    ? 'bg-warning-50 text-warning-600'
                    : 'bg-success-50 text-success-600'
                }`}
              >
                <stat.icon className="w-5 h-5" />
              </div>
            </div>
            <p className="text-2xl font-bold text-secondary-900">{stat.value}</p>
            <p className="text-sm text-secondary-500">{stat.name}</p>
          </div>
        ))}
      </div>

      {/* Recent opportunities */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-secondary-900">Recent Opportunities</h2>
          <Link
            to="/opportunities"
            className="text-sm font-medium text-primary-600 hover:text-primary-700"
          >
            View all
          </Link>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {opportunities.map((opp) => (
            <div
              key={opp.id}
              className="bg-white rounded-xl border border-secondary-200 p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-secondary-900 mb-1 line-clamp-1">
                    {opp.title}
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-secondary-500">
                    <Building2 className="w-4 h-4" />
                    {opp.company}
                  </div>
                </div>
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
              </div>

              {opp.location && (
                <div className="flex items-center gap-2 text-sm text-secondary-500 mb-2">
                  <MapPin className="w-4 h-4" />
                  {opp.location}
                </div>
              )}

              <div className="flex items-center gap-2 text-sm text-secondary-500 mb-3">
                <DollarSign className="w-4 h-4" />
                {formatSalary(opp.salary_min, opp.salary_max)}
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-secondary-100">
                <div className="flex items-center gap-1 text-xs text-secondary-500">
                  <Clock className="w-3.5 h-3.5" />
                  {opp.deadline ? daysUntil(opp.deadline) : 'No deadline'}
                </div>
                <Link
                  to={`/opportunities/${opp.id}`}
                  className="text-sm font-medium text-primary-600 hover:text-primary-700 flex items-center gap-1"
                >
                  View details
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Categories */}
      <div>
        <h2 className="text-xl font-bold text-secondary-900 mb-4">Browse by Category</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={`/opportunities?category=${cat.slug}`}
              className="bg-white rounded-xl border border-secondary-200 p-4 text-center hover:shadow-md hover:border-primary-300 transition-all group"
            >
              <div className="w-12 h-12 mx-auto mb-2 rounded-xl bg-gradient-to-br from-primary-50 to-accent-50 flex items-center justify-center text-primary-600 group-hover:from-primary-100 group-hover:to-accent-100 transition-colors">
                <Briefcase className="w-6 h-6" />
              </div>
              <p className="text-sm font-medium text-secondary-900">{cat.name}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
