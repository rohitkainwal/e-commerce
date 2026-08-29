import { useState } from "react";
import toast from "react-hot-toast";
import { Link, useLocation, useNavigate } from "react-router-dom";
import axiosInstance from "../axios/axiosInstance";
import AuthCard from "../components/AuthCard.jsx";
import { useAuth } from "../context/auth.context.js";

export default function LoginPage() {
  const nav = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [form, setForm] = useState({ email: "", password: "" });
  const [busy, setBusy] = useState(false);
  //? if email is not verified we show a resend button
  const [showResend, setShowResend] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setBusy(true);
    setShowResend(false);
    try {
      const data = await login(form);
      toast.success(data.message);
      //? go back to the page he wanted before login
      nav(location.state?.from || "/");
    } catch (err) {
      const msg = err.response?.data?.message || "Failed";
      toast.error(msg);
      if (msg.includes("Not Verified")) setShowResend(true);
    } finally {
      setBusy(false);
    }
  }

  async function resendLink() {
    try {
      const res = await axiosInstance.post("/api/user/resend-email-link", {
        email: form.email,
      });
      toast.success(res.data.message);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed");
    }
  }

  const inputClass =
    "w-full p-3 border border-line-strong rounded-xl mb-3 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-25";

  return (
    <AuthCard title="Welcome back" subtitle="Login to continue shopping">
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email address"
          className={inputClass}
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <input
          type="password"
          placeholder="Password"
          className={inputClass}
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />

        <button
          disabled={busy}
          className="bg-primary-600 text-white w-full py-3 rounded-lg font-semibold hover:bg-primary-500 disabled:bg-ink-200 disabled:text-ink-400 transition"
        >
          {busy ? "Please wait..." : "Login"}
        </button>

        {showResend && (
          <button
            type="button"
            onClick={resendLink}
            className="w-full mt-3 text-sm text-primary-600 font-semibold underline"
          >
            Resend verification link
          </button>
        )}

        <div className="flex justify-between mt-4 text-sm">
          <Link
            to="/forgot-password"
            className="text-ink-600 hover:text-primary-600"
          >
            Forgot password?
          </Link>
          <Link
            to="/signup"
            className="text-primary-600 font-semibold hover:underline"
          >
            Create account
          </Link>
        </div>
      </form>
    </AuthCard>
  );
}
