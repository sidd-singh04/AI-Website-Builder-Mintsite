import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, Shield, Key, Trash2, Loader2, AlertTriangle } from "lucide-react";
import { useAuth } from "../context/authContext.jsx";
import { API } from "../utils/api.js";
import toast from "react-hot-toast";
import s from "../styles/SettingsPage.module.css";

export default function SettingsPage() {
  const navigate = useNavigate();
  const { user, updateUser, logoutUser } = useAuth();

  // Name Update States
  const [name, setName] = useState(user?.name || "");
  const [savingName, setSavingName] = useState(false);

  // Password Update States
  const [passwordForm, setPasswordForm] = useState({
    current: "",
    nextPassword: ""
  });
  const [savingPassword, setSavingPassword] = useState(false);

  // Delete Account States
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Handle Name Profile Update
  const handleUpdateName = async (e) => {
    e.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName || trimmedName.length < 2 || trimmedName.length > 32) {
      toast.error("Name must be between 2 and 32 characters over here");
      return;
    }

    setSavingName(true);
    try {
      const res = await API.patch("/me", { name: trimmedName });
      if (res.data?.user) {
        updateUser(res.data.user);
        toast.success("Profile name updated successfully!");
      }
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to update profile name over here");
    } finally {
      setSavingName(false);
    }
  };

  // Handle Password Reset Update
  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    const { current, nextPassword } = passwordForm;

    if (!current) {
      toast.error("Please enter your current password over here");
      return;
    }

    if (nextPassword.length < 6) {
      toast.error("New password must be at least 6 characters over here");
      return;
    }

    setSavingPassword(true);
    try {
      await API.patch("/me/password", { current, nextPassword });
      toast.success("Password updated successfully!");
      setPasswordForm({ current: "", nextPassword: "" });
    } catch (err) {
      toast.error(err.response?.data?.error || "Incorrect current password or update failed over here");
    } finally {
      setSavingPassword(false);
    }
  };

  // Handle Account Deletion
  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      await API.delete("/me");
      toast.success("Your account has been deleted permanently over here");
      logoutUser();
      navigate("/");
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to delete account over here");
      setDeleting(false);
    }
  };

  return (
    <div className={s.root}>
      <header className={s.header}>
        <h1 className={s.title}>Account Settings</h1>
        <p className={s.subtitle}>Manage your profile details, reset passwords, or close your database account over here.</p>
      </header>

      <div className={s.gridContainer}>
        {/* LEFT COLUMN: PROFILE CARD */}
        <section className={s.card}>
          <div className={s.cardHeader}>
            <User size={18} className={s.cardIcon} />
            <h2 className={s.cardTitle}>Personal Profile</h2>
          </div>
          
          <form onSubmit={handleUpdateName} className={s.form}>
            <div className={s.inputGroup}>
              <label className={s.label}>Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={s.input}
                required
              />
            </div>

            <div className={s.inputGroup}>
              <label className={s.label}>Email Address</label>
              <input
                type="email"
                value={user?.email || ""}
                className={`${s.input} ${s.disabledInput}`}
                disabled
                title="Email is locked and cannot be changed over here"
              />
              <span className={s.fieldHint}>Your login email cannot be changed.</span>
            </div>

            <button type="submit" disabled={savingName || name.trim() === user?.name} className={s.submitBtn}>
              {savingName ? <Loader2 size={16} className={s.spin} /> : "Save Changes"}
            </button>
          </form>
        </section>

        {/* RIGHT COLUMN: SECURITY SECTION */}
        <section className={s.card}>
          <div className={s.cardHeader}>
            <Shield size={18} className={s.cardIcon} />
            <h2 className={s.cardTitle}>Change Password</h2>
          </div>

          <form onSubmit={handleUpdatePassword} className={s.form}>
            <div className={s.inputGroup}>
              <label className={s.label}>Current Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={passwordForm.current}
                onChange={(e) => setPasswordForm({ ...passwordForm, current: e.target.value })}
                className={s.input}
                required
                autoComplete="current-password"
              />
            </div>

            <div className={s.inputGroup}>
              <label className={s.label}>New Password</label>
              <input
                type="password"
                placeholder="Min 6 characters"
                value={passwordForm.nextPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, nextPassword: e.target.value })}
                className={s.input}
                required
                autoComplete="new-password"
              />
            </div>

            <button type="submit" disabled={savingPassword} className={s.submitBtn}>
              {savingPassword ? <Loader2 size={16} className={s.spin} /> : "Update Password"}
            </button>
          </form>
        </section>
      </div>

      {/* DANGER ZONE: ACCOUNT DELETION */}
      <section className={`${s.card} ${s.dangerCard}`}>
        <div className={s.cardHeader}>
          <Trash2 size={18} className={s.dangerIcon} />
          <h2 className={`${s.cardTitle} ${s.dangerTitle}`}>Danger Zone</h2>
        </div>

        <div className={s.dangerBox}>
          <p className={s.dangerText}>
            Deleting your account will permanently wipe your profile information, purchased credits, and all generated landing pages from our database. This action is irreversible.
          </p>

          {showDeleteConfirm ? (
            <div className={s.confirmBox}>
              <div className={s.confirmWarning}>
                <AlertTriangle size={18} className={s.warningIcon} />
                <span>Are you absolutely sure you want to delete your account over here?</span>
              </div>
              <div className={s.confirmActions}>
                <button
                  onClick={handleDeleteAccount}
                  disabled={deleting}
                  className={`${s.submitBtn} ${s.deleteBtn}`}
                >
                  {deleting ? <Loader2 size={16} className={s.spin} /> : "Yes, Delete Permanently"}
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={deleting}
                  className={s.cancelBtn}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button onClick={() => setShowDeleteConfirm(true)} className={`${s.submitBtn} ${s.deleteBtn}`}>
              Close Account
            </button>
          )}
        </div>
      </section>
    </div>
  );
}