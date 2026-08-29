import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Link, useNavigate, useParams } from "react-router-dom";
import axiosInstance from "../axios/axiosInstance";
import AuthCard from "../components/AuthCard.jsx";
import Loader from "../components/Loader.jsx";

export default function ResetPassword() {
  const { resetPasswordToken } = useParams();
  const nav = useNavigate();

  const [checking, setChecking] = useState(true);
  const [valid, setValid] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);

  //? first check the link is still valid, then only show the form
  useEffect(() => {
    axiosInstance
      .get(`/api/user/reset-password/${resetPasswordToken}`)
      .then(() => setValid(true))
      .catch(() => setValid(false))
      .finally(() => setChecking(false));
  }, [resetPasswordToken]);

  async function handleSubmit(e) {
    e.preventDefault();

    if (password !== confirm) {
      toast.error("Both passwords do not match");
      return;
    }

    setBusy(true);
    try {
      const res = await axiosInstance.post(
        `/api/user/reset-password/${resetPasswordToken}`,
        { password }
      );
      toast.success(res.data.message);
      nav("/login");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed");
    } finally {
      setBusy(false);
    }
  }

  const inputClass =
    "w-full p-3 border border-line-strong rounded-xl mb-3 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-25";

  if (checking) return <Loader text="Checking your link..." />;

  if (!valid)
    return (
      <AuthCard title="Link Expired">
        <div className="text-center">
          <p className="text-ink-600 mb-5">
            This reset link is not valid anymore, please request a new one.
          </p>
          <Link
            to="/forgot-password"
            className="bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-500 inline-block"
          >
            Request again
          </Link>
        </div>
      </AuthCard>
    );

  return (
    <AuthCard title="Reset Password" subtitle="Choose a new password">
      <form onSubmit={handleSubmit}>
        <input
          type="password"
          placeholder="New password"
          className={inputClass}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <input
          type="password"
          placeholder="Confirm new password"
          className={inputClass}
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
        />

        <button
          disabled={busy}
          className="bg-primary-600 text-white w-full py-3 rounded-lg font-semibold hover:bg-primary-500 disabled:bg-ink-200 disabled:text-ink-400 transition"
        >
          {busy ? "Please wait..." : "Reset Password"}
        </button>
      </form>
    </AuthCard>
  );
}
