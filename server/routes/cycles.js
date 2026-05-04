import express from "express";
const router = express.Router({ mergeParams: true });
import BillingCycle from "../models/BillingCycle.js";

// Note: Mounted as app.use("/houses/:houseId/cycles", houseCyclesRouter)
// and app.use("/cycles", baseCyclesRouter) in app.js

router.get("/", async (req, res) => {
    const { houseId } = req.params;
    const cycles = await BillingCycle.find({ house_id: houseId });
    console.log("CYCLES: ", cycles);
    res.render("cycles/index", { houseId: req.params.houseId, cycles });
});

// -- Routes under /cycles --
router.get("/:cycleId", (req, res) => {
    res.render("cycles/show", { cycleId: req.params.cycleId });
});

router.put("/:cycleId", (req, res) => {
    res.redirect(`/cycles/${req.params.cycleId}`);
});

router.delete("/:cycleId", (req, res) => {
    res.redirect("/dashboard");
});

export default router;
