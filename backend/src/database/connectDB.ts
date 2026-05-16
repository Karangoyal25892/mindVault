import mongoose from 'mongoose';
import { env } from '../config/env';

export const connectDB = async (): Promise<void> => {
    try {
        // connect to database
        await mongoose.connect(env.mongoUri);
        console.log('Connected to MongoDB');
        // log success message
    } catch (error) {
        // log error
        console.error('Error connecting to MongoDB:', error);
        // terminate process
        process.exit(1);
    }
};