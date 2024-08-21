require("dotenv").config();
import express, { NextFunction, Request, Response } from "express";
export const app = express();
import cors from "cors";
import cookieParser from "cookie-parser";
import { ErrorMiddleware } from "./middleware/error";
import userRouter from "./routes/user.route";
import layoutRouter from "./routes/layout.route";
import programRouter from "./routes/program.route";
import subscriptionRouter from "./routes/subscription.route";
import notificationRouter from "./routes/notification.route";

import { rateLimit } from "express-rate-limit";

// body parser
app.use(express.json({ limit: "50mb" }));

// cookie parser
app.use(cookieParser());

app.use(
  cors({
    origin: "*", // Autorise toutes les origines
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// api requests limit
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: "draft-7",
  legacyHeaders: false,
});
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});
// routes
app.use(
  "/api",
  userRouter,
  layoutRouter,
  programRouter,
  notificationRouter,
  subscriptionRouter
);

// testing api
app.get("/test", (req: Request, res: Response, next: NextFunction) => {
  res.status(200).json({
    success: true,
    message: "API is working",
  });
});

// unknown route
app.all("*", (req: Request, res: Response, next: NextFunction) => {
  const err = new Error(`Route ${req.originalUrl} not found`) as any;
  err.statusCode = 404;
  next(err);
});

// middleware calls
app.use(limiter);
app.use(ErrorMiddleware);
