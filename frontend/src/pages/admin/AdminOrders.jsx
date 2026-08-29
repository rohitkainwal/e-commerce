import { Fragment, useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FiSearch } from "react-icons/fi";
import axiosInstance from "../../axios/axiosInstance";
import Loader from "../../components/Loader.jsx";
import { statusColor } from "../../utils/orderStatus.js";

const STATUSES = [
  "Pending",
  "Processing",
  "Placed",
  "Shipped",
  "Delivered",
  "Cancelled",
];

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");
  const [keyword, setKeyword] = useState("");
  const [openId, setOpenId] = useState(null);

  const loadOrders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get("/api/admin/order/all", {
        params: { status: status || undefined, keyword: keyword || undefined },
      });
      setOrders(res.data.payload);
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not load orders");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [status, keyword]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  //! changing the status also puts stock back when it is cancelled (backend does it)
  async function changeStatus(orderId, orderStatus) {
    try {
      const res = await axiosInstance.patch(
        `/api/admin/order/${orderId}/status`,
        { orderStatus }
      );
      toast.success(`Order marked ${orderStatus}`);
      //? update just this row instead of reloading everything
      setOrders((prev) =>
        prev.map((o) =>
          o._id === orderId
            ? {
                ...o,
                orderStatus: res.data.payload.orderStatus,
                paymentStatus: res.data.payload.paymentStatus,
              }
            : o
        )
      );
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed");
    }
  }

  return (
    <div>
      <div className="flex gap-2 mb-4 flex-wrap">
        <div className="flex items-center gap-2 bg-white border border-line rounded-lg px-3 py-2 flex-1 min-w-[220px]">
          <FiSearch size={15} className="text-ink-400" />
          <input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Search by customer, email or order id"
            className="w-full text-sm outline-none bg-transparent placeholder:text-ink-400"
          />
        </div>

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="border border-line rounded-lg px-3 py-2 text-sm bg-white outline-none"
        >
          <option value="">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <Loader text="Loading orders..." />
      ) : orders.length === 0 ? (
        <div className="bg-white border border-line rounded-xl shadow-card p-12 text-center">
          <p className="font-display font-bold mb-1">No orders found</p>
          <p className="text-ink-500 text-sm">
            Try clearing the filter or the search box.
          </p>
        </div>
      ) : (
        <div className="bg-white border border-line rounded-xl shadow-card overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-cream-100 text-left text-ink-600">
              <tr>
                <th className="p-3 font-semibold text-xs uppercase">Order</th>
                <th className="p-3 font-semibold text-xs uppercase">Customer</th>
                <th className="p-3 font-semibold text-xs uppercase">Items</th>
                <th className="p-3 font-semibold text-xs uppercase">Total</th>
                <th className="p-3 font-semibold text-xs uppercase">Payment</th>
                <th className="p-3 font-semibold text-xs uppercase">Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <Fragment key={o._id}>
                  <tr
                    onClick={() => setOpenId(openId === o._id ? null : o._id)}
                    className="border-t border-line hover:bg-cream-50 cursor-pointer"
                  >
                    <td className="p-3">
                      <span className="font-mono text-xs">
                        #{o._id.slice(-8)}
                      </span>
                      <span className="block text-xs text-ink-500">
                        {new Date(o.createdAt).toLocaleDateString("en-IN")}
                      </span>
                    </td>
                    <td className="p-3">
                      {o.userId?.username || "—"}
                      <span className="block text-xs text-ink-500">
                        {o.userId?.email}
                      </span>
                    </td>
                    <td className="p-3 text-ink-600">{o.cartItems.length}</td>
                    <td className="p-3 font-semibold whitespace-nowrap">
                      ₹{o.totalAmount}
                    </td>
                    <td className="p-3 text-ink-600 text-xs">
                      {o.paymentMethod}
                      <span className="block">{o.paymentStatus}</span>
                    </td>
                    <td className="p-3" onClick={(e) => e.stopPropagation()}>
                      <select
                        value={o.orderStatus}
                        onChange={(e) => changeStatus(o._id, e.target.value)}
                        className={`text-xs font-semibold px-2 py-1 rounded-full border-0 outline-none cursor-pointer ${statusColor(
                          o.orderStatus
                        )}`}
                      >
                        {STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>

                  {/* click a row to see what was ordered */}
                  {openId === o._id && (
                    <tr className="bg-cream-50">
                      <td colSpan={6} className="p-4">
                        <div className="flex flex-col lg:flex-row gap-6">
                          <div className="flex-1">
                            <p className="text-xs font-semibold uppercase text-ink-500 mb-2">
                              Items
                            </p>
                            {o.cartItems.map((it) => (
                              <div
                                key={it.productId}
                                className="flex items-center gap-3 py-1.5"
                              >
                                {it.image ? (
                                  <img
                                    src={it.image}
                                    alt={it.name}
                                    className="h-9 w-9 object-cover rounded"
                                  />
                                ) : (
                                  <div className="h-9 w-9 bg-cream-200 rounded" />
                                )}
                                <span className="flex-1">{it.name}</span>
                                <span className="text-ink-500 text-xs">
                                  ₹{it.price} × {it.quantity}
                                </span>
                              </div>
                            ))}
                          </div>

                          <div className="lg:w-64">
                            <p className="text-xs font-semibold uppercase text-ink-500 mb-2">
                              Deliver to
                            </p>
                            <p className="font-medium">
                              {o.addressInfo.addressLine}
                            </p>
                            <p className="text-ink-600">
                              {o.addressInfo.city}, {o.addressInfo.state} -{" "}
                              {o.addressInfo.pincode}
                            </p>
                            <p className="text-ink-600">
                              Ph: {o.addressInfo.phone}
                            </p>
                            {o.addressInfo.notes && (
                              <p className="text-xs text-ink-500 mt-1">
                                Note: {o.addressInfo.notes}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
