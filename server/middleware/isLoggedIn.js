export const isLoggedIn = (req, res, next) => {
    const url = req.originalUrl.split('?')[0]; // strip query string
    const isOpen = (
        url === '/' ||
        url === '/auth/login' ||
        url === '/auth/signup' ||
        url.startsWith('/public')
    );
    if (isOpen) return next();

    if (!req.session || !req.session.userId) {
        return res.redirect('/auth/login');
    }
    
    // Attach to res.locals for EJS views
    res.locals.user = { _id: req.session.userId, mobile_number: req.session.mobileNumber };
    
    next();
};
