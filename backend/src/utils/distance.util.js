import ServiceAreaModel from "../models/serviceArea.model.js";

//! haversine formula --> distance in km between two lat/lng points
export const distanceInKm = (lat1, lng1, lat2, lng2) => {
  const R = 6371; //? radius of earth in km
  const toRad = (value) => (value * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  return 2 * R * Math.asin(Math.sqrt(a));
};

/*
  checks if a point is inside any active area.
  if lat/lng are not given, we fall back to matching the city name.

  returns { deliverable, area, distance }
*/
export const checkServiceable = async ({ lat, lng, city }) => {
  const areas = await ServiceAreaModel.find({ isActive: true });

  //! if admin has not added any area yet, deliver everywhere.
  //! otherwise the shop would stop working the moment this feature is added
  if (areas.length === 0)
    return { deliverable: true, area: null, distance: null, noAreas: true };

  if (lat != null && lng != null) {
    let best = null;

    for (const area of areas) {
      const distance = distanceInKm(lat, lng, area.lat, area.lng);
      if (distance <= area.radiusKm) {
        //? if it falls in more than one area, keep the closest
        if (!best || distance < best.distance) best = { area, distance };
      }
    }

    if (best)
      return {
        deliverable: true,
        area: best.area,
        distance: Number(best.distance.toFixed(2)),
      };

    //? not inside any area --> tell them how far the nearest one is
    let nearest = null;
    for (const area of areas) {
      const distance = distanceInKm(lat, lng, area.lat, area.lng);
      if (!nearest || distance < nearest.distance) nearest = { area, distance };
    }

    return {
      deliverable: false,
      area: null,
      nearest: nearest.area,
      distance: Number(nearest.distance.toFixed(2)),
    };
  }

  //? no coordinates, so just compare the city name
  if (city) {
    const match = areas.find(
      (a) => a.city.toLowerCase() === city.trim().toLowerCase()
    );
    if (match) return { deliverable: true, area: match, distance: null };
  }

  return { deliverable: false, area: null, distance: null };
};
