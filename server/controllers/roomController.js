import Room from "../models/Room.js";
import House from "../models/House.js";
import RoomBill from "../models/RoomBill.js";
import RoomReading from "../models/RoomReading.js";

// GET /houses/:houseId/rooms
export const getRooms = async (req, res, next) => {
    try {
        const rooms = await Room.find({ house_id: req.params.houseId }).populate("house_id");
        const house = await House.findById(req.params.houseId);
        if (!house) return res.status(404).send('Resource not found');

        const roomData = {};
        for (let room of rooms) {
            const latestBill = await RoomBill.findOne({ room_id: room._id }).sort({ createdAt: -1 });
            const latestReading = await RoomReading.findOne({ room_id: room._id }).sort({ createdAt: -1 });
            roomData[room._id.toString()] = { latestBill, latestReading };
        }

        res.render("rooms/index", { rooms, house, roomData });
    } catch (err) {
        next(err);
    }
};

// GET /houses/:houseId/rooms/new
export const getNewRoomForm = (req, res) => {
    res.render("rooms/new", { houseId: req.params.houseId });
};

// POST /houses/:houseId/rooms
export const createRooms = async (req, res, next) => {
    try {
        const { meters } = req.body;
        if (meters && meters.length > 0) {
            const roomPromises = meters.map(meter => {
                return new Room({
                    house_id: req.params.houseId,
                    meter_name: meter
                }).save();
            });
            await Promise.all(roomPromises);
        }
        res.json({ message: "Success" });
    } catch (err) {
        next(err);
    }
};

// GET /rooms/:roomId
export const getRoom = async (req, res, next) => {
    try {
        const room = await Room.findById(req.params.roomId).populate("house_id");
        if (!room) return res.status(404).send('Resource not found');
        
        const roomBills = await RoomBill.find({ room_id: room._id })
            .populate("billing_cycle_id")
            .sort({ createdAt: -1 });

        res.render("rooms/show", { room, roomId: room._id, roomBills, house: room.house_id });
    } catch (err) {
        next(err);
    }
};

// GET /rooms/:roomId/edit
export const getEditRoomForm = async (req, res, next) => {
    try {
        const room = await Room.findById(req.params.roomId);
        if (!room) return res.status(404).send('Resource not found');
        res.render("rooms/edit", { room });
    } catch (err) {
        next(err);
    }
};

// PUT /rooms/:roomId
export const updateRoom = async (req, res, next) => {
    try {
        const { meter_name } = req.body;
        const room = await Room.findByIdAndUpdate(req.params.roomId, { meter_name }, { new: true });
        if (!room) return res.status(404).send('Resource not found');
        res.redirect(`/houses/${room.house_id}/rooms`);
    } catch (err) {
        next(err);
    }
};

// DELETE /rooms/:roomId
export const deleteRoom = async (req, res, next) => {
    try {
        const room = await Room.findById(req.params.roomId);
        if (!room) return res.status(404).send('Resource not found');
        
        const houseId = room.house_id;
        
        await Room.findByIdAndDelete(req.params.roomId);
        await RoomBill.deleteMany({ room_id: req.params.roomId });
        await RoomReading.deleteMany({ room_id: req.params.roomId });

        res.redirect(`/houses/${houseId}/rooms`);
    } catch (err) {
        next(err);
    }
};

// GET /rooms/:roomId/analysis
export const getRoomAnalysis = async (req, res, next) => {
    try {
        const room = await Room.findById(req.params.roomId).populate("house_id");
        if (!room) return res.status(404).send('Resource not found');
        
        const roomBills = await RoomBill.find({ room_id: room._id })
            .populate("billing_cycle_id")
            .sort({ createdAt: 1 });

        res.render("rooms/analysis", { room, roomId: req.params.roomId, roomBills, house: room.house_id });
    } catch (err) {
        next(err);
    }
};
