import express from "express";
const router = express.Router();

router.get("/", (req, res) => {
    res.render("houses/index");
});

router.get("/new", (req, res) => {
    res.render("houses/new");
});

router.post("/", (req, res) => {
    // Controller logic to be implemented later
    res.redirect("/houses");
});

router.get("/:houseId", (req, res) => {
    res.render("houses/show", { houseId: req.params.houseId });
});

router.get("/:houseId/edit", (req, res) => {
    // Pass house data to view
    res.render("houses/edit", { houseId: req.params.houseId });
});

router.put("/:houseId", (req, res) => {
    res.redirect(`/houses/${req.params.houseId}`);
});

router.delete("/:houseId", (req, res) => {
    res.redirect("/houses");
});

export default router;
