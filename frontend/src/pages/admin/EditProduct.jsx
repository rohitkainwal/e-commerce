import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FiArrowLeft, FiImage, FiUploadCloud } from "react-icons/fi";
import { Link, useNavigate, useParams } from "react-router-dom";
import axiosInstance from "../../axios/axiosInstance";
import Loader from "../../components/Loader.jsx";

export default function EditProduct() {
  const { productId } = useParams();
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

  //? keeping the current image separate, it has its own api
  const [currentImage, setCurrentImage] = useState(null);
  const [mode, setMode] = useState("link");
  const [imageUrl, setImageUrl] = useState("");
  const [newImage, setNewImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  //? useCallback so the effect below does not run again and again
  const loadProduct = useCallback(async () => {
    try {
      const res = await axiosInstance.get(`/api/admin/product/${productId}`);
      const p = res.data.payload;
      setForm({
        name: p.name,
        description: p.description,
        price: p.price,
        salePrice: p.salePrice,
        category: p.category,
        brand: p.brand,
        stock: p.stock,
      });
      setCurrentImage(p.images?.[0] || null);
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not load product");
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    loadProduct();
  }, [loadProduct]);

  async function saveDetails(e) {
    e.preventDefault();
    setBusy(true);
    try {
      const res = await axiosInstance.patch(
        `/api/admin/product/${productId}`,
        form
      );
      toast.success(res.data.message);
      nav("/admin/products");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed");
    } finally {
      setBusy(false);
    }
  }

  //! image is updated separately, because it may go to cloudinary
  async function saveImage() {
    if (mode === "upload" && !newImage) {
      toast.error("Please select an image first");
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
        const formData = new FormData();
        formData.append("images", newImage);
        formData.append("productId", productId);
        //? old public_id so backend can delete the old one from cloudinary
        if (currentImage?.public_id)
          formData.append("public_id", currentImage.public_id);
        res = await axiosInstance.patch(
          "/api/admin/product/update-image",
          formData
        );
      } else {
        res = await axiosInstance.patch("/api/admin/product/update-image", {
          productId,
          public_id: currentImage?.public_id || "",
          imageUrl: imageUrl.trim(),
        });
      }

      toast.success(res.data.message);
      setNewImage(null);
      setImageUrl("");
      loadProduct();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed");
    } finally {
      setBusy(false);
    }
  }

  async function removeImage() {
    if (!currentImage) return;
    if (!window.confirm("Remove this image?")) return;

    setBusy(true);
    try {
      const res = await axiosInstance.patch("/api/admin/product/delete-image", {
        productId,
        public_id: currentImage.public_id,
      });
      toast.success(res.data.message);
      loadProduct();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed");
    } finally {
      setBusy(false);
    }
  }

  const inputClass =
    "w-full border border-line-strong rounded-lg px-3 py-2 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-25";
  const labelClass = "text-xs font-semibold text-ink-700 mb-1.5 block";

  if (loading) return <Loader />;

  return (
    <div className="max-w-5xl">
      <Link
        to="/admin/products"
        className="text-sm text-ink-600 hover:text-primary-600 font-medium flex items-center gap-1.5 w-fit mb-4"
      >
        <FiArrowLeft size={15} /> Back to products
      </Link>

      <div className="mb-4">
        <h2 className="font-display text-2xl font-bold text-ink-900">
          Edit Product
        </h2>
        <p className="text-sm text-ink-500">
          Details and image are saved separately.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-4">
        <form onSubmit={saveDetails} className="flex-1 flex flex-col gap-4">
          <div className="bg-white border border-line rounded-xl shadow-card p-5">
            <h3 className="font-semibold text-ink-900 mb-4 text-sm uppercase tracking-wide">
              Product Details
            </h3>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className={labelClass}>Name</label>
                <input
                  className={inputClass}
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>

              <div>
                <label className={labelClass}>Brand</label>
                <input
                  className={inputClass}
                  value={form.brand}
                  onChange={(e) => setForm({ ...form, brand: e.target.value })}
                />
              </div>

              <div>
                <label className={labelClass}>Category</label>
                <input
                  className={inputClass}
                  value={form.category}
                  onChange={(e) =>
                    setForm({ ...form, category: e.target.value })
                  }
                />
              </div>

              <div className="md:col-span-2">
                <label className={labelClass}>Description</label>
                <textarea
                  rows={3}
                  className={inputClass}
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                />
              </div>
            </div>
          </div>

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
          </div>

          <button
            disabled={busy}
            className="bg-primary-600 text-white px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-primary-500 disabled:bg-ink-200 disabled:text-ink-400 transition w-fit"
          >
            {busy ? "Saving..." : "Save Details"}
          </button>
        </form>

        {/* image is handled by its own api, so keeping it in a separate box */}
        <div className="bg-white border border-line rounded-xl shadow-card p-5 w-full lg:w-80 h-fit">
          <h3 className="font-semibold text-ink-900 mb-4 text-sm uppercase tracking-wide">
            Product Image
          </h3>

          {currentImage?.url ? (
            <>
              <div className="h-40 bg-cream-50 border border-line rounded-lg overflow-hidden grid place-items-center">
                <img
                  src={currentImage.url}
                  alt={form.name}
                  className="h-full w-full object-contain"
                />
              </div>
              <button
                onClick={removeImage}
                disabled={busy}
                className="text-brandred text-xs font-semibold hover:underline mt-2"
              >
                Remove image
              </button>
            </>
          ) : (
            <div className="h-40 bg-cream-50 border border-line grid place-items-center text-ink-400 text-sm rounded-lg">
              No Image
            </div>
          )}

          <div className="border-t border-line mt-4 pt-4">
            <p className={labelClass}>Replace with</p>

            <div className="flex gap-2 mb-3">
              <button
                type="button"
                onClick={() => setMode("link")}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition ${
                  mode === "link"
                    ? "bg-primary-25 border-primary-400 text-primary-700"
                    : "border-line-strong text-ink-600"
                }`}
              >
                <FiImage size={13} /> Link
              </button>
              <button
                type="button"
                onClick={() => setMode("upload")}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition ${
                  mode === "upload"
                    ? "bg-primary-25 border-primary-400 text-primary-700"
                    : "border-line-strong text-ink-600"
                }`}
              >
                <FiUploadCloud size={13} /> Upload
              </button>
            </div>

            {mode === "link" ? (
              <input
                className={inputClass}
                placeholder="https://images.unsplash.com/photo-..."
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
              />
            ) : (
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setNewImage(e.target.files[0])}
                className="text-sm w-full file:mr-2 file:px-2.5 file:py-1.5 file:rounded-lg file:border-0 file:bg-primary-25 file:text-primary-700 file:text-xs file:font-semibold"
              />
            )}

            <button
              onClick={saveImage}
              disabled={busy}
              className="bg-primary-600 text-white w-full py-2 rounded-lg text-sm font-semibold mt-3 hover:bg-primary-500 disabled:bg-ink-200 disabled:text-ink-400 transition"
            >
              {busy ? "Saving..." : "Update Image"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
