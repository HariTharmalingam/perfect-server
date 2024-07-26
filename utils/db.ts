import mongoose from 'mongoose';
require('dotenv').config();
mongoose.set('strictQuery', true);

const dbUrl:string = process.env.DATABASE || '';

const connectDB = async () => {
    try {
        await mongoose.connect(dbUrl).then((data:any) => {
            console.log(`Database connected with ${data.connection.host}`)
        })
    } catch (error:any) {
        console.log(error.message);
        setTimeout(connectDB, 5000);
    }
}

export default connectDB;