import expressAsyncHandler from "express-async-handler";
import ServiceAreaModel from "../../models/serviceArea.model.js";
import ApiResponse from "../../utils/ApiResponse.util.js";
import { checkServiceable } from "../../utils/distance.util.js";

//~ the customer's browser sends its lat/lng here to know if we deliver there
export const checkLocation = expressAsyncHandler(async (req, res, next) => {
  const { lat, lng, city } = req.query;

  const result = await checkServiceable({
    lat: lat != null && lat !== "" ? Number(lat) : null,
    lng: lng != null && lng !== "" ? Number(lng) : null,
    city,
  });

  new ApiResponse(
    200,
    result.deliverable
      ? "We deliver to your location"
      : "Sorry, we do not deliver here yet",
    result
  ).send(res);
});

//~ shown in the location dropdown so the user knows where we do deliver
export const getServiceCities = expressAsyncHandler(async (req, res, next) => {
  const areas = await ServiceAreaModel.find({ isActive: true }).select(
    "name city lat lng radiusKm -_id"
  );

  new ApiResponse(200, "Service Areas Fetched Successfully", areas).send(res);
});
