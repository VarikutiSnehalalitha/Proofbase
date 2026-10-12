import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import { useToast } from '../contexts/ToastContext';
import type { AnalyticsOverview } from '../types';
import {
  Card,
  Spinner,
} from '../components/ui';
import {
  BarChart3,
  Eye,
  Users,
  Share2,
  TrendingUp,
  FolderKanban,
  Clock,
  Sparkles,
} from 'lucide-react';

export function AnalyticsPage() {
  const { error: toastError } = useToast();
  const [data, setData] = useState<AnalyticsOverview | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await api.get<AnalyticsOverview>('/analytics/overview');
        setData(res);
      } catch (err: any) {
        toastError('Failed to load analytics data');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [toastError]);

  if (loading) {
    return (
      <div className="py-24 flex justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="py-20 text-center">
        <p className="text-sm text-zinc-500">No analytics data available yet.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Engagement Analytics</h1>
        <p className="text-xs sm:text-sm text-zinc-500 mt-1">
          Detailed metrics on recruiter visits, project impressions, and share activity
        </p>
      </div>

      {/* Top 4 Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card padding="md" className="border-zinc-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-500">Project Views (30 Days)</span>
            <Eye className="w-4 h-4 text-blue-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-zinc-900">
              {data.views.projectViews.last30Days}
            </span>
            <span className="text-xs text-zinc-400">
              ({data.views.projectViews.total} all-time)
            </span>
          </div>
        </Card>

        <Card padding="md" className="border-zinc-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-500">Profile Views</span>
            <Users className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-zinc-900">
              {data.views.profileViews.total}
            </span>
            <span className="text-xs text-zinc-400">
              ({data.views.profileViews.uniqueVisitors} unique)
            </span>
          </div>
        </Card>

        <Card padding="md" className="border-zinc-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-500">Active Share Links</span>
            <Share2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-zinc-900">{data.shareActivity}</span>
            <span className="text-xs text-zinc-400">active tokens</span>
          </div>
        </Card>

        <Card padding="md" className="border-zinc-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-500">Portfolio Distribution</span>
            <FolderKanban className="w-4 h-4 text-zinc-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-zinc-900">
              {data.projects.public}
            </span>
            <span className="text-xs text-zinc-400">public / {data.projects.total} total</span>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Most Viewed Projects Leaderboard */}
        <Card padding="lg" className="border-zinc-200 space-y-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-blue-600" />
            <h2 className="text-sm font-bold text-zinc-900 uppercase tracking-wider">
              Most Viewed Projects
            </h2>
          </div>

          {(!data.popularProjects || data.popularProjects.length === 0) ? (
            <p className="text-xs text-zinc-400 italic py-6 text-center">
              No project views recorded yet.
            </p>
          ) : (
            <div className="divide-y divide-zinc-100 border border-zinc-200 rounded-xl overflow-hidden">
              {data.popularProjects.map((item, idx) => (
                <div
                  key={item.projectId}
                  className="p-3.5 flex items-center justify-between gap-3 text-xs bg-white hover:bg-zinc-50/70 transition-colors"
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <span className="w-5 font-bold text-zinc-400 text-center">#{idx + 1}</span>
                    <div className="overflow-hidden">
                      <Link
                        to={`/projects/${item.projectId}`}
                        className="font-bold text-zinc-900 hover:text-blue-600 truncate block"
                      >
                        {item.project?.name || 'Project'}
                      </Link>
                      <span className="text-[11px] text-zinc-400">
                        {item.project?.category || 'General'}
                      </span>
                    </div>
                  </div>

                  <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 font-bold text-xs shrink-0">
                    {item.views} {item.views === 1 ? 'view' : 'views'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Recent Activity Timeline */}
        <Card padding="lg" className="border-zinc-200 space-y-4">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-indigo-600" />
            <h2 className="text-sm font-bold text-zinc-900 uppercase tracking-wider">
              Recent Activity Audit
            </h2>
          </div>

          {(!data.recentActivity || data.recentActivity.length === 0) ? (
            <p className="text-xs text-zinc-400 italic py-6 text-center">
              No recent activity logs.
            </p>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
              {data.recentActivity.map((log) => (
                <div
                  key={log.id}
                  className="p-3 rounded-xl border border-zinc-200/80 bg-zinc-50/50 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-zinc-900 capitalize">
                        {log.action} {log.entityType}
                      </span>
                    </div>
                    <span className="text-[11px] text-zinc-400">
                      {new Date(log.createdAt).toLocaleString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-white border border-zinc-200 text-zinc-600">
                    {log.action}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
