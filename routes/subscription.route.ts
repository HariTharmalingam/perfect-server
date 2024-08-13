import express from "express";

import { authorizeRoles, isAutheticated } from "../middleware/auth";

const subscriptionRouter = express.Router();

// subscriptionRouter.post("/subscription-update/",isAutheticated, SubscriptionUpdate);


export default subscriptionRouter;
