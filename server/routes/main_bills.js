import express from "express";
import { verifyMainBill } from "../middleware/verifyOwner.js";
import {
    getNewMainBillForm,
    createMainBill,
    getEditMainBillForm,
    updateMainBill,
    deleteMainBill,
} from "../controllers/mainBillController.js";

// mergeParams allows access to :houseId when mounted under /houses/:houseId/main-bill
const router = express.Router({ mergeParams: true });

// Routes under /houses/:houseId/main-bill  (houseId already verified by verifyHouse in houses route)
router.get("/new", getNewMainBillForm);
router.post("/", createMainBill);

// Routes operating on a specific bill by ID — verify bill ownership
router.get("/:billId/edit", verifyMainBill, getEditMainBillForm);
router.put("/:billId", verifyMainBill, updateMainBill);
router.delete("/:billId", verifyMainBill, deleteMainBill);

export default router;
