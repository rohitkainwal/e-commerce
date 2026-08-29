import { Navigate } from "react-router-dom";
import Loader from "../components/Loader.jsx";
import { useAuth } from "../context/auth.context.js";

const AdminRoute = ({ children }) => {
  const { user, loading, isAdmin } = useAuth();

  if (loading) return <Loader />;

  if (!user) return <Navigate to="/login" replace />;

  //? logged in but a normal user, so send him to home
  if (!isAdmin) return <Navigate to="/" replace />;

  return children;
};

export default AdminRoute;
