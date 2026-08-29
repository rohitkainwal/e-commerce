import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FiCrosshair, FiMapPin, FiTrash2 } from "react-icons/fi";
import axiosInstance from "../../axios/axiosInstance";
import Loader from "../../components/Loader.jsx";

const emptyForm = { name: "", city: "", lat: "", lng: "", radiusKm: 10 };

export default function AdminAreas() {
  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [busy, setBusy] = useState(false);

  const loadAreas = async () => {
    try {
      const res = await axiosInstance.get("/api/admin/service-area/all");
      setAreas(res.data.payload);
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not load areas");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAreas();
  }, []);

  //? fills the lat/lng boxes with wherever the admin is sitting right now
  const useMyLocation = () => {
    if (!navigator.geolocation) return toast.error("Location not supported");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setForm((f) => ({
          ...f,
          lat: pos.coords.latitude.toFixed(6),
          lng: pos.coords.longitude.toFixed(6),
        }));
        toast.success("Coordinates filled");
      },
      () => toast.error("Could not get your location")
    );
  };

  async function handleSubmit(e) {
    e.preventDefault();
    setBusy(true);
    try {
      if (editingId) {
        await axiosInstance.patch(`/api/admin/service-area/${editingId}`, form);
        toast.success("Area updated");
      } else {
        await axiosInstance.post("/api/admin/service-area/add", form);
        toast.success("Area added");
      }
      setForm(emptyForm);
      setEditingId(null);
      loadAreas();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed");
    } finally {
      setBusy(false);
    }
  }

  async function toggleActive(area) {
    try {
      await axiosInstance.patch(`/api/admin/service-area/${area._id}`, {
        isActive: !area.isActive,
      });
      loadAreas();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed");
    }
  }

  async function removeArea(id, name) {
    if (!window.confirm(`Delete "${name}"?`)) return;
    try {
      await axiosInstance.delete(`/api/admin/service-area/${id}`);
      toast.success("Area deleted");
      loadAreas();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed");
    }
  }

  const inputClass =
    "w-full border border-line-strong rounded-lg px-3 py-2 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-25";
  const labelClass = "text-xs font-semibold text-ink-700 mb-1.5 block";

  return (
    <div className="flex flex-col lg:flex-row gap-5">
      {/* add / edit form */}
      <form
        onSubmit={handleSubmit}
        className="bg-white border border-line rounded-xl shadow-card p-5 w-full lg:w-80 h-fit"
      >
        <h3 className="font-display font-bold mb-1">
          {editingId ? "Edit Area" : "Add Delivery Area"}
        </h3>
        <p className="text-xs text-ink-500 mb-4">
          Orders are only accepted inside these circles.
        </p>

        <label className={labelClass}>Area name</label>
        <input
          className={inputClass}
          placeholder="e.g. Dehradun Central"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />

        <label className={`${labelClass} mt-3`}>City</label>
        <input
          className={inputClass}
          placeholder="e.g. Dehradun"
          value={form.city}
          onChange={(e) => setForm({ ...form, city: e.target.value })}
        />

        <div className="grid grid-cols-2 gap-2 mt-3">
          <div>
            <label className={labelClass}>Latitude</label>
            <input
              className={inputClass}
              placeholder="30.3165"
              value={form.lat}
              onChange={(e) => setForm({ ...form, lat: e.target.value })}
            />
          </div>
          <div>
            <label className={labelClass}>Longitude</label>
            <input
              className={inputClass}
              placeholder="78.0322"
              value={form.lng}
              onChange={(e) => setForm({ ...form, lng: e.target.value })}
            />
          </div>
        </div>

        <button
          type="button"
          onClick={useMyLocation}
          className="flex items-center gap-1.5 text-xs font-semibold text-primary-600 hover:underline mt-2"
        >
          <FiCrosshair size={13} /> Use my current location
        </button>

        <label className={`${labelClass} mt-3`}>
          Radius: {form.radiusKm} km
        </label>
        <input
          type="range"
          min="1"
          max="50"
          value={form.radiusKm}
          onChange={(e) => setForm({ ...form, radiusKm: e.target.value })}
          className="w-full accent-primary-600"
        />
        <p className="text-[11px] text-ink-400">
          Anything within {form.radiusKm} km of the point above is deliverable.
        </p>

        <button
          disabled={busy}
          className="bg-primary-600 text-white w-full py-2.5 rounded-lg text-sm font-semibold mt-4 hover:bg-primary-500 disabled:bg-ink-200 disabled:text-ink-400 transition"
        >
          {busy ? "Saving..." : editingId ? "Update Area" : "Add Area"}
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
        {loading ? (
          <Loader text="Loading areas..." />
        ) : areas.length === 0 ? (
          <div className="bg-white border border-line rounded-xl shadow-card p-12 text-center">
            <span className="h-14 w-14 rounded-full bg-primary-25 text-primary-600 grid place-items-center mx-auto mb-3">
              <FiMapPin size={22} />
            </span>
            <p className="font-display font-bold mb-1">No delivery areas yet</p>
            <p className="text-ink-500 text-sm">
              While this list is empty the shop delivers everywhere. Add an area
              to start limiting it.
            </p>
          </div>
        ) : (
          <div className="bg-white border border-line rounded-xl shadow-card overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-cream-100 text-left text-ink-600">
                <tr>
                  <th className="p-3 font-semibold text-xs uppercase">Area</th>
                  <th className="p-3 font-semibold text-xs uppercase">Centre</th>
                  <th className="p-3 font-semibold text-xs uppercase">Radius</th>
                  <th className="p-3 font-semibold text-xs uppercase">Active</th>
                  <th className="p-3 font-semibold text-xs uppercase text-right">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {areas.map((a) => (
                  <tr key={a._id} className="border-t border-line hover:bg-cream-50">
                    <td className="p-3">
                      <span className="font-medium text-ink-900">{a.name}</span>
                      <span className="block text-xs text-ink-500">{a.city}</span>
                    </td>
                    <td className="p-3 text-ink-600 font-mono text-xs">
                      {a.lat.toFixed(4)}, {a.lng.toFixed(4)}
                    </td>
                    <td className="p-3 font-semibold">{a.radiusKm} km</td>
                    <td className="p-3">
                      <button
                        onClick={() => toggleActive(a)}
                        className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                          a.isActive
                            ? "bg-primary-25 text-primary-700"
                            : "bg-ink-100 text-ink-500"
                        }`}
                      >
                        {a.isActive ? "Active" : "Off"}
                      </button>
                    </td>
                    <td className="p-3 text-right whitespace-nowrap">
                      <button
                        onClick={() => {
                          setEditingId(a._id);
                          setForm({
                            name: a.name,
                            city: a.city,
                            lat: a.lat,
                            lng: a.lng,
                            radiusKm: a.radiusKm,
                          });
                        }}
                        className="text-primary-600 font-semibold hover:underline mr-3"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => removeArea(a._id, a.name)}
                        className="text-brandred hover:text-red-700 align-middle"
                      >
                        <FiTrash2 size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
