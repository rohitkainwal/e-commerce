import mongoose from "mongoose";

const addressSchema = new mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true,
    },
    addressLine :{
        type: String,
        required:true,
    },
     city :{
        type: String,
        required:true,
    },
     state :{
        type: String,
        required:true,
    },
     pincode :{
        type: String,
        required:true,
    },
     phone :{
        type: String,
        required:true,
    },
     notes :{
        type: String,
        default: "",
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

})

const AddressModel = mongoose.model("Address", addressSchema)

export default AddressModel