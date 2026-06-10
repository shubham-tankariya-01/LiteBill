import bcrypt from "bcryptjs";
import User from "../models/User.js";
import House from "../models/House.js";
import MainBill from "../models/MainBill.js";
import Room from "../models/Room.js";

// GET /auth/login
export const getLoginPage = (req, res) => {
    if (req.session && req.session.userId) {
        return res.redirect("/dashboard");
    }
    res.render("auth/login", { error: null, mobileValue: "" });
};

// GET /auth/signup
export const getSignupPage = (req, res) => {
    if (req.session && req.session.userId) {
        return res.redirect("/dashboard");
    }
    res.render("auth/signup", { error: null, mobileValue: "" });
};

// POST /auth/signup
export const postSignup = async (req, res, next) => {
    try {
        const { mobile_number, password } = req.body;

        if (!mobile_number || !/^\d{10}$/.test(mobile_number)) {
            return res.render("auth/signup", {
                error: "Mobile number must be exactly 10 digits.",
                mobileValue: mobile_number || ""
            });
        }

        if (!password || password.length < 6) {
            return res.render("auth/signup", {
                error: "Password must be at least 6 characters.",
                mobileValue: mobile_number
            });
        }

        const existingUser = await User.findOne({ mobile_number });
        if (existingUser) {
            return res.render("auth/signup", {
                error: "An account with this mobile number already exists.",
                mobileValue: mobile_number
            });
        }

        const hashedPassword = await bcrypt.hash(password, 12);
        const user = new User({ mobile_number, password: hashedPassword });
        await user.save();

        req.session.userId = user._id;
        req.session.mobileNumber = user.mobile_number;
        res.redirect("/dashboard");
    } catch (err) {
        next(err);
    }
};

// POST /auth/login
export const postLogin = async (req, res, next) => {
    try {
        const { mobile_number, password } = req.body;

        if (!mobile_number || !password) {
            return res.render("auth/login", {
                error: "Please enter your mobile number and password.",
                mobileValue: mobile_number || ""
            });
        }

        const user = await User.findOne({ mobile_number });
        if (!user) {
            return res.render("auth/login", {
                error: "Invalid mobile number or password.",
                mobileValue: mobile_number
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.render("auth/login", {
                error: "Invalid mobile number or password.",
                mobileValue: mobile_number
            });
        }

        req.session.userId = user._id;
        req.session.mobileNumber = user.mobile_number;
        res.redirect("/dashboard");
    } catch (err) {
        next(err);
    }
};

// POST /auth/logout
export const postLogout = (req, res) => {
    req.session.destroy((err) => {
        if (err) console.error("Session destruction error:", err);
        res.redirect("/auth/login");
    });
};

// GET /auth/profile
export const getProfile = async (req, res, next) => {
    try {
        const user = await User.findById(req.session.userId).select("mobile_number createdAt");
        if (!user) {
            req.session.destroy(() => {});
            return res.redirect("/auth/login");
        }
        
        const userId = req.session.userId;
        const houses = await House.find({ user_id: userId });
        const houseIds = houses.map(h => h._id);

        const propertiesCount = houses.length;
        const billsCount = await MainBill.countDocuments({ house_id: { $in: houseIds } });
        const roomsCount = await Room.countDocuments({ house_id: { $in: houseIds } });
        const stats = { propertiesCount, billsCount, roomsCount };

        res.render("auth/profile", { user, stats, error: null, success: null });
    } catch (err) {
        next(err);
    }
};

// POST /auth/change-password
export const postChangePassword = async (req, res, next) => {
    try {
        const userId = req.session.userId;
        const { current_password, new_password } = req.body;
        const user = await User.findById(userId).select("mobile_number createdAt password");
        if (!user) {
            return res.redirect("/auth/login");
        }

        // Fetch scoped stats for profile rendering
        const houses = await House.find({ user_id: userId });
        const houseIds = houses.map(h => h._id);
        const propertiesCount = houses.length;
        const billsCount = await MainBill.countDocuments({ house_id: { $in: houseIds } });
        const roomsCount = await Room.countDocuments({ house_id: { $in: houseIds } });
        const stats = { propertiesCount, billsCount, roomsCount };

        const isMatch = await bcrypt.compare(current_password, user.password);
        if (!isMatch) {
            return res.render("auth/profile", {
                user,
                stats,
                error: "Current password is incorrect.",
                success: null
            });
        }

        if (!new_password || new_password.length < 6) {
            return res.render("auth/profile", {
                user,
                stats,
                error: "New password must be at least 6 characters.",
                success: null
            });
        }

        user.password = await bcrypt.hash(new_password, 12);
        await user.save();

        res.render("auth/profile", {
            user,
            stats,
            error: null,
            success: "Password changed successfully."
        });
    } catch (err) {
        next(err);
    }
};
