import dotenv from "dotenv";
dotenv.config({ quiet: true });

import mongoose from "mongoose";
import { connectDB } from "../config/database.config.js";
import ProductModel from "../models/product.model.js";

//? run with --> npm run best-images
//? the five best selling cards sit at the top of the home page, so they get
//? the clearest photos. each one below was opened at card size and compared
//? against the old picture before swapping it in.

const RP = "https://images.rawpixel.com/editor_1024/";

const images = {
  //? was a single small apple lost in grey space, now a full frame of apples
  "Apple Royal Gala (1kg)":
    RP + "cHJpdmF0ZS9zdGF0aWMvaW1hZ2Uvd2Vic2l0ZS8yMDIyLTA0L2xyL2ZyYXBwbGVfZnJ1aXRfZm9vZF83MDAwMDUtaW1hZ2Uta3liYzl3a3guanBn.jpg",

  //? real pack shots. the files sit in frontend/public, so they load from our
  //? own site and the url starts with a "/" instead of https.
  "Aashirvaad Atta (5kg)": "/aataxmultigrain.webp",
  "Amul Taaza Milk (1L)": "/FoP-Taaza-Milk-1L.png",
  "Tata Salt (1kg)":
    "/Tata_Salt_-_North_Central_Recyclable_AH-IN-JB-RP-BH-PU-SG_1_Kg_FOP-removebg-preview.webp",
};

//? Fortune Sunflower Oil keeps the photo it already had, nothing better turned up.

const run = async () => {
  await connectDB();

  for (let name of Object.keys(images)) {
    const url = images[name];
    const res = await ProductModel.updateOne(
      { name },
      {
        $set: {
          images: [
            { url, asset_id: `seed-${name}`, public_id: `seed-${name}` },
          ],
        },
      }
    );
    console.log(res.matchedCount ? `updated  ${name}` : `NOT FOUND  ${name}`);
  }

  await mongoose.connection.close();
  process.exit(0);
};

run().catch(async (err) => {
  console.log("Failed");
  console.log(err);
  await mongoose.connection.close();
  process.exit(1);
});
