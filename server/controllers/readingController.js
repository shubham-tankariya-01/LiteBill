import Room from "../models/Room.js";
import RoomReading from "../models/RoomReading.js";
import RoomBill from "../models/RoomBill.js";
import BillingCycle from "../models/BillingCycle.js";
import House from "../models/House.js";
import MainBill from "../models/MainBill.js";
import { calculate_Individual_Bill } from "../utils/BillCounter.js";

// GET /houses/:houseId/readings/new  OR  /houses/:houseId/cycles/:cycleId/readings/new
export const getNewReadingsForm = async (req, res, next) => {
    try {
        const { houseId } = req.params;
        const house = await House.findById(houseId);
        if (!house) return res.status(404).send('Resource not found');

        const rooms = await Room.find({ house_id: houseId });

        const cycleId = req.params.cycleId || house.active_billing_cycle;

        // If house is new (no active cycle or no previous cycle), render setup view
        if (!cycleId || !house.previous_billing_cycle) {
            return res.render("readings/setup", { houseId, rooms });
        }

        const mainBill = await MainBill.findOne({ billing_cycle_id: cycleId });
        if (!mainBill) {
            return res.redirect(`/houses/${houseId}/main-bill/new?error=main_bill_required`);
        }

        const prevReadings = await RoomReading.find({ billing_cycle_id: house.previous_billing_cycle });
        const previousReadings = {};
        prevReadings.forEach(r => {
            previousReadings[r.room_id.toString()] = r.reading_value;
        });

        res.render("readings/new", { houseId, cycleId, rooms, previousReadings, mainBill });
    } catch (err) {
        next(err);
    }
};

// POST /houses/:houseId/readings/setup
export const postSetupReadings = async (req, res, next) => {
    try {
        const { houseId } = req.params;
        const readingsInput = req.body.readings;

        if (!readingsInput || Object.keys(readingsInput).length === 0) {
            return res.redirect(`/houses/${houseId}/readings/new?error=missing_data`);
        }

        const setupDate = new Date();

        const setupCycle = new BillingCycle({
            house: houseId,
            startDate: setupDate, 
            endDate: setupDate
        });
        const savedSetupCycle = await setupCycle.save();

        const formattedReadings = Object.entries(readingsInput).map(([roomId, data]) => ({
            room_id: roomId,
            reading_value: Number(data.units),
            billing_cycle_id: savedSetupCycle._id,
            reading_date: new Date(data.date),
        }));
        await RoomReading.insertMany(formattedReadings);

        const activeCycle = new BillingCycle({
            house: houseId,
            startDate: setupDate
        });
        const savedActiveCycle = await activeCycle.save();

        await House.findByIdAndUpdate(houseId, {
            previous_billing_cycle: savedSetupCycle._id,
            active_billing_cycle: savedActiveCycle._id
        });

        res.redirect(`/houses/${houseId}`);
    } catch (err) {
        next(err);
    }
};

// POST /houses/:houseId/cycles/:cycleId/readings
export const postReadings = async (req, res, next) => {
    const { houseId, cycleId } = req.params;

    try {
        // Safeguard: Verify the cycle is not already closed
        const currentCycle = await BillingCycle.findById(cycleId);
        if (!currentCycle) return res.status(404).send('Resource not found');
        if (currentCycle.endDate) {
            return res.redirect(`/cycles/${cycleId}/room-bills`);
        }

        // Safeguard: Verify readings haven't already been submitted
        const existingReading = await RoomReading.findOne({ billing_cycle_id: cycleId });
        if (existingReading) {
            return res.redirect(`/cycles/${cycleId}/room-bills`);
        }

        const readingsInput = req.body.readings;

        if (!readingsInput) {
            throw new Error("Readings undefined");
        }

        // 1. Format and Validate Readings
        const formattedReadings = Object.entries(readingsInput).map(
            ([roomId, data]) => {
                const value = Number(data.units);
                const date = new Date(data.date);

                if (isNaN(value)) throw new Error("Invalid units");
                if (isNaN(date.getTime())) throw new Error("Invalid date");

                return {
                    room_id: roomId,
                    reading_value: value,
                    billing_cycle_id: cycleId,
                    reading_date: date,
                };
            },
        );

        // 2. Insert readings
        try {
            await RoomReading.insertMany(formattedReadings);
        } catch (err) {
            if (err.code === 11000) {
                return res.redirect(`/cycles/${cycleId}/room-bills`);
            }
            throw err;
        }

        // 3. Calculate Room Bills
        const roomBills = await calculate_Individual_Bill(houseId, cycleId, formattedReadings);

        // 4. Save Room Bills
        await RoomBill.insertMany(roomBills);

        // 5. Finalize Current Cycle
        const latestReadingDate = new Date(Math.max(...formattedReadings.map(r => r.reading_date)));
        currentCycle.endDate = latestReadingDate;
        await currentCycle.save();

        // 6. Transition to New Cycle
        const nextDay = new Date(latestReadingDate);
        nextDay.setDate(nextDay.getDate() + 1);

        const newCycle = new BillingCycle({
            house: houseId,
            startDate: nextDay
        });
        const savedNewCycle = await newCycle.save();

        if (!savedNewCycle || !savedNewCycle._id) {
            throw new Error("Failed to initialize the new billing cycle properly.");
        }

        // 7. Update House pointers
        await House.findByIdAndUpdate(houseId, { 
            active_billing_cycle: savedNewCycle._id,
            previous_billing_cycle: currentCycle._id
        });

        res.redirect(`/cycles/${cycleId}/room-bills`);
    } catch (err) {
        next(err);
    }
};
