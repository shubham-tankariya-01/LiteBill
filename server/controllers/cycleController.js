import BillingCycle from "../models/BillingCycle.js";
import MainBill from "../models/MainBill.js";
import RoomBill from "../models/RoomBill.js";
import House from "../models/House.js";

// GET /houses/:houseId/cycles
export const getCycles = async (req, res, next) => {
    try {
        const { houseId } = req.params;
        const house = await House.findOne({ _id: houseId, user_id: req.session.userId });
        if (!house) return res.status(404).send('Resource not found');
        const cycles = await BillingCycle.find({ house: houseId });
        cycles.sort((a, b) => (a.endDate === null ? -1 : b.endDate === null ? 1 : b.startDate - a.startDate));

        const cycleResults = {};
        for (let cycle of cycles) {
            const mainBill = await MainBill.findOne({ billing_cycle_id: cycle._id });
            const roomBills = await RoomBill.find({ billing_cycle_id: cycle._id }).populate('room_id');
            
            let totalRoomAmount = 0;
            roomBills.forEach(rb => totalRoomAmount += rb.amount);
            
            cycleResults[cycle._id] = {
                mainBill: mainBill || null,
                roomBillsCount: roomBills.length,
                totalRoomAmount: totalRoomAmount,
                roomBills: roomBills
            };
        }

        res.render("cycles/index", { houseId, house, cycles, cycleResults });
    } catch (err) {
        next(err);
    }
};

// GET /cycles/:cycleId
export const getCycle = async (req, res, next) => {
    try {
        const cycle = await BillingCycle.findById(req.params.cycleId);
        if (!cycle) return res.status(404).send('Resource not found');
        res.render("cycles/show", { cycleId: req.params.cycleId });
    } catch (err) {
        next(err);
    }
};

// PUT /cycles/:cycleId
export const updateCycle = async (req, res, next) => {
    try {
        const { endDate } = req.body;
        const cycle = await BillingCycle.findByIdAndUpdate(req.params.cycleId, { endDate }, { new: true });
        if (!cycle) return res.status(404).send('Resource not found');
        res.redirect(`/cycles/${req.params.cycleId}`);
    } catch (err) {
        next(err);
    }
};

// DELETE /cycles/:cycleId
export const deleteCycle = async (req, res, next) => {
    try {
        const cycle = await BillingCycle.findByIdAndDelete(req.params.cycleId);
        if (!cycle) return res.status(404).send('Resource not found');
        if (cycle && cycle.house) {
            res.redirect(`/houses/${cycle.house}/history`);
        } else {
            res.redirect("/houses");
        }
    } catch (err) {
        next(err);
    }
};
