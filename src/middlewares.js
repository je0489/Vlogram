import multer from "multer";
import multerS3 from "multer-s3";
import aw3 from "aws-sdk";

const s3 = new aw3.S3({
    credentials: {
        accessKeyId: process.env.AWS_ID,
        secretAccessKey: process.env.AWS_SECRET
    }
});
const isHeroku = process.env.NODE_ENV === "production";

const s3imageUploader = multerS3({
    s3,
    bucket: "vlogram/images",
    acl: "public-read"
});

const s3videoUploader = multerS3({
    s3,
    bucket: "vlogram/videos",
    acl: "public-read"
});

export const localsMiddleware = ( req, res, next ) => {
    res.locals.loggedIn = Boolean( req.session.loggedIn );
    res.locals.mainTitle = "Vlogram";
    res.locals.loggedInUser = req.session.user || {};
    res.locals.isHeroku = isHeroku;
    console.log( req.session.user );
    next();
};

export const protectorMiddleware = ( req, res, next ) => {
    if( req.session.loggedIn )
        return next();
    else {
        req.flash("error", "Log in first.");
        return res.redirect( "/login" );
    }
};

export const publicOnlyMiddleware = ( req, res, next ) => {
    if( !req.session.loggedIn )
        return next();
    else {
        req.flash("error", "Not authorized");
        return res.redirect( "/" );
    }
};

export const avatarUpload = multer( { 
    dest: "uploads/avatars/",
     limits: {
        fileSize: 3000000
    },
    storage: isHeroku ? s3imageUploader : undefined 
} );
export const videoUpload = multer( { 
    dest: "uploads/videos/", 
    limits: {
        fileSize: 10000000
    },  
    storage: isHeroku ? s3videoUploader : undefined  
} );