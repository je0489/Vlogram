export const localsMiddleware = ( req, res, next ) => {
    res.locals.mainTitle = "Vlogram";
    next();
}