import expressAsyncHandler from "express-async-handler";
import OrderModel from "../../models/order.model.js";
import ProductModel from "../../models/product.model.js";
import ApiResponse from "../../utils/ApiResponse.util.js";
import CustomError from "../../utils/CustomError.util.js";

//! admin sees every order, not just his own
export const getAllOrders = expressAsyncHandler(async (req, res, next) => {
  const { status, keyword } = req.query;

  let filter = {};
  if (status) filter.orderStatus = status;

  let orders = await OrderModel.find(filter)
    .sort({ createdAt: -1 })
    .populate({ path: "userId", select: "username email contactNumber" });

  //? small search on customer name / email / order id, done here because
  //? the user fields live on another collection
  if (keyword) {
    const k = keyword.toLowerCase();
    orders = orders.filter(
      (o) =>
        o._id.toString().includes(k) ||
        o.userId?.username?.toLowerCase().includes(k) ||
        o.userId?.email?.toLowerCase().includes(k)
    );
  }

  new ApiResponse(200, "Orders Fetched Successfully", orders).send(res);
});

export const getOrderById = expressAsyncHandler(async (req, res, next) => {
  const order = await OrderModel.findById(req.params.orderId).populate({
    path: "userId",
    select: "username email contactNumber",
  });

  if (!order) return next(new CustomError(404, "Order Not Found"));

  new ApiResponse(200, "Order Fetched Successfully", order).send(res);
});

const ALLOWED = [
  "Pending",
  "Processing",
  "Placed",
  "Shipped",
  "Delivered",
  "Cancelled",
];

export const updateOrderStatus = expressAsyncHandler(async (req, res, next) => {
  const { orderStatus, paymentStatus } = req.body;

  if (orderStatus && !ALLOWED.includes(orderStatus))
    return next(new CustomError(400, "That order status is not allowed"));

  const order = await OrderModel.findById(req.params.orderId);
  if (!order) return next(new CustomError(404, "Order Not Found"));

  //! if admin cancels the order, the stock has to go back
  if (orderStatus === "Cancelled" && order.orderStatus !== "Cancelled") {
    for (let item of order.cartItems) {
      await ProductModel.findByIdAndUpdate(item.productId, {
        $inc: { stock: item.quantity },
      });
    }
  }

  //? and if he un-cancels it, take the stock out again
  if (
    order.orderStatus === "Cancelled" &&
    orderStatus &&
    orderStatus !== "Cancelled"
  ) {
    for (let item of order.cartItems) {
      await ProductModel.findByIdAndUpdate(item.productId, {
        $inc: { stock: -item.quantity },
      });
    }
  }

  if (orderStatus) order.orderStatus = orderStatus;
  if (paymentStatus) order.paymentStatus = paymentStatus;

  //? COD money is collected at delivery time
  if (orderStatus === "Delivered" && order.paymentMethod === "COD") {
    order.paymentStatus = "Paid";
  }

  await order.save();

  new ApiResponse(200, "Order Updated Successfully", order).send(res);
});
