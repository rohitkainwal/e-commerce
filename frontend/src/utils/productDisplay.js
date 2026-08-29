//? the cards put the pack size on its own line, and product names end with
//? it in brackets --> "Apple Royal Gala (1kg)" => title + "1kg"
const BRACKET = /\s\(([^)]+)\)$/;

//? older names that were typed without brackets, e.g. "Rolled Oats 1kg".
//? admin can still add a product that way, so keep handling it.
const PLAIN_SIZE = /\s(\d+(?:\.\d+)?\s?(?:g|kg|ml|l|gm))$/i;
const PLAIN_PACK = /\s\((Pack of \d+|\d+ pc)\)$/i;

//? what counts as a pack size inside the brackets --> 1kg, 500ml, 6 pcs, 4 items
const IS_SIZE = /^(\d+(?:\.\d+)?\s?(?:g|kg|ml|l|gm)|\d+\s?(?:pcs?|items?)|Pack of \d+)$/i;

export const splitName = (name = "") => {
  let title = name;
  let size = "";

  const b = title.match(BRACKET);
  if (b && IS_SIZE.test(b[1].trim())) {
    size = b[1].trim();
    title = title.replace(BRACKET, "");
    return { title: title.trim(), size };
  }

  const s = title.match(PLAIN_SIZE);
  if (s) {
    size = s[1].replace(/\s+/g, " ").toLowerCase();
    title = title.replace(PLAIN_SIZE, "");
  } else {
    const p = title.match(PLAIN_PACK);
    if (p) {
      size = p[1];
      title = title.replace(PLAIN_PACK, "");
    }
  }
  return { title: title.trim(), size };
};

//? soft pastel behind every photo, like the reference site.
//? picked from the id so the same product always gets the same colour
const TINTS = [
  "#fce9ec",
  "#e4edf7",
  "#fdf0e3",
  "#f2ecf9",
  "#e7f3ea",
  "#fbefd9",
];

export const tintFor = (id = "") => {
  let sum = 0;
  for (let i = 0; i < id.length; i++) sum += id.charCodeAt(i);
  return TINTS[sum % TINTS.length];
};

//? small delivery promise shown above the name
export const deliveryText = (stock) => (stock > 0 ? "60 MINS" : "2:30 AM");

//? a pack shot is a cut out picture of the packet itself, sitting on a plain
//? background. we keep ours in frontend/public, so the url starts with a "/"
//? instead of https. these must not be cropped or the packet gets sliced.
export const isPackShot = (url = "") => url.startsWith("/");
