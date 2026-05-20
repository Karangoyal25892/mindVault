import dotenv from 'dotenv';
import express from 'express';
import errorMiddleware from './middleware/error.middleware';
import authRoutes from './routes/auth.routes';
import noteRoutes from './routes/note.routes';
import uploadRoutes from './routes/upload.routes';
import documentRoutes from './routes/document.routes';

dotenv.config();

const app = express();
app.use(express.json());
app.use('/api/note', noteRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/document', documentRoutes);
app.get('/', (req, res) => {
    console.log(req);
    res.send('MindVault Started!');
});
app.use(errorMiddleware);
export default app;