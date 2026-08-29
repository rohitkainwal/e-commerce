import { useEffect, useState } from "react";
import axiosInstance from "../axios/axiosInstance";
import { AuthContext } from "./auth.context.js";

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  //! on refresh we ask the backend who is logged in, cookie is httpOnly so js cannot read it
  useEffect(() => {
    axiosInstance
      .get("/api/user/current")
      .then((res) => setUser(res.data.payload))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const login = async (form) => {
    const res = await axiosInstance.post("/api/user/login", form);
    setUser(res.data.payload);
    return res.data;
  };

  const logout = async () => {
    try {
      await axiosInstance.post("/api/user/logout");
    } finally {
      //? clearing it on frontend even if the api call failed
      setUser(null);
    }
  };

  const isAdmin = user?.role === "admin";

  return (
    <AuthContext.Provider
      value={{ user, setUser, loading, login, logout, isAdmin }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
