import House from "../models/House.js";
import RoomReading from "../models/RoomReading.js";
import MainBill from "../models/MainBill.js";


export const calculate_Individual_Bill = async (house_id, cycle_id, formatted_readings) => {
    try {
        if (!formatted_readings || formatted_readings.length === 0) {
            throw new Error("No room readings provided for calculation.");
        }

        // 1. Fetch Main Bill for the current cycle
        const main_bill = await MainBill.findOne({ billing_cycle_id: cycle_id });
        if (!main_bill) {
            throw new Error(`Main bill not found for cycle: ${cycle_id}`);
        }

        const { total_units: main_total_units, total_amount: main_total_amount } = main_bill;
        const num_rooms = formatted_readings.length;
        const cost_per_unit = main_total_amount / main_total_units;

        // 2. Get Previous Cycle ID from House model (Optimal)
        const house = await House.findById(house_id).select("previous_billing_cycle");
        const previous_cycle_id = house ? house.previous_billing_cycle : null;

        if (!previous_cycle_id) {
            throw new Error("Cannot calculate bills: no previous billing cycle found. Ensure house setup was completed before running calculations.");
        }

        // 3. Fetch all previous readings in one go for efficiency
        let previous_readings_map = {};
        const prev_readings = await RoomReading.find({ billing_cycle_id: previous_cycle_id });
        prev_readings.forEach(r => {
            previous_readings_map[r.room_id.toString()] = r.reading_value;
        });

        if (Object.keys(previous_readings_map).length === 0) {
            console.warn(`Warning: Previous cycle ${previous_cycle_id} exists but has no readings stored. This indicates setup readings were not saved correctly.`);
        }

        // 4. Calculate Raw Consumption and Total
        let total_raw_consumption = 0;
        const room_data = formatted_readings.map(curr => {
            const prev_val = previous_readings_map[curr.room_id.toString()] || 0;
            const raw_cons = curr.reading_value - prev_val;
            total_raw_consumption += raw_cons;
            return {
                room_id: curr.room_id,
                current_reading: curr.reading_value,
                previous_reading: prev_val,
                raw_consumption: raw_cons
            };
        });

        // 5. Unit Adjustment (Equally distributed)
        const unit_diff = main_total_units - total_raw_consumption;
        const unit_adj_per_room = unit_diff / num_rooms;

        // 6. Initial Amount Calculation
        let calculated_room_bills = room_data.map(room => {
            const adjusted_units = room.raw_consumption + unit_adj_per_room;
            const amount = adjusted_units * cost_per_unit;
            
            return {
                room_id: room.room_id,
                billing_cycle_id: cycle_id,
                previous_reading: room.previous_reading,
                current_reading: room.current_reading,
                units_consumed: Number(adjusted_units.toFixed(4)), // Store with precision
                amount: amount // Raw amount for now
            };
        });

        // 7. Final Amount Balancing (Rounding to 2 decimal places and matching main bill)
        let current_sum = 0;
        calculated_room_bills = calculated_room_bills.map(bill => {
            const rounded_amount = Math.round(bill.amount * 100) / 100;
            current_sum += rounded_amount;
            return { ...bill, amount: rounded_amount };
        });

        // Difference due to rounding errors
        let amount_diff = Math.round((main_total_amount - current_sum) * 100) / 100;

        if (amount_diff !== 0) {
            // Distribute the remaining cents equally by adding/subtracting 0.01 at a time
            const adjustment_step = amount_diff > 0 ? 0.01 : -0.01;
            let i = 0;
            while (Math.abs(amount_diff) >= 0.009) { // Avoid floating point precision issues
                calculated_room_bills[i % num_rooms].amount = 
                    Math.round((calculated_room_bills[i % num_rooms].amount + adjustment_step) * 100) / 100;
                amount_diff = Math.round((amount_diff - adjustment_step) * 100) / 100;
                i++;
            }
        }

        // 8. Final Validation Step
        const final_sum = calculated_room_bills.reduce((acc, bill) => acc + bill.amount, 0);
        if (Math.abs(main_total_amount - final_sum) > 0.01) {
            throw new Error(`Critical calculation error: Sum of room bills (${final_sum}) does not match main bill amount (${main_total_amount}).`);
        }

        return calculated_room_bills;

    } catch (error) {
        console.error("Error in calculate_Individual_Bill:", error);
        throw error; // Let the route handle the error response
    }
};
