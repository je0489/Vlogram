import express from "express";
import { registerView, createComment, deleteComment } from "../controllers/videoController";

const apiRouter = express.Router();
apiRouter.post( "/videos/:id([0-9a-f]{24})/view", registerView );
apiRouter.post("/videos/:id([0-9a-f]{24})/comment", createComment);
apiRouter.delete("/users/:uid/videos/:vid([0-9a-f]{24})/comments/:cid([0-9a-f]{24})", deleteComment);

export default apiRouter;