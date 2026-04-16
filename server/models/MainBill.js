import mongoose from "mongoose";

const mainBillSchema = new mongoose.Schema(
    {
        house_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "House",
            required: true,
            index: true,
        },

        billing_cycle_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "BillingCycle",
            required: true,
            index: true,
        },

        total_units: {
            type: Number,
            required: true,
            min: 0,
        },

        total_amount: {
            type: Number,
            required: true,
            min: 0,
        },

        bill_date: {
            type: Date,
            required: true,
        },
    },
    { timestamps: true }
);

export default mongoose.model("MainBill", mainBillSchema);