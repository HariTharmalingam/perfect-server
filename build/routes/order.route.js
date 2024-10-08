"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const order_controller_1 = require("../controllers/order.controller");
const orderRouter = express_1.default.Router();
orderRouter.post("/create-mobile-order", auth_1.isAutheticated, order_controller_1.createMobileOrder);
orderRouter.get("/payment/stripepublishablekey", order_controller_1.sendStripePublishableKey);
orderRouter.post("/payment", auth_1.isAutheticated, order_controller_1.newPayment);
// orderRouter.post("/create-subscription",createSubcription )
// orderRouter.post("/create-checkout-subscription",createCheckoutSubcription )
exports.default = orderRouter;
