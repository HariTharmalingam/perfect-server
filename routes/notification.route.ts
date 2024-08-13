import express from "express";
import { authorizeRoles, isAutheticated } from "../middleware/auth";
// import { getNotifications, updateNotification } from "../controllers/notification.controller";
import { SubscriptionUpdate } from "../controllers/notification.controller";
const notificationRouter = express.Router();

// notificationRoute.get(
//   "/get-all-notifications",
//   isAutheticated,
//   authorizeRoles("admin"),
//   getNotifications
// );
// notificationRoute.put("/update-notification/:id", isAutheticated, authorizeRoles("admin"), updateNotification);
notificationRouter.post("/post-notification/v2", isAutheticated, SubscriptionUpdate);
export default notificationRouter;
