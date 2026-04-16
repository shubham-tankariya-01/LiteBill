import mongoose from "mongoose";

const roomBillSchema = new mongoose.Schema(
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

        previous_reading: {
            type: Number,
            required: true,
            min: 0,
        },

        current_reading: {
            type: Number,
            required: true,
            min: 0,
        },

        units_consumed: {
            type: Number,
            required: true,
            min: 0,
        },

        amount: {
            type: Number,
            required: true,
            min: 0,
        },
    },
    { timestamps: true }
);

// One bill per room per cycle
roomBillSchema.index({ room_id: 1, billing_cycle_id: 1 }, { unique: true });

export default mongoose.model("RoomBill", roomBillSchema);