import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import axiosInstance from "../axios/axiosInstance";
import { useAuth } from "./auth.context.js";
import { CartContext } from "./cart.context.js";

const CartProvider = ({ children }) => {
  const { user } = useAuth();

  const [items, setItems] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [cartId, setCartId] = useState(null);
  const [loading, setLoading] = useState(false);

  //? backend sends the items in payload and the total in meta
  const saveResponse = (res) => {
    setItems(res.data.payload || []);
    setTotalAmount(res.data.meta?.totalAmount || 0);
    setCartId(res.data.meta?.cartId || null);
  };

  //? useCallback so it does not change on every render (effect below depends on it)
  const fetchCart = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get("/api/shop/cart/get");
      saveResponse(res);
    } catch {
      setItems([]);
      setTotalAmount(0);
    } finally {
      setLoading(false);
    }
  }, []);

  //! cart is per user, so load it when user logs in and empty it when he logs out
  useEffect(() => {
    if (user) fetchCart();
    else {
      setItems([]);
      setTotalAmount(0);
      setCartId(null);
    }
  }, [user, fetchCart]);

  const addToCart = async (productId) => {
    if (!user) {
      toast.error("Please login first");
      return false;
    }
    try {
      const res = await axiosInstance.post("/api/shop/cart/add", { productId });
      saveResponse(res);
      toast.success("Added to cart");
      return true;
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not add to cart");
      return false;
    }
  };

  //? decrease quantity by one
  const removeFromCart = async (productId) => {
    try {
      const res = await axiosInstance.patch("/api/shop/cart/remove", {
        productId,
      });
      saveResponse(res);
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong");
    }
  };

  //? remove the whole product, no matter the quantity
  const deleteFromCart = async (productId) => {
    try {
      const res = await axiosInstance.patch("/api/shop/cart/delete", {
        productId,
      });
      saveResponse(res);
      toast.success("Removed from cart");
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong");
    }
  };

  const clearCart = async () => {
    try {
      const res = await axiosInstance.patch("/api/shop/cart/clear");
      saveResponse(res);
      toast.success("Cart cleared");
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong");
    }
  };

  //? total number of pieces, shown on the navbar badge
  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        totalAmount,
        cartId,
        cartCount,
        loading,
        fetchCart,
        addToCart,
        removeFromCart,
        deleteFromCart,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export default CartProvider;
