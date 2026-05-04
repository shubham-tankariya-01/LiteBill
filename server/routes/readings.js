import express from "express";
const router = express.Router({ mergeParams: true });
import Room from "../models/Room.js";
import RoomReading from "../models/RoomReading.js";
import RoomBill from "../models/RoomBill.js";
import BillingCycle from "../models/BillingCycle.js";
import House from "../models/House.js";
import { calculate_Individual_Bill } from "../utils/BillCounter.js";

router.get("/new", async (req, res) => {
  try {
    const { houseId, cycleId } = req.params;
    const house = await House.findById(houseId);
    if (!house) return res.status(404).send("House not found");

    const rooms = await Room.find({ house_id: houseId });

    // If house is new (no previous cycle), render setup view
    if (!house.previous_billing_cycle) {
      return res.render("readings/setup", { houseId, rooms });
    }

    res.render("readings/new", { houseId, cycleId, rooms });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error loading reading form");
  }
});

// INITIAL SETUP: Establish baseline meter readings for a new house
router.post("/setup", async (req, res) => {
  try {
    const { houseId } = req.params;
    const readingsInput = req.body.readings;

    if (!readingsInput || Object.keys(readingsInput).length === 0) {
      return res.status(400).json({ error: "Initial readings required" });
    }

    // Use the date from the first reading as the anchor for the initialization
    const firstReadingId = Object.keys(readingsInput)[0];
    const setupDate = new Date(readingsInput[firstReadingId].date);

    // 1. Create a baseline 'Initialization' Cycle
    const setupCycle = new BillingCycle({
      house: houseId,
      startDate: setupDate, 
      endDate: setupDate    // Closed immediately as a baseline
    });
    const savedSetupCycle = await setupCycle.save();

    // 2. Format and Insert baseline readings
    const formattedReadings = Object.entries(readingsInput).map(([roomId, data]) => ({
      room_id: roomId,
      reading_value: Number(data.units),
      billing_cycle_id: savedSetupCycle._id,
      reading_date: new Date(data.date),
    }));
    await RoomReading.insertMany(formattedReadings);

    // 3. Start the first 'Active' Cycle for the first real billing period
    const activeCycle = new BillingCycle({
      house: houseId,
      startDate: setupDate
    });
    const savedActiveCycle = await activeCycle.save();

    // 4. Update House Pointers
    await House.findByIdAndUpdate(houseId, {
      previous_billing_cycle: savedSetupCycle._id,
      active_billing_cycle: savedActiveCycle._id
    });

    res.redirect(`/houses/${houseId}`);
  } catch (err) {
    console.error("Setup Error:", err);
    res.status(500).send("Setup failed: " + err.message);
  }
});


router.post("/", async (req, res) => {
  try {
    const { houseId, cycleId } = req.params;
    const readingsInput = req.body.readings;

    if (!readingsInput) {
      return res.status(400).json({ error: "Readings undefined" });
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
    await RoomReading.insertMany(formattedReadings);

    // 3. Calculate Room Bills
    const roomBills = await calculate_Individual_Bill(houseId, cycleId, formattedReadings);

    // 4. Save Room Bills
    await RoomBill.insertMany(roomBills);

    // 5. Finalize Current Cycle
    const currentCycle = await BillingCycle.findById(cycleId);
    if (!currentCycle) throw new Error("Current cycle not found");

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

    // 7. Update House pointers
    await House.findByIdAndUpdate(houseId, { 
      active_billing_cycle: savedNewCycle._id,
      previous_billing_cycle: currentCycle._id
    });

    res.redirect(`/cycles/${cycleId}/room-bills`);

  } catch (err) {
    console.error("Billing Process Error:", err);
    res.status(500).send(err.message);
  }
});

export default router;


