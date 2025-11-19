import mongoose from "mongoose";
import bcrypt from "bcryptjs"

const userSchema = new mongoose.Schema({

    username: {
        type: String,
        required:true
    },
    email: {
         type: String,
        required:true
    },
    password: {
         type: String,
        required:true
    },
    role: {
         type: String,
        required:true,
        default:"user"
    },
    contactNumber: {
         type: String,
        required:true,
        unique: true
    },

     isVarified: {
         type:  Boolean,
        required:true,
        default: false
    },
   
},{timestamps:true,  toJSON: "", toObject: "" });


userSchema.pre("save", async function (next) {
    let salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password,salt);
    next();
    console.log("password hashed executed")
});

userSchema.methods.comparePassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword,this.password)
};

const userModel = mongoose.model("user", userSchema) 

export default userModel