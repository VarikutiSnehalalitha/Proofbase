import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api, API_BASE } from '../lib/api';
import type { Project } from '../types';
import {
  Button,
  Card,
  Spinner,
} from '../components/ui';
import {
  ShieldCheck,
  Calendar,
  Building,
  User,
  Download,
  ExternalLink as ExtIcon,
  FileText,
  FileCode,
  FileImage,
  FileArchive,
  File,
  Copy,
  Check,
  Mail,
  ArrowRight,
} from 'lucide-react';

export function SharedProjectPage() {
  const { token } = useParams<{ token: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchShared = async () => {
      try {
        const res = await api.get<{ project: Project }>(`/share/access/${token}`);
        setProject(res.project);
      } catch (err: any) {
        setError(err.message || 'This share link is invalid or has expired.');
      } finally {
        setLoading(false);
      }
    };

    fetchShared();
  }, [token]);

  const copyUrl = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const getFileIcon = (mime: string) => {
    if (mime.includes('image')) return <FileImage className="w-5 h-5 text-indigo-500" />;
    if (mime.includes('pdf')) return <FileText className="w-5 h-5 text-rose-500" />;
    if (mime.includes('zip') || mime.includes('tar')) return <FileArchive className="w-5 h-5 text-amber-500" />;
    if (mime.includes('javascript') || mime.includes('json') || mime.includes('python'))
      return <FileCode className="w-5 h-5 text-emerald-500" />;
    return <File className="w-5 h-5 text-blue-500" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  if (loading) {
    return (
      <div className="py-24 flex justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="max-w-md mx-auto py-24 px-4 text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-zinc-900">Access Restricted</h2>
        <p className="text-xs text-zinc-500 leading-relaxed">
          {error || 'This share link has expired or been revoked by the author.'}
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-zinc-900 text-white"
        >
          Go to Proofbase Home
        </Link>
      </div>
    );
  }

  const authorProfile = project.user?.profile;
  const authorUsername = project.user?.username;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-fadeIn">
      {/* Top Verified Banner for Recruiters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-blue-50/80 border border-blue-200/80 text-blue-900 text-xs font-medium">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0" />
          <span>
            You are viewing a verified proof-of-work record shared via secure token.
          </span>
        </div>
        <button
          type="button"
          onClick={copyUrl}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-blue-200 text-blue-800 font-semibold hover:bg-blue-50 transition-colors shrink-0"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
          {copied ? 'Copied Link' : 'Copy Share Link'}
        </button>
      </div>

      {/* Candidate Author Pill */}
      {authorUsername && (
        <div className="p-4 rounded-2xl bg-white border border-zinc-200 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-zinc-900 text-white flex items-center justify-center font-bold text-sm overflow-hidden">
              {authorProfile?.avatarUrl ? (
                <img src={authorProfile.avatarUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                (authorProfile?.name?.[0] || authorUsername[0]).toUpperCase()
              )}
            </div>
            <div>
              <p className="text-sm font-bold text-zinc-900">
                {authorProfile?.name || authorUsername}
              </p>
              <p className="text-xs text-zinc-500">
                {authorProfile?.headline || 'Portfolio Creator'}
              </p>
            </div>
          </div>

          <Link
            to={`/p/${authorUsername}`}
            className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700"
          >
            View Candidate Portfolio
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* Main Project Showcase */}
      <div className="bg-white border border-zinc-200/90 rounded-2xl p-6 sm:p-8 space-y-6">
        <div className="space-y-2">
          {project.category && (
            <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200/60 inline-block">
              {project.category}
            </span>
          )}
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-zinc-950">
            {project.name}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-zinc-600 font-medium pt-1">
            {project.role && (
              <div className="flex items-center gap-1.5">
                <User className="w-4 h-4 text-zinc-400" />
                <span>{project.role}</span>
              </div>
            )}
            {project.organization && (
              <div className="flex items-center gap-1.5">
                <Building className="w-4 h-4 text-zinc-400" />
                <span>{project.organization}</span>
              </div>
            )}
            {(project.startDate || project.endDate) && (
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-zinc-400" />
                <span>
                  {project.startDate ? new Date(project.startDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short' }) : 'Start'}
                  {' — '}
                  {project.endDate ? new Date(project.endDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short' }) : 'Present'}
                </span>
              </div>
            )}
          </div>
        </div>

        {project.description && (
          <p className="text-sm sm:text-base text-zinc-700 leading-relaxed border-t border-zinc-100 pt-5">
            {project.description}
          </p>
        )}

        {/* Skills */}
        {project.skills && project.skills.length > 0 && (
          <div className="space-y-2 pt-2">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">
              Core Technologies Used
            </span>
            <div className="flex flex-wrap gap-1.5">
              {project.skills.map((s) => (
                <span
                  key={s.id || s.name}
                  className="px-2.5 py-1 text-xs font-medium rounded-lg bg-zinc-100 text-zinc-800 border border-zinc-200/60"
                >
                  {s.name}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Contributions Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card padding="md" className="border-zinc-200/90 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-zinc-900 uppercase tracking-wider">
            <div className="w-2 h-2 rounded-full bg-blue-600" />
            Direct Responsibilities
          </div>
          <p className="text-xs sm:text-sm text-zinc-600 whitespace-pre-line leading-relaxed">
            {project.responsibilities || 'Specific day-to-day responsibilities not detailed.'}
          </p>
        </Card>

        <Card padding="md" className="border-zinc-200/90 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-zinc-900 uppercase tracking-wider">
            <div className="w-2 h-2 rounded-full bg-emerald-600" />
            Engineering Achievements
          </div>
          <p className="text-xs sm:text-sm text-zinc-600 whitespace-pre-line leading-relaxed">
            {project.achievements || 'Key milestones not detailed.'}
          </p>
        </Card>

        <Card padding="md" className="border-zinc-200/90 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-zinc-900 uppercase tracking-wider">
            <div className="w-2 h-2 rounded-full bg-indigo-600" />
            Measurable Outcomes
          </div>
          <p className="text-xs sm:text-sm text-zinc-600 whitespace-pre-line leading-relaxed">
            {project.outcomes || 'Impact not detailed.'}
          </p>
        </Card>
      </div>

      {/* Proof Artifacts */}
      {project.files && project.files.length > 0 && (
        <div className="bg-white border border-zinc-200/90 rounded-2xl p-6 sm:p-8 space-y-4">
          <h2 className="text-lg font-bold text-zinc-900 tracking-tight">Attached Proof Files</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {project.files.map((file) => (
              <div
                key={file.id}
                className="flex items-center justify-between p-3.5 rounded-xl border border-zinc-200/80 bg-zinc-50/50"
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="shrink-0">{getFileIcon(file.mimeType)}</div>
                  <div className="overflow-hidden">
                    <p className="text-xs font-bold text-zinc-800 truncate" title={file.originalName}>
                      {file.originalName}
                    </p>
                    <p className="text-[11px] text-zinc-400">{formatFileSize(file.size)}</p>
                  </div>
                </div>

                <a
                  href={`${API_BASE}/projects/${project.id}/files/${file.id}/download`}
                  target="_blank"
                  rel="noreferrer"
                  className="p-1.5 rounded-lg text-zinc-500 hover:text-blue-600 hover:bg-zinc-100 transition-colors"
                  title="Download File"
                >
                  <Download className="w-4 h-4" />
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* External Links */}
      {project.externalLinks && project.externalLinks.length > 0 && (
        <div className="bg-white border border-zinc-200/90 rounded-2xl p-6 sm:p-8 space-y-4">
          <h2 className="text-lg font-bold text-zinc-900 tracking-tight">External Links & Proof</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {project.externalLinks.map((link) => (
              <a
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2.5 p-3.5 rounded-xl border border-zinc-200/80 bg-zinc-50/50 hover:bg-white hover:border-zinc-300 transition-all group"
              >
                <ExtIcon className="w-4 h-4 text-zinc-400 group-hover:text-blue-600 shrink-0" />
                <div className="overflow-hidden">
                  <p className="text-xs font-bold text-zinc-800 group-hover:text-blue-600 truncate">
                    {link.title}
                  </p>
                  <p className="text-[11px] text-zinc-400 truncate">{link.url}</p>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
