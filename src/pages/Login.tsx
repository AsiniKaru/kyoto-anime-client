import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { apiErrorMessage } from "../api/client";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login({ email, password });
      navigate("/profile");
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <div className="glass rounded-2xl p-8">
        <h1 className="text-2xl font-bold mb-2">Welcome back</h1>
        <p className="text-slate-400 mb-6">Login to access your watchlist and history.</p>
        <form onSubmit={submit} className="space-y-4">
          <input className="w-full rounded-lg bg-white/5 border border-white/10 px-4 py-2.5 outline-none focus:border-accent" placeholder="Email" type="email" value={email} onChange={e=>setEmail(e.target.value)} required />
          <input className="w-full rounded-lg bg-white/5 border border-white/10 px-4 py-2.5 outline-none focus:border-accent" placeholder="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)} required />
          {error && <p className="text-rose-400 text-sm">{error}</p>}
          <button disabled={loading} className="w-full px-4 py-2.5 rounded-lg bg-accent hover:bg-rose-600 font-medium disabled:opacity-60">{loading?"Logging in...":"Login"}</button>
        </form>
        <p className="text-sm text-slate-400 mt-4">No account? <Link to="/register" className="text-accent hover:underline">Register</Link></p>
      </div>
    </div>
  );
}
