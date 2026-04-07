import mongoose from "mongoose";
const Schema = mongoose.Schema();

const User = new Schema({
    Mobile_num :{
        type: Number,
        max : 10,
        min : 10,
        required : true
    },
    
    
});

export default User;