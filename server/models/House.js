import mongoose from "mongoose";

const houseSchema = new mongoose.Schema(
    {
        user_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },

        house_name: {
            type: String,
            required: true,
            trim: true,
        },
    },
    { timestamps: true }
);

export default mongoose.model("House", houseSchema);