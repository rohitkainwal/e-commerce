import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  FiClock,
  FiHeart,
  FiLogOut,
  FiMenu,
  FiSearch,
  FiShoppingCart,
  FiTruck,
  FiUser,
} from "react-icons/fi";
import { Link, useNavigate } from "react-router-dom";
import axiosInstance from "../axios/axiosInstance";
import { useAuth } from "../context/auth.context.js";
import { useCart } from "../context/cart.context.js";
import { sortCategories } from "../utils/categoryImage.js";
import LocationPicker from "./LocationPicker.jsx";
import Logo from "./Logo.jsx";

const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();

  const [keyword, setKeyword] = useState("");
  const [categories, setCategories] = useState([]);

  //? the green bar shows a few real categories from the database
  useEffect(() => {
    axiosInstance
      .get("/api/shop/product/filters")
      .then((res) => setCategories(sortCategories(res.data.payload.categories || [])))
      .catch(() => setCategories([]));
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!keyword.trim()) return;
    navigate(`/products?keyword=${keyword.trim()}`);
  };

  const handleLogout = async () => {
    await logout();
    toast.success("Logged out");
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-20 bg-white">
      {/* 1. thin dark green strip */}
      <div className="bg-primary-500 text-primary-100 text-[12.5px]">
        <div className="max-w-7xl mx-auto px-6 py-2 flex items-center justify-between gap-4">
          <div className="flex items-center gap-1.5">
            <FiTruck size={14} />
            <span>Free Delivery on orders above ₹499</span>
          </div>
          <div className="hidden sm:flex items-center gap-1.5">
            <FiClock size={14} />
            <span>Delivering happiness since 2026</span>
          </div>
        </div>
      </div>

      {/* 2. white bar --> logo, location, search, account, cart */}
      <div className="border-b border-line">
        <div className="max-w-7xl mx-auto px-6 py-3.5 flex items-center gap-4 lg:gap-7 flex-wrap">
          <Logo size={34} />

          <div className="hidden lg:flex items-center pl-6 border-l border-line shrink-0">
            <LocationPicker />
          </div>

          {/* search box with the green button on the right */}
          <form
            onSubmit={handleSearch}
            className="order-last w-full lg:order-none lg:w-auto lg:flex-1 lg:min-w-[220px] flex items-center bg-cream-50 border border-line-strong rounded-lg overflow-hidden h-11"
          >
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Search for products..."
              className="flex-1 bg-transparent border-0 outline-none px-4 text-[13.5px] text-ink-900 placeholder:text-ink-400"
            />
            <button
              type="submit"
              aria-label="Search"
              className="w-14 h-11 bg-primary-600 hover:bg-primary-500 grid place-items-center transition"
            >
              <FiSearch size={19} className="text-white" />
            </button>
          </form>

          <div className="flex items-center gap-4 lg:gap-6 shrink-0">
            {isAdmin && (
              <Link
                to="/admin"
                className="text-xs font-semibold border border-line-strong text-ink-700 px-3 py-1.5 rounded-md hover:border-primary-600 hover:text-primary-600 transition"
              >
                Admin
              </Link>
            )}

            {/* account, two lines like the design */}
            <Link to={user ? "/profile" : "/login"} className="flex items-center gap-2">
              <FiUser size={19} className="text-ink-700" />
              <div className="hidden md:block">
                <div className="text-[10.5px] text-ink-500 leading-tight">
                  {user ? "Hello" : "Login / Sign Up"}
                </div>
                <div className="text-[13px] font-semibold">
                  {user ? user.username : "My Account"}
                </div>
              </div>
            </Link>

            <Link
              to="/orders"
              className="hidden lg:flex items-center gap-1.5 text-[13.5px] font-medium text-ink-700 hover:text-primary-600"
            >
              <FiHeart size={19} />
              <span>Orders</span>
            </Link>

            <Link
              to="/cart"
              className="flex items-center gap-2 text-[13.5px] font-medium text-ink-700 hover:text-primary-600"
            >
              <span className="relative">
                <FiShoppingCart size={21} />
                {cartCount > 0 && (
                  <span className="absolute -top-[7px] -right-[9px] min-w-[17px] h-[17px] px-1 rounded-full bg-primary-600 text-white text-[10px] font-semibold grid place-items-center">
                    {cartCount}
                  </span>
                )}
              </span>
              <span className="hidden sm:inline">Cart</span>
            </Link>

            {user && (
              <button
                onClick={handleLogout}
                title="Logout"
                className="text-ink-400 hover:text-brandred"
              >
                <FiLogOut size={18} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 3. green category bar */}
      <div className="bg-primary-600">
        <div className="max-w-7xl mx-auto px-6 flex items-stretch gap-6">
          <Link
            to="/products"
            className="flex items-center gap-2 bg-primary-500 text-white px-[18px] text-[13px] font-medium shrink-0"
          >
            <FiMenu size={15} />
            <span>Shop by Category</span>
          </Link>

          <div className="flex items-center gap-6 text-[13px] text-primary-100 overflow-x-auto no-scrollbar">
            <Link
              to="/"
              className="py-[13px] whitespace-nowrap font-semibold text-white border-b-[2.5px] border-white"
            >
              Home
            </Link>

            {categories.slice(0, 6).map((cat) => (
              <Link
                key={cat}
                to={`/products?category=${encodeURIComponent(cat)}`}
                className="py-[13px] whitespace-nowrap hover:text-white transition"
              >
                {cat}
              </Link>
            ))}

            <Link
              to="/products"
              className="py-[13px] whitespace-nowrap hover:text-white transition"
            >
              Offers
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
