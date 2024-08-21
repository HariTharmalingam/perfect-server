import express from "express";
import {
  createSubscription,
  createCustomer,
  createPaymentIntent,
  stripeWebhook,
  sendStripePublishableKey,
} from "../controllers/subscription.controller";
import { authorizeRoles, isAutheticated } from "../middleware/auth";

const subscriptionRouter = express.Router();

// subscriptionRouter.post("/subscription-update/",isAutheticated, SubscriptionUpdate);
subscriptionRouter.get("/stripe-key", sendStripePublishableKey);
subscriptionRouter.post(
  "/create-subscription",
  isAutheticated,
  createSubscription
);
subscriptionRouter.post("/create-customer", isAutheticated, createCustomer);
subscriptionRouter.post(
  "/create-payment-intent",
  isAutheticated,
  createPaymentIntent
);
subscriptionRouter.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  isAutheticated,
  stripeWebhook
);

export default subscriptionRouter;
