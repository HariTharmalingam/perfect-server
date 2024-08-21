import mongoose, { Document, Schema } from 'mongoose';

export interface ISubscription extends Document {
  user: mongoose.Types.ObjectId;
  stripeCustomerId: string;
  stripeSubscriptionId: string;
  stripePriceId: string;
  plan: {
    name: string;
    price: number;
    currency: string;
    interval: 'month' | 'year';
    intervalCount: number;
  };
  status: 'active' | 'past_due' | 'canceled' | 'unpaid' | 'trialing';
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  canceledAt?: Date;
  engagementStartDate: Date;
  engagementEndDate: Date;
  program: mongoose.Types.ObjectId;
  secondaryProgram?: mongoose.Types.ObjectId;
  latestInvoiceId?: string;
  latestInvoiceStatus?: 'paid' | 'open' | 'void' | 'uncollectible';
  paymentMethodId?: string;
}

const SubscriptionSchema: Schema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  stripeCustomerId: { type: String, required: true },
  stripeSubscriptionId: { type: String, required: true, unique: true },
  stripePriceId: { type: String, required: true },
  plan: {
    name: { type: String, required: true },
    price: { type: Number, required: true },
    currency: { type: String, required: true },
    interval: { type: String, enum: ['month', 'year'], required: true },
    intervalCount: { type: Number, required: true }
  },
  status: { 
    type: String, 
    enum: ['active', 'past_due', 'canceled', 'unpaid', 'trialing'], 
    required: true 
  },
  currentPeriodStart: { type: Date, required: true },
  currentPeriodEnd: { type: Date, required: true },
  cancelAtPeriodEnd: { type: Boolean, default: false },
  canceledAt: { type: Date },
  engagementStartDate: { type: Date, required: true },
  engagementEndDate: { type: Date, required: true },
  program: { type: Schema.Types.ObjectId, ref: 'Program', required: true },
  secondaryProgram: { type: Schema.Types.ObjectId, ref: 'Program' },
  latestInvoiceId: { type: String },
  latestInvoiceStatus: { type: String, enum: ['paid', 'open', 'void', 'uncollectible'] },
  paymentMethodId: { type: String }
}, {
  timestamps: true
});

// Méthode pour vérifier si l'abonnement est dans la période d'engagement
SubscriptionSchema.methods.isInEngagementPeriod = function(): boolean {
  const now = new Date();
  return now >= this.engagementStartDate && now <= this.engagementEndDate;
};

// Méthode pour vérifier si l'abonnement est actif
SubscriptionSchema.methods.isActive = function(): boolean {
  return this.status === 'active' || this.status === 'trialing';
};

// Méthode pour calculer le temps restant dans l'engagement
SubscriptionSchema.methods.remainingEngagementTime = function(): number {
  const now = new Date();
  if (now > this.engagementEndDate) return 0;
  return this.engagementEndDate.getTime() - now.getTime();
};

// Index pour améliorer les performances des requêtes
SubscriptionSchema.index({ user: 1, status: 1 });
SubscriptionSchema.index({ stripeSubscriptionId: 1 });

const SubscriptionModel = mongoose.model<ISubscription>('Subscription', SubscriptionSchema);

export default SubscriptionModel;