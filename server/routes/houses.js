import express from "express";
const router = express.Router();
import House from "../models/House.js";
import Room from "../models/Room.js"
import MainBill from "../models/MainBill.js";
import RoomBill from "../models/RoomBill.js";
import BillingCycle from "../models/BillingCycle.js";
import RoomReading from "../models/RoomReading.js";




router.get("/", async (req, res, next) => {
    try {
        const houses = await House.find();
        
        let houseStatuses = {};
        for (let house of houses) {
            const hasSetup = house.previous_billing_cycle != null;
            let hasBillThisCycle = false;
            let lastBillDate = null;
            
            if (house.active_billing_cycle) {
                const mainBill = await MainBill.findOne({ billing_cycle_id: house.active_billing_cycle });
                if (mainBill) {
                    hasBillThisCycle = true;
                }
            }

            const recentBill = await MainBill.findOne({ house_id: house._id }).sort({ bill_date: -1 });
            if (recentBill) {
                lastBillDate = recentBill.bill_date;
            }

            const roomCount = await Room.countDocuments({ house_id: house._id });

            houseStatuses[house._id.toString()] = {
                hasSetup,
                hasBillThisCycle,
                roomCount,
                lastBillDate
            };
        }

        res.render("houses/index", { houses, houseStatuses });
    } catch (err) {
        next(err);
    }
});

router.get("/new", (req, res) => {
    res.render("houses/new");
});

router.post("/", async (req, res, next) => {
    try {
        const { house_name, meters } = req.body;
        if (!house_name) {
            return res.status(400).send("House name required");
        }
        const newHouse = new House({ house_name });
        await newHouse.save();
        if (meters && meters.length > 0) {
            const roomPromises = meters.map(meter => {
                return new Room({
                    house_id: newHouse._id,
                    meter_name: meter
                }).save();
            });
            await Promise.all(roomPromises);
        }
        res.redirect("/houses");
    } catch (err) {
        next(err);
    }
});


router.get("/:houseId", async (req, res, next) => {
    try {
        const house = await House.findById(req.params.houseId).populate('active_billing_cycle');
        if (!house) return res.status(404).send('Resource not found');
        const rooms = await Room.find({ house_id: req.params.houseId });

        let flowState = "needs_setup";
        let hasBill = false;
        
        if (!house.previous_billing_cycle) {
            flowState = "needs_setup";
        } else if (house.active_billing_cycle) {
            const mainBill = await MainBill.findOne({ billing_cycle_id: house.active_billing_cycle._id });
            if (!mainBill) {
                flowState = "needs_bill";
            } else {
                hasBill = true;
                const reading = await RoomReading.findOne({ billing_cycle_id: house.active_billing_cycle._id });
                if (reading) {
                    flowState = "cycle_complete";
                } else {
                    flowState = "needs_readings";
                }
            }
        }

        // Fetch recent history (last 2 completed cycles with amounts)
        const recentCycles = await BillingCycle.find({ house: house._id, endDate: { $ne: null } }).sort({ endDate: -1 }).limit(2);
        const cycleIds = recentCycles.map(c => c._id);
        const recentMainBills = await MainBill.find({ billing_cycle_id: { $in: cycleIds } }).populate('billing_cycle_id').sort({ bill_date: -1 });

        res.render("houses/show", { 
            house, 
            rooms, 
            flowState, 
            activeCycle: house.active_billing_cycle, 
            hasBill,
            recentMainBills
        });
    } catch (err) {
        next(err);
    }
});

router.get("/:houseId/edit", async (req, res, next) => {
    try {
        const house = await House.findById(req.params.houseId);
        if (!house) return res.status(404).send('Resource not found');
        res.render("houses/edit", { house });
    } catch (err) {
        next(err);
    }
});

router.put("/:houseId", async (req, res, next) => {
    try {
        const { house_name } = req.body;
        const house = await House.findByIdAndUpdate(req.params.houseId, { house_name });
        if (!house) return res.status(404).send('Resource not found');
        res.redirect(`/houses/${req.params.houseId}`);
    } catch (err) {
        next(err);
    }
});

router.delete("/:houseId", async (req, res, next) => {
    try {
        const { houseId } = req.params;

        const house = await House.findById(houseId);
        if (!house) return res.status(404).send('Resource not found');

        // 1. Find all cycles for this house
        const cycles = await BillingCycle.find({ house: houseId });
        const cycleIds = cycles.map(c => c._id);

        // 2. Cascade delete RoomBills attached to these cycles
        if (cycleIds.length > 0) {
            await RoomBill.deleteMany({ billing_cycle_id: { $in: cycleIds } });
        }

        // 3. Cascade delete MainBills and BillingCycles for this house
        await MainBill.deleteMany({ house_id: houseId });
        await BillingCycle.deleteMany({ house: houseId });

        // 4. Cascade delete all Rooms for this house
        await Room.deleteMany({ house_id: houseId });

        // 5. Finally, delete the House itself
        await House.findByIdAndDelete(houseId);

        res.redirect("/houses");
    } catch (err) {
        next(err);
    }
});

router.get("/:houseId/history", async (req, res, next) => {
    try {
        const { houseId } = req.params;
        const house = await House.findById(houseId);
        if (!house) return res.status(404).send('Resource not found');

        const cycles = await BillingCycle.find({ house: houseId }).sort({ createdAt: -1 });
        const cycleIds = cycles.map(c => c._id);

        const mainBills = await MainBill.find({ house_id: houseId, billing_cycle_id: { $in: cycleIds } })
            .populate('billing_cycle_id')
            .sort({ bill_date: -1 });

        const roomBills = await RoomBill.find({ billing_cycle_id: { $in: cycleIds } })
            .populate('room_id')
            .populate('billing_cycle_id')
            .sort({ createdAt: -1 });

        // Group room bills by cycle
        const roomBillsByCycle = {};
        roomBills.forEach(bill => {
            const cycleId = bill.billing_cycle_id._id.toString();
            if (!roomBillsByCycle[cycleId]) {
                roomBillsByCycle[cycleId] = [];
            }
            roomBillsByCycle[cycleId].push(bill);
        });

        // Compute per cycle roomCount and avgRoomAmount
        const cycleStats = {};
        cycles.forEach(cycle => {
            const cycleId = cycle._id.toString();
            const bills = roomBillsByCycle[cycleId] || [];
            const roomCount = bills.length;
            const totalRoomAmount = bills.reduce((sum, b) => sum + (b.amount || 0), 0);
            const avgRoomAmount = roomCount > 0 ? (totalRoomAmount / roomCount) : 0;
            cycleStats[cycleId] = { roomCount, avgRoomAmount };
        });

        // Compute historySummary
        const totalCycles = cycles.length;
        const totalBilled = mainBills.reduce((s, b) => s + (b.total_amount || 0), 0);
        const completedCyclesCount = cycles.filter(c => c.endDate).length;
        const avgBillAmount = completedCyclesCount > 0 ? (totalBilled / completedCyclesCount) : 0;

        const historySummary = {
            totalCycles,
            totalBilled,
            avgBillAmount
        };

        res.render("houses/history", {
            house,
            mainBills,
            roomBillsByCycle,
            cycles,
            cycleStats,
            historySummary
        });
    } catch (err) {
        next(err);
    }
});

export default router;
