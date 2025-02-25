import express from "express";
import { connectDB } from "./lib/db.js";
import dotenv from "dotenv";
import { router } from "./routers/adminRouter.js";
import { userRouter } from "./routers/userRouter.js";
import cors from "cors";

const app = express();
dotenv.config();
const port = process.env.PORT
app.use(express.json());
app.use(cors());
app.use("/", router);
app.use("/user", userRouter);

app.listen(port, () => {
  console.log("Server Is Running On Port",port);
  connectDB();
});
