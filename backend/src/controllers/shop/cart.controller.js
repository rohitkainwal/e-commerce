import expressAsyncHandler from "express-async-handler";
import CartModel from "../../models/cart.model.js";
import ProductModel from "../../models/product.model.js";
import ApiResponse from "../../utils/ApiResponse.util.js";
import CustomError from "../../utils/CustomError.util.js";

//? small helper, used by add/remove/get so the total is calculated the same way everywhere
const buildCart = async (userId) => {
  let cart = await CartModel.findOne({ userId }).populate({
    path: "items.productId",
    select: "name price salePrice images brand stock",
  });

  if (!cart) return { items: [], totalAmount: 0, cartId: null };

  //! if a product got deleted by admin, populate gives null, so removing those
  let validItems = cart.items.filter((item) => item.productId);

  let items = validItems.map((item) => ({
    productId: item.productId._id,
    name: item.productId.name,
    price: item.productId.price,
    salePrice: item.productId.salePrice,
    //! images is an array, so images[0].url  (i was writing images.url before)
    url: item.productId.images[0]?.url || "",
    brand: item.productId.brand,
    stock: item.productId.stock,
    quantity: item.quantity,
  }));

  let totalAmount = items.reduce(
    (sum, item) => sum + item.quantity * item.salePrice,
    0
  );

  return { items, totalAmount: Number(totalAmount.toFixed(2)), cartId: cart._id };
};

//! add product, if already exists then update quantity
export const addToCart = expressAsyncHandler(async (req, res, next) => {
  // to add product
  const { productId } = req.body;
  // to get the user's cart
  const userId = req.myUser._id;

  if (!productId) return next(new CustomError(400, "Product Id is required"));

  // wether the product exists
  let product = await ProductModel.findById(productId);
  if (!product) return next(new CustomError(404, "Product Not Found"));

  // get the user's cart if present
  let existingCart = await CartModel.findOne({ userId });
  if (!existingCart) {
    existingCart = await CartModel.create({ userId, items: [] });
  }

  // find if product is already in the cart
  let index = existingCart.items.findIndex((item) => {
    return item.productId.toString() === productId.toString();
  });

  //? checking stock before adding one more
  let currentQty = index === -1 ? 0 : existingCart.items[index].quantity;
  if (currentQty + 1 > product.stock)
    return next(new CustomError(400, `Only ${product.stock} left in stock`));

  if (index == -1) {
    existingCart.items.push({ productId, quantity: 1 });
  } else {
    existingCart.items[index].quantity += 1;
  }
  await existingCart.save();

  //! total was NaN before, because salePrice is not saved on the cart item.
  //! it comes from the product, so calculating it after populate
  const cart = await buildCart(userId);

  new ApiResponse(201, "Product Added Successfully", cart.items, {
    totalAmount: cart.totalAmount,
    cartId: cart.cartId,
  }).send(res);
});

//! decrease quantity, if qty===1 then remove
export const removeFromCart = expressAsyncHandler(async (req, res, next) => {
  const { productId } = req.body;
  const userId = req.myUser._id;

  // find cart
  const existingCart = await CartModel.findOne({ userId });
  if (!existingCart) return next(new CustomError(404, "Cart Not Found"));

  // find product index
  const index = existingCart.items.findIndex(
    (item) => item.productId.toString() === productId.toString()
  );

  if (index === -1) {
    return next(new CustomError(404, "Product Not Found in Cart"));
  }

  // if quantity is 1 --> remove product entirely
  if (existingCart.items[index].quantity === 1) {
    existingCart.items.splice(index, 1);
  } else {
    existingCart.items[index].quantity -= 1;
  }

  await existingCart.save({ validateBeforeSave: false });

  const cart = await buildCart(userId);

  new ApiResponse(200, "Product Removed Successfully", cart.items, {
    totalAmount: cart.totalAmount,
    cartId: cart.cartId,
  }).send(res);
});

//~ remove the product completely, no matter what the quantity is
export const deleteFromCart = expressAsyncHandler(async (req, res, next) => {
  const { productId } = req.body;
  const userId = req.myUser._id;

  const existingCart = await CartModel.findOne({ userId });
  if (!existingCart) return next(new CustomError(404, "Cart Not Found"));

  existingCart.items = existingCart.items.filter(
    (item) => item.productId.toString() !== productId.toString()
  );
  await existingCart.save({ validateBeforeSave: false });

  const cart = await buildCart(userId);

  new ApiResponse(200, "Product Deleted From Cart", cart.items, {
    totalAmount: cart.totalAmount,
    cartId: cart.cartId,
  }).send(res);
});

export const clearCart = expressAsyncHandler(async (req, res, next) => {
  let userId = req.myUser._id;
  const existingCart = await CartModel.findOne({ userId });
  if (!existingCart) return next(new CustomError(404, "Cart Not Found"));

  existingCart.items = [];
  await existingCart.save({ validateBeforeSave: false });
  // this validateBeforeSave will not check for the validation against schema, it will simply save the document

  new ApiResponse(200, "Cart Cleared Successfully", [], {
    totalAmount: 0,
    cartId: existingCart._id,
  }).send(res);
});

export const getCart = expressAsyncHandler(async (req, res, next) => {
  let userId = req.myUser._id;

  //? not sending 404 when cart is missing, a new user simply has an empty cart
  const cart = await buildCart(userId);

  new ApiResponse(200, "Cart Fetched Successfully", cart.items, {
    totalAmount: cart.totalAmount,
    cartId: cart.cartId,
  }).send(res);
});
