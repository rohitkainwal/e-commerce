
import expressAsyncHandler from "express-async-handler";
import jwt from "jsonwebtoken";
import userModel from "../models/user.model.js";
import CustomError from "../utils/CustomError.util.js";
import { log } from "../utils/logger.js";


export const authenticate = expressAsyncHandler(async (req, res, next) => {
      log("AUTH Middleware Start");

  log("Incoming Cookies", req.cookies);
  const token = req?.cookies?.token;
    log("Extracted Token", token);
  if (!token)
    return next(new CustomError(401, "pleasse login to access this route "));
  const decodeToken = jwt.verify(token, process.env.JWT_SECRET_KEY);

     log("Decoded Token", decodeToken);
   
  const user = await userModel.findById(decodeToken.id);
   log("User Found in DB", user._id);
  if (!user)
    return next(new CustomError(401, "invlid session please login again"));

  req.myUser = user;
    log("AUTH Middleware End");
  next();
});
