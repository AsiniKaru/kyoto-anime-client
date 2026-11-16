import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";
import { apiErrorMessage } from "../api/client";
import toast from "react-hot-toast";

export default function Profile() {
  const { user, updateProfile, changePassword } = useAuth();
  const [watchlist, setWatchlist] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);

  // Profile details form
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [savingDetails, setSavingDetails] = useState(false);

  // Password form
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    setName(user?.name || "");
    setEmail(user?.email || "");
  }, [user]);

  useEffect(() => {
    const run = async () => {
      try {
        const [w, h] = await Promise.all([api.get("/library/watchlist"), api.get("/library/history")]);
        setWatchlist(w.data.data || []);
        setHistory(h.data.data || []);
      } catch (e) { console.error(e); }
    };
    run();
  }, []);

  const remove = async (malId: number) => {
    try {
      await api.delete(`/library/watchlist/${malId}`);
      setWatchlist((prev) => prev.filter((item) => item.malId !== malId));
    } catch (e) { console.error(e); }
  };

  const saveDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingDetails(true);
    try {
      await updateProfile({ name, email });
      toast.success("Profile updated");
    } catch (err) {
      toast.error(apiErrorMessage(err));
    } finally {
      setSavingDetails(false);
    }
  };

  const savePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingPassword(true);
    try {
      await changePassword({ currentPassword, newPassword });
      toast.success("Password updated");
      setCurrentPassword("");
      setNewPassword("");
    } catch (err) {
      toast.error(apiErrorMessage(err));
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">{user?.name}'s Profile</h1>
        <p className="text-slate-400">{user?.email}</p>
      </div>

      <div className="profile-grid mb-8">
        <section className="card">
          <h2 className="text-xl font-semibold mb-3">Account details</h2>
          <form className="profile-form" onSubmit={saveDetails}>
            <label className="field">
              <span>Name</span>
              <input value={name} onChange={(e) => setName(e.target.value)} required />
            </label>
            <label className="field">
              <span>Email</span>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </label>
            <button type="submit" className="btn btn-primary btn-sm" disabled={savingDetails}>
              {savingDetails ? "Saving..." : "Save details"}
            </button>
          </form>
        </section>

        <section className="card">
          <h2 className="text-xl font-semibold mb-3">Change password</h2>
          <form className="profile-form" onSubmit={savePassword}>
            <label className="field">
              <span>Current password</span>
              <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required />
            </label>
            <label className="field">
              <span>New password</span>
              <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} minLength={6} required />
            </label>
            <button type="submit" className="btn btn-primary btn-sm" disabled={savingPassword}>
              {savingPassword ? "Saving..." : "Change password"}
            </button>
          </form>
        </section>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <section>
          <h2 className="text-xl font-semibold mb-3">Watchlist</h2>
          <div className="space-y-3">
            {watchlist.length ? watchlist.map((item) => (
              <div key={item._id || item.malId} className="glass rounded-xl p-3 flex items-center gap-3">
                {item.image && <img src={item.image} alt={item.title} className="w-14 h-20 object-cover rounded-md" />}
                <div className="flex-1 min-w-0">
                  <Link to={`/anime/${item.malId}`} className="font-medium hover:text-white line-clamp-1">{item.title}</Link>
                  <p className="text-xs text-slate-400">{item.status || "Saved"}</p>
                </div>
                <button onClick={() => remove(item.malId)} className="text-xs px-3 py-1.5 rounded bg-white/10 hover:bg-white/20">Remove</button>
              </div>
            )) : <p className="text-slate-400">No items in watchlist yet.</p>}
          </div>
        </section>
        <section>
          <h2 className="text-xl font-semibold mb-3">Watch History</h2>
          <div className="space-y-3">
            {history.length ? history.map((item, idx) => (
              <Link key={`${item.malId}-${item.episode}-${idx}`} to={`/watch/${item.malId}?ep=${item.episode || 1}`} className="glass rounded-xl p-3 flex items-center gap-3 hover:bg-white/10">
                {item.image && <img src={item.image} alt={item.title} className="w-14 h-20 object-cover rounded-md" />}
                <div className="min-w-0">
                  <div className="font-medium line-clamp-1">{item.title}</div>
                  <p className="text-xs text-slate-400">Episode {item.episode || 1} • {new Date(item.lastWatchedAt).toLocaleString()}</p>
                </div>
              </Link>
            )) : <p className="text-slate-400">No watch history yet.</p>}
          </div>
        </section>
      </div>
    </div>
  );
}
