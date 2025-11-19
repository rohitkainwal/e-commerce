import asyncHandler from "express-async-handler";
import userModel from "../../models/user.model.js";
import ApiResponse from "../../utils/ApiResponse.util.js";
import CustomError from "../../utils/CustomError.util.js";
import { generateToken } from "../../utils/jwt.util.js";
import expressAsyncHandler from "express-async-handler";
import { log } from "../../utils/logger.js";


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

  // get response

  // res.status(200).json({success:true, message:"user registered succesfully ",newUser}); //

  new ApiResponse(201, "user registered successfully", newUser).send(res);
});

// login user

export const loginUser = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  //match email
  let existingUser = await userModel.findOne({ email });
  if (!existingUser) {
    return next(new CustomError(400, "Email not found"));
  }

  // match password

  let matchPassword = await existingUser.comparePassword(password);
  if (!matchPassword) {
    return next(new CustomError(401, "Password not matched "));
  }

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

// currentUser
    export const currentUser = expressAsyncHandler(async (req,res,next)=>{
      
    })

    // update Profile

    export const updateProfile = expressAsyncHandler(async (req,res,next)=>{
      log("Update Controller Hit");
       const updateUser = await userModel.findByIdAndUpdate(
      req.myUser._id,
      req.body,
      
      {
        new:true,
        runValidators:true
      }
    );
    log("Request Body", req.body);
    log("Logged In User", req.myUser);
    
    if(!updateUser) next(new CustomError(404, "user not found"));
    new ApiResponse(200 , "user updated successfully", updateUser).send(res)
    });
   