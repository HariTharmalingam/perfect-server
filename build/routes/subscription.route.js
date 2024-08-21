"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const subscription_controller_1 = require("../controllers/subscription.controller");
const auth_1 = require("../middleware/auth");
const subscriptionRouter = express_1.default.Router();
// subscriptionRouter.post("/subscription-update/",isAutheticated, SubscriptionUpdate);
subscriptionRouter.get('/stripe-key', (req, res) => {
    res.json({ publishableKey: process.env.STRIPE_PUBLISHABLE_KEY });
});
subscriptionRouter.post("/create-subscription", auth_1.isAutheticated, subscription_controller_1.createSubscription);
subscriptionRouter.post("/create-customer", auth_1.isAutheticated, subscription_controller_1.createCustomer);
subscriptionRouter.post("/create-payment-intent", auth_1.isAutheticated, subscription_controller_1.createPaymentIntent);
subscriptionRouter.post('/webhook', express_1.default.raw({ type: 'application/json' }), subscription_controller_1.stripeWebhook);
exports.default = subscriptionRouter;
