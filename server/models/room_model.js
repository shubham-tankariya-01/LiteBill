import mongoose from "mongoose";
const Schema = mongoose.Schema;

const RoomSchema= new Schema({
    name : {
        required : true,
        type : String
    },
    last_reading:{
        type : Number,
        default : 0,
    },
});

export default mongoose.model('Room', RoomSchema);
