import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import type { Profile, Project } from '../types';
import {
  Button,
  Card,
  Spinner,
  Badge,
} from '../components/ui';
import {
  MapPin,
  Globe,
  Mail,
  Edit,
  FolderKanban,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Search,
  Filter,
} from 'lucide-react';
import { GithubIcon, LinkedinIcon, TwitterIcon } from '../components/Icons';

export function PublicProfilePage() {
  const { username } = useParams<{ username: string }>();
  const { user } = useAuth();
  const { error: toastError } = useToast();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isOwner, setIsOwner] = useState(false);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedSkill, setSelectedSkill] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get<{ profile: Profile; projects: Project[]; isOwner: boolean }>(
          `/profile/${username}`
        );
        setProfile(res.profile);
        setProjects(res.projects || []);
        setIsOwner(res.isOwner || (user?.username === username));
      } catch (err: any) {
        toastError('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [username, user, toastError]);

  if (loading) {
    return (
      <div className="py-24 flex justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-xl mx-auto py-20 px-4 text-center">
        <h2 className="text-xl font-bold text-zinc-900">Portfolio Not Found</h2>
        <p className="text-sm text-zinc-500 mt-2">
          The candidate profile "@{username}" is either private or does not exist.
        </p>
        <Link
          to="/"
          className="mt-6 inline-flex items-center px-4 py-2 text-xs font-semibold rounded-lg bg-zinc-900 text-white"
        >
          Explore Proofbase
        </Link>
      </div>
    );
  }

  const allSkills = Array.from(
    new Set([
      ...(profile.skills || []),
      ...projects.flatMap((p) => (p.skills ? p.skills.map((s) => (typeof s === 'string' ? s : s.name)) : [])),
    ])
  );

  const filteredProjects = projects.filter((p) => {
    const matchesSearch =
      !search ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.description?.toLowerCase().includes(search.toLowerCase());

    const projectSkills = (p.skills || []).map((s) => (typeof s === 'string' ? s : s.name));
    const matchesSkill = !selectedSkill || projectSkills.includes(selectedSkill);

    return matchesSearch && matchesSkill;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12 animate-fadeIn">
      {/* Profile Header Card */}
      <div className="bg-white border border-zinc-200/90 rounded-3xl p-6 sm:p-10 shadow-xs relative overflow-hidden space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-700 p-0.5 shadow-md shrink-0">
              <div className="w-full h-full rounded-[14px] bg-zinc-900 overflow-hidden flex items-center justify-center text-2xl font-bold text-white">
                {profile.avatarUrl ? (
                  <img
                    src={profile.avatarUrl}
                    alt={profile.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  (profile.name[0] || username?.[0] || 'U').toUpperCase()
                )}
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-950">
                  {profile.name}
                </h1>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[11px] font-semibold border border-blue-200/60">
                  <ShieldCheck className="w-3 h-3 text-blue-600" />
                  Verified
                </span>
              </div>
              <p className="text-sm sm:text-base font-medium text-zinc-600">
                {profile.headline || 'Engineer & Builder'}
              </p>
              {profile.location && (
                <div className="flex items-center gap-1 text-xs text-zinc-400 pt-0.5">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{profile.location}</span>
                </div>
              )}
            </div>
          </div>

          {/* Social / Contact Links & Owner Action */}
          <div className="flex flex-wrap items-center gap-2">
            {isOwner && (
              <Link to="/profile">
                <Button size="sm" variant="outline" icon={<Edit className="w-3.5 h-3.5" />}>
                  Edit Profile
                </Button>
              </Link>
            )}

            {profile.contactEmail && (
              <a
                href={`mailto:${profile.contactEmail}`}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-zinc-900 text-white hover:bg-zinc-800 shadow-sm transition-all"
              >
                <Mail className="w-3.5 h-3.5" />
                Contact
              </a>
            )}

            {profile.website && (
              <a
                href={profile.website}
                target="_blank"
                rel="noreferrer"
                className="p-2 rounded-xl border border-zinc-200 hover:bg-zinc-50 text-zinc-600 hover:text-zinc-900 transition-colors"
                title="Website"
              >
                <Globe className="w-4 h-4" />
              </a>
            )}
            {profile.githubUrl && (
              <a
                href={profile.githubUrl}
                target="_blank"
                rel="noreferrer"
                className="p-2 rounded-xl border border-zinc-200 hover:bg-zinc-50 text-zinc-600 hover:text-zinc-900 transition-colors"
                title="GitHub"
              >
                <GithubIcon className="w-4 h-4" />
              </a>
            )}
            {profile.linkedinUrl && (
              <a
                href={profile.linkedinUrl}
                target="_blank"
                rel="noreferrer"
                className="p-2 rounded-xl border border-zinc-200 hover:bg-zinc-50 text-zinc-600 hover:text-zinc-900 transition-colors"
                title="LinkedIn"
              >
                <LinkedinIcon className="w-4 h-4" />
              </a>
            )}
            {profile.twitterUrl && (
              <a
                href={profile.twitterUrl}
                target="_blank"
                rel="noreferrer"
                className="p-2 rounded-xl border border-zinc-200 hover:bg-zinc-50 text-zinc-600 hover:text-zinc-900 transition-colors"
                title="Twitter"
              >
                <TwitterIcon className="w-4 h-4" />
              </a>
            )}
          </div>
        </div>

        {/* Bio */}
        {profile.bio && (
          <p className="text-sm text-zinc-600 leading-relaxed max-w-4xl border-t border-zinc-100 pt-4">
            {profile.bio}
          </p>
        )}

        {/* Skills Pills */}
        {allSkills.length > 0 && (
          <div className="space-y-2 pt-2">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">
              Skill Cloud
            </span>
            <div className="flex flex-wrap gap-1.5">
              {allSkills.map((sk) => (
                <button
                  key={sk}
                  type="button"
                  onClick={() => setSelectedSkill(selectedSkill === sk ? '' : sk)}
                  className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-all ${
                    selectedSkill === sk
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200/80 border border-zinc-200/50'
                  }`}
                >
                  {sk}
                </button>
              ))}
              {selectedSkill && (
                <button
                  type="button"
                  onClick={() => setSelectedSkill('')}
                  className="px-2 py-1 text-xs text-zinc-400 hover:text-zinc-700 underline"
                >
                  Clear filter
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Experience Narrative (if provided) */}
      {profile.experience && (
        <Card padding="lg" className="border-zinc-200/90 space-y-3">
          <h2 className="text-sm font-bold text-zinc-900 uppercase tracking-wider">
            Experience & Background Narrative
          </h2>
          <p className="text-sm text-zinc-600 whitespace-pre-line leading-relaxed">
            {profile.experience}
          </p>
        </Card>
      )}

      {/* Projects Showcase */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-zinc-900">
              Verified Project Showcase
            </h2>
            <p className="text-xs text-zinc-500">
              {filteredProjects.length} of {projects.length} published proof-of-work records
            </p>
          </div>

          <div className="relative max-w-xs w-full">
            <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search projects..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs border border-zinc-200 rounded-lg bg-white text-zinc-900 focus:outline-none"
            />
          </div>
        </div>

        {filteredProjects.length === 0 ? (
          <div className="py-16 text-center border border-dashed border-zinc-200 rounded-2xl bg-white">
            <FolderKanban className="w-8 h-8 text-zinc-300 mx-auto mb-2" />
            <p className="text-sm font-medium text-zinc-600">No projects match the selected criteria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((p) => (
              <Card key={p.id} hover className="flex flex-col justify-between border-zinc-200/90 p-5 group">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2.5">
                    {p.category && (
                      <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200/60">
                        {p.category}
                      </span>
                    )}
                    {p.isFeatured && (
                      <span className="text-[11px] font-semibold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                        ★ Featured
                      </span>
                    )}
                  </div>

                  <Link to={`/projects/${p.id}`} className="block group-hover:text-blue-600 transition-colors">
                    <h3 className="text-base font-bold text-zinc-900 line-clamp-1">{p.name}</h3>
                  </Link>

                  {p.role && (
                    <p className="text-xs font-medium text-zinc-600 mt-1">
                      {p.role} {p.organization ? `@ ${p.organization}` : ''}
                    </p>
                  )}

                  {p.description && (
                    <p className="text-xs text-zinc-500 mt-2 line-clamp-2 leading-relaxed">
                      {p.description}
                    </p>
                  )}

                  {p.skills && p.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-3">
                      {p.skills.slice(0, 4).map((s) => {
                        const name = typeof s === 'string' ? s : s.name;
                        return (
                          <span
                            key={name}
                            className="px-2 py-0.5 text-[11px] font-medium rounded bg-zinc-100 text-zinc-600"
                          >
                            {name}
                          </span>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="pt-4 mt-4 border-t border-zinc-100 flex items-center justify-between text-xs text-zinc-500">
                  <span>{p._count?.files ?? 0} proof files</span>
                  <Link
                    to={`/projects/${p.id}`}
                    className="inline-flex items-center gap-1 font-semibold text-zinc-900 hover:text-blue-600 transition-colors"
                  >
                    View Proof
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
