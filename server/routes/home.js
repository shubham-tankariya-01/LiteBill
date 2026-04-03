import express from "express";
const router = express.Router();

router.get("/",(req,res)=>{
    res.send(" I am a home working route");
});

export default router;
