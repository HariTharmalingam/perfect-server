import { Response } from "express";
import ProgramModel  from "../models/program.model";
import Program, { IProgram } from "../models/program.model";
import { CatchAsyncError } from "../middleware/catchAsyncErrors";
import moment from 'moment';
import { redis } from "../utils/redis";
import User, { IUser, IUserProgram } from "../models/user.model";

// create program
export const createProgram = CatchAsyncError(async(data:any,res:Response)=>{
    const program = await ProgramModel.create(data);
    res.status(201).json({
        success:true,
        program
    });
})

// Get All Programs
export const getAllProgramsService = async (res: Response) => {
    const programs = await ProgramModel.find().sort({ createdAt: -1 });
  
    res.status(201).json({
      success: true,
      programs,
    });
  };
  
  interface ProgramWithWeek {
    program: IProgram;
    currentProgramWeek: number;
  }
//Get Programs of Users
export const getProgamsByUserId = async (userId: string): Promise<ProgramWithWeek[]> => {
  const user = await User.findById(userId);
  if (!user) {
    throw new Error("User not found");
  }

  const programsWithWeeks: ProgramWithWeek[] = await Promise.all(
    user.programs.map(async (userProgram) => {
      const program = await Program.findById(userProgram.programId);
      if (!program) {
        throw new Error(`Program not found: ${userProgram.programId}`);
      }
      // Utiliser moment pour calculer précisément les semaines écoulées
      const purchaseDate = moment(userProgram.purchasedDay).startOf('day');
      const currentDate = moment().startOf('day');
      const weeksDiff = currentDate.diff(purchaseDate, 'weeks');

      // La semaine en cours est le nombre de semaines écoulées + 1
      const currentProgramWeek = weeksDiff + 1;

      return {
        program,
        currentProgramWeek
      };
    })
  );

  return programsWithWeeks;
};