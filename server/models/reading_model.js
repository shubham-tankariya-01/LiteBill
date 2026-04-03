import mongoose from "mongoose";
const Schema = mongoose.Schema;

const ReadingSchema = new Schema({
  room: { type: mongoose.Schema.Types.ObjectId, ref: 'Room' },
  previous: Number,
  current: Number,
  units: Number,
  date: { type: Date, default: Date.now }
});

export default mongoose.model('Reading', ReadingSchema);