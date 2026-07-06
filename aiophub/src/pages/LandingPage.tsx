import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  Brain,
  Search,
  Bookmark,
  Bell,
  Briefcase,
  Building2,
  ArrowRight,
  CheckCircle,
  Zap,
  TrendingUp,
  GraduationCap,
  Code2,
  Trophy,
  Award,
  FlaskConical,
  Presentation,
  Wrench,
} from 'lucide-react';

export function LandingPage() {
  const { user } = useAuth();

  const features = [
    {
      icon: Search,
      title: 'Smart Discovery',
      description: 'AI-powered matching to find opportunities that align with your skills and interests.',
    },
    {
      icon: Bookmark,
      title: 'Save & Organize',
      description: 'Bookmark your favorite opportunities and keep them organized for easy access.',
    },
    {
      icon: Bell,
      title: 'Stay Updated',
      description: 'Get notified about new opportunities matching your preferences.',
    },
    {
      icon: TrendingUp,
      title: 'Track Progress',
      description: 'Monitor your application status and deadlines in one dashboard.',
    },
  ];

  const stats = [
    { value: '20+', label: 'Sources & Companies' },
    { value: '21', label: 'Opportunities' },
    { value: '9', label: 'Categories' },
    { value: '24/7', label: 'Access' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-secondary-50 to-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-secondary-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-accent-500 rounded-xl flex items-center justify-center shadow-md">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-secondary-900">AI Opportunity Hub</span>
            </Link>
            <div className="flex items-center gap-3">
              {user ? (
                <Link
                  to="/dashboard"
                  className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors"
                >
                  Dashboard
                  <ArrowRight className="w-4 h-4" />
                </Link>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="px-4 py-2 text-secondary-700 font-medium hover:text-secondary-900 transition-colors"
                  >
                    Sign in
                  </Link>
                  <Link
                    to="/signup"
                    className="px-4 py-2 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-50 text-primary-700 rounded-full text-sm font-medium mb-6">
              <Zap className="w-4 h-4" />
              Your gateway to AI career opportunities
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-secondary-900 mb-6 leading-tight">
              Discover Your Next{' '}
              <span className="bg-gradient-to-r from-primary-600 to-accent-500 bg-clip-text text-transparent">
                AI Opportunity
              </span>
            </h1>
            <p className="text-lg sm:text-xl text-secondary-600 mb-8 max-w-2xl mx-auto">
              Connect with leading AI companies and find opportunities in machine learning, NLP,
              computer vision, robotics, and more from top tech companies worldwide.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to={user ? '/dashboard' : '/signup'}
                className="flex items-center gap-2 px-6 py-3 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-colors shadow-lg shadow-primary-600/25"
              >
                Explore Opportunities
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                to="/login"
                className="flex items-center gap-2 px-6 py-3 bg-white text-secondary-700 font-semibold rounded-xl hover:bg-secondary-50 transition-colors border border-secondary-200"
              >
                Sign in
              </Link>
            </div>
          </div>

          {/* Hero illustration */}
          <div className="mt-16 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-primary-600/20 to-accent-500/20 blur-3xl rounded-3xl"></div>
            <div className="relative bg-white rounded-2xl shadow-2xl border border-secondary-200 p-6 overflow-hidden">
              <div className="grid md:grid-cols-3 gap-4">
                <div className="p-4 bg-gradient-to-br from-primary-50 to-accent-50 rounded-xl">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
                      <Briefcase className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-secondary-900">100+ Positions</h4>
                      <p className="text-xs text-secondary-500">Active listings</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {['Senior ML Engineer', 'LLM Researcher', 'Computer Vision Engineer'].map((title) => (
                      <div key={title} className="flex items-center gap-2 text-sm text-secondary-700">
                        <CheckCircle className="w-4 h-4 text-accent-500" />
                        {title}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="p-4 bg-gradient-to-br from-accent-50 to-primary-50 rounded-xl">
                  <h4 className="font-semibold text-secondary-900 mb-3">Top Companies</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {['Google', 'OpenAI', 'Meta', 'Anthropic', 'Microsoft', 'DeepMind'].map((company) => (
                      <div key={company} className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg text-sm text-secondary-700 border border-secondary-100">
                        <Building2 className="w-4 h-4 text-secondary-400" />
                        {company}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="p-4 bg-gradient-to-br from-secondary-50 to-primary-50 rounded-xl">
                  <h4 className="font-semibold text-secondary-900 mb-3">Categories</h4>
                  <div className="space-y-2">
                    {[
                      { name: 'Jobs', count: 3 },
                      { name: 'Internships', count: 3 },
                      { name: 'Hackathons', count: 3 },
                      { name: 'Research', count: 2 },
                      { name: 'Scholarships', count: 2 },
                    ].map((cat) => (
                      <div key={cat.name} className="flex items-center justify-between text-sm">
                        <span className="text-secondary-700">{cat.name}</span>
                        <span className="px-2 py-0.5 bg-primary-100 text-primary-700 rounded-full text-xs font-medium">
                          {cat.count}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats section */}
      <section className="py-12 bg-secondary-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl sm:text-4xl font-bold text-white mb-1">{stat.value}</div>
                <div className="text-secondary-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-secondary-900 mb-4">
              Everything you need to land your dream AI role
            </h2>
            <p className="text-lg text-secondary-600 max-w-2xl mx-auto">
              Our platform provides all the tools you need to discover, track, and apply for AI
              opportunities at leading tech companies.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="bg-white rounded-2xl border border-secondary-200 p-6 hover:shadow-lg hover:border-primary-200 transition-all"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-primary-100 to-accent-100 rounded-xl flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-primary-600" />
                </div>
                <h3 className="text-lg font-semibold text-secondary-900 mb-2">{feature.title}</h3>
                <p className="text-secondary-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories section */}
      <section className="py-20 bg-gradient-to-b from-secondary-50 to-white px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-secondary-900 mb-4">
              Explore AI Career Paths
            </h2>
            <p className="text-lg text-secondary-600">
              Find opportunities across diverse AI specializations
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { name: 'Jobs', icon: Briefcase, slug: 'jobs' },
              { name: 'Internships', icon: GraduationCap, slug: 'internships' },
              { name: 'Hackathons', icon: Code2, slug: 'hackathons' },
              { name: 'Competitions', icon: Trophy, slug: 'competitions' },
              { name: 'Fellowships', icon: Award, slug: 'fellowships' },
              { name: 'Research', icon: FlaskConical, slug: 'research' },
              { name: 'Conferences', icon: Presentation, slug: 'conferences' },
              { name: 'Workshops', icon: Wrench, slug: 'workshops' },
              { name: 'Scholarships', icon: GraduationCap, slug: 'scholarships' },
            ].map((cat) => (
              <Link
                to={`/opportunities?category=${cat.slug}`}
                key={cat.name}
                className="bg-white rounded-xl border border-secondary-200 p-5 text-center hover:shadow-md hover:border-primary-300 transition-all cursor-pointer group"
              >
                <div className="w-14 h-14 mx-auto mb-3 rounded-xl bg-gradient-to-br from-primary-50 to-accent-50 flex items-center justify-center group-hover:from-primary-100 group-hover:to-accent-100 transition-colors">
                  <cat.icon className="w-7 h-7 text-primary-600" />
                </div>
                <p className="font-medium text-secondary-900">{cat.name}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-3xl p-8 sm:p-12 text-center shadow-xl">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Ready to start your AI career journey?
            </h2>
            <p className="text-lg text-primary-100 mb-8 max-w-xl mx-auto">
              Join thousands of AI professionals discovering opportunities at leading tech
              companies.
            </p>
            <Link
              to={user ? '/dashboard' : '/signup'}
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-primary-700 font-semibold rounded-xl hover:bg-primary-50 transition-colors shadow-lg"
            >
              Get Started for Free
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-secondary-900 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-600 to-accent-500 rounded-lg flex items-center justify-center">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold text-white">AI Opportunity Hub</span>
            </div>
            <p className="text-secondary-400 text-sm">
              Connecting AI talent with world-class opportunities
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
