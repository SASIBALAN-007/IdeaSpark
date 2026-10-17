import mongoose from "mongoose";

const userSchema = mongoose.Schema({
    user_name:{
        type : String,
        require : true,
    },
    user_email:{
        type : String
    },
    password:{
        type : String
    },
    companyname:{
        type : String
    },
    phone_number:{
        type : Number
    }
})

export const startupUser  = mongoose.model("User", userSchema);