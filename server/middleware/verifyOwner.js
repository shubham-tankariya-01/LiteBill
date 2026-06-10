import House from "../models/House.js";
import Room from "../models/Room.js";
import BillingCycle from "../models/BillingCycle.js";
import MainBill from "../models/MainBill.js";

export const verifyHouse = async (req, res, next) => {
    try {
        const houseId = req.params.houseId;
        if (!houseId) {
            const err = new Error("House ID is missing");
            err.status = 400;
            return next(err);
        }

        const house = await House.findOne({ _id: houseId, user_id: req.session.userId });
        if (!house) {
            const err = new Error("Forbidden: You do not own this house.");
            err.status = 403;
            return next(err);
        }
        next();
    } catch (err) {
        next(err);
    }
};

export const verifyRoom = async (req, res, next) => {
    try {
        const roomId = req.params.roomId;
        if (!roomId) {
            const err = new Error("Room ID is missing");
            err.status = 400;
            return next(err);
        }

        const room = await Room.findById(roomId).populate("house_id");
        if (!room) {
            const err = new Error("Resource not found");
            err.status = 404;
            return next(err);
        }

        if (!room.house_id || room.house_id.user_id.toString() !== req.session.userId.toString()) {
            const err = new Error("Forbidden: You do not own this room.");
            err.status = 403;
            return next(err);
        }
        next();
    } catch (err) {
        next(err);
    }
};

export const verifyCycle = async (req, res, next) => {
    try {
        const cycleId = req.params.cycleId;
        if (!cycleId) {
            const err = new Error("Cycle ID is missing");
            err.status = 400;
            return next(err);
        }

        const cycle = await BillingCycle.findById(cycleId).populate("house");
        if (!cycle) {
            const err = new Error("Resource not found");
            err.status = 404;
            return next(err);
        }

        if (!cycle.house || cycle.house.user_id.toString() !== req.session.userId.toString()) {
            const err = new Error("Forbidden: You do not own this billing cycle.");
            err.status = 403;
            return next(err);
        }
        next();
    } catch (err) {
        next(err);
    }
};

export const verifyMainBill = async (req, res, next) => {
    try {
        const billId = req.params.billId;
        if (!billId) {
            const err = new Error("Bill ID is missing");
            err.status = 400;
            return next(err);
        }

        const mainBill = await MainBill.findById(billId).populate("house_id");
        if (!mainBill) {
            const err = new Error("Resource not found");
            err.status = 404;
            return next(err);
        }

        if (!mainBill.house_id || mainBill.house_id.user_id.toString() !== req.session.userId.toString()) {
            const err = new Error("Forbidden: You do not own this main bill.");
            err.status = 403;
            return next(err);
        }
        next();
    } catch (err) {
        next(err);
    }
};
