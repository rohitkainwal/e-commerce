import { log } from "../utils/logger.js";
import CustomError from "../utils/CustomError.util.js";

export const validate = (Schema)=>{
    return(req,res,next)=>{

        const {error, value} = Schema.validate(req.body,{abortEarly:false});
        log("Incoming Body", req.body);
        if(error){
            new CustomError(
                400,
                `${error.details.map((ele)=> ele.message)}`
            )
        }
        req.body = value;
         console.log("validate Middleware executed!");
        next();
    };
};