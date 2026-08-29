import axios from "axios";

//! in production this comes from the VITE_API_URL env var (set it in Vercel).
//? locally, if the var is not set, it falls back to the backend on port 9000.
//? vite only exposes vars that start with VITE_ to the browser.
const baseURL = import.meta.env.VITE_API_URL || "http://localhost:9000";

const axiosInstance = axios.create({
  baseURL,
  withCredentials: true, //? without this the token cookie is not sent
  //! render's free plan sleeps the server after 15 min of no traffic.
  //! waking it up takes almost a minute, so the timeout has to be long
  timeout: 60000,
});

//? when the backend is not running, axios gives an error with NO err.response.
//? earlier every page just showed "Failed", which looked same as a wrong password.
//? so here we put a clear message on it.
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      const message =
        error.code === "ECONNABORTED"
          ? "Server took too long to reply. It may be waking up, please try once more."
          : "Cannot reach the server. Please check your internet and try again.";

      //? making it look like a normal api error, so pages can read it the same way
      error.response = { data: { message } };
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
