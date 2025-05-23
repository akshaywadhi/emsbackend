import express from "express";
import { connectDB } from "./lib/db.js";
import dotenv from "dotenv";
import { router } from "./routers/adminRouter.js";
import { userRouter } from "./routers/userRouter.js";
import cors from "cors";

dotenv.config();

const app = express();
const port = process.env.PORT;

app.use(express.json());
app.use(cors({
  origin: "https://emsfrontend-phi.vercel.app",
  credentials: true,
}));

app.use("/", router);
app.use("/user", userRouter);


async function startServer() {
  try {
    await connectDB(); 
    app.listen(port, () => {
      console.log("Server Is Running On Port", port);
    });
  } catch (error) {
    console.error("Failed to connect to DB:", error);
    process.exit(1); 
  }
}

startServer();
