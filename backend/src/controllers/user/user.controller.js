import dotenv from "dotenv";
dotenv.config({ quiet: true });
//! loading env here also, because this file reads env at the top itself
//? (imports run before app.js can call dotenv.config)

import crypto from "crypto";
import expressAsyncHandler from "express-async-handler";
import UserModel from "../../models/user.model.js";
import ApiResponse from "../../utils/ApiResponse.util.js";
import CustomError from "../../utils/CustomError.util.js";
import { generateToken } from "../../utils/jwt.util.js";
import { sendEmail } from "../../utils/nodemailer.util.js";

const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

//? cookie options at one place, so login and logout both use the same thing
const cookieOptions = {
  httpOnly: true,
  //! on localhost we are on http, so secure must be false otherwise browser will not save the cookie
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  maxAge: (Number(process.env.JWT_TOKEN_EXPIRY) || 24) * 60 * 60 * 1000,
};

export const registerUser = expressAsyncHandler(async (req, res, next) => {
  const { username, email, password, contactNumber } = req.body;

  const newUser = await UserModel.create({
    username,
    email,
    password,
    contactNumber,
  });

  let emailVerificationToken = newUser.generateEmailVerificationToken();
  await newUser.save();

  //? this link opens the frontend page, and that page calls the backend api
  let verification_url = `${FRONTEND_URL}/verify-email/${emailVerificationToken}`;

  //! send a mail -->
  await sendEmail(
    email,
    "Email Verification",
    "Sample Text",
    `<h1> this is for verification</h1> <a href="${verification_url}">Click Here</a> <h3> ${emailVerificationToken} </h3>`
  );
  new ApiResponse(201, "User Registered Successfully", newUser).send(res);
});

export const verifyEmail = expressAsyncHandler(async (req, res, next) => {
  let { emailToken } = req.params;
  let hashedEmailToken = crypto
    .createHash("sha256")
    .update(emailToken)
    .digest("hex");

  let user = await UserModel.findOne({
    emailVerificationToken: hashedEmailToken,
    emailVerificationTokenExpiry: { $gt: Date.now() },
  });

  //! return is needed, otherwise the code below runs on a null user and crashes
  if (!user) return next(new CustomError(400, "Token Expired"));

  if (user.isVerified)
    return next(new CustomError(400, "Email Already Verified"));

  user.isVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationTokenExpiry = undefined;
  await user.save();

  new ApiResponse(200, "Email Verified Successfully").send(res);
});

export const loginUser = expressAsyncHandler(async (req, res, next) => {
  const { email, password } = req.body;
  let existingUser = await UserModel.findOne({ email }).select("+password");

  if (!existingUser) return next(new CustomError(400, "Email Not Found!!!"));

  let matchPassword = await existingUser.comparePassword(password);
  if (!matchPassword) {
    return next(new CustomError(401, "Password Not Matched"));
  }

  if (!existingUser.isVerified)
    return next(new CustomError(400, "Email Not Verified"));

  //! if isVerified is set to true
  let token = generateToken(existingUser.id);
  res.cookie("token", token, cookieOptions);

  //? sending the user back also, so frontend can directly show the name/role
  new ApiResponse(200, "User Logged In Successfully", existingUser).send(res);
});

export const resendEmailVerificationLink = expressAsyncHandler(
  async (req, res, next) => {
    const { email } = req.body;
    let existingUser = await UserModel.findOne({ email });
    if (!existingUser) return next(new CustomError(400, "Email Not Found"));

    if (existingUser.isVerified)
      return next(new CustomError(400, "Email Already Verified"));

    let emailVerificationToken = existingUser.generateEmailVerificationToken();
    await existingUser.save();

    let verification_url = `${FRONTEND_URL}/verify-email/${emailVerificationToken}`;

    //! send a mail -->
    await sendEmail(
      email,
      "Email Verification",
      "Resend Verification Link",
      `<h1> this is for verification</h1> <a href="${verification_url}">Click Here</a> <h3> ${emailVerificationToken} </h3>`
    );

    new ApiResponse(200, "Email Verification Link Sent Successfully").send(res);
  }
);

