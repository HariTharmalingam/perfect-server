import mongoose, { Document, Model, Schema } from "mongoose";

 export interface ISubscription extends Document {
  name: string;
  price: number;
  purchased: number;
}

const subscriptionSchema = new Schema<ISubscription>({
  name: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  purchased: {
    type: Number,
    required: true,
  }
},{timestamps: true});


const SubscriptionModel: Model<ISubscription> = mongoose.model("Subscription", subscriptionSchema);

export default SubscriptionModel;
