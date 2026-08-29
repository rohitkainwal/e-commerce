import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import axiosInstance from "../axios/axiosInstance";
import Loader from "../components/Loader.jsx";
import { useCart } from "../context/cart.context.js";

export default function CheckoutPage() {
  const { items, totalAmount, cartId, fetchCart } = useCart();
  const nav = useNavigate();

  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);
  //? tells the user before he clicks, backend blocks it anyway
  const [reach, setReach] = useState(null);

  useEffect(() => {
    axiosInstance
      .get("/api/shop/address/all")
      .then((res) => {
        setAddresses(res.data.payload);
        //? select the first one by default
        if (res.data.payload.length > 0)
          setSelectedAddress(res.data.payload[0]._id);
      })
      .catch(() => setAddresses([]))
      .finally(() => setLoading(false));
  }, []);

  //! whenever the selected address changes, ask if we deliver there
  useEffect(() => {
    const addr = addresses.find((a) => a._id === selectedAddress);
    if (!addr) return setReach(null);

    let ignore = false;
    axiosInstance
      .get("/api/shop/service-area/check", {
        params: { lat: addr.lat ?? undefined, lng: addr.lng ?? undefined, city: addr.city },
      })
      .then((res) => {
        if (!ignore) setReach(res.data.payload);
      })
      .catch(() => {
        if (!ignore) setReach(null);
      });

    return () => {
      ignore = true;
    };
  }, [selectedAddress, addresses]);

  async function placeOrder() {
    if (!selectedAddress) {
      toast.error("Please select an address");
      return;
    }

    setPlacing(true);
    try {
      const res = await axiosInstance.post("/api/shop/order/create", {
        cartId,
        addressId: selectedAddress,
        paymentMethod,
      });

      if (paymentMethod === "Online") {
        //? backend sends the paypal approval url, so we send the user there
        window.location.href = res.data.payload;
        return;
      }

      toast.success(res.data.message);
      await fetchCart(); //? cart is empty now on backend, refresh it here also
      nav("/orders");
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not place order");
    } finally {
      setPlacing(false);
    }
  }

  if (loading) return <Loader />;

  if (items.length === 0)
    return (
      <div className="bg-white border border-line rounded-xl shadow-card p-14 text-center">
        <p className="text-ink-500 mb-4">Your basket is empty.</p>
        <Link
          to="/products"
          className="bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-500 inline-block"
        >
          Browse Products
        </Link>
      </div>
    );

  return (
    <div>
      <h2 className="font-display text-2xl font-bold mb-5">Checkout</h2>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1 flex flex-col gap-4">
          <div className="bg-white border border-line rounded-xl shadow-card p-5">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-display font-bold">Delivery Address</h3>
              <Link
                to="/addresses"
                className="text-sm text-primary-600 font-semibold hover:underline"
              >
                Manage
              </Link>
            </div>

            {addresses.length === 0 ? (
              <p className="text-sm text-ink-500 bg-cream-100 p-4 rounded-xl">
                No address saved.{" "}
                <Link
                  to="/addresses"
                  className="text-primary-600 font-semibold underline"
                >
                  Add one first
                </Link>
              </p>
            ) : (
              addresses.map((addr) => (
                <label
                  key={addr._id}
                  className={`block border rounded-xl p-4 mb-2 cursor-pointer transition ${
                    selectedAddress === addr._id
                      ? "border-primary-500 bg-primary-25"
                      : "border-line hover:border-primary-200"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="radio"
                      name="address"
                      className="mt-1 accent-primary-600"
                      checked={selectedAddress === addr._id}
                      onChange={() => setSelectedAddress(addr._id)}
                    />
                    <div>
                      <p className="font-semibold text-ink-900">
                        {addr.addressLine}
                      </p>
                      <p className="text-sm text-ink-600">
                        {addr.city}, {addr.state} - {addr.pinCode}
                      </p>
                      <p className="text-sm text-ink-600">Ph: {addr.phone}</p>
                    </div>
                  </div>
                </label>
              ))
            )}
          </div>

          {reach && !reach.deliverable && (
            <div className="bg-accent-soft border border-line rounded-xl p-4 text-sm">
              <p className="font-semibold text-accent-ink mb-0.5">
                We do not deliver to this address yet
              </p>
              <p className="text-ink-700">
                {reach.nearest
                  ? `Nearest delivery area is ${reach.nearest.city} (${reach.distance} km away).`
                  : "Please pick a different address."}
              </p>
            </div>
          )}

          <div className="bg-white border border-line rounded-xl shadow-card p-5">
            <h3 className="font-display font-bold mb-4">Payment Method</h3>

            <label
              className={`flex items-center gap-3 border rounded-xl p-4 mb-2 cursor-pointer transition ${
                paymentMethod === "COD"
                  ? "border-primary-500 bg-primary-25"
                  : "border-line"
              }`}
            >
              <input
                type="radio"
                name="payment"
                className="accent-primary-600"
                checked={paymentMethod === "COD"}
                onChange={() => setPaymentMethod("COD")}
              />
              <div>
                <p className="font-semibold text-ink-900">Cash on Delivery</p>
                <p className="text-sm text-ink-500">Pay when it reaches you</p>
              </div>
            </label>

            <label className="flex items-center gap-3 border border-line rounded-xl p-4 opacity-50 cursor-not-allowed">
              <input type="radio" name="payment" disabled />
              <div>
                <p className="font-semibold text-ink-700">Online (Paypal)</p>
                <p className="text-sm text-ink-500">Not available yet</p>
              </div>
            </label>
          </div>
        </div>

        <aside className="w-full lg:w-80 bg-white border border-line rounded-xl shadow-card p-5 h-fit lg:sticky lg:top-44">
          <h3 className="font-display font-bold text-lg mb-4">Order Summary</h3>

          {items.map((item) => (
            <div
              key={item.productId}
              className="flex justify-between text-sm mb-2 text-ink-600"
            >
              <span className="truncate mr-2">
                {item.name}{" "}
                <span className="text-ink-400">x{item.quantity}</span>
              </span>
              <span className="shrink-0">
                ₹{item.salePrice * item.quantity}
              </span>
            </div>
          ))}

          <div className="border-t border-line my-4"></div>

          <div className="flex justify-between font-bold text-xl mb-5">
            <span>Total</span>
            <span>₹{totalAmount}</span>
          </div>

          <button
            onClick={placeOrder}
            disabled={placing || addresses.length === 0 || (reach && !reach.deliverable)}
            className="bg-primary-600 text-white w-full py-3 rounded-lg font-semibold hover:bg-primary-500 disabled:bg-ink-200 disabled:text-ink-400 transition"
          >
            {placing
              ? "Placing..."
              : reach && !reach.deliverable
                ? "Not deliverable"
                : "Confirm Order"}
          </button>
        </aside>
      </div>
    </div>
  );
}
