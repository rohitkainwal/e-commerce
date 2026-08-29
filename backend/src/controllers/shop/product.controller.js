import expressAsyncHandler from "express-async-handler";
import ProductModel from "../../models/product.model.js";
import ApiResponse from "../../utils/ApiResponse.util.js";
import CustomError from "../../utils/CustomError.util.js";
import { escapeRegex } from "../../utils/escapeRegex.util.js";

export const fetchProducts = expressAsyncHandler(async (req, res, next) => {
  //! these were const before and i was reassigning them, that was throwing error
  let {
    category = "",
    brand = "",
    sortBy,
    minPrice = 0,
    maxPrice = Number.MAX_SAFE_INTEGER,
  } = req.query;

  //? query params always come as string, so converting them
  minPrice = Number(minPrice) || 0;
  maxPrice = Number(maxPrice) || Number.MAX_SAFE_INTEGER;

  let filterObject = {};
  let sortObject = {};

  //? some products are saved as "Mobiles" and some as "mobiles",
  //? so matching without caring about the case
  const caseInsensitiveList = (value) =>
    value
      .split(",")
      .filter((ele) => ele.trim().length > 0)
      .map((ele) => new RegExp(`^${escapeRegex(ele.trim())}$`, "i"));

  if (category.length > 0) {
    filterObject.category = { $in: caseInsensitiveList(category) };
  }
  if (brand.length > 0) {
    filterObject.brand = { $in: caseInsensitiveList(brand) };
  }

  //! $and does not work like this inside a field, it has to be $gte and $lte directly
  filterObject.price = { $gte: minPrice, $lte: maxPrice };

  if (sortBy == "lowToHigh") {
    sortObject.price = 1;
  }
  if (sortBy == "highToLow") {
    sortObject.price = -1;
  }
  if (sortBy == "aToZ") {
    sortObject.name = 1;
  }
  if (sortBy == "zToA") {
    sortObject.name = -1;
  }

  sortObject.createdAt = -1;

  let products = await ProductModel.find(filterObject).sort(sortObject);

  //? not sending 404 here, empty list is a normal thing when filters match nothing.
  //? frontend will just show "no products found"
  new ApiResponse(200, "Products Fetched Successfully", products, {
    total: products.length,
  }).send(res);
});

export const fetchProduct = expressAsyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const product = await ProductModel.findById(id);
  if (!product) return next(new CustomError(404, "Product Not Found"));

  new ApiResponse(200, "Product Fetched Successfully", product).send(res);
});

//~ frontend needs the list of categories and brands to show the filter checkboxes
export const getFilters = expressAsyncHandler(async (req, res, next) => {
  const categories = await ProductModel.distinct("category");
  const brands = await ProductModel.distinct("brand");

  new ApiResponse(200, "Filters Fetched Successfully", {
    categories,
    brands,
  }).send(res);
});

export const searchProducts = expressAsyncHandler(async (req, res, next) => {
  const keyword = req.query.keyword;

  if (!keyword) return next(new CustomError(400, "Please enter something to search"));

  let pattern = new RegExp(escapeRegex(keyword), "i");

  let products = await ProductModel.find({
    $or: [
      { name: { $regex: pattern } },
      { description: { $regex: pattern } },
      { category: { $regex: pattern } },
      { brand: { $regex: pattern } },
    ],
  });

  new ApiResponse(200, "Products Fetched Successfully", products, {
    total: products.length,
  }).send(res);
});

// let filterObject = {
//   category: { $in: ["electronics"] },
//   price: { $gte: 100, $lte: 5000 },
// };
