import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FiCrosshair, FiMapPin } from "react-icons/fi";
import axiosInstance from "../axios/axiosInstance";
import Loader from "../components/Loader.jsx";

const emptyForm = {
  lat: null,
  lng: null,
  addressLine: "",
  city: "",
  state: "",
  pinCode: "",
  phone: "",
  notes: "",
};

export default function AddressPage() {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  //? when this has an id, we are editing instead of adding
  const [editingId, setEditingId] = useState(null);
  const [busy, setBusy] = useState(false);

  const loadAddresses = async () => {
    try {
      const res = await axiosInstance.get("/api/shop/address/all");
      setAddresses(res.data.payload);
    } catch {
      setAddresses([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAddresses();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setBusy(true);
    try {
      if (editingId) {
        await axiosInstance.patch(`/api/shop/address/${editingId}`, form);
        toast.success("Address updated");
      } else {
        await axiosInstance.post("/api/shop/address/add", form);
        toast.success("Address added");
      }
      setForm(emptyForm);
      setEditingId(null);
      loadAddresses();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed");
    } finally {
      setBusy(false);
    }
  }

  function startEdit(addr) {
    setEditingId(addr._id);
    setForm({
      addressLine: addr.addressLine,
      city: addr.city,
      state: addr.state,
      pinCode: addr.pinCode,
      phone: addr.phone,
      notes: addr.notes || "",
      lat: addr.lat ?? null,
      lng: addr.lng ?? null,
    });
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this address?")) return;
    try {
      await axiosInstance.delete(`/api/shop/address/${id}`);
      toast.success("Address deleted");
      //? if we were editing the same one, reset the form
      if (editingId === id) {
        setEditingId(null);
        setForm(emptyForm);
      }
      loadAddresses();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed");
    }
  }

  //? saving exact coordinates makes the delivery-radius check accurate,
  //? without them the backend can only compare the city name
  const useMyLocation = () => {
    if (!navigator.geolocation) return toast.error("Location not supported");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setForm((f) => ({
          ...f,
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        }));
        toast.success("Location attached to this address");
      },
      () => toast.error("Could not get your location")
    );
  };

  const inputClass =
    "w-full border border-line-strong rounded-xl p-2.5 mb-2.5 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-25";

  return (
    <div className="flex flex-col md:flex-row gap-5">
      {/* form */}
      <form
        onSubmit={handleSubmit}
        className="bg-white border border-line rounded-xl shadow-card p-5 w-full md:w-80 h-fit md:sticky md:top-44"
      >
        <h3 className="font-display font-bold mb-4">
          {editingId ? "Edit Address" : "Add New Address"}
        </h3>

        <input
          className={inputClass}
          placeholder="Address line"
          value={form.addressLine}
          onChange={(e) => setForm({ ...form, addressLine: e.target.value })}
        />
        <input
          className={inputClass}
          placeholder="City"
          value={form.city}
          onChange={(e) => setForm({ ...form, city: e.target.value })}
        />
        <input
          className={inputClass}
          placeholder="State"
          value={form.state}
          onChange={(e) => setForm({ ...form, state: e.target.value })}
        />
        <input
          className={inputClass}
          placeholder="Pin code"
          value={form.pinCode}
          onChange={(e) => setForm({ ...form, pinCode: e.target.value })}
        />
        <input
          className={inputClass}
          placeholder="Phone"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
        />
        <textarea
          className={inputClass}
          placeholder="Notes (optional)"
          rows={2}
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
        />

        <button
          type="button"
          onClick={useMyLocation}
          className="flex items-center gap-1.5 text-xs font-semibold text-primary-600 hover:underline mb-3"
        >
          <FiCrosshair size={13} />
          {form.lat ? "Location attached" : "Attach my current location"}
        </button>

        <button
          disabled={busy}
          className="bg-primary-600 text-white w-full py-2.5 rounded-lg text-sm font-semibold hover:bg-primary-500 disabled:bg-ink-200 disabled:text-ink-400 transition"
        >
          {busy ? "Saving..." : editingId ? "Update Address" : "Add Address"}
        </button>

        {editingId && (
          <button
            type="button"
            onClick={() => {
              setEditingId(null);
              setForm(emptyForm);
            }}
            className="w-full mt-2 text-sm text-ink-600 hover:underline"
          >
            Cancel
          </button>
        )}
      </form>

      {/* list */}
      <div className="flex-1">
        <h2 className="font-display text-2xl font-bold mb-4">My Addresses</h2>

        {loading ? (
          <Loader />
        ) : addresses.length === 0 ? (
          <div className="bg-white border border-line rounded-xl shadow-card p-12 text-center">
            <span className="h-14 w-14 rounded-full bg-primary-25 text-primary-600 grid place-items-center mx-auto mb-3">
              <FiMapPin size={22} />
            </span>
            <p className="text-ink-500">
              No address saved yet. Add one to place orders.
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-3">
            {addresses.map((addr) => (
              <div
                key={addr._id}
                className="bg-white border border-line rounded-xl shadow-card p-4 hover:border-primary-200 transition"
              >
                <p className="font-semibold text-ink-900">{addr.addressLine}</p>
                <p className="text-sm text-ink-600">
                  {addr.city}, {addr.state} - {addr.pinCode}
                </p>
                <p className="text-sm text-ink-600">Ph: {addr.phone}</p>
                {addr.notes && (
                  <p className="text-xs text-ink-500 mt-1">
                    Note: {addr.notes}
                  </p>
                )}

                <div className="flex gap-4 mt-3 text-sm font-semibold">
                  <button
                    onClick={() => startEdit(addr)}
                    className="text-primary-600 hover:underline"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(addr._id)}
                    className="text-brandred hover:underline"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
