import mongoose from "mongoose";

const houseSchema = new mongoose.Schema(
    {
        user_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            index: true,
        },

        house_name: {
            type: String,
            required: true,
            trim: true,
        },
        active_billing_cycle :{
            type : mongoose.Schema.Types.ObjectId,
            ref : "BillingCycle",
            default : null
        },
        previous_billing_cycle :{
            type : mongoose.Schema.Types.ObjectId,
            ref : "BillingCycle",
            default : null
        }

    },
    { timestamps: true }
);

export default mongoose.model("House", houseSchema);