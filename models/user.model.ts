require("dotenv").config();
import mongoose, { Document, Model, Schema } from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const emailRegexPattern: RegExp = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface IUserProgram {
  programId: mongoose.Types.ObjectId;
  purchasedDay: Date;
  startDate: Date;
  subscriptionEndDate?: Date;
  isSubscription: boolean;
  stripePriceId?: string;
}
export interface IUser extends Document {
  name: string;
  email: string;
  stripeCustomerId?: string;
  password: string;
  avatar: {
    public_id: string;
    url: string;
  };
  role: 'user' | 'subscriber' | 'admin';
  isVerified: boolean;
  programs: IUserProgram[];
  createdAt: Date;
  updatedAt: Date;  
  comparePassword: (password: string) => Promise<boolean>;
  SignAccessToken: () => string;
  SignRefreshToken: () => string;
}

const userSchema: Schema<IUser> = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please enter your name"],
    },
    email: {
      type: String,
      required: [true, "Please enter your email"],
      validate: {
        validator: function (value: string) {
          return emailRegexPattern.test(value);
        },
        message: "please enter a valid email",
      },
      unique: true,
    },
    stripeCustomerId: {
      type: String,
    },
    password: {
      type: String,
      minlength: [6, "Password must be at least 6 characters"],
      select: false,
    },
    avatar: {
      public_id: String,
      url: String,
    },
    role: { 
      type: String, 
      enum: ['user', 'subscriber', 'admin'], 
      default: 'user' 
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    programs: [{
      programId: { type: mongoose.Schema.Types.ObjectId, ref: 'Program' },
      purchasedDay: { type: Date, default: Date.now },
      startDate: { type: Date },
      subscriptionEndDate: { type: Date },
      isSubscription: { type: Boolean, default: false },
      stripePriceId: { type: String }
    }]
  },
  { timestamps: true }
);

// Hash Password before saving
userSchema.pre<IUser>("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// sign access token
userSchema.methods.SignAccessToken = function () {
  return jwt.sign({ id: this._id }, process.env.ACCESS_TOKEN || "", {
    expiresIn: "5m",
  });
};

// sign refresh token
userSchema.methods.SignRefreshToken = function () {
  return jwt.sign({ id: this._id }, process.env.REFRESH_TOKEN || "", {
    expiresIn: "3d",
  });
};

// compare password
userSchema.methods.comparePassword = async function (
  enteredPassword: string
): Promise<boolean> {
  return await bcrypt.compare(enteredPassword, this.password);
};
// Ajout d'un index pour améliorer les performances des requêtes
userSchema.index({ 'programs.programId': 1 });
userSchema.index({ stripeCustomerId: 1 });

const userModel: Model<IUser> = mongoose.model("User", userSchema);

export default userModel;
