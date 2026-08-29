import dotenv from "dotenv";
dotenv.config({ quiet: true });

import mongoose from "mongoose";
import { connectDB } from "../config/database.config.js";
import ProductModel from "../models/product.model.js";

//? run with --> npm run design-products
//? these eight are copied straight out of the NatureCart design file,
//? same names, same prices and same descriptions. "from" is the product
//? we already had, so we update it instead of making a duplicate.

const OIL_IMAGE =
  "https://images.rawpixel.com/editor_1024/czNmcy1wcml2YXRlL3Jhd3BpeGVsX2ltYWdlcy93ZWJzaXRlX2NvbnRlbnQvbHIvZnJmb29kX29saXZlX29pbF9saXF1aWRfMC1pbWFnZS1reWJkbXZ4eC5qcGc.jpg";

const items = [
  {
    from: "Apple Royal Gala (1kg)",
    name: "Apple Royal Gala (1kg)",
    price: 189, salePrice: 149,
    description:
      "Crisp, juicy Royal Gala apples hand-picked and packed the same morning. Great for lunchboxes, salads and juicing.",
    category: "Fruits & Vegetables", brand: "Orchard Gold",
  },
  {
    from: "Whole Wheat Atta (5kg)",
    name: "Aashirvaad Atta (5kg)",
    price: 320, salePrice: 249,
    description:
      "100% whole wheat atta milled fine for soft rotis that stay soft for hours.",
    category: "Staples & Pulses", brand: "Aashirvaad",
  },
  {
    from: "Full Cream Milk (1L)",
    name: "Amul Taaza Milk (1L)",
    price: 70, salePrice: 65,
    description:
      "Toned homogenised milk, chilled through the entire delivery chain.",
    category: "Dairy & Breakfast", brand: "Amul",
  },
  {
    from: "Iodised Salt (1kg)",
    name: "Tata Salt (1kg)",
    price: 24, salePrice: 20,
    description: "Vacuum-evaporated iodised salt, free-flowing and pure.",
    category: "Staples & Pulses", brand: "Tata",
  },
  {
    //? we did not have a sunflower oil, so this one gets created
    from: "Fortune Sunflower Oil (1L)",
    name: "Fortune Sunflower Oil (1L)",
    price: 150, salePrice: 129,
    description:
      "Light, refined sunflower oil rich in vitamins A, D and E.",
    category: "Staples & Pulses", brand: "Fortune",
    stock: 50,
    images: [{ url: OIL_IMAGE, asset_id: "seed-fortune-oil", public_id: "seed-fortune-oil" }],
  },
  {
    from: "Onion Red (1kg)",
    name: "Onion (1kg)",
    price: 46, salePrice: 38,
    description: "Firm, dry-skin onions sorted by size for even cooking.",
    category: "Fruits & Vegetables", brand: "Farm Fresh",
  },
  {
    from: "Tomato Hybrid (500g)",
    name: "Tomato Hybrid (1kg)",
    price: 40, salePrice: 32,
    description: "Ripe hybrid tomatoes, sorted for firmness and colour.",
    category: "Fruits & Vegetables", brand: "Farm Fresh",
  },
  {
    from: "Banana Robusta (1kg)",
    name: "Banana Robusta (6 pcs)",
    price: 62, salePrice: 54,
    description:
      "Naturally ripened Robusta bananas, delivered just before peak sweetness.",
    category: "Fruits & Vegetables", brand: "Green Leaf",
  },
];

const run = async () => {
  await connectDB();

  for (let item of items) {
    const { from, ...fields } = item;

    //? look for the old name first, then the new one (so re-running is safe)
    const found =
      (await ProductModel.findOne({ name: from })) ||
      (await ProductModel.findOne({ name: fields.name }));

    if (found) {
      //? keep the picture and the stock we already have
      const update = { ...fields };
      delete update.images;
      if (!fields.stock) delete update.stock;

      await ProductModel.updateOne({ _id: found._id }, { $set: update });
      console.log(`updated  ${from} -> ${fields.name}  ₹${fields.salePrice}`);
    } else {
      await ProductModel.create({ stock: 40, images: [], ...fields });
      console.log(`created  ${fields.name}  ₹${fields.salePrice}`);
    }
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
