import { useEffect, useState } from "react";
import { Save, RotateCcw, KeyRound } from "lucide-react";

const API = "/api";

const emptyProfile = {
  companyName: "",
  founderName: "",
  industry: "",
  website: "",
  description: "",
};

const emptyPasswords = {
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
};

function toForm(startup) {
  return {
    companyName: startup?.companyName || "",
    founderName: startup?.founderName || "",
    industry: startup?.industry || "",
    website: startup?.website || "",
    description: startup?.description || "",
  };
}

async function readJson(response) {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

function MyAccount() {
  const [startup, setStartup] = useState(null);
  const [form, setForm] = useState(emptyProfile);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [profileSuccess, setProfileSuccess] = useState("");

  const [passwords, setPasswords] = useState(emptyPasswords);
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");

  useEffect(() => {
    async function loadProfile() {
      try {
        const response = await fetch(`${API}/startup/profile`, {
          credentials: "include",
        });
        const data = await readJson(response);

        if (!response.ok) {
          throw new Error(
            data?.message || `Unable to load profile (${response.status})`
          );
        }

        setStartup(data.startup);
        setForm(toForm(data.startup));
      } catch (err) {
        setProfileError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, []);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setProfileSuccess("");
  }

  function handleReset() {
    setForm(toForm(startup));
    setProfileError("");
    setProfileSuccess("");
  }

  async function handleProfileSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setProfileError("");
    setProfileSuccess("");

    try {
      const response = await fetch(`${API}/startup/profile`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await readJson(response);

      if (!response.ok) {
        throw new Error(
          data?.message || `Failed to update profile (${response.status})`
        );
      }

      setStartup(data.startup);
      setForm(toForm(data.startup));
      setProfileSuccess("Profile updated successfully!");
    } catch (err) {
      setProfileError(err.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  }

  function handlePasswordChange(event) {
    const { name, value } = event.target;
    setPasswords((current) => ({ ...current, [name]: value }));
    setPasswordSuccess("");
  }

  async function handlePasswordSubmit(event) {
    event.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");

    if (passwords.newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters");
      return;
    }

    if (passwords.newPassword !== passwords.confirmPassword) {
      setPasswordError("New password and confirmation do not match");
      return;
    }

    setChangingPassword(true);

    try {
      const response = await fetch(`${API}/startup/profile/password`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: passwords.currentPassword,
          newPassword: passwords.newPassword,
        }),
      });
      const data = await readJson(response);

      if (!response.ok) {
        throw new Error(
          data?.message || `Failed to change password (${response.status})`
        );
      }

      setPasswords(emptyPasswords);
      setPasswordSuccess("Password changed successfully!");
    } catch (err) {
      setPasswordError(err.message || "Failed to change password");
    } finally {
      setChangingPassword(false);
    }
  }

  const hasChanges =
    startup && JSON.stringify(form) !== JSON.stringify(toForm(startup));

  const inputClass =
    "w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-black outline-none transition focus:border-black focus:ring-1 focus:ring-black";
  const readOnlyClass =
    "w-full cursor-not-allowed rounded-lg border border-gray-200 bg-gray-100 px-3 py-2.5 text-sm text-gray-500";
  const labelClass = "mb-1.5 block text-sm font-medium text-gray-700";

  return (
    <main className="min-h-screen bg-white px-4 py-8 text-black sm:px-8 lg:px-12">
      <div className="mx-auto max-w-3xl">
        {/* Header */}
        <div className="mb-8">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">
            IdeaSpark / Startup
          </p>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            My Account
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Update your company details and keep your account secure.
          </p>
        </div>

        {loading ? (
          <div className="py-20 text-center text-sm text-gray-500">
            Loading your account...
          </div>
        ) : !startup ? (
          profileError && (
            <div
              role="alert"
              className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              {profileError}
            </div>
          )
        ) : (
          <div className="space-y-8">
            {/* Profile form */}
            <section className="rounded-2xl border border-gray-200 bg-gray-50 p-5 sm:p-8">
              <div className="mb-6">
                <h2 className="text-xl font-semibold">Profile details</h2>
                <p className="mt-1 text-sm text-gray-500">
                  This information is shown on your startup profile.
                </p>
              </div>

              {profileError && (
                <div
                  role="alert"
                  className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                >
                  {profileError}
                </div>
              )}

              {profileSuccess && (
                <div
                  role="status"
                  className="mb-5 rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800"
                >
                  {profileSuccess}
                </div>
              )}

              <form onSubmit={handleProfileSubmit} className="space-y-5">
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label htmlFor="email" className={labelClass}>
                      Email
                    </label>
                    <input
                      id="email"
                      value={startup.email || ""}
                      readOnly
                      disabled
                      className={readOnlyClass}
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Email cannot be changed here.
                    </p>
                  </div>

                  <div>
                    <label htmlFor="role" className={labelClass}>
                      Account type
                    </label>
                    <input
                      id="role"
                      value={startup.role || "startup"}
                      readOnly
                      disabled
                      className={`${readOnlyClass} capitalize`}
                    />
                  </div>

                  <div>
                    <label htmlFor="companyName" className={labelClass}>
                      Company name *
                    </label>
                    <input
                      id="companyName"
                      name="companyName"
                      value={form.companyName}
                      onChange={handleChange}
                      className={inputClass}
                      required
                      maxLength={100}
                    />
                  </div>

                  <div>
                    <label htmlFor="founderName" className={labelClass}>
                      Founder name *
                    </label>
                    <input
                      id="founderName"
                      name="founderName"
                      value={form.founderName}
                      onChange={handleChange}
                      className={inputClass}
                      required
                      maxLength={100}
                    />
                  </div>

                  <div>
                    <label htmlFor="industry" className={labelClass}>
                      Industry
                    </label>
                    <input
                      id="industry"
                      name="industry"
                      value={form.industry}
                      onChange={handleChange}
                      className={inputClass}
                      placeholder="e.g. FinTech, Healthcare"
                      maxLength={100}
                    />
                  </div>

                  <div>
                    <label htmlFor="website" className={labelClass}>
                      Website
                    </label>
                    <input
                      id="website"
                      name="website"
                      type="url"
                      value={form.website}
                      onChange={handleChange}
                      className={inputClass}
                      placeholder="https://example.com"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="description" className={labelClass}>
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    className={inputClass}
                    rows={5}
                    maxLength={1000}
                    placeholder="What does your startup do?"
                  />
                  <p className="mt-1 text-right text-xs text-gray-500">
                    {form.description.length}/1000
                  </p>
                </div>

                <div className="flex flex-col gap-3 border-t border-gray-200 pt-5 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={handleReset}
                    disabled={!hasChanges || saving}
                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <RotateCcw size={16} />
                    Discard changes
                  </button>

                  <button
                    type="submit"
                    disabled={!hasChanges || saving}
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-black px-5 py-2.5 text-sm font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Save size={16} />
                    {saving ? "Saving..." : "Save changes"}
                  </button>
                </div>
              </form>
            </section>

            {/* Password form */}
            <section className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-8">
              <div className="mb-6">
                <h2 className="text-xl font-semibold">Change password</h2>
                <p className="mt-1 text-sm text-gray-500">
                  Enter your current password to set a new one.
                </p>
              </div>

              {passwordError && (
                <div
                  role="alert"
                  className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                >
                  {passwordError}
                </div>
              )}

              {passwordSuccess && (
                <div
                  role="status"
                  className="mb-5 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-800"
                >
                  {passwordSuccess}
                </div>
              )}

              <form onSubmit={handlePasswordSubmit} className="space-y-5">
                <div>
                  <label htmlFor="currentPassword" className={labelClass}>
                    Current password
                  </label>
                  <input
                    id="currentPassword"
                    name="currentPassword"
                    type="password"
                    autoComplete="current-password"
                    value={passwords.currentPassword}
                    onChange={handlePasswordChange}
                    className={inputClass}
                    required
                  />
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label htmlFor="newPassword" className={labelClass}>
                      New password
                    </label>
                    <input
                      id="newPassword"
                      name="newPassword"
                      type="password"
                      autoComplete="new-password"
                      value={passwords.newPassword}
                      onChange={handlePasswordChange}
                      className={inputClass}
                      required
                      minLength={6}
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      At least 6 characters.
                    </p>
                  </div>

                  <div>
                    <label htmlFor="confirmPassword" className={labelClass}>
                      Confirm new password
                    </label>
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      autoComplete="new-password"
                      value={passwords.confirmPassword}
                      onChange={handlePasswordChange}
                      className={inputClass}
                      required
                      minLength={6}
                    />
                  </div>
                </div>

                <div className="flex justify-end border-t border-gray-200 pt-5">
                  <button
                    type="submit"
                    disabled={changingPassword}
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-black px-5 py-2.5 text-sm font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <KeyRound size={16} />
                    {changingPassword ? "Updating..." : "Update password"}
                  </button>
                </div>
              </form>
            </section>
          </div>
        )}
      </div>
    </main>
  );
}

export default MyAccount;