//! global error middleware
export const errorMiddleware = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || "something went wrong";

  if (err.name === "ValidationError") {
    statusCode = 400;
    message = `${Object.values(err.errors).map((ele) => ele.message)}`;
  }

  if (err.code === 11000) {
    statusCode = 409;
    message = `${Object.keys(err.keyValue)[0]} already used`;
  }

  if (err.name === "CastError") {
    statusCode = 400;
    message = "Invalid MongoDB ID";
  }

  if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Invalid Session, Please login again";
  }

  if (err.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Session Expired, Please login again";
  }

  let responseObject = { success: false, message };

  //? sending the full error + stack only while developing, not in production
  if (process.env.NODE_ENV !== "production") {
    responseObject.errObj = err;
    responseObject.errLine = err.stack;
  }

  res.status(statusCode).json(responseObject);
};

//! use this error middleware in the last