export const logoutUser = expressAsyncHandler(async (req, res, next) => {
  //? clearCookie needs the same options as the ones used while setting it
  res.clearCookie("token", { ...cookieOptions, maxAge: 0 });
  new ApiResponse(200, "User Logged Out Successfully").send(res);
});

//~ this is for frontend --> check the success, if true means logged in, else not logged in then redirect client to login page or home page
export const currentUser = expressAsyncHandler(async (req, res, next) => {
  //? sending the user object also, frontend needs it for navbar and admin check
  new ApiResponse(200, "User is Logged in", req.myUser).send(res);
});

export const updateProfile = expressAsyncHandler(async (req, res, next) => {
  //! excluding password, update rest
  const updatedUser = await UserModel.findByIdAndUpdate(
    req.myUser._id,
    req.body,
    {
      new: true, //? it returns the updated document,
      runValidators: true, //? validate the updated document against the schema
    }
  );

  if (!updatedUser) return next(new CustomError(404, "User Not Found"));
  new ApiResponse(200, "User Updated Successfully", updatedUser).send(res);
});

export const changePassword = expressAsyncHandler(async (req, res, next) => {
  const { oldPassword, password } = req.body;

  const existingUser = await UserModel.findById(req.myUser._id);
  if (!existingUser) return next(new CustomError(404, "User Not Found"));

  //! first check the old password, otherwise anyone with the cookie can change it
  const matchPassword = await existingUser.comparePassword(oldPassword);
  if (!matchPassword)
    return next(new CustomError(401, "Old Password is Wrong"));

  existingUser.password = password;
  await existingUser.save();

  new ApiResponse(200, "Password Updated Successfully").send(res);
});

export const forgotPassword = expressAsyncHandler(async (req, res, next) => {
  const { email } = req.body;
  let existingUser = await UserModel.findOne({ email });
  if (!existingUser) return next(new CustomError(400, "Email Not Found"));

  let resetPasswordToken = existingUser.generateResetPasswordToken();
  await existingUser.save();

  let resetPassword_url = `${FRONTEND_URL}/reset-password/${resetPasswordToken}`;

  await sendEmail(
    email,
    "Reset Password",
    "Reset Password",
    `<h1> this is for reset password</h1> <a href="${resetPassword_url}">Click Here</a> <h3> ${resetPasswordToken} </h3>`
  );

  new ApiResponse(200, "Reset Password Link Sent Successfully").send(res);
});

//? small helper, both the GET and POST need the same finding logic
const findUserByResetToken = async (resetPasswordToken) => {
  let resetPasswordTokenHashed = crypto
    .createHash("sha256")
    .update(resetPasswordToken)
    .digest("hex");

  return await UserModel.findOne({
    passwordResetToken: resetPasswordTokenHashed,
    passwordResetTokenExpiry: { $gt: Date.now() },
  });
};

//~ GET --> frontend calls this first, just to check the link is still valid before showing the form
export const checkResetPasswordToken = expressAsyncHandler(
  async (req, res, next) => {
    const existingUser = await findUserByResetToken(
      req.params.resetPasswordToken
    );
    if (!existingUser) return next(new CustomError(400, "Token Expired"));

    new ApiResponse(200, "Token is Valid").send(res);
  }
);

//~ POST --> actually changes the password
export const resetPassword = expressAsyncHandler(async (req, res, next) => {
  const existingUser = await findUserByResetToken(
    req.params.resetPasswordToken
  );
  if (!existingUser) return next(new CustomError(400, "Token Expired"));

  existingUser.password = req.body.password;
  //? token is used now, so remove it. otherwise same link works again
  existingUser.passwordResetToken = undefined;
  existingUser.passwordResetTokenExpiry = undefined;
  await existingUser.save();

  new ApiResponse(200, "Password Reset Successfully").send(res);
});

//! login, logout -> (token generation), authenticate middleware
