
import { useEffect, useState } from "react";
import {
  UserRound,
  Building2,
  Mail,
  BriefcaseBusiness,
  LockKeyhole,
  Eye,
  EyeOff,
  Save,
  LoaderCircle,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  KeyRound,
} from "lucide-react";

const API_URL = "http://localhost:5000";

export default function MyAccount() {
  const [profile, setProfile] = useState({
    fullName: "",
    firmName: "",
    email: "",
    investmentFocus: "",
  });

  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [notice, setNotice] = useState({
    type: "",
    message: "",
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  async function fetchProfile() {
    setLoading(true);

    try {
      const response = await fetch(
        `${API_URL}/api/investors/my_account`,
        {
          method: "GET",
          credentials: "include",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to load profile");
      }

      setProfile({
        fullName: data.investor?.fullName || "",
        firmName: data.investor?.firmName || "",
        email: data.investor?.email || "",
        investmentFocus: data.investor?.investmentFocus || "",
      });
    } catch (error) {
      setNotice({
        type: "error",
        message: error.message || "Unable to load your profile",
      });
    } finally {
      setLoading(false);
    }
  }

  function handleProfileChange(event) {
    const { name, value } = event.target;

    setProfile((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  function handlePasswordChange(event) {
    const { name, value } = event.target;

    setPasswords((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  async function handleProfileSubmit(event) {
    event.preventDefault();
    setNotice({ type: "", message: "" });

    setSavingProfile(true);

    try {
      const response = await fetch(
        `${API_URL}/api/investors/my_account`,
        {
          method: "PATCH",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            fullName: profile.fullName,
            firmName: profile.firmName,
            investmentFocus: profile.investmentFocus,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update profile");
      }

      if (data.investor) {
        setProfile((previous) => ({
          ...previous,
          fullName: data.investor.fullName || "",
          firmName: data.investor.firmName || "",
          email: data.investor.email || previous.email,
          investmentFocus: data.investor.investmentFocus || "",
        }));
      }

      setNotice({
        type: "success",
        message: data.message || "Profile updated successfully",
      });
    } catch (error) {
      setNotice({
        type: "error",
        message: error.message || "Failed to update profile",
      });
    } finally {
      setSavingProfile(false);
    }
  }

  async function handlePasswordSubmit(event) {
    event.preventDefault();
    setNotice({ type: "", message: "" });

    if (passwords.newPassword !== passwords.confirmPassword) {
      setNotice({
        type: "error",
        message: "New password and confirmation do not match",
      });
      return;
    }

    if (passwords.newPassword.length < 6) {
      setNotice({
        type: "error",
        message: "New password must contain at least 6 characters",
      });
      return;
    }

    setSavingPassword(true);

    try {
      const response = await fetch(
        `${API_URL}/api/investors/my_account/password`,
        {
          method: "PATCH",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            currentPassword: passwords.currentPassword,
            newPassword: passwords.newPassword,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to change password");
      }

      setPasswords({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      setNotice({
        type: "success",
        message: data.message || "Password changed successfully",
      });
    } catch (error) {
      setNotice({
        type: "error",
        message: error.message || "Failed to change password",
      });
    } finally {
      setSavingPassword(false);
    }
  }

  function togglePassword(field) {
    setShowPasswords((previous) => ({
      ...previous,
      [field]: !previous[field],
    }));
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-white">
        <div className="flex items-center gap-3 text-gray-500">
          <LoaderCircle className="animate-spin" size={22} />
          <span>Loading your account...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white px-4 py-8 text-gray-900 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm text-gray-500">
              <span>Dashboard</span>
              <span>/</span>
              <span className="text-gray-900">My Account</span>
            </div>

            <h1 className="text-3xl font-bold tracking-tight">
              My Account
            </h1>

            <p className="mt-2 text-sm text-gray-500">
              Manage your investor profile and account security.
            </p>
          </div>

          <div className="flex w-fit items-center gap-2 rounded-full border border-gray-200 px-4 py-2 text-sm text-gray-700">
            <ShieldCheck size={17} />
            Investor Account
          </div>
        </div>

        {/* Feedback */}
        {notice.message && (
          <div
            role="status"
            className={`mb-6 flex items-start gap-3 rounded-xl border p-4 ${
              notice.type === "success"
                ? "border-gray-300 bg-gray-50 text-gray-800"
                : "border-red-200 bg-red-50 text-red-700"
            }`}
          >
            {notice.type === "success" ? (
              <CheckCircle2 size={20} className="mt-0.5 shrink-0" />
            ) : (
              <AlertCircle size={20} className="mt-0.5 shrink-0" />
            )}

            <p className="text-sm">{notice.message}</p>
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[0.8fr_1.5fr]">
          {/* Profile summary */}
          <aside className="h-fit overflow-hidden rounded-2xl border border-gray-200 bg-white">
            <div className="h-24 bg-gray-900" />

            <div className="-mt-10 px-6 pb-6">
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl border-4 border-white bg-gray-100 text-gray-800">
                <UserRound size={34} />
              </div>

              <h2 className="mt-4 break-words text-xl font-bold">
                {profile.fullName || "Investor"}
              </h2>

              <p className="mt-1 break-all text-sm text-gray-500">
                {profile.email}
              </p>

              <div className="mt-5 border-t border-gray-100 pt-5">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
                  Investment firm
                </p>

                <div className="flex items-start gap-3">
                  <Building2
                    size={18}
                    className="mt-0.5 shrink-0 text-gray-500"
                  />
                  <span className="break-words text-sm text-gray-700">
                    {profile.firmName || "No firm added"}
                  </span>
                </div>
              </div>

              <div className="mt-5 border-t border-gray-100 pt-5">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
                  Investment focus
                </p>

                <div className="flex items-start gap-3">
                  <BriefcaseBusiness
                    size={18}
                    className="mt-0.5 shrink-0 text-gray-500"
                  />
                  <span className="break-words text-sm text-gray-700">
                    {profile.investmentFocus || "Not specified"}
                  </span>
                </div>
              </div>
            </div>
          </aside>

          {/* Forms */}
          <div className="space-y-6">
            {/* Edit profile */}
            <section className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-7">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-100">
                  <UserRound size={21} />
                </div>

                <div>
                  <h2 className="font-semibold">Personal Information</h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Update your profile details.
                  </p>
                </div>
              </div>

              <form onSubmit={handleProfileSubmit} className="space-y-5">
                <div>
                  <label
                    htmlFor="fullName"
                    className="mb-2 block text-sm font-medium"
                  >
                    Full Name
                  </label>

                  <div className="relative">
                    <UserRound
                      size={18}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                    <input
                      id="fullName"
                      name="fullName"
                      type="text"
                      required
                      maxLength={100}
                      value={profile.fullName}
                      onChange={handleProfileChange}
                      placeholder="Enter your full name"
                      className="w-full rounded-xl border border-gray-200 py-3 pl-10 pr-4 outline-none transition focus:border-gray-900 focus:ring-2 focus:ring-gray-100"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="firmName"
                    className="mb-2 block text-sm font-medium"
                  >
                    Firm Name
                  </label>

                  <div className="relative">
                    <Building2
                      size={18}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                    <input
                      id="firmName"
                      name="firmName"
                      type="text"
                      maxLength={150}
                      value={profile.firmName}
                      onChange={handleProfileChange}
                      placeholder="Enter your investment firm"
                      className="w-full rounded-xl border border-gray-200 py-3 pl-10 pr-4 outline-none transition focus:border-gray-900 focus:ring-2 focus:ring-gray-100"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="mb-2 block text-sm font-medium"
                  >
                    Email Address
                  </label>

                  <div className="relative">
                    <Mail
                      size={18}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={profile.email}
                      readOnly
                      className="w-full cursor-not-allowed rounded-xl border border-gray-200 bg-gray-50 py-3 pl-10 pr-4 text-gray-500 outline-none"
                    />
                  </div>

                  <p className="mt-2 text-xs text-gray-400">
                    Email cannot be changed here.
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="investmentFocus"
                    className="mb-2 block text-sm font-medium"
                  >
                    Investment Focus
                  </label>

                  <div className="relative">
                    <BriefcaseBusiness
                      size={18}
                      className="absolute left-3 top-3.5 text-gray-400"
                    />
                    <textarea
                      id="investmentFocus"
                      name="investmentFocus"
                      rows={3}
                      maxLength={500}
                      value={profile.investmentFocus}
                      onChange={handleProfileChange}
                      placeholder="E.g. AI, SaaS, healthcare, early-stage startups"
                      className="w-full resize-y rounded-xl border border-gray-200 py-3 pl-10 pr-4 outline-none transition focus:border-gray-900 focus:ring-2 focus:ring-gray-100"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={savingProfile}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-gray-900 px-5 py-3 font-medium text-white transition hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                >
                  {savingProfile ? (
                    <LoaderCircle size={18} className="animate-spin" />
                  ) : (
                    <Save size={18} />
                  )}
                  {savingProfile ? "Saving..." : "Save Changes"}
                </button>
              </form>
            </section>

            {/* Change password */}
            <section className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-7">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-100">
                  <LockKeyhole size={21} />
                </div>

                <div>
                  <h2 className="font-semibold">Change Password</h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Keep your investor account secure.
                  </p>
                </div>
              </div>

              <form onSubmit={handlePasswordSubmit} className="space-y-5">
                {[
                  {
                    name: "currentPassword",
                    label: "Current Password",
                    key: "current",
                    placeholder: "Enter current password",
                  },
                  {
                    name: "newPassword",
                    label: "New Password",
                    key: "new",
                    placeholder: "Enter new password",
                  },
                  {
                    name: "confirmPassword",
                    label: "Confirm New Password",
                    key: "confirm",
                    placeholder: "Confirm new password",
                  },
                ].map((field) => (
                  <div key={field.name}>
                    <label
                      htmlFor={field.name}
                      className="mb-2 block text-sm font-medium"
                    >
                      {field.label}
                    </label>

                    <div className="relative">
                      <KeyRound
                        size={17}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                      />

                      <input
                        id={field.name}
                        name={field.name}
                        type={
                          showPasswords[field.key] ? "text" : "password"
                        }
                        required
                        minLength={field.name === "newPassword" ? 6 : undefined}
                        value={passwords[field.name]}
                        onChange={handlePasswordChange}
                        placeholder={field.placeholder}
                        autoComplete={
                          field.name === "currentPassword"
                            ? "current-password"
                            : "new-password"
                        }
                        className="w-full rounded-xl border border-gray-200 py-3 pl-10 pr-12 outline-none transition focus:border-gray-900 focus:ring-2 focus:ring-gray-100"
                      />

                      <button
                        type="button"
                        onClick={() => togglePassword(field.key)}
                        aria-label={
                          showPasswords[field.key]
                            ? "Hide password"
                            : "Show password"
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 transition hover:text-gray-900"
                      >
                        {showPasswords[field.key] ? (
                          <EyeOff size={18} />
                        ) : (
                          <Eye size={18} />
                        )}
                      </button>
                    </div>
                  </div>
                ))}

                <p className="text-xs leading-5 text-gray-500">
                  Your new password must contain at least 6 characters.
                </p>

                <button
                  type="submit"
                  disabled={savingPassword}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-900 px-5 py-3 font-medium text-gray-900 transition hover:bg-gray-900 hover:text-white disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                >
                  {savingPassword ? (
                    <LoaderCircle size={18} className="animate-spin" />
                  ) : (
                    <LockKeyhole size={18} />
                  )}
                  {savingPassword ? "Updating..." : "Update Password"}
                </button>
              </form>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
