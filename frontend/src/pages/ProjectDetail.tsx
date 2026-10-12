import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api, API_BASE } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import type { Project, ExternalLink, ShareLink } from '../types';
import {
  Button,
  Card,
  VisibilityBadge,
  StatusBadge,
  Spinner,
  Modal,
  Input,
  Select,
} from '../components/ui';
import {
  Calendar,
  Building,
  User,
  Share2,
  Edit,
  Download,
  Trash2,
  ExternalLink as ExtIcon,
  FileText,
  FileCode,
  FileImage,
  FileArchive,
  File,
  Copy,
  Check,
  CheckCircle2,
  ArrowLeft,
  Sparkles,
  Link as LinkIcon,
  Mail,
  Clock,
  Eye,
  Plus,
} from 'lucide-react';

export function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { success: toastSuccess, error: toastError } = useToast();

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  // Share Modal
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [shareLinks, setShareLinks] = useState<ShareLink[]>([]);
  const [expiresInHours, setExpiresInHours] = useState('168'); // 7 days
  const [generatingLink, setGeneratingLink] = useState(false);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  // Email Share
  const [shareEmail, setShareEmail] = useState('');
  const [sendingEmail, setSendingEmail] = useState(false);

  // Add Link Modal
  const [linkModalOpen, setLinkModalOpen] = useState(false);
  const [linkTitle, setLinkTitle] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [linkType, setLinkType] = useState('website');
  const [savingLink, setSavingLink] = useState(false);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const res = await api.get<{ project: Project }>(`/projects/${id}`);
        setProject(res.project);
      } catch (err: any) {
        toastError('Failed to load project details');
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [id, toastError]);

  const isOwner = user && project && user.id === project.userId;

  const loadShareLinks = async () => {
    if (!isOwner) return;
    try {
      const res = await api.get<{ shareLinks: ShareLink[] }>(`/projects/${id}/shares`);
      setShareLinks(res.shareLinks || []);
    } catch {
      // ignore
    }
  };

  const handleOpenShare = () => {
    setShareModalOpen(true);
    loadShareLinks();
  };

  const handleCreateShareLink = async () => {
    setGeneratingLink(true);
    try {
      const hours = expiresInHours ? parseInt(expiresInHours, 10) : undefined;
      const res = await api.post<{ shareLink: ShareLink }>(`/projects/${id}/share`, {
        expiresInHours: hours,
      });
      toastSuccess('Share link created!');
      loadShareLinks();
    } catch (err: any) {
      toastError(err.message || 'Failed to create share link');
    } finally {
      setGeneratingLink(false);
    }
  };

  const handleShareByEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shareEmail) return;
    setSendingEmail(true);
    try {
      await api.post(`/projects/${id}/share/email`, { email: shareEmail });
      toastSuccess(`Shared with ${shareEmail}!`);
      setShareEmail('');
      loadShareLinks();
    } catch (err: any) {
      toastError(err.message || 'Failed to share by email');
    } finally {
      setSendingEmail(false);
    }
  };

  const handleRevokeShareLink = async (shareId: string) => {
    try {
      await api.delete(`/projects/${id}/share/${shareId}`);
      toastSuccess('Share link revoked');
      loadShareLinks();
    } catch (err: any) {
      toastError('Failed to revoke link');
    }
  };

  const copyToClipboard = (url: string, token: string) => {
    navigator.clipboard.writeText(url);
    setCopiedToken(token);
    toastSuccess('Link copied to clipboard!');
    setTimeout(() => setCopiedToken(null), 2500);
  };

  const handleAddLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!linkTitle || !linkUrl) return;
    setSavingLink(true);
    try {
      const res = await api.post<{ link: ExternalLink }>(`/projects/${id}/links`, {
        title: linkTitle,
        url: linkUrl,
        type: linkType,
      });
      toastSuccess('Link added!');
      setProject((prev) =>
        prev ? { ...prev, externalLinks: [...(prev.externalLinks || []), res.link] } : null
      );
      setLinkModalOpen(false);
      setLinkTitle('');
      setLinkUrl('');
    } catch (err: any) {
      toastError(err.message || 'Failed to add link');
    } finally {
      setSavingLink(false);
    }
  };

  const handleDeleteLink = async (linkId: string) => {
    try {
      await api.delete(`/projects/${id}/links/${linkId}`);
      toastSuccess('Link removed');
      setProject((prev) =>
        prev
          ? {
              ...prev,
              externalLinks: (prev.externalLinks || []).filter((l) => l.id !== linkId),
            }
          : null
      );
    } catch (err: any) {
      toastError('Failed to remove link');
    }
  };

  const handleDeleteFile = async (fileId: string) => {
    try {
      await api.delete(`/projects/${id}/files/${fileId}`);
      toastSuccess('File removed');
      setProject((prev) =>
        prev
          ? {
              ...prev,
              files: (prev.files || []).filter((f) => f.id !== fileId),
            }
          : null
      );
    } catch (err: any) {
      toastError('Failed to remove file');
    }
  };

  if (loading) {
    return (
      <div className="py-24 flex justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="max-w-2xl mx-auto py-16 px-4 text-center">
        <h2 className="text-xl font-bold text-zinc-900">Project Not Found</h2>
        <p className="text-sm text-zinc-500 mt-2">
          This project may be private or has been removed.
        </p>
        <Link
          to="/"
          className="mt-6 inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-zinc-900 text-white"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>
      </div>
    );
  }

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

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
      {/* Navigation Breadcrumb */}
      <div className="flex items-center justify-between">
        <Link
          to="/projects"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-500 hover:text-zinc-900 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Projects
        </Link>

        {isOwner && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              icon={<Share2 className="w-3.5 h-3.5" />}
              onClick={handleOpenShare}
            >
              Share with Recruiters
            </Button>
            <Link to={`/projects/${project.id}/edit`}>
              <Button size="sm" icon={<Edit className="w-3.5 h-3.5" />}>
                Edit Project
              </Button>
            </Link>
          </div>
        )}
      </div>

      {/* Hero Showcase Card */}
      <div className="bg-white border border-zinc-200/90 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
        <div className="space-y-3">
          <div className="flex items-center gap-2 flex-wrap">
            <StatusBadge status={project.status} />
            <VisibilityBadge visibility={project.visibility} />
            {project.category && (
              <span className="px-2.5 py-0.5 rounded-full bg-blue-50 border border-blue-200/60 text-blue-700 text-xs font-semibold">
                {project.category}
              </span>
            )}
            {project.isFeatured && (
              <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 text-xs font-semibold">
                ★ Featured
              </span>
            )}
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-zinc-950">
            {project.name}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-zinc-600 font-medium">
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
          <p className="text-sm sm:text-base text-zinc-700 leading-relaxed max-w-4xl border-t border-zinc-100 pt-5">
            {project.description}
          </p>
        )}

        {/* Skills Tag Cloud */}
        {project.skills && project.skills.length > 0 && (
          <div className="space-y-2 pt-2">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">
              Core Technologies & Competencies
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

      {/* Contributions Breakdown (Proof of Work) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Responsibilities */}
        <Card padding="md" className="border-zinc-200/90 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-zinc-900 uppercase tracking-wider">
            <div className="w-2 h-2 rounded-full bg-blue-600" />
            Key Responsibilities
          </div>
          <p className="text-xs sm:text-sm text-zinc-600 whitespace-pre-line leading-relaxed">
            {project.responsibilities || 'Specific day-to-day contributions were not detailed.'}
          </p>
        </Card>

        {/* Achievements */}
        <Card padding="md" className="border-zinc-200/90 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-zinc-900 uppercase tracking-wider">
            <div className="w-2 h-2 rounded-full bg-emerald-600" />
            Engineering Achievements
          </div>
          <p className="text-xs sm:text-sm text-zinc-600 whitespace-pre-line leading-relaxed">
            {project.achievements || 'Major milestones or architectural accomplishments not detailed.'}
          </p>
        </Card>

        {/* Measurable Outcomes */}
        <Card padding="md" className="border-zinc-200/90 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-zinc-900 uppercase tracking-wider">
            <div className="w-2 h-2 rounded-full bg-indigo-600" />
            Measurable Outcomes & ROI
          </div>
          <p className="text-xs sm:text-sm text-zinc-600 whitespace-pre-line leading-relaxed">
            {project.outcomes || 'Quantifiable business metrics or user impact not detailed.'}
          </p>
        </Card>
      </div>

      {/* Proof Artifacts / Files Section */}
      <div className="bg-white border border-zinc-200/90 rounded-2xl p-6 sm:p-8 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-zinc-900 tracking-tight">Verified Work Artifacts</h2>
            <p className="text-xs text-zinc-500">Design specs, code samples, presentations & documentation</p>
          </div>
          <span className="text-xs font-medium text-zinc-400">
            {project.files?.length || 0} attached files
          </span>
        </div>

        {(!project.files || project.files.length === 0) ? (
          <div className="py-8 text-center border border-dashed border-zinc-200 rounded-xl">
            <File className="w-8 h-8 text-zinc-300 mx-auto mb-2" />
            <p className="text-xs text-zinc-500">No proof files attached to this project.</p>
            {isOwner && (
              <Link
                to={`/projects/${project.id}/edit`}
                className="mt-2 inline-block text-xs font-semibold text-blue-600 hover:text-blue-700"
              >
                Upload evidence artifacts
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {project.files.map((file) => (
              <div
                key={file.id}
                className="flex items-center justify-between p-3.5 rounded-xl border border-zinc-200/80 bg-zinc-50/50 hover:bg-white hover:border-zinc-300 hover:shadow-xs transition-all"
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

                <div className="flex items-center gap-1 shrink-0 ml-2">
                  <a
                    href={`${API_BASE}/projects/${project.id}/files/${file.id}/download`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1.5 rounded-lg text-zinc-500 hover:text-blue-600 hover:bg-zinc-100 transition-colors"
                    title="Download File"
                  >
                    <Download className="w-4 h-4" />
                  </a>
                  {isOwner && (
                    <button
                      type="button"
                      onClick={() => handleDeleteFile(file.id)}
                      className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      title="Remove File"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* External Links Section */}
      <div className="bg-white border border-zinc-200/90 rounded-2xl p-6 sm:p-8 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-zinc-900 tracking-tight">External Links & Live Demos</h2>
            <p className="text-xs text-zinc-500">Live websites, repositories, Figma designs & documentation</p>
          </div>
          {isOwner && (
            <Button
              variant="outline"
              size="sm"
              icon={<Plus className="w-3.5 h-3.5" />}
              onClick={() => setLinkModalOpen(true)}
            >
              Add Link
            </Button>
          )}
        </div>

        {(!project.externalLinks || project.externalLinks.length === 0) ? (
          <div className="py-8 text-center border border-dashed border-zinc-200 rounded-xl">
            <LinkIcon className="w-8 h-8 text-zinc-300 mx-auto mb-2" />
            <p className="text-xs text-zinc-500">No external links attached.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {project.externalLinks.map((link) => (
              <div
                key={link.id}
                className="flex items-center justify-between p-3.5 rounded-xl border border-zinc-200/80 bg-zinc-50/50 hover:bg-white hover:border-zinc-300 transition-all"
              >
                <a
                  href={link.url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2.5 overflow-hidden flex-1 group"
                >
                  <ExtIcon className="w-4 h-4 text-zinc-400 group-hover:text-blue-600 shrink-0" />
                  <div className="overflow-hidden">
                    <p className="text-xs font-bold text-zinc-800 group-hover:text-blue-600 truncate">
                      {link.title}
                    </p>
                    <p className="text-[11px] text-zinc-400 truncate">{link.url}</p>
                  </div>
                </a>

                {isOwner && (
                  <button
                    type="button"
                    onClick={() => handleDeleteLink(link.id)}
                    className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-600 hover:bg-rose-50 shrink-0 ml-2"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Share Modal */}
      <Modal
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        title="Share Project with Recruiters & Clients"
        size="lg"
      >
        <div className="space-y-6">
          {/* Generate Link Block */}
          <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200 space-y-3">
            <h4 className="text-xs font-bold text-zinc-900 uppercase tracking-wider">
              Create Secure Shareable Link
            </h4>
            <div className="flex items-center gap-2">
              <select
                value={expiresInHours}
                onChange={(e) => setExpiresInHours(e.target.value)}
                className="px-3 py-2 text-xs font-medium border border-zinc-200 rounded-lg bg-white text-zinc-800 focus:outline-none"
              >
                <option value="24">Expires in 24 Hours</option>
                <option value="168">Expires in 7 Days</option>
                <option value="720">Expires in 30 Days</option>
                <option value="">Never Expires</option>
              </select>

              <Button
                size="sm"
                loading={generatingLink}
                onClick={handleCreateShareLink}
                icon={<LinkIcon className="w-3.5 h-3.5" />}
              >
                Generate Link
              </Button>
            </div>
          </div>

          {/* Share by Email */}
          <form onSubmit={handleShareByEmail} className="space-y-2">
            <h4 className="text-xs font-bold text-zinc-900 uppercase tracking-wider">
              Or Send Access Directly via Email
            </h4>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="recruiter@company.com"
                value={shareEmail}
                onChange={(e) => setShareEmail(e.target.value)}
                className="flex-1 px-3 py-2 text-xs border border-zinc-200 rounded-lg bg-white text-zinc-900 focus:outline-none"
                required
              />
              <Button
                type="submit"
                size="sm"
                variant="secondary"
                loading={sendingEmail}
                icon={<Mail className="w-3.5 h-3.5" />}
              >
                Send Invite
              </Button>
            </div>
          </form>

          {/* Existing Links Table */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-zinc-900 uppercase tracking-wider">
              Active Share Links ({shareLinks.filter((l) => l.isActive).length})
            </h4>

            {shareLinks.length === 0 ? (
              <p className="text-xs text-zinc-400 py-2">No share links generated yet.</p>
            ) : (
              <div className="divide-y divide-zinc-100 border border-zinc-200 rounded-xl overflow-hidden max-h-60 overflow-y-auto">
                {shareLinks.map((link) => (
                  <div
                    key={link.id}
                    className={`p-3 text-xs flex items-center justify-between gap-3 ${
                      link.isActive ? 'bg-white' : 'bg-zinc-50 opacity-60'
                    }`}
                  >
                    <div className="overflow-hidden space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[11px] font-semibold text-zinc-800">
                          /shared/{link.token.slice(0, 8)}...
                        </span>
                        {link.isActive ? (
                          <span className="px-1.5 py-0.2 rounded text-[10px] bg-emerald-100 text-emerald-700 font-semibold">
                            Active
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.2 rounded text-[10px] bg-zinc-200 text-zinc-600 font-semibold">
                            Revoked
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-zinc-400">
                        {link.accessCount} visits • {link.expiresAt ? `Expires ${new Date(link.expiresAt).toLocaleDateString()}` : 'Never expires'}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      {link.isActive && (
                        <>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(link.url, link.token)}
                            className="p-1.5 rounded-lg border border-zinc-200 hover:bg-zinc-100 text-zinc-700 transition-colors"
                            title="Copy Link"
                          >
                            {copiedToken === link.token ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRevokeShareLink(link.id)}
                            className="text-xs text-rose-600 hover:text-rose-800 font-medium"
                          >
                            Revoke
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </Modal>

      {/* Add External Link Modal */}
      <Modal
        isOpen={linkModalOpen}
        onClose={() => setLinkModalOpen(false)}
        title="Add External Proof Link"
        size="sm"
      >
        <form onSubmit={handleAddLink} className="space-y-4">
          <Input
            label="Title"
            placeholder="e.g. GitHub Repository, Live Demo, Figma"
            value={linkTitle}
            onChange={(e) => setLinkTitle(e.target.value)}
            required
          />

          <Input
            label="URL"
            type="url"
            placeholder="https://..."
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            required
          />

          <Select
            label="Link Type"
            value={linkType}
            onChange={(e) => setLinkType(e.target.value)}
            options={[
              { value: 'github', label: 'GitHub Repository' },
              { value: 'gitlab', label: 'GitLab Repository' },
              { value: 'website', label: 'Live Website / Demo' },
              { value: 'figma', label: 'Figma Design' },
              { value: 'docs', label: 'Documentation' },
              { value: 'other', label: 'Other Link' },
            ]}
          />

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setLinkModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" loading={savingLink}>
              Save Link
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
