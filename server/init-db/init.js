import mongoose from "mongoose";

import MainBill from "../models/main_bill.js";
import Room from "../models/rooms.js";
import UnitsInfo from "../models/Units_Info.js";
import User from "../models/user.js";

import { unitsData, roomsData, mainBillData, userData } from "./sample_data.js";

async function init() {
  await mongoose.connect("mongodb://127.0.0.1:27017/LiteBill");


  await UnitsInfo.deleteMany({});
  await Room.deleteMany({});
  await MainBill.deleteMany({});
  await User.deleteMany({});


  await UnitsInfo.insertMany(unitsData);
  await Room.insertMany(roomsData);
  await MainBill.create(mainBillData);
  await User.create(userData);

  console.log("✅ Sample Data Inserted");

  mongoose.connection.close();
}

init();