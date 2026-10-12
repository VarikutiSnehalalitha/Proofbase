import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import { useToast } from '../contexts/ToastContext';
import type { DiscoverProject, DiscoverProfile } from '../types';
import {
  Card,
  Spinner,
  Badge,
} from '../components/ui';
import {
  Compass,
  Search,
  Users,
  FolderKanban,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Sparkles,
  MapPin,
  ArrowRight,
} from 'lucide-react';

export function DiscoverPage() {
  const { error: toastError } = useToast();
  const [activeTab, setActiveTab] = useState<'projects' | 'creators'>('projects');

  const [projects, setProjects] = useState<DiscoverProject[]>([]);
  const [creators, setCreators] = useState<DiscoverProfile[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (category) params.append('category', category);

      if (activeTab === 'projects') {
        const res = await api.get<{ projects: DiscoverProject[] }>(
          `/discover/projects?${params.toString()}`
        );
        setProjects(res.projects || []);
      } else {
        const res = await api.get<{ profiles: DiscoverProfile[] }>(
          `/discover/profiles?${params.toString()}`
        );
        setCreators(res.profiles || []);
      }
    } catch (err: any) {
      toastError('Failed to load discover items');
    } finally {
      setLoading(false);
    }
  }, [activeTab, search, category, toastError]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadData();
    }, 200);
    return () => clearTimeout(timer);
  }, [loadData]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200/80 text-blue-700 text-xs font-semibold">
          <Compass className="w-3.5 h-3.5 text-blue-600" />
          Proofbase Community Showcase
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-950">
          Discover Verified Proof of Work
        </h1>
        <p className="text-sm text-zinc-600">
          Explore real engineering achievements, design artifacts, and standout builders
        </p>
      </div>

      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-2 bg-zinc-50 border border-zinc-200 rounded-2xl">
        {/* Tab Toggle */}
        <div className="flex items-center p-1 bg-white border border-zinc-200 rounded-xl w-full sm:w-auto shadow-2xs">
          <button
            type="button"
            onClick={() => setActiveTab('projects')}
            style={activeTab === 'projects' ? { color: '#ffffff' } : undefined}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              activeTab === 'projects'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FolderKanban className="w-3.5 h-3.5" />
            Projects
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('creators')}
            style={activeTab === 'creators' ? { color: '#ffffff' } : undefined}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              activeTab === 'creators'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            Creators & Talent
          </button>
        </div>

        {/* Search & Category Filter */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={activeTab === 'projects' ? 'Search projects...' : 'Search talent...'}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs border border-zinc-200 rounded-xl bg-white text-zinc-900 focus:outline-none"
            />
          </div>

          {activeTab === 'projects' && (
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="px-3 py-1.5 text-xs font-medium border border-zinc-200 rounded-xl bg-white text-zinc-700 focus:outline-none"
            >
              <option value="">All Categories</option>
              <option value="Full Stack">Full Stack</option>
              <option value="Frontend">Frontend</option>
              <option value="Backend">Backend</option>
              <option value="Data Science">Data Science</option>
              <option value="UI/UX Design">UI/UX Design</option>
            </select>
          )}
        </div>
      </div>

      {/* Grid Content */}
      {loading ? (
        <div className="py-24 flex justify-center">
          <Spinner size="lg" />
        </div>
      ) : activeTab === 'projects' ? (
        projects.length === 0 ? (
          <div className="py-20 text-center border border-dashed border-zinc-200 rounded-2xl bg-white">
            <FolderKanban className="w-8 h-8 text-zinc-300 mx-auto mb-2" />
            <p className="text-sm font-medium text-zinc-600">No public projects found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((proj) => (
              <Card key={proj.id} hover className="flex flex-col justify-between border-zinc-200 p-5 group">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200/60">
                      {proj.category || 'Engineering'}
                    </span>
                    {proj.isFeatured && (
                      <span className="text-[11px] font-semibold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                        ★ Featured
                      </span>
                    )}
                  </div>

                  <Link to={`/projects/${proj.id}`} className="block group-hover:text-blue-600 transition-colors">
                    <h3 className="text-base font-bold text-zinc-900 line-clamp-1">{proj.name}</h3>
                  </Link>

                  {proj.role && (
                    <p className="text-xs font-medium text-zinc-600 mt-1">{proj.role}</p>
                  )}

                  {proj.description && (
                    <p className="text-xs text-zinc-500 mt-2 line-clamp-2 leading-relaxed">
                      {proj.description}
                    </p>
                  )}

                  {proj.skills && proj.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-3">
                      {proj.skills.slice(0, 4).map((s) => (
                        <span
                          key={s}
                          className="px-2 py-0.5 text-[11px] font-medium rounded bg-zinc-100 text-zinc-600"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="pt-4 mt-4 border-t border-zinc-100 flex items-center justify-between text-xs">
                  <Link
                    to={`/p/${proj.user?.username}`}
                    className="flex items-center gap-2 group/creator"
                  >
                    <div className="w-5 h-5 rounded-full bg-zinc-900 text-white flex items-center justify-center text-[10px] font-bold overflow-hidden">
                      {proj.user?.profile?.avatarUrl ? (
                        <img src={proj.user.profile.avatarUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        (proj.user?.profile?.name?.[0] || proj.user?.username[0] || 'U').toUpperCase()
                      )}
                    </div>
                    <span className="font-medium text-zinc-600 group-hover/creator:text-zinc-900">
                      {proj.user?.profile?.name || proj.user?.username}
                    </span>
                  </Link>

                  <Link
                    to={`/projects/${proj.id}`}
                    className="inline-flex items-center gap-1 font-semibold text-zinc-900 hover:text-blue-600 transition-colors"
                  >
                    View
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        )
      ) : creators.length === 0 ? (
        <div className="py-20 text-center border border-dashed border-zinc-200 rounded-2xl bg-white">
          <Users className="w-8 h-8 text-zinc-300 mx-auto mb-2" />
          <p className="text-sm font-medium text-zinc-600">No public creators found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {creators.map((c) => (
            <Card key={c.username} hover className="flex flex-col justify-between border-zinc-200 p-6 group">
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 p-0.5 shadow-xs shrink-0">
                    <div className="w-full h-full rounded-[14px] bg-zinc-900 overflow-hidden flex items-center justify-center text-lg font-bold text-white">
                      {c.avatarUrl ? (
                        <img src={c.avatarUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        (c.name[0] || c.username[0]).toUpperCase()
                      )}
                    </div>
                  </div>

                  <div>
                    <Link to={`/p/${c.username}`} className="group-hover:text-blue-600 transition-colors">
                      <h3 className="text-base font-bold text-zinc-900">{c.name}</h3>
                    </Link>
                    <p className="text-xs text-zinc-500">{c.headline || `@${c.username}`}</p>
                    {c.location && (
                      <p className="text-[11px] text-zinc-400 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3" />
                        {c.location}
                      </p>
                    )}
                  </div>
                </div>

                {c.skills && c.skills.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {c.skills.slice(0, 5).map((sk) => (
                      <span
                        key={sk}
                        className="px-2 py-0.5 text-[11px] font-medium rounded bg-zinc-100 text-zinc-700"
                      >
                        {sk}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-4 mt-4 border-t border-zinc-100 flex items-center justify-between text-xs">
                <span className="text-zinc-500 font-medium">
                  {c.projectCount} {c.projectCount === 1 ? 'project' : 'projects'}
                </span>
                <Link
                  to={`/p/${c.username}`}
                  className="inline-flex items-center gap-1 font-semibold text-blue-600 hover:text-blue-700"
                >
                  Portfolio
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
