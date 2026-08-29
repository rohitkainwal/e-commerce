import expressAsyncHandler from "express-async-handler";
import AddressModel from "../../models/address.model.js";
import ApiResponse from "../../utils/ApiResponse.util.js";
import CustomError from "../../utils/CustomError.util.js";

export const addAddress = expressAsyncHandler(async (req, res, next) => {
  const { addressLine, city, state, pinCode, phone, notes } = req.body;

  //! this create was not awaited before, so response was going before saving
  const newAddress = await AddressModel.create({
    addressLine,
    city,
    state,
    pinCode,
    phone,
    notes,
    userId: req.myUser._id,
  });

  new ApiResponse(201, "Address Added Successfully", newAddress).send(res);
});

export const getAddresses = expressAsyncHandler(async (req, res, next) => {
  //? only the addresses of the logged in user
  const addresses = await AddressModel.find({ userId: req.myUser._id }).sort({
    createdAt: -1,
  });

  new ApiResponse(200, "Addresses Fetched Successfully", addresses).send(res);
});

export const getAddress = expressAsyncHandler(async (req, res, next) => {
  const { addressId } = req.params;

  const address = await AddressModel.findOne({
    _id: addressId,
    userId: req.myUser._id, //! this makes sure user cannot read someone else's address
  });

  if (!address) return next(new CustomError(404, "Address Not Found"));

  new ApiResponse(200, "Address Fetched Successfully", address).send(res);
});

export const updateAddress = expressAsyncHandler(async (req, res, next) => {
  const { addressId } = req.params;

  //? userId should not be changed from body, so taking it out
  const { userId, ...restBody } = req.body;

  const updatedAddress = await AddressModel.findOneAndUpdate(
    { _id: addressId, userId: req.myUser._id },
    restBody,
    { new: true, runValidators: true }
  );

  if (!updatedAddress) return next(new CustomError(404, "Address Not Found"));

  new ApiResponse(200, "Address Updated Successfully", updatedAddress).send(
    res
  );
});

export const deleteAddress = expressAsyncHandler(async (req, res, next) => {
  const { addressId } = req.params;

  const deletedAddress = await AddressModel.findOneAndDelete({
    _id: addressId,
    userId: req.myUser._id,
  });

  if (!deletedAddress) return next(new CustomError(404, "Address Not Found"));

  new ApiResponse(200, "Address Deleted Successfully", deletedAddress).send(
    res
  );
});
