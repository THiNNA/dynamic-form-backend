import express from 'express';
import cors from 'cors';
import { env } from './config/env';
import { connectDatabase } from './config/database';
import { errorMiddleware } from './middleware/error.middleware';
import formRoutes from './routes/form.routes';
import responseRoutes from './routes/response.routes';

const app = express();

app.use(cors({ origin: env.CORS_ORIGIN }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.get('/health', (req, res) => {
  res.json({ success: true, message: 'Server is running', env: env.NODE_ENV });
});

app.use('/api/forms', formRoutes);
app.use('/api/forms', responseRoutes);

app.use(errorMiddleware);

const startServer = async () => {
  await connectDatabase();
  app.listen(env.PORT, () => {
    console.log(`Server running on port ${env.PORT} in ${env.NODE_ENV} mode`);
  });
};

if (require.main === module) {
  startServer();
}

export default app;
