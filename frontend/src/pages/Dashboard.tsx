import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { api } from '../lib/api';
import type { Project, AnalyticsOverview } from '../types';
import {
  Card,
  VisibilityBadge,
  StatusBadge,
  Spinner,
  EmptyState,
} from '../components/ui';
import {
  FolderKanban,
  Plus,
  Eye,
  Share2,
  TrendingUp,
  FileCheck2,
  ArrowRight,
  ExternalLink,
  Edit,
  Globe,
  Sparkles,
  Shield,
  Layers,
  ChevronRight,
  CheckCircle,
  Code2,
  Lock,
  FileText,
  Terminal,
  Zap,
  Compass,
  Laptop,
  Check,
  X,
  FileCode,
  ShieldCheck,
  UserCheck,
} from 'lucide-react';

export function DashboardPage() {
  const { user } = useAuth();
  const { error: toastError } = useToast();

  const [projects, setProjects] = useState<Project[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsOverview | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const loadData = async () => {
      try {
        const [projRes, analyticsRes] = await Promise.all([
          api.get<{ projects: Project[] }>('/projects?limit=8&sort=newest'),
          api.get<AnalyticsOverview>('/analytics/overview').catch(() => null),
        ]);
        setProjects(projRes.projects || []);
        if (analyticsRes) setAnalytics(analyticsRes);
      } catch (err: any) {
        toastError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user, toastError]);

  if (!user) {
    return <LandingView />;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spinner size="lg" />
      </div>
    );
  }

  const totalProjects = analytics?.projects.total ?? projects.length;
  const publishedProjects =
    analytics?.projects
      ? analytics.projects.public + analytics.projects.shared
      : projects.filter((p) => p.status === 'published').length;
  const totalViews =
    (analytics?.views.projectViews.total ?? 0) + (analytics?.views.profileViews.total ?? 0);
  const shareActivity = analytics?.shareActivity ?? 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10 animate-fadeIn">
      {/* Header Profile Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-900 text-white p-6 sm:p-10 shadow-xl border border-slate-800">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-indigo-500 to-blue-500 p-0.5 shadow-lg shrink-0">
              <div className="w-full h-full rounded-[14px] bg-slate-900 overflow-hidden flex items-center justify-center text-xl sm:text-2xl font-bold">
                {user.profile?.avatarUrl ? (
                  <img
                    src={user.profile.avatarUrl}
                    alt={user.profile.name || user.username}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  (user.profile?.name?.[0] || user.username[0] || 'U').toUpperCase()
                )}
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">
                  {user.profile?.name || user.username}
                </h1>
                <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 uppercase tracking-wide">
                  Verified Candidate
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
                {user.profile?.headline || 'Engineer & Builder Portfolio'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link
              to={`/p/${user.username}`}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-xl bg-white/10 hover:bg-white/15 text-white border border-white/15 transition-all backdrop-blur-sm"
            >
              <Globe className="w-3.5 h-3.5 text-indigo-400" />
              <span>Public View</span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </Link>
            <Link
              to="/projects/new"
              style={{ color: '#ffffff' }}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4 text-white" />
              <span>Add Project</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-2xs space-y-2 hover:shadow-md transition-all">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>Total Projects</span>
            <FolderKanban className="w-4 h-4 text-slate-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">{totalProjects}</span>
            <span className="text-xs text-slate-400 font-medium">recorded</span>
          </div>
        </div>

        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-2xs space-y-2 hover:shadow-md transition-all">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>Published Live</span>
            <FileCheck2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-emerald-600">
              {publishedProjects}
            </span>
            <span className="text-xs text-slate-400 font-medium">showcased</span>
          </div>
        </div>

        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-2xs space-y-2 hover:shadow-md transition-all">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>Recruiter Views</span>
            <Eye className="w-4 h-4 text-blue-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">{totalViews}</span>
            <span className="text-xs text-slate-400 font-medium">impressions</span>
          </div>
        </div>

        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-2xs space-y-2 hover:shadow-md transition-all">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>Share Links</span>
            <Share2 className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              {shareActivity}
            </span>
            <span className="text-xs text-slate-400 font-medium">active tokens</span>
          </div>
        </div>
      </div>

      {/* Projects Showcase */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
              Your Projects
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Verified proof artifacts, documented responsibilities, and measurable impact
            </p>
          </div>
          <Link
            to="/projects"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
          >
            <span>All Projects ({totalProjects})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {projects.length === 0 ? (
          <Card padding="lg" className="border-dashed border-slate-300">
            <EmptyState
              icon={<FolderKanban className="w-7 h-7" />}
              title="No projects created yet"
              description="Start documenting your engineering work with architecture diagrams, responsibilities, and measurable results."
              action={
                <Link
                  to="/projects/new"
                  style={{ color: '#ffffff' }}
                  className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-xl bg-slate-900 text-white hover:bg-slate-800 shadow-sm"
                >
                  <Plus className="w-4 h-4 text-white" />
                  <span>Create First Project</span>
                </Link>
              }
            />
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((proj) => (
              <ProjectCard key={proj.id} project={proj} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ProjectCard({ project }: { project: Project }) {
  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-2xs hover:border-slate-300 hover:shadow-md transition-all flex flex-col justify-between group">
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-1.5 flex-wrap">
            <StatusBadge status={project.status} />
            <VisibilityBadge visibility={project.visibility} />
            {project.isFeatured && (
              <span className="inline-flex items-center px-2 py-0.5 text-[10px] font-semibold rounded-full bg-amber-50 text-amber-800 border border-amber-200/70">
                ★ Featured
              </span>
            )}
          </div>
          {project.category && (
            <span className="text-[11px] font-medium text-slate-400 capitalize">
              {project.category}
            </span>
          )}
        </div>

        <Link
          to={`/projects/${project.id}`}
          className="block group-hover:text-indigo-600 transition-colors"
        >
          <h3 className="text-base font-bold text-slate-900 line-clamp-1">{project.name}</h3>
        </Link>
        {project.role && (
          <p className="text-xs font-medium text-slate-600 mt-1">
            {project.role} {project.organization ? `@ ${project.organization}` : ''}
          </p>
        )}

        {project.description && (
          <p className="text-xs text-slate-500 mt-2.5 line-clamp-2 leading-relaxed">
            {project.description}
          </p>
        )}

        {project.skills && project.skills.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-4">
            {project.skills.slice(0, 4).map((s) => (
              <span
                key={s.id || s.name}
                className="px-2.5 py-0.5 text-[10px] font-semibold rounded-md bg-slate-100 text-slate-700"
              >
                {s.name}
              </span>
            ))}
            {project.skills.length > 4 && (
              <span className="px-1.5 py-0.5 text-[10px] text-slate-400 font-semibold">
                +{project.skills.length - 4}
              </span>
            )}
          </div>
        )}
      </div>

      <div className="pt-4 mt-5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <span>{project._count?.files ?? project.files?.length ?? 0} files</span>
          <span>•</span>
          <span>{project._count?.externalLinks ?? project.externalLinks?.length ?? 0} links</span>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to={`/projects/${project.id}/edit`}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            title="Edit Project"
          >
            <Edit className="w-3.5 h-3.5" />
          </Link>
          <Link
            to={`/projects/${project.id}`}
            className="inline-flex items-center gap-1 font-semibold text-slate-900 hover:text-indigo-600 transition-colors"
          >
            Showcase
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}

// ─── High-End Premium Landing Page ──────────────────────────────────────────

const DEMO_PROFILES = [
  {
    name: 'Alice Johnson',
    role: 'Staff Full-Stack & Systems Engineer',
    email: 'alice@example.com',
    avatar: 'A',
    headline: 'Distributed Systems, WebSockets & High-Throughput APIs',
    highlightTitle: 'Real-time WebSocket Gateway & Cluster Sync',
    highlightDesc:
      'Architected distributed connection tier handling 50k concurrent WebSockets with sub-15ms message fanout and Redis Pub/Sub cluster.',
    metrics: ['50k Concurrent Conns', '40% Lower Latency', '3 Verified Schemas'],
    skills: ['TypeScript', 'Node.js', 'Redis', 'PostgreSQL', 'Docker', 'Kubernetes'],
    artifacts: ['Architecture-Topology.png', 'LoadTest-Report.pdf', 'Schema.prisma'],
  },
  {
    name: 'Bob Miller',
    role: 'Lead Data Scientist & ML Systems Engineer',
    email: 'bob@example.com',
    avatar: 'B',
    headline: 'Real-Time Feature Stores & Large-Scale Recommendation Models',
    highlightTitle: 'Deep Learning Recommendation & Ranking Engine',
    highlightDesc:
      'Engineered two-tower candidate generation & neural re-ranking model serving 10M daily inferences with 98.4% uptime SLA.',
    metrics: ['98.4% Offline Accuracy', '10M Daily Inferences', 'Published Paper'],
    skills: ['Python', 'PyTorch', 'FastAPI', 'MLOps', 'Kafka', 'Vector DB'],
    artifacts: ['Model-Architecture.pdf', 'ROC-Curves.png', 'Pipeline-Spec.yaml'],
  },
  {
    name: 'Carol Danvers',
    role: 'Principal Design Technologist & Systems Architect',
    email: 'carol@example.com',
    avatar: 'C',
    headline: 'Multi-Brand Design Tokens, Accessible Micro-interactions & UI Architecture',
    highlightTitle: 'Enterprise Multi-Brand Design System',
    highlightDesc:
      'Created token-driven design library adopted by 4 core product teams, decreasing sprint frontend delivery time by 35%.',
    metrics: ['80+ Reusable Components', '4 Core Product Teams', 'WCAG AAA Compliant'],
    skills: ['Design Systems', 'Figma Tokens', 'React', 'Tailwind', 'Micro-interactions'],
    artifacts: ['Token-Spec.json', 'Accessibility-Audit.pdf', 'Component-Matrix.fig'],
  },
];

function LandingView() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { success: toastSuccess, error: toastError } = useToast();
  const [selectedDemoIndex, setSelectedDemoIndex] = useState(0);
  const [demoLoading, setDemoLoading] = useState(false);

  const activeProfile = DEMO_PROFILES[selectedDemoIndex];

  const handleLaunchDemo = async (email: string) => {
    setDemoLoading(true);
    try {
      await login(email, 'password123');
      toastSuccess(`Welcome! Signed in as ${email.split('@')[0]}`);
      navigate('/');
    } catch {
      toastError('Demo sign in failed');
    } finally {
      setDemoLoading(false);
    }
  };

  return (
    <div className="space-y-28 sm:space-y-36 py-12 pb-24 animate-fadeIn relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[600px] bg-gradient-to-b from-indigo-100/50 via-blue-50/25 to-transparent blur-3xl pointer-events-none -z-10" />

      {/* ─── Hero Section ──────────────────────────────────────────────── */}
      <section className="max-w-4xl mx-auto px-4 text-center space-y-8 pt-4 sm:pt-8">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50/90 border border-indigo-200/80 text-indigo-800 text-xs font-bold tracking-wide shadow-2xs">
          <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />
          <span>Proofbase 2.0 • The Proof-of-Work Standard for Tech Professionals</span>
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.12]">
          Prove what you built,
          <br />
          <span className="bg-gradient-to-r from-indigo-600 via-blue-600 to-violet-600 bg-clip-text text-transparent">
            not just what you claim.
          </span>
        </h1>

        <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-600 leading-relaxed font-normal">
          Resumes are easy to exaggerate. Proofbase gives engineers, designers, and tech leaders
          a verified platform to showcase architecture artifacts, concrete contributions,
          measurable business outcomes, and time-limited recruiter links.
        </p>

        {/* Hero Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
          <Link
            to="/register"
            style={{ color: '#ffffff' }}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-bold rounded-xl bg-slate-900 text-white hover:bg-slate-800 shadow-md shadow-slate-900/15 transition-all hover:scale-[1.02] cursor-pointer"
          >
            <span>Create Your Portfolio</span>
            <ArrowRight className="w-4 h-4 text-white" />
          </Link>
          <Link
            to="/discover"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-bold rounded-xl bg-white text-slate-800 hover:bg-slate-50 border border-slate-200/90 shadow-2xs transition-all cursor-pointer"
          >
            <Compass className="w-4 h-4 text-slate-500" />
            <span>Explore Community Showcase</span>
          </Link>
        </div>

        {/* Trust Badges */}
        <div className="pt-6 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs font-semibold text-slate-500">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-indigo-600" />
            <span>Verifiable Evidence Artifacts</span>
          </div>
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-blue-600" />
            <span>Time-Limited Recruiter Tokens</span>
          </div>
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-emerald-600" />
            <span>Real-time Telemetry & Views</span>
          </div>
        </div>
      </section>

      {/* ─── Interactive Live Candidate Window ─────────────────────────── */}
      <section className="max-w-5xl mx-auto px-4">
        <div className="text-center max-w-xl mx-auto mb-8 space-y-2">
          <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider block">
            Interactive 1-Click Simulator
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            See How Verifiable Portfolios Look
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Switch between profiles and launch an instant demo account without registering
          </p>
        </div>

        {/* Mac OS Window Frame */}
        <div className="rounded-3xl border border-slate-200/90 bg-white shadow-2xl overflow-hidden">
          {/* Window Chrome Header */}
          <div className="bg-slate-100/80 px-4 sm:px-6 py-3.5 border-b border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-rose-400 inline-block" />
              <span className="w-3 h-3 rounded-full bg-amber-400 inline-block" />
              <span className="w-3 h-3 rounded-full bg-emerald-400 inline-block" />
              <div className="ml-3 px-3 py-1 rounded-md bg-white border border-slate-200/80 text-[11px] font-mono text-slate-500 hidden sm:inline-flex items-center gap-1.5 shadow-2xs">
                <Lock className="w-3 h-3 text-emerald-600" />
                proofbase.com/p/{activeProfile.email.split('@')[0]}
              </div>
            </div>

            {/* Candidate Selector Tabs */}
            <div className="flex p-1 bg-slate-200/70 rounded-xl gap-1 shrink-0 self-start sm:self-auto">
              {DEMO_PROFILES.map((prof, idx) => (
                <button
                  key={prof.name}
                  type="button"
                  onClick={() => setSelectedDemoIndex(idx)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    selectedDemoIndex === idx
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {prof.name.split(' ')[0]}
                </button>
              ))}
            </div>
          </div>

          {/* Window Body */}
          <div className="p-6 sm:p-10 space-y-8 bg-slate-50/40">
            {/* Candidate Header Row */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-6 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-blue-600 text-white flex items-center justify-center text-2xl font-bold shadow-md shrink-0">
                  {activeProfile.avatar}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-slate-900">{activeProfile.name}</h3>
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80">
                      ✓ Verified
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-indigo-600 mt-0.5">
                    {activeProfile.role}
                  </p>
                  <p className="text-xs text-slate-500 mt-1 max-w-md">{activeProfile.headline}</p>
                </div>
              </div>

              {/* 1-Click Launch Button */}
              <div className="shrink-0 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => handleLaunchDemo(activeProfile.email)}
                  disabled={demoLoading}
                  style={{ color: '#ffffff' }}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 text-xs font-bold rounded-xl bg-slate-900 text-white hover:bg-slate-800 shadow-md shadow-slate-900/10 transition-all cursor-pointer"
                >
                  {demoLoading ? (
                    <Spinner size="sm" className="text-white" />
                  ) : (
                    <>
                      <span>Sign In as {activeProfile.name.split(' ')[0]} (1-Click)</span>
                      <ArrowRight className="w-3.5 h-3.5 text-white" />
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Spotlight Proof Project Card */}
            <div className="p-6 sm:p-7 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-5">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>Featured Proof Record</span>
                </div>
                <span className="px-2.5 py-0.5 text-[11px] font-bold rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200/80">
                  Architecture & Impact Verified
                </span>
              </div>

              <div>
                <h4 className="text-base sm:text-lg font-bold text-slate-900">
                  {activeProfile.highlightTitle}
                </h4>
                <p className="text-xs sm:text-sm text-slate-600 mt-1.5 leading-relaxed">
                  {activeProfile.highlightDesc}
                </p>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {activeProfile.metrics.map((metric) => (
                  <div
                    key={metric}
                    className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 flex items-center gap-2.5 text-xs font-bold text-slate-800"
                  >
                    <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>{metric}</span>
                  </div>
                ))}
              </div>

              {/* Verified Evidence Artifacts */}
              <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 text-slate-500">
                  <FileCode className="w-4 h-4 text-indigo-500" />
                  <span className="font-semibold text-slate-700">Verifiable Artifacts:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {activeProfile.artifacts.map((art) => (
                      <span
                        key={art}
                        className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono text-[11px]"
                      >
                        {art}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  {activeProfile.skills.slice(0, 4).map((sk) => (
                    <span
                      key={sk}
                      className="px-2 py-0.5 text-[10px] font-semibold rounded bg-slate-100 text-slate-600"
                    >
                      {sk}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Bento Feature Highlights ──────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="text-center max-w-xl mx-auto mb-14 space-y-2">
          <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider block">
            Why Proofbase
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            Engineered for High-Signal Hiring
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Everything you need to turn vague bullet points into verifiable engineering credibility
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          <div className="p-8 rounded-3xl border border-slate-200/80 bg-white shadow-2xs hover:shadow-md transition-all space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100 shadow-2xs">
              <Shield className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Verifiable Work Artifacts</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Upload architecture diagrams, code excerpts, design specs, and benchmark reports.
              Don't just claim you built it—give hiring managers verifiable evidence.
            </p>
          </div>

          <div className="p-8 rounded-3xl border border-slate-200/80 bg-white shadow-2xs hover:shadow-md transition-all space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 shadow-2xs">
              <Share2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Time-Limited Recruiter Links</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Generate secure, expiring links for hiring managers and clients with 7, 14, or 30-day
              access windows, complete with instant revocation controls.
            </p>
          </div>

          <div className="p-8 rounded-3xl border border-slate-200/80 bg-white shadow-2xs hover:shadow-md transition-all space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 shadow-2xs">
              <TrendingUp className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Real Engagement Telemetry</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Track when recruiters open your links, count unique impressions, and discover which
              project evidence captures the most attention from interviewers.
            </p>
          </div>
        </div>
      </section>

      {/* ─── Comparison Table ──────────────────────────────────────────── */}
      <section className="max-w-4xl mx-auto px-4">
        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-10 shadow-xl space-y-6">
          <div className="text-center max-w-md mx-auto space-y-1">
            <h3 className="text-xl font-bold text-slate-900">Resume vs. Proofbase</h3>
            <p className="text-xs text-slate-500">Why top builders stand out with verifiable proof</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">Dimension</th>
                  <th className="py-3 px-4 text-slate-500">Traditional Resume</th>
                  <th className="py-3 px-4 text-indigo-600">Proofbase Verified</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="py-3.5 px-4 font-semibold text-slate-800">Project Evidence</td>
                  <td className="py-3.5 px-4 text-slate-500 flex items-center gap-1.5">
                    <X className="w-4 h-4 text-rose-500" /> Vague claims & buzzwords
                  </td>
                  <td className="py-3.5 px-4 text-slate-900 font-medium">
                    <span className="flex items-center gap-1.5 text-emerald-600 font-semibold">
                      <Check className="w-4 h-4" /> Diagrams, code & benchmarks
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-semibold text-slate-800">Recruiter Privacy</td>
                  <td className="py-3.5 px-4 text-slate-500">
                    <span className="flex items-center gap-1.5">
                      <X className="w-4 h-4 text-rose-500" /> Forwarded static PDFs
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-900 font-medium">
                    <span className="flex items-center gap-1.5 text-emerald-600 font-semibold">
                      <Check className="w-4 h-4" /> Expiring links with 1-click revoke
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-semibold text-slate-800">Engagement Data</td>
                  <td className="py-3.5 px-4 text-slate-500">
                    <span className="flex items-center gap-1.5">
                      <X className="w-4 h-4 text-rose-500" /> Zero visibility if read
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-900 font-medium">
                    <span className="flex items-center gap-1.5 text-emerald-600 font-semibold">
                      <Check className="w-4 h-4" /> Real-time view & link analytics
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-semibold text-slate-800">Hiring Signal</td>
                  <td className="py-3.5 px-4 text-slate-500">
                    <span className="flex items-center gap-1.5">
                      <X className="w-4 h-4 text-rose-500" /> Low trust, high skepticism
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-900 font-medium">
                    <span className="flex items-center gap-1.5 text-emerald-600 font-semibold">
                      <Check className="w-4 h-4" /> High trust, verified proof-of-work
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ─── Bottom CTA Banner ─────────────────────────────────────────── */}
      <section className="max-w-4xl mx-auto px-4">
        <div className="rounded-3xl bg-slate-900 text-white p-8 sm:p-12 text-center space-y-6 relative overflow-hidden shadow-2xl border border-slate-800">
          <div className="absolute top-0 right-1/4 w-80 h-80 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 space-y-3 max-w-xl mx-auto">
            <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Ready to showcase proof that gets you hired?
            </h3>
            <p className="text-xs sm:text-sm text-slate-300">
              Join thousands of engineers and designers who let their craftsmanship speak louder
              than buzzwords.
            </p>
          </div>

          <div className="relative z-10 flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2">
            <Link
              to="/register"
              style={{ color: '#ffffff' }}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 text-xs sm:text-sm font-bold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
            >
              <span>Get Started Free</span>
              <ArrowRight className="w-4 h-4 text-white" />
            </Link>
            <Link
              to="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 text-xs sm:text-sm font-bold rounded-xl bg-white/10 hover:bg-white/15 text-white border border-white/15 transition-all cursor-pointer"
            >
              <span>Sign In to Existing Account</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
