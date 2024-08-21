"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.stripeWebhook = exports.createPaymentIntent = exports.createCustomer = exports.createSubscription = void 0;
const catchAsyncErrors_1 = require("../middleware/catchAsyncErrors");
const ErrorHandler_1 = __importDefault(require("../utils/ErrorHandler"));
require("dotenv").config();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
exports.createSubscription = (0, catchAsyncErrors_1.CatchAsyncError)(async (req, res, next) => {
    const { customerId, priceId } = req.body;
    try {
        const subscription = await stripe.subscriptions.create({
            customer: customerId,
            items: [{ price: priceId }],
            payment_behavior: 'default_incomplete',
            expand: ['latest_invoice.payment_intent'],
        });
        res.json({
            subscriptionId: subscription.id,
            clientSecret: subscription.latest_invoice.payment_intent.client_secret,
        });
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 400));
    }
});
exports.createCustomer = (0, catchAsyncErrors_1.CatchAsyncError)(async (req, res, next) => {
    try {
        const customer = await stripe.customers.create({
            email: req.body.email,
            name: req.body.name,
        });
        res.json({ customerId: customer.id });
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 400));
    }
});
exports.createPaymentIntent = (0, catchAsyncErrors_1.CatchAsyncError)(async (req, res, next) => {
    try {
        const paymentIntent = await stripe.paymentIntents.create({
            amount: req.body.amount,
            currency: 'eur',
            customer: req.body.customerId,
            // Ajoutez d'autres options si nécessaire
        });
        res.json({ clientSecret: paymentIntent.client_secret });
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 400));
    }
});
exports.stripeWebhook = (0, catchAsyncErrors_1.CatchAsyncError)(async (req, res, next) => {
    const sig = req.headers['stripe-signature'];
    let event;
    try {
        event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    }
    catch (err) {
        return next(new ErrorHandler_1.default(`Webhook Error: ${err.message}`, 400));
    }
    // Gérer l'événement
    switch (event.type) {
        case 'customer.subscription.created':
            const newSubscription = event.data.object;
            // Logique pour gérer un nouvel abonnement
            console.log('Nouvel abonnement créé:', newSubscription.id);
            break;
        case 'customer.subscription.updated':
            const updatedSubscription = event.data.object;
            // Logique pour gérer un abonnement mis à jour
            console.log('Abonnement mis à jour:', updatedSubscription.id);
            break;
        case 'customer.subscription.deleted':
            const canceledSubscription = event.data.object;
            // Logique pour gérer un abonnement annulé
            console.log('Abonnement annulé:', canceledSubscription.id);
            break;
        case 'invoice.payment_succeeded':
            const invoice = event.data.object;
            // Logique pour gérer un paiement d'abonnement réussi
            console.log('Paiement réussi pour la facture:', invoice.id);
            break;
        case 'invoice.payment_failed':
            const failedInvoice = event.data.object;
            // Logique pour gérer un échec de paiement d'abonnement
            console.log('Échec du paiement pour la facture:', failedInvoice.id);
            break;
        // Ajoutez d'autres cas selon vos besoins
        default:
            console.log(`Événement non géré de type ${event.type}`);
    }
    // Renvoyer une réponse pour confirmer la réception du webhook
    res.json({ received: true });
});
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
