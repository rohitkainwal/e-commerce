import expressAsyncHandler from "express-async-handler";
import ServiceAreaModel from "../../models/serviceArea.model.js";
import ApiResponse from "../../utils/ApiResponse.util.js";
import CustomError from "../../utils/CustomError.util.js";

export const getAreas = expressAsyncHandler(async (req, res, next) => {
  const areas = await ServiceAreaModel.find().sort({ createdAt: -1 });
  new ApiResponse(200, "Areas Fetched Successfully", areas).send(res);
});

export const addArea = expressAsyncHandler(async (req, res, next) => {
  const { name, city, lat, lng, radiusKm } = req.body;

  if (lat == null || lng == null)
    return next(
      new CustomError(400, "Please give the center latitude and longitude")
    );

  const area = await ServiceAreaModel.create({
    name,
    city,
    lat: Number(lat),
    lng: Number(lng),
    radiusKm: Number(radiusKm) || 10,
  });

  new ApiResponse(201, "Delivery Area Added Successfully", area).send(res);
});

export const updateArea = expressAsyncHandler(async (req, res, next) => {
  const area = await ServiceAreaModel.findByIdAndUpdate(
    req.params.areaId,
    req.body,
    { new: true, runValidators: true }
  );

  if (!area) return next(new CustomError(404, "Area Not Found"));

  new ApiResponse(200, "Delivery Area Updated Successfully", area).send(res);
});

export const deleteArea = expressAsyncHandler(async (req, res, next) => {
  const area = await ServiceAreaModel.findByIdAndDelete(req.params.areaId);
  if (!area) return next(new CustomError(404, "Area Not Found"));

  new ApiResponse(200, "Delivery Area Deleted Successfully", area).send(res);
});
