import { FiShoppingCart } from "react-icons/fi";
import { Link } from "react-router-dom";
import { useCart } from "../context/cart.context.js";
import { isPackShot, splitName } from "../utils/productDisplay.js";

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();

  const image = product.images?.[0]?.url;
  const packShot = isPackShot(image);
  const outOfStock = product.stock <= 0;
  const { title, size } = splitName(product.name);

  const discount =
    product.price > product.salePrice
      ? Math.round(((product.price - product.salePrice) / product.price) * 100)
      : 0;

  return (
    <div className="group bg-white border border-line rounded-[13px] p-3.5 hover:border-cream-600 hover:shadow-card-hover transition-all duration-200 flex flex-col">
      <Link
        to={`/products/${product._id}`}
        className={`relative block h-[124px] mb-3 rounded-lg overflow-hidden ${
          packShot ? "bg-white" : "bg-cream-50"
        }`}
      >
        {image ? (
          <img
            src={image}
            alt={product.name}
            loading="lazy"
            className={`h-full w-full group-hover:scale-105 transition-transform duration-300 ${
              packShot ? "object-contain p-1" : "object-cover"
            }`}
          />
        ) : (
          <div className="h-full w-full grid place-items-center text-ink-300 text-xs">
            No Image
          </div>
        )}

        {discount > 0 && (
          <span className="absolute top-0 left-0 bg-primary-600 text-white text-[10px] font-semibold px-2 py-1 rounded-br-lg">
            {discount}% OFF
          </span>
        )}

        {outOfStock && (
          <span className="absolute inset-0 bg-white/70 grid place-items-center">
            <span className="bg-ink-900 text-white text-[10px] font-semibold px-2 py-1 rounded">
              Sold out
            </span>
          </span>
        )}
      </Link>

      <Link
        to={`/products/${product._id}`}
        className="text-[12.5px] font-semibold leading-[1.4] h-[35px] text-ink-800 hover:text-primary-600 line-clamp-2"
      >
        {title}
      </Link>

      {size && <p className="text-[11px] text-ink-500 mt-0.5">{size}</p>}

      <div className="flex items-baseline gap-[7px] mt-1.5 mb-3">
        <span className="text-[15px] font-bold text-ink-900">
          ₹{product.salePrice}
        </span>
        {discount > 0 && (
          <>
            <span className="text-[11.5px] text-ink-400 line-through">
              ₹{product.price}
            </span>
            <span className="text-[10.5px] font-semibold text-primary-600">
              {discount}% OFF
            </span>
          </>
        )}
      </div>

      {!outOfStock && product.stock <= 5 && (
        <p className="text-[10px] font-medium text-brandred -mt-2 mb-2">
          Only {product.stock} left
        </p>
      )}

      {/* outlined button that fills green on hover, like the design */}
      <button
        disabled={outOfStock}
        onClick={() => addToCart(product._id)}
        className="mt-auto w-full flex items-center justify-center gap-[7px] bg-white text-primary-600 border border-cream-600 rounded-md py-[9px] text-xs font-semibold hover:bg-primary-600 hover:text-white hover:border-primary-600 disabled:bg-ink-50 disabled:text-ink-400 disabled:border-line disabled:cursor-not-allowed transition"
      >
        <FiShoppingCart size={14} />
        {outOfStock ? "Sold Out" : "Add to Cart"}
      </button>
    </div>
  );
};

export default ProductCard;
