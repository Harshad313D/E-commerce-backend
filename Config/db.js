import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();
const connectDB = async()=>{
    try{ 
        console.log("🔄 Connecting to MongoDB...");
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`✅ MongoDB Connected successfully at: ${conn.connection.host}`);

        

    } catch(e){
        console.error(`❌ MongoDB Connection Error: ${e.message}`);
        process.exit(1);
    }
}

export default connectDB;