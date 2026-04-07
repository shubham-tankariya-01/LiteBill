import express from "express";
import mongoose from "mongoose";
import homeRoute from "./routes/home.js"
import readingsRoute from "./routes/readings.js"
import authRoute from "./routes/auth.js"
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
app.use("/home", homeRoute);
app.use("/readings", readingsRoute);
app.use("/signup", authRoute);

//connecting to the server port...
app.listen(port ,(req,res)=>{
    console.log(`App is listening on port ${port}`)
});
