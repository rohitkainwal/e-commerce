import UserModel from "../models/user.model.js";

export const seedAdmin = async () => {
  //? if admin details are not filled in .env then skip, otherwise it will throw validation error
  if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD) {
    console.log("Admin details not found in .env, skipping seed..");
    return;
  }

  let existingAdmin = await UserModel.findOne({ role: "admin" });
  if (existingAdmin) {
    console.log("Admin Already Exists, skipping seed..");
    return;
  }

  let adminDetails = {
    email: process.env.ADMIN_EMAIL,
    password: process.env.ADMIN_PASSWORD,
    username: process.env.ADMIN_USERNAME,
    role: "admin",
    contactNumber: process.env.ADMIN_CONTACT_NUMBER,
    isVerified: true, //? admin does not need email verification
  };

  await new UserModel(adminDetails).save();
  console.log("Admin Details Added to DB..");
};
