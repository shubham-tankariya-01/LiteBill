import express from "express";
const router = express.Router();
import House from "../models/House.js";
import Room from "../models/Room.js"




router.get("/", async (req, res) => {
    const houses = await House.find();
    console.log(houses);
    res.render("houses/index", { houses });
});

router.post("/", async (req, res) => {
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
        console.error(err);
        res.status(500).send("Server Error");
    }
});


router.get("/:houseId", async (req, res) => {
    const house = await House.findById(req.params.houseId);
    const rooms = await Room.find({ house_id: req.params.houseId });
    res.render("houses/show", { house, rooms });
});

router.get("/:houseId/edit", (req, res) => {
    // Pass house data to view
    res.render("houses/edit", { houseId: req.params.houseId });
});

router.put("/:houseId", (req, res) => {
    res.redirect(`/houses/${req.params.houseId}`);
});

router.delete("/:houseId", (req, res) => {
    res.redirect("/houses");
});

export default router;
