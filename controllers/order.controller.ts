import { NextFunction, Request, Response } from "express";
import { CatchAsyncError } from "../middleware/catchAsyncErrors";
import ErrorHandler from "../utils/ErrorHandler";
import { IOrder } from "../models/order.Model";
import userModel from "../models/user.model";
import SubscriptionModel, { ISubscription } from "../models/subscription.Model";
import path from "path";
import ejs from "ejs";
import sendMail from "../utils/sendMail";
import NotificationModel from "../models/notification.Model";
import { getAllOrdersService, newOrder } from "../services/order.service";
import { redis } from "../utils/redis";
require("dotenv").config();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

// create order for mobile
export const createMobileOrder = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { programId, payment_info } = req.body as IOrder;
      const user = await userModel.findById(req.user?._id);

      const programExistInUser = user?.programs.some(
        (program: any) => program._id.toString() === programId
      );

      if (programExistInUser) {
        return next(
          new ErrorHandler("You have already purchased this program", 400)
        );
      }

      const subscription: ISubscription | null = await SubscriptionModel.findById(subscriptionId);

      if (!subscription) {
        return next(new ErrorHandler("Subscription not found", 404));
      }

      const data: any = {
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

      const html = await ejs.renderFile(
        path.join(__dirname, "../mails/order-confirmation.ejs"),
        { order: mailData }
      );

      try {
        if (user) {
          await sendMail({
            email: user.email,
            subject: "Confirmation de commande",
            template: "order-confirmation.ejs",
            data: mailData,
          });
        }
      } catch (error: any) {
        return next(new ErrorHandler(error.message, 500));
      }
      //TODO resultat du push?
      user?.programs.push(subscription?._id);

      await redis.set(req.user?._id, JSON.stringify(user));

      await user?.save();

      await NotificationModel.create({
        user: user?._id,
        title: "Nouvelle commande",
        message: `Nouvelle commande de ${subscription?.name}`,
      });

      subscription.purchased = subscription.purchased + 1;

      await subscription.save();

      newOrder(data, res, next);
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

//  send stripe publishble key
export const sendStripePublishableKey = CatchAsyncError(
  async (req: Request, res: Response) => {
    res.status(200).json({
      publishablekey: process.env.STRIPE_PUBLISHABLE_KEY,
    });
  }
);

// new payment
export const newPayment = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
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
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);


export const createSubcription = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const customer = await stripe.customers.create({
        email: req.body.email,
        source: req.body.stripeToken,
      });

      const subscription = await stripe.subscriptions.create({
        customer: customer.id,
        items: [{ plan: req.body.plan }],
      });
    
      res.json({ subscription });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);
