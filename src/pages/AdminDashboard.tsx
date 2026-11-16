import { useEffect, useState } from "react";
import { adminApi } from "../api/admin";
import type { AdminStats, AdminUser } from "../types";
import { apiErrorMessage } from "../api/client";
import toast from "react-hot-toast";

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    Promise.all([adminApi.getStats(), adminApi.getUsers({ limit: 20 })])
      .then(([s, u]) => {
        setStats(s);
        setUsers(u.data || []);
      })
      .catch((e) => toast.error(apiErrorMessage(e)))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const changeRole = async (id: string, role: "user" | "admin") => {
    try {
      await adminApi.updateRole(id, role);
      toast.success("Role updated");
      load();
    } catch (e) {
      toast.error(apiErrorMessage(e));
    }
  };

  const removeUser = async (id: string) => {
    if (!confirm("Delete this user?")) return;
    try {
      await adminApi.deleteUser(id);
      toast.success("User deleted");
      load();
    } catch (e) {
      toast.error(apiErrorMessage(e));
    }
  };

  const downloadReport = async () => {
    try {
      const blob = await adminApi.getReportBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "kyoto-anime-platform-report.pdf";
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      toast.error(apiErrorMessage(e));
    }
  };

  if (loading) return <div className="p-10 text-center text-slate-400">Loading...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <button className="btn btn-primary btn-sm" onClick={downloadReport}>Download report</button>
      </div>

      {stats ? (
        <>
          <div className="stat-grid stat-grid--four mb-8">
            <div className="stat-card"><span>Users</span><strong>{stats.totals.users}</strong></div>
            <div className="stat-card"><span>Admins</span><strong>{stats.totals.admins}</strong></div>
            <div className="stat-card"><span>Watchlist</span><strong>{stats.totals.watchlist}</strong></div>
            <div className="stat-card"><span>Reviews</span><strong>{stats.totals.reviews}</strong></div>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 mb-8">
            <section>
              <h2 className="text-xl font-semibold mb-3">Top anime</h2>
              <ul className="summary-list">
                {stats.topAnime.map((a) => (
                  <li key={a.malId}>
                    <span>{a.title}</span>
                    <span className="muted">{a.count}</span>
                  </li>
                ))}
              </ul>
            </section>
            <section>
              <h2 className="text-xl font-semibold mb-3">Top genres</h2>
              <ul className="summary-list">
                {stats.topGenres.map((g) => (
                  <li key={g.genre}>
                    <span>{g.genre}</span>
                    <span className="muted">{g.count}</span>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </>
      ) : null}

      <section>
        <h2 className="text-xl font-semibold mb-3">Users</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-400 border-b border-white/10">
                <th className="py-2">Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Stats</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-white/5">
                  <td className="py-2">{u.name}</td>
                  <td>{u.email}</td>
                  <td>{u.role}</td>
                  <td className="muted">{u.stats.watchlist} / {u.stats.reviews}</td>
                  <td className="flex gap-2 py-2">
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() => changeRole(u.id, u.role === "admin" ? "user" : "admin")}
                    >
                      Toggle role
                    </button>
                    <button className="btn btn-danger btn-sm" onClick={() => removeUser(u.id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
