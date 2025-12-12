import dotenv from 'dotenv';
import { createApp } from './app';
import { testConnection } from './database/connection';

dotenv.config();

const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;

const startServer = async (): Promise<void> => {
  try {
    await testConnection();
    console.log('Database connection established');

    const app = createApp();
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

