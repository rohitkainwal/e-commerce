export const LOCATION_KEY = "shop-location";

//? read the location the user picked last time
export const savedLocation = () => {
  try {
    return JSON.parse(localStorage.getItem(LOCATION_KEY)) || null;
  } catch {
    return null;
  }
};

export const saveLocation = (value) => {
  localStorage.setItem(LOCATION_KEY, JSON.stringify(value));
};
