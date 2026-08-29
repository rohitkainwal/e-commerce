import { Navigate, useLocation } from "react-router-dom";
import Loader from "../components/Loader.jsx";
import { useAuth } from "../context/auth.context.js";

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  //! must wait, otherwise on refresh it sends a logged in user to /login
  if (loading) return <Loader />;

  //? sending the current path also, so after login we can come back here
  if (!user) return <Navigate to="/login" state={{ from: location.pathname }} replace />;

  return children;
};

export default PrivateRoute;
