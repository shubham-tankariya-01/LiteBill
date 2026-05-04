
import House from "../models/House.js";
import BillingCycle from "../models/BillingCycle.js";

const Update_Billing_cycle = async (house_id, New_cycl_st_date) => {

    try {
        const Date_ = new Date(New_cycl_st_date);
        Date_.setDate(Date_.getDate() - 1);

        const endingDate = Date_;

        const House_active_cycle = await House.findById({ house_id }).select("active_billing_cycle").populate("active_billing_cycle");
        House_active_cycle.active_billing_cycle.endDate = endingDate;
        const save = await House_active_cycle.active_billing_cycle.save();
        return save; // cycle completed returning the completed cycle id to be inserted in Main bill

    } catch (err) {
        console.log("Error in Updating Billing Cycle : ", err);
        throw err;
    }

}

export default Update_Billing_cycle;