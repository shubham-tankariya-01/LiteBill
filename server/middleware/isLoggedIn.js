export const isLoggedIn = (req, res, next) => {
    const url = req.originalUrl.split('?')[0]; // strip query string
    const isOpen = (
        url === '/' ||
        url.startsWith('/auth') ||
        url.startsWith('/public')
    );
    if (isOpen) return next();

    if (!req.session || !req.session.userId) {
        return res.redirect('/auth/login');
    }
    
    next();
};
