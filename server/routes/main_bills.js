import express from "express";
const router = express.Router({ mergeParams: true });
import MainBill from "../models/MainBill.js";
import BillingCycle from "../models/BillingCycle.js";
import House from "../models/House.js";
import Update_Billing_cycle from "../utils/Update_billing.js";

// Note: Mounted as app.use("/cycles/:cycleId/main-bill", cycleMainBillRouter)
// and app.use("/main-bill", baseMainBillRouter) in app.js

router.get("/new", async (req, res) => {
    try {
        const { houseId } = req.params;
        const house = await House.findById(houseId);
        
        // If the house is new and has no baseline, redirect to the readings setup
        if (!house || !house.previous_billing_cycle) {
            return res.redirect(`/houses/${houseId}/readings/new`);
        }

        res.render("main_bills/new", { houseId });
    } catch (err) {
        console.error(err);
        res.status(500).send("Error checking house status");
    }
});


router.post("/", async (req, res) => {
    const { total_units, total_amount, end_date } = req.body;


    // //completing the previous cycle
    // try {
    // const cycle_compleition = await Update_Billing_cycle(req.params.houseId , start_date);
    // } catch(err) {
    //     console.log("Error in Updating Billing Cycle : ", err);
    //     return res.status(500).send("Error in Updating Billing Cycle ");
    // }


    // // Creating a new billing cycle
    // const cycle = new BillingCycle({
    //     house: req.params.houseId,
    //     startDate: start_date,
    // });
    // const savedCycle = await cycle.save();
    // console.log("SAVED CYCLE: ", savedCycle);


    // //updating active Billing Cycle in House
    // const House_active_cycle_updated = await House.findByIdAndUpdate(req.params.houseId , { $set: { active_billing_cycle: savedCycle._id } });
    // console.log("UPDATED HOUSE: ", House_active_cycle_updated);


    // Creating a  main bill for active (previously created) cycle

    const house = await House.findById(req.params.houseId).select("active_billing_cycle");
    const cycle_id = house.active_billing_cycle;

    const mainBill = new MainBill({
        house_id: req.params.houseId,
        billing_cycle_id: cycle_id,
        total_units : total_units,
        total_amount : total_amount,
        bill_date: end_date,
    });
    const savedMainBill = await mainBill.save();
    console.log("SAVED MAIN BILL: ", savedMainBill);

    res.redirect(`/houses/${req.params.houseId}/cycles/${cycle_id}/readings/new`);
});

// -- Routes under /main-bill --

router.get("/:billId/edit", (req, res) => {
    res.render("main_bills/edit", { billId: req.params.billId });
});


router.put("/:billId", (req, res) => {
    // Assuming redirect back to cycle, but would need to know cycleId in reality
    res.redirect("/dashboard");
});

export default router;
