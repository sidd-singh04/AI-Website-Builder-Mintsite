import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  Shield,
  Trash2,
  Loader2,
  AlertTriangle,
} from "lucide-react";

import { useAuth } from "../context/authContext.jsx";
import { API } from "../utils/api.js";
import toast from "react-hot-toast";
import s from "../styles/SettingsPage.module.css";

export default function SettingsPage() {
  const navigate = useNavigate();
  const { user, updateUser, logoutUser } = useAuth();

  // =========================
  // PROFILE STATES
  // =========================
  const [name, setName] = useState(user?.name || "");
  const [savingName, setSavingName] = useState(false);

  // =========================
  // PASSWORD STATES
  // =========================
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    nextPassword: "",
  });

  const [savingPassword, setSavingPassword] = useState(false);

  // =========================
  // DELETE ACCOUNT STATES
  // =========================
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // =========================
  // UPDATE PROFILE NAME
  // =========================
  const handleUpdateName = async (e) => {
    e.preventDefault();

    const trimmedName = name.trim();

    if (
      !trimmedName ||
      trimmedName.length < 2 ||
      trimmedName.length > 32
    ) {
      toast.error("Name must be between 2 and 32 characters");
      return;
    }

    if (trimmedName === user?.name) {
      return;
    }

    setSavingName(true);

    try {
      const res = await API.patch("/auth/me", {
        name: trimmedName,
      });

      if (res.data?.user) {
        updateUser(res.data.user);
        setName(res.data.user.name || trimmedName);

        toast.success("Profile name updated successfully!");
      }
    } catch (err) {
      toast.error(
        err.response?.data?.error ||
          "Failed to update profile name"
      );
    } finally {
      setSavingName(false);
    }
  };

  // =========================
  // UPDATE PASSWORD
  // =========================
  const handleUpdatePassword = async (e) => {
    e.preventDefault();

    const { currentPassword, nextPassword } = passwordForm;

    if (!currentPassword) {
      toast.error("Please enter your current password");
      return;
    }

    if (!nextPassword) {
      toast.error("Please enter your new password");
      return;
    }

    if (nextPassword.length < 6) {
      toast.error("New password must be at least 6 characters");
      return;
    }

    if (currentPassword === nextPassword) {
      toast.error(
        "New password must be different from your current password"
      );
      return;
    }

    setSavingPassword(true);

    try {
      await API.patch("/auth/me/password", {
        currentPassword,
        nextPassword,
      });

      toast.success("Password updated successfully!");

      setPasswordForm({
        currentPassword: "",
        nextPassword: "",
      });
    } catch (err) {
      toast.error(
        err.response?.data?.error ||
          "Failed to update password"
      );
    } finally {
      setSavingPassword(false);
    }
  };

  // =========================
  // DELETE ACCOUNT
  // =========================
  const handleDeleteAccount = async () => {
    setDeleting(true);

    try {
      await API.delete("/auth/me");

      toast.success(
        "Your account has been permanently deleted"
      );

      logoutUser();
      navigate("/");
    } catch (err) {
      toast.error(
        err.response?.data?.error ||
          "Failed to delete your account"
      );

      setDeleting(false);
    }
  };

  return (
    <div className={s.root}>
      {/* =========================
          PAGE HEADER
      ========================= */}
      <header className={s.header}>
        <h1 className={s.title}>Account Settings</h1>

        <p className={s.subtitle}>
          Manage your profile, update your password, and
          control your account settings.
        </p>
      </header>

      {/* =========================
          SETTINGS GRID
      ========================= */}
      <div className={s.gridContainer}>
        {/* =========================
            PERSONAL PROFILE
        ========================= */}
        <section className={s.card}>
          <div className={s.cardHeader}>
            <User
              size={18}
              className={s.cardIcon}
            />

            <h2 className={s.cardTitle}>
              Personal Profile
            </h2>
          </div>

          <form
            onSubmit={handleUpdateName}
            className={s.form}
          >
            {/* FULL NAME */}
            <div className={s.inputGroup}>
              <label className={s.label}>
                Full Name
              </label>

              <input
                type="text"
                value={name}
                onChange={(e) =>
                  setName(e.target.value)
                }
                className={s.input}
                placeholder="Enter your full name"
                required
                minLength={2}
                maxLength={32}
              />
            </div>

            {/* EMAIL */}
            <div className={s.inputGroup}>
              <label className={s.label}>
                Email Address
              </label>

              <input
                type="email"
                value={user?.email || ""}
                className={`${s.input} ${s.disabledInput}`}
                disabled
                title="Your login email cannot be changed"
              />

              <span className={s.fieldHint}>
                Your login email cannot be changed.
              </span>
            </div>

            {/* SAVE BUTTON */}
            <button
              type="submit"
              disabled={
                savingName ||
                name.trim() === user?.name
              }
              className={s.submitBtn}
            >
              {savingName ? (
                <>
                  <Loader2
                    size={16}
                    className={s.spin}
                  />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </button>
          </form>
        </section>

        {/* =========================
            CHANGE PASSWORD
        ========================= */}
        <section className={s.card}>
          <div className={s.cardHeader}>
            <Shield
              size={18}
              className={s.cardIcon}
            />

            <h2 className={s.cardTitle}>
              Change Password
            </h2>
          </div>

          <form
            onSubmit={handleUpdatePassword}
            className={s.form}
          >
            {/* CURRENT PASSWORD */}
            <div className={s.inputGroup}>
              <label className={s.label}>
                Current Password
              </label>

              <input
                type="password"
                placeholder="Enter your current password"
                value={passwordForm.currentPassword}
                onChange={(e) =>
                  setPasswordForm({
                    ...passwordForm,
                    currentPassword:
                      e.target.value,
                  })
                }
                className={s.input}
                required
                autoComplete="current-password"
              />
            </div>

            {/* NEW PASSWORD */}
            <div className={s.inputGroup}>
              <label className={s.label}>
                New Password
              </label>

              <input
                type="password"
                placeholder="Minimum 6 characters"
                value={passwordForm.nextPassword}
                onChange={(e) =>
                  setPasswordForm({
                    ...passwordForm,
                    nextPassword:
                      e.target.value,
                  })
                }
                className={s.input}
                required
                minLength={6}
                autoComplete="new-password"
              />

              <span className={s.fieldHint}>
                Use at least 6 characters for your
                new password.
              </span>
            </div>

            {/* UPDATE PASSWORD BUTTON */}
            <button
              type="submit"
              disabled={savingPassword}
              className={s.submitBtn}
            >
              {savingPassword ? (
                <>
                  <Loader2
                    size={16}
                    className={s.spin}
                  />
                  Updating...
                </>
              ) : (
                "Update Password"
              )}
            </button>
          </form>
        </section>
      </div>

      {/* =========================
          DANGER ZONE
      ========================= */}
      <section
        className={`${s.card} ${s.dangerCard}`}
      >
        <div className={s.cardHeader}>
          <Trash2
            size={18}
            className={s.dangerIcon}
          />

          <h2
            className={`${s.cardTitle} ${s.dangerTitle}`}
          >
            Danger Zone
          </h2>
        </div>

        <div className={s.dangerBox}>
          <p className={s.dangerText}>
            Deleting your account will permanently remove
            your profile information, purchased credits,
            and all generated websites from our database.
            This action cannot be undone.
          </p>

          {showDeleteConfirm ? (
            <div className={s.confirmBox}>
              <div className={s.confirmWarning}>
                <AlertTriangle
                  size={18}
                  className={s.warningIcon}
                />

                <span>
                  Are you absolutely sure you want to
                  permanently delete your account?
                </span>
              </div>

              <div className={s.confirmActions}>
                <button
                  onClick={handleDeleteAccount}
                  disabled={deleting}
                  className={`${s.submitBtn} ${s.deleteBtn}`}
                >
                  {deleting ? (
                    <>
                      <Loader2
                        size={16}
                        className={s.spin}
                      />
                      Deleting...
                    </>
                  ) : (
                    "Yes, Delete Permanently"
                  )}
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setShowDeleteConfirm(false)
                  }
                  disabled={deleting}
                  className={s.cancelBtn}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() =>
                setShowDeleteConfirm(true)
              }
              className={`${s.submitBtn} ${s.deleteBtn}`}
            >
              Close Account
            </button>
          )}
        </div>
      </section>
    </div>
  );

}