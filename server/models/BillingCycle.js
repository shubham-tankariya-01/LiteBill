import mongoose from "mongoose";

const billingCycleSchema = new mongoose.Schema(
    {
        house: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "House",
            required: true,
            index: true,
        },

        startDate: {
            type: Date,
            required: true,
        },

        endDate: {
            type: Date,
            default : null
        },
    },
    {
        timestamps: true,
    }
);

export default mongoose.model("BillingCycle", billingCycleSchema);