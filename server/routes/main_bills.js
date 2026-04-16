import express from "express";
const router = express.Router({ mergeParams: true });

// Note: Mounted as app.use("/cycles/:cycleId/main-bill", cycleMainBillRouter)
// and app.use("/main-bill", baseMainBillRouter) in app.js

router.get("/new", (req, res) => {
    res.render("main_bills/new", { cycleId: req.params.cycleId });
});

router.post("/", (req, res) => {
    res.redirect(`/cycles/${req.params.cycleId}`);
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
