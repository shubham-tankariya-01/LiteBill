export const errorHandler = (err, req, res, next) => {
    console.error("Unhandled Error:", err);
    res.status(err.status || 500);
    res.render("error", { 
        message: err.message || "Internal Server Error",
        error: process.env.NODE_ENV === "production" ? {} : err
    });
};
