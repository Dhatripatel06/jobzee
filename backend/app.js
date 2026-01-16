import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import fileUpload from "express-fileupload";

import { dbConnection } from "./database/dbConnection.js";
import jobRouter from "./routes/jobRouter.js";
import userRouter from "./routes/userRouter.js";
import applicationRouter from "./routes/applicationRouter.js";
import messageRouter from "./routes/messageRouter.js";
import { errorMiddleware } from "./middlewares/error.js";

dotenv.config({ path: "./config/config.env" });

const app = express();

/* ================================
   CORS CONFIG (MUST BE FIRST)
================================ */
app.use(
  cors({
    origin: ["https://jobzee-two.vercel.app", "http://localhost:5173"],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
  })
);

// Handle preflight requests
app.options("*", cors());

/* ================================
   HEALTH CHECK
================================ */
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "🚀 JobZee Backend is Live and Running!",
  });
});

/* ================================
   MIDDLEWARES
================================ */
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp/",
  })
);

/* ================================
   ROUTES
================================ */
app.use("/api/v1/user", userRouter);
app.use("/api/v1/application", applicationRouter);
app.use("/api/v1/job", jobRouter);
app.use("/api/v1/message", messageRouter);

/* ================================
   DB CONNECTION
================================ */
dbConnection();

/* ================================
   ERROR HANDLER
================================ */
app.use(errorMiddleware);

export default app;