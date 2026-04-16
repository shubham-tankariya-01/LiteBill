import mongoose from "mongoose";

const roomReadingSchema = new mongoose.Schema(
    {
        room_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Room",
            required: true,
            index: true,
        },

        billing_cycle_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "BillingCycle",
            required: true,
            index: true,
        },

        reading_value: {
            type: Number,
            required: true,
            min: 0,
        },

        reading_date: {
            type: Date,
            required: true,
        },
    },
    { timestamps: true }
);

// Prevent duplicate reading per room per cycle
roomReadingSchema.index({ room_id: 1, billing_cycle_id: 1 }, { unique: true });

export default mongoose.model("RoomReading", roomReadingSchema);