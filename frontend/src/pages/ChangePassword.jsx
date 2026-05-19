import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import api from '../utils/api';
import {
  FiAlertCircle,
  FiArrowLeft,
  FiCheckCircle,
  FiEye,
  FiEyeOff,
  FiKey,
  FiLock,
  FiRefreshCw,
  FiSave,
  FiShield,
} from 'react-icons/fi';

const initialPasswordData = {
  currentPassword: '',
  newPassword: '',
};

const getErrorMessage = (error, fallback) =>
  error?.response?.data?.message || error?.message || fallback;

export default function ChangePassword() {
  const [passwordData, setPasswordData] = useState(initialPasswordData);
  const [touched, setTouched] = useState({});
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const passwordChecks = useMemo(() => {
    const password = passwordData.newPassword;

    return [
      {
        label: 'At least 8 characters',
        passed: password.length >= 8,
      },
      {
        label: 'Contains an uppercase letter',
        passed: /[A-Z]/.test(password),
      },
      {
        label: 'Contains a lowercase letter',
        passed: /[a-z]/.test(password),
      },
      {
        label: 'Contains a number',
        passed: /\d/.test(password),
      },
    ];
  }, [passwordData.newPassword]);

  const passwordStrength = passwordChecks.filter((check) => check.passed).length;

  const validation = useMemo(() => {
    const errors = {};

    if (!passwordData.currentPassword) {
      errors.currentPassword = 'Current password is required.';
    }

    if (!passwordData.newPassword) {
      errors.newPassword = 'New password is required.';
    } else if (passwordData.newPassword.length < 8) {
      errors.newPassword = 'New password must be at least 8 characters.';
    } else if (passwordData.newPassword === passwordData.currentPassword) {
      errors.newPassword = 'New password must be different.';
    }

    return errors;
  }, [passwordData]);

  const isFormValid = Object.keys(validation).length === 0;
  const hasInput = passwordData.currentPassword || passwordData.newPassword;

  const updateField = (field, value) => {
    setPasswordData((current) => ({
      ...current,
      [field]: value,
    }));
    setTouched((current) => ({
      ...current,
      [field]: true,
    }));
    setError('');
  };

  const handleAuthFailure = () => {
    localStorage.removeItem('token');
    toast.error('Your session expired. Please sign in again.');
    navigate('/auth', { replace: true });
  };

  const handleReset = () => {
    setPasswordData(initialPasswordData);
    setTouched({});
    setError('');
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setTouched({ currentPassword: true, newPassword: true });

    if (!isFormValid) {
      toast.error('Please fix the highlighted fields.');
      return;
    }

    try {
      setSaving(true);
      setError('');

      const response = await api.put('/user/password', passwordData);

      if (response.data?.success === false) {
        throw new Error(response.data?.message || 'Failed to update password.');
      }

      toast.success('Password updated successfully.');
      handleReset();
      navigate('/profile');
    } catch (err) {
      if (err?.response?.status === 401) {
        handleAuthFailure();
        return;
      }

      const message = getErrorMessage(err, 'Failed to update password.');
      setError(message);
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <button
            type="button"
            className="btn btn-ghost btn-sm -ml-3 mb-2 gap-2"
            onClick={() => navigate('/profile')}
            disabled={saving}
          >
            <FiArrowLeft />
            Back to Profile
          </button>
          <h1 className="text-3xl font-bold text-base-content">
            Change Password
          </h1>
          <p className="mt-1 text-base-content/60">
            Update your account password and keep access protected
          </p>
        </div>

        <div className="badge badge-outline badge-lg gap-2">
          <FiShield />
          Secure Update
        </div>
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
            <div className="h-24 bg-gradient-to-r from-secondary via-primary to-accent"></div>
            <div className="card-body items-center px-6 pt-0 text-center">
              <div className="-mt-14 flex h-28 w-28 items-center justify-center rounded-full border-4 border-base-100 bg-base-200 text-secondary shadow-xl ring-4 ring-secondary/20">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-secondary/10">
                  <FiKey className="text-5xl" aria-hidden="true" />
                </div>
              </div>

              <h2 className="mt-4 text-2xl font-bold">Password Security</h2>
              <p className="text-base-content/60">
                Strong passwords reduce the risk of unwanted account access.
              </p>

              <div className="divider my-2"></div>

              <div className="grid w-full grid-cols-1 gap-3 text-left">
                {passwordChecks.map((check) => (
                  <div
                    key={check.label}
                    className="flex items-center gap-3 rounded-lg border border-base-300 bg-base-200 p-3"
                  >
                    <div
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                        check.passed
                          ? 'bg-success/10 text-success'
                          : 'bg-base-300 text-base-content/40'
                      }`}
                    >
                      <FiCheckCircle />
                    </div>
                    <p className="text-sm font-medium">{check.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="xl:col-span-2">
          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-lg border border-base-300 bg-base-100 p-5 shadow-lg">
              <p className="text-sm text-base-content/60">Strength</p>
              <progress
                className="progress progress-primary mt-3"
                value={passwordStrength}
                max="4"
              ></progress>
              <p className="mt-2 font-bold">{passwordStrength}/4 checks</p>
            </div>

            <div className="rounded-lg border border-base-300 bg-base-100 p-5 shadow-lg">
              <p className="text-sm text-base-content/60">Minimum Length</p>
              <p className="mt-3 text-2xl font-bold text-primary">8+</p>
              <p className="text-sm text-base-content/60">characters</p>
            </div>

            <div className="rounded-lg border border-base-300 bg-base-100 p-5 shadow-lg">
              <p className="text-sm text-base-content/60">Status</p>
              <p
                className={`mt-3 text-2xl font-bold ${
                  isFormValid ? 'text-success' : 'text-warning'
                }`}
              >
                {isFormValid ? 'Ready' : 'Review'}
              </p>
              <p className="text-sm text-base-content/60">before saving</p>
            </div>
          </div>

          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-secondary/10 p-3 text-secondary">
                    <FiLock className="text-2xl" />
                  </div>
                  <div>
                    <h2 className="card-title">Update Password</h2>
                    <p className="text-sm text-base-content/60">
                      Enter your current password before setting a new one.
                    </p>
                  </div>
                </div>
              </div>

              <form onSubmit={handleUpdatePassword} className="mt-6 space-y-5">
                <div>
                  <label className="label" htmlFor="current-password">
                    <span className="label-text font-medium">
                      Current Password
                    </span>
                  </label>
                  <label
                    className={`input input-bordered flex w-full items-center gap-3 ${
                      touched.currentPassword && validation.currentPassword
                        ? 'input-error'
                        : ''
                    }`}
                  >
                    <FiLock className="shrink-0 text-base-content/50" />
                    <input
                      id="current-password"
                      type={showCurrentPassword ? 'text' : 'password'}
                      className="grow"
                      value={passwordData.currentPassword}
                      onBlur={() =>
                        setTouched((current) => ({
                          ...current,
                          currentPassword: true,
                        }))
                      }
                      onChange={(e) =>
                        updateField('currentPassword', e.target.value)
                      }
                      autoComplete="current-password"
                      required
                    />
                    <button
                      type="button"
                      className="btn btn-ghost btn-xs"
                      onClick={() =>
                        setShowCurrentPassword((current) => !current)
                      }
                      aria-label={
                        showCurrentPassword
                          ? 'Hide current password'
                          : 'Show current password'
                      }
                    >
                      {showCurrentPassword ? <FiEyeOff /> : <FiEye />}
                    </button>
                  </label>
                  {touched.currentPassword && validation.currentPassword && (
                    <p className="mt-2 text-sm text-error">
                      {validation.currentPassword}
                    </p>
                  )}
                </div>

                <div>
                  <label className="label" htmlFor="new-password">
                    <span className="label-text font-medium">New Password</span>
                  </label>
                  <label
                    className={`input input-bordered flex w-full items-center gap-3 ${
                      touched.newPassword && validation.newPassword
                        ? 'input-error'
                        : ''
                    }`}
                  >
                    <FiKey className="shrink-0 text-base-content/50" />
                    <input
                      id="new-password"
                      type={showNewPassword ? 'text' : 'password'}
                      className="grow"
                      value={passwordData.newPassword}
                      onBlur={() =>
                        setTouched((current) => ({
                          ...current,
                          newPassword: true,
                        }))
                      }
                      onChange={(e) =>
                        updateField('newPassword', e.target.value)
                      }
                      autoComplete="new-password"
                      minLength="8"
                      required
                    />
                    <button
                      type="button"
                      className="btn btn-ghost btn-xs"
                      onClick={() => setShowNewPassword((current) => !current)}
                      aria-label={
                        showNewPassword
                          ? 'Hide new password'
                          : 'Show new password'
                      }
                    >
                      {showNewPassword ? <FiEyeOff /> : <FiEye />}
                    </button>
                  </label>
                  {touched.newPassword && validation.newPassword && (
                    <p className="mt-2 text-sm text-error">
                      {validation.newPassword}
                    </p>
                  )}
                </div>

                <div className="flex flex-col gap-3 pt-2 sm:flex-row">
                  <button
                    type="button"
                    className="btn btn-outline gap-2 sm:flex-1"
                    onClick={handleReset}
                    disabled={!hasInput || saving}
                  >
                    <FiRefreshCw />
                    Reset
                  </button>

                  <button
                    type="submit"
                    className="btn btn-secondary gap-2 sm:flex-[2]"
                    disabled={!hasInput || saving}
                  >
                    {saving ? (
                      <>
                        <span className="loading loading-spinner loading-sm"></span>
                        Updating...
                      </>
                    ) : (
                      <>
                        <FiSave />
                        Update Password
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
