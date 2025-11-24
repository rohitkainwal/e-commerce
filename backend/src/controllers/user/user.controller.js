import asyncHandler from "express-async-handler";
import userModel from "../../models/user.model.js";
import ApiResponse from "../../utils/ApiResponse.util.js";
import CustomError from "../../utils/CustomError.util.js";
import { generateToken } from "../../utils/jwt.util.js";
import { log } from "../../utils/logger.js";
import { sendEmail } from "../../utils/nodeMailer.util.js";

// register
export const registerUser = asyncHandler(async (req, res) => {
  const { username, email, password, contactNumber } = req.body;

  // createuseer

  const newUser = await userModel.create({
    username,
    email,
    password,
    contactNumber,
  });

  let emailVerificationToken = newUser.generateEmailVerificationToken();
  console.log(emailVerificationToken);
  await newUser.save();

let verification_url = `http://localhost:5173/api/user/verify-email/${emailVerificationToken}`;

  await sendEmail(
    email,
    "Email Verification",
    "sample text",
    `
    <h1>This is for validation</h1>
    <a href="${verification_url}">Click Me!</a>
  `
  );

  new ApiResponse(201, "user registered successfully", newUser).send(res);
});



export const verifyEmail = asyncHandler(async (req, res, next) => {
  let { emailToken } = req.params;
  let hashedEmailToken = crypto
    .createHash("sha256")
    .update(emailToken)
    .digest("hex");

  let user = await userModel.findOne({
    emailVerificationToken: hashedEmailToken,
    emailVerificationTokenExpiry: { $gt: Date.now() },
  });

  if (!user) next(new CustomError(400, "Token Expired"));

  user.isVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationTokenExpiry = undefined;
  await user.save();

  new ApiResponse(200, "Email Verified Successfully").send(res);
});



// login user
export const loginUser = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  //match email
  let existingUser = await userModel.findOne({ email });
  if (!existingUser) {
    return next(new CustomError(400, "Email not found"));
  }
log("Entered Password:", password);

  // match password

  let matchPassword = await existingUser.comparePassword(password);
  if (!matchPassword) {
    return next(new CustomError(401, "Password not matched "));
  }
log("Hashed Password In DB:", existingUser.password);
  let token = generateToken(existingUser._id);
  res.cookie("token", token, {
    httpOnly: true, // cannot access by JS
    secure: false, // true in production (https)
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
  log("Cookie Sent to Client", req.cookies);

  //api response
  new ApiResponse(200, "user log in successfully").send(res);
});

//logout user
export const logoutUser = asyncHandler(async (req, res, next) => {
  res.clearCookie("token");
  new ApiResponse(201, "user logout successfully").send(res);
});

// currentUser
export const currentUser = asyncHandler(async (req, res, next) => {
  new ApiResponse(201, "user logged in ").send(res);
});

// update Profile
export const updateProfile = asyncHandler(async (req, res, next) => {
  log("Update Controller Hit");
  const updateUser = await userModel.findByIdAndUpdate(
    req.myUser._id,
    req.body,

    {
      new: true,
      runValidators: true,
    }
  );
  log("Request Body", req.body);
  log("Logged In User", req.myUser);

  if (!updateUser) next(new CustomError(404, "user not found"));
  new ApiResponse(200, "user updated successfully", updateUser).send(res);
});

// update password
export const changePassword = asyncHandler(async (req, res, next) => {
  const existingUser = await userModel.findById(req.myUser._id);

  existingUser.password = req.body.password;
  await existingUser.save();

  new ApiResponse(200, "user password updated successfully").send(res);
});


