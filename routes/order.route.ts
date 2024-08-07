import express from "express";
import { authorizeRoles, isAutheticated } from "../middleware/auth";
import {
  createMobileOrder,
  newPayment,
  sendStripePublishableKey,
  createSubcription
} from "../controllers/order.controller";
const orderRouter = express.Router();

orderRouter.post("/create-mobile-order", isAutheticated, createMobileOrder);

orderRouter.get("/payment/stripepublishablekey", sendStripePublishableKey);

orderRouter.post("/payment", isAutheticated, newPayment);

orderRouter.post("/create-subscription",createSubcription )

export default orderRouter;
