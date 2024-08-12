import { Response } from "express";
import ProgramModel from "../models/program.model";
import { CatchAsyncError } from "../middleware/catchAsyncErrors";
import moment from 'moment';
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
export const getProgamsByUserId = async (id: string,  res: Response) => {
  const userJson = await redis.get(id);

  if (userJson) {
    const user = JSON.parse(userJson);

    const array:any = [];

    await Promise.all(user.programs.map(async (element:any) => {
      array.push(await ProgramModel.findById(element.programId))
      const currentProgramWeek = moment().diff(element.purchasedDay, 'week')
      array.push({"currentProgramWeek": currentProgramWeek})
    }))

    res.status(201).json({
      success: true,
      array,
    });
  }
  

};

