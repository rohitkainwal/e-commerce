import { useRef } from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { Link } from "react-router-dom";
import ProductCard from "./ProductCard.jsx";

/*
  one section of the home page --> title, "VIEW ALL" and a row of cards
  that scrolls sideways with the arrow buttons.
*/
const ProductRow = ({ title, subtitle, products, viewAllTo = "/products" }) => {
  const rail = useRef(null);

  const scrollBy = (amount) => {
    rail.current?.scrollBy({ left: amount, behavior: "smooth" });
  };

  if (!products || products.length === 0) return null;

  return (
    <section>
      <div className="flex items-end justify-between mb-3">
        <div>
          <h2 className="font-display text-xl font-bold text-ink-900">
            {title}
          </h2>
          {subtitle && <p className="text-sm text-ink-500">{subtitle}</p>}
        </div>

        <Link
          to={viewAllTo}
          className="text-sm font-semibold text-primary-600 hover:underline uppercase tracking-wide"
        >
          View All
        </Link>
      </div>

      <div className="relative bg-white border border-line rounded-xl p-4">
        {/* arrows, hidden on small screens where you can just swipe */}
        <button
          onClick={() => scrollBy(-600)}
          aria-label="Scroll left"
          className="hidden md:grid absolute -left-3 top-1/2 -translate-y-1/2 h-8 w-8 place-items-center rounded-full bg-white border border-line shadow-card text-ink-700 hover:text-primary-600 z-10"
        >
          <FiChevronLeft size={16} />
        </button>

        <div
          ref={rail}
          className="flex gap-4 overflow-x-auto no-scrollbar scroll-smooth"
        >
          {products.map((p) => (
            <div key={p._id} className="w-[168px] shrink-0">
              <ProductCard product={p} />
            </div>
          ))}
        </div>

        <button
          onClick={() => scrollBy(600)}
          aria-label="Scroll right"
          className="hidden md:grid absolute -right-3 top-1/2 -translate-y-1/2 h-8 w-8 place-items-center rounded-full bg-white border border-line shadow-card text-ink-700 hover:text-primary-600 z-10"
        >
          <FiChevronRight size={16} />
        </button>
      </div>
    </section>
  );
};

export default ProductRow;
