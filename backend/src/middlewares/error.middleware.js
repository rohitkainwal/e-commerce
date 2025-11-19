//! global error middleware

import { log } from "../utils/logger.js";

export const errorMiddleware =(err, req, res,next) =>{
    log("🔥 ERROR Middleware Executed");
  log("Error Message", err.message);
  log("Stack", err.stack);
    let statusCode = err.statusCode || 500;
    let message = err.message || "somthing went wrong"

     // if no error object was passed
  if (!err) {
    err = new Error("Unknown Error");
  }

    if (err.name === "validationError") {
        statusCode = 400;
       message = Object.values(err.errors)
      .map((e) => e.message)
      .join(", ");
    }

    if (err.code === 11000){
        statusCode = 409;
       message = `${Object.keys(err.keyValue)} already exists`;
    }
    
    if (err.name === "castError"){
        statusCode = 400;
        message = "invalid MongoDB Id"
    }

    if (err.name === "JsonWebTokenError"){
        statusCode = 401;
        message = "invalid session , please sign in again"
    }

    res

    .status(statusCode)
    .json({success:false, message, errObj:err, errLine: err.stack});
   
     
};


// use this error middleeweatre in the last 