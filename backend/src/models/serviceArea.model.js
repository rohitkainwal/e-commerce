import mongoose from "mongoose";

//! area where we deliver --> a center point + how many km around it
const serviceAreaSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    city: {
      type: String,
      required: true,
      trim: true,
    },
    //? center of the area
    lat: {
      type: Number,
      required: true,
      min: -90,
      max: 90,
    },
    lng: {
      type: Number,
      required: true,
      min: -180,
      max: 180,
    },
    radiusKm: {
      type: Number,
      required: true,
      min: [1, "Radius must be at least 1 km"],
      max: [100, "Radius cannot be more than 100 km"],
      default: 10,
    },
    //? admin can switch an area off without deleting it
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true, versionKey: false }
);

const ServiceAreaModel = mongoose.model("ServiceArea", serviceAreaSchema);

export default ServiceAreaModel;
