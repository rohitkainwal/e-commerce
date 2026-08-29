import expressAsyncHandler from "express-async-handler";
import OrderModel from "../../models/order.model.js";
import UserModel from "../../models/user.model.js";
import ApiResponse from "../../utils/ApiResponse.util.js";
import CustomError from "../../utils/CustomError.util.js";
import { escapeRegex } from "../../utils/escapeRegex.util.js";

//! list of every registered user, with how much each one has ordered
export const getAllUsers = expressAsyncHandler(async (req, res, next) => {
  const { keyword } = req.query;

  let filter = {};
  if (keyword) {
    const pattern = new RegExp(escapeRegex(keyword), "i");
    filter = {
      $or: [
        { username: pattern },
        { email: pattern },
        { contactNumber: pattern },
      ],
    };
  }

  const users = await UserModel.find(filter).sort({ createdAt: -1 });

  //? count orders and money per user in one query instead of a loop
  const stats = await OrderModel.aggregate([
    { $match: { orderStatus: { $ne: "Cancelled" } } },
    {
      $group: {
        _id: "$userId",
        orders: { $sum: 1 },
        spent: { $sum: "$totalAmount" },
      },
    },
  ]);

  const byUser = {};
  stats.forEach((s) => (byUser[s._id.toString()] = s));

  const payload = users.map((u) => ({
    ...u.toJSON(),
    orders: byUser[u._id.toString()]?.orders || 0,
    spent: byUser[u._id.toString()]?.spent || 0,
  }));

  new ApiResponse(200, "Users Fetched Successfully", payload).send(res);
});

export const getUserById = expressAsyncHandler(async (req, res, next) => {
  const user = await UserModel.findById(req.params.userId);
  if (!user) return next(new CustomError(404, "User Not Found"));

  const orders = await OrderModel.find({ userId: user._id }).sort({
    createdAt: -1,
  });

  new ApiResponse(200, "User Fetched Successfully", { user, orders }).send(res);
});

//! make someone an admin, or take it back
export const updateUserRole = expressAsyncHandler(async (req, res, next) => {
  const { role } = req.body;

  if (!["user", "admin"].includes(role))
    return next(new CustomError(400, "Role can only be user or admin"));

  //? admin should not be able to remove his own admin rights by mistake
  if (req.params.userId === req.myUser._id.toString())
    return next(new CustomError(400, "You cannot change your own role"));

  const user = await UserModel.findByIdAndUpdate(
    req.params.userId,
    { role },
    { new: true, runValidators: true }
  );

  if (!user) return next(new CustomError(404, "User Not Found"));

  new ApiResponse(200, "Role Updated Successfully", user).send(res);
});

export const deleteUser = expressAsyncHandler(async (req, res, next) => {
  //? same thing, do not let admin delete himself
  if (req.params.userId === req.myUser._id.toString())
    return next(new CustomError(400, "You cannot delete your own account here"));

  const user = await UserModel.findByIdAndDelete(req.params.userId);
  if (!user) return next(new CustomError(404, "User Not Found"));

  new ApiResponse(200, "User Deleted Successfully", user).send(res);
});
