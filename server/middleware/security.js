import rateLimit from "express-rate-limit";

export const csrfProtection = (req, res, next) => {
    // Skip safe methods
    if (req.method === "GET" || req.method === "HEAD" || req.method === "OPTIONS") {
        return next();
    }

    const host = req.headers.host;
    const origin = req.headers.origin;
    const referer = req.headers.referer;

    // Check Origin header if present
    if (origin) {
        try {
            const originUrl = new URL(origin);
            if (originUrl.host !== host) {
                const err = new Error("CSRF Protection: Origin mismatch.");
                err.status = 403;
                return next(err);
            }
            return next();
        } catch (e) {
            const err = new Error("CSRF Protection: Invalid Origin header.");
            err.status = 400;
            return next(err);
        }
    }

    // Fallback to Referer check if Origin is absent
    if (referer) {
        try {
            const refererUrl = new URL(referer);
            if (refererUrl.host !== host) {
                const err = new Error("CSRF Protection: Referer mismatch.");
                err.status = 403;
                return next(err);
            }
            return next();
        } catch (e) {
            const err = new Error("CSRF Protection: Invalid Referer header.");
            err.status = 400;
            return next(err);
        }
    }

    // For state-changing requests from browsers, one of these headers must be present
    const err = new Error("CSRF Protection: Missing Origin or Referer header.");
    err.status = 403;
    return next(err);
};

export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 100, // Limit each IP to 100 requests per window
    standardHeaders: 'draft-6', // standard rate limit headers
    legacyHeaders: false, // Disable older headers
    handler: (req, res, next, options) => {
        const err = new Error(options.message || "Too many requests, please try again later.");
        err.status = 429;
        next(err);
    }
});
