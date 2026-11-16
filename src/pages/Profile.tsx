import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { libraryApi } from "../api/library";
import { useAuth } from "../context/AuthContext";
import { apiErrorMessage } from "../api/client";
import type { HistoryEntry, WatchlistEntry } from "../types";

export default function Profile() {
  const { user, updateProfile, changePassword } = useAuth();
  const [watchlist, setWatchlist] = useState<WatchlistEntry[]>([]);
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  // Profile edit
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [avatar, setAvatar] = useState(user?.avatar || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [profileMsg, setProfileMsg] = useState("");
  const [profileErr, setProfileErr] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);

  // Password change
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordMsg, setPasswordMsg] = useState("");
  const [passwordErr, setPasswordErr] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    setName(user?.name || "");
    setEmail(user?.email || "");
    setAvatar(user?.avatar || "");
    setBio(user?.bio || "");
  }, [user]);

  useEffect(() => {
    const run = async () => {
      try {
        const [w, h] = await Promise.all([libraryApi.getWatchlist(), libraryApi.getHistory()]);
        setWatchlist(w.data || []);
        setHistory(h.data || []);
      } catch (e) {
        console.error(e);
      }
    };
    void run();
  }, []);

  const remove = async (malId: number) => {
    try {
      await libraryApi.removeFromWatchlist(malId);
      setWatchlist((prev) => prev.filter((entry) => entry.malId !== malId));
    } catch (e) {
      console.error(e);
    }
  };

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileErr("");
    setProfileMsg("");
    setSavingProfile(true);
    try {
      await updateProfile({ name, email, avatar, bio });
      setProfileMsg("Profile updated successfully.");
    } catch (err) {
      setProfileErr(apiErrorMessage(err));
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordErr("");
    setPasswordMsg("");
    setSavingPassword(true);
    try {
      await changePassword({ currentPassword, newPassword });
      setPasswordMsg("Password changed successfully.");
      setCurrentPassword("");
      setNewPassword("");
    } catch (err) {
      setPasswordErr(apiErrorMessage(err));
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">{user?.name || user?.email}'s Profile</h1>
        <p className="text-slate-400">{user?.email}</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8 mb-8">
        <section className="glass rounded-2xl p-6">
          <h2 className="text-xl font-semibold mb-4">Account details</h2>
          <form onSubmit={handleProfileSave} className="space-y-3">
            <div className="field">
              <span>Name</span>
              <input value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="field">
              <span>Email</span>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="field">
              <span>Avatar URL</span>
              <input value={avatar} onChange={(e) => setAvatar(e.target.value)} placeholder="https://..." />
            </div>
            <div className="field">
              <span>Bio</span>
              <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={3} />
            </div>
            {profileErr && <p className="text-rose-400 text-sm">{profileErr}</p>}
            {profileMsg && <p className="text-emerald-400 text-sm">{profileMsg}</p>}
            <button disabled={savingProfile} className="btn btn-primary btn-sm">
              {savingProfile ? "Saving..." : "Save changes"}
            </button>
          </form>
        </section>

        <section className="glass rounded-2xl p-6">
          <h2 className="text-xl font-semibold mb-4">Change password</h2>
          <form onSubmit={handlePasswordChange} className="space-y-3">
            <div className="field">
              <span>Current password</span>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
            </div>
            <div className="field">
              <span>New password</span>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                minLength={6}
                required
              />
            </div>
            {passwordErr && <p className="text-rose-400 text-sm">{passwordErr}</p>}
            {passwordMsg && <p className="text-emerald-400 text-sm">{passwordMsg}</p>}
            <button disabled={savingPassword} className="btn btn-primary btn-sm">
              {savingPassword ? "Updating..." : "Update password"}
            </button>
          </form>
        </section>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <section>
          <h2 className="text-xl font-semibold mb-3">Watchlist</h2>
          <div className="space-y-3">
            {watchlist.length ? (
              watchlist.map((item) => (
                <div key={item._id} className="glass rounded-xl p-3 flex items-center gap-3">
                  {item.image && <img src={item.image} alt={item.title} className="w-14 h-20 object-cover rounded-md" />}
                  <div className="flex-1 min-w-0">
                    <Link to={`/anime/${item.malId}`} className="font-medium hover:text-white line-clamp-1">{item.title}</Link>
                    <p className="text-xs text-slate-400">{item.status || "Saved"}</p>
                  </div>
                  <button onClick={() => void remove(item.malId)} className="text-xs px-3 py-1.5 rounded bg-white/10 hover:bg-white/20">Remove</button>
                </div>
              ))
            ) : (
              <p className="text-slate-400">No items in watchlist yet.</p>
            )}
          </div>
        </section>
        <section>
          <h2 className="text-xl font-semibold mb-3">Watch History</h2>
          <div className="space-y-3">
            {history.length ? (
              history.map((item, idx) => (
                <Link key={`${item._id}-${idx}`} to={`/watch/${item.malId}?ep=${item.episode}`} className="glass rounded-xl p-3 flex items-center gap-3 hover:bg-white/10">
                  {item.image && <img src={item.image} alt={item.title} className="w-14 h-20 object-cover rounded-md" />}
                  <div className="min-w-0">
                    <div className="font-medium line-clamp-1">{item.title}</div>
                    <p className="text-xs text-slate-400">Episode {item.episode} • {new Date(item.lastWatchedAt).toLocaleString()}</p>
                  </div>
                </Link>
              ))
            ) : (
              <p className="text-slate-400">No watch history yet.</p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
