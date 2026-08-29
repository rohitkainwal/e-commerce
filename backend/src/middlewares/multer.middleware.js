import multer from "multer";
import CustomError from "../utils/CustomError.util.js";

const myStorage = multer.memoryStorage();

//! we keep the file in memory before sending it to cloudinary, so a very big
//! file would eat the server's ram. 5 mb is more than enough for a product photo.
const upload = multer({
  storage: myStorage,
  limits: {
    fileSize: 5 * 1024 * 1024, //? 5 mb
    files: 1,
  },
  //? only real images, otherwise someone could upload a .exe or a .html file
  fileFilter: (req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (allowed.includes(file.mimetype)) return cb(null, true);
    cb(new CustomError(400, "Only jpg, png, webp or gif images are allowed"));
  },
});

export default upload;

//? enctype="multipart/form-data" use this in form
