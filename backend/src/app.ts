import dotenv from 'dotenv';
import express from 'express';
import authRoutes from './routes/auth.routes';
import noteRoutes from './routes/note.routes';
import errorMiddleware from './middleware/error.middleware';

dotenv.config();

const app = express();
app.use(express.json());
app.use('/api/note', noteRoutes);
app.use('/api/auth', authRoutes);
app.get('/', (req, res) => {
    console.log(req);
    res.send('MindVault Started!');
});
app.use(errorMiddleware);
export default app;