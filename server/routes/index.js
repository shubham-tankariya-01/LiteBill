import express from "express";
const router = express.Router();

router.get("/", (req, res) => {
    res.render("index/landing");
});

import House from "../models/House.js";
import BillingCycle from "../models/BillingCycle.js";
import MainBill from "../models/MainBill.js";

router.get("/dashboard", async (req, res) => {
    try {
        const houseCount = await House.countDocuments();
        
        // Active cycles are cycles where endDate is null or not set
        const activeCyclesCount = await BillingCycle.countDocuments({ endDate: null });
        
        // Sum total amount from all MainBills
        const mainBills = await MainBill.find({});
        const totalRevenue = mainBills.reduce((sum, bill) => sum + (bill.total_amount || 0), 0);

        res.render("index/dashboard", { 
            houseCount, 
            activeCyclesCount, 
            totalRevenue 
        });
    } catch (err) {
        console.error("Dashboard error:", err);
        res.status(500).send("Server Error");
    }
});

export default router;
