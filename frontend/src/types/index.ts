// ─── User & Auth Types ──────────────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  username: string;
  emailVerified: boolean;
  createdAt?: string;
  profile?: ProfileSummary | null;
}

export interface ProfileSummary {
  name: string;
  headline?: string | null;
  avatarUrl?: string | null;
}

export interface Profile {
  id: string;
  userId: string;
  name: string;
  headline?: string | null;
  bio?: string | null;
  location?: string | null;
  avatarUrl?: string | null;
  website?: string | null;
  githubUrl?: string | null;
  linkedinUrl?: string | null;
  twitterUrl?: string | null;
  skills: string[];
  experience?: string | null;
  contactEmail?: string | null;
  isPublic: boolean;
  username?: string;
  email?: string;
}

// ─── Project Types ──────────────────────────────────────────────────────

export interface Project {
  id: string;
  userId: string;
  name: string;
  description?: string | null;
  category?: string | null;
  role?: string | null;
  organization?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  responsibilities?: string | null;
  achievements?: string | null;
  outcomes?: string | null;
  status: 'draft' | 'published' | 'archived';
  visibility: 'public' | 'private' | 'shared';
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
  skills: ProjectSkill[];
  files: ProjectFile[];
  externalLinks: ExternalLink[];
  user?: {
    username: string;
    profile?: ProfileSummary | null;
  };
  _count?: {
    files: number;
    externalLinks: number;
  };
}

export interface ProjectSkill {
  id: string;
  projectId: string;
  name: string;
}

export interface ProjectFile {
  id: string;
  projectId?: string;
  filename?: string;
  originalName: string;
  mimeType: string;
  size: number;
  createdAt?: string;
}

export interface ExternalLink {
  id: string;
  projectId: string;
  title: string;
  url: string;
  type: string;
  createdAt?: string;
}

// ─── Collection Types ───────────────────────────────────────────────────

export interface Collection {
  id: string;
  userId: string;
  name: string;
  description?: string | null;
  createdAt: string;
  updatedAt: string;
  projects: CollectionProject[];
  _count?: { projects: number };
}

export interface CollectionProject {
  id: string;
  collectionId: string;
  projectId: string;
  addedAt: string;
  project: Project;
}

// ─── Sharing Types ──────────────────────────────────────────────────────

export interface ShareLink {
  id: string;
  projectId: string;
  token: string;
  expiresAt?: string | null;
  accessCount: number;
  isActive: boolean;
  createdAt: string;
  url: string;
}

export interface SharePermission {
  id: string;
  projectId: string;
  grantedById: string;
  grantedToId?: string | null;
  email?: string | null;
  createdAt: string;
  grantedTo?: { username: string; email: string } | null;
}

// ─── Analytics Types ────────────────────────────────────────────────────

export interface AnalyticsOverview {
  projects: {
    total: number;
    public: number;
    private: number;
    shared: number;
    draft: number;
    archived: number;
  };
  views: {
    profileViews: { last30Days: number; total: number; uniqueVisitors: number };
    projectViews: { last30Days: number; total: number };
  };
  popularProjects: Array<{
    projectId: string;
    views: number;
    project?: { id: string; name: string; category?: string };
  }>;
  shareActivity: number;
  recentActivity: ActivityLog[];
}

export interface ActivityLog {
  id: string;
  userId: string;
  action: string;
  entityType: string;
  entityId: string;
  metadata?: any;
  createdAt: string;
}

// ─── API Response Types ─────────────────────────────────────────────────

export interface PaginatedResponse<T> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  items?: T[];
  [key: string]: any;
}

export interface ApiError {
  error: string;
  details?: Array<{ field: string; message: string }>;
}

// ─── Form Types ─────────────────────────────────────────────────────────

export interface ProjectFormData {
  name: string;
  description?: string;
  category?: string;
  role?: string;
  organization?: string;
  startDate?: string;
  endDate?: string;
  responsibilities?: string;
  achievements?: string;
  outcomes?: string;
  skills?: string[];
  visibility?: 'public' | 'private' | 'shared';
  status?: 'draft' | 'published';
  isFeatured?: boolean;
}

export interface ProfileFormData {
  name?: string;
  headline?: string | null;
  bio?: string | null;
  location?: string | null;
  avatarUrl?: string | null;
  website?: string | null;
  githubUrl?: string | null;
  linkedinUrl?: string | null;
  twitterUrl?: string | null;
  skills?: string[];
  experience?: string | null;
  contactEmail?: string | null;
  isPublic?: boolean;
}

// ─── Discover Types ─────────────────────────────────────────────────────

export interface DiscoverProject {
  id: string;
  name: string;
  description?: string | null;
  category?: string | null;
  role?: string | null;
  skills: string[];
  createdAt: string;
  isFeatured: boolean;
  user: {
    username: string;
    profile?: ProfileSummary | null;
  };
  _count?: { files: number; externalLinks: number };
}

export interface DiscoverProfile {
  name: string;
  headline?: string | null;
  location?: string | null;
  avatarUrl?: string | null;
  skills: string[];
  username: string;
  projectCount: number;
}
