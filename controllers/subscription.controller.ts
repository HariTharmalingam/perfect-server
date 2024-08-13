import { NextFunction, Request, Response } from "express";
import { CatchAsyncError } from "../middleware/catchAsyncErrors";
import ErrorHandler from "../utils/ErrorHandler";
import { IOrder } from "../models/order.Model";
import userModel from "../models/user.model";
import SubscriptionModel, { ISubscription } from "../models/subscription.Model";
import axios from "axios";
require("dotenv").config();

// create order for mobile
