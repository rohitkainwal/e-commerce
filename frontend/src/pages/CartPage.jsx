import { FiShoppingBag, FiTrash2 } from "react-icons/fi";
import { Link, useNavigate } from "react-router-dom";
import Loader from "../components/Loader.jsx";
import { useCart } from "../context/cart.context.js";

export default function CartPage() {
  const {
    items,
    totalAmount,
    loading,
    addToCart,
    removeFromCart,
    deleteFromCart,
    clearCart,
  } = useCart();

  const nav = useNavigate();

  if (loading) return <Loader text="Loading your cart..." />;

  if (items.length === 0)
    return (
      <div className="bg-white border border-line rounded-xl shadow-card p-14 text-center">
        <span className="h-16 w-16 rounded-full bg-primary-25 text-primary-600 grid place-items-center mx-auto mb-4">
          <FiShoppingBag size={26} />
        </span>
        <h2 className="font-display text-xl font-bold mb-1">
          Your basket is empty
        </h2>
        <p className="text-ink-500 mb-5">Add some fresh picks to get started.</p>
        <Link
          to="/products"
          className="bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-500 transition inline-block"
        >
          Browse Products
        </Link>
      </div>
    );

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      <div className="flex-1 flex flex-col gap-3">
        <div className="flex justify-between items-center">
          <h2 className="font-display text-2xl font-bold">
            My Basket{" "}
            <span className="text-ink-500 font-sans text-base font-normal">
              ({items.length} item{items.length > 1 ? "s" : ""})
            </span>
          </h2>
          <button
            onClick={clearCart}
            className="text-sm text-brandred font-semibold hover:underline"
          >
            Clear basket
          </button>
        </div>

        {items.map((item) => (
          <div
            key={item.productId}
            className="bg-white border border-line rounded-xl shadow-card p-4 flex gap-4 items-center"
          >
            <Link
              to={`/products/${item.productId}`}
              className="bg-cream-50 rounded-xl shrink-0"
            >
              {item.url ? (
                <img
                  src={item.url}
                  alt={item.name}
                  className="h-20 w-20 object-contain p-1"
                />
              ) : (
                <div className="h-20 w-20 grid place-items-center text-[10px] text-ink-300">
                  No Image
                </div>
              )}
            </Link>

            <div className="flex-1 min-w-0">
              <p className="text-[11px] uppercase tracking-wide text-primary-600 font-semibold">
                {item.brand}
              </p>
              <Link
                to={`/products/${item.productId}`}
                className="font-medium text-ink-900 hover:text-primary-600 line-clamp-1"
              >
                {item.name}
              </Link>
              <p className="text-sm text-ink-500 mt-0.5">
                ₹{item.salePrice} each
              </p>
            </div>

            {/* quantity buttons */}
            <div className="flex items-center gap-1 border border-line-strong rounded-lg p-1 bg-cream-50">
              <button
                onClick={() => removeFromCart(item.productId)}
                className="h-7 w-7 rounded-md bg-white border border-line text-primary-600 font-bold hover:bg-primary-600 hover:text-white transition"
              >
                −
              </button>
              <span className="w-7 text-center text-sm font-semibold text-primary-800">
                {item.quantity}
              </span>
              <button
                //? backend refuses if it goes above the stock
                disabled={item.quantity >= item.stock}
                onClick={() => addToCart(item.productId)}
                className="h-7 w-7 rounded-md bg-white border border-line text-primary-600 font-bold hover:bg-primary-600 hover:text-white transition disabled:opacity-40"
              >
                +
              </button>
            </div>

            <p className="w-24 text-right font-bold text-ink-900 hidden sm:block">
              ₹{item.salePrice * item.quantity}
            </p>

            <button
              onClick={() => deleteFromCart(item.productId)}
              className="text-ink-400 hover:text-brandred transition"
              title="Remove"
            >
              <FiTrash2 size={17} />
            </button>
          </div>
        ))}
      </div>

      {/* summary box */}
      <aside className="w-full lg:w-80 bg-white border border-line rounded-xl shadow-card p-5 h-fit lg:sticky lg:top-44">
        <h3 className="font-display font-bold text-lg mb-4">Price Details</h3>

        <div className="flex justify-between text-sm mb-2 text-ink-600">
          <span>Items</span>
          <span>{items.reduce((sum, i) => sum + i.quantity, 0)}</span>
        </div>
        <div className="flex justify-between text-sm mb-2 text-ink-600">
          <span>Subtotal</span>
          <span>₹{totalAmount}</span>
        </div>
        <div className="flex justify-between text-sm mb-2 text-ink-600">
          <span>Delivery</span>
          <span className="text-primary-600 font-semibold">Free</span>
        </div>

        <div className="border-t border-line my-4"></div>

        <div className="flex justify-between font-bold text-xl mb-5">
          <span>Total</span>
          <span>₹{totalAmount}</span>
        </div>

        <button
          onClick={() => nav("/checkout")}
          className="bg-primary-600 text-white w-full py-3 rounded-lg font-semibold hover:bg-primary-500 transition"
        >
          Proceed to Checkout
        </button>

        <Link
          to="/products"
          className="block text-center text-sm text-primary-600 font-semibold mt-3 hover:underline"
        >
          Continue shopping
        </Link>
      </aside>
    </div>
  );
}
