import { useEffect, useState } from "react";
import {
  FiArrowRight,
  FiAward,
  FiChevronLeft,
  FiChevronRight,
  FiClock,
  FiRefreshCw,
  FiShield,
  FiTag,
} from "react-icons/fi";
import { Link } from "react-router-dom";
import axiosInstance from "../axios/axiosInstance";
import Loader from "../components/Loader.jsx";
import ProductCard from "../components/ProductCard.jsx";
import { categoryImage, sortCategories } from "../utils/categoryImage.js";

//? the four little cards sitting under the hero heading
const FEATURES = [
  { icon: <FiClock size={17} />, label: "60 Min Delivery" },
  { icon: <FiTag size={17} />, label: "Best Prices" },
  { icon: <FiShield size={17} />, label: "100% Quality" },
  { icon: <FiRefreshCw size={17} />, label: "Easy Returns" },
];

const TRUST = [
  {
    icon: <FiShield size={21} />,
    title: "100% Genuine",
    sub: "Original products, trusted by thousands",
  },
  {
    icon: <FiAward size={21} />,
    title: "Best Prices",
    sub: "Great deals on everyday essentials",
  },
  {
    icon: <FiRefreshCw size={21} />,
    title: "Easy Returns",
    sub: "Hassle-free returns within 7 days",
  },
  {
    icon: <FiClock size={21} />,
    title: "24/7 Support",
    sub: "We are here to help you anytime",
  },
];

