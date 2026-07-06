import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase, Opportunity, Bookmark as BookmarkType, Category } from '../lib/supabase';
import {
  Bookmark,
  MapPin,
  Building2,
  DollarSign,
  Clock,
  ExternalLink,
  Trash2,
  Search,
} from 'lucide-react';

export function BookmarksPage() {
  const [bookmarks, setBookmarks] = useState<(BookmarkType & { opportunity: Opportunity & { category: Category | null } })[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchBookmarks();
  }, []);

  async function fetchBookmarks() {
    try {
      const { data, error } = await supabase
        .from('bookmarks')
        .select(`
          *,
          opportunity:opportunities (
            *,
            category:categories (*)
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBookmarks(data || []);
    } catch (error) {
      console.error('Error fetching bookmarks:', error);
    } finally {
      setLoading(false);
    }
  }

  async function removeBookmark(id: string) {
    await supabase.from('bookmarks').delete().eq('id', id);
    setBookmarks((prev) => prev.filter((b) => b.id !== id));
  }

  function formatSalary(min: number | null, max: number | null) {
    if (!min && !max) return 'Not disclosed';
    const format = (n: number) => `$${(n / 1000).toFixed(0)}k`;
    if (min && max) return `${format(min)} - ${format(max)}`;
    if (min) return `From ${format(min)}`;
    return `Up to ${format(max!)}`;
  }

  function daysUntil(date: string | null) {
    if (!date) return null;
    const diff = new Date(date).getTime() - Date.now();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days > 0 ? `${days}d left` : 'Expired';
  }

  const filteredBookmarks = bookmarks.filter(
    (b) =>
      !search ||
      b.opportunity?.title.toLowerCase().includes(search.toLowerCase()) ||
      b.opportunity?.company.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">Saved Opportunities</h1>
          <p className="text-secondary-500">
            {filteredBookmarks.length} saved {filteredBookmarks.length === 1 ? 'opportunity' : 'opportunities'}
          </p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search bookmarks..."
            className="pl-9 pr-4 py-2 border border-secondary-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 w-full sm:w-64"
          />
        </div>
      </div>

      {filteredBookmarks.length === 0 ? (
        <div className="bg-white rounded-xl border border-secondary-200 p-12 text-center">
          <Bookmark className="w-12 h-12 mx-auto text-secondary-300 mb-4" />
          <h3 className="text-lg font-semibold text-secondary-900 mb-1">No bookmarks yet</h3>
          <p className="text-secondary-500 mb-4">
            {search
              ? 'No bookmarks match your search'
              : 'Start saving opportunities to keep track of your favorites'}
          </p>
          <Link
            to="/opportunities"
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
          >
            Browse opportunities
            <ExternalLink className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredBookmarks.map((bookmark) => {
            const opp = bookmark.opportunity;
            if (!opp) return null;

            return (
              <div
                key={bookmark.id}
                className="bg-white rounded-xl border border-secondary-200 p-5 hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-100 to-accent-100 flex items-center justify-center flex-shrink-0">
                        <Building2 className="w-6 h-6 text-primary-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-secondary-900 text-lg mb-1">
                          {opp.title}
                        </h3>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-secondary-500 mb-3">
                          <span className="flex items-center gap-1">
                            <Building2 className="w-4 h-4" />
                            {opp.company}
                          </span>
                          {opp.location && (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              {opp.location}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <DollarSign className="w-4 h-4" />
                            {formatSalary(opp.salary_min, opp.salary_max)}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
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
                          {opp.category && (
                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-secondary-100 text-secondary-700">
                              {opp.category.name}
                            </span>
                          )}
                          {opp.deadline && (
                            <span className="flex items-center gap-1 text-xs text-secondary-500">
                              <Clock className="w-3.5 h-3.5" />
                              {daysUntil(opp.deadline)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex sm:flex-col items-center gap-2 sm:ml-4">
                    <Link
                      to={`/opportunities/${opp.id}`}
                      className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors"
                    >
                      View
                      <ExternalLink className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => removeBookmark(bookmark.id)}
                      className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-error-600 bg-error-50 rounded-lg hover:bg-error-100 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
