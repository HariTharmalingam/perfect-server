import { Response } from "express";
import ProgramModel from "../models/program.model";
import { CatchAsyncError } from "../middleware/catchAsyncErrors";

// create course
export const createProgram = CatchAsyncError(async(data:any,res:Response)=>{
    const program = await ProgramModel.create(data);
    res.status(201).json({
        success:true,
        program
    });
})

// Get All Courses
export const getAllProgramsService = async (res: Response) => {
    const programs = await ProgramModel.find().sort({ createdAt: -1 });
  
    res.status(201).json({
      success: true,
      programs,
    });
  };
  