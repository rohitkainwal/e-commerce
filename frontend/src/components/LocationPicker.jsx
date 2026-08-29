import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import {
  FiAlertCircle,
  FiCheck,
  FiChevronDown,
  FiCrosshair,
  FiMapPin,
} from "react-icons/fi";
import axiosInstance from "../axios/axiosInstance";
import { savedLocation, saveLocation } from "../utils/location.js";


const LocationPicker = () => {
  const [loc, setLoc] = useState(savedLocation);
  const [areas, setAreas] = useState([]);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const boxRef = useRef(null);

  //? the cities admin has switched on
  useEffect(() => {
    axiosInstance
      .get("/api/shop/service-area/all")
      .then((res) => setAreas(res.data.payload))
      .catch(() => setAreas([]));
  }, []);

  //! close the dropdown when clicking anywhere outside it
  useEffect(() => {
    const onClick = (e) => {
      if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const save = (value) => {
    setLoc(value);
    saveLocation(value);
  };

  //! ask the browser for gps, then ask the backend if we deliver there
  const useMyLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Your browser does not support location");
      return;
    }

    setBusy(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          const res = await axiosInstance.get("/api/shop/service-area/check", {
            params: { lat: latitude, lng: longitude },
          });
          const r = res.data.payload;

          save({
            label: r.deliverable
              ? r.area?.city || "My location"
              : "My location",
            lat: latitude,
            lng: longitude,
            deliverable: r.deliverable,
            distance: r.distance,
            nearest: r.nearest?.city || null,
          });

          if (r.deliverable) {
            toast.success(`We deliver here (${r.distance} km from ${r.area?.name})`);
            setOpen(false);
          } else {
            toast.error("Sorry, we do not deliver to your location yet");
          }
        } catch (err) {
          toast.error(err.response?.data?.message || "Could not check location");
        } finally {
          setBusy(false);
        }
      },
      () => {
        setBusy(false);
        toast.error("Could not get your location, please allow permission");
      },
      { timeout: 10000 }
    );
  };

  //? picking a city from the list, we already know those are serviceable
  const chooseCity = (area) => {
    save({
      label: area.city,
      lat: area.lat,
      lng: area.lng,
      deliverable: true,
      distance: null,
    });
    toast.success(`Delivering to ${area.city}`);
    setOpen(false);
  };

  const bad = loc && !loc.deliverable;

  return (
    <div className="relative" ref={boxRef}>
      {/* pin, then "Deliver to" small on top and the place in bold under it */}
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 text-left max-w-[210px] group"
      >
        {bad ? (
          <FiAlertCircle size={17} className="shrink-0 text-brandred" />
        ) : (
          <FiMapPin size={17} className="shrink-0 text-primary-600" />
        )}

        <div className="min-w-0">
          <p
            className={`text-[11.5px] leading-[1.3] ${
              bad ? "text-brandred" : "text-ink-500"
            }`}
          >
            {bad ? "Not serviceable" : "Deliver to"}
          </p>
          <p className="text-[14.5px] font-semibold leading-[1.3] text-ink-900 truncate">
            {loc?.label || "Select location"}
          </p>
        </div>

        <FiChevronDown
          size={14}
          className={`shrink-0 text-ink-500 ${open ? "rotate-180" : ""} transition`}
        />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-64 bg-white border border-line rounded-xl shadow-pop py-2 z-30">
          <button
            onClick={useMyLocation}
            disabled={busy}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm font-semibold text-primary-700 hover:bg-primary-25 disabled:opacity-60"
          >
            <FiCrosshair size={14} />
            {busy ? "Checking..." : "Use my current location"}
          </button>

          {/* result of the last check */}
          {loc && (
            <div
              className={`mx-2 my-1.5 rounded-lg px-2.5 py-2 text-xs ${
                loc.deliverable
                  ? "bg-primary-25 text-primary-700"
                  : "bg-accent-soft text-accent-ink"
              }`}
            >
              {loc.deliverable ? (
                <>
                  Delivering to <b>{loc.label}</b>
                  {loc.distance != null && ` · ${loc.distance} km away`}
                </>
              ) : (
                <>
                  We do not deliver to your location yet.
                  {loc.nearest && ` Nearest area: ${loc.nearest} (${loc.distance} km).`}
                </>
              )}
            </div>
          )}

          <p className="px-3 pt-2 pb-1 text-[10px] font-semibold uppercase tracking-wide text-ink-400 border-t border-line">
            We deliver in
          </p>

          <div className="max-h-52 overflow-y-auto">
            {areas.length === 0 ? (
              <p className="px-3 py-2 text-xs text-ink-500">
                No delivery areas set up yet, so we deliver everywhere.
              </p>
            ) : (
              areas.map((a) => (
                <button
                  key={a.city + a.name}
                  onClick={() => chooseCity(a)}
                  className="w-full flex items-center justify-between px-3 py-1.5 text-sm text-ink-700 hover:bg-cream-100"
                >
                  <span>
                    {a.city}
                    <span className="block text-[10px] text-ink-400">
                      {a.name} · {a.radiusKm} km
                    </span>
                  </span>
                  {loc?.label === a.city && (
                    <FiCheck size={14} className="text-primary-600" />
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default LocationPicker;
