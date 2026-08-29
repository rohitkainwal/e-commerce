import React from "react";
import ReactDOM from "react-dom/client";
import { Toaster } from "react-hot-toast";
import App from "./App.jsx";
import AuthProvider from "./context/AuthContext.jsx";
import CartProvider from "./context/CartContext.jsx";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <AuthProvider>
    {/* cart provider is inside, because it needs to know the logged in user */}
    <CartProvider>
      <App />
      {/* without this Toaster, react-hot-toast messages never show up */}
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: "#1d2939",
            color: "#fffbf5",
            borderRadius: "9999px",
            fontSize: "14px",
          },
          success: { iconTheme: { primary: "#039855", secondary: "#fffbf5" } },
          error: { iconTheme: { primary: "#e7272b", secondary: "#fffbf5" } },
        }}
      />
    </CartProvider>
  </AuthProvider>
);
