import { useState } from "react";
import toast from "react-hot-toast";
import { FiMail } from "react-icons/fi";
import { Link } from "react-router-dom";
import axiosInstance from "../axios/axiosInstance";
import AuthCard from "../components/AuthCard.jsx";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setBusy(true);
    try {
      const res = await axiosInstance.post("/api/user/forgot-password", {
        email,
      });
      toast.success(res.data.message);
      setSent(true);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthCard
      title="Forgot Password"
      subtitle="We will send a reset link on your email"
    >
      {sent ? (
        <div className="text-center">
          <span className="h-14 w-14 rounded-full bg-primary-25 text-primary-600 grid place-items-center mx-auto mb-4">
            <FiMail size={24} />
          </span>
          <p className="text-ink-600 text-sm mb-5">
            Link sent to <b>{email}</b>. Please check your inbox, it is valid
            for 10 minutes.
          </p>
          <Link
            to="/login"
            className="text-primary-600 font-semibold hover:underline"
          >
            Back to Login
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Your email"
            className="w-full p-3 border border-line-strong rounded-xl mb-3 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-25"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button
            disabled={busy}
            className="bg-primary-600 text-white w-full py-3 rounded-lg font-semibold hover:bg-primary-500 disabled:bg-ink-200 disabled:text-ink-400 transition"
          >
            {busy ? "Sending..." : "Send Reset Link"}
          </button>

          <p className="text-sm text-center mt-4">
            <Link to="/login" className="text-ink-600 hover:text-primary-600">
              Back to Login
            </Link>
          </p>
        </form>
      )}
    </AuthCard>
  );
}
