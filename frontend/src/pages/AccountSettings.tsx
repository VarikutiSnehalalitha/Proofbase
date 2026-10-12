import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import {
  Button,
  Input,
  Card,
  Modal,
} from '../components/ui';
import {
  KeyRound,
  Shield,
  Trash2,
  Lock,
  User,
  AlertTriangle,
} from 'lucide-react';

export function AccountSettingsPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { success: toastSuccess, error: toastError } = useToast();

  // Password Change
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

  // Delete Account Modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleting, setDeleting] = useState(false);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      toastError('New password must be at least 8 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      toastError('Passwords do not match');
      return;
    }

    setChangingPassword(true);
    try {
      await api.put('/settings/password', {
        currentPassword,
        newPassword,
      });
      toastSuccess('Password updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      toastError(err.message || 'Failed to update password');
    } finally {
      setChangingPassword(false);
    }
  };

  const handleDeleteAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deletePassword) return;

    setDeleting(true);
    try {
      await api.delete('/settings/account', {
        body: { password: deletePassword },
      });
      toastSuccess('Your account has been deleted.');
      await logout();
      navigate('/login');
    } catch (err: any) {
      toastError(err.message || 'Failed to delete account');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Account Settings</h1>
        <p className="text-xs sm:text-sm text-zinc-500 mt-1">
          Manage your credentials, security settings, and account data
        </p>
      </div>

      <div className="space-y-6">
        {/* Account Info Card */}
        <Card padding="lg" className="border-zinc-200/90 space-y-4">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-zinc-400" />
            <h2 className="text-sm font-bold text-zinc-900 uppercase tracking-wider">
              Account Information
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200/70">
              <span className="text-[11px] font-semibold text-zinc-400 uppercase">Username</span>
              <p className="text-sm font-bold text-zinc-800 mt-0.5">@{user?.username}</p>
            </div>
            <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200/70">
              <span className="text-[11px] font-semibold text-zinc-400 uppercase">Email</span>
              <p className="text-sm font-bold text-zinc-800 mt-0.5">{user?.email}</p>
            </div>
          </div>
        </Card>

        {/* Change Password Card */}
        <Card padding="lg" className="border-zinc-200/90 space-y-4">
          <div className="flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-blue-600" />
            <h2 className="text-sm font-bold text-zinc-900 uppercase tracking-wider">
              Change Password
            </h2>
          </div>

          <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
            <Input
              label="Current Password"
              type="password"
              placeholder="••••••••"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />

            <Input
              label="New Password (min 8 characters)"
              type="password"
              placeholder="••••••••"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />

            <Input
              label="Confirm New Password"
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />

            <Button type="submit" size="sm" loading={changingPassword}>
              Update Password
            </Button>
          </form>
        </Card>

        {/* Danger Zone */}
        <Card padding="lg" className="border-rose-200 bg-rose-50/20 space-y-3">
          <div className="flex items-center gap-2 text-rose-700">
            <AlertTriangle className="w-4 h-4" />
            <h2 className="text-sm font-bold uppercase tracking-wider">Danger Zone</h2>
          </div>

          <p className="text-xs text-zinc-600 leading-relaxed">
            Permanently delete your Proofbase account, projects, uploaded proof files, and public portfolio. This action cannot be undone.
          </p>

          <Button
            variant="danger"
            size="sm"
            onClick={() => setDeleteModalOpen(true)}
            icon={<Trash2 className="w-3.5 h-3.5" />}
          >
            Delete Account
          </Button>
        </Card>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Confirm Account Deletion"
        size="sm"
      >
        <form onSubmit={handleDeleteAccount} className="space-y-4">
          <p className="text-xs text-zinc-600 leading-relaxed">
            Please enter your current password to permanently delete your account.
          </p>

          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            value={deletePassword}
            onChange={(e) => setDeletePassword(e.target.value)}
            required
          />

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setDeleteModalOpen(false)}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button type="submit" variant="danger" size="sm" loading={deleting}>
              Permanently Delete
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
