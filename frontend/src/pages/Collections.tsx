import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import { useToast } from '../contexts/ToastContext';
import type { Collection, Project } from '../types';
import {
  Button,
  Card,
  Spinner,
  EmptyState,
  Modal,
  Input,
  Textarea,
} from '../components/ui';
import {
  Layers,
  Plus,
  Trash2,
  FolderKanban,
  ChevronRight,
  ChevronDown,
  X,
  ExternalLink,
} from 'lucide-react';

export function CollectionsPage() {
  const { success: toastSuccess, error: toastError } = useToast();

  const [collections, setCollections] = useState<Collection[]>([]);
  const [userProjects, setUserProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  // Create Collection Modal
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [creating, setCreating] = useState(false);

  // Add Project to Collection Modal
  const [addToCol, setAddToCol] = useState<Collection | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [adding, setAdding] = useState(false);

  // Expanded collection IDs
  const [expandedColIds, setExpandedColIds] = useState<string[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const [colsRes, projsRes] = await Promise.all([
          api.get<{ collections: Collection[] }>('/collections'),
          api.get<{ projects: Project[] }>('/projects'),
        ]);
        setCollections(colsRes.collections || []);
        setUserProjects(projsRes.projects || []);
        if (colsRes.collections?.length > 0) {
          setExpandedColIds([colsRes.collections[0].id]);
        }
      } catch (err: any) {
        toastError('Failed to load collections');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [toastError]);

  const toggleExpand = (colId: string) => {
    setExpandedColIds((prev) =>
      prev.includes(colId) ? prev.filter((id) => id !== colId) : [...prev, colId]
    );
  };

  const handleCreateCollection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setCreating(true);
    try {
      const res = await api.post<{ collection: Collection }>('/collections', {
        name: name.trim(),
        description: description.trim() || undefined,
      });
      toastSuccess('Collection created!');
      setCollections((prev) => [res.collection, ...prev]);
      setExpandedColIds((prev) => [res.collection.id, ...prev]);
      setCreateModalOpen(false);
      setName('');
      setDescription('');
    } catch (err: any) {
      toastError(err.message || 'Failed to create collection');
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteCollection = async (colId: string) => {
    try {
      await api.delete(`/collections/${colId}`);
      toastSuccess('Collection deleted');
      setCollections((prev) => prev.filter((c) => c.id !== colId));
    } catch (err: any) {
      toastError('Failed to delete collection');
    }
  };

  const handleAddProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addToCol || !selectedProjectId) return;
    setAdding(true);
    try {
      await api.post(`/collections/${addToCol.id}/projects`, {
        projectId: selectedProjectId,
      });
      toastSuccess('Project added to collection!');

      // Refresh collections
      const res = await api.get<{ collections: Collection[] }>('/collections');
      setCollections(res.collections || []);
      setAddToCol(null);
      setSelectedProjectId('');
    } catch (err: any) {
      toastError(err.message || 'Failed to add project');
    } finally {
      setAdding(false);
    }
  };

  const handleRemoveProject = async (colId: string, projId: string) => {
    try {
      await api.delete(`/collections/${colId}/projects/${projId}`);
      toastSuccess('Project removed from collection');
      setCollections((prev) =>
        prev.map((c) => {
          if (c.id !== colId) return c;
          return {
            ...c,
            projects: c.projects.filter((item) => item.projectId !== projId),
          };
        })
      );
    } catch (err: any) {
      toastError('Failed to remove project');
    }
  };

  if (loading) {
    return (
      <div className="py-24 flex justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Collections</h1>
          <p className="text-xs sm:text-sm text-zinc-500 mt-1">
            Organize and curate custom bundles of your work for specific roles or clients
          </p>
        </div>
        <Button
          size="sm"
          icon={<Plus className="w-4 h-4" />}
          onClick={() => setCreateModalOpen(true)}
        >
          New Collection
        </Button>
      </div>

      {collections.length === 0 ? (
        <Card padding="lg" className="border-dashed border-zinc-300">
          <EmptyState
            icon={<Layers className="w-6 h-6" />}
            title="No collections yet"
            description="Group related projects together into thematic portfolios (e.g. 'Backend Microservices' or 'Fintech Apps')."
            action={
              <Button size="sm" onClick={() => setCreateModalOpen(true)}>
                <Plus className="w-4 h-4 mr-1.5" />
                Create First Collection
              </Button>
            }
          />
        </Card>
      ) : (
        <div className="space-y-4">
          {collections.map((col) => {
            const isExpanded = expandedColIds.includes(col.id);
            const projCount = col.projects?.length || 0;

            return (
              <Card key={col.id} padding="none" className="border-zinc-200 overflow-hidden">
                <div
                  onClick={() => toggleExpand(col.id)}
                  className="p-5 flex items-center justify-between gap-4 cursor-pointer hover:bg-zinc-50/70 transition-colors select-none"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                      <Layers className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-zinc-900">{col.name}</h3>
                      {col.description && (
                        <p className="text-xs text-zinc-500 line-clamp-1">{col.description}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-600">
                      {projCount} {projCount === 1 ? 'project' : 'projects'}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setAddToCol(col);
                      }}
                      className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-800 transition-colors"
                    >
                      + Add Project
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteCollection(col.id);
                      }}
                      className="p-1 rounded text-zinc-400 hover:text-rose-600 transition-colors"
                      title="Delete Collection"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4 text-zinc-400" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-zinc-400" />
                    )}
                  </div>
                </div>

                {isExpanded && (
                  <div className="p-5 pt-0 border-t border-zinc-100 bg-zinc-50/40">
                    {(!col.projects || col.projects.length === 0) ? (
                      <p className="text-xs text-zinc-400 italic py-4 text-center">
                        No projects in this collection yet. Click "+ Add Project" above.
                      </p>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-4">
                        {col.projects.map((item) => {
                          const p = item.project;
                          if (!p) return null;
                          return (
                            <div
                              key={item.id}
                              className="p-3.5 rounded-xl border border-zinc-200 bg-white flex items-center justify-between gap-2 shadow-2xs hover:border-zinc-300 transition-all"
                            >
                              <div className="overflow-hidden">
                                <Link
                                  to={`/projects/${p.id}`}
                                  className="text-xs font-bold text-zinc-900 hover:text-blue-600 truncate block"
                                >
                                  {p.name}
                                </Link>
                                <p className="text-[11px] text-zinc-400 truncate">
                                  {p.role || p.category || 'Project'}
                                </p>
                              </div>

                              <button
                                type="button"
                                onClick={() => handleRemoveProject(col.id, p.id)}
                                className="p-1 rounded text-zinc-400 hover:text-rose-600 transition-colors shrink-0"
                                title="Remove from Collection"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {/* Create Collection Modal */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Create Collection"
        size="sm"
      >
        <form onSubmit={handleCreateCollection} className="space-y-4">
          <Input
            label="Collection Name"
            placeholder="e.g. Core Distributed Systems, Fintech Work"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <Textarea
            label="Description (Optional)"
            placeholder="What is the focus of this collection?"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
          />

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setCreateModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" loading={creating}>
              Create
            </Button>
          </div>
        </form>
      </Modal>

      {/* Add Project to Collection Modal */}
      <Modal
        isOpen={!!addToCol}
        onClose={() => setAddToCol(null)}
        title={`Add Project to "${addToCol?.name}"`}
        size="sm"
      >
        <form onSubmit={handleAddProject} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-zinc-700">Select Project</label>
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-zinc-200 rounded-lg bg-white text-zinc-900 focus:outline-none"
              required
            >
              <option value="">-- Choose a project --</option>
              {userProjects
                .filter(
                  (p) => !addToCol?.projects?.some((item) => item.projectId === p.id)
                )
                .map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.status})
                  </option>
                ))}
            </select>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setAddToCol(null)}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" loading={adding} disabled={!selectedProjectId}>
              Add to Collection
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
