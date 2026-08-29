import dotenv from "dotenv";
dotenv.config({ quiet: true });

import mongoose from "mongoose";
import { connectDB } from "../config/database.config.js";
import ProductModel from "../models/product.model.js";

//? run this with --> npm run seed
//? images are free photos from unsplash, they are not uploaded on cloudinary.
//? that is why public_id starts with "seed-", so we know these are not ours.

const img = (id) => ({
  url: `https://images.unsplash.com/photo-${id}?w=600&q=80&auto=format&fit=crop`,
  asset_id: `seed-${id}`,
  public_id: `seed-${id}`,
});

//? for images that are not from unsplash (openverse / flickr, cc licensed)
const ext = (url) => ({ url, asset_id: `seed-${url.slice(-18)}`, public_id: `seed-${url.slice(-18)}` });

const products = [
  // ---------- fruits & vegetables ----------
  {
    name: "Avocado Hass (3 pcs)",
    description:
      "creamy hass avocados, ripened just right. perfect for toast, salads and guacamole.",
    price: 399, salePrice: 329, category: "Fruits & Vegetables", brand: "Farm Fresh",
    stock: 40, images: [img("1523049673857-eb18f1d7b578")],
  },
  {
    name: "Strawberry Fresh (250g)",
    description:
      "hand picked sweet strawberries from the hills. great for desserts and smoothies.",
    price: 299, salePrice: 249, category: "Fruits & Vegetables", brand: "Farm Fresh",
    stock: 25, images: [img("1518635017498-87f514b751ba")],
  },
  {
    name: "Tomato Hybrid (1kg)",
    description:
      "Ripe hybrid tomatoes, sorted for firmness and colour.",
    price: 40, salePrice: 32, category: "Fruits & Vegetables", brand: "Farm Fresh",
    stock: 60, images: [img("1592924357228-91a4daadcfea")],
  },
  {
    name: "Spinach Baby (200g)",
    description:
      "tender baby spinach leaves, washed and ready to eat. rich in iron and vitamins.",
    price: 129, salePrice: 99, category: "Fruits & Vegetables", brand: "Green Leaf",
    stock: 35, images: [img("1576045057995-568f588f82fb")],
  },
  {
    name: "Apple Royal Gala (1kg)",
    description:
      "Crisp, juicy Royal Gala apples hand-picked and packed the same morning. Great for lunchboxes, salads and juicing.",
    price: 189, salePrice: 149, category: "Fruits & Vegetables", brand: "Orchard Gold",
    stock: 45, images: [ext("https://images.rawpixel.com/editor_1024/cHJpdmF0ZS9zdGF0aWMvaW1hZ2Uvd2Vic2l0ZS8yMDIyLTA0L2xyL2ZyYXBwbGVfZnJ1aXRfZm9vZF83MDAwMDUtaW1hZ2Uta3liYzl3a3guanBn.jpg")],
  },
  {
    name: "Banana Robusta (6 pcs)",
    description:
      "Naturally ripened Robusta bananas, delivered just before peak sweetness.",
    price: 62, salePrice: 54, category: "Fruits & Vegetables", brand: "Green Leaf",
    stock: 80, images: [img("1571771894821-ce9b6c11b08e")],
  },

  // ---------- bakery ----------
  {
    name: "Sourdough Loaf Artisan (400g)",
    description:
      "slow fermented sourdough with a crisp crust and soft centre. baked fresh every morning.",
    price: 299, salePrice: 259, category: "Bakery & Cakes", brand: "Boulangerie",
    stock: 15, images: [img("1549931319-a545dcf3bc73")],
  },
  {
    name: "Butter Croissants (4 pcs)",
    description:
      "flaky all butter croissants, layered by hand. best served warm with jam.",
    price: 349, salePrice: 299, category: "Bakery & Cakes", brand: "Boulangerie",
    stock: 20, images: [img("1555507036-ab1f4038808a")],
  },
  {
    name: "French Baguette (250g)",
    description:
      "classic french baguette with a golden crust. perfect with soup and cheese.",
    price: 179, salePrice: 149, category: "Bakery & Cakes", brand: "Boulangerie",
    stock: 18, images: [img("1509440159596-0249088772ff")],
  },

  // ---------- dairy & breakfast ----------
  {
    name: "Cheddar Cheese Aged (200g)",
    description:
      "sharp aged cheddar with a rich nutty finish. great on toast or in a sandwich.",
    price: 549, salePrice: 479, category: "Dairy & Breakfast", brand: "Creamery",
    stock: 22, images: [img("1486297678162-eb2a19b0a32d")],
  },
  {
    name: "Amul Taaza Milk (1L)",
    description:
      "Toned homogenised milk, chilled through the entire delivery chain.",
    price: 70, salePrice: 65, category: "Dairy & Breakfast", brand: "Amul",
    stock: 50, images: [ext("/FoP-Taaza-Milk-1L.png")],
  },
  {
    name: "Butter Cultured (250g)",
    description:
      "slow churned cultured butter with a rich creamy taste. unsalted.",
    price: 399, salePrice: 349, category: "Dairy & Breakfast", brand: "Creamery",
    stock: 28, images: [img("1589985270826-4b7bb135bc9d")],
  },
  {
    name: "Eggs Free Range (12 pcs)",
    description:
      "free range eggs from happy hens. thick shells and deep orange yolks.",
    price: 199, salePrice: 169, category: "Dairy & Breakfast", brand: "Farm Fresh",
    stock: 4, images: [img("1518569656558-1f25e69d93d7")],
  },

  // ---------- staples & pulses ----------
  {
    name: "Olive Oil Extra Virgin (500ml)",
    description:
      "cold pressed extra virgin olive oil from spain. fruity with a peppery finish.",
    price: 899, salePrice: 749, category: "Staples & Pulses", brand: "Global Pantry",
    stock: 30, images: [img("1474979266404-7eaacbcd87c5")],
  },
  {
    name: "Penne Pasta Italian (500g)",
    description:
      "bronze cut penne made from durum wheat semolina. holds sauce beautifully.",
    price: 249, salePrice: 199, category: "Staples & Pulses", brand: "Global Pantry",
    stock: 40, images: [img("1551462147-ff29053bfc14")],
  },
  {
    name: "Forest Honey Raw (500g)",
    description:
      "unprocessed raw forest honey, thick and aromatic. straight from the hive.",
    price: 549, salePrice: 449, category: "Staples & Pulses", brand: "Nature Store",
    stock: 26, images: [img("1587049352851-8d4e89133924")],
  },
  {
    name: "Almonds California (500g)",
    description:
      "premium california almonds, crunchy and fresh. a wholesome daily snack.",
    price: 699, salePrice: 599, category: "Snacks & Munchies", brand: "Nature Store",
    stock: 33, images: [img("1508061253366-f7da158b6d46")],
  },
  {
    name: "Dark Chocolate 70% (100g)",
    description:
      "single origin 70 percent dark chocolate. intense cocoa with a smooth finish.",
    price: 449, salePrice: 379, category: "Snacks & Munchies", brand: "Indulgence",
    stock: 3, images: [img("1511381939415-e44015466834")],
  },

  // ---------- beverages ----------
  {
    name: "Coffee Beans Arabica (250g)",
    description:
      "medium roast arabica beans with notes of chocolate and caramel. whole bean.",
    price: 649, salePrice: 549, category: "Beverages", brand: "Roasters Co",
    stock: 24, images: [img("1559056199-641a0ac8b55e")],
  },
  {
    name: "Orange Juice Cold Pressed (1L)",
    description:
      "100 percent cold pressed orange juice. no sugar and no preservatives added.",
    price: 299, salePrice: 249, category: "Beverages", brand: "Farm Fresh",
    stock: 20, images: [img("1600271886742-f049cd451bba")],
  },
  {
    name: "Green Tea Leaves (100g)",
    description:
      "high grown green tea leaves, light and refreshing. rich in antioxidants.",
    price: 399, salePrice: 329, category: "Beverages", brand: "Nature Store",
    stock: 0, images: [img("1627435601361-ec25f5b1d0e5")],
  },

  // ---------- meat & seafood ----------
  {
    name: "Salmon Fillet Atlantic (300g)",
    description:
      "fresh atlantic salmon fillet, boneless and skin on. rich in omega 3.",
    price: 1299, salePrice: 1099, category: "Meat & Seafood", brand: "Ocean Catch",
    stock: 12, images: [img("1519708227418-c8fd9a32b7a2")],
  },

  // ---------- more fresh produce ----------
  {
    name: "Broccoli Fresh (500g)",
    description:
      "firm green broccoli florets, freshly cut. great for stir fry and soups.",
    price: 149, salePrice: 119, category: "Fruits & Vegetables", brand: "Green Leaf",
    stock: 38, images: [img("1459411621453-7b03977f4bfc")],
  },
  {
    name: "Carrot Fresh (1kg)",
    description:
      "sweet crunchy carrots straight from the farm. good for salads and juices.",
    price: 99, salePrice: 79, category: "Fruits & Vegetables", brand: "Farm Fresh",
    stock: 55, images: [img("1598170845058-32b9d6a5da37")],
  },
  {
    name: "Blueberry Fresh (125g)",
    description:
      "plump juicy blueberries packed with antioxidants. perfect on yogurt and pancakes.",
    price: 449, salePrice: 379, category: "Fruits & Vegetables", brand: "Orchard Gold",
    stock: 16, images: [img("1498557850523-fd3d118b962e")],
  },
  {
    name: "Lemon Fresh (500g)",
    description:
      "tangy juicy lemons with thin skin. a must have for cooking and fresh lemonade.",
    price: 89, salePrice: 69, category: "Fruits & Vegetables", brand: "Farm Fresh",
    stock: 48, images: [img("1590502593747-42a996133562")],
  },
  {
    name: "Capsicum Mixed (500g)",
    description:
      "colourful red yellow and green bell peppers. crunchy and slightly sweet.",
    price: 199, salePrice: 159, category: "Fruits & Vegetables", brand: "Green Leaf",
    stock: 30, images: [img("1563565375-f3fdfdbefa83")],
  },
  {
    name: "Mushroom Button (200g)",
    description:
      "fresh white button mushrooms, cleaned and packed. great in pasta and curries.",
    price: 129, salePrice: 99, category: "Fruits & Vegetables", brand: "Green Leaf",
    stock: 5, images: [ext("https://live.staticflickr.com/7052/6837117278_4bb4b43eb7_b.jpg")],
  },
  {
    name: "Grapes Green Seedless (500g)",
    description:
      "sweet seedless green grapes, washed and ready to eat. a great lunchbox snack.",
    price: 199, salePrice: 169, category: "Fruits & Vegetables", brand: "Orchard Gold",
    stock: 27, images: [ext("https://live.staticflickr.com/44/190418664_eaf11e7a62_b.jpg")],
  },

  // ---------- more bakery ----------
  {
    name: "Chocolate Chip Cookies (8 pcs)",
    description:
      "soft baked cookies loaded with dark chocolate chips. baked fresh daily.",
    price: 299, salePrice: 249, category: "Snacks & Munchies", brand: "Boulangerie",
    stock: 21, images: [img("1499636136210-6f4ee915583e")],
  },
  {
    name: "Blueberry Muffins (6 pcs)",
    description:
      "moist muffins packed with real blueberries. best with morning coffee.",
    price: 349, salePrice: 289, category: "Bakery & Cakes", brand: "Boulangerie",
    stock: 14, images: [img("1607958996333-41aef7caefaa")],
  },

  // ---------- more dairy ----------
  {
    name: "Greek Yogurt (400g)",
    description:
      "thick creamy greek yogurt, high in protein. no added sugar.",
    price: 249, salePrice: 199, category: "Dairy & Breakfast", brand: "Creamery",
    stock: 32, images: [img("1488477181946-6428a0291777")],
  },
  {
    name: "Blue Cheese (200g)",
    description:
      "creamy blue cheese with a sharp tangy bite. lovely on crackers and in salads.",
    price: 449, salePrice: 389, category: "Dairy & Breakfast", brand: "Creamery",
    stock: 18, images: [img("1452195100486-9cc805987862")],
  },

  // ---------- more pantry ----------
  {
    name: "Basmati Rice Aged (1kg)",
    description:
      "long grain aged basmati rice. cooks fluffy with a lovely aroma.",
    price: 299, salePrice: 249, category: "Staples & Pulses", brand: "Global Pantry",
    stock: 44, images: [img("1586201375761-83865001e31c")],
  },
  {
    name: "Granola with Nuts (400g)",
    description:
      "crunchy baked granola with almonds and honey. a quick wholesome breakfast.",
    price: 499, salePrice: 419, category: "Dairy & Breakfast", brand: "Nature Store",
    stock: 23, images: [ext("https://live.staticflickr.com/5256/5537372504_df5b0d436d_b.jpg")],
  },
  {
    name: "Black Pepper Whole (100g)",
    description:
      "whole black peppercorns, strong and aromatic. grind fresh over any dish.",
    price: 249, salePrice: 199, category: "Staples & Pulses", brand: "Global Pantry",
    stock: 2, images: [img("1596040033229-a9821ebd058d")],
  },

  // ---------- more beverages ----------
  {
    name: "Masala Chai Blend (250g)",
    description:
      "strong assam tea blended with cardamom ginger and cinnamon. makes proper chai.",
    price: 349, salePrice: 289, category: "Beverages", brand: "Nature Store",
    stock: 36, images: [img("1571934811356-5cc061b6821f")],
  },
  {
    name: "Sparkling Water (6 pcs)",
    description:
      "lightly carbonated sparkling water. crisp and refreshing, zero calories.",
    price: 399, salePrice: 329, category: "Beverages", brand: "Global Pantry",
    stock: 40, images: [ext("https://live.staticflickr.com/8175/7985698964_91f1467242_b.jpg")],
  },
  {
    name: "Coffee Dark Roast (500g)",
    description:
      "bold dark roast coffee with a smoky finish. ground for filter and french press.",
    price: 799, salePrice: 649, category: "Beverages", brand: "Roasters Co",
    stock: 19, images: [img("1447933601403-0c6688de566e")],
  },
  {
    name: "Earl Grey Tea Bags (50 pcs)",
    description:
      "classic earl grey with bergamot oil. light floral and very soothing.",
    price: 299, salePrice: 249, category: "Beverages", brand: "Nature Store",
    stock: 29, images: [img("1544787219-7f47ccb76574")],
  },

  // ---------- more butchery & seafood ----------
  {
    name: "Chicken Breast Boneless (500g)",
    description:
      "fresh boneless skinless chicken breast. lean protein, cleaned and trimmed.",
    price: 449, salePrice: 379, category: "Meat & Seafood", brand: "Ocean Catch",
    stock: 17, images: [img("1604503468506-a8da13d82791")],
  },
  {
    name: "Prawns Tiger (300g)",
    description:
      "large tiger prawns, deveined and cleaned. sweet and firm, ready to cook.",
    price: 899, salePrice: 749, category: "Meat & Seafood", brand: "Ocean Catch",
    stock: 0, images: [img("1565680018434-b513d5e5fd47")],
  },
  // ---------- fresh produce (batch 3) ----------
  {
    name: "Onion (1kg)",
    description:
      "Firm, dry-skin onions sorted by size for even cooking.",
    price: 46, salePrice: 38, category: "Fruits & Vegetables", brand: "Farm Fresh",
    stock: 70, images: [img("1580201092675-a0a6a6cafbb1")],
  },
  {
    name: "Cucumber English (500g)",
    description:
      "crisp seedless cucumber with thin skin. cooling and great in salads.",
    price: 69, salePrice: 49, category: "Fruits & Vegetables", brand: "Green Leaf",
    stock: 42, images: [img("1449300079323-02e209d9d3a6")],
  },
  {
    name: "Pineapple Sweet (1 pc)",
    description:
      "juicy golden pineapple, naturally sweet and tangy. ready to slice.",
    price: 149, salePrice: 119, category: "Fruits & Vegetables", brand: "Orchard Gold",
    stock: 24, images: [img("1550258987-190a2d41a8ba")],
  },
  {
    name: "Watermelon (1 pc)",
    description:
      "big juicy watermelon, deep red inside. the best summer cooler.",
    price: 129, salePrice: 99, category: "Fruits & Vegetables", brand: "Orchard Gold",
    stock: 15, images: [img("1587049352846-4a222e784d38")],
  },
  {
    name: "Orange Nagpur (1kg)",
    description:
      "sweet juicy nagpur oranges, easy to peel. loaded with vitamin c.",
    price: 199, salePrice: 159, category: "Fruits & Vegetables", brand: "Orchard Gold",
    stock: 34, images: [img("1547514701-42782101795e")],
  },
  {
    name: "Potato Baby (1kg)",
    description:
      "small tender baby potatoes with thin skin. perfect for roasting.",
    price: 99, salePrice: 79, category: "Fruits & Vegetables", brand: "Farm Fresh",
    stock: 58, images: [img("1518977676601-b53f82aba655")],
  },
  {
    name: "Sweet Corn (2 pcs)",
    description:
      "tender sweet corn cobs, freshly picked. lovely boiled or grilled.",
    price: 89, salePrice: 69, category: "Fruits & Vegetables", brand: "Green Leaf",
    stock: 31, images: [img("1551754655-cd27e38d2076")],
  },
  {
    name: "Garlic Fresh (250g)",
    description:
      "fresh garlic bulbs with strong aroma. a must have in every kitchen.",
    price: 89, salePrice: 69, category: "Fruits & Vegetables", brand: "Farm Fresh",
    stock: 46, images: [img("1540148426945-6cf22a6b2383")],
  },
  {
    name: "Ginger Fresh (200g)",
    description:
      "firm juicy ginger root. great for chai, curries and kadha.",
    price: 69, salePrice: 49, category: "Fruits & Vegetables", brand: "Farm Fresh",
    stock: 4, images: [ext("https://live.staticflickr.com/4479/37310945730_8f7e9eb5b8_b.jpg")],
  },

  // ---------- bakery (batch 3) ----------
  {
    name: "Pizza Base Wood Fired (2 pcs)",
    description:
      "thin crust pizza bases baked in a wood fired oven. just add toppings.",
    price: 249, salePrice: 199, category: "Bakery & Cakes", brand: "Boulangerie",
    stock: 26, images: [img("1513104890138-7c749659a591")],
  },
  {
    name: "Glazed Donuts (6 pcs)",
    description:
      "soft glazed donuts, freshly fried. a sweet treat for the evening.",
    price: 299, salePrice: 249, category: "Bakery & Cakes", brand: "Boulangerie",
    stock: 12, images: [ext("https://live.staticflickr.com/7346/12940870385_54cb08ebb5_b.jpg")],
  },

  // ---------- dairy (batch 3) ----------
  {
    name: "Paneer Butter Masala (300g)",
    description:
      "ready to heat paneer butter masala in a rich tomato gravy. serve with naan or rice.",
    price: 129, salePrice: 99, category: "Dairy & Breakfast", brand: "Creamery",
    stock: 37, images: [img("1631452180519-c014fe946bc7")],
  },

  // ---------- frozen ----------
  {
    name: "Vanilla Ice Cream (500ml)",
    description:
      "creamy vanilla ice cream made with real vanilla beans. keep frozen.",
    price: 299, salePrice: 249, category: "Frozen Foods", brand: "Creamery",
    stock: 20, images: [img("1497034825429-c343d7c6a68f")],
  },

  // ---------- breakfast ----------
  {
    name: "Rolled Oats (1kg)",
    description:
      "wholegrain rolled oats, high in fibre. cooks in five minutes.",
    price: 349, salePrice: 279, category: "Dairy & Breakfast", brand: "Nature Store",
    stock: 41, images: [ext("https://live.staticflickr.com/8355/8272544100_3a5cf49ff1.jpg")],
  },
  {
    name: "Corn Flakes (500g)",
    description:
      "crisp golden corn flakes. serve with cold milk and fresh fruit.",
    price: 299, salePrice: 239, category: "Dairy & Breakfast", brand: "Global Pantry",
    stock: 33, images: [img("1521483451569-e33803c0330c")],
  },

  // ---------- snacks ----------
  {
    name: "Potato Chips Salted (150g)",
    description:
      "thin crispy potato chips with just the right salt. sealed for freshness.",
    price: 99, salePrice: 79, category: "Snacks & Munchies", brand: "Indulgence",
    stock: 64, images: [img("1566478989037-eec170784d0b")],
  },

  // ---------- butchery & seafood (batch 3) ----------
  {
    name: "Chicken Sausages (250g)",
    description:
      "juicy chicken sausages, lightly smoked. ready in five minutes on a pan.",
    price: 349, salePrice: 289, category: "Meat & Seafood", brand: "Ocean Catch",
    stock: 22, images: [img("1607623814075-e51df1bdc82f")],
  },

  // ---------- personal care ----------
  {
    name: "Bath Soap Bars (3 pcs)",
    description:
      "gentle moisturising soap bars with a mild fragrance. kind on everyday skin.",
    price: 149, salePrice: 129, category: "Personal Care", brand: "Pure Care",
    stock: 50, images: [ext("https://live.staticflickr.com/4022/4263958356_bacf7072ca_b.jpg")],
  },
  {
    name: "Herbal Shampoo (340ml)",
    description:
      "everyday herbal shampoo for soft, clean hair. no harsh sulphates.",
    price: 399, salePrice: 329, category: "Personal Care", brand: "Pure Care",
    stock: 32, images: [ext("https://live.staticflickr.com/2624/4131945299_05738f14e6_b.jpg")],
  },
  {
    name: "Body Lotion (200ml)",
    description:
      "light body lotion that soaks in fast and keeps skin soft all day.",
    price: 299, salePrice: 249, category: "Personal Care", brand: "Pure Care",
    stock: 28, images: [ext("https://live.staticflickr.com/4042/4323509165_a3d64118de_m.jpg")],
  },
  {
    name: "Toothpaste with Brush (150g)",
    description:
      "mint toothpaste with a soft bristle brush free inside the pack.",
    price: 149, salePrice: 119, category: "Personal Care", brand: "Pure Care",
    stock: 60, images: [ext("https://live.staticflickr.com/65535/11693757123_3dae068266_b.jpg")],
  },

  // ---------- household needs ----------
  {
    name: "Dishwash Liquid (750ml)",
    description:
      "lemon dishwash gel that cuts grease quickly and rinses off clean.",
    price: 199, salePrice: 165, category: "Household Needs", brand: "Home Shine",
    stock: 44, images: [ext("https://live.staticflickr.com/2780/4291373768_c51bec0b5f_b.jpg")],
  },
  {
    name: "Multi Surface Cleaner (500ml)",
    description:
      "spray cleaner for kitchen slabs, tables and tiles. wipes off without streaks.",
    price: 249, salePrice: 199, category: "Household Needs", brand: "Home Shine",
    stock: 36, images: [ext("https://live.staticflickr.com/65535/48231563162_c6e66e7ea0_b.jpg")],
  },
  {
    name: "Toilet Rolls (4 pcs)",
    description:
      "soft two ply toilet rolls, 200 sheets each. everyday bathroom essential.",
    price: 199, salePrice: 169, category: "Household Needs", brand: "Home Shine",
    stock: 55, images: [ext("https://live.staticflickr.com/65535/49713536482_374ddb500b_b.jpg")],
  },
  {
    name: "Household Cleaning Combo (4 items)",
    description:
      "one box with dishwash, surface spray, gloves and a scrub cloth. saves a trip.",
    price: 599, salePrice: 499, category: "Household Needs", brand: "Home Shine",
    stock: 18, images: [ext("https://live.staticflickr.com/4194/34517609932_d59ff155c8_b.jpg")],
  },

  // ---------- frozen foods ----------
  {
    name: "Green Peas Frozen (500g)",
    description:
      "sweet green peas, frozen right after picking. straight into pulao or curry.",
    price: 99, salePrice: 79, category: "Frozen Foods", brand: "Green Leaf",
    stock: 42, images: [ext("https://live.staticflickr.com/8173/8042532490_7b81a582ac_b.jpg")],
  },


  // ---------- everyday indian staples ----------
  {
    name: "Aashirvaad Atta (5kg)",
    description:
      "100% whole wheat atta milled fine for soft rotis that stay soft for hours.",
    price: 320, salePrice: 249, category: "Staples & Pulses", brand: "Aashirvaad",
    stock: 40, images: [ext("/aataxmultigrain.webp")],
  },
  {
    name: "Toor Dal (1kg)",
    description:
      "cleaned yellow toor dal. cooks soft and makes the everyday dal at home.",
    price: 190, salePrice: 159, category: "Staples & Pulses", brand: "Global Pantry",
    stock: 45, images: [ext("https://images.rawpixel.com/editor_1024/czNmcy1wcml2YXRlL3Jhd3BpeGVsX2ltYWdlcy93ZWJzaXRlX2NvbnRlbnQvbHIvcHg5MDk1NjItaW1hZ2Uta3d2dXU0MzMuanBn.jpg")],
  },
  {
    name: "Tata Salt (1kg)",
    description:
      "Vacuum-evaporated iodised salt, free-flowing and pure.",
    price: 24, salePrice: 20, category: "Staples & Pulses", brand: "Tata",
    stock: 80, images: [ext("/Tata_Salt_-_North_Central_Recyclable_AH-IN-JB-RP-BH-PU-SG_1_Kg_FOP-removebg-preview.webp")],
  },
  {
    name: "Sugar Refined (1kg)",
    description:
      "fine grain refined sugar for tea, sweets and everyday baking.",
    price: 65, salePrice: 52, category: "Staples & Pulses", brand: "Global Pantry",
    stock: 65, images: [ext("https://images.rawpixel.com/editor_1024/czNmcy1wcml2YXRlL3Jhd3BpeGVsX2ltYWdlcy93ZWJzaXRlX2NvbnRlbnQvbHIvd2s2MTQ2MzU2MS1pbWFnZS1rcDZkOHBqeC5qcGc.jpg")],
  },

  {
    name: "Fortune Sunflower Oil (1L)",
    description:
      "Light, refined sunflower oil rich in vitamins A, D and E.",
    price: 150, salePrice: 129, category: "Staples & Pulses", brand: "Fortune",
    stock: 50, images: [ext("https://images.rawpixel.com/editor_1024/czNmcy1wcml2YXRlL3Jhd3BpeGVsX2ltYWdlcy93ZWJzaXRlX2NvbnRlbnQvbHIvZnJmb29kX29saXZlX29pbF9saXF1aWRfMC1pbWFnZS1reWJkbXZ4eC5qcGc.jpg")],
  },
];



const seedProducts = async () => {
  await connectDB();

  let added = 0;
  let skipped = 0;

  for (let item of products) {
    //? name is unique in the schema, so skip the ones already added
    const exists = await ProductModel.findOne({ name: item.name });
    if (exists) {
      skipped++;
      continue;
    }
    await ProductModel.create(item);
    added++;
  }

  console.log(`Products added: ${added}, already there: ${skipped}`);
  await mongoose.connection.close();
  process.exit(0);
};

seedProducts().catch(async (err) => {
  console.log("Seeding failed");
  console.log(err);
  await mongoose.connection.close();
  process.exit(1);
});
