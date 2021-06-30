import express from "express";
import rootRouter from "./routers/rootRouter";
import {
    localsMiddleware
} from "./middlewares";

const app = express();

app.set("view engine", "pug");
app.set("views", process.cwd() + "/src/views");

app.use(localsMiddleware);
app.use("/", rootRouter);

export default app;