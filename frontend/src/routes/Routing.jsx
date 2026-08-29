import { createBrowserRouter } from "react-router-dom";
import Layout from "../components/Layout.jsx";

import AddressPage from "../pages/AddressPage.jsx";
import CartPage from "../pages/CartPage.jsx";
import CheckoutPage from "../pages/CheckoutPage.jsx";
import EmailVerify from "../pages/EmailVerify.jsx";
import ForgotPassword from "../pages/ForgotPassword.jsx";
import HomePage from "../pages/HomePage.jsx";
import LoginPage from "../pages/LoginPage.jsx";
import NotFound from "../pages/NotFound.jsx";
import OrderDetail from "../pages/OrderDetail.jsx";
import OrdersPage from "../pages/OrdersPage.jsx";
import ProductDetail from "../pages/ProductDetail.jsx";
import ProductsPage from "../pages/ProductsPage.jsx";
import ProfilePage from "../pages/ProfilePage.jsx";
import ResetPassword from "../pages/ResetPassword.jsx";
import SignupPage from "../pages/SignupPage.jsx";

import AddProduct from "../pages/admin/AddProduct.jsx";
import AdminAreas from "../pages/admin/AdminAreas.jsx";
import AdminDashboard from "../pages/admin/AdminDashboard.jsx";
import AdminLayout from "../pages/admin/AdminLayout.jsx";
import AdminOrders from "../pages/admin/AdminOrders.jsx";
import AdminUsers from "../pages/admin/AdminUsers.jsx";
import AdminProducts from "../pages/admin/AdminProducts.jsx";
import EditProduct from "../pages/admin/EditProduct.jsx";

import AdminRoute from "./AdminRoute.jsx";
import PrivateRoute from "./PrivateRoute.jsx";

export const myRoutes = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      //~ open to everyone
      { index: true, element: <HomePage /> },
      { path: "products", element: <ProductsPage /> },
      { path: "products/:id", element: <ProductDetail /> },
      { path: "login", element: <LoginPage /> },
      { path: "signup", element: <SignupPage /> },
      { path: "verify-email/:emailToken", element: <EmailVerify /> },
      { path: "forgot-password", element: <ForgotPassword /> },
      { path: "reset-password/:resetPasswordToken", element: <ResetPassword /> },

      //~ only after login
      {
        path: "cart",
        element: (
          <PrivateRoute>
            <CartPage />
          </PrivateRoute>
        ),
      },
      {
        path: "checkout",
        element: (
          <PrivateRoute>
            <CheckoutPage />
          </PrivateRoute>
        ),
      },
      {
        path: "orders",
        element: (
          <PrivateRoute>
            <OrdersPage />
          </PrivateRoute>
        ),
      },
      {
        path: "orders/:orderId",
        element: (
          <PrivateRoute>
            <OrderDetail />
          </PrivateRoute>
        ),
      },
      {
        path: "addresses",
        element: (
          <PrivateRoute>
            <AddressPage />
          </PrivateRoute>
        ),
      },
      {
        path: "profile",
        element: (
          <PrivateRoute>
            <ProfilePage />
          </PrivateRoute>
        ),
      },

      //~ only for admin, all of them sit under the admin tabs
      {
        path: "admin",
        element: (
          <AdminRoute>
            <AdminLayout />
          </AdminRoute>
        ),
        children: [
          { index: true, element: <AdminDashboard /> },
          { path: "products", element: <AdminProducts /> },
          { path: "products/add", element: <AddProduct /> },
          { path: "products/:productId/edit", element: <EditProduct /> },
          { path: "orders", element: <AdminOrders /> },
          { path: "users", element: <AdminUsers /> },
          { path: "areas", element: <AdminAreas /> },
        ],
      },

      { path: "*", element: <NotFound /> },
    ],
  },
]);
