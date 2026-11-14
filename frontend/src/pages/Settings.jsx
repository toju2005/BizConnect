
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

import {
  User,
  ShieldCheck,
  Bell,
  Palette,
  LogOut,
  Save,
  Lock,
  RefreshCw
} from "lucide-react";

function Settings() {
  const navigate = useNavigate();

  const [profile, setProfile] = useState({
    name: "",
    email: "",
    role: "",
    createdAt: ""
  });

  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    followUpReminders: true,
    theme: "light"
  });

  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Load profile and locally saved preferences
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const response = await API.get("/auth/me");
        const user = response.data.user;

        setProfile({
          name: user.name || "",
          email: user.email || "",
          role: user.role || "user",
          createdAt: user.createdAt || ""
        });

        const savedPreferences = localStorage.getItem(
          "bizconnectPreferences"
        );

        if (savedPreferences) {
          setPreferences({
            ...preferences,
            ...JSON.parse(savedPreferences)
          });
        }
      } catch (err) {
        setError(
          err.response?.data?.message ||
          "Unable to load account settings."
        );
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, []);

  // Update profile input
  const handleProfileChange = (e) => {
    setProfile({
      ...profile,
      [e.target.name]: e.target.value
    });
  };

  // Save profile to MongoDB
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    setMessage("");
    setError("");

    try {
      const response = await API.put("/auth/profile", {
        name: profile.name,
        email: profile.email
      });

      const user = response.data.user;

      setProfile((previous) => ({
        ...previous,
        name: user.name,
        email: user.email,
        role: user.role
      }));

      setMessage("Profile updated successfully.");
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to update profile."
      );
    } finally {
      setSavingProfile(false);
    }
  };

  // Update password inputs
  const handlePasswordChange = (e) => {
    setPasswords({
      ...passwords,
      [e.target.name]: e.target.value
    });
  };

  // Change password
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (passwords.newPassword !== passwords.confirmPassword) {
      setError("New password and confirmation do not match.");
      return;
    }

    if (passwords.newPassword.length < 8) {
      setError("New password must contain at least 8 characters.");
      return;
    }

    setChangingPassword(true);

    try {
      const response = await API.put("/auth/change-password", {
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword
      });

      setMessage(response.data.message);

      setPasswords({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      });
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to change password."
      );
    } finally {
      setChangingPassword(false);
    }
  };

  // Save preferences in browser
  const handlePreferenceChange = (key, value) => {
    const updatedPreferences = {
      ...preferences,
      [key]: value
    };

    setPreferences(updatedPreferences);

    localStorage.setItem(
      "bizconnectPreferences",
      JSON.stringify(updatedPreferences)
    );

    setMessage("Preferences saved in this browser.");
    setError("");
  };

  // Logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login", { replace: true });
  };

  if (loading) {
    return (
      <div className="p-8 min-h-screen bg-slate-50 text-center">
        Loading settings...
      </div>
    );
  }

  return (
    <div className="p-8 bg-slate-50 min-h-screen">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">
          Settings
        </h1>

        <p className="text-slate-500 mt-2">
          Manage your account, security and application preferences.
        </p>
      </div>

      {/* Feedback */}
      {message && (
        <div className="bg-green-100 text-green-700 p-3 rounded-lg mb-5">
          {message}
        </div>
      )}

      {error && (
        <div className="bg-red-100 text-red-600 p-3 rounded-lg mb-5">
          {error}
        </div>
      )}

      <div className="max-w-4xl space-y-6">

        {/* PROFILE SETTINGS */}
        <section className="bg-white rounded-xl shadow-sm p-6">

          <div className="flex items-center gap-3 mb-6">
            <div className="bg-blue-100 text-blue-600 p-3 rounded-lg">
              <User size={22} />
            </div>

            <div>
              <h2 className="text-xl font-bold">
                Profile Information
              </h2>

              <p className="text-sm text-slate-500">
                Update your personal account information.
              </p>
            </div>
          </div>

          <form onSubmit={handleProfileSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

              <div>
                <label className="block text-sm font-medium mb-2">
                  Full Name
                </label>

                <input
                  type="text"
                  name="name"
                  value={profile.name}
                  onChange={handleProfileChange}
                  required
                  className="w-full border rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Email Address
                </label>

                <input
                  type="email"
                  name="email"
                  value={profile.email}
                  onChange={handleProfileChange}
                  required
                  className="w-full border rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Account Role
                </label>

                <input
                  value={profile.role}
                  disabled
                  className="w-full border rounded-lg p-3 bg-slate-100 text-slate-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Member Since
                </label>

                <input
                  value={
                    profile.createdAt
                      ? new Date(profile.createdAt).toLocaleDateString("en-IN")
                      : "Not available"
                  }
                  disabled
                  className="w-full border rounded-lg p-3 bg-slate-100 text-slate-500"
                />
              </div>

            </div>

            <button
              type="submit"
              disabled={savingProfile}
              className="mt-6 flex items-center gap-2 bg-blue-600 text-white px-5 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-60"
            >
              <Save size={18} />
              {savingProfile ? "Saving..." : "Save Profile"}
            </button>
          </form>
        </section>

        {/* SECURITY SETTINGS */}
        <section className="bg-white rounded-xl shadow-sm p-6">

          <div className="flex items-center gap-3 mb-6">
            <div className="bg-green-100 text-green-600 p-3 rounded-lg">
              <ShieldCheck size={22} />
            </div>

            <div>
              <h2 className="text-xl font-bold">
                Account Security
              </h2>

              <p className="text-sm text-slate-500">
                Keep your account secure by changing your password.
              </p>
            </div>
          </div>

          <form onSubmit={handlePasswordSubmit}>
            <div className="space-y-4">

              <div>
                <label className="block text-sm font-medium mb-2">
                  Current Password
                </label>

                <input
                  type="password"
                  name="currentPassword"
                  value={passwords.currentPassword}
                  onChange={handlePasswordChange}
                  required
                  autoComplete="current-password"
                  className="w-full border rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter current password"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  New Password
                </label>

                <input
                  type="password"
                  name="newPassword"
                  value={passwords.newPassword}
                  onChange={handlePasswordChange}
                  required
                  minLength={8}
                  autoComplete="new-password"
                  className="w-full border rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter new password"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Confirm New Password
                </label>

                <input
                  type="password"
                  name="confirmPassword"
                  value={passwords.confirmPassword}
                  onChange={handlePasswordChange}
                  required
                  minLength={8}
                  autoComplete="new-password"
                  className="w-full border rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Confirm new password"
                />
              </div>

            </div>

            <button
              type="submit"
              disabled={changingPassword}
              className="mt-6 flex items-center gap-2 bg-green-600 text-white px-5 py-3 rounded-lg hover:bg-green-700 disabled:opacity-60"
            >
              <Lock size={18} />
              {changingPassword ? "Updating..." : "Change Password"}
            </button>
          </form>
        </section>

        {/* PREFERENCES */}
        <section className="bg-white rounded-xl shadow-sm p-6">

          <div className="flex items-center gap-3 mb-6">
            <div className="bg-purple-100 text-purple-600 p-3 rounded-lg">
              <Palette size={22} />
            </div>

            <div>
              <h2 className="text-xl font-bold">
                Application Preferences
              </h2>

              <p className="text-sm text-slate-500">
                Customize your BizConnect experience.
              </p>
            </div>
          </div>

          <div className="space-y-6">

            <div className="flex justify-between items-center gap-4">
              <div>
                <h3 className="font-medium">
                  Email Notifications
                </h3>

                <p className="text-sm text-slate-500">
                  Preference for receiving email notifications.
                </p>
              </div>

              <input
                type="checkbox"
                checked={preferences.emailNotifications}
                onChange={(e) =>
                  handlePreferenceChange(
                    "emailNotifications",
                    e.target.checked
                  )
                }
                className="w-5 h-5 accent-blue-600"
              />
            </div>

            <div className="flex justify-between items-center gap-4">
              <div>
                <h3 className="font-medium">
                  Follow-up Reminders
                </h3>

                <p className="text-sm text-slate-500">
                  Preference for follow-up reminder notifications.
                </p>
              </div>

              <input
                type="checkbox"
                checked={preferences.followUpReminders}
                onChange={(e) =>
                  handlePreferenceChange(
                    "followUpReminders",
                    e.target.checked
                  )
                }
                className="w-5 h-5 accent-blue-600"
              />
            </div>

            <div className="flex justify-between items-center gap-4">
              <div>
                <h3 className="font-medium">
                  Theme Preference
                </h3>

                <p className="text-sm text-slate-500">
                  Choose your preferred appearance.
                </p>
              </div>

              <select
                value={preferences.theme}
                onChange={(e) =>
                  handlePreferenceChange("theme", e.target.value)
                }
                className="border rounded-lg p-2 bg-white"
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
              </select>
            </div>

          </div>
        </section>

        {/* ACCOUNT MANAGEMENT */}
        <section className="bg-white rounded-xl shadow-sm p-6">

          <div className="flex items-center gap-3 mb-5">
            <div className="bg-red-100 text-red-600 p-3 rounded-lg">
              <LogOut size={22} />
            </div>

            <div>
              <h2 className="text-xl font-bold">
                Account Management
              </h2>

              <p className="text-sm text-slate-500">
                Sign out of your BizConnect account.
              </p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 bg-red-600 text-white px-5 py-3 rounded-lg hover:bg-red-700"
          >
            <LogOut size={18} />
            Logout
          </button>
        </section>

      </div>
    </div>
  );
}

export default Settings;
