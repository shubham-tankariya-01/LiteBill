import express from "express";
import mongoose from "mongoose";
import indexRoute from "./routes/index.js";
import housesRoute from "./routes/houses.js";
import roomsRoute from "./routes/rooms.js";
import cyclesRoute from "./routes/cycles.js";
import mainBillsRoute from "./routes/main_bills.js";
import readingsRoute from "./routes/readings.js";
import roomBillsRoute from "./routes/room_bills.js";
import authRoute from "./routes/auth.js";
import path from "path";
import { fileURLToPath } from "url";
import ejsMate from "ejs-mate";

// constants
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const port = 8080;


// settings
app.engine('ejs', ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "../client/views"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// static files configuration
app.use("/public", express.static(path.join(__dirname, "../client/public")));


//db-connetion===================================================
main()
  .then(() => {
    console.log("Connected to DB");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/LiteBill');
}
// end

// Routes =========================================================
app.use("/", indexRoute);
app.use("/houses/:houseId/rooms", roomsRoute);
app.use("/rooms", roomsRoute);
app.use("/houses/:houseId/cycles", cyclesRoute);
app.use("/cycles", cyclesRoute);
app.use("/cycles/:cycleId/main-bill", mainBillsRoute);
app.use("/main-bill", mainBillsRoute);
app.use("/houses/:houseId/readings", readingsRoute);
app.use("/cycles/:cycleId/room-bills", roomBillsRoute);
app.use("/houses", housesRoute);
app.use("/auth", authRoute);
app.use("/user", authRoute);

//connecting to the server port...
app.listen(port, (req, res) => {
  console.log(`App is listening on port ${port}`)
});
