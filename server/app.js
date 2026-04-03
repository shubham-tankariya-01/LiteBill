import express from "express";
import mongoose from "mongoose";
import homeRoute from "./routes/home.js"
const app = express();
const port = 8080;

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

app.use("/home", homeRoute);

app.listen(port ,(req,res)=>{
    console.log(`App is listening on port ${port}`)
});
