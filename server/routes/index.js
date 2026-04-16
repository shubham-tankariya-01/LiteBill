import express from "express";
const router = express.Router();

router.get("/", (req, res) => {
    res.render("index/landing");
});

router.get("/dashboard", (req, res) => {
    res.render("index/dashboard");
});

export default router;
