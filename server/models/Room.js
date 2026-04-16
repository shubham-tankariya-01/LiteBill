import mongoose from "mongoose";

const roomSchema = new mongoose.Schema(
    {
        house_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "House",
            required: true,
            index: true,
        },

        room_name: {
            type: String,
            required: true,
            trim: true,
        },
    },
    { timestamps: true }
);

export default mongoose.model("Room", roomSchema);