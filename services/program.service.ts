import { Response } from "express";
import ProgramModel from "../models/program.model";
import { CatchAsyncError } from "../middleware/catchAsyncErrors";
import { redis } from "../utils/redis";

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
  

//Get Programs of Users
export const getProgamsByUserId = async (id: string, res: Response) => {
  const userJson = await redis.get(id);
  if (userJson) {
    const userPrograms = JSON.parse(userJson);
    res.status(201).json({
      success: true,
      userPrograms,
    });
  }
};

