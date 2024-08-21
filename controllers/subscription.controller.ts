import { NextFunction, Request, Response } from "express";
import { CatchAsyncError } from "../middleware/catchAsyncErrors";
import ErrorHandler from "../utils/ErrorHandler";
import UserModel, { IUser } from '../models/user.model';
import SubscriptionModel from "../models/subscription.model";
import ProgramModel from "../models/program.model";
import ejs from "ejs";
import path from "path";
import sendMail from "../utils/sendMail";

import axios from "axios";
import Stripe from 'stripe';
require("dotenv").config();


const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2024-06-20',
});

export const sendStripePublishableKey = CatchAsyncError(
    async (req: Request, res: Response) => {
        res.status(200).json({
            publishablekey: process.env.STRIPE_PUBLISHABLE_KEY,
        });
    }
);

export const createSubscription = CatchAsyncError(
    async (req: Request, res: Response, next: NextFunction) => {
        const { userId, priceId, programId } = req.body;

        const user = await UserModel.findById(userId);
        if (!user) {
            return next(new ErrorHandler('User not found', 404));
        }

        const program = await ProgramModel.findById(programId);
        if (!program) {
            return next(new ErrorHandler('Program not found', 404));
        }

        let customer;
        if (user.stripeCustomerId) {
            customer = await stripe.customers.retrieve(user.stripeCustomerId);
        } else {
            customer = await stripe.customers.create({
                email: user.email,
                metadata: { userId: user._id.toString() },
            });
            user.stripeCustomerId = customer.id;
        }

        const subscription = await stripe.subscriptions.create({
            customer: customer.id,
            items: [{ price: priceId }],
            expand: ['latest_invoice.payment_intent'],
        });

        const newSubscription = new SubscriptionModel({
            user: userId,
            stripeCustomerId: customer.id,
            stripeSubscriptionId: subscription.id,
            stripePriceId: priceId,
            plan: {
                name: subscription.items.data[0].price.nickname,
                price: subscription.items.data[0].price.unit_amount! / 100,
                currency: subscription.items.data[0].price.currency,
                interval: subscription.items.data[0].price.recurring!.interval,
                intervalCount: subscription.items.data[0].price.recurring!.interval_count,
            },
            status: subscription.status,
            currentPeriodStart: new Date(subscription.current_period_start * 1000),
            currentPeriodEnd: new Date(subscription.current_period_end * 1000),
            engagementStartDate: new Date(),
            engagementEndDate: new Date(subscription.current_period_end * 1000),
            program: programId,
        });

        await newSubscription.save();

        // Mise à jour de l'utilisateur
        user.role = 'subscriber';
        user.programs = {
            programId: program._id,
            purchasedDay: new Date(),
            startDate: new Date(),
            subscriptionEndDate: newSubscription.currentPeriodEnd,
            isSubscription: true,
            stripePriceId: priceId
        };
        await user.save();

        const mailData = {
            subscription: {
                _id: subscription._id.toString().slice(0, 6),
                name: subscription.name,
                price: subscription.price,
                date: subscription.engagementStartDate,
            },
        };
        const html = await ejs.renderFile(
            path.join(__dirname, "../mails/subscription.ejs"),
            { subscription: mailData }
        );


        res.status(201).json({
            success: true,
            subscription: newSubscription,
            user: {
                _id: user._id,
                email: user.email,
                role: user.role,
                program: user.programs,
            },
        });
    }
);

export const createCustomer = CatchAsyncError(
    async (req: Request, res: Response, next: NextFunction) => {
        const { userId } = req.body;
    
        const user = await UserModel.findById(userId);
        if (!user) {
            return next(new ErrorHandler('User not found', 404));
        }
    
        // Vérifier si l'utilisateur a déjà un Stripe Customer ID
        if (user.stripeCustomerId) {
            return res.status(200).json({
                success: true,
                message: 'User already has a Stripe customer ID',
                stripeCustomerId: user.stripeCustomerId
            });
        }
    
        // Créer un nouveau client Stripe
        const customer = await stripe.customers.create({
            email: user.email,
            name: user.name,
            metadata: { userId: user._id.toString() }
        });
    
        // Mettre à jour l'utilisateur avec le nouveau Stripe Customer ID
        user.stripeCustomerId = customer.id;
        await user.save();
    
        res.status(201).json({
            success: true,
            message: 'Stripe customer created successfully',
            stripeCustomerId: customer.id
        });
    }
);

export const createPaymentIntent = CatchAsyncError(
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const paymentIntent = await stripe.paymentIntents.create({
                amount: req.body.amount,
                currency: 'eur',
                customer: req.body.customerId,
                metadata: {
                    company: "Perfect",
                },
                automatic_payment_methods: {
                    enabled: true,
                },
            });
            res.json({ clientSecret: paymentIntent.client_secret });
        } catch (error: any) {
            return next(new ErrorHandler(error.message, 400));
        }
    }
);

export const stripeWebhook = CatchAsyncError(
    async (req: Request, res: Response, next: NextFunction) => {
        const sig = req.headers['stripe-signature'] as string;

        let event: Stripe.Event;

        try {
        event = stripe.webhooks.constructEvent(
            req.body,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET!
        );
    } catch (err: any) {
        return next(new ErrorHandler(`Webhook Error: ${err.message}`, 400));
    }
  
    // Gérer l'événement
    switch (event.type) {
        case 'customer.subscription.created':
            const newSubscription = event.data.object as Stripe.Subscription;
            // Logique pour gérer un nouvel abonnement
            console.log('Nouvel abonnement créé:', newSubscription.id);
            break;
        case 'customer.subscription.updated':
            const updatedSubscription = event.data.object as Stripe.Subscription;
            // Logique pour gérer un abonnement mis à jour
            console.log('Abonnement mis à jour:', updatedSubscription.id);
            break;
        case 'customer.subscription.deleted':
            const canceledSubscription = event.data.object as Stripe.Subscription;
            // Logique pour gérer un abonnement annulé
            console.log('Abonnement annulé:', canceledSubscription.id);
            break;
        case 'invoice.payment_succeeded':
            const invoice = event.data.object as Stripe.Invoice;
            // Logique pour gérer un paiement d'abonnement réussi
            console.log('Paiement réussi pour la facture:', invoice.id);
            break;
        case 'invoice.payment_failed':
            const failedInvoice = event.data.object as Stripe.Invoice;
            // Logique pour gérer un échec de paiement d'abonnement
            console.log('Échec du paiement pour la facture:', failedInvoice.id);
            break;
        // Ajoutez d'autres cas selon vos besoins
        default:
            console.log(`Événement non géré de type ${event.type}`);
    }

    // Renvoyer une réponse pour confirmer la réception du webhook
    res.json({ received: true });
    }
);

// // Annuler un abonnement
// app.post('/cancel-subscription', async (req, res) => {
//     const { subscriptionId } = req.body;
  
//     try {
//       const canceledSubscription = await stripe.subscriptions.del(subscriptionId);
//       res.json({ status: canceledSubscription.status });
//     } catch (error) {
//       res.status(400).json({ error: error.message });
//     }
//   });