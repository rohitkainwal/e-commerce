import { useEffect, useState } from "react";
import { FiChevronRight, FiPackage } from "react-icons/fi";
import { Link } from "react-router-dom";
import axiosInstance from "../axios/axiosInstance";
import Loader from "../components/Loader.jsx";
import { statusColor } from "../utils/orderStatus.js";

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axiosInstance
      .get("/api/shop/order/all")
      .then((res) => setOrders(res.data.payload))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader text="Loading your orders..." />;

  if (orders.length === 0)
    return (
      <div className="bg-white border border-line rounded-xl shadow-card p-14 text-center">
        <span className="h-16 w-16 rounded-full bg-primary-25 text-primary-600 grid place-items-center mx-auto mb-4">
          <FiPackage size={26} />
        </span>
        <h2 className="font-display text-xl font-bold mb-1">No orders yet</h2>
        <p className="text-ink-500 mb-5">
          Your past orders will show up here.
        </p>
        <Link
          to="/products"
          className="bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-500 inline-block"
        >
          Start shopping
        </Link>
      </div>
    );

  return (
    <div>
      <h2 className="font-display text-2xl font-bold mb-5">My Orders</h2>

      <div className="flex flex-col gap-3">
        {orders.map((order) => (
          <Link
            key={order._id}
            to={`/orders/${order._id}`}
            className="bg-white border border-line rounded-xl shadow-card p-5 hover:border-primary-200 hover:shadow-card-hover transition block"
          >
            <div className="flex justify-between items-start flex-wrap gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs text-ink-500 font-mono">
                    #{order._id.slice(-8)}
                  </span>
                  <span
                    className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${statusColor(
                      order.orderStatus
                    )}`}
                  >
                    {order.orderStatus}
                  </span>
                </div>

                <p className="font-medium text-ink-900 line-clamp-1">
                  {order.cartItems.map((i) => i.name).join(", ")}
                </p>

                <p className="text-sm text-ink-500 mt-0.5">
                  {new Date(order.createdAt).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}{" "}
                  · {order.cartItems.length} item(s) · {order.paymentMethod}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <p className="font-bold text-lg text-ink-900">
                  ₹{order.totalAmount}
                </p>
                <FiChevronRight className="text-ink-400" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
