import mongoose from "mongoose";

const { ObjectId } = mongoose.Types;

// 🔷 Create IDs manually
const unit1Id = new ObjectId();
const unit2Id = new ObjectId();
const unit3Id = new ObjectId();
const unit4Id = new ObjectId();
const unit5Id = new ObjectId();

const room1Id = new ObjectId();
const room2Id = new ObjectId();
const room3Id = new ObjectId();
const room4Id = new ObjectId();
const room5Id = new ObjectId();

const mainBillId = new ObjectId();

// 🔷 Units Info
export const unitsData = [
  {
    _id: unit1Id,
    room: room1Id,
    previous_reading: 100,
    current_reading: 150,
    bill_amount: 500
  },
  {
    _id: unit2Id,
    room: room2Id,
    previous_reading: 200,
    current_reading: 260,
    bill_amount: 700
  },
  {
    _id: unit3Id,
    room: room3Id,
    previous_reading: 50,
    current_reading: 90,
    bill_amount: 300
  },
  {
    _id: unit4Id,
    room: room4Id,
    previous_reading: 80,
    current_reading: 140,
    bill_amount: 450
  },
  {
    _id: unit5Id,
    room: room5Id,
    previous_reading: 120,
    current_reading: 180,
    bill_amount: 600
  }
];

// 🔷 Rooms (reference UnitsInfo)
export const roomsData = [
  {
    _id: room1Id,
    room_name: "Room 1"
  },
  {
    _id: room2Id,
    room_name: "Room 2"
  },
  {
    _id: room3Id,
    room_name: "Room 3"
  },
  {
    _id: room4Id,
    room_name: "Room 4"
  },
  {
    _id: room5Id,
    room_name: "Room 5"
  }
];

// 🔷 Main Bill
export const mainBillData = {
  _id: mainBillId,
  main_units: 400,
  main_total_bill_amount: 5000
};

// 🔷 User (reference rooms + bill)
export const userData = {
  user_name: "Shubham",
  mobile_number: "9999999999",
  house_id: "HOUSE_1",
  rooms: [
    { room_id: room1Id },
    { room_id: room2Id },
    { room_id: room3Id },
    { room_id: room4Id },
    { room_id: room5Id }
  ],
  bills: [
    {
      bill_id: mainBillId,
      date: new Date()
    }
  ]
};