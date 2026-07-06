import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase, Opportunity } from '../lib/supabase';
import {
  ArrowLeft,
  Building2,
  MapPin,
  Clock,
  DollarSign,
  Bookmark,
  ExternalLink,
  Briefcase,
  CheckCircle,
} from 'lucide-react';

export function OpportunityDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [opportunity, setOpportunity] = useState<Opportunity | null>(null);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    async function fetchData() {
      if (!id) return;

      try {
        const [oppResult, bookmarkResult] = await Promise.all([
          supabase
            .from('opportunities')
            .select('*, category:categories(*)')
            .eq('id', id)
            .maybeSingle(),
          supabase.from('bookmarks').select('id').eq('opportunity_id', id).maybeSingle(),
        ]);

        if (oppResult.data) {
          setOpportunity(oppResult.data);
        } else {
          navigate('/opportunities');
        }
        setIsBookmarked(!!bookmarkResult.data);
      } catch (error) {
        console.error('Error fetching opportunity:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [id, navigate]);

  async function toggleBookmark() {
    if (!id) return;

    if (isBookmarked) {
      await supabase.from('bookmarks').delete().eq('opportunity_id', id);
      setIsBookmarked(false);
    } else {
      await supabase.from('bookmarks').insert({ opportunity_id: id });
      setIsBookmarked(true);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
    }
  }

  function formatSalary(min: number | null, max: number | null) {
    if (!min && !max) return 'Not disclosed';
    const format = (n: number) => `$${n.toLocaleString()}`;
    if (min && max) return `${format(min)} - ${format(max)}`;
    if (min) return `From ${format(min)}`;
    return `Up to ${format(max!)}`;
  }

  function formatDate(date: string) {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  function daysUntil(date: string | null) {
    if (!date) return 'No deadline specified';
    const diff = new Date(date).getTime() - Date.now();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    if (days < 0) return 'Expired';
    if (days === 0) return 'Deadline today';
    if (days === 1) return '1 day left';
    return `${days} days left`;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!opportunity) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-secondary-900">Opportunity not found</h2>
        <Link to="/opportunities" className="text-primary-600 mt-4 inline-block">
          Back to opportunities
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Success notification */}
      {showSuccess && (
        <div className="fixed top-20 right-4 bg-accent-600 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 z-50 animate-fade-in">
          <CheckCircle className="w-5 h-5" />
          Added to bookmarks!
        </div>
      )}

      {/* Back button */}
      <Link
        to="/opportunities"
        className="inline-flex items-center gap-2 text-sm font-medium text-secondary-600 hover:text-secondary-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to opportunities
      </Link>

      {/* Main content */}
      <div className="bg-white rounded-2xl border border-secondary-200 overflow-hidden">
        {/* Header */}
        <div className="p-6 lg:p-8 border-b border-secondary-200 bg-gradient-to-br from-primary-50 to-accent-50">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-2xl bg-white shadow-md flex items-center justify-center flex-shrink-0">
                <Building2 className="w-8 h-8 text-primary-600" />
              </div>
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-secondary-900 mb-2">
                  {opportunity.title}
                </h1>
                <div className="flex flex-wrap items-center gap-3 text-secondary-600">
                  <span className="flex items-center gap-1">
                    <Building2 className="w-4 h-4" />
                    {opportunity.company}
                  </span>
                  {opportunity.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {opportunity.location}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={toggleBookmark}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  isBookmarked
                    ? 'bg-accent-100 text-accent-700'
                    : 'bg-white border border-secondary-200 text-secondary-700 hover:bg-secondary-50'
                }`}
              >
                <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
                {isBookmarked ? 'Saved' : 'Save'}
              </button>
              {opportunity.apply_url && (
                <a
                  href={opportunity.apply_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
                >
                  Apply
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap items-center gap-2 mt-6">
            <span
              className={`px-3 py-1.5 text-sm font-medium rounded-full ${
                opportunity.type === 'remote'
                  ? 'bg-accent-100 text-accent-700'
                  : opportunity.type === 'hybrid'
                  ? 'bg-primary-100 text-primary-700'
                  : 'bg-secondary-200 text-secondary-700'
              }`}
            >
              {opportunity.type.charAt(0).toUpperCase() + opportunity.type.slice(1)}
            </span>
            {opportunity.category && (
              <span className="px-3 py-1.5 text-sm font-medium rounded-full bg-white text-secondary-700 border border-secondary-200">
                {opportunity.category.name}
              </span>
            )}
          </div>
        </div>

        {/* Details */}
        <div className="p-6 lg:p-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-secondary-50 rounded-xl p-4">
              <div className="flex items-center gap-2 text-secondary-500 text-sm mb-1">
                <DollarSign className="w-4 h-4" />
                Salary
              </div>
              <p className="font-semibold text-secondary-900">
                {formatSalary(opportunity.salary_min, opportunity.salary_max)}
              </p>
            </div>
            <div className="bg-secondary-50 rounded-xl p-4">
              <div className="flex items-center gap-2 text-secondary-500 text-sm mb-1">
                <Briefcase className="w-4 h-4" />
                Type
              </div>
              <p className="font-semibold text-secondary-900 capitalize">{opportunity.type}</p>
            </div>
            <div className="bg-secondary-50 rounded-xl p-4">
              <div className="flex items-center gap-2 text-secondary-500 text-sm mb-1">
                <Clock className="w-4 h-4" />
                Deadline
              </div>
              <p className="font-semibold text-secondary-900">
                {daysUntil(opportunity.deadline)}
              </p>
            </div>
            <div className="bg-secondary-50 rounded-xl p-4">
              <div className="flex items-center gap-2 text-secondary-500 text-sm mb-1">
                <MapPin className="w-4 h-4" />
                Location
              </div>
              <p className="font-semibold text-secondary-900">
                {opportunity.location || 'Remote'}
              </p>
            </div>
          </div>

          {/* Description */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-secondary-900 mb-3">Description</h2>
            <p className="text-secondary-700 leading-relaxed whitespace-pre-line">
              {opportunity.description}
            </p>
          </div>

          {/* Requirements */}
          {opportunity.requirements && opportunity.requirements.length > 0 && (
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-secondary-900 mb-3">Requirements</h2>
              <ul className="space-y-2">
                {opportunity.requirements.map((req, index) => (
                  <li key={index} className="flex items-start gap-2 text-secondary-700">
                    <CheckCircle className="w-5 h-5 text-accent-500 flex-shrink-0 mt-0.5" />
                    {req}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Benefits */}
          {opportunity.benefits && opportunity.benefits.length > 0 && (
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-secondary-900 mb-3">Benefits</h2>
              <div className="flex flex-wrap gap-2">
                {opportunity.benefits.map((benefit, index) => (
                  <span
                    key={index}
                    className="px-3 py-1.5 bg-primary-50 text-primary-700 rounded-lg text-sm font-medium"
                  >
                    {benefit}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Footer info */}
          <div className="pt-6 border-t border-secondary-200 text-sm text-secondary-500">
            <p>Posted on {formatDate(opportunity.created_at)}</p>
            {opportunity.deadline && (
              <p className="mt-1">Application deadline: {formatDate(opportunity.deadline)}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
