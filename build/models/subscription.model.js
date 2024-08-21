"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscriptionModel = void 0;
const mongoose_1 = __importStar(require("mongoose"));
// Schéma Mongoose
const SubscriptionSchema = new mongoose_1.Schema({
    user: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    program: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Program',
        required: true
    },
    stripeCustomerId: {
        type: String,
        required: true
    },
    stripeSubscriptionId: {
        type: String,
        required: true
    },
    stripePriceId: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['active', 'past_due', 'canceled', 'unpaid'],
        default: 'active'
    },
    currentPeriodStart: {
        type: Date,
        required: true
    },
    currentPeriodEnd: {
        type: Date,
        required: true
    },
    cancelAtPeriodEnd: {
        type: Boolean,
        default: false
    },
    engagementDuration: {
        type: Number,
        required: true
    },
    engagementEndDate: {
        type: Date,
        required: true
    },
    secondaryProgram: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Program'
    }
}, {
    timestamps: true
});
// Méthodes
SubscriptionSchema.methods.isInEngagementPeriod = function () {
    return new Date() < this.engagementEndDate;
};
SubscriptionSchema.methods.syncWithStripe = async function (stripe) {
    const stripeSubscription = await stripe.subscriptions.retrieve(this.stripeSubscriptionId);
    this.status = stripeSubscription.status;
    this.currentPeriodStart = new Date(stripeSubscription.current_period_start * 1000);
    this.currentPeriodEnd = new Date(stripeSubscription.current_period_end * 1000);
    this.cancelAtPeriodEnd = stripeSubscription.cancel_at_period_end;
    await this.save();
};
// Création et export du modèle
const SubscriptionModel = mongoose_1.default.model('Subscription', SubscriptionSchema);
exports.SubscriptionModel = SubscriptionModel;
