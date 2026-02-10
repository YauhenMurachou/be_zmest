import express, { Express } from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.routes';
import postRoutes from './routes/post.routes';
import usersRoutes from './routes/users.routes';
import profileRoutes from './routes/profile.routes';
import followRoutes from './routes/follow.routes';
import securityRoutes from './routes/security.routes';
import { errorHandler } from './middleware/error.middleware';

export const createApp = (): Express => {
  const app = express();

  const corsOptions = {
    origin: process.env.FRONTEND_URL || '*',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['Authorization', 'X-Auth-Token'],
  };

  app.use(cors(corsOptions));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // SamuraiJS-like endpoints
  app.use('/auth', authRoutes);
  app.use('/users', usersRoutes);
  app.use('/profile', profileRoutes);
  app.use('/follow', followRoutes);
  app.use('/security', securityRoutes);

  // Existing API endpoints
  app.use('/api/auth', authRoutes);
  app.use('/api/posts', postRoutes);

  app.get('/health', (_request, response) => {
    response.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  app.use(errorHandler);

  return app;
};

