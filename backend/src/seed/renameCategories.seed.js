import dotenv from "dotenv";
dotenv.config({ quiet: true });

import mongoose from "mongoose";
import { connectDB } from "../config/database.config.js";
import ProductModel from "../models/product.model.js";

//? one time script --> npm run rename-categories
//? the old names came from the training data, these are the proper grocery ones.

const renames = {
  "Fresh Produce": "Fruits & Vegetables",
  "Dairy & Eggs": "Dairy & Breakfast",
  Breakfast: "Dairy & Breakfast",
  Pantry: "Staples & Pulses",
  Snacks: "Snacks & Munchies",
  Bakery: "Bakery & Cakes",
  "Butchery & Seafood": "Meat & Seafood",
  Frozen: "Frozen Foods",
};

//? a few items were sitting in the wrong aisle once the names changed
const moves = {
  "Dark Chocolate 70% 100g": "Snacks & Munchies",
  "California Almonds 500g": "Snacks & Munchies",
  "Chocolate Chip Cookies (Pack of 8)": "Snacks & Munchies",
  "Granola with Nuts 400g": "Dairy & Breakfast",
};

const run = async () => {
  await connectDB();

  for (let oldName of Object.keys(renames)) {
    const res = await ProductModel.updateMany(
      { category: oldName },
      { $set: { category: renames[oldName] } }
    );
    console.log(`${oldName} -> ${renames[oldName]} (${res.modifiedCount} products)`);
  }

  for (let name of Object.keys(moves)) {
    const res = await ProductModel.updateOne(
      { name },
      { $set: { category: moves[name] } }
    );
    if (res.modifiedCount) console.log(`moved "${name}" to ${moves[name]}`);
  }

  const left = await ProductModel.distinct("category");
  console.log("categories now:", left.sort());

  await mongoose.connection.close();
  process.exit(0);
};

run().catch(async (err) => {
  console.log("Rename failed");
  console.log(err);
  await mongoose.connection.close();
  process.exit(1);
});
