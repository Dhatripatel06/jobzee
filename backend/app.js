

import express from "express";
import { dbConnection } from "./database/dbConnection.js";
import jobRouter from "./routes/jobRouter.js";
import userRouter from "./routes/userRouter.js";
import applicationRouter from "./routes/applicationRouter.js";
import messageRouter from "./routes/messageRouter.js";
import { config } from "dotenv";
import cors from "cors";
import { errorMiddleware } from "./middlewares/error.js";
import cookieParser from "cookie-parser";
import fileUpload from "express-fileupload";
import dotenv from "dotenv";

const app = express();
dotenv.config({ path: "./config/config.env" });

// Add this block
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "JobZee Backend is Live and Running!"
  });
});

app.use(
  cors({
    origin: ["https://jobzee-seven.vercel.app"], // Your actual Vercel URL
    methods: ["GET", "POST", "DELETE", "PUT"],
    credentials: true,
  })
);

// Add headers for CORS and PDF viewing
//app.use((req, res, next) => {
 // res.header("Access-Control-Allow-Origin", req.headers.origin || "*");
 // res.header("Access-Control-Allow-Credentials", "true");
 // res.header("Access-Control-Allow-Methods", "GET, POST, DELETE, PUT, OPTIONS");
 // res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
 // res.header("Access-Control-Expose-Headers", "Content-Disposition, Content-Type");
  
  // Allow embedding in iframes (if serving files directly)
 // res.removeHeader("X-Frame-Options");
  
  //if (req.method === "OPTIONS") {
 //   return res.sendStatus(200);
 // }
 // next();
//});

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp/",
  })
);
app.use("/api/v1/user", userRouter);
app.use("/api/v1/application", applicationRouter);
app.use("/api/v1/job", jobRouter);
app.use("/api/v1/message", messageRouter);
dbConnection();

app.use(errorMiddleware);
export default app;