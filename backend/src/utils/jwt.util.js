import { log } from "../utils/logger.js";
import jwt from "jsonwebtoken"

export const generateToken = (id) =>{
    const token= jwt.sign({id}, process.env.JWT_SECRET_KEY,{
        expiresIn: "1d",
        
    });
   log("JWT Generated", token);
      return token;

}

