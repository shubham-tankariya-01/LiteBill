import RoomBill from "../models/RoomBill.js";
import MainBill from "../models/MainBill.js";
import BillingCycle from "../models/BillingCycle.js";

// GET /cycles/:cycleId/room-bills
export const getRoomBills = async (req, res, next) => {
    try {
        const { cycleId } = req.params;

        const cycle = await BillingCycle.findById(cycleId).populate("house");
        if (!cycle) return res.status(404).send("Billing cycle not found");
        if (!cycle.house) return res.status(404).send("Associated house not found — it may have been deleted");
        
        const mainBill = await MainBill.findOne({ billing_cycle_id: cycleId });
        const roomBills = await RoomBill.find({ billing_cycle_id: cycleId }).populate("room_id");

        if (roomBills.length === 0 && cycle.endDate) {
            console.warn(`Warning: Closed cycle ${cycleId} has no room bills.`);
        }

        const roomBillsTotal = roomBills.reduce((s, b) => s + b.amount, 0);
        const billDifference = mainBill ? Math.abs(mainBill.total_amount - roomBillsTotal).toFixed(2) : null;

        res.render("room_bills/index", { 
            cycle, 
            mainBill, 
            hasBill: !!mainBill,
            roomBills,
            houseId: cycle.house._id,
            roomBillsTotal,
            billDifference
        });
    } catch (err) {
        next(err);
    }
};