export default function HomePage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axiosInstance
      .get("/api/shop/product/all")
      .then((res) => setProducts(res.data.payload))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));

    axiosInstance
      .get("/api/shop/product/filters")
      .then((res) => setCategories(sortCategories(res.data.payload.categories || [])))
      .catch(() => setCategories([]));
  }, []);

  //? the five the design puts in the best selling row, in that order.
  //? if any of them is missing we just fall back to the first products.
  const BEST_SELLERS = [
    "Apple Royal Gala (1kg)",
    "Aashirvaad Atta (5kg)",
    "Amul Taaza Milk (1L)",
    "Tata Salt (1kg)",
    "Fortune Sunflower Oil (1L)",
  ];

  const picked = BEST_SELLERS.map((n) =>
    products.find((p) => p.name === n)
  ).filter(Boolean);

  const bestSelling = picked.length === BEST_SELLERS.length
    ? picked
    : products.slice(0, 5);

  //? biggest discount first, used for the offer cards
  const deals = [...products]
    .filter((p) => p.price > p.salePrice)
    .sort(
      (a, b) =>
        (b.price - b.salePrice) / b.price - (a.price - a.salePrice) / a.price
    );

  const offerCards = [
    { kicker: "UP TO", big: "30% OFF", sub: "on Grocery Essentials", bg: "#FBF4E2", cat: "Staples & Pulses" },
    { kicker: "FLAT", big: "FREE DELIVERY", sub: "on Orders Above ₹499", bg: "#E9F5E7", cat: "Beverages" },
    { kicker: "UP TO", big: "25% OFF", sub: "on Bakery & Breakfast", bg: "#E6F1FA", cat: "Bakery & Cakes" },
    { kicker: "UP TO", big: "₹200 OFF", sub: "on Fresh Fruits & Vegetables", bg: "#EDF6E4", cat: "Fruits & Vegetables" },
  ];

  return (
    <div className="-mt-6">
      {/* ---------- hero ----------
          the negative margins pull it out of the page container so the
          green gradient runs the full width, like the design */}
      <section className="relative left-1/2 -ml-[50vw] w-screen bg-[linear-gradient(105deg,#E6F4DC_0%,#EFF8E8_45%,#F8FCF4_100%)] overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-[1fr_1.02fr] gap-8 items-center min-h-[430px]">
          <div className="py-13 md:py-14">
            <div className="text-[11.5px] font-semibold tracking-[2.2px] text-primary-400 mb-3.5">
              FAST. FRESH. RELIABLE.
            </div>

            <h1 className="text-[40px] md:text-[52px] leading-[1.08] font-semibold tracking-[-1.4px] text-ink-900">
              Groceries
              <br />
              Delivered
              <br />
              <span className="text-primary-600">in 60 Minutes</span>
            </h1>

            <p className="mt-5 text-sm leading-[1.7] text-ink-600 max-w-[370px]">
              Everything you need, right when you need it. From fresh produce to
              daily essentials.
            </p>

            {/* the four small white cards */}
            <div className="flex gap-3.5 my-7">
              {FEATURES.map((f) => (
                <div
                  key={f.label}
                  className="w-[74px] bg-white border border-cream-400 rounded-[11px] px-1.5 py-2.5 text-center shadow-card"
                >
                  <div className="text-primary-600 grid place-items-center mb-1.5">
                    {f.icon}
                  </div>
                  <div className="text-[9px] font-semibold leading-[1.35] text-ink-700">
                    {f.label}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-3.5">
              <Link
                to="/products"
                className="flex items-center gap-2 bg-primary-600 text-white rounded-[7px] px-[26px] py-3.5 text-sm font-semibold hover:bg-primary-500 transition shadow-[0_6px_16px_rgba(27,138,59,.24)]"
              >
                Shop Now <FiArrowRight size={16} />
              </Link>
              <Link
                to="/products"
                className="bg-white text-ink-900 border border-cream-400 rounded-[7px] px-[26px] py-3.5 text-sm font-semibold hover:border-primary-600 hover:text-primary-600 transition"
              >
                View Offers
              </Link>
            </div>
          </div>

          {/* hero picture -- the 60 minutes badge is already part of the artwork */}
          <div className="relative h-[340px] md:h-[500px] flex items-center justify-center">
            {/* soft white glow so the bag does not sit on flat colour */}
            <div className="absolute w-[76%] h-[76%] rounded-full bg-white/60 blur-3xl" />
            <img
              src="/basket.png"
              alt="Nature's Cart bag full of fresh fruit and vegetables"
              className="relative h-full w-full object-contain drop-shadow-[0_20px_34px_rgba(20,60,25,.2)]"
            />
          </div>
        </div>
      </section>

      <div>
        {/* ---------- category circles ---------- */}
        {categories.length > 0 && (
          <div className="border border-line rounded-2xl shadow-card px-7 py-6 mt-8 grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-3.5 items-start">
            {categories.slice(0, 7).map((cat) => (
              <Link
                key={cat}
                to={`/products?category=${encodeURIComponent(cat)}`}
                className="text-center group"
              >
                <div className="w-[84px] h-[84px] mx-auto mb-2.5 rounded-full bg-primary-25 p-2">
                  <img
                    src={categoryImage(cat)}
                    alt={cat}
                    loading="lazy"
                    className="w-[68px] h-[68px] rounded-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="text-[11.5px] font-semibold leading-[1.4] text-ink-700">
                  {cat}
                </div>
              </Link>
            ))}

            <Link to="/products" className="text-center">
              <div className="w-11 h-11 mx-auto mt-5 mb-2.5 rounded-full border border-cream-400 grid place-items-center hover:border-primary-600 transition">
                <FiChevronRight size={17} className="text-primary-600" />
              </div>
              <div className="text-[11.5px] font-semibold text-ink-700 leading-[1.4]">
                View All
                <br />
                Categories
              </div>
            </Link>
          </div>
        )}

        {/* ---------- offer cards ---------- */}
        <section className="mt-10">
          <div className="flex items-center justify-between mb-4.5">
            <div className="flex items-center gap-2.5">
              <FiTag size={17} className="text-primary-600" />
              <h2 className="text-xl font-semibold">Top Offers for You</h2>
            </div>
            <Link
              to="/products"
              className="text-[12.5px] font-semibold text-primary-600 hover:underline"
            >
              View All Offers &nbsp;›
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4.5">
            {offerCards.map((o) => (
              <Link
                key={o.big}
                to={`/products?category=${encodeURIComponent(o.cat)}`}
                className="rounded-[14px] overflow-hidden grid grid-cols-[1.1fr_1fr] h-[186px]"
                style={{ backgroundColor: o.bg }}
              >
                <div className="min-w-0 pl-[18px] pr-1.5 py-4 flex flex-col items-start">
                  <div className="text-[9.5px] font-semibold tracking-[1.1px] text-cream-700">
                    {o.kicker}
                  </div>
                  <div className="text-2xl font-bold tracking-[-1px] text-primary-600 leading-[1.15] my-0.5">
                    {o.big}
                  </div>
                  <div className="text-[10.5px] leading-[1.4] text-ink-600 mb-3">
                    {o.sub}
                  </div>
                  <span className="mt-auto bg-primary-600 text-white rounded-[5px] px-[13px] py-[7px] text-[10.5px] font-semibold whitespace-nowrap">
                    Shop Now
                  </span>
                </div>
                <img
                  src={categoryImage(o.cat)}
                  alt={o.sub}
                  loading="lazy"
                  className="h-[186px] w-full object-cover"
                />
              </Link>
            ))}
          </div>
        </section>

        {/* ---------- best selling ---------- */}
        <section className="mt-10">
          <div className="flex items-center justify-between mb-4.5">
            <div className="flex items-center gap-2.5">
              <FiAward size={17} className="text-primary-600" />
              <h2 className="text-xl font-semibold">Best Selling Products</h2>
            </div>
            <Link
              to="/products"
              className="text-[12.5px] font-semibold text-primary-600 hover:underline"
            >
              View All Products &nbsp;›
            </Link>
          </div>

          {loading ? (
            <Loader />
          ) : (
            <div className="relative">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4.5">
                {bestSelling.map((p) => (
                  <ProductCard key={p._id} product={p} />
                ))}
              </div>

              {/* the little round arrows from the design */}
              <Link
                to="/products"
                aria-label="Previous"
                className="hidden lg:grid absolute top-1/2 -left-[19px] -translate-y-1/2 w-[38px] h-[38px] place-items-center rounded-full bg-white border border-line shadow-card text-ink-700 hover:text-primary-600"
              >
                <FiChevronLeft size={15} />
              </Link>
              <Link
                to="/products"
                aria-label="Next"
                className="hidden lg:grid absolute top-1/2 -right-[19px] -translate-y-1/2 w-[38px] h-[38px] place-items-center rounded-full bg-white border border-line shadow-card text-ink-700 hover:text-primary-600"
              >
                <FiChevronRight size={15} />
              </Link>
            </div>
          )}
        </section>

        {/* ---------- deals of the day ---------- */}
        {!loading && deals.length > 0 && (
          <section className="mt-10">
            <div className="flex items-center justify-between mb-4.5">
              <div className="flex items-center gap-2.5">
                <FiTag size={17} className="text-primary-600" />
                <h2 className="text-xl font-semibold">Deals of the Day</h2>
              </div>
              <Link
                to="/products"
                className="text-[12.5px] font-semibold text-primary-600 hover:underline"
              >
                View All &nbsp;›
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4.5">
              {deals.slice(0, 5).map((p) => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>
          </section>
        )}

        {/* ---------- trust bar ---------- */}
        <div className="mt-13 border-t border-b border-line py-5.5 grid grid-cols-2 lg:grid-cols-4 gap-6.5">
          {TRUST.map((t) => (
            <div key={t.title} className="flex items-start gap-3">
              <span className="text-primary-600 shrink-0 mt-0.5">{t.icon}</span>
              <div>
                <div className="text-[13px] font-semibold text-ink-800">
                  {t.title}
                </div>
                <div className="text-[11.5px] text-ink-500 leading-[1.5] mt-[3px]">
                  {t.sub}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ---------- newsletter ---------- */}
        <div className="mt-10 bg-primary-600 rounded-[14px] px-8 py-6.5 flex items-center justify-between gap-8 flex-wrap">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-[9px] bg-white/[.16] grid place-items-center shrink-0">
              <svg
                width="21"
                height="21"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#fff"
                strokeWidth="1.7"
              >
                <path d="M3 6h18v12H3zM3 7l9 6 9-6" />
              </svg>
            </div>
            <div>
              <div className="text-[17px] font-semibold text-white tracking-[-.3px]">
                Stay Updated with Best Offers
              </div>
              <div className="text-xs text-primary-100 mt-[3px]">
                Subscribe to our newsletter and never miss an offer!
              </div>
            </div>
          </div>

          <form
            onSubmit={(e) => e.preventDefault()}
            className="flex shrink-0 w-full sm:w-auto"
          >
            <input
              placeholder="Enter your email address"
              className="w-full sm:w-[280px] bg-white text-ink-900 placeholder:text-ink-500 border-0 rounded-l-[7px] px-4 py-3.5 text-[13px] outline-none"
            />
            <button className="bg-primary-800 text-white rounded-r-[7px] px-[26px] py-3.5 text-[13px] font-semibold hover:bg-primary-900 transition">
              Subscribe
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
