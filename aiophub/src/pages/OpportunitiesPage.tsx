import { useEffect, useState, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { supabase, Opportunity, Category } from '../lib/supabase';
import {
  Search,
  Filter,
  MapPin,
  Building2,
  Clock,
  DollarSign,
  Bookmark,
  ExternalLink,
  X,
  ChevronDown,
  Briefcase,
} from 'lucide-react';
type KaggleOpportunity = {
  title: string;
  type: string;
  source: string;
  official_url: string;
  deadline: string;
  category: string;
  reward: string;
  team_count: string;
};

export function OpportunitiesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [kaggleOpportunities, setKaggleOpportunities] = useState<KaggleOpportunity[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [selectedType, setSelectedType] = useState(searchParams.get('type') || '');
  const [salaryMin, setSalaryMin] = useState(searchParams.get('minSalary') || '');
  const [salaryMax, setSalaryMax] = useState(searchParams.get('maxSalary') || '');

  useEffect(() => {
    async function fetchData() {
      try {
        const [oppResult, catResult, bookmarkResult] = await Promise.all([
          supabase
            .from('opportunities')
            .select('*, category:categories(*)')
            .eq('is_active', true)
            .order('created_at', { ascending: false }),
          supabase.from('categories').select('*'),
          supabase.from('bookmarks').select('opportunity_id'),
        ]);

        if (oppResult.data) setOpportunities(oppResult.data);
        if (catResult.data) setCategories(catResult.data);
        if (bookmarkResult.data) {
          setBookmarkedIds(new Set(bookmarkResult.data.map((b: { opportunity_id: string }) => b.opportunity_id)));
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);
useEffect(() => {
  async function fetchKaggleOpportunities() {
    try {
      const response = await fetch(
        'http://127.0.0.1:8000/api/opportunities/kaggle'
      );

      if (!response.ok) {
        throw new Error('Could not fetch Kaggle opportunities');
      }

      const data = await response.json();

      setKaggleOpportunities(data.opportunities || []);
    } catch (error) {
      console.error('Error fetching Kaggle opportunities:', error);
    }
  }

  fetchKaggleOpportunities();
}, []);
  const filteredOpportunities = useMemo(() => {
    return opportunities.filter((opp) => {
      const matchesSearch =
        !search ||
        opp.title.toLowerCase().includes(search.toLowerCase()) ||
        opp.company.toLowerCase().includes(search.toLowerCase()) ||
        opp.description.toLowerCase().includes(search.toLowerCase());

      const matchesCategory = !selectedCategory || opp.category?.slug === selectedCategory;

      const matchesType = !selectedType || opp.type === selectedType;

      const matchesSalary =
        (!salaryMin || (opp.salary_max && opp.salary_max >= parseInt(salaryMin) * 1000)) &&
        (!salaryMax || (opp.salary_min && opp.salary_min <= parseInt(salaryMax) * 1000));

      return matchesSearch && matchesCategory && matchesType && matchesSalary;
    });
  }, [opportunities, search, selectedCategory, selectedType, salaryMin, salaryMax]);

  function updateFilters() {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (selectedCategory) params.set('category', selectedCategory);
    if (selectedType) params.set('type', selectedType);
    if (salaryMin) params.set('minSalary', salaryMin);
    if (salaryMax) params.set('maxSalary', salaryMax);
    setSearchParams(params);
  }

  function clearFilters() {
    setSearch('');
    setSelectedCategory('');
    setSelectedType('');
    setSalaryMin('');
    setSalaryMax('');
    setSearchParams({});
  }

  async function toggleBookmark(opportunityId: string) {
    if (bookmarkedIds.has(opportunityId)) {
      await supabase.from('bookmarks').delete().eq('opportunity_id', opportunityId);
      setBookmarkedIds((prev) => {
        const next = new Set(prev);
        next.delete(opportunityId);
        return next;
      });
    } else {
      await supabase.from('bookmarks').insert({ opportunity_id: opportunityId });
      setBookmarkedIds((prev) => new Set([...prev, opportunityId]));
    }
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

  const hasActiveFilters = search || selectedCategory || selectedType || salaryMin || salaryMax;

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
          <h1 className="text-2xl font-bold text-secondary-900">Opportunities</h1>
          <p className="text-secondary-500">
            {filteredOpportunities.length} opportunities available
          </p>
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-secondary-200 rounded-lg hover:bg-secondary-50 transition-colors lg:hidden"
        >
          <Filter className="w-4 h-4" />
          Filters
          {hasActiveFilters && (
            <span className="w-5 h-5 bg-primary-600 text-white text-xs rounded-full flex items-center justify-center">
              !
            </span>
          )}
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Filters sidebar */}
        <aside
          className={`lg:w-72 flex-shrink-0 ${showFilters ? 'block' : 'hidden lg:block'}`}
        >
          <div className="bg-white rounded-xl border border-secondary-200 p-5 space-y-6 sticky top-24">
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onBlur={updateFilters}
                  placeholder="Search opportunities..."
                  className="w-full pl-9 pr-4 py-2 border border-secondary-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">Category</label>
              <div className="relative">
                <select
                  value={selectedCategory}
                  onChange={(e) => {
                    setSelectedCategory(e.target.value);
                    updateFilters();
                  }}
                  className="w-full appearance-none px-3 py-2 border border-secondary-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">All categories</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.slug}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-400 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">Work type</label>
              <div className="space-y-2">
                {['remote', 'hybrid', 'onsite'].map((type) => (
                  <label key={type} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="type"
                      checked={selectedType === type}
                      onChange={() => {
                        setSelectedType(selectedType === type ? '' : type);
                        updateFilters();
                      }}
                      className="w-4 h-4 text-primary-600 border-secondary-300 focus:ring-primary-500"
                    />
                    <span className="text-sm text-secondary-700 capitalize">{type}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Salary range (thousands)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={salaryMin}
                  onChange={(e) => setSalaryMin(e.target.value)}
                  onBlur={updateFilters}
                  placeholder="$ Min"
                  className="w-full px-3 py-2 border border-secondary-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
                <span className="text-secondary-400">-</span>
                <input
                  type="number"
                  value={salaryMax}
                  onChange={(e) => setSalaryMax(e.target.value)}
                  onBlur={updateFilters}
                  placeholder="$ Max"
                  className="w-full px-3 py-2 border border-secondary-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>

            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-secondary-600 hover:text-secondary-900 transition-colors"
              >
                <X className="w-4 h-4" />
                Clear filters
              </button>
            )}
          </div>
        </aside>
{kaggleOpportunities.length > 0 && (
  <div className="mb-8">
    <div className="flex items-center justify-between mb-4">
      <div>
        <h2 className="text-xl font-bold text-secondary-900">
          Live Kaggle Competitions
        </h2>

        <p className="text-sm text-secondary-500">
          Active competitions fetched live from Kaggle
        </p>
      </div>

      <span className="px-3 py-1 rounded-full bg-primary-100 text-primary-700 text-sm font-medium">
        {kaggleOpportunities.length} live
      </span>
    </div>

    <div className="grid gap-4">
      {kaggleOpportunities.map((competition) => (
        <div
          key={competition.official_url}
          className="bg-white rounded-xl border border-secondary-200 p-5 hover:shadow-md transition-shadow"
        >
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">

            <div className="flex items-start gap-4">

              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-100 to-accent-100 flex items-center justify-center flex-shrink-0">
                <Briefcase className="w-6 h-6 text-primary-600" />
              </div>

              <div>
                <h3 className="font-semibold text-secondary-900 text-lg mb-1">
                  {competition.title}
                </h3>

                <div className="flex flex-wrap items-center gap-3 text-sm text-secondary-500 mb-3">
                  <span className="flex items-center gap-1">
                    <Building2 className="w-4 h-4" />
                    Kaggle
                  </span>

                  <span className="flex items-center gap-1">
                    <DollarSign className="w-4 h-4" />
                    {competition.reward}
                  </span>

                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {daysUntil(competition.deadline)}
                  </span>
                </div>

                <div className="flex flex-wrap gap-2">
                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-primary-100 text-primary-700">
                    Competition
                  </span>

                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-secondary-100 text-secondary-700">
                    {competition.category}
                  </span>

                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-secondary-100 text-secondary-700">
                    {competition.team_count} teams
                  </span>
                </div>
              </div>
            </div>

            <a
              href={competition.official_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors whitespace-nowrap"
            >
              View on Kaggle
              <ExternalLink className="w-4 h-4" />
            </a>

          </div>
        </div>
      ))}
    </div>
  </div>
)}
        {/* Opportunities grid */}
        <div className="flex-1">
          {filteredOpportunities.length === 0 ? (
            <div className="bg-white rounded-xl border border-secondary-200 p-12 text-center">
              <Briefcase className="w-12 h-12 mx-auto text-secondary-300 mb-4" />
              <h3 className="text-lg font-semibold text-secondary-900 mb-1">
                No opportunities found
              </h3>
              <p className="text-secondary-500 mb-4">
                Try adjusting your filters or search criteria
              </p>
              <button
                onClick={clearFilters}
                className="text-primary-600 font-medium hover:text-primary-700"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredOpportunities.map((opp) => (
                <div
                  key={opp.id}
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
                          <p className="text-sm text-secondary-600 line-clamp-2 mb-3">
                            {opp.description}
                          </p>
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
                        onClick={() => toggleBookmark(opp.id)}
                        className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                          bookmarkedIds.has(opp.id)
                            ? 'bg-accent-100 text-accent-700'
                            : 'bg-secondary-100 text-secondary-700 hover:bg-secondary-200'
                        }`}
                      >
                        <Bookmark
                          className={`w-4 h-4 ${bookmarkedIds.has(opp.id) ? 'fill-current' : ''}`}
                        />
                        {bookmarkedIds.has(opp.id) ? 'Saved' : 'Save'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
