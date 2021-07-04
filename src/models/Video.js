import mongoose from "mongoose";

const videoSchema = new mongoose.Schema({
    owner: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" },
    fileUrl: { type:String, required: true },
    thumbUrl: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    description: { type: String, required: true, trim: true, minLength: 3 },
    hashtags: [{ type: String, trim: true }],
    meta: {
        views: { type: Number, default: 0 }
    },
    comments: [
      { type: mongoose.Schema.Types.ObjectId, required: true, ref: "Comment" },
    ]
});

videoSchema.static( 'formatHashtags', function( hashtags ) {
    return hashtags.split( "," ).map( word => word.startsWith( "#" ) ? word : `#${word.trim()}` );
} );

const video = mongoose.model( "Video", videoSchema );
export default video;
