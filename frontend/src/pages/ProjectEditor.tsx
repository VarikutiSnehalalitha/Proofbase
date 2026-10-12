import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api, API_BASE } from '../lib/api';
import { useToast } from '../contexts/ToastContext';
import type { Project, ProjectFile } from '../types';
import {
  Button,
  Input,
  Textarea,
  Select,
  Card,
  Spinner,
} from '../components/ui';
import {
  ArrowLeft,
  Save,
  Plus,
  X,
  Upload,
  File,
  Trash2,
  Check,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';

export function ProjectEditorPage() {
  const { id } = useParams<{ id: string }>();
  const isEditing = !!id;
  const navigate = useNavigate();
  const { success: toastSuccess, error: toastError } = useToast();

  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Full Stack');
  const [role, setRole] = useState('');
  const [organization, setOrganization] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isCurrent, setIsCurrent] = useState(false);
  const [description, setDescription] = useState('');
  const [responsibilities, setResponsibilities] = useState('');
  const [achievements, setAchievements] = useState('');
  const [outcomes, setOutcomes] = useState('');
  const [status, setStatus] = useState<'draft' | 'published'>('published');
  const [visibility, setVisibility] = useState<'public' | 'private' | 'shared'>('public');
  const [isFeatured, setIsFeatured] = useState(false);

  // Skills Tag State
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState('');

  // Files State (for edit mode)
  const [existingFiles, setExistingFiles] = useState<ProjectFile[]>([]);
  const [uploadingFiles, setUploadingFiles] = useState(false);

  useEffect(() => {
    if (!isEditing) return;

    const fetchProject = async () => {
      try {
        const res = await api.get<{ project: Project }>(`/projects/${id}`);
        const p = res.project;
        setName(p.name || '');
        setCategory(p.category || 'Full Stack');
        setRole(p.role || '');
        setOrganization(p.organization || '');
        setStartDate(p.startDate ? p.startDate.split('T')[0] : '');
        setEndDate(p.endDate ? p.endDate.split('T')[0] : '');
        setIsCurrent(!p.endDate && !!p.startDate);
        setDescription(p.description || '');
        setResponsibilities(p.responsibilities || '');
        setAchievements(p.achievements || '');
        setOutcomes(p.outcomes || '');
        setStatus(p.status === 'archived' ? 'draft' : p.status);
        setVisibility(p.visibility || 'public');
        setIsFeatured(!!p.isFeatured);
        setSkills(p.skills ? p.skills.map((s) => s.name) : []);
        setExistingFiles(p.files || []);
      } catch (err: any) {
        toastError('Failed to load project');
        navigate('/projects');
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [id, isEditing, navigate, toastError]);

  const handleAddSkill = () => {
    const trimmed = skillInput.trim();
    if (trimmed && !skills.includes(trimmed)) {
      setSkills((prev) => [...prev, trimmed]);
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (tag: string) => {
    setSkills((prev) => prev.filter((s) => s !== tag));
  };

  const handleKeyDownSkill = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      handleAddSkill();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toastError('Project name is required');
      return;
    }

    setSaving(true);
    const payload = {
      name: name.trim(),
      category,
      role: role.trim() || undefined,
      organization: organization.trim() || undefined,
      startDate: startDate || undefined,
      endDate: isCurrent ? undefined : endDate || undefined,
      description: description.trim() || undefined,
      responsibilities: responsibilities.trim() || undefined,
      achievements: achievements.trim() || undefined,
      outcomes: outcomes.trim() || undefined,
      skills,
      status,
      visibility,
      isFeatured,
    };

    try {
      if (isEditing) {
        await api.put(`/projects/${id}`, payload);
        toastSuccess('Project updated successfully!');
        navigate(`/projects/${id}`);
      } else {
        const res = await api.post<{ project: Project }>('/projects', payload);
        toastSuccess('Project created successfully!');
        navigate(`/projects/${res.project.id}`);
      }
    } catch (err: any) {
      toastError(err.message || 'Failed to save project');
    } finally {
      setSaving(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!id || !e.target.files || e.target.files.length === 0) return;
    setUploadingFiles(true);
    const formData = new FormData();
    for (let i = 0; i < e.target.files.length; i++) {
      formData.append('files', e.target.files[i]);
    }

    try {
      const res = await api.post<{ files: ProjectFile[] }>(`/projects/${id}/files`, formData);
      toastSuccess('Files uploaded successfully!');
      setExistingFiles((prev) => [...prev, ...res.files]);
    } catch (err: any) {
      toastError(err.message || 'Failed to upload files');
    } finally {
      setUploadingFiles(false);
      e.target.value = '';
    }
  };

  const handleDeleteFile = async (fileId: string) => {
    if (!id) return;
    try {
      await api.delete(`/projects/${id}/files/${fileId}`);
      toastSuccess('File removed');
      setExistingFiles((prev) => prev.filter((f) => f.id !== fileId));
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

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <Link
          to={isEditing ? `/projects/${id}` : '/projects'}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-500 hover:text-zinc-900 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Cancel
        </Link>
        <h1 className="text-xl font-bold text-zinc-900">
          {isEditing ? 'Edit Project' : 'New Project Showcase'}
        </h1>
        <Button
          form="project-form"
          type="submit"
          size="sm"
          loading={saving}
          icon={<Save className="w-3.5 h-3.5" />}
        >
          {isEditing ? 'Save Changes' : 'Create Project'}
        </Button>
      </div>

      <form id="project-form" onSubmit={handleSubmit} className="space-y-6">
        {/* Core Info */}
        <Card padding="lg" className="border-zinc-200/90 space-y-5">
          <h2 className="text-sm font-bold text-zinc-900 uppercase tracking-wider">
            1. Basic Information
          </h2>

          <Input
            label="Project Name"
            placeholder="e.g. Distributed Task Scheduler, Design System v2"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Primary Category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              options={[
                { value: 'Full Stack', label: 'Full Stack' },
                { value: 'Frontend', label: 'Frontend' },
                { value: 'Backend', label: 'Backend' },
                { value: 'Data Science', label: 'Data Science' },
                { value: 'AI / Machine Learning', label: 'AI / Machine Learning' },
                { value: 'Mobile', label: 'Mobile' },
                { value: 'UI/UX Design', label: 'UI/UX Design' },
                { value: 'DevOps / Infrastructure', label: 'DevOps / Infrastructure' },
                { value: 'Open Source', label: 'Open Source' },
                { value: 'Other', label: 'Other' },
              ]}
            />

            <Input
              label="Your Role / Title"
              placeholder="e.g. Lead Engineer, UI Designer"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            />
          </div>

          <Input
            label="Organization or Client (Optional)"
            placeholder="e.g. Stripe, Freelance, Personal Project"
            value={organization}
            onChange={(e) => setOrganization(e.target.value)}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Start Date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />

            <div>
              <Input
                label="End Date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                disabled={isCurrent}
              />
              <label className="flex items-center gap-2 mt-2 text-xs text-zinc-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isCurrent}
                  onChange={(e) => setIsCurrent(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                Currently Working on this Project
              </label>
            </div>
          </div>

          <Textarea
            label="Executive Summary / High-Level Overview"
            placeholder="Briefly describe what this project was and the core challenge it tackled..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
          />
        </Card>

        {/* Proof of Work Details */}
        <Card padding="lg" className="border-zinc-200/90 space-y-5">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            <h2 className="text-sm font-bold text-zinc-900 uppercase tracking-wider">
              2. Proof-of-Work Contributions
            </h2>
          </div>
          <p className="text-xs text-zinc-500 -mt-2">
            This information proves your direct impact to recruiters and hiring managers.
          </p>

          <Textarea
            label="Key Responsibilities (What did YOU build?)"
            placeholder="• Spearheaded architectural design of microservices&#10;• Designed the component system in Figma&#10;• Led code reviews and CI/CD automation"
            value={responsibilities}
            onChange={(e) => setResponsibilities(e.target.value)}
            rows={3}
          />

          <Textarea
            label="Technical Achievements (Milestones & Engineering Wins)"
            placeholder="• Migrated monolithic database to PostgreSQL with zero downtime&#10;• Reduced latency by 45% using Redis caching"
            value={achievements}
            onChange={(e) => setAchievements(e.target.value)}
            rows={3}
          />

          <Textarea
            label="Measurable Outcomes & Business Impact"
            placeholder="• Boosted user engagement by 32%&#10;• Processed 5M+ daily requests reliably"
            value={outcomes}
            onChange={(e) => setOutcomes(e.target.value)}
            rows={3}
          />
        </Card>

        {/* Skills Tag Input */}
        <Card padding="lg" className="border-zinc-200/90 space-y-4">
          <h2 className="text-sm font-bold text-zinc-900 uppercase tracking-wider">
            3. Skills & Technologies
          </h2>

          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Type a skill and press Enter (e.g. React, PostgreSQL, Docker)..."
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={handleKeyDownSkill}
              className="flex-1 px-3 py-2 text-xs sm:text-sm border border-zinc-200 rounded-lg bg-white text-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
            />
            <Button type="button" size="sm" variant="secondary" onClick={handleAddSkill}>
              Add
            </Button>
          </div>

          <div className="flex flex-wrap gap-1.5 pt-1 min-h-[32px]">
            {skills.map((skill) => (
              <span
                key={skill}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg bg-zinc-100 text-zinc-800 border border-zinc-200/70"
              >
                {skill}
                <button
                  type="button"
                  onClick={() => handleRemoveSkill(skill)}
                  className="hover:text-rose-600 text-zinc-400"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
            {skills.length === 0 && (
              <span className="text-xs text-zinc-400 italic">No skills added yet.</span>
            )}
          </div>
        </Card>

        {/* Visibility & Status */}
        <Card padding="lg" className="border-zinc-200/90 space-y-4">
          <h2 className="text-sm font-bold text-zinc-900 uppercase tracking-wider">
            4. Visibility & Publishing Status
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Publishing Status"
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              options={[
                { value: 'published', label: 'Published (Visible in portfolio)' },
                { value: 'draft', label: 'Draft (Only visible to you)' },
              ]}
            />

            <Select
              label="Visibility Level"
              value={visibility}
              onChange={(e) => setVisibility(e.target.value as any)}
              options={[
                { value: 'public', label: 'Public (Anyone with link or visiting profile)' },
                { value: 'private', label: 'Private (Only you)' },
                { value: 'shared', label: 'Shared (Only accessible via share tokens)' },
              ]}
            />
          </div>

          <label className="flex items-center gap-2 pt-2 text-xs text-zinc-700 cursor-pointer">
            <input
              type="checkbox"
              checked={isFeatured}
              onChange={(e) => setIsFeatured(e.target.checked)}
              className="rounded text-blue-600 focus:ring-blue-500"
            />
            Feature this project at the top of your portfolio
          </label>
        </Card>

        {/* Files (Available in Edit Mode) */}
        {isEditing && (
          <Card padding="lg" className="border-zinc-200/90 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-zinc-900 uppercase tracking-wider">
                5. Attached Artifacts & Evidence Files
              </h2>
              <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-800 transition-colors">
                <Upload className="w-3.5 h-3.5" />
                Upload Files
                <input
                  type="file"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                  disabled={uploadingFiles}
                />
              </label>
            </div>

            {uploadingFiles && (
              <div className="flex items-center gap-2 text-xs text-zinc-500">
                <Spinner size="sm" />
                Uploading files to server...
              </div>
            )}

            {existingFiles.length === 0 ? (
              <p className="text-xs text-zinc-400 italic">No files attached yet.</p>
            ) : (
              <div className="divide-y divide-zinc-100 border border-zinc-200 rounded-xl overflow-hidden">
                {existingFiles.map((file) => (
                  <div
                    key={file.id}
                    className="p-3 flex items-center justify-between text-xs bg-white"
                  >
                    <div className="flex items-center gap-2 overflow-hidden">
                      <File className="w-4 h-4 text-zinc-400 shrink-0" />
                      <span className="font-medium text-zinc-800 truncate">
                        {file.originalName}
                      </span>
                      <span className="text-zinc-400 text-[11px]">
                        ({(file.size / 1024).toFixed(1)} KB)
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteFile(file.id)}
                      className="p-1 rounded text-zinc-400 hover:text-rose-600 hover:bg-rose-50"
                      title="Delete file"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </Card>
        )}

        {/* Bottom Actions */}
        <div className="flex items-center justify-end gap-3 pt-4">
          <Link to={isEditing ? `/projects/${id}` : '/projects'}>
            <Button variant="outline" type="button">
              Cancel
            </Button>
          </Link>
          <Button
            type="submit"
            loading={saving}
            icon={<Save className="w-4 h-4" />}
          >
            {isEditing ? 'Save Changes' : 'Create Project'}
          </Button>
        </div>
      </form>
    </div>
  );
}
