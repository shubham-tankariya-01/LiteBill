import mongoose from "mongoose";
const Schema = mongoose.Schema;

const homeBillSchema = new mongoose.Schema({
  totalUnits: Number,
  totalAmount: Number,
  extraUnits: Number, 
  splitType: { type: String, default: 'equal' }, // future use

  rooms: [
    {
      room: { type: mongoose.Schema.Types.ObjectId, ref: 'Room' },
      units: Number,
      extraUnits: Number, 
      finalUnits: Number,
      amount: Number
    }
  ]
});

export default mongoose.model('HomeBill', homeBillSchema);
