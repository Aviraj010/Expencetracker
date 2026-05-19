import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import api from '../utils/api';
import {
  FiAlertCircle,
  FiAtSign,
  FiCheckCircle,
  FiEdit3,
  FiLock,
  FiMail,
  FiRefreshCw,
  FiRotateCcw,
  FiSave,
  FiShield,
  FiTrash2,
  FiUser,
} from 'react-icons/fi';

const emptyProfile = {
  name: '',
  email: '',
};

const getErrorMessage = (error, fallback) =>
  error?.response?.data?.message || error?.message || fallback;

const normalizeProfile = (profile) => ({
  name: profile.name.trim().replace(/\s+/g, ' '),
  email: profile.email.trim().toLowerCase(),
});

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

function ProfileSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-3">
          <div className="skeleton h-9 w-64"></div>
          <div className="skeleton h-4 w-80 max-w-full"></div>
        </div>
        <div className="skeleton h-12 w-32"></div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="xl:col-span-1">
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body items-center text-center">
              <div className="skeleton h-28 w-28 rounded-full"></div>
              <div className="skeleton mt-4 h-7 w-44"></div>
              <div className="skeleton h-4 w-56 max-w-full"></div>
              <div className="divider my-2"></div>
              <div className="grid w-full grid-cols-1 gap-3">
                <div className="skeleton h-24 w-full rounded-lg"></div>
                <div className="skeleton h-24 w-full rounded-lg"></div>
              </div>
            </div>
          </div>
        </div>

        <div className="xl:col-span-2 space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="skeleton h-24 rounded-lg"></div>
            <div className="skeleton h-24 rounded-lg"></div>
            <div className="skeleton h-24 rounded-lg"></div>
          </div>

          <div className="card bg-base-100 shadow-xl">
            <div className="card-body space-y-5">
              <div className="flex items-center justify-between gap-4">
                <div className="space-y-3">
                  <div className="skeleton h-6 w-44"></div>
                  <div className="skeleton h-4 w-72 max-w-full"></div>
                </div>
                <div className="skeleton h-6 w-20"></div>
              </div>
              <div className="skeleton h-16 w-full"></div>
              <div className="skeleton h-16 w-full"></div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="skeleton h-12 sm:flex-1"></div>
                <div className="skeleton h-12 sm:flex-[2]"></div>
              </div>
            </div>
          </div>

          <div className="skeleton h-28 rounded-lg"></div>
        </div>
      </div>
    </div>
  );
}

