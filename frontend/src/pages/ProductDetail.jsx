import { useEffect, useState } from "react";
import { FiCheck, FiShoppingCart, FiTruck } from "react-icons/fi";
import { Link, useNavigate, useParams } from "react-router-dom";
import axiosInstance from "../axios/axiosInstance";
import Loader from "../components/Loader.jsx";
import { useCart } from "../context/cart.context.js";

export default function ProductDetail() {
  const { id } = useParams();
  const nav = useNavigate();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    //? "ignore" is for the case when user opens another product before this one loads,
    //? then the old response should not overwrite the new one
    let ignore = false;

    async function loadProduct() {
      setLoading(true);
      try {
        const res = await axiosInstance.get(`/api/shop/product/all/${id}`);
        if (!ignore) setProduct(res.data.payload);
      } catch {
        if (!ignore) setProduct(null);
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    loadProduct();
    return () => {
      ignore = true;
    };
  }, [id]);

  if (loading) return <Loader />;

  if (!product)
    return (
      <div className="bg-white border border-line rounded-xl shadow-card p-12 text-center">
        <p className="font-display font-bold text-lg mb-2">Product not found</p>
        <Link to="/products" className="text-primary-600 font-semibold">
          Back to products
        </Link>
      </div>
    );

  const image = product.images?.[0]?.url;
  const outOfStock = product.stock <= 0;
  const discount =
    product.price > product.salePrice
      ? Math.round(((product.price - product.salePrice) / product.price) * 100)
      : 0;

  return (
    <div className="flex flex-col gap-4">
      <nav className="text-sm text-ink-500">
        <Link to="/" className="hover:text-primary-600">
          Home
        </Link>
        <span className="mx-2">/</span>
        <Link to="/products" className="hover:text-primary-600">
          Products
        </Link>
        <span className="mx-2">/</span>
        <span className="text-ink-900">{product.name}</span>
      </nav>

      <div className="bg-white border border-line rounded-xl shadow-card p-6 flex flex-col md:flex-row gap-8">
        <div className="md:w-1/2 bg-cream-50 rounded-xl relative grid place-items-center">
          {image ? (
            <img
              src={image}
              alt={product.name}
              className="w-full h-96 object-contain p-6"
            />
          ) : (
            <div className="w-full h-96 grid place-items-center text-ink-300">
              No Image
            </div>
          )}

          {discount > 0 && (
            <span className="absolute top-0 left-0 bg-primary-600 text-white text-xs font-semibold px-3 py-1.5 rounded-br-xl">
              {discount}% OFF
            </span>
          )}
        </div>

        <div className="md:w-1/2 flex flex-col gap-3">
          <p className="text-xs tracking-[0.15em] text-primary-600 uppercase font-semibold">
            {product.brand} · {product.category}
          </p>

          <h1 className="font-display text-3xl font-extrabold leading-tight">
            {product.name}
          </h1>

          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-bold text-ink-900">
              ₹{product.salePrice}
            </span>
            {discount > 0 && (
              <>
                <span className="text-lg text-ink-400 line-through">
                  ₹{product.price}
                </span>
                <span className="text-sm text-primary-600 font-semibold">
                  You save ₹{product.price - product.salePrice}
                </span>
              </>
            )}
          </div>

          <p
            className={`text-sm font-medium ${
              outOfStock ? "text-brandred" : "text-primary-600"
            }`}
          >
            {outOfStock ? "Out of stock" : `In stock · ${product.stock} available`}
          </p>

          <p className="text-ink-700 leading-relaxed first-letter:uppercase">
            {product.description}
          </p>

          <div className="flex gap-3 mt-3">
            <button
              disabled={outOfStock}
              onClick={() => addToCart(product._id)}
              className="flex items-center gap-2 bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-500 disabled:bg-ink-200 disabled:text-ink-400 transition"
            >
              <FiShoppingCart size={17} /> Add to Cart
            </button>

            <button
              disabled={outOfStock}
              onClick={async () => {
                //? add it and then straight away open the cart
                const ok = await addToCart(product._id);
                if (ok) nav("/cart");
              }}
              className="border-2 border-primary-600 text-primary-700 px-6 py-3 rounded-lg font-semibold hover:bg-primary-25 disabled:opacity-40 transition"
            >
              Buy Now
            </button>
          </div>

          <div className="border-t border-line mt-4 pt-4 flex flex-col gap-2 text-sm text-ink-600">
            <p className="flex items-center gap-2">
              <FiTruck className="text-primary-600" /> Free delivery on orders
              above ₹999
            </p>
            <p className="flex items-center gap-2">
              <FiCheck className="text-primary-600" /> Quality checked before
              dispatch
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
