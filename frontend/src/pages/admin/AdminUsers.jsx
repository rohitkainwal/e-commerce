import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FiSearch, FiTrash2 } from "react-icons/fi";
import axiosInstance from "../../axios/axiosInstance";
import Loader from "../../components/Loader.jsx";
import { useAuth } from "../../context/auth.context.js";

export default function AdminUsers() {
  const { user: me } = useAuth();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState("");

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get("/api/admin/user/all", {
        params: { keyword: keyword || undefined },
      });
      setUsers(res.data.payload);
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not load users");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [keyword]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  async function changeRole(userId, role) {
    try {
      await axiosInstance.patch(`/api/admin/user/${userId}/role`, { role });
      toast.success(`Now ${role}`);
      loadUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed");
    }
  }

  async function removeUser(userId, name) {
    if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return;
    try {
      await axiosInstance.delete(`/api/admin/user/${userId}`);
      toast.success("User deleted");
      loadUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed");
    }
  }

  const admins = users.filter((u) => u.role === "admin").length;

  return (
    <div>
      <div className="flex gap-2 mb-4 flex-wrap items-center">
        <div className="flex items-center gap-2 bg-white border border-line rounded-lg px-3 py-2 flex-1 min-w-[220px]">
          <FiSearch size={15} className="text-ink-400" />
          <input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Search by name, email or mobile"
            className="w-full text-sm outline-none bg-transparent placeholder:text-ink-400"
          />
        </div>

        <p className="text-sm text-ink-500">
          {users.length} user(s) · {admins} admin
        </p>
      </div>

      {loading ? (
        <Loader text="Loading users..." />
      ) : users.length === 0 ? (
        <div className="bg-white border border-line rounded-xl shadow-card p-12 text-center">
          <p className="font-display font-bold mb-1">No users found</p>
        </div>
      ) : (
        <div className="bg-white border border-line rounded-xl shadow-card overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-cream-100 text-left text-ink-600">
              <tr>
                <th className="p-3 font-semibold text-xs uppercase">User</th>
                <th className="p-3 font-semibold text-xs uppercase">Mobile</th>
                <th className="p-3 font-semibold text-xs uppercase">Verified</th>
                <th className="p-3 font-semibold text-xs uppercase">Orders</th>
                <th className="p-3 font-semibold text-xs uppercase">Spent</th>
                <th className="p-3 font-semibold text-xs uppercase">Role</th>
                <th className="p-3 font-semibold text-xs uppercase text-right">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => {
                const isMe = u.id === me?.id;
                return (
                  <tr key={u.id} className="border-t border-line hover:bg-cream-50">
                    <td className="p-3">
                      <div className="flex items-center gap-2.5">
                        <span className="h-8 w-8 rounded-full bg-primary-25 text-primary-700 grid place-items-center font-display font-bold text-xs shrink-0">
                          {u.username?.[0]?.toUpperCase()}
                        </span>
                        <div>
                          <span className="font-medium text-ink-900">
                            {u.username}
                            {isMe && (
                              <span className="text-[10px] text-ink-400 ml-1">
                                (you)
                              </span>
                            )}
                          </span>
                          <span className="block text-xs text-ink-500">
                            {u.email}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="p-3 text-ink-600">{u.contactNumber}</td>
                    <td className="p-3">
                      <span
                        className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                          u.isVerified
                            ? "bg-primary-25 text-primary-700"
                            : "bg-accent-soft text-accent-ink"
                        }`}
                      >
                        {u.isVerified ? "Yes" : "No"}
                      </span>
                    </td>
                    <td className="p-3 text-ink-600">{u.orders}</td>
                    <td className="p-3 font-semibold whitespace-nowrap">
                      ₹{u.spent.toLocaleString("en-IN")}
                    </td>
                    <td className="p-3">
                      {/* backend also blocks changing your own role */}
                      <select
                        value={u.role}
                        disabled={isMe}
                        onChange={(e) => changeRole(u.id, e.target.value)}
                        className="text-xs font-semibold px-2 py-1 rounded-lg border border-line bg-white outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <option value="user">user</option>
                        <option value="admin">admin</option>
                      </select>
                    </td>
                    <td className="p-3 text-right">
                      <button
                        disabled={isMe}
                        onClick={() => removeUser(u.id, u.username)}
                        className="text-brandred hover:text-red-700 disabled:opacity-30 disabled:cursor-not-allowed"
                        title={isMe ? "You cannot delete yourself" : "Delete user"}
                      >
                        <FiTrash2 size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
