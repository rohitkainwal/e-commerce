import asyncHandler from "express-async-handler";
import AddressModel from "../../models/address.model.js";
import ApiResponse from "../../utils/ApiResponse.util.js";

export const addAddress = asyncHandler(async (req, res) => {
    const {addressLine , city, state , pincode, phone, notes} = req.body

    //create new address

    const newAddress = await AddressModel.create({
        addressLine , 
        city, 
        state , 
        pincode, 
        phone, 
        notes
    });
    new ApiResponse(201, "address added successfully", newAddress).send(res);
});

export const getAddresses = asyncHandler(async (req, res, next) => {});

export const getAddress = asyncHandler(async (req, res, next) => {});

export const updateAddress = asyncHandler(async (req, res, next) => {});

export const deleteAddress = asyncHandler(async (req, res, next) => {});