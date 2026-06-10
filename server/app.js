import "dotenv/config";
import express from "express";
import mongoose from "mongoose";
import session from "express-session";
import MongoStore from "connect-mongo";
import path from "path";
import { fileURLToPath } from "url";
import ejsMate from "ejs-mate";

// Routes
import indexRoute from "./routes/index.js";
import authRoute from "./routes/auth.js";
import housesRoute from "./routes/houses.js";
import roomsRoute from "./routes/rooms.js";
import cyclesRoute from "./routes/cycles.js";
import mainBillsRoute from "./routes/main_bills.js";
import readingsRoute from "./routes/readings.js";
import roomBillsRoute from "./routes/room_bills.js";

// Models
import House from "./models/House.js";

// Middleware
import { isLoggedIn } from "./middleware/isLoggedIn.js";
import { csrfProtection } from "./middleware/security.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { verifyHouse, verifyCycle } from "./middleware/verifyOwner.js";

// ── Constants ────────────────────────────────────────────────────────────────
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
app.set("trust proxy", 1); // Trust Vercel's reverse proxy for secure cookies
const port = process.env.PORT || 8080;
const dbUrl = process.env.MONGO_URL || "mongodb://127.0.0.1:27017/LiteBill";

if (!process.env.SESSION_SECRET && process.env.NODE_ENV === "production") {
    throw new Error("SESSION_SECRET environment variable must be set in production!");
}
const sessionSecret = process.env.SESSION_SECRET || "dev_fallback_secret_not_for_production";

// ── Template Engine ──────────────────────────────────────────────────────────
app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "../client/views"));

// ── Body Parsing ─────────────────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Static Files ─────────────────────────────────────────────────────────────
app.use("/public", express.static(path.join(__dirname, "../client/public")));

// ── Method Override ──────────────────────────────────────────────────────────
app.use((req, res, next) => {
    if (req.query && req.query._method) {
        req.method = req.query._method.toUpperCase();
    } else if (req.body && req.body._method) {
        req.method = req.body._method.toUpperCase();
    }
    next();
});

// ── Database Connection ───────────────────────────────────────────────────────
main()
    .then(() => console.log("Connected to DB"))
    .catch((err) => console.error("DB connection error:", err));

async function main() {
    const dbName = process.env.MONGO_DB_NAME || "LiteBill";
    await mongoose.connect(dbUrl, { dbName: dbName });
}

// ── Session (MongoDB-backed) ─────────────────────────────────────────────────
app.use(
    session({
        secret: sessionSecret,
        resave: false,
        saveUninitialized: false,
        store: MongoStore.create({
            mongoUrl: dbUrl,
            dbName: process.env.MONGO_DB_NAME || "LiteBill",
            collectionName: "sessions",
            ttl: 24 * 60 * 60, // 1 day in seconds
        }),
        cookie: {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production", // HTTPS only in production
            sameSite: "lax",                               // Blocks cross-site form submissions
            maxAge: 24 * 60 * 60 * 1000,                  // 1 day in milliseconds
        },
    })
);

// ── CSRF Protection ──────────────────────────────────────────────────────────
app.use(csrfProtection);

// ── Authentication Check ─────────────────────────────────────────────────────
app.use(isLoggedIn);

// ── Navbar Houses (Global) ───────────────────────────────────────────────────
app.use(async (req, res, next) => {
    try {
        res.locals.currentPath = req.path;
        res.locals.navHouses = [];
        if (req.session && req.session.userId && mongoose.connection.readyState === 1) {
            res.locals.navHouses = await House.find({ user_id: req.session.userId });
        }
    } catch (err) {
        console.error("Error fetching houses for navbar:", err);
        res.locals.navHouses = [];
    }
    next();
});

// ── Routes ────────────────────────────────────────────────────────────────────
app.use("/", indexRoute);
app.use("/auth", authRoute);
app.use("/houses", housesRoute);
app.use("/houses/:houseId/rooms", verifyHouse, roomsRoute);
app.use("/rooms", roomsRoute);
app.use("/houses/:houseId/cycles", verifyHouse, cyclesRoute);
app.use("/cycles", cyclesRoute);
app.use("/houses/:houseId/main-bill", verifyHouse, mainBillsRoute);
app.use("/houses/:houseId/readings", verifyHouse, readingsRoute);
app.use("/houses/:houseId/cycles/:cycleId/readings", verifyHouse, verifyCycle, readingsRoute);
app.use("/cycles/:cycleId/room-bills", verifyCycle, roomBillsRoute);

// ── Error Handler ────────────────────────────────────────────────────────────
app.use(errorHandler);

// ── Start Server ─────────────────────────────────────────────────────────────
app.listen(port, () => {
    console.log(`App is listening on port ${port}`);
});
