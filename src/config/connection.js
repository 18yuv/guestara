import mongoose from "mongoose";

const MONGO_URI = process.env.MONGO_URL

const connectMongo = async () => {
    try {
        await mongoose.connect(MONGO_URI)
        console.log(`Mongo Db connected...`);
    } catch (error) {
        console.error(`Monogo Db connection error: `, error);
        process.exit(1)
    }
}

export default connectMongo;