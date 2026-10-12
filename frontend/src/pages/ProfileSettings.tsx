import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import type { Profile } from '../types';
import {
  Button,
  Input,
  Textarea,
  Card,
  Spinner,
} from '../components/ui';
import {
  Save,
  User,
  MapPin,
  Globe,
  Mail,
  X,
  ShieldCheck,
  Eye,
} from 'lucide-react';
import { GithubIcon, LinkedinIcon, TwitterIcon } from '../components/Icons';

export function ProfileSettingsPage() {
  const { user, refreshUser } = useAuth();
  const { success: toastSuccess, error: toastError } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form Fields
  const [name, setName] = useState('');
  const [headline, setHeadline] = useState('');
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [website, setWebsite] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [twitterUrl, setTwitterUrl] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [experience, setExperience] = useState('');
  const [isPublic, setIsPublic] = useState(true);

  // Skills
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get<{ profile: Profile }>('/profile');
        const p = res.profile;
        setName(p.name || '');
        setHeadline(p.headline || '');
        setBio(p.bio || '');
        setLocation(p.location || '');
        setAvatarUrl(p.avatarUrl || '');
        setWebsite(p.website || '');
        setGithubUrl(p.githubUrl || '');
        setLinkedinUrl(p.linkedinUrl || '');
        setTwitterUrl(p.twitterUrl || '');
        setContactEmail(p.contactEmail || '');
        setExperience(p.experience || '');
        setIsPublic(p.isPublic ?? true);
        setSkills(p.skills || []);
      } catch (err: any) {
        toastError('Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [toastError]);

  const handleAddSkill = () => {
    const trimmed = skillInput.trim();
    if (trimmed && !skills.includes(trimmed)) {
      setSkills((prev) => [...prev, trimmed]);
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (skill: string) => {
    setSkills((prev) => prev.filter((s) => s !== skill));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toastError('Name is required');
      return;
    }

    setSaving(true);
    try {
      await api.put('/profile', {
        name: name.trim(),
        headline: headline.trim() || null,
        bio: bio.trim() || null,
        location: location.trim() || null,
        avatarUrl: avatarUrl.trim() || null,
        website: website.trim() || null,
        githubUrl: githubUrl.trim() || null,
        linkedinUrl: linkedinUrl.trim() || null,
        twitterUrl: twitterUrl.trim() || null,
        contactEmail: contactEmail.trim() || null,
        experience: experience.trim() || null,
        isPublic,
        skills,
      });

      await refreshUser();
      toastSuccess('Profile updated successfully!');
    } catch (err: any) {
      toastError(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Portfolio Profile</h1>
          <p className="text-xs sm:text-sm text-zinc-500 mt-1">
            Customize how your public showcase and verified work appears to the world
          </p>
        </div>
        <Button
          form="profile-form"
          type="submit"
          size="sm"
          loading={saving}
          icon={<Save className="w-3.5 h-3.5" />}
        >
          Save Changes
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Column */}
        <form id="profile-form" onSubmit={handleSubmit} className="lg:col-span-2 space-y-6">
          <Card padding="lg" className="border-zinc-200/90 space-y-4">
            <h2 className="text-sm font-bold text-zinc-900 uppercase tracking-wider">
              Basic Details
            </h2>

            <Input
              label="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

            <Input
              label="Professional Headline"
              placeholder="e.g. Senior Backend Engineer | Distributed Systems"
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
            />

            <Input
              label="Location"
              placeholder="e.g. San Francisco, CA or Remote"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />

            <Input
              label="Avatar Image URL"
              placeholder="https://..."
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              hint="Paste a direct image link from Unsplash, GitHub, or your cloud storage"
            />

            <Textarea
              label="Bio"
              placeholder="Tell hiring managers about your engineering focus and passion..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
            />
          </Card>

          <Card padding="lg" className="border-zinc-200/90 space-y-4">
            <h2 className="text-sm font-bold text-zinc-900 uppercase tracking-wider">
              Links & Contact Info
            </h2>

            <Input
              label="Contact Email"
              type="email"
              placeholder="hello@example.com"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
            />

            <Input
              label="Personal Website / Blog"
              type="url"
              placeholder="https://yourdomain.com"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
            />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Input
                label="GitHub URL"
                placeholder="https://github.com/..."
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
              />
              <Input
                label="LinkedIn URL"
                placeholder="https://linkedin.com/in/..."
                value={linkedinUrl}
                onChange={(e) => setLinkedinUrl(e.target.value)}
              />
              <Input
                label="Twitter / X URL"
                placeholder="https://x.com/..."
                value={twitterUrl}
                onChange={(e) => setTwitterUrl(e.target.value)}
              />
            </div>
          </Card>

          <Card padding="lg" className="border-zinc-200/90 space-y-4">
            <h2 className="text-sm font-bold text-zinc-900 uppercase tracking-wider">
              Core Skills
            </h2>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Add a skill and press Enter..."
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSkill();
                  }
                }}
                className="flex-1 px-3 py-2 text-xs sm:text-sm border border-zinc-200 rounded-lg bg-white text-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
              />
              <Button type="button" size="sm" variant="secondary" onClick={handleAddSkill}>
                Add
              </Button>
            </div>

            <div className="flex flex-wrap gap-1.5 pt-1">
              {skills.map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg bg-zinc-100 text-zinc-800"
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
            </div>
          </Card>

          <Card padding="lg" className="border-zinc-200/90 space-y-4">
            <h2 className="text-sm font-bold text-zinc-900 uppercase tracking-wider">
              Experience Narrative & Background
            </h2>

            <Textarea
              label="Career Background Summary"
              placeholder="Highlight your previous engineering leadership, high-impact projects, or domain expertise..."
              value={experience}
              onChange={(e) => setExperience(e.target.value)}
              rows={4}
            />

            <div className="pt-2 border-t border-zinc-100 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-zinc-900">Make Portfolio Public</p>
                <p className="text-[11px] text-zinc-500">
                  Allow your portfolio to be accessible at /p/{user?.username} and in Discover
                </p>
              </div>
              <input
                type="checkbox"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
              />
            </div>
          </Card>
        </form>

        {/* Live Preview Card */}
        <div className="space-y-4">
          <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-400 uppercase tracking-wider">
            <Eye className="w-3.5 h-3.5" />
            Live Preview
          </div>

          <div className="sticky top-24 bg-white border border-zinc-200 rounded-2xl p-6 shadow-xs space-y-4 text-center">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 p-0.5 mx-auto shadow-md">
              <div className="w-full h-full rounded-[14px] bg-zinc-900 overflow-hidden flex items-center justify-center text-xl font-bold text-white">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  (name?.[0] || user?.username[0] || 'U').toUpperCase()
                )}
              </div>
            </div>

            <div>
              <h3 className="text-base font-bold text-zinc-900">{name || 'Your Name'}</h3>
              <p className="text-xs text-zinc-500">{headline || 'Your Headline'}</p>
              {location && (
                <p className="text-[11px] text-zinc-400 flex items-center justify-center gap-1 mt-1">
                  <MapPin className="w-3 h-3" />
                  {location}
                </p>
              )}
            </div>

            {bio && (
              <p className="text-xs text-zinc-600 line-clamp-3 text-left border-t border-zinc-100 pt-3">
                {bio}
              </p>
            )}

            {skills.length > 0 && (
              <div className="flex flex-wrap gap-1 justify-center pt-1">
                {skills.slice(0, 5).map((s) => (
                  <span
                    key={s}
                    className="px-2 py-0.5 text-[10px] font-medium rounded bg-zinc-100 text-zinc-700"
                  >
                    {s}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
