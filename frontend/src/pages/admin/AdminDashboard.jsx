import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  FiAlertTriangle,
  FiBox,
  FiShoppingBag,
  FiTrendingUp,
  FiUsers,
} from "react-icons/fi";
import { Link } from "react-router-dom";
import axiosInstance from "../../axios/axiosInstance";
import Loader from "../../components/Loader.jsx";
import { statusColor } from "../../utils/orderStatus.js";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axiosInstance
      .get("/api/admin/dashboard/stats")
      .then((res) => setStats(res.data.payload))
      .catch((err) =>
        toast.error(err.response?.data?.message || "Could not load stats")
      )
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader text="Loading dashboard..." />;
  if (!stats) return <p className="text-ink-500">No data.</p>;

  const cards = [
    {
      label: "Revenue",
      value: `₹${stats.revenue.toLocaleString("en-IN")}`,
      icon: <FiTrendingUp />,
      note: "cancelled orders not counted",
    },
    {
      label: "Orders",
      value: stats.totalOrders,
      icon: <FiShoppingBag />,
      note: `${stats.ordersByStatus?.Placed || 0} placed`,
    },
    {
      label: "Products",
      value: stats.totalProducts,
      icon: <FiBox />,
      note: `${stats.lowStock} low stock`,
    },
    {
      label: "Customers",
      value: stats.totalUsers,
      icon: <FiUsers />,
      note: "registered users",
    },
  ];

  return (
    <div className="flex flex-col gap-5">
      {/* top numbers */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {cards.map((c) => (
          <div
            key={c.label}
            className="bg-white border border-line rounded-xl shadow-card p-4"
          >
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs text-ink-500 font-medium">{c.label}</p>
              <span className="h-8 w-8 rounded-full bg-primary-25 text-primary-600 grid place-items-center">
                {c.icon}
              </span>
            </div>
            <p className="font-display text-2xl font-bold text-ink-900">
              {c.value}
            </p>
            <p className="text-[11px] text-ink-400 mt-0.5">{c.note}</p>
          </div>
        ))}
      </div>

      {/* stock warning */}
      {(stats.lowStock > 0 || stats.outOfStock > 0) && (
        <div className="bg-accent-soft border border-line rounded-xl p-4 flex items-start gap-3">
          <FiAlertTriangle className="text-accent-ink mt-0.5 shrink-0" />
          <div className="flex-1">
            <p className="font-semibold text-accent-ink text-sm">
              Stock needs attention
            </p>
            <p className="text-sm text-ink-700">
              {stats.outOfStock} product(s) out of stock, {stats.lowStock} running
              low (5 or less).
            </p>
          </div>
          <Link
            to="/admin/products"
            className="text-sm font-semibold text-primary-700 hover:underline whitespace-nowrap"
          >
            Review
          </Link>
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-5">
        {/* orders by status */}
        <div className="bg-white border border-line rounded-xl shadow-card p-5">
          <h3 className="font-display font-bold mb-4">Orders by Status</h3>

          {Object.keys(stats.ordersByStatus || {}).length === 0 ? (
            <p className="text-sm text-ink-500">No orders yet.</p>
          ) : (
            <div className="flex flex-col gap-2.5">
              {Object.entries(stats.ordersByStatus).map(([status, count]) => {
                const pct = Math.round((count / stats.totalOrders) * 100);
                return (
                  <div key={status}>
                    <div className="flex justify-between text-sm mb-1">
                      <span
                        className={`text-xs font-semibold px-2 py-0.5 rounded-full ${statusColor(
                          status
                        )}`}
                      >
                        {status}
                      </span>
                      <span className="text-ink-600">
                        {count} ({pct}%)
                      </span>
                    </div>
                    <div className="h-1.5 bg-ink-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary-500 rounded-full"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* best sellers */}
        <div className="bg-white border border-line rounded-xl shadow-card p-5">
          <h3 className="font-display font-bold mb-4">Top Selling</h3>

          {stats.topProducts.length === 0 ? (
            <p className="text-sm text-ink-500">Nothing sold yet.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {stats.topProducts.map((p, i) => (
                <div
                  key={p._id}
                  className="flex items-center gap-3 text-sm py-1.5 border-b border-line last:border-0"
                >
                  <span className="h-6 w-6 rounded-full bg-cream-100 text-ink-600 grid place-items-center text-xs font-bold shrink-0">
                    {i + 1}
                  </span>
                  <span className="flex-1 truncate text-ink-900">{p._id}</span>
                  <span className="text-ink-500 text-xs">{p.sold} sold</span>
                  <span className="font-semibold w-20 text-right">
                    ₹{p.earned.toLocaleString("en-IN")}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* latest orders */}
      <div className="bg-white border border-line rounded-xl shadow-card overflow-hidden">
        <div className="flex justify-between items-center p-5 pb-3">
          <h3 className="font-display font-bold">Recent Orders</h3>
          <Link
            to="/admin/orders"
            className="text-sm font-semibold text-primary-600 hover:underline"
          >
            View all
          </Link>
        </div>

        {stats.recentOrders.length === 0 ? (
          <p className="text-sm text-ink-500 px-5 pb-5">No orders yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-cream-100 text-left text-ink-600">
                <tr>
                  <th className="p-3 font-semibold text-xs uppercase">Order</th>
                  <th className="p-3 font-semibold text-xs uppercase">
                    Customer
                  </th>
                  <th className="p-3 font-semibold text-xs uppercase">Date</th>
                  <th className="p-3 font-semibold text-xs uppercase">Total</th>
                  <th className="p-3 font-semibold text-xs uppercase">Status</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentOrders.map((o) => (
                  <tr key={o._id} className="border-t border-line">
                    <td className="p-3 font-mono text-xs">
                      #{o._id.slice(-8)}
                    </td>
                    <td className="p-3">
                      {o.userId?.username || "—"}
                      <span className="block text-xs text-ink-500">
                        {o.userId?.email}
                      </span>
                    </td>
                    <td className="p-3 text-ink-600">
                      {new Date(o.createdAt).toLocaleDateString("en-IN")}
                    </td>
                    <td className="p-3 font-semibold">₹{o.totalAmount}</td>
                    <td className="p-3">
                      <span
                        className={`text-xs font-semibold px-2 py-0.5 rounded-full ${statusColor(
                          o.orderStatus
                        )}`}
                      >
                        {o.orderStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
