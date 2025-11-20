import mongoose from "mongoose";
import bcrypt from "bcryptjs"
import crypto from "crypto"



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
    // for email
     emailVerificationToken: {
         type: String,
    },
       emailVerificationTokenExpiry: {
         type: Date,
    },

    // for password
     passwordResetToken: {
         type: String,
    },
       passwordResetTokenExpiry: {
         type: Date,
    },

   
},{timestamps:true, 
    toJSON: function(doc,ret){
        //TODO: change _id to id while displaying
        delete doc.password;
        return ret;
},
toObject: function(doc,ret){
    console.log(Message, "to object called");
    console.log(doc);
    console.log(ret);
    
        //TODO: change _id to id while displaying
        delete doc.password;
        return ret;
}

});


userSchema.pre("save", async function (next) {
    let salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password,salt);
    next();
    console.log("password hashed executed")
});

userSchema.methods.comparePassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword,this.password)
};



userSchema.methods.generateEmailVerificationToken = function(){
    const randomBytes = crypto.randomBytes(32);

    this.emailVerificationToken =crypto
    .createHash("sha256")
    .update(randomBytes)
    .digest("hex")
    this.emailVerificationTokenExpiry = Date.now() + 10 * 60 * 1000;
}

userSchema.methods.generatePasswordResetToken = function(){
    const randomBytes = crypto.randomBytes(32);

    this.passwordResetToken =crypto
    .createHash("sha256")
    .update(randomBytes)
    .digest("hex")
    this.passwordResetToken = Date.now() + 10 * 60 * 1000;
}



const userModel = mongoose.model("user", userSchema) 

export default userModel


//? 1) while registring    