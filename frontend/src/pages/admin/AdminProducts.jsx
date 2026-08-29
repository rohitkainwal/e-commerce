import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { FiPlus, FiSearch } from "react-icons/fi";
import { Link } from "react-router-dom";
import { isPackShot } from "../../utils/productDisplay.js";
import axiosInstance from "../../axios/axiosInstance";
import Loader from "../../components/Loader.jsx";

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState("");

  const loadProducts = async () => {
    try {
      const res = await axiosInstance.get("/api/admin/product/all");
      setProducts(res.data.payload);
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not load products");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  async function handleDelete(id, name) {
    if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return;
    try {
      await axiosInstance.delete(`/api/admin/product/${id}`);
      toast.success("Product deleted");
      loadProducts();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed");
    }
  }

  //? filtering on the frontend, the admin list is small enough
  const shown = useMemo(() => {
    if (!keyword.trim()) return products;
    const k = keyword.toLowerCase();
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(k) ||
        p.category.toLowerCase().includes(k) ||
        p.brand.toLowerCase().includes(k)
    );
  }, [products, keyword]);

  if (loading) return <Loader />;

  const outOfStock = products.filter((p) => p.stock <= 0).length;
  const lowStock = products.filter((p) => p.stock > 0 && p.stock <= 5).length;
  const categories = new Set(products.map((p) => p.category)).size;

  const stats = [
    { label: "Total products", value: products.length },
    { label: "Categories", value: categories },
    { label: "Low stock", value: lowStock, warn: lowStock > 0 },
    { label: "Out of stock", value: outOfStock, danger: outOfStock > 0 },
  ];

  return (
    <div>
      <div className="flex justify-between items-start mb-5 flex-wrap gap-3">
        <div>
          <h2 className="font-display text-2xl font-bold text-ink-900">
            Manage Products
          </h2>
          <p className="text-sm text-ink-500">
            Add, edit and remove items from the shop.
          </p>
        </div>

        <Link
          to="/admin/products/add"
          className="flex items-center gap-1.5 bg-primary-600 text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-primary-500 transition"
        >
          <FiPlus size={16} /> Add Product
        </Link>
      </div>

      {/* summary tiles */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        {stats.map((s) => (
          <div
            key={s.label}
            className="bg-white border border-line rounded-xl shadow-card px-4 py-3"
          >
            <p className="text-xs text-ink-500 mb-0.5">{s.label}</p>
            <p
              className={`text-2xl font-bold font-display ${
                s.danger
                  ? "text-brandred"
                  : s.warn
                    ? "text-accent"
                    : "text-ink-900"
              }`}
            >
              {s.value}
            </p>
          </div>
        ))}
      </div>

      {/* search inside admin list */}
      <div className="flex items-center gap-2 mb-3 bg-white border border-line rounded-lg px-3 py-2 max-w-sm">
        <FiSearch size={15} className="text-ink-400" />
        <input
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="Filter by name, category or brand"
          className="w-full text-sm outline-none bg-transparent placeholder:text-ink-400"
        />
      </div>

      {shown.length === 0 ? (
        <div className="bg-white border border-line rounded-xl shadow-card p-12 text-center">
          <p className="font-display font-bold mb-1">
            {products.length === 0 ? "No products yet" : "Nothing matched"}
          </p>
          <p className="text-ink-500 text-sm">
            {products.length === 0
              ? "Add your first one to begin."
              : "Try a different word."}
          </p>
        </div>
      ) : (
        <div className="bg-white border border-line rounded-xl shadow-card overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-cream-100 text-left text-ink-600">
              <tr>
                <th className="p-3 font-semibold text-xs uppercase tracking-wide">
                  Product
                </th>
                <th className="p-3 font-semibold text-xs uppercase tracking-wide">
                  Category
                </th>
                <th className="p-3 font-semibold text-xs uppercase tracking-wide">
                  Brand
                </th>
                <th className="p-3 font-semibold text-xs uppercase tracking-wide">
                  Price
                </th>
                <th className="p-3 font-semibold text-xs uppercase tracking-wide">
                  Stock
                </th>
                <th className="p-3 font-semibold text-xs uppercase tracking-wide text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {shown.map((p) => (
                <tr
                  key={p._id}
                  className="border-t border-line hover:bg-cream-50"
                >
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      {p.images?.[0]?.url ? (
                        <img
                          src={p.images[0].url}
                          alt={p.name}
                          loading="lazy"
                          className={`h-11 w-11 rounded-lg shrink-0 ${
                            isPackShot(p.images[0].url)
                              ? "object-contain bg-white"
                              : "object-cover bg-cream-50"
                          }`}
                        />
                      ) : (
                        <div className="h-11 w-11 bg-cream-100 rounded-lg grid place-items-center text-[10px] text-ink-400 shrink-0">
                          None
                        </div>
                      )}
                      <span className="font-medium text-ink-900">{p.name}</span>
                    </div>
                  </td>
                  <td className="p-3 capitalize text-ink-600">{p.category}</td>
                  <td className="p-3 capitalize text-ink-600">{p.brand}</td>
                  <td className="p-3 whitespace-nowrap">
                    <span className="font-semibold">₹{p.salePrice}</span>
                    {p.price > p.salePrice && (
                      <span className="text-ink-400 line-through ml-1.5 text-xs">
                        ₹{p.price}
                      </span>
                    )}
                  </td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                        p.stock <= 0
                          ? "bg-red-100 text-brandred"
                          : p.stock <= 5
                            ? "bg-accent-soft text-accent-ink"
                            : "bg-primary-25 text-primary-700"
                      }`}
                    >
                      {p.stock}
                    </span>
                  </td>
                  <td className="p-3 whitespace-nowrap text-right">
                    <Link
                      to={`/admin/products/${p._id}/edit`}
                      className="text-primary-600 font-semibold hover:underline mr-3"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(p._id, p.name)}
                      className="text-brandred font-semibold hover:underline"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
