import express from "express";
const router = express.Router({ mergeParams: true });
import MainBill from "../models/MainBill.js";
import BillingCycle from "../models/BillingCycle.js";
import House from "../models/House.js";


import Room from "../models/Room.js";

// Note: Mounted as app.use("/cycles/:cycleId/main-bill", cycleMainBillRouter)
// and app.use("/main-bill", baseMainBillRouter) in app.js

router.get("/new", async (req, res, next) => {
    try {
        const { houseId } = req.params;
        const house = await House.findById(houseId).populate('active_billing_cycle');
        
        // If the house is new and has no baseline, redirect to the readings setup
        if (!house || !house.previous_billing_cycle) {
            return res.redirect(`/houses/${houseId}/readings/new`);
        }

        const rooms = await Room.find({ house_id: houseId }).sort({ createdAt: 1 });
        const roomCount = rooms.length;

        let cycleStartDate = "";
        if (house.active_billing_cycle && house.active_billing_cycle.startDate) {
            cycleStartDate = house.active_billing_cycle.startDate.toISOString().split('T')[0];
        }

        res.render("main_bills/new", { 
            houseId, 
            activeCycle: house.active_billing_cycle,
            cycleStartDate, 
            roomCount,
            rooms,
            error: req.query.error || null 
        });
    } catch (err) {
        next(err);
    }
});


router.post("/", async (req, res, next) => {
    try {
        const { total_units, total_amount, bill_date } = req.body;

        const house = await House.findById(req.params.houseId).select("active_billing_cycle");
        if (!house) {
            return res.status(404).send('Resource not found');
        }

        const cycle_id = house.active_billing_cycle;

        // Prevent duplicate main bill creation for the same cycle
        const existingMainBill = await MainBill.findOne({ billing_cycle_id: cycle_id });
        if (existingMainBill) {
            return res.redirect(`/houses/${req.params.houseId}/cycles/${cycle_id}/readings/new`);
        }

        const mainBill = new MainBill({
            house_id: req.params.houseId,
            billing_cycle_id: cycle_id,
            total_units : total_units,
            total_amount : total_amount,
            bill_date: bill_date,
        });
        const savedMainBill = await mainBill.save();
        console.log("SAVED MAIN BILL: ", savedMainBill);

        res.redirect(`/houses/${req.params.houseId}/cycles/${cycle_id}/readings/new`);
    } catch (err) {
        next(err);
    }
});

// -- Routes under /main-bill --

router.get("/:billId/edit", async (req, res, next) => {
    try {
        const mainBill = await MainBill.findById(req.params.billId).populate('house_id');
        if (!mainBill) return res.status(404).send('Resource not found');
        
        const rooms = await Room.find({ house_id: mainBill.house_id._id }).sort({ createdAt: 1 });
        const roomCount = rooms.length;

        res.render("main_bills/edit", { 
            mainBill,
            rooms,
            roomCount,
            houseId: mainBill.house_id._id
        });
    } catch (err) {
        next(err);
    }
});


router.put("/:billId", async (req, res, next) => {
    try {
        const { total_units, total_amount, bill_date } = req.body;
        const mainBill = await MainBill.findByIdAndUpdate(
            req.params.billId, 
            { total_units, total_amount, bill_date }, 
            { new: true }
        );
        if (!mainBill) return res.status(404).send('Resource not found');
        res.redirect(`/houses/${mainBill.house_id}/history`);
    } catch (err) {
        next(err);
    }
});

router.delete("/:billId", async (req, res, next) => {
    try {
        const mainBill = await MainBill.findByIdAndDelete(req.params.billId);
        if (!mainBill) return res.status(404).send('Resource not found');
        if (mainBill.house_id) {
            res.redirect(`/houses/${mainBill.house_id}/history`);
        } else {
            res.redirect("/houses");
        }
    } catch (err) {
        next(err);
    }
});

export default router;
