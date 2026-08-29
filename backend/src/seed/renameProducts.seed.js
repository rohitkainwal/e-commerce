import dotenv from "dotenv";
dotenv.config({ quiet: true });

import mongoose from "mongoose";
import { connectDB } from "../config/database.config.js";
import ProductModel from "../models/product.model.js";

//? one time script --> npm run rename-products
//? puts every product on the same naming pattern the design uses:
//?   <item> <variety> (<pack size>)   e.g. "Apple Royal Gala (1kg)"

const renames = {
  "Royal Gala Apples 1kg": "Apple Royal Gala (1kg)",
  "Organic Bananas 1kg": "Banana Robusta (1kg)",
  "Nagpur Oranges 1kg": "Orange Nagpur (1kg)",
  "Vine Ripened Tomatoes 500g": "Tomato Hybrid (500g)",
  "Red Onions 1kg": "Onion Red (1kg)",
  "Baby Potatoes 1kg": "Potato Baby (1kg)",
  "Farm Carrots 1kg": "Carrot Fresh (1kg)",
  "Baby Spinach 200g": "Spinach Baby (200g)",
  "Broccoli 500g": "Broccoli Fresh (500g)",
  "Button Mushrooms 200g": "Mushroom Button (200g)",
  "English Cucumber 500g": "Cucumber English (500g)",
  "Mixed Bell Peppers 500g": "Capsicum Mixed (500g)",
  "Fresh Ginger 200g": "Ginger Fresh (200g)",
  "Garlic 250g": "Garlic Fresh (250g)",
  "Lemons 500g": "Lemon Fresh (500g)",
  "Sweet Corn (Pack of 2)": "Sweet Corn (2 pcs)",
  "Hass Avocado (Pack of 3)": "Avocado Hass (3 pcs)",
  "Sweet Pineapple (1 pc)": "Pineapple Sweet (1 pc)",
  "Seedless Green Grapes 500g": "Grapes Green Seedless (500g)",
  "Fresh Blueberries 125g": "Blueberry Fresh (125g)",
  "Fresh Strawberries 250g": "Strawberry Fresh (250g)",
  "Full Cream Milk 1L": "Full Cream Milk (1L)",
  "Greek Yogurt 400g": "Greek Yogurt (400g)",
  "Cultured Butter 250g": "Butter Cultured (250g)",
  "Aged Cheddar Cheese 200g": "Cheddar Cheese Aged (200g)",
  "Blue Cheese 200g": "Blue Cheese (200g)",
  "Free Range Eggs (Pack of 12)": "Eggs Free Range (12 pcs)",
  "Paneer Butter Masala 300g": "Paneer Butter Masala (300g)",
  "Corn Flakes 500g": "Corn Flakes (500g)",
  "Rolled Oats 1kg": "Rolled Oats (1kg)",
  "Granola with Nuts 400g": "Granola with Nuts (400g)",
  "Aged Basmati Rice 1kg": "Basmati Rice Aged (1kg)",
  "Italian Penne Pasta 500g": "Penne Pasta Italian (500g)",
  "Extra Virgin Olive Oil 500ml": "Olive Oil Extra Virgin (500ml)",
  "Black Peppercorns 100g": "Black Pepper Whole (100g)",
  "Raw Forest Honey 500g": "Forest Honey Raw (500g)",
  "Salted Potato Chips 150g": "Potato Chips Salted (150g)",
  "Dark Chocolate 70% 100g": "Dark Chocolate 70% (100g)",
  "California Almonds 500g": "Almonds California (500g)",
  "Chocolate Chip Cookies (Pack of 8)": "Chocolate Chip Cookies (8 pcs)",
  "Arabica Coffee Beans 250g": "Coffee Beans Arabica (250g)",
  "Dark Roast Coffee 500g": "Coffee Dark Roast (500g)",
  "Earl Grey Tea Bags (Pack of 50)": "Earl Grey Tea Bags (50 pcs)",
  "Green Tea Leaves 100g": "Green Tea Leaves (100g)",
  "Masala Chai Blend 250g": "Masala Chai Blend (250g)",
  "Cold Pressed Orange Juice 1L": "Orange Juice Cold Pressed (1L)",
  "Sparkling Water (Pack of 6)": "Sparkling Water (6 pcs)",
  "Artisan Sourdough Loaf": "Sourdough Loaf Artisan (400g)",
  "French Baguette": "French Baguette (250g)",
  "Blueberry Muffins (Pack of 6)": "Blueberry Muffins (6 pcs)",
  "Butter Croissants (Pack of 4)": "Butter Croissants (4 pcs)",
  "Glazed Donuts (Pack of 6)": "Glazed Donuts (6 pcs)",
  "Wood Fired Pizza Base (Pack of 2)": "Pizza Base Wood Fired (2 pcs)",
  "Chicken Breast Boneless 500g": "Chicken Breast Boneless (500g)",
  "Chicken Sausages 250g": "Chicken Sausages (250g)",
  "Atlantic Salmon Fillet 300g": "Salmon Fillet Atlantic (300g)",
  "Tiger Prawns 300g": "Prawns Tiger (300g)",
  "Frozen Green Peas 500g": "Green Peas Frozen (500g)",
  "Vanilla Ice Cream 500ml": "Vanilla Ice Cream (500ml)",
  "Bath Soap Bars (Pack of 3)": "Bath Soap Bars (3 pcs)",
  "Herbal Shampoo 340ml": "Herbal Shampoo (340ml)",
  "Body Lotion 200ml": "Body Lotion (200ml)",
  "Toothpaste 150g (with Brush)": "Toothpaste with Brush (150g)",
  "Dishwash Liquid 750ml": "Dishwash Liquid (750ml)",
  "Multi Surface Cleaner 500ml": "Multi Surface Cleaner (500ml)",
  "Toilet Rolls (Pack of 4)": "Toilet Rolls (4 pcs)",
  "Household Cleaning Combo": "Household Cleaning Combo (4 items)",
};

const run = async () => {
  await connectDB();

  let done = 0;
  let missing = 0;

  for (let oldName of Object.keys(renames)) {
    const res = await ProductModel.updateOne(
      { name: oldName },
      { $set: { name: renames[oldName] } }
    );
    if (res.matchedCount) done++;
    else missing++;
  }

  console.log(`renamed: ${done}, not found (already renamed?): ${missing}`);
  await mongoose.connection.close();
  process.exit(0);
};

run().catch(async (err) => {
  console.log("Rename failed");
  console.log(err);
  await mongoose.connection.close();
  process.exit(1);
});
