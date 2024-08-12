import express from "express";
import {
  getAllPrograms,
  getProgramsByUser,
} from "../controllers/program.controller";
import { authorizeRoles, isAutheticated } from "../middleware/auth";
const programRouter = express.Router();

programRouter.get("/get-program-content/",isAutheticated, getProgramsByUser);
programRouter.get("/get-programs", getAllPrograms);



export default programRouter;
