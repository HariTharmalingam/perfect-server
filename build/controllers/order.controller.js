"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.newPayment = exports.sendStripePublishableKey = exports.createMobileOrder = void 0;
const catchAsyncErrors_1 = require("../middleware/catchAsyncErrors");
const ErrorHandler_1 = __importDefault(require("../utils/ErrorHandler"));
const user_model_1 = __importDefault(require("../models/user.model"));
const subscription_model_1 = __importDefault(require("../models/subscription.model"));
const path_1 = __importDefault(require("path"));
const ejs_1 = __importDefault(require("ejs"));
const sendMail_1 = __importDefault(require("../utils/sendMail"));
const notification_Model_1 = __importDefault(require("../models/notification.Model"));
const order_service_1 = require("../services/order.service");
const redis_1 = require("../utils/redis");
require("dotenv").config();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
// create order for mobile
exports.createMobileOrder = (0, catchAsyncErrors_1.CatchAsyncError)(async (req, res, next) => {
    try {
        const { subscriptionId, payment_info } = req.body;
        const user = await user_model_1.default.findById(req.user?._id);
        //TODO
        // const courseExistInUser = user?.courses.some(
        //   (course: any) => course._id.toString() === courseId
        // );
        // if (courseExistInUser) {
        //   return next(
        //     new ErrorHandler("You have already purchased this course", 400)
        //   );
        // }
        const subscription = await subscription_model_1.default.findById(subscriptionId);
        if (!subscription) {
            return next(new ErrorHandler_1.default("Subscription not found", 404));
        }
        const data = {
            subscriptionId: subscription._id,
            userId: user?._id,
            payment_info,
        };
        const mailData = {
            order: {
                _id: subscription._id.toString().slice(0, 6),
                name: subscription.name,
                price: subscription.price,
                date: new Date().toLocaleDateString("en-GB", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                }),
            },
        };
        const html = await ejs_1.default.renderFile(path_1.default.join(__dirname, "../mails/order-confirmation.ejs"), { order: mailData });
        try {
            if (user) {
                await (0, sendMail_1.default)({
                    email: user.email,
                    subject: "Confirmation de commande",
                    template: "order-confirmation.ejs",
                    data: mailData,
                });
            }
        }
        catch (error) {
            return next(new ErrorHandler_1.default(error.message, 500));
        }
        //TODO resultat du push?
        user?.programs.push(subscription?._id);
        await redis_1.redis.set(req.user?._id, JSON.stringify(user));
        await user?.save();
        await notification_Model_1.default.create({
            user: user?._id,
            title: "Nouvelle commande",
            message: `Nouvelle commande de ${subscription?.name}`,
        });
        subscription.purchased = subscription.purchased + 1;
        await subscription.save();
        (0, order_service_1.newOrder)(data, res, next);
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 500));
    }
});
//  send stripe publishble key
exports.sendStripePublishableKey = (0, catchAsyncErrors_1.CatchAsyncError)(async (req, res) => {
    res.status(200).json({
        publishablekey: process.env.STRIPE_PUBLISHABLE_KEY,
    });
});
// new payment
exports.newPayment = (0, catchAsyncErrors_1.CatchAsyncError)(async (req, res, next) => {
    try {
        const myPayment = await stripe.paymentIntents.create({
            amount: req.body.amount,
            currency: "EUR",
            metadata: {
                company: "Perfect",
            },
            automatic_payment_methods: {
                enabled: true,
            },
        });
        res.status(201).json({
            success: true,
            client_secret: myPayment.client_secret,
        });
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 500));
    }
});
