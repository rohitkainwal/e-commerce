//? one photo per category, used for the round tiles on the home page.
//? every picture below was opened and checked, so the photo actually
//? matches the aisle it sits on.

//? free unsplash photos
const unsplash = (id) =>
  `https://images.unsplash.com/photo-${id}?w=500&q=80&auto=format&fit=crop`;

const images = {
  "fruits & vegetables": unsplash("1488459716781-31db52582fe9"), //? market vegetable stall
  "dairy & breakfast": unsplash("1550583724-b2692b85b150"), //? milk being poured
  "bakery & cakes": unsplash("1549931319-a545dcf3bc73"), //? sliced bread loaf
  "meat & seafood": unsplash("1607623814075-e51df1bdc82f"), //? meat and sausages board
  beverages: unsplash("1600271886742-f049cd451bba"), //? glass of orange juice
  "frozen foods": unsplash("1497034825429-c343d7c6a68f"), //? ice cream cone

  //? these four are creative commons photos from flickr (openverse)
  "staples & pulses":
    "https://live.staticflickr.com/6182/6121427720_bde3e8dc66_b.jpg", //? bowl of basmati rice
  "snacks & munchies":
    "https://live.staticflickr.com/3154/2990515699_a8650406a0_b.jpg", //? bowl of potato chips
  "personal care":
    "https://live.staticflickr.com/65535/11693757123_3dae068266_b.jpg", //? toothbrush with paste
  "household needs":
    "https://live.staticflickr.com/4194/34517609932_d59ff155c8_b.jpg", //? basket of cleaning supplies
};

//? if someone adds a brand new category from the admin panel, it gets this one
const fallback = unsplash("1542838132-92c53300491e");

export const categoryImage = (category = "") =>
  images[category.toLowerCase().trim()] || fallback;

//? the order the tiles should appear in on the home page.
//? anything not listed here just goes at the end.
const order = [
  //? the first seven are the tiles shown on the home page, same as the design
  "Fruits & Vegetables",
  "Dairy & Breakfast",
  "Staples & Pulses",
  "Snacks & Munchies",
  "Beverages",
  "Personal Care",
  "Household Needs",
  //? the rest are reachable from "Shop by Category" and the products page
  "Bakery & Cakes",
  "Meat & Seafood",
  "Frozen Foods",
];

export const sortCategories = (list = []) =>
  [...list].sort((a, b) => {
    const ai = order.indexOf(a);
    const bi = order.indexOf(b);
    //? -1 means it is not in the list above, push those to the bottom
    return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
  });
