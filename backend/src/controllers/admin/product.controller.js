import expressAsyncHandler from "express-async-handler";
import ProductModel from "../../models/product.model.js";
import ApiResponse from "../../utils/ApiResponse.util.js";
import {
  deleteUploadedImage,
  uploadImage,
} from "../../utils/cloudinary.util.js";
import CustomError from "../../utils/CustomError.util.js";

export const getURL = (bufferValue, mimetype) => {
  const b64 = bufferValue.toString("base64");
  const imageURL = `data:${mimetype};base64,${b64}`;
  return imageURL;
};

//? some images are not on our cloudinary --> seeded ones and pasted links.
//? for those we must not call cloudinary destroy, it will just fail.
const isExternalImage = (publicId) =>
  !publicId || publicId.startsWith("seed-") || publicId.startsWith("url-");

//? makes the image object for a pasted link
const linkImage = (url) => {
  const id = `url-${Date.now()}`;
  return { url, public_id: id, asset_id: id };
};

//! admin can either upload a file (goes to cloudinary) or paste an image link.
//! link option is there because cloudinary keys may not be filled yet.
const buildImage = async (req) => {
  if (req.file) {
    const uploaded = await uploadImage(
      getURL(req.file.buffer, req.file.mimetype)
    );
    return {
      url: uploaded.secure_url,
      public_id: uploaded.public_id,
      asset_id: uploaded.asset_id,
    };
  }

  if (req.body.imageUrl?.trim()) return linkImage(req.body.imageUrl.trim());

  return null;
};

export const updateImage = expressAsyncHandler(async (req, res, next) => {
  const { public_id, productId } = req.body;

  let existingProduct = await ProductModel.findById(productId);
  if (!existingProduct) return next(new CustomError(404, "Product Not Found"));

  const newImage = await buildImage(req);
  if (!newImage)
    return next(
      new CustomError(400, "Please select an image or paste an image link")
    );

  //? remove the old one from cloudinary only if it was actually uploaded there
  if (public_id && !isExternalImage(public_id)) {
    try {
      await deleteUploadedImage(public_id);
    } catch (error) {
      console.log("Could not delete old image:", error.message);
    }
  }

  existingProduct.images = [newImage];
  await existingProduct.save();

  new ApiResponse(200, "Image Updated Successfully", existingProduct).send(res);
});

export const deleteImage = expressAsyncHandler(async (req, res, next) => {
  const { public_id, productId } = req.body;

  let existingProduct = await ProductModel.findById(productId);
  if (!existingProduct) return next(new CustomError(404, "Product Not Found"));

  if (!isExternalImage(public_id)) {
    const resp = await deleteUploadedImage(public_id);
    if (resp.result !== "ok") return next(new CustomError(500, resp.result));
  }

  existingProduct.images = [];
  await existingProduct.save();

  new ApiResponse(200, "Image Deleted Successfully", existingProduct).send(res);
});

export const addProduct = expressAsyncHandler(async (req, res, next) => {
  const image = await buildImage(req);
  if (!image)
    return next(
      new CustomError(400, "Please select an image or paste an image link")
    );

  const { name, stock, price, description, category, salePrice, brand } =
    req.body;

  const newProduct = await ProductModel.create({
    name,
    stock,
    price,
    description,
    category,
    salePrice,
    brand,
    images: [image],
  });

  new ApiResponse(201, "Product Added Successfully", newProduct).send(res);
});

export const getProducts = expressAsyncHandler(async (req, res, next) => {
  const products = await ProductModel.find().sort({ createdAt: -1 });
  //? empty list is fine on a fresh db, admin table will just show "no products"
  new ApiResponse(200, "Products Fetched Successfully", products).send(res);
});

export const getProduct = expressAsyncHandler(async (req, res, next) => {
  const { productId } = req.params;
  const product = await ProductModel.findById(productId);
  if (!product) return next(new CustomError(404, "Product Not Found"));
  new ApiResponse(200, "Product Fetched Successfully", product).send(res);
});

//! excluding images
export const updateProduct = expressAsyncHandler(async (req, res, next) => {
  const { productId } = req.params;

  //? images are handled by update-image route, so removing it from the body if it came
  const { images, ...restBody } = req.body;

  const updatedProduct = await ProductModel.findByIdAndUpdate(
    productId,
    restBody,
    {
      new: true, //? it returns the updated document,
      runValidators: true, //? validate the updated document against the schema
    }
  );

  if (!updatedProduct) return next(new CustomError(404, "Product Not Found"));
  new ApiResponse(200, "Product Updated Successfully", updatedProduct).send(
    res
  );
});

export const deleteProduct = expressAsyncHandler(async (req, res, next) => {
  const { productId } = req.params;
  const deletedProduct = await ProductModel.findByIdAndDelete(productId);
  if (!deletedProduct) return next(new CustomError(404, "Product Not Found"));

  for (let image of deletedProduct.images) {
    //? seeded / pasted link images are not on cloudinary
    if (isExternalImage(image.public_id)) continue;

    //! product is already removed from db above, so if cloudinary cleanup fails
    //! we should not send an error, just log it
    try {
      await deleteUploadedImage(image.public_id);
    } catch (error) {
      console.log("Could not delete image from cloudinary:", error.message);
    }
  }

  new ApiResponse(200, "Product Deleted Successfully", deletedProduct).send(
    res
  );
});
