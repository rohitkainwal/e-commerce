import { useState } from "react";
import toast from "react-hot-toast";
import { FiArrowLeft, FiImage, FiUploadCloud } from "react-icons/fi";
import { Link, useNavigate } from "react-router-dom";
import axiosInstance from "../../axios/axiosInstance";

export default function AddProduct() {
  const nav = useNavigate();

  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    salePrice: "",
    category: "",
    brand: "",
    stock: "",
  });

  //? two ways to give the image --> paste a link, or upload a file to cloudinary.
  //? link is the default because cloudinary keys may not be filled yet.
  const [mode, setMode] = useState("link");
  const [imageUrl, setImageUrl] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState("");
  const [busy, setBusy] = useState(false);

  function pickImage(e) {
    const file = e.target.files[0];
    if (!file) return;
    setImage(file);
    setPreview(URL.createObjectURL(file));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (mode === "upload" && !image) {
      toast.error("Please select a product image");
      return;
    }
    if (mode === "link" && !imageUrl.trim()) {
      toast.error("Please paste an image link");
      return;
    }

    setBusy(true);
    try {
      let res;

      if (mode === "upload") {
        //! backend uses multer with upload.single("images"), so field name must be "images"
        const formData = new FormData();
        formData.append("images", image);
        Object.keys(form).forEach((key) => formData.append(key, form[key]));
        res = await axiosInstance.post("/api/admin/product/add", formData);
      } else {
        res = await axiosInstance.post("/api/admin/product/add", {
          ...form,
          imageUrl: imageUrl.trim(),
        });
      }

      toast.success(res.data.message);
      nav("/admin/products");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed");
    } finally {
      setBusy(false);
    }
  }

  const inputClass =
    "w-full border border-line-strong rounded-lg px-3 py-2 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-25";
  const labelClass = "text-xs font-semibold text-ink-700 mb-1.5 block";

  const shownPreview = mode === "link" ? imageUrl : preview;

  return (
    <div className="max-w-4xl">
      <Link
        to="/admin/products"
        className="text-sm text-ink-600 hover:text-primary-600 font-medium flex items-center gap-1.5 w-fit mb-4"
      >
        <FiArrowLeft size={15} /> Back to products
      </Link>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold text-ink-900">
            Add Product
          </h2>
          <p className="text-sm text-ink-500">
            Fill the details and give one product image.
          </p>
        </div>

        {/* details */}
        <div className="bg-white border border-line rounded-xl shadow-card p-5">
          <h3 className="font-semibold text-ink-900 mb-4 text-sm uppercase tracking-wide">
            Product Details
          </h3>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className={labelClass}>Name</label>
              <input
                className={inputClass}
                placeholder="e.g. Organic Bananas 1kg"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>

            <div>
              <label className={labelClass}>Brand</label>
              <input
                className={inputClass}
                placeholder="e.g. Farm Fresh"
                value={form.brand}
                onChange={(e) => setForm({ ...form, brand: e.target.value })}
              />
            </div>

            <div>
              <label className={labelClass}>Category</label>
              <input
                className={inputClass}
                placeholder="e.g. Fresh Produce"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              />
            </div>

            <div className="md:col-span-2">
              <label className={labelClass}>Description</label>
              <textarea
                rows={3}
                className={inputClass}
                placeholder="Short description shown on the product page"
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
              />
            </div>
          </div>
        </div>

        {/* pricing */}
        <div className="bg-white border border-line rounded-xl shadow-card p-5">
          <h3 className="font-semibold text-ink-900 mb-4 text-sm uppercase tracking-wide">
            Pricing &amp; Stock
          </h3>

          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className={labelClass}>Price (MRP) ₹</label>
              <input
                type="number"
                className={inputClass}
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
              />
            </div>

            <div>
              <label className={labelClass}>Sale Price ₹</label>
              <input
                type="number"
                className={inputClass}
                value={form.salePrice}
                onChange={(e) =>
                  setForm({ ...form, salePrice: e.target.value })
                }
              />
            </div>

            <div>
              <label className={labelClass}>Stock</label>
              <input
                type="number"
                className={inputClass}
                value={form.stock}
                onChange={(e) => setForm({ ...form, stock: e.target.value })}
              />
            </div>
          </div>

          {form.price > 0 && form.salePrice > 0 && (
            <p className="text-xs text-ink-500 mt-3">
              {Number(form.salePrice) > Number(form.price)
                ? "Sale price is higher than MRP, no discount will show."
                : `Customer sees ${Math.round(
                    ((form.price - form.salePrice) / form.price) * 100
                  )}% off`}
            </p>
          )}
        </div>

        {/* image */}
        <div className="bg-white border border-line rounded-xl shadow-card p-5">
          <h3 className="font-semibold text-ink-900 mb-4 text-sm uppercase tracking-wide">
            Product Image
          </h3>

          {/* switch between link and upload */}
          <div className="flex gap-2 mb-4">
            <button
              type="button"
              onClick={() => setMode("link")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
                mode === "link"
                  ? "bg-primary-25 border-primary-400 text-primary-700"
                  : "border-line-strong text-ink-600 hover:border-primary-300 hover:text-ink-800"
              }`}
            >
              <FiImage size={14} /> Paste image link
            </button>
            <button
              type="button"
              onClick={() => setMode("upload")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
                mode === "upload"
                  ? "bg-primary-25 border-primary-400 text-primary-700"
                  : "border-line-strong text-ink-600 hover:border-primary-300 hover:text-ink-800"
              }`}
            >
              <FiUploadCloud size={14} /> Upload file
            </button>
          </div>

          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              {mode === "link" ? (
                <>
                  <input
                    className={inputClass}
                    placeholder="https://images.unsplash.com/photo-..."
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                  />
                  <p className="text-xs text-ink-500 mt-2">
                    Any public image link works. Good for testing without
                    Cloudinary.
                  </p>
                </>
              ) : (
                <>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={pickImage}
                    className="text-sm w-full file:mr-3 file:px-3 file:py-1.5 file:rounded-lg file:border-0 file:bg-primary-25 file:text-primary-700 file:text-xs file:font-semibold"
                  />
                  <p className="text-xs text-ink-500 mt-2">
                    Needs the CLOUDINARY keys filled in backend/.env, otherwise
                    upload will fail.
                  </p>
                </>
              )}
            </div>

            {/* live preview */}
            <div className="w-full md:w-40 h-32 bg-cream-50 border border-line rounded-lg grid place-items-center overflow-hidden shrink-0">
              {shownPreview ? (
                <img
                  src={shownPreview}
                  alt="preview"
                  className="h-full w-full object-contain"
                />
              ) : (
                <span className="text-xs text-ink-400">Preview</span>
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            disabled={busy}
            className="bg-primary-600 text-white px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-primary-500 disabled:bg-ink-200 disabled:text-ink-400 transition"
          >
            {busy ? "Saving..." : "Add Product"}
          </button>

          <Link
            to="/admin/products"
            className="border border-line-strong text-ink-700 px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-ink-50 hover:text-ink-900 transition"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
