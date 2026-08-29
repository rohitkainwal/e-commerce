import { useState } from "react";
import toast from "react-hot-toast";
import { FiMail } from "react-icons/fi";
import { Link } from "react-router-dom";
import axiosInstance from "../axios/axiosInstance";
import AuthCard from "../components/AuthCard.jsx";

export default function SignupPage() {
  //! backend expects username + contactNumber also, not just name/email/password
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    contactNumber: "",
  });
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  async function submitForm(e) {
    e.preventDefault();
    setBusy(true);
    try {
      const res = await axiosInstance.post("/api/user/register", form);
      toast.success(res.data.message);
      //? he cannot login until the mail link is clicked
      setDone(true);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed");
    } finally {
      setBusy(false);
    }
  }

  const inputClass =
    "w-full p-3 border border-line-strong rounded-xl mb-3 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-25";

  if (done)
    return (
      <AuthCard title="Check your email">
        <div className="text-center">
          <span className="h-14 w-14 rounded-full bg-primary-25 text-primary-600 grid place-items-center mx-auto mb-4">
            <FiMail size={24} />
          </span>
          <p className="text-ink-600 text-sm mb-5 leading-relaxed">
            We sent a verification link to <b>{form.email}</b>. Please click it
            first, then you can login.
          </p>
          <Link
            to="/login"
            className="bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-500 inline-block"
          >
            Go to Login
          </Link>
        </div>
      </AuthCard>
    );

  return (
    <AuthCard title="Create account" subtitle="Join and start shopping fresh">
      <form onSubmit={submitForm}>
        <input
          type="text"
          placeholder="Username (min 5 letters)"
          className={inputClass}
          value={form.username}
          onChange={(e) => setForm({ ...form, username: e.target.value })}
        />
        <input
          type="email"
          placeholder="Email address"
          className={inputClass}
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <input
          type="text"
          placeholder="Mobile Number (10 digits)"
          className={inputClass}
          value={form.contactNumber}
          onChange={(e) => setForm({ ...form, contactNumber: e.target.value })}
        />
        <input
          type="password"
          placeholder="Password (min 5 letters)"
          className={inputClass}
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />

        <button
          disabled={busy}
          className="bg-primary-600 text-white w-full py-3 rounded-lg font-semibold hover:bg-primary-500 disabled:bg-ink-200 disabled:text-ink-400 transition"
        >
          {busy ? "Please wait..." : "Create Account"}
        </button>

        <p className="text-sm text-center mt-4 text-ink-600">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-primary-600 font-semibold hover:underline"
          >
            Login
          </Link>
        </p>
      </form>
    </AuthCard>
  );
}
