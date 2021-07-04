import User from "../models/User";
import Video from "../models/Video";
import Comment from "../models/Comment";
import message from "../message";

export const home = async (req, res) => {
  try {
    const videos = await Video.find({})
      .sort( { createdAt: "desc" })
      .populate( "owner" );
    return res.render( "home", { pageTitle: "Home", videos } );
  } catch ( e ) {
    return res.status(404).render( "404", { pageTitle: "Error", e } );
  }
}
export const watch = async ( req, res ) => {
  const { id } = req.params;
  const video = await Video.findById(id).populate("owner");
  const comments = await Comment.find({ video: id }).populate("owner");
  if( !video )
    return res.render("404", { pageTitle: "Video not found." });
  return res.render("videos/watch", { pageTitle: "Watching video", video, comments });
}
export const getEdit = async (req, res) => {
  const {
    params: { id },
    session: {
      user: { _id }
    }
  } = req;
  const video = await Video.findById(id);
  if (!video) {
    return res.status(404).render("404", { pageTitle: "Video not found." });
  }
  if (String(video.owner) !== String(_id)) {
    req.flash("error", "Not authorized");
    return res.status(403).redirect("/");
  }
  return res.render("videos/edit", { pageTitle: "Edit video", video });
}
export const postEdit = async ( req, res ) => {
    const {
      params: { id },
      session: { user: { _id } },
      body: { description, hashtags }
    } = req;
    const video = await Video.findById( { _id: id } );
    if( !video )
      return res.status(404).render( "404", { pageTitle: "Video not found" } );
    if( String( video.owner ) !== String( _id ) ) {
      req.flash("error", "You are not the the owner of the video.");
      return res.status( 403 ).redirect( "/" );
    }
    await Video.findByIdAndUpdate( id, {
      description,       
      hashtags: Video.formatHashtags( hashtags )
    } );
    req.flash("success", "Changes saved.");
    return res.redirect( `/videos/${id}`);
}
export const getUpload = ( req, res ) => res.render("videos/upload", { pageTitle: "Uploading Video" });
export const postUpload = async ( req, res ) => {
  const { 
      session: { user: { _id } },
      files: { video, thumb },
      body: { description, hashtags }
    } = req;
  const isHeroku = process.env.NODE_ENV === "production";
  try {
    const newVideo = await Video.create({
      owner: _id,
      fileUrl: isHeroku ? video[0].location : video[0].path,
      thumbUrl: isHeroku ? thumb[0].location : thumb[0].path,
      description,
      hashtags: Video.formatHashtags( hashtags )
    });
    const user = await User.findById( _id );
    user.videos.push( newVideo );
    user.save(); 
    req.flash(message.type.s, message.msg.video.uploadSuccess);
    return res.redirect("/");
  } catch (e) {
    req.flash(message.type.e, e._message);
    return res.status(400).render("videos/upload", { pageTitle: "Upload Video" });
  };
}
export const deleteVideo = async ( req, res ) => {
  const { 
      params: { id },
      session: { user: { _id } }
    } = req;
  const video = await Video.findById( id );
  if( !video )
    return res.satus( 404 ).render( "404", { pageTitle: "Video not found." } );
  if( String( video.owner ) !== String( _id ) )
    return res.satus( 403 ).redirect( "/" );
  if(video.comments.length > 0) {
    const comments = await Comment.find({ video });
    await Comment.findByIdAndDelete(comments._id);
  }
  await Video.findByIdAndDelete( id );
  return res.redirect( "/" );
}
export const search = async ( req, res ) => {
  const { query: { keyword } } = req;
  let videos = [];
  if( keyword ) {
    videos = await Video.find({
      hashtags: {
        $regex: new RegExp( keyword, "i" ) 
      }
    }).populate("owner");
  }
  return res.render( "videos/search", { pageTitle: "Search", keyword, videos } );
}
export const registerView = async ( req, res ) => {
  const { params: { id }  } = req;
  const video = await Video.findById( id );
  if( !video )
    return res.sendStatus( 404 );
  video.meta.views += 1;
  await video.save();
  return res.sendSatus( 200 );
}
export const createComment = async (req, res) => {
  const {
    session: { user },
    body: { text },
    params: { id },
  } = req;
  const video = await Video.findById(id);
  if (!video) {
    return res.sendStatus(404);
  }
  const comment = await Comment.create({
    text,
    owner: user._id,
    video: id,
  });
  video.comments.push(comment._id);
  video.save();
  return res.status(201).json({ newCommentId: comment._id, userId: user.id, user_id: user._id });
}
export const deleteComment = async (req, res) => {
  const { session: { user: { id } },
    params: { uid, vid, cid } 
  } = req;
  try {
    console.log( id, uid );
    if( id !== uid )
      return res.sendStatus(400);
    const video = await Video.findById(vid);
    if(!video)
      return res.sendStatus(400);
    await Comment.findByIdAndDelete( cid );
    video.comments.pull(cid);
    video.save();
    return res.sendStatus(200);
  } catch (e) {
    return res.sendStatus(400);
  }
};