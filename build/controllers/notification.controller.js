"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscriptionUpdate = exports.updateNotification = exports.getNotifications = void 0;
const notification_Model_1 = __importDefault(require("../models/notification.Model"));
const catchAsyncErrors_1 = require("../middleware/catchAsyncErrors");
const ErrorHandler_1 = __importDefault(require("../utils/ErrorHandler"));
const node_cron_1 = __importDefault(require("node-cron"));
const axios_1 = __importDefault(require("axios"));
// get all notifications --- only admin
exports.getNotifications = (0, catchAsyncErrors_1.CatchAsyncError)(async (req, res, next) => {
    try {
        const notifications = await notification_Model_1.default.find().sort({
            createdAt: -1,
        });
        res.status(201).json({
            success: true,
            notifications,
        });
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 500));
    }
});
// update notification status --- only admin
exports.updateNotification = (0, catchAsyncErrors_1.CatchAsyncError)(async (req, res, next) => {
    try {
        const notification = await notification_Model_1.default.findById(req.params.id);
        if (!notification) {
            return next(new ErrorHandler_1.default("Notification not found", 404));
        }
        else {
            notification.status
                ? (notification.status = "read")
                : notification?.status;
        }
        await notification.save();
        const notifications = await notification_Model_1.default.find().sort({
            createdAt: -1,
        });
        res.status(201).json({
            success: true,
            notifications,
        });
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 500));
    }
});
// delete notification --- only admin
node_cron_1.default.schedule("0 0 0 * * *", async () => {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    await notification_Model_1.default.deleteMany({ status: "read", createdAt: { $lt: thirtyDaysAgo } });
    console.log('Deleted read notifications');
});
exports.SubscriptionUpdate = (0, catchAsyncErrors_1.CatchAsyncError)(async (req, res, next) => {
    try {
        // - Let Apple know we received the notification
        res.status(200).json();
        // - Forward the request body as-is to RevenueCat
        axios_1.default.post(process.env.REVENUECAT_URL, req.body);
        // - Successfully forwarded to RevenueCat
        console.log("Successfully forwarded to RevenueCat", res);
    }
    catch (error) {
        // - Consider a retry to RevenueCat if there's a network error or status code is 5xx
        // - This is optional as RevenueCat should recheck the receipt within a few hours
        console.error("Failed to send notification to RevenueCat", error);
    }
}
// - Anything else you want to do with the request can go here
);
