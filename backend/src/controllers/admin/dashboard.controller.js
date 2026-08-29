import expressAsyncHandler from "express-async-handler";
import OrderModel from "../../models/order.model.js";
import ProductModel from "../../models/product.model.js";
import UserModel from "../../models/user.model.js";
import ApiResponse from "../../utils/ApiResponse.util.js";

//! everything the admin dashboard needs, in one call
export const getStats = expressAsyncHandler(async (req, res, next) => {
  const [totalProducts, totalUsers, totalOrders] = await Promise.all([
    ProductModel.countDocuments(),
    UserModel.countDocuments({ role: "user" }),
    OrderModel.countDocuments(),
  ]);

  //? money only from the orders that were not cancelled
  const earned = await OrderModel.aggregate([
    { $match: { orderStatus: { $ne: "Cancelled" } } },
    { $group: { _id: null, total: { $sum: "$totalAmount" } } },
  ]);
  const revenue = earned[0]?.total || 0;

  //? how many orders are in each status --> [{_id:"Placed", count:3}, ...]
  const statusList = await OrderModel.aggregate([
    { $group: { _id: "$orderStatus", count: { $sum: 1 } } },
  ]);
  const ordersByStatus = {};
  statusList.forEach((s) => (ordersByStatus[s._id] = s.count));

  const lowStock = await ProductModel.countDocuments({
    stock: { $gt: 0, $lte: 5 },
  });
  const outOfStock = await ProductModel.countDocuments({ stock: 0 });

  //? last 5 orders for the table on the dashboard
  const recentOrders = await OrderModel.find()
    .sort({ createdAt: -1 })
    .limit(5)
    .populate({ path: "userId", select: "username email" });

  //? which products were ordered the most
  const topProducts = await OrderModel.aggregate([
    { $match: { orderStatus: { $ne: "Cancelled" } } },
    { $unwind: "$cartItems" },
    {
      $group: {
        _id: "$cartItems.name",
        sold: { $sum: "$cartItems.quantity" },
        earned: {
          $sum: { $multiply: ["$cartItems.price", "$cartItems.quantity"] },
        },
      },
    },
    { $sort: { sold: -1 } },
    { $limit: 5 },
  ]);

  new ApiResponse(200, "Stats Fetched Successfully", {
    totalProducts,
    totalUsers,
    totalOrders,
    revenue,
    ordersByStatus,
    lowStock,
    outOfStock,
    recentOrders,
    topProducts,
  }).send(res);
});
