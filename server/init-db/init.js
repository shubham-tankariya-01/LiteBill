import mongoose from "mongoose";
import Bill from "../models/bill_model.js";
import Reading from "../models/reading_model.js";
import Room from "../models/room_model.js";
import { rooms, readings, bills } from "./sample_data.js";
const MONGO_URL = "mongodb://127.0.0.1:27017/LiteBill";

main()
  .then(() => {
    console.log("Connected to DB");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect(MONGO_URL);
}

const initializeDb = async () => {

  await Bill.deleteMany({});
  await Reading.deleteMany({});
  await Room.deleteMany({});

  if (
    !Array.isArray(rooms) ||
    rooms.length === 0 ||
    !Array.isArray(readings) ||
    readings.length === 0 ||
    !Array.isArray(bills) ||
    bills.length === 0
  ) {
    throw new Error("Seed data is missing or invalid");
  }
  await Room.insertMany(rooms);
  await Reading.insertMany(readings, { rawResult: true });
  await Bill.insertMany(bills, { rawResult: true });
  console.log("Data saved successfully");
};

initializeDb();