import express from "express";
import { getLandingPage, getDashboard } from "../controllers/indexController.js";

const router = express.Router();

router.get("/", getLandingPage);
router.get("/dashboard", getDashboard);

export default router;
