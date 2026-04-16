import express from "express";
const router = express.Router();

router.get("/profile", (req, res) => {
    res.render("auth/profile");
});

router.get("/login", (req, res) => {
    res.render("auth/login");
});

router.get("/signup", (req, res) => {
    res.render("auth/signup");
});

router.post("/login", (req, res) => {
    res.redirect("/dashboard");
});

router.post("/signup", (req, res) => {
    res.redirect("/dashboard");
});

router.post("/logout", (req, res) => {
    res.redirect("/");
});

export default router;