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
        const house = await House.findById(houseId).populate('active_billing_cycle');
        
        // If the house is new and has no baseline, redirect to the readings setup
        if (!house || !house.previous_billing_cycle) {
            return res.redirect(`/houses/${houseId}/readings/new`);
        }

        let cycleStartDate = "";
        if (house.active_billing_cycle && house.active_billing_cycle.startDate) {
            cycleStartDate = house.active_billing_cycle.startDate.toISOString().split('T')[0];
        }

        res.render("main_bills/new", { houseId, cycleStartDate });
    } catch (err) {
        console.error(err);
        res.status(500).send("Error checking house status");
    }
});


router.post("/", async (req, res) => {
    const { total_units, total_amount, end_date } = req.body;

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

router.get("/:billId/edit", async (req, res) => {
    try {
        const mainBill = await MainBill.findById(req.params.billId);
        if (!mainBill) return res.status(404).send("Main Bill not found");
        res.render("main_bills/edit", { mainBill });
    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
    }
});


router.put("/:billId", async (req, res) => {
    try {
        const { total_units, total_amount, bill_date } = req.body;
        const mainBill = await MainBill.findByIdAndUpdate(
            req.params.billId, 
            { total_units, total_amount, bill_date }, 
            { new: true }
        );
        res.redirect(`/houses/${mainBill.house_id}/history`);
    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
    }
});

router.delete("/:billId", async (req, res) => {
    try {
        const mainBill = await MainBill.findByIdAndDelete(req.params.billId);
        if (mainBill && mainBill.house_id) {
            res.redirect(`/houses/${mainBill.house_id}/history`);
        } else {
            res.redirect("/houses");
        }
    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
    }
});

export default router;