export default function Profile() {
  const [profile, setProfile] = useState(emptyProfile);
  const [savedProfile, setSavedProfile] = useState(emptyProfile);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [error, setError] = useState('');
  const [touched, setTouched] = useState({});
  const navigate = useNavigate();

  const normalizedCurrent = useMemo(
    () => normalizeProfile(profile),
    [profile]
  );

  const normalizedSaved = useMemo(
    () => normalizeProfile(savedProfile),
    [savedProfile]
  );

  const validation = useMemo(() => {
    const errors = {};

    if (!normalizedCurrent.name) {
      errors.name = 'Name is required.';
    } else if (normalizedCurrent.name.length < 2) {
      errors.name = 'Name must be at least 2 characters.';
    } else if (normalizedCurrent.name.length > 80) {
      errors.name = 'Name must stay under 80 characters.';
    }

    if (!normalizedCurrent.email) {
      errors.email = 'Email is required.';
    } else if (!isValidEmail(normalizedCurrent.email)) {
      errors.email = 'Enter a valid email address.';
    }

    return errors;
  }, [normalizedCurrent]);

  const hasChanges =
    normalizedCurrent.name !== normalizedSaved.name ||
    normalizedCurrent.email !== normalizedSaved.email;

  const isFormValid = Object.keys(validation).length === 0;

  const handleAuthFailure = useCallback(() => {
    localStorage.removeItem('token');
    toast.error('Your session expired. Please sign in again.');
    navigate('/auth', { replace: true });
  }, [navigate]);

  const applyLoadedUser = (user) => {
    const nextProfile = {
      name: user.name || '',
      email: user.email || '',
    };

    setProfile(nextProfile);
    setSavedProfile(nextProfile);
    setTouched({});
  };

  const fetchUser = async ({ showToast = false } = {}) => {
    try {
      setLoading(true);
      setError('');

      const response = await api.get('/user/me');
      const user = response.data?.user;

      if (!response.data?.success || !user) {
        throw new Error('Profile data was not returned by the server.');
      }

      applyLoadedUser(user);

      if (showToast) {
        toast.success('Profile refreshed.');
      }
    } catch (err) {
      if (err?.response?.status === 401) {
        handleAuthFailure();
        return;
      }

      const message = getErrorMessage(err, 'Failed to load profile.');
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    api
      .get('/user/me')
      .then((response) => {
        if (!isMounted) return;

        const user = response.data?.user;

        if (!response.data?.success || !user) {
          throw new Error('Profile data was not returned by the server.');
        }

        applyLoadedUser(user);
      })
      .catch((err) => {
        if (!isMounted) return;

        if (err?.response?.status === 401) {
          handleAuthFailure();
          return;
        }

        const message = getErrorMessage(err, 'Failed to load profile.');
        setError(message);
        toast.error(message);
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [handleAuthFailure]);

  const updateField = (field, value) => {
    setProfile((current) => ({
      ...current,
      [field]: value,
    }));
    setTouched((current) => ({
      ...current,
      [field]: true,
    }));
  };

  const handleReset = () => {
    setProfile(savedProfile);
    setTouched({});
    setError('');
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setTouched({ name: true, email: true });

    if (!isFormValid) {
      toast.error('Please fix the highlighted fields.');
      return;
    }

    if (!hasChanges) {
      toast('No profile changes to save.');
      return;
    }

    try {
      setSaving(true);
      setError('');

      const response = await api.put('/user/profile', normalizedCurrent);
      const updatedUser = response.data?.user;

      if (!response.data?.success || !updatedUser) {
        throw new Error('Profile update did not return updated data.');
      }

      const nextProfile = {
        name: updatedUser.name || normalizedCurrent.name,
        email: updatedUser.email || normalizedCurrent.email,
      };

      setProfile(nextProfile);
      setSavedProfile(nextProfile);
      setTouched({});
      toast.success('Profile updated successfully.');
    } catch (err) {
      if (err?.response?.status === 401) {
        handleAuthFailure();
        return;
      }

      const message = getErrorMessage(err, 'Failed to update profile.');
      setError(message);
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const closeDeleteModal = () => {
    if (deleting) return;
    setDeleteModalOpen(false);
    setDeleteConfirmation('');
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmation !== 'DELETE') {
      toast.error('Type DELETE to confirm account deletion.');
      return;
    }

    try {
      setDeleting(true);
      setError('');

      await api.delete('/user/delete');
      localStorage.removeItem('token');
      toast.success('Account deleted successfully.');
      navigate('/auth', { replace: true });
    } catch (err) {
      if (err?.response?.status === 401) {
        handleAuthFailure();
        return;
      }

      const message = getErrorMessage(err, 'Failed to delete account.');
      setError(message);
      toast.error(message);
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return <ProfileSkeleton />;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-base-content">
            Profile Settings
          </h1>
          <p className="mt-1 text-base-content/60">
            Manage your account identity and security preferences
          </p>
        </div>

        <button
          type="button"
          className="btn btn-outline gap-2"
          onClick={() => fetchUser({ showToast: true })}
          disabled={saving}
        >
          <FiRefreshCw />
          Refresh
        </button>
      </div>

      {error && (
        <div className="alert alert-error shadow-lg">
          <FiAlertCircle className="text-xl" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="xl:col-span-1">
          <div className="card overflow-hidden bg-base-100 shadow-xl">
            <div className="h-24 bg-gradient-to-r from-primary via-secondary to-accent"></div>
            <div className="card-body items-center px-6 pt-0 text-center">
              <div className="-mt-14 flex h-28 w-28 items-center justify-center rounded-full border-4 border-base-100 bg-base-200 text-primary shadow-xl ring-4 ring-primary/20">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                  <FiUser className="text-5xl" aria-hidden="true" />
                </div>
              </div>

              <div>
                <h2 className="mt-4 text-2xl font-bold">
                  {profile.name || 'Unnamed User'}
                </h2>
                <p className="mt-1 break-all text-base-content/60">
                  {profile.email || 'No email available'}
                </p>
              </div>

              <div className="divider my-2"></div>

              <div className="grid w-full grid-cols-1 gap-3 text-left">
                <div className="rounded-lg border border-base-300 bg-base-200 p-4 transition-all hover:border-primary/40">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-success/10 text-success">
                      <FiShield className="text-2xl" />
                    </div>
                    <div>
                      <p className="font-semibold">Protected Account</p>
                      <p className="text-sm text-base-content/60">
                        Profile changes require your active login token.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg border border-base-300 bg-base-200 p-4 transition-all hover:border-primary/40">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <FiCheckCircle className="text-2xl" />
                    </div>
                    <div>
                      <p className="font-semibold">
                        {hasChanges ? 'Unsaved Changes' : 'Profile Synced'}
                      </p>
                      <p className="text-sm text-base-content/60">
                        {hasChanges
                          ? 'Save or reset your edits before leaving.'
                          : 'Your visible account details are up to date.'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="xl:col-span-2">
          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-lg border border-base-300 bg-base-100 p-5 shadow-lg">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <FiUser className="text-xl" />
                </div>
                <div>
                  <p className="text-sm text-base-content/60">Profile</p>
                  <p className="font-bold">
                    {hasChanges ? 'Editing' : 'Current'}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-base-300 bg-base-100 p-5 shadow-lg">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-secondary/10 text-secondary">
                  <FiAtSign className="text-xl" />
                </div>
                <div>
                  <p className="text-sm text-base-content/60">Email</p>
                  <p className="font-bold">
                    {validation.email ? 'Needs Check' : 'Valid Format'}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-base-300 bg-base-100 p-5 shadow-lg">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-success/10 text-success">
                  <FiShield className="text-xl" />
                </div>
                <div>
                  <p className="text-sm text-base-content/60">Security</p>
                  <p className="font-bold">Token Protected</p>
                </div>
              </div>
            </div>
          </div>

          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-primary/10 p-3 text-primary">
                    <FiEdit3 className="text-2xl" />
                  </div>
                  <div>
                    <h2 className="card-title">Account Details</h2>
                    <p className="text-sm text-base-content/60">
                      Update the name and email used across your account.
                    </p>
                  </div>
                </div>

                <div
                  className={`badge ${
                    hasChanges ? 'badge-warning' : 'badge-success'
                  }`}
                >
                  {hasChanges ? 'Unsaved' : 'Saved'}
                </div>
              </div>

              <form onSubmit={handleUpdateProfile} className="mt-6 space-y-5">
                <div>
                  <label className="label" htmlFor="profile-name">
                    <span className="label-text font-medium">Full Name</span>
                  </label>
                  <label
                    className={`input input-bordered flex w-full items-center gap-3 ${
                      touched.name && validation.name ? 'input-error' : ''
                    }`}
                  >
                    <FiUser className="shrink-0 text-base-content/50" />
                    <input
                      id="profile-name"
                      type="text"
                      className="grow"
                      value={profile.name}
                      onBlur={() =>
                        setTouched((current) => ({ ...current, name: true }))
                      }
                      onChange={(e) => updateField('name', e.target.value)}
                      autoComplete="name"
                      maxLength={80}
                      required
                    />
                  </label>
                  {touched.name && validation.name && (
                    <p className="mt-2 text-sm text-error">{validation.name}</p>
                  )}
                </div>

                <div>
                  <label className="label" htmlFor="profile-email">
                    <span className="label-text font-medium">Email Address</span>
                  </label>
                  <label
                    className={`input input-bordered flex w-full items-center gap-3 ${
                      touched.email && validation.email ? 'input-error' : ''
                    }`}
                  >
                    <FiMail className="shrink-0 text-base-content/50" />
                    <input
                      id="profile-email"
                      type="email"
                      className="grow"
                      value={profile.email}
                      onBlur={() =>
                        setTouched((current) => ({ ...current, email: true }))
                      }
                      onChange={(e) => updateField('email', e.target.value)}
                      autoComplete="email"
                      required
                    />
                  </label>
                  {touched.email && validation.email && (
                    <p className="mt-2 text-sm text-error">{validation.email}</p>
                  )}
                </div>

                <div className="flex flex-col gap-3 pt-2 sm:flex-row">
                  <button
                    type="button"
                    className="btn btn-outline gap-2 sm:flex-1"
                    onClick={handleReset}
                    disabled={!hasChanges || saving}
                  >
                    <FiRotateCcw />
                    Reset
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary gap-2 sm:flex-[2]"
                    disabled={!hasChanges || saving}
                  >
                    {saving ? (
                      <>
                        <span className="loading loading-spinner loading-sm"></span>
                        Saving...
                      </>
                    ) : (
                      <>
                        <FiSave />
                        Save Profile
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>

          <div className="card mt-6 bg-base-100 shadow-xl">
            <div className="card-body">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-secondary/10 p-3 text-secondary">
                    <FiLock className="text-2xl" />
                  </div>
                  <div>
                    <h2 className="card-title">Password Security</h2>
                    <p className="text-sm text-base-content/60">
                      Change your password if it is weak, reused, or exposed.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  className="btn btn-secondary gap-2"
                  onClick={() => navigate('/change-password')}
                  disabled={saving}
                >
                  <FiLock />
                  Change Password
                </button>
              </div>
            </div>
          </div>

          <div className="card mt-6 border border-error/25 bg-base-100 shadow-xl">
            <div className="card-body">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-error/10 p-3 text-error">
                    <FiTrash2 className="text-2xl" />
                  </div>
                  <div>
                    <h2 className="card-title text-error">Danger Zone</h2>
                    <p className="text-sm text-base-content/60">
                      Permanently delete your account and end this session.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  className="btn btn-error gap-2"
                  onClick={() => setDeleteModalOpen(true)}
                  disabled={saving || deleting}
                >
                  <FiTrash2 />
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className={`modal ${deleteModalOpen ? 'modal-open' : ''}`}>
        <div className="modal-box max-w-lg rounded-3xl border border-error/25 bg-base-100 p-0 shadow-2xl">
          <div className="border-b border-base-300 p-6">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-error/10 text-error">
              <FiTrash2 className="text-2xl" />
            </div>
            <h3 className="text-2xl font-bold text-error">Delete Account</h3>
            <p className="mt-2 text-sm text-base-content/60">
              This action cannot be undone. Your login token will be removed and
              you will be returned to the authentication page.
            </p>
          </div>

          <div className="space-y-4 p-6">
            <div className="alert alert-warning">
              <FiAlertCircle className="text-xl" />
              <span>
                Type <span className="font-bold">DELETE</span> to confirm.
              </span>
            </div>

            <div>
              <label className="label" htmlFor="delete-confirmation">
                <span className="label-text font-medium">Confirmation</span>
              </label>
              <input
                id="delete-confirmation"
                type="text"
                className="input input-bordered w-full"
                placeholder="DELETE"
                value={deleteConfirmation}
                onChange={(e) => setDeleteConfirmation(e.target.value)}
                disabled={deleting}
              />
            </div>

            <div className="modal-action">
              <button
                type="button"
                className="btn btn-outline"
                onClick={closeDeleteModal}
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-error gap-2"
                onClick={handleDeleteAccount}
                disabled={deleting || deleteConfirmation !== 'DELETE'}
              >
                {deleting ? (
                  <>
                    <span className="loading loading-spinner loading-sm"></span>
                    Deleting...
                  </>
                ) : (
                  <>
                    <FiTrash2 />
                    Delete Forever
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
        <button
          type="button"
          className="modal-backdrop"
          onClick={closeDeleteModal}
          disabled={deleting}
          aria-label="Close delete account modal"
        >
          close
        </button>
      </div>
    </div>
  );
}
