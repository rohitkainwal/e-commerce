import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FiArrowLeft } from "react-icons/fi";
import { Link, useParams } from "react-router-dom";
import axiosInstance from "../axios/axiosInstance";
import Loader from "../components/Loader.jsx";
import { statusColor } from "../utils/orderStatus.js";

export default function OrderDetail() {
  const { orderId } = useParams();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    axiosInstance
      .get(`/api/shop/order/${orderId}`)
      .then((res) => setOrder(res.data.payload))
      .catch(() => setOrder(null))
      .finally(() => setLoading(false));
  }, [orderId]);

  async function cancelOrder() {
    if (!window.confirm("Cancel this order?")) return;
    setBusy(true);
    try {
      const res = await axiosInstance.patch(
        `/api/shop/order/${orderId}/cancel`
      );
      toast.success(res.data.message);
      setOrder(res.data.payload);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed");
    } finally {
      setBusy(false);
    }
  }

  if (loading) return <Loader />;

  if (!order)
    return (
      <div className="bg-white border border-line rounded-xl shadow-card p-12 text-center">
        <p className="font-display font-bold mb-2">Order not found</p>
        <Link to="/orders" className="text-primary-600 font-semibold">
          Back to orders
        </Link>
      </div>
    );

  //? once shipped or delivered, cancel is not allowed (backend also blocks it)
  const canCancel = !["Shipped", "Delivered", "Cancelled"].includes(
    order.orderStatus
  );

  return (
    <div className="flex flex-col gap-4">
      <Link
        to="/orders"
        className="text-sm text-primary-600 font-semibold flex items-center gap-1.5 hover:underline w-fit"
      >
        <FiArrowLeft size={15} /> Back to orders
      </Link>

      <div className="bg-white border border-line rounded-xl shadow-card p-5 flex justify-between items-start flex-wrap gap-3">
        <div>
          <h2 className="font-display text-xl font-bold">
            Order #{order._id.slice(-8)}
          </h2>
          <p className="text-sm text-ink-500">
            Placed on {new Date(order.createdAt).toLocaleString("en-IN")}
          </p>
        </div>

        <div className="text-right">
          <span
            className={`text-xs font-semibold px-3 py-1 rounded-full ${statusColor(
              order.orderStatus
            )}`}
          >
            {order.orderStatus}
          </span>
          <p className="text-sm text-ink-600 mt-1.5">
            {order.paymentMethod} · {order.paymentStatus}
          </p>
        </div>
      </div>

      <div className="bg-white border border-line rounded-xl shadow-card p-5">
        <h3 className="font-display font-bold mb-3">Items</h3>

        {order.cartItems.map((item) => (
          <div
            key={item.productId}
            className="flex items-center gap-4 py-3 border-b border-line last:border-0"
          >
            <div className="bg-cream-50 rounded-xl shrink-0">
              {item.image ? (
                <img
                  src={item.image}
                  alt={item.name}
                  className="h-16 w-16 object-contain p-1"
                />
              ) : (
                <div className="h-16 w-16 grid place-items-center text-[10px] text-ink-300">
                  No Image
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <p className="font-medium text-ink-900">{item.name}</p>
              <p className="text-sm text-ink-500">
                ₹{item.price} × {item.quantity}
              </p>
            </div>

            <p className="font-bold text-ink-900">
              ₹{item.price * item.quantity}
            </p>
          </div>
        ))}

        <div className="flex justify-between font-bold text-xl mt-4 pt-4 border-t border-line">
          <span>Total</span>
          <span>₹{order.totalAmount}</span>
        </div>
      </div>

      <div className="bg-white border border-line rounded-xl shadow-card p-5">
        <h3 className="font-display font-bold mb-2">Delivery Address</h3>
        <p className="font-medium text-ink-900">
          {order.addressInfo.addressLine}
        </p>
        <p className="text-sm text-ink-600">
          {order.addressInfo.city}, {order.addressInfo.state} -{" "}
          {order.addressInfo.pincode}
        </p>
        <p className="text-sm text-ink-600">Ph: {order.addressInfo.phone}</p>
        {order.addressInfo.notes && (
          <p className="text-xs text-ink-500 mt-1">
            Note: {order.addressInfo.notes}
          </p>
        )}
      </div>

      {canCancel && (
        <button
          onClick={cancelOrder}
          disabled={busy}
          className="border-2 border-brandred text-brandred px-6 py-2.5 rounded-lg font-semibold hover:bg-red-50 disabled:opacity-50 w-fit transition"
        >
          {busy ? "Cancelling..." : "Cancel Order"}
        </button>
      )}
    </div>
  );
}
