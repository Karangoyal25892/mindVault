import app from './app';
import { env } from './config/env';
import { connectDB } from './database/connectDB';

const PORT = env.port;

const startServer = async (): Promise<void> => {
  try {
    console.log('Starting server...');
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();