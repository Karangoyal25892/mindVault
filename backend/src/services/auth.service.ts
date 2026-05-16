import bcrypt from 'bcrypt';
import { User } from '../models/user';

export const registerUser = async (name: string, email: string, password: string) => {
    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            throw new Error('User already exists');
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({ name, email, password: hashedPassword });
        return user;
    }
    catch (error) {
        throw error;
    }
}


export const loginUser = async (email: string, password: string) => {
    try {
        const user = await User.findOne({ email });
        if (!user) {
            throw new Error('Invalid email or password');
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new Error('Invalid email or password');
        }

        return user;
    } catch (error) {
        throw error;
    }
}