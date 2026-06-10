import express from "express";
import { authLimiter } from "../middleware/security.js";
import {
    getLoginPage,
    getSignupPage,
    postSignup,
    postLogin,
    postLogout,
    getProfile,
    postChangePassword,
} from "../controllers/authController.js";

const router = express.Router();

// Public routes (rate-limited)
router.get("/login", getLoginPage);
router.get("/signup", getSignupPage);
router.post("/signup", authLimiter, postSignup);
router.post("/login", authLimiter, postLogin);

// Protected routes (isLoggedIn already applied globally in app.js)
router.post("/logout", postLogout);
router.get("/profile", getProfile);
router.post("/change-password", postChangePassword);

export default router;