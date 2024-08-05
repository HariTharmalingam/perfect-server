import express from "express";
import {
  getAllPrograms,
  getProgramByUser,
  getSingleProgram,
} from "../controllers/program.controller";
import { authorizeRoles, isAutheticated } from "../middleware/auth";
const programRouter = express.Router();



// programRouter.get("/get-program/:id", getSingleProgram);
programRouter.get("/get-program-content/:id", isAutheticated, getProgramByUser);
programRouter.get("/get-programs", getAllPrograms);



export default programRouter;
