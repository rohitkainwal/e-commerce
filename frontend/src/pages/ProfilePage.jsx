import { useState } from "react";
import toast from "react-hot-toast";
import { FiMapPin, FiPackage } from "react-icons/fi";
import { Link } from "react-router-dom";
import axiosInstance from "../axios/axiosInstance";
import { useAuth } from "../context/auth.context.js";

export default function ProfilePage() {
  const { user, setUser } = useAuth();

  const [form, setForm] = useState({
    username: user?.username || "",
    email: user?.email || "",
    contactNumber: user?.contactNumber || "",
  });

  const [passwords, setPasswords] = useState({
    oldPassword: "",
    password: "",
  });

  const [busy, setBusy] = useState(false);

  async function updateProfile(e) {
    e.preventDefault();
    setBusy(true);
    try {
      const res = await axiosInstance.patch("/api/user/update-profile", form);
      setUser(res.data.payload);
      toast.success(res.data.message);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed");
    } finally {
      setBusy(false);
    }
  }

  async function updatePassword(e) {
    e.preventDefault();
    setBusy(true);
    try {
      const res = await axiosInstance.patch(
        "/api/user/update-password",
        passwords
      );
      toast.success(res.data.message);
      setPasswords({ oldPassword: "", password: "" });
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed");
    } finally {
      setBusy(false);
    }
  }

  const inputClass =
    "w-full border border-line-strong rounded-xl p-2.5 mb-3 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-25";

  return (
    <div>
      {/* header band */}
      <div className="bg-cream-100 border border-line rounded-xl p-6 mb-5 flex items-center gap-4 flex-wrap">
        <span className="h-14 w-14 rounded-full bg-primary-600 text-white grid place-items-center font-display text-xl font-extrabold">
          {user?.username?.[0]?.toUpperCase()}
        </span>

        <div className="flex-1">
          <h2 className="font-display text-xl font-bold text-ink-900">
            {user?.username}
          </h2>
          <p className="text-ink-600 text-sm">{user?.email}</p>
        </div>

        <div className="flex gap-2">
          <Link
            to="/orders"
            className="flex items-center gap-1.5 bg-white border border-line text-ink-700 hover:border-primary-400 hover:text-primary-600 px-4 py-2 rounded-lg text-sm font-semibold"
          >
            <FiPackage size={15} /> Orders
          </Link>
          <Link
            to="/addresses"
            className="flex items-center gap-1.5 bg-white border border-line text-ink-700 hover:border-primary-400 hover:text-primary-600 px-4 py-2 rounded-lg text-sm font-semibold"
          >
            <FiMapPin size={15} /> Addresses
          </Link>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-5">
        <form
          onSubmit={updateProfile}
          className="bg-white border border-line rounded-xl shadow-card p-5 flex-1"
        >
          <h3 className="font-display font-bold mb-4">My Details</h3>

          <label className="text-sm text-ink-600 block mb-1">Username</label>
          <input
            className={inputClass}
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
          />

          <label className="text-sm text-ink-600 block mb-1">Email</label>
          <input
            type="email"
            className={inputClass}
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />

          <label className="text-sm text-ink-600 block mb-1">
            Mobile Number
          </label>
          <input
            className={inputClass}
            value={form.contactNumber}
            onChange={(e) => setForm({ ...form, contactNumber: e.target.value })}
          />

          <button
            disabled={busy}
            className="bg-primary-600 text-white px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-primary-500 disabled:bg-ink-200 disabled:text-ink-400 transition"
          >
            Save Changes
          </button>
        </form>

        <form
          onSubmit={updatePassword}
          className="bg-white border border-line rounded-xl shadow-card p-5 flex-1 h-fit"
        >
          <h3 className="font-display font-bold mb-4">Change Password</h3>

          <input
            type="password"
            placeholder="Current password"
            className={inputClass}
            value={passwords.oldPassword}
            onChange={(e) =>
              setPasswords({ ...passwords, oldPassword: e.target.value })
            }
          />
          <input
            type="password"
            placeholder="New password"
            className={inputClass}
            value={passwords.password}
            onChange={(e) =>
              setPasswords({ ...passwords, password: e.target.value })
            }
          />

          <button
            disabled={busy}
            className="bg-primary-600 text-white px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-primary-500 disabled:bg-ink-200 disabled:text-ink-400 transition"
          >
            Update Password
          </button>
        </form>
      </div>
    </div>
  );
}
