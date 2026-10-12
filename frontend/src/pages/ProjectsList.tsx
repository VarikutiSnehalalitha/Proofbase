import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import { useToast } from '../contexts/ToastContext';
import type { Project } from '../types';
import {
  Button,
  Input,
  Select,
  Card,
  VisibilityBadge,
  StatusBadge,
  Spinner,
  EmptyState,
  Modal,
} from '../components/ui';
import {
  FolderKanban,
  Plus,
  Search,
  Filter,
  Trash2,
  Edit,
  Share2,
  ExternalLink,
  ChevronRight,
  Globe,
  Lock,
  Users,
  LayoutGrid,
  List as ListIcon,
  Sparkles,
} from 'lucide-react';

export function ProjectsListPage() {
  const { success: toastSuccess, error: toastError } = useToast();

  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState('');
  const [visibility, setVisibility] = useState('');
  const [sort, setSort] = useState('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (category) params.append('category', category);
      if (status) params.append('status', status);
      if (visibility) params.append('visibility', visibility);
      if (sort) params.append('sort', sort);

      const res = await api.get<{ projects: Project[] }>(`/projects?${params.toString()}`);
      setProjects(res.projects || []);
    } catch (err: any) {
      toastError('Failed to load projects');
    } finally {
      setLoading(false);
    }
  }, [search, category, status, visibility, sort, toastError]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProjects();
    }, 200);
    return () => clearTimeout(timer);
  }, [fetchProjects]);

  const handleDelete = async () => {
    if (!projectToDelete) return;
    setDeleting(true);
    try {
      await api.delete(`/projects/${projectToDelete.id}`);
      toastSuccess(`Deleted "${projectToDelete.name}"`);
      setProjects((prev) => prev.filter((p) => p.id !== projectToDelete.id));
      setDeleteModalOpen(false);
    } catch (err: any) {
      toastError(err.message || 'Failed to delete project');
    } finally {
      setDeleting(false);
      setProjectToDelete(null);
    }
  };

  const handleToggleStatus = async (project: Project) => {
    const newStatus = project.status === 'published' ? 'draft' : 'published';
    try {
      const res = await api.patch<{ project: Project }>(`/projects/${project.id}/status`, {
        status: newStatus,
      });
      toastSuccess(`Project ${newStatus === 'published' ? 'published' : 'moved to drafts'}`);
      setProjects((prev) => prev.map((p) => (p.id === project.id ? res.project : p)));
    } catch (err: any) {
      toastError(err.message || 'Failed to update project status');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">Your Projects</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage your verified proof-of-work entries, architecture artifacts, and share links
          </p>
        </div>
        <Link
          to="/projects/new"
          style={{ color: '#ffffff' }}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-xl bg-slate-900 hover:bg-slate-800 text-white shadow-sm transition-all"
        >
          <Plus className="w-4 h-4 text-white" />
          <span>New Project</span>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <Card padding="md" className="border-zinc-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by title, role, or description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm border border-zinc-200 rounded-lg bg-white text-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-colors"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="px-3 py-2 text-xs font-medium border border-zinc-200 rounded-lg bg-white text-zinc-700 focus:outline-none"
            >
              <option value="">All Statuses</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
              <option value="archived">Archived</option>
            </select>

            <select
              value={visibility}
              onChange={(e) => setVisibility(e.target.value)}
              className="px-3 py-2 text-xs font-medium border border-zinc-200 rounded-lg bg-white text-zinc-700 focus:outline-none"
            >
              <option value="">All Visibility</option>
              <option value="public">Public</option>
              <option value="private">Private</option>
              <option value="shared">Shared</option>
            </select>

            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="px-3 py-2 text-xs font-medium border border-zinc-200 rounded-lg bg-white text-zinc-700 focus:outline-none"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="name">Name A-Z</option>
              <option value="updated">Recently Updated</option>
            </select>

            <div className="border-l border-zinc-200 pl-2 flex items-center gap-1">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === 'grid' ? 'bg-zinc-100 text-zinc-900' : 'text-zinc-400 hover:text-zinc-600'
                }`}
                title="Grid View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === 'list' ? 'bg-zinc-100 text-zinc-900' : 'text-zinc-400 hover:text-zinc-600'
                }`}
                title="List View"
              >
                <ListIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </Card>

      {/* Projects Display */}
      {loading ? (
        <div className="py-20 flex justify-center">
          <Spinner size="lg" />
        </div>
      ) : projects.length === 0 ? (
        <Card padding="lg" className="border-dashed border-zinc-300">
          <EmptyState
            icon={<FolderKanban className="w-6 h-6" />}
            title="No matching projects found"
            description={
              search || status || visibility
                ? 'Try adjusting your filters or search keywords.'
                : 'Start documenting your work with verifiable evidence, responsibilities, and outcomes.'
            }
            action={
              <Link
                to="/projects/new"
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-zinc-900 text-white hover:bg-zinc-800"
              >
                <Plus className="w-4 h-4" />
                Create New Project
              </Link>
            }
          />
        </Card>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((proj) => (
            <Card key={proj.id} hover className="flex flex-col justify-between border-zinc-200 p-5 group">
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <StatusBadge status={proj.status} />
                    <VisibilityBadge visibility={proj.visibility} />
                    {proj.isFeatured && (
                      <span className="inline-flex items-center px-1.5 py-0.5 text-[11px] font-semibold rounded bg-amber-100 text-amber-800">
                        ★ Featured
                      </span>
                    )}
                  </div>
                  {proj.category && (
                    <span className="text-[11px] font-medium text-zinc-400 capitalize">
                      {proj.category}
                    </span>
                  )}
                </div>

                <Link to={`/projects/${proj.id}`} className="block group-hover:text-blue-600 transition-colors">
                  <h3 className="text-base font-bold text-zinc-900 line-clamp-1">{proj.name}</h3>
                </Link>

                {proj.role && (
                  <p className="text-xs font-medium text-zinc-600 mt-1">
                    {proj.role} {proj.organization ? `@ ${proj.organization}` : ''}
                  </p>
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
                        key={s.id || s.name}
                        className="px-2 py-0.5 text-[11px] font-medium rounded bg-zinc-100 text-zinc-600"
                      >
                        {s.name}
                      </span>
                    ))}
                    {proj.skills.length > 4 && (
                      <span className="px-1.5 py-0.5 text-[11px] text-zinc-400 font-medium">
                        +{proj.skills.length - 4}
                      </span>
                    )}
                  </div>
                )}
              </div>

              <div className="pt-4 mt-4 border-t border-zinc-100 flex items-center justify-between text-xs text-zinc-500">
                <button
                  type="button"
                  onClick={() => handleToggleStatus(proj)}
                  className={`text-[11px] font-medium px-2 py-1 rounded transition-colors ${
                    proj.status === 'published'
                      ? 'bg-zinc-100 hover:bg-zinc-200 text-zinc-700'
                      : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700'
                  }`}
                >
                  {proj.status === 'published' ? 'Unpublish' : 'Publish'}
                </button>

                <div className="flex items-center gap-1.5">
                  <Link
                    to={`/projects/${proj.id}/edit`}
                    className="p-1.5 rounded-md hover:bg-zinc-100 text-zinc-500 hover:text-zinc-900 transition-colors"
                    title="Edit"
                  >
                    <Edit className="w-4 h-4" />
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      setProjectToDelete(proj);
                      setDeleteModalOpen(true);
                    }}
                    className="p-1.5 rounded-md hover:bg-rose-50 text-zinc-400 hover:text-rose-600 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <Link
                    to={`/projects/${proj.id}`}
                    className="ml-1 inline-flex items-center gap-1 font-semibold text-zinc-900 hover:text-blue-600 transition-colors"
                  >
                    View
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        /* List View */
        <Card padding="none" className="divide-y divide-zinc-200/80 overflow-hidden border-zinc-200">
          {projects.map((proj) => (
            <div
              key={proj.id}
              className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-zinc-50/50 transition-colors"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Link
                    to={`/projects/${proj.id}`}
                    className="text-sm font-bold text-zinc-900 hover:text-blue-600 transition-colors"
                  >
                    {proj.name}
                  </Link>
                  <StatusBadge status={proj.status} />
                  <VisibilityBadge visibility={proj.visibility} />
                  {proj.isFeatured && (
                    <span className="text-[11px] font-semibold text-amber-700">★ Featured</span>
                  )}
                </div>
                <p className="text-xs text-zinc-500">
                  {proj.role ? `${proj.role} ` : ''}
                  {proj.organization ? `@ ${proj.organization} • ` : ''}
                  {proj._count?.files ?? 0} proof files • {proj._count?.externalLinks ?? 0} links
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => handleToggleStatus(proj)}
                  className="text-xs font-medium text-zinc-600 hover:text-zinc-900"
                >
                  {proj.status === 'published' ? 'Unpublish' : 'Publish'}
                </button>
                <Link
                  to={`/projects/${proj.id}/edit`}
                  className="p-1.5 rounded text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100"
                  title="Edit"
                >
                  <Edit className="w-4 h-4" />
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setProjectToDelete(proj);
                    setDeleteModalOpen(true);
                  }}
                  className="p-1.5 rounded text-zinc-400 hover:text-rose-600 hover:bg-rose-50"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <Link
                  to={`/projects/${proj.id}`}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-zinc-900 text-white hover:bg-zinc-800"
                >
                  Showcase
                </Link>
              </div>
            </div>
          ))}
        </Card>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Delete Project"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-zinc-600 leading-relaxed">
            Are you sure you want to delete <strong>"{projectToDelete?.name}"</strong>? This will permanently remove all associated proof files, external links, and share links.
          </p>
          <div className="flex items-center justify-end gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDeleteModalOpen(false)}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              loading={deleting}
              onClick={handleDelete}
            >
              Delete Project
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
