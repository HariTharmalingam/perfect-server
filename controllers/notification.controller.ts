import NotificationModel from "../models/notification.Model";
import { NextFunction, Request, Response } from "express";
import { CatchAsyncError } from "../middleware/catchAsyncErrors";
import ErrorHandler from "../utils/ErrorHandler";
import cron from "node-cron";
import axios from "axios";

// get all notifications --- only admin
export const getNotifications = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const notifications = await NotificationModel.find().sort({
        createdAt: -1,
      });

      res.status(201).json({
        success: true,
        notifications,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

// update notification status --- only admin
export const updateNotification = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const notification = await NotificationModel.findById(req.params.id);
      if (!notification) {
        return next(new ErrorHandler("Notification not found", 404));
      } else {
        notification.status
          ? (notification.status = "read")
          : notification?.status;
      }

      await notification.save();

      const notifications = await NotificationModel.find().sort({
        createdAt: -1,
      });

      res.status(201).json({
        success: true,
        notifications,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

// delete notification --- only admin
cron.schedule("0 0 0 * * *", async() => {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  await NotificationModel.deleteMany({status:"read",createdAt: {$lt: thirtyDaysAgo}});
  console.log('Deleted read notifications');
});

export const SubscriptionUpdate = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
        // - Let Apple know we received the notification
        res.status(200).json();
  
        // - Forward the request body as-is to RevenueCat
        axios.post(process.env.REVENUECAT_URL as string, req.body)

        // - Successfully forwarded to RevenueCat
        console.log("Successfully forwarded to RevenueCat", res);
    } catch (error: any) {
        // - Consider a retry to RevenueCat if there's a network error or status code is 5xx
        // - This is optional as RevenueCat should recheck the receipt within a few hours
        console.error("Failed to send notification to RevenueCat", error);    }
  }
      // - Anything else you want to do with the request can go here

);
